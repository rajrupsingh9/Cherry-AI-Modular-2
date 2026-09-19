import { Router } from "express";
import { Type } from "@google/genai";
import { generateContentWithRetry, sendApiError } from "../config/gemini";
import { 
  getOrCreateSession, 
  normalizeSubjectName, 
  classifyAcademicDiscipline,
  activeDocument as globalActiveDoc,
  activeSessionBackup as globalActiveBackup
} from "../state/sessionStore";
import { 
  buildStage1DistillationPrompt, 
  buildStage2SynthesisPrompt, 
  universalInfographicResponseSchema, 
  adaptUniversalToLegacy, 
  generateUniversalFallback, 
  detectAcademicDomain 
} from "../../utils/distillationEngine";
import { CURATED_CUSTOM_SIMULATIONS, matchCuratedSimulation } from "../../components/virtual-lab/customSimPresets";

const router = Router();

function extractJsonFromScriptText(js: string): string {
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

async function fetchWithTimeout(url: string, options: any = {}, timeoutMs = 4000) {
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

async function getYoutubeTranscript(videoId: string): Promise<{ transcriptText: string; title: string }> {
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
            console.log(`[YouTube TimedText] Successfully extracted transcript (${lang}): ${transcriptText.substring(0, 150)}...`);
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
                    console.log(`[YouTube Watch Page] Extracted transcript: ${transcriptText.substring(0, 150)}...`);
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

// Socratic Problem Guide Chat Endpoint
router.post("/api/problem-guide", async (req, res) => {
  try {
    const { 
      userMessage, 
      imageBase64, 
      mimeType, 
      studentName, 
      grade, 
      subject,
      board, 
      mediumOfLearning, 
      chatHistory 
    } = req.body;

    if (!userMessage && !imageBase64) {
      return res.status(400).json({ error: "userMessage or imageBase64 is required" });
    }

    const studentGradeStr = grade || "Class 10";
    const studentBoardStr = board || "CBSE";
    const studentMediumStr = mediumOfLearning || "Hinglish";
    const nameStr = studentName || "Student";
    const subjectStr = subject || "Mathematics";

    const systemPrompt = `You are Tara Ma'am (तारा मैम) 🧭 acting as an expert Socratic AI Problem Guide for school students (${studentGradeStr}, ${studentBoardStr}).
You specialize in Mathematics, Physics (Numericals & Analytical problems), and Chemistry (Numericals & Stoichiometry/Reactions).

STUDENT PROFILE:
- Student Name: ${nameStr}
- Grade/Class: ${studentGradeStr}
- Board: ${studentBoardStr}
- Language Medium: ${studentMediumStr} (Use warm, friendly, encouraging Hinglish or clear English/Hindi)

### 🎯 CORE PHILOSOPHY & GOAL:
50% of the reason students fail to solve a numerical/analytical problem is that they DO NOT understand the question clearly!
Your mission is to first deconstruct the problem completely so the student understands it, then encourage them to attempt it.
- If they solve it: Congratulate them and provide 2-3 high-value exam instructions & pro-tips.
- If they cannot solve it: DO NOT give the direct final solution! Guide them STEP-BY-STEP with micro-hints so THEY solve it themselves. Once solved, congratulate them and give useful exam tips.

### 🔄 4-PHASE SOCRATIC PROTOCOL:

#### 📌 PHASE 1: Problem Breakdown & Deconstruction (When a new problem/image is given):
1. Carefully analyze the question/image.
2. DO NOT reveal the complete calculations or final numerical answer!
3. Format the deconstruction clearly using markdown:
   - 📌 **Problem Overview**: [1-2 line simple summary of the question]
   - 📋 **Given Values (दिया गया है)**: List each given quantity with units. Explicitly highlight any necessary unit conversions (e.g., $cm \\to m$, $g \\to kg$, $min \\to s$, $km/h \\to m/s$, $mL \\to L$).
   - 🎯 **To Find (ज्ञात करना है)**: Clearly state the target quantity/variable to be calculated.
   - 💡 **Core Concept (मूल अवधारणा)**: Explain the scientific law, chemical principle, or mathematical theorem/formula behind this question in 2-3 very simple, easy-to-understand lines.
   - 🖼️ (If a visual diagram/geometry figure/circuit/ray diagram/molecule is helpful, render a clean inline SVG in \`\`\`xml or \`\`\`svg with white background fill='#ffffff' and clear strokes).
   - ❓ **Call to Action**:
     "अब आप इस प्रश्न को एक बार खुद से हल करने का प्रयास करें। क्या आप इसे हल कर पाए? मुझे **हाँ (Yes)** या **नहीं (No)** में अपडेट दें।"

#### 📌 PHASE 2: Checkpoint & Evaluation (When student responds to Phase 1):
- **Scenario A: Student says "हाँ" (Yes) / Solved / हल हो गया:**
  1. Congratulate them enthusiastically! ("बहुत बढ़िया ${nameStr}! 🎉 Awesome job!")
  2. Ask them what final answer or value they obtained.
  3. Provide 2-3 high-utility, exam-oriented instructions & pro-tips for this specific type of problem:
     * 💡 **Pro-Tip 1 / Common Pitfall**: (e.g. standard sign convention errors, calculation traps to avoid).
     * ⚡ **Pro-Tip 2 / Shortcut or Verification Method**: (e.g. quick dimensional check or alternate formula).
     * 🌟 **Key Exam Instruction**: (1 golden rule to remember for ${studentBoardStr} exams).
- **Scenario B: Student says "नहीं" (No) / Stuck / अटक गया / Help:**
  1. Encourage them warmly! ("कोई बात नहीं ${nameStr}! मिलकर स्टेप बाय स्टेप सॉल्व करते हैं। 💪")
  2. Transition to Phase 3 (Guided Scaffolding).

#### 📌 PHASE 3: Step-by-Step Guided Scaffolding (Iterative Loop):
1. **Golden Rule**: Give ONLY ONE step or leading hint at a time! Never dump the whole solution.
2. Formulate **Step 1**: State the first relationship or formula needed.
3. Ask the student to calculate or reply with the result for that single step.
4. When student replies:
   - If correct: Praise them and provide **Step 2** (the next logical step).
   - If incorrect: Gently point out where the calculation or sign slip happened and ask them to retry that specific step.
5. Continue until the student performs the final calculation.

#### 📌 PHASE 4: Final Success & Conceptual Reinforcement:
Once the student successfully reaches the final answer:
1. Enthusiastically congratulate them for working through and cracking the problem!
2. Box the final answer in LaTeX: $$\\boxed{\\text{Answer}}$$.
3. Give 2-3 important, high-utility instructions & concepts related to this topic for future reference.

### 🛡️ FORMATTING RULES:
- Format all math & chemistry equations in standard LaTeX ($$...$$ for display blocks, $...$ for inline).
- Put ONLY numerical expressions or short units inside \\boxed{...}, keep long sentences outside LaTeX.
- Maintain a warm, friendly, peer-like tone as Cherry Ma'am throughout!`;

    const contents: any[] = [];
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      chatHistory.forEach((item: any) => {
        if (item.role && item.text) {
          contents.push({
            role: item.role === "user" ? "user" : "model",
            parts: [{ text: item.text }]
          });
        }
      });
    }

    const currentParts: any[] = [];
    if (imageBase64) {
      currentParts.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType || "image/jpeg"
        }
      });
    }

    currentParts.push({
      text: userMessage || "Please deconstruct and guide me through the question in the attached image."
    });

    contents.push({
      role: "user",
      parts: currentParts
    });

    console.log(`[REST Server] Processing Problem Guide request for ${nameStr} (${studentGradeStr}, ${subjectStr})`);

    const aiRes = await generateContentWithRetry({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.4,
      }
    });

    const reply = aiRes?.text ? aiRes.text.trim() : "Problem Guide is ready to assist. Please upload or ask your question! 🧭";

    res.json({ 
      success: true, 
      reply
    });
  } catch (err: any) {
    console.error("[REST Server] Error in Problem Guide endpoint:", err);
    sendApiError(res, "Problem Guide service error", err);
  }
});

