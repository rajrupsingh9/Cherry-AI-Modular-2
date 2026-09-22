import { generateContentWithRetry } from "../config/gemini";
import { getOrCreateSession, normalizeSubjectName } from "../state/sessionStore";

export function extractJsonFromScriptText(js: string): string {
  const startIdx = js.indexOf("{");
  if (startIdx === -1) return js;

  let braceCount = 0;
  let inString = false;
  let escapeNext = false;
  let quoteChar = "";

  for (let i = startIdx; i < js.length; i++) {
    const char = js[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      escapeNext = true;
      continue;
    }

    if (inString) {
      if (char === quoteChar) {
        inString = false;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      inString = true;
      quoteChar = char;
      continue;
    }

    if (char === "{") {
      braceCount++;
    } else if (char === "}") {
      braceCount--;
      if (braceCount === 0) {
        return js.substring(startIdx, i + 1);
      }
    }
  }

  return js.substring(startIdx);
}

export async function fetchWithTimeout(url: string, options: any = {}, timeoutMs = 4000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export async function getYoutubeTranscript(videoId: string): Promise<{ transcriptText: string; title: string }> {
  let title = "";
  let transcriptText = "";

  const decodeHtml = (str: string) => {
    return str
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&apos;/g, "'");
  };

  // 1. Fetch OEmbed first for Video Title
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const oembedRes = await fetchWithTimeout(oembedUrl, {}, 3500);
    if (oembedRes.ok) {
      const oembedData = await oembedRes.json();
      title = oembedData.title || "";
    }
  } catch (err) {
    console.error("[OEmbed Fetch Error]", err);
  }

  // 2. Direct timedtext API check
  const langPriority = ["hi", "en", "en-US", "hi-IN", "bn", "ta", "te", "mr"];
  for (const lang of langPriority) {
    try {
      const timedtextUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}`;
      const ttRes = await fetchWithTimeout(timedtextUrl, {}, 2500);
      if (ttRes.ok) {
        const xmlText = await ttRes.text();
        if (xmlText && xmlText.includes("<text")) {
          const textRegex = /<text[^>]*>(.*?)<\/text>/gi;
          const matches = [];
          let match;
          while ((match = textRegex.exec(xmlText)) !== null) {
            matches.push(match[1]);
          }
          if (matches.length > 0) {
            transcriptText = matches.map(m => decodeHtml(m)).join(" ");
            break;
          }
        }
      }
    } catch (_) {}
  }

  // 3. Fallback: Fetch the YouTube Watch HTML page if timedtext API was empty
  if (!transcriptText) {
    try {
      const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const res = await fetchWithTimeout(watchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9,hi;q=0.8"
        }
      }, 4000);

      if (res.ok) {
        const html = await res.text();

        if (!title) {
          const titleMatch = html.match(/<title>(.*?)<\/title>/i);
          if (titleMatch && titleMatch[1]) {
            title = decodeHtml(titleMatch[1].replace(" - YouTube", "").trim());
          }
        }

        let rawJson = "";
        const markers = ["ytInitialPlayerResponse = ", "var ytInitialPlayerResponse = ", 'window["ytInitialPlayerResponse"] = '];
        for (const marker of markers) {
          const idx = html.indexOf(marker);
          if (idx !== -1) {
            const start = idx + marker.length;
            const endOfScript = html.indexOf("</script>", start);
            if (endOfScript !== -1) {
              const scriptBlock = html.substring(start, endOfScript).trim();
              rawJson = extractJsonFromScriptText(scriptBlock);
              if (rawJson) break;
            }
          }
        }

        if (rawJson) {
          try {
            const playerResponse = JSON.parse(rawJson);
            const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

            if (Array.isArray(captionTracks) && captionTracks.length > 0) {
              let track = captionTracks.find((t: any) => t.languageCode === "hi") ||
                          captionTracks.find((t: any) => t.languageCode === "en") ||
                          captionTracks[0];

              if (track && track.baseUrl) {
                const xmlRes = await fetchWithTimeout(track.baseUrl, {}, 3500);
                if (xmlRes.ok) {
                  const xmlText = await xmlRes.text();
                  const textRegex = /<text[^>]*>(.*?)<\/text>/gi;
                  const matches = [];
                  let match;
                  while ((match = textRegex.exec(xmlText)) !== null) {
                    matches.push(match[1]);
                  }
                  if (matches.length > 0) {
                    transcriptText = matches.map(m => decodeHtml(m)).join(" ");
                  }
                }
              }
            }
          } catch (jsonErr) {
            console.error("[YouTube Scraper] Error parsing playerResponse JSON:", jsonErr);
          }
        }
      }
    } catch (err) {
      console.error("[YouTube Scraper] Error extracting watch page transcript:", err);
    }
  }

  return { transcriptText, title };
}

export async function parseYouTubeLecture(params: {
  youtubeUrl: string;
  grade?: string;
  board?: string;
  subject?: string;
  medium?: string;
  sessionId?: string;
}) {
  const { youtubeUrl, grade, board, subject, medium, sessionId } = params;

  const trimmedUrl = String(youtubeUrl).trim();
  let videoId = "dQw4w9WgXcQ";
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmedUrl)) {
    videoId = trimmedUrl;
  } else {
    const match = trimmedUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (match && match[1] && match[1].length === 11) {
      videoId = match[1];
    }
  }

  console.log(`[YouTube Service] Fetching details for Video ID=${videoId}...`);
  const { transcriptText, title: videoTitleRaw } = await getYoutubeTranscript(videoId);
  const videoTitle = videoTitleRaw || `YouTube Video Lecture (ID: ${videoId})`;

  const prompt =
    `You are an expert curriculum design specialist in India's top academic boards (CBSE, ICSE, Bihar Board BSEB, Jharkhand Board JAC, UP Board, West Bengal Board WBBSE, Odisha Board CHSE). ` +
    `Your task is to generate an interactive, complete-fidelity blackboard physical study plan matching the educational topic of the YouTube video titled "${videoTitle}" (ID: "${videoId}").\n\n` +
    (transcriptText
      ? `Here is the full text transcript of the original video. It contains the exact spoken core mathematical proofs, technical structures, numericals, and academic reasoning. You MUST isolate this core educational logic and extract all formulas, diagrams, and sub-topics from this transcript flow without skipping or summarizing. Purge all non-academic conversational speech, notifications, or general chatter:\n` +
        `--- TRANSCRIPT START ---\n${transcriptText}\n--- TRANSCRIPT END ---\n\n`
      : `Note: The video subtitles are not directly scrapable, so please design a high-fidelity chalkboard delivery matching the exact academic standards of the video title: "${videoTitle}" and Subject "${subject || "Physics/Mathematics"}".\n\n`) +
    `STUDENT METADATA CONTEXT:\n` +
    `- Class/Grade: ${grade || "Class 10"}\n` +
    `- Affiliated Board: ${board || "CBSE"}\n` +
    `- Medium/Language script: ${medium || "Hinglish"} [CRITICAL LANGUAGE SCRIPT RULE]: If medium is "Hindi", write definitions, notes, and topic headings in Devanagari Hindi script. If medium is "Bengali/Bangla", write notes in Bengali script. If medium is "Oriya/Odia", write notes in Odia script. If medium is "Hinglish", write in English script but frame explanations in natural conversational Hindi. All math variables and equations MUST strictly use standard LaTeX ($$ or $).\n\n` +
    `STUDY PLAN STRUCTURE CRITERIA & SVG GUARDRAILS:\n` +
    `1. Do NOT write any welcome messages, introductory intros, or wrapping code remarks. Return ONLY high-quality educational Markdown notes that match the video's subject context.\n` +
    `2. Divide the blackboard syllabus into exactly 3 or 4 sequential sub-topics using level 1 Heading markdown '# Topic Header Text'. Cherry Ma'am will segment these into the main teaching session slide tracker.\n` +
    `3. For each Topic Header:\n` +
    `   - A detailed textbook definition paragraph matching the board and script selection.\n` +
    `   - Comprehensive LaTeX formulas wrapped in $$ (display block) and $ (inline math) parameters.\n` +
    `   - Insert ONE beautiful, inline, highly professional responsive XML SVG coordinate drawing, graph, mechanical cycle, circuit loop, or geometric system.\n` +
    `   - [CRITICAL SVG GUARDRAILS]: Use ONLY high-contrast translucent neon chalk colors on dark background (#12181B). Ensure ALL XML tags are strictly closed and valid XML.\n` +
    `4. Make the contents extremely rich and comprehensive.`;

  const curriculumResponse = await generateContentWithRetry({
    model: "gemini-3.8-flash",
    contents: { parts: [{ text: prompt }] },
  });

  const markdown = curriculumResponse && curriculumResponse.text ? curriculumResponse.text : "Failed to generate study curriculum for this video.";

  let rawDetectedSubject = subject || "All Science";
  const lookupText = `${videoTitle} ${transcriptText || ""} ${markdown}`.toLowerCase();

  if (lookupText.includes("physics") || lookupText.includes("kinematics") || lookupText.includes("force") || lookupText.includes("velocity") || lookupText.includes("thermodynamics") || lookupText.includes("optics") || lookupText.includes("electromagnetism")) {
    rawDetectedSubject = "Physics";
  } else if (lookupText.includes("chemistry") || lookupText.includes("chemical") || lookupText.includes("reaction") || lookupText.includes("molecule") || lookupText.includes("benzene") || lookupText.includes("covalent") || lookupText.includes("acid")) {
    rawDetectedSubject = "Chemistry";
  } else if (lookupText.includes("math") || lookupText.includes("calculus") || lookupText.includes("integral") || lookupText.includes("derivative") || lookupText.includes("algebra") || lookupText.includes("geometry") || lookupText.includes("trigonometry") || lookupText.includes("matrix")) {
    rawDetectedSubject = "Mathematics";
  } else if (lookupText.includes("biology") || lookupText.includes("cell") || lookupText.includes("dna") || lookupText.includes("evolution") || lookupText.includes("organism")) {
    rawDetectedSubject = "Biology";
  }

  const normalizedSubject = normalizeSubjectName(rawDetectedSubject);
  const filename = `YouTube: ${videoTitle} (ID: ${videoId})`;

  const sessionState = getOrCreateSession(sessionId);
  sessionState.activeDocument = {
    filename,
    mimeType: "video/youtube",
    markdown,
    mode: "explain",
    detectedSubject: normalizedSubject,
  };

  sessionState.activeSessionBackup = {
    history: [],
    teachingPhase: "intro",
    whiteboardNotes: "",
    activeTopicIndex: 0,
  };

  return {
    filename,
    mimeType: "video/youtube",
    markdown,
    mode: "explain",
    detectedSubject: normalizedSubject,
    sessionId: sessionId || "default"
  };
}