// Parse and generate high-fidelity multi-lingual study curriculum from YouTube videos
router.post("/api/parse-youtube", async (req, res) => {
  const { youtubeUrl, grade, board, subject, medium, sessionId } = req.body;
  if (!youtubeUrl) {
    return res.status(400).json({ error: "Missing youtubeUrl in body." });
  }

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

  try {
    console.log(`[REST Server] Fetching details for YouTube Video ID=${videoId}...`);
    const { transcriptText, title: videoTitleRaw } = await getYoutubeTranscript(videoId);
    const videoTitle = videoTitleRaw || `YouTube Video Lecture (ID: ${videoId})`;

    console.log(`[REST Server] Generating board-synchronized YouTube curriculum: Title="${videoTitle}", Board=${board}, Lang=${medium}, Grade=${grade}, Subj=${subject}`);

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
      `- Medium/Language script: ${medium || "Hinglish"} [CRITICAL LANGUAGE SCRIPT RULE]: If medium is "Hindi", write definitions, notes, and topic headings in Devanagari Hindi script. If medium is "Bengali/Bangla", write notes in Bengali script. If medium is "Oriya/Odia", write notes in Odia script. If medium is "Hinglish", write in English script but frame explanations in natural conversational Hindi (e.g. "Is formula ko derive karne ke liye..."). All math variables and equations MUST strictly use standard LaTeX ($$ or $).\n\n` +
      `STUDY PLAN STRUCTURE CRITERIA & SVG GUARDRAILS:\n` +
      `1. Do NOT write any welcome messages, introductory intros, or wrapping code remarks. Return ONLY high-quality educational Markdown notes that match the video's subject context.\n` +
      `2. Divide the blackboard syllabus into exactly 3 or 4 sequential sub-topics using level 1 Heading markdown '# Topic Header Text'. Cherry Ma'am will segment these into the main teaching session slide tracker.\n` +
      `3. For each Topic Header:\n` +
      `   - A detailed textbook definition paragraph matching the board and script selection.\n` +
      `   - Comprehensive LaTeX formulas wrapped in $$ (display block) and $ (inline math) parameters.\n` +
      `   - Insert ONE beautiful, inline, highly professional responsive XML SVG coordinate drawing, graph, mechanical cycle, circuit loop, or geometric system (e.g. \`<svg viewBox="0 0 320 200" className="w-full max-w-[320px] h-[200px]">...\</svg>\`).\n` +
      `   - [CRITICAL SVG GUARDRAILS]: Use ONLY high-contrast translucent neon chalk colors (#00FFFF Cyan, #39FF14 Lime Green, #FFFF00 Neon Yellow, #FF5733 Coral, #FF6B6B Pink) on dark background (#12181B). Ensure ALL XML tags (<rect>, <path>, <circle>, <text>, <line>, <polygon>, <g>) are strictly closed and valid XML. Ensure text labels do not overlap any vector shapes or lines.\n` +
      `4. Make the contents extremely rich and comprehensive so that the teacher can instruct sequentially and beautifully without skipping anything.`;

    console.log(`[REST Server] Start processing: Generating YouTube study notes for: "${videoTitle}"`);

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
    } else {
      try {
        console.log("[REST Server] YouTube keywords inconclusive. Performing quick fast text classification using Gemini...");
        const snippetText = lookupText.substring(0, 3000);
        const subjectCall = await generateContentWithRetry({
          model: "gemini-3.8-flash",
          contents: {
            parts: [{
              text: "Analyze the educational title & notes snippet below and determine its main academic subject. " +
                    "Return ONLY the subject name as a single clean capitalized word representing the main discipline (e.g. 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Economics', 'Civics', 'Computer Science', etc.). " +
                    "Do not write sentences, explanation, or markdown formatting.\n\nNotes snippet:\n" + snippetText
            }]
          }
        });
        if (subjectCall && subjectCall.text) {
          rawDetectedSubject = subjectCall.text.trim();
        }
      } catch (classErr) {
        console.error("[REST Server] YouTube text classification fallback failed:", classErr);
      }
    }
    
    const normalizedSubject = normalizeSubjectName(rawDetectedSubject);
    console.log(`[REST Server] YouTube subject detected: "${rawDetectedSubject}" -> Normalized to: "${normalizedSubject}"`);

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

    res.json({
      success: true,
      filename,
      mimeType: "video/youtube",
      markdown,
      mode: "explain",
      detectedSubject: normalizedSubject,
      sessionId: sessionId || "default"
    });
  } catch (err: any) {
    console.error("[REST Server] Error generating syllabus for YouTube video:", err);
    sendApiError(res, "Failed to generate study syllabus", err);
  }
});

// API to generate Smart Revision Deck (Flashcards & Mind Map)
router.post("/api/generate-revision-deck", async (req, res) => {
  const { sessionTitle, subject, topics, blackboardContent, documentMarkdown, sourceMode } = req.body;
  try {
    console.log(`[REST Server] Generating smart exam revision deck for "${sessionTitle || "Class Session"}" (${subject || "General"}, Source: ${sourceMode || "unspecified"})`);

    const prompt = `You are Cherry Ma'am's elite edtech academic assistant. Your task is to generate a comprehensive, highly structured, exam-oriented Revision Deck consisting of Smart Flashcards and an Interactive Mind Map.

Input Source & Materials:
- Session / Topic Title: ${sessionTitle || "Class Session"}
- Subject: ${subject || "General Science"}
- Primary Learning Mode: ${sourceMode || "live_blackboard"}
${documentMarkdown ? `- Extracted Document / Curriculum Notes:\n"""\n${documentMarkdown.slice(0, 7000)}\n"""\n` : ""}
${blackboardContent ? `- Classroom Blackboard & Chalkboard Notes:\n"""\n${blackboardContent.slice(0, 5000)}\n"""\n` : ""}
${topics && Array.isArray(topics) && topics.length > 0 ? `- Subtopics Discussed:\n${topics.map((t: string, idx: number) => `  ${idx + 1}. ${t}`).join("\n")}\n` : ""}

CRITICAL REVISION DIRECTIVES:
1. Strict Content Grounding: Base ALL flashcards and mind map branches directly on the extracted document and blackboard lecture materials provided above. Do NOT invent unrelated trivia.
2. Smart Flashcards (Generate exactly 6-8 high-yield cards):
   - 'question': Clear, high-impact conceptual or numerical question targeting core definitions, derivations, or exam problems. Wrap mathematical variables/formulas in LaTeX ($...$ or $$...$$).
   - 'hint': A concise Socratic hint or thought-provoking clue.
   - 'answer': Crystal-clear, step-by-step explanation with proper LaTeX math ($...$).
   - 'conceptTested': Specific concept name being tested.
   - 'difficulty': "Easy", "Medium", or "Hard".
3. Exam-Oriented Mind Map (Generate 4-6 categorical theme branches):
   Structure the Mind Map into distinct, mutually exclusive main nodes covering:
   - 📌 Core Definitions & Fundamental Laws (Foundations)
   - 📐 Governing Mathematical Equations, Units & Dimensional Formulas (with LaTeX $$...$$)
   - ⚠️ Common Student Mistakes, Traps & Exceptions (Trap Points)
   - 💡 High-Yield Exam Applications, PYQ Patterns & Memory Mnemonics
   
   Node Specification:
   - 'topicName': Crisp title of the branch (e.g. "📐 Core Equations & SI Units", "⚠️ Exam Traps & Sign Conventions").
   - 'keyConcepts': 2-4 specific key terms, principles, or elements in this branch.
   - 'keyFormula': A core governing equation or theorem formatted in LaTeX (e.g. "$$F = \\frac{G m_1 m_2}{r^2}$$" or "$$\\Delta U = Q - W$$") or empty string if not applicable.
   - 'subNodes': 2-4 concise, high-impact bullet takeaways with actionable insights.
   
Ensure the mind map title is clean, specific, and reflects the main topic (e.g. "${sessionTitle || "Topic"} - Master Revision Map").`;

    let data: any = null;
    try {
      const revisionResponse = await generateContentWithRetry({
        model: "gemini-3.8-flash",
        contents: { parts: [{ text: prompt }] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    question: { type: Type.STRING },
                    hint: { type: Type.STRING },
                    answer: { type: Type.STRING },
                    conceptTested: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                  },
                  required: ["id", "question", "answer", "conceptTested"],
                }
              },
              mindMap: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  nodes: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        topicName: { type: Type.STRING },
                        keyConcepts: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                        },
                        keyFormula: { type: Type.STRING },
                        subNodes: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                        }
                      },
                      required: ["topicName", "keyConcepts", "keyFormula", "subNodes"]
                    }
                  }
                },
                required: ["title", "nodes"]
              }
            },
            required: ["flashcards", "mindMap"]
          }
        }
      });

      const jsonText = revisionResponse && revisionResponse.text ? revisionResponse.text.trim() : "{}";
      data = JSON.parse(jsonText);
    } catch (aiError: any) {
      const isMissingKey = String(aiError?.message || "").includes("GEMINI_API_KEY");
      if (isMissingKey) {
        console.log("[REST Server] Revision Deck synthesis active (using structured syllabus flashcards & mind map).");
      } else {
        console.warn("[REST Server] AI Revision Deck fallback active:", aiError?.message || aiError);
      }

      const targetTitle = sessionTitle || "Key Academic Concepts";
      const targetSubject = subject || "Science";
      const subtopics: string[] = (Array.isArray(topics) && topics.length > 0)
        ? topics.map((t: string) => t.replace(/#/g, "").trim())
        : [targetTitle];

      const fullText = `${documentMarkdown || ""} ${blackboardContent || ""}`;
      const formulaRegex = /\$\$([\s\S]*?)\$\$|\$([^\$]+)\$/g;
      const extractedFormulas: string[] = [];
      if (fullText) {
        let match;
        while ((match = formulaRegex.exec(fullText)) !== null) {
          const formula = (match[1] || match[2] || "").trim();
          if (formula.length > 2 && !extractedFormulas.includes(formula)) {
            extractedFormulas.push(formula);
          }
        }
      }

      const defaultFlashcards = [
        {
          id: "card-1",
          question: `What is the fundamental principle and physical definition of ${targetTitle}?`,
          hint: `Recall the core definitions from the syllabus notes.`,
          answer: `In ${targetSubject}, ${targetTitle} describes the core relationship governing physical systems and observable properties. Make sure to define the initial state, boundary conditions, and reference frames.`,
          conceptTested: `${targetTitle} Fundamentals`,
          difficulty: "Easy"
        },
        {
          id: "card-2",
          question: `What is the primary governing mathematical formula for ${subtopics[0] || targetTitle}?`,
          hint: `Think of the main equation derived in the lesson materials.`,
          answer: extractedFormulas.length > 0 
            ? `The core equation is given by: $$${extractedFormulas[0]}$$ where each symbol denotes standard physical quantities in SI units.`
            : `The foundational relation connects the dependent variable directly with independent parameters under standard reference conditions.`,
          conceptTested: `Mathematical Formulation`,
          difficulty: "Medium"
        },
        {
          id: "card-3",
          question: `How do boundary conditions, vector directions, or sign conventions influence ${targetTitle}?`,
          hint: `Consider coordinate frames (+/-) and relative orientations.`,
          answer: `Sign conventions must be established with respect to a fixed origin or observer frame. Inverting the reference axis reverses the relative sign of vector components.`,
          conceptTested: `Coordinate Frame & Sign Convention`,
          difficulty: "Medium"
        },
        {
          id: "card-4",
          question: `What is a frequent exam pitfall or misconception when solving problems on ${targetTitle}?`,
          hint: `Focus on unit conversion or missing minus signs.`,
          answer: `Students frequently forget to convert non-SI units before substitution or misapply sign conventions. Always verify dimensions and state reference frames explicitly!`,
          conceptTested: `Exam Traps & Common Pitfalls`,
          difficulty: "Hard"
        },
        {
          id: "card-5",
          question: `What are the practical applications and high-frequency exam question types for ${targetTitle}?`,
          hint: `Think of standard numerical patterns, diagrams, and derivation steps.`,
          answer: `Mastering ${targetTitle} is essential for 3-mark derivations and 5-mark numericals. Focus on schematic diagram labeling, initial condition setups, and final unit designations.`,
          conceptTested: `High-Yield Exam Applications`,
          difficulty: "Medium"
        }
      ];

      const defaultNodes = [
        {
          topicName: "📌 Core Principles & Definitions",
          keyConcepts: [
            `Fundamental definition and core postulates of ${targetTitle}`,
            `Key physical properties and observational characteristics`,
            `Reference frames and baseline assumptions`
          ],
          keyFormula: extractedFormulas[0] ? `$$${extractedFormulas[0]}$$` : "",
          subNodes: [
            `Establishes the conceptual baseline for ${targetTitle}.`,
            `Essential for 1-mark and 2-mark direct theoretical questions.`
          ]
        },
        {
          topicName: "📐 Key Equations & Mathematical Derivations",
          keyConcepts: [
            `Governing differential and algebraic equations`,
            `SI Units, dimensional consistency and proportionality constants`
          ],
          keyFormula: extractedFormulas[1] ? `$$${extractedFormulas[1]}$$` : (extractedFormulas[0] ? `$$${extractedFormulas[0]}$$` : ""),
          subNodes: [
            `Derivation steps commonly tested in school & board exams.`,
            `Always verify dimensional homogeneity before numerical substitution.`
          ]
        },
        {
          topicName: "⚠️ Common Mistakes & Exam Pitfalls",
          keyConcepts: [
            `Sign convention (+/-) errors during vector resolution`,
            `Failure to convert non-SI units (e.g. cm to m, grams to kg)`
          ],
          keyFormula: "",
          subNodes: [
            `Check units twice: 40% of student deductions occur in unit conversion.`,
            `Clearly state sign conventions before writing coordinate formulas.`
          ]
        },
        {
          topicName: "💡 Exam Takeaways & Quick Mnemonics",
          keyConcepts: [
            `Frequently repeated PYQ patterns (5-year trends)`,
            `Step-by-step structured problem-solving algorithm`
          ],
          keyFormula: "",
          subNodes: [
            `Draw neat labeled schematics with clear arrows for full marks.`,
            `Summarize final answers with proper units and double underlines.`
          ]
        }
      ];

      data = {
        flashcards: defaultFlashcards,
        mindMap: {
          title: `${targetTitle} - Master Revision Map`,
          nodes: defaultNodes
        }
      };
    }

    if (data && typeof data === "object") {
      if (!data.mindMap && data.mindmap) {
        data.mindMap = data.mindmap;
      }
      if (!data.flashcards && data.flashCards) {
        data.flashcards = data.flashCards;
      }
      if (!Array.isArray(data.flashcards)) {
        data.flashcards = [];
      }
      if (!data.mindMap || typeof data.mindMap !== "object") {
        data.mindMap = { 
          title: sessionTitle ? `${sessionTitle} Concepts` : "Classroom Conceptual Overview", 
          nodes: [] 
        };
      }
      if (!Array.isArray(data.mindMap.nodes)) {
        data.mindMap.nodes = [];
      }

      data.mindMap.nodes = data.mindMap.nodes.map((node: any) => {
        const topicName = node.topicName || node.topic || node.name || "Topic Node";
        const keyConcepts = Array.isArray(node.keyConcepts) ? node.keyConcepts : 
                            Array.isArray(node.coreConcepts) ? node.coreConcepts : 
                            Array.isArray(node.concepts) ? node.concepts : [];
        const keyFormula = node.keyFormula || node.formula || node.rule || "";
        const subNodes = Array.isArray(node.subNodes) ? node.subNodes : 
                         Array.isArray(node.quickTakeaways) ? node.quickTakeaways : 
                         Array.isArray(node.takeaways) ? node.takeaways : [];

        return {
          topicName,
          keyConcepts,
          keyFormula,
          subNodes
        };
      });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (err: any) {
    console.error("[REST Server] Error generating revision deck:", err);
    sendApiError(res, "Failed to generate revision deck", err);
  }
});

// Generate 1-Page Concept Visual Infographic Poster / Cheat Sheet
router.post("/api/generate-concept-infographic", async (req, res) => {
  try {
    const { 
      topicTitle, 
      topic,
      subject, 
      grade, 
      chapter, 
      board,
      topics,
      boardContent, 
      blackboardContent,
      sessionTranscript 
    } = req.body;

    const combinedBoard = boardContent || blackboardContent || "";

    let rawTopic = (topicTitle || topic || "").replace(/#/g, "").trim();
    const isRawFileId = /^[0-9\s_.-]+$/.test(rawTopic) ||
                        /^(FILE_|IMG_|DOC_|SLIDE_|SCAN_|DSC_|PHOTO_)?[0-9a-fA-F_-]{3,}/i.test(rawTopic) ||
                        rawTopic.toLowerCase().includes("file_00000000") ||
                        rawTopic.toLowerCase().includes("hand-handbook") ||
                        rawTopic.toLowerCase().includes("visual_cheat_sheet") ||
                        rawTopic.toLowerCase().includes("sample") ||
                        rawTopic.toLowerCase().includes(".png") ||
                        rawTopic.toLowerCase().includes(".pdf") ||
                        rawTopic.toLowerCase().includes(".jpg") ||
                        rawTopic.toLowerCase().includes(".jpeg");

    let cleanTopic = isRawFileId ? "" : rawTopic;

    const sessionState = getOrCreateSession(req.body.sessionId);
    const docSourceText = (sessionState?.activeDocument?.markdown || "").trim();
    const activeDocSubject = sessionState?.activeDocument?.detectedSubject || "";

    if (isRawFileId || !cleanTopic || cleanTopic.toLowerCase().includes("chapter") || cleanTopic.toLowerCase().includes("notes") || cleanTopic.toLowerCase().includes("document")) {
      if (Array.isArray(topics) && topics.length > 0) {
        const validTopic = topics.find((t: string) => t && !t.startsWith("FILE_") && !/^[0-9\s_.-]+$/.test(t) && t.trim().length > 2);
        if (validTopic) cleanTopic = validTopic.replace(/^[#\d\.\s-]+/, "").trim();
      }
      
      const textToSearchForTitle = combinedBoard || docSourceText;
      if (textToSearchForTitle) {
        const headerMatch = textToSearchForTitle.match(/^#+\s*Chapter:\s*(.+)$/im) ||
                            textToSearchForTitle.match(/^#+\s*Topic:\s*(.+)$/im) ||
                            textToSearchForTitle.match(/^#+\s*(.+)$/m) || 
                            textToSearchForTitle.match(/Chapter:\s*(.+)$/im) ||
                            textToSearchForTitle.match(/Topic:\s*(.+)$/im) || 
                            textToSearchForTitle.match(/Concept:\s*(.+)$/im);
        if (headerMatch && headerMatch[1]) {
          const rawH = headerMatch[1].replace(/[\*\_\[\]`#]/g, "").trim();
          if (rawH.length > 2 && !rawH.toLowerCase().startsWith("file_") && !rawH.toLowerCase().startsWith("slide_") && !/^[0-9\s_.-]+$/.test(rawH)) {
            cleanTopic = rawH;
          }
        }
      }
    }

    cleanTopic = cleanTopic
      .replace(/\.(png|jpg|jpeg|pdf|webp)$/i, "")
      .replace(/^FILE_[0-9A-F_]+/i, "")
      .replace(/_/g, " ")
      .replace(/^[#\d\.\s-]+/, "")
      .trim();

    let targetSubject = subject ? normalizeSubjectName(subject) : (activeDocSubject ? normalizeSubjectName(activeDocSubject) : "Science");

    const fullTextForInference = `${cleanTopic} ${(Array.isArray(topics) ? topics.join(" ") : "")} ${combinedBoard} ${sessionTranscript || ""} ${docSourceText.slice(0, 3000)}`.toLowerCase();

    if (fullTextForInference.match(/ammonia|haber|nh3|hydrochloric|nitric|sulfuric|acid|base|salt|bond|reaction|organic|element|periodic|chemical|equilibrium|solution|electrochem|compound|hybridization|carbon|metal|atom|redox|titration|precipitation|catalyst|oxidation|reduction|mole|molarity|alkali|alkaline|halogen|valency|isomerism|hydrocarbon|ester|aldehyde|ketone|polymer|le chatelier|enthalpy|exothermic|endothermic|covalent|ionic/)) {
      targetSubject = "Chemistry";
    } else if (targetSubject === "Science" || targetSubject === "All Science" || targetSubject === "General" || !subject) {
      if (combinedBoard && combinedBoard.length > 20) {
        targetSubject = await classifyAcademicDiscipline(combinedBoard, cleanTopic);
      } else if (docSourceText && docSourceText.length > 20) {
        targetSubject = await classifyAcademicDiscipline(docSourceText, cleanTopic);
      } else {
        targetSubject = await classifyAcademicDiscipline(cleanTopic, cleanTopic);
      }
    }

    if (!cleanTopic || /^[0-9\s_.-]+$/.test(cleanTopic)) {
      cleanTopic = targetSubject === "Chemistry" ? "Study of Compounds: Ammonia & Chemical Reactions" : "Core Academic Concepts";
    }

    const targetTopic = cleanTopic;
    const targetGrade = grade || "Class 10";
    let targetChapter = chapter || targetTopic;
    if (/^(FILE_|IMG_|DOC_)?[0-9a-fA-F_-]{10,}/i.test(targetChapter) || targetChapter.includes(".png") || targetChapter.includes(".pdf")) {
      targetChapter = targetTopic;
    }

    const subtopics: string[] = (Array.isArray(topics) && topics.length > 0)
      ? topics.map((t: string) => t.replace(/#/g, "").trim()).filter((t: string) => t && !t.startsWith("FILE_"))
      : [targetTopic];

    if (subtopics.length === 0) {
      subtopics.push(targetTopic);
    }

    let data: any = null;

    try {
      const compiledRawMaterial = [
        docSourceText ? `=== UPLOADED DOCUMENT / SYLLABUS SOURCE ===\n${docSourceText}` : "",
        combinedBoard ? `=== CHALKBOARD NOTES ===\n${combinedBoard}` : "",
        sessionTranscript ? `=== LECTURE TRANSCRIPT ===\n${sessionTranscript}` : "",
        subtopics.length > 0 ? `=== SUBTOPICS ===\n${subtopics.join(", ")}` : ""
      ].filter(Boolean).join("\n\n");

      const stage1Prompt = buildStage1DistillationPrompt({
        topic: targetTopic,
        subject: targetSubject,
        grade: targetGrade,
        chapter: targetChapter,
        rawText: compiledRawMaterial || `${targetTopic} foundational study notes for ${targetGrade} ${targetSubject}.`,
      });

      console.log(`[REST Server] Stage 1 Distillation starting for "${targetTopic}" (${targetSubject})...`);
      let distilledNotes = "";
      try {
        const stage1Response = await generateContentWithRetry({
          model: "gemini-3.8-flash",
          contents: { parts: [{ text: stage1Prompt }] },
        });
        distilledNotes = stage1Response && stage1Response.text ? stage1Response.text.trim() : "";
      } catch (stage1Err: any) {
        console.warn("[REST Server] Stage 1 fast filter bypassed, forwarding raw content to Stage 2:", stage1Err?.message || stage1Err);
        distilledNotes = combinedBoard || sessionTranscript || `${targetTopic} core concepts in ${targetSubject}`;
      }

      if (!distilledNotes || distilledNotes.length < 20) {
        distilledNotes = combinedBoard || sessionTranscript || `${targetTopic} foundational study notes for ${targetGrade} ${targetSubject}.`;
      }

      const stage2Prompt = buildStage2SynthesisPrompt({
        topic: targetTopic,
        subject: targetSubject,
        grade: targetGrade,
        chapter: targetChapter,
        distilledContent: distilledNotes,
      });

      console.log(`[REST Server] Stage 2 Universal Synthesis starting for "${targetTopic}"...`);
      const stage2Response = await generateContentWithRetry({
        model: "gemini-3.8-flash",
        contents: { parts: [{ text: stage2Prompt }] },
        config: {
          responseMimeType: "application/json",
          responseSchema: universalInfographicResponseSchema,
        },
      });

      const jsonText = stage2Response && stage2Response.text ? stage2Response.text.trim() : "{}";
      const parsedUniversal = JSON.parse(jsonText);
      data = adaptUniversalToLegacy(parsedUniversal);
    } catch (aiError: any) {
      const isMissingKey = String(aiError?.message || "").includes("GEMINI_API_KEY");
      if (isMissingKey) {
        console.log("[REST Server] Universal Infographic synthesis active (generating topic-specific cheat sheet from lecture notes).");
      } else {
        console.warn("[REST Server] AI Universal Infographic fallback active:", aiError?.message || aiError);
      }

      const fallbackUniversal = generateUniversalFallback(
        targetTopic,
        targetSubject,
        targetGrade,
        combinedBoard || sessionTranscript || ""
      );
      data = adaptUniversalToLegacy(fallbackUniversal);
    }

    if (data && typeof data === "object") {
      if (!data.header) {
        data.header = {
          subject: (targetSubject || "SCIENCE").toUpperCase(),
          grade: (targetGrade || "CLASS 10").toUpperCase(),
          chapter: (targetChapter || targetTopic).toUpperCase(),
          topicTag: targetTopic.toUpperCase(),
        };
      }
      if (!data.mainTitle) {
        data.mainTitle = targetTopic.toUpperCase();
      }
    }

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error("[REST Server] Error generating concept infographic:", err);
    sendApiError(res, "Failed to generate concept infographic", err);
  }
});

// Phase 3: AI Custom Simulation Generator API
router.post("/api/generate-simulation", async (req, res) => {
  try {
    const { topic = "Double Slit Interference", grade = "Class 12", subject = "physics" } = req.body;
    console.log(`[REST Server] Generating custom AI simulation for topic: "${topic}" (${grade}, ${subject})`);

    const sanitizedTopic = (topic || "").toLowerCase().trim();

    const matchedCurated = matchCuratedSimulation(sanitizedTopic);
    if (matchedCurated) {
      console.log(`[REST Server] Curated simulation matched for "${sanitizedTopic}" -> "${matchedCurated.title}"`);
      return res.json({ success: true, data: matchedCurated, isCurated: true });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    const prompt = `You are a world-class STEM pedagogical visualization architect. Generate an interactive 2D physics/chemistry/math simulation spec for topic: "${topic}" (${grade}, ${subject}).

Return pure JSON matching this exact structure:
{
  "id": "sim-unique-id",
  "topic": "${topic}",
  "title": "Clear English Title",
  "hindiTitle": "हिन्दी शीर्षक",
  "subject": "${subject}",
  "grade": "${grade}",
  "category": "Thermodynamics | Optics | Waves | Modern Physics | Organic Chemistry | etc.",
  "conceptFormula": "Primary LaTeX Formula",
  "secondaryFormulas": [{ "label": "Name", "formula": "LaTeX" }],
  "simulationType": "ray_optics | wave_optics | circuits_charging | thermodynamics_gas | projectile_motion | custom_interactive",
  "description": "2-sentence concept briefing",
  "parameters": [
    { "key": "paramKey", "label": "Display Label", "min": 1, "max": 100, "step": 1, "defaultValue": 20, "unit": "SI unit", "description": "tooltip", "symbol": "LaTeX symbol" }
  ],
  "liveOutputs": [
    { "key": "outputKey", "label": "Display Label", "formulaStr": "Mathematical formula", "unit": "Unit", "description": "What it represents" }
  ],
  "cherryObservation": {
    "hinglishGuide": "Enthusiastic Hinglish teacher note with deep insight",
    "keyRuleLaw": "Governing scientific law",
    "examTrap": "Common exam trap or mistake students make",
    "whatToObserve": ["Observation 1", "Observation 2"],
    "proTip": "Pro exam tip"
  },
  "visualTheme": {
    "primaryColor": "#38bdf8",
    "accentColor": "#0284c7",
    "bgTheme": "dark"
  }
}

REQUIREMENTS:
1. Provide 2 to 4 intuitive parameters with realistic min, max, step, and defaultValue.
2. Provide 2 to 3 liveOutputs showing relevant mathematical readings.
3. Choose the closest matching simulationType.
4. Make sure cherryObservation.hinglishGuide sounds like an enthusiastic Indian teacher speaking Hinglish with clarity.
5. Return pure JSON only.`;

    if (!apiKey) {
      console.warn("[REST Server] No API key available, using domain-aware procedural generator");
      return res.json({ success: true, data: buildProceduralSimulation(topic, grade, subject) });
    }

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Gemini simulation generation timed out")), 35000)
      );

      const aiPromise = generateContentWithRetry({
        model: "gemini-3.1-flash-lite",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      }, 2, 800, apiKey, 35000);

      const response: any = await Promise.race([aiPromise, timeoutPromise]);

      const rawText = response.text ? response.text.trim() : "";
      const cleanedJson = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsedData = JSON.parse(cleanedJson);

      console.log(`[REST Server] Successfully generated AI simulation spec for "${topic}" (${parsedData.simulationType})`);
      return res.json({ success: true, data: parsedData });
    } catch (aiErr: any) {
      console.warn("[REST Server] AI simulation generation fallback to domain-aware procedural generator:", aiErr?.message);
      return res.json({ success: true, data: buildProceduralSimulation(topic, grade, subject) });
    }
  } catch (err: any) {
    console.error("[REST Server] Error in /api/generate-simulation:", err);
    sendApiError(res, "Failed to generate AI simulation", err);
  }
});

function buildProceduralSimulation(topic: string, grade: string, subject: string) {
  const tLower = (topic || "").toLowerCase();

  if (tLower.includes("wheatstone") || tLower.includes("galvanometer") || tLower.includes("potentiometer") || tLower.includes("meter bridge") || tLower.includes("resistance")) {
    return {
      id: `sim-proc-${Date.now()}`,
      topic,
      title: `${topic}: Bridge Balance & Null Deflection`,
      hindiTitle: `${topic}: ब्रिज संतुलन और नल बिंदु`,
      subject: "physics",
      grade: grade || "Class 12",
      category: "Current Electricity",
      conceptFormula: "\\frac{P}{Q} = \\frac{R}{S}, \\quad I_g = 0",
      secondaryFormulas: [
        { label: "Unknown Resistance", formula: "S = \\frac{Q}{P} \\cdot R" },
        { label: "Galvanometer Current", formula: "I_g = \\frac{V_{BD}}{R_g}" }
      ],
      simulationType: "circuits_charging",
      description: `Investigate the null deflection condition in bridge balance. Adjust standard resistance arm to bring galvanometer needle to zero.`,
      parameters: [
        { key: "ratioArmP", label: "Ratio Arm (P)", min: 10, max: 100, step: 10, defaultValue: 50, unit: "Ω", description: "Fixed ratio arm resistor P", symbol: "P" },
        { key: "ratioArmQ", label: "Ratio Arm (Q)", min: 10, max: 100, step: 10, defaultValue: 50, unit: "Ω", description: "Fixed ratio arm resistor Q", symbol: "Q" },
        { key: "knownResistanceR", label: "Variable Arm (R)", min: 5, max: 150, step: 5, defaultValue: 40, unit: "Ω", description: "Resistance box standard arm R", symbol: "R" },
        { key: "appliedVoltage", label: "Supply EMF (E)", min: 1, max: 12, step: 1, defaultValue: 4, unit: "V", description: "DC battery potential", symbol: "E" }
      ],
      liveOutputs: [
        { key: "galvanometerCurrent", label: "Galvanometer Deflection (Ig)", formulaStr: "V_{BD} / R_g", unit: "mA", description: "Null point is reached when Ig = 0" },
        { key: "calculatedUnknownS", label: "Calculated S", formulaStr: "(Q/P) * R", unit: "Ω", description: "Unknown arm value at balance" }
      ],
      cherryObservation: {
        hinglishGuide: `Dekho beta! Wheatstone Bridge me jab P/Q = R/S ho jata hai, tab central galvanometer arm me koi current nahi behta (Ig = 0). Is condition ko Null Deflection bolte hain!`,
        keyRuleLaw: "Wheatstone Bridge Principle & Kirchhoff's Circuit Laws",
        examTrap: "Remember: Null point remains completely unchanged even if battery and galvanometer positions are interchanged!",
        whatToObserve: [
          "Jab R ko change karte hain, galvanometer needle left ya right deflect hoti hai.",
          "Jab P = Q aur R = S ho, needle exactly zero mark par rukti hai.",
          "EMF badhane se bridge sensitivity badhti hai par null point wahi rehta hai."
        ],
        proTip: "Meter bridge experiments me best accuracy ke liye null point hamesha 40cm se 60cm ke beech me aana chahiye!"
      },
      visualTheme: { primaryColor: "#38bdf8", accentColor: "#0284c7", bgTheme: "dark" }
    };
  }

  if (tLower.includes("carnot") || tLower.includes("engine") || tLower.includes("stirling") || tLower.includes("entropy") || tLower.includes("heat")) {
    return {
      id: `sim-proc-${Date.now()}`,
      topic,
      title: `${topic}: Reversible Thermodynamic Cycle`,
      hindiTitle: `${topic}: कार्नो चक्र और इंजन दक्षता`,
      subject: "physics",
      grade: grade || "Class 11",
      category: "Thermodynamics",
      conceptFormula: "\\eta = 1 - \\frac{T_C}{T_H} = \\frac{W}{Q_H}",
      secondaryFormulas: [
        { label: "Carnot Efficiency", formula: "\\eta = 1 - \\frac{T_2}{T_1}" },
        { label: "Net Work Done", formula: "W = Q_H - Q_C" }
      ],
      simulationType: "thermodynamics_gas",
      description: `Explore the maximum theoretical efficiency limit of heat engines operating between two thermal reservoirs.`,
      parameters: [
        { key: "sourceTemp", label: "Hot Reservoir (T_H)", min: 300, max: 1000, step: 25, defaultValue: 600, unit: "K", description: "Source temperature", symbol: "T_H" },
        { key: "sinkTemp", label: "Cold Reservoir (T_C)", min: 100, max: 400, step: 20, defaultValue: 300, unit: "K", description: "Sink temperature", symbol: "T_C" },
        { key: "compressionRatio", label: "Compression Ratio (r)", min: 2, max: 12, step: 1, defaultValue: 5, unit: "ratio", description: "V_max / V_min", symbol: "r" }
      ],
      liveOutputs: [
        { key: "carnotEfficiency", label: "Thermal Efficiency (η)", formulaStr: "1 - (T_C / T_H)", unit: "%", description: "Maximum possible efficiency" },
        { key: "workOutput", label: "Work Done per Cycle (W)", formulaStr: "Q_H * η", unit: "kJ", description: "Useful mechanical energy" }
      ],
      cherryObservation: {
        hinglishGuide: `Arrey beta dhyan se dekho! Koi bhi real heat engine Carnot efficiency se zyada efficient nahi ho sakta. Efficiency badhane ke liye T_H ko badhao ya T_C ko ghatayein!`,
        keyRuleLaw: "Second Law of Thermodynamics & Carnot's Theorem",
        examTrap: "Efficiency 100% (η = 1) tabhi possible hai jab T_C = 0 K (Absolute Zero) ho, jo practical universe me achieve karna impossible hai!",
        whatToObserve: [
          "T_H (source temperature) badhane par cycle ka area aur efficiency dono increase hote hain.",
          "T_C (sink temperature) drop karne par efficiency sharply increase hoti hai.",
          "Adiabatic compression ke time gas ka temperature bina heat add kiye rise hota hai."
        ],
        proTip: "Steam power plants me condensers cold water use karte hain taaki T_C low rahe aur cycle efficiency maximum ho!"
      },
      visualTheme: { primaryColor: "#f59e0b", accentColor: "#d97706", bgTheme: "dark" }
    };
  }

  return {
    id: `sim-proc-${Date.now()}`,
    topic,
    title: `${topic}: Interactive Dynamic Lab`,
    hindiTitle: `${topic}: इंटरैक्टिव 2D सिमुलेशन`,
    subject: subject || "physics",
    grade: grade || "Class 10-12",
    category: "STEM Interactive Simulation",
    conceptFormula: "\\vec{R} = \\sum_{i=1}^n \\vec{F}_i, \\quad \\Delta E = W_{\\text{ext}} + Q",
    secondaryFormulas: [
      { label: "Rate of Change", formula: "\\frac{d\\Phi}{dt} = v \\cdot \\nabla \\Phi" },
      { label: "Dynamic Output", formula: "Y(t) = Y_0 e^{-\\gamma t} \\cos(\\omega t)" }
    ],
    simulationType: "custom_interactive",
    description: `Dynamic physical parameter mapping and mathematical visualization for ${topic}. Move sliders to observe instantaneous response.`,
    parameters: [
      { key: "primaryParameter", label: `${topic} Intensity`, min: 10, max: 100, step: 5, defaultValue: 50, unit: "units", description: "Primary magnitude or strength parameter.", symbol: "I" },
      { key: "drivingRate", label: "Rate / Frequency (ω)", min: 1, max: 20, step: 1, defaultValue: 8, unit: "rad/s", description: "Oscillation rate or flow dynamics.", symbol: "ω" },
      { key: "dampingFactor", label: "System Damping (γ)", min: 0, max: 10, step: 1, defaultValue: 2, unit: "ratio", description: "Resistance or dissipation coefficient.", symbol: "γ" }
    ],
    liveOutputs: [
      { key: "dynamicResponse", label: "System Response", formulaStr: "I * \\cos(ω t)", unit: "A.U.", description: "Real-time state vector magnitude." },
      { key: "energyFlux", label: "Stored Energy (E)", formulaStr: "0.5 * I^2", unit: "Joules", description: "Total kinetic and potential state." }
    ],
    cherryObservation: {
      hinglishGuide: `Arrey beta dhyan se dekho! ${topic} me jaise hi hum primary parameter (Intensity) ya driving rate (ω) ko adjust karte hain, system ki total energy aur waveform instantly update ho jaati hai!`,
      keyRuleLaw: "Universal Superposition & Conservation Principles",
      examTrap: "Remember to always verify SI units and boundary conditions before plugging values into competitive exam equations!",
      whatToObserve: [
        "Primary slider badhane se system perturbation aur field height badhti hai.",
        "Driving rate badhane se oscillation density aur frequency tez hoti hai.",
        "Damping badhane se transient response steady state me jaldi convert ho jata hai."
      ],
      proTip: "In real-world experiments, system resonance occurs when driving frequency matches natural frequency!"
    },
    visualTheme: {
      primaryColor: "#38bdf8",
      accentColor: "#0284c7",
      bgTheme: "dark"
    }
  };
}

export default router;
