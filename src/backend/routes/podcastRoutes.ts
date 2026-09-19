import { Router } from "express";
import { Modality } from "@google/genai";
import { resolveApiKey, getAiClient, generateContentWithRetry, sendApiError } from "../config/gemini";
import { classifyAcademicDiscipline } from "../state/sessionStore";
import {
  ttsAudioCache,
  synthesizeWithLiveActor,
  synthesizeWithGoogleNeuralAudio,
  convertPcmToWavBuffer,
} from "../services/speechSynthesisService";
import {
  buildPodcastPrompt,
  buildProceduralPodcast,
} from "../../utils/podcastEngine";

const router = Router();

router.post("/api/generate-podcast", async (req, res) => {
  try {
    const {
      topic = "Newton's Laws of Motion",
      subject = "Physics",
      grade = "Class 11",
      language = "Hinglish",
      notesOrDocumentText = "",
      episodeType = "rapid_viva",
      targetDurationMins,
      hostPair = "cherry_riya",
    } = req.body;

    const resolvedTargetMins = Number(targetDurationMins) || (
      episodeType === "exam_booster" ? 3.5 :
      episodeType === "quick_revision" ? 4 :
      episodeType === "exam_trap" ? 3 :
      3
    );

    const apiKey = resolveApiKey(req);

    // Subject & Topic Disambiguation:
    // If the student uploaded notes or document text, ensure subject and topic are extracted directly from the notes!
    let resolvedSubject = subject || "Physics";
    let resolvedTopic = topic || "Academic Deep Dive";

    if (notesOrDocumentText && notesOrDocumentText.trim().length > 30) {
      const detectedFromNotes = await classifyAcademicDiscipline(notesOrDocumentText, topic);
      if (detectedFromNotes && detectedFromNotes !== "All Science") {
        console.log(`[REST Server] Audio overview subject resolved from document notes: "${detectedFromNotes}" (client sent: "${subject}")`);
        resolvedSubject = detectedFromNotes;
      }
      // If topic is still default placeholder or generic, extract chapter/title from document
      if (!topic || topic === "Newton's Laws of Motion" || topic.includes("Core Concept") || topic === "Academic Deep Dive") {
        const titleMatch = notesOrDocumentText.match(/^#+\s*Chapter:\s*(.+)$/im) ||
                           notesOrDocumentText.match(/^#+\s*Topic:\s*(.+)$/im) ||
                           notesOrDocumentText.match(/^Chapter:\s*(.+)$/im) ||
                           notesOrDocumentText.match(/^Title:\s*(.+)$/im) ||
                           notesOrDocumentText.match(/^#+\s*(.+)$/m);
        if (titleMatch && titleMatch[1]) {
          const rawT = titleMatch[1].replace(/[\*\_\[\]`#]/g, "").trim();
          if (rawT.length > 2 && !rawT.toLowerCase().includes("topic header text") && !/^\d+$/.test(rawT)) {
            resolvedTopic = rawT;
            console.log(`[REST Server] Audio overview topic resolved from document header: "${resolvedTopic}"`);
          }
        }
      }
    } else if (topic && topic.trim().length > 3) {
      const detectedFromTopic = await classifyAcademicDiscipline(topic, topic);
      if (detectedFromTopic && detectedFromTopic !== "All Science") {
        if (subject === "Mathematics" || subject === "Physics" || !subject || subject === "General Science") {
          console.log(`[REST Server] Audio overview subject corrected from "${subject}" to "${detectedFromTopic}" based on topic name "${topic}".`);
          resolvedSubject = detectedFromTopic;
        }
      }
    }

    console.log(`[REST Server] Generating 2-Host Podcast for "${resolvedTopic}" [Mode: ${episodeType}] in ${language} (Subject: ${resolvedSubject}, Host: ${hostPair}, Key present: ${!!apiKey})`);

    // If API key is missing, return high-fidelity procedural multilingual podcast grounded in student notes
    if (!apiKey) {
      console.warn("[REST Server] No GEMINI_API_KEY available, returning procedural multilingual podcast");
      const proceduralData = buildProceduralPodcast(
        resolvedTopic,
        resolvedSubject,
        grade,
        language,
        hostPair,
        episodeType,
        resolvedTargetMins,
        notesOrDocumentText
      );
      return res.json({ success: true, data: proceduralData, isProcedural: true });
    }

    const prompt = buildPodcastPrompt({
      topic: resolvedTopic,
      subject: resolvedSubject,
      grade,
      language,
      notesOrDocumentText,
      episodeType,
      targetDurationMins: resolvedTargetMins,
      hostPair,
    });

    try {
      console.log(`[REST Server] Generating podcast script using Gemini AI (primary gemini-3.8-flash with dynamic fallback, target: ${resolvedTargetMins}m)...`);
      const response = await Promise.race([
        generateContentWithRetry(
          {
            model: "gemini-3.8-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
              temperature: 0.7,
              maxOutputTokens: 6000,
              responseMimeType: "application/json",
            },
          },
          4,
          500,
          apiKey
        ),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Podcast AI generation timeout (120s)")), 120000)
        ),
      ]);

      const rawText = response.text ? response.text.trim() : "";
      let cleanedJson = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      const firstBrace = cleanedJson.indexOf("{");
      const lastBrace = cleanedJson.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedJson = cleanedJson.substring(firstBrace, lastBrace + 1);
      }
      const parsedData = JSON.parse(cleanedJson);

      // Ensure segments and hosts exist
      if (!parsedData.segments || !Array.isArray(parsedData.segments) || parsedData.segments.length === 0) {
        throw new Error("Invalid podcast response schema: missing segments");
      }

      if (!parsedData.episodeType) {
        parsedData.episodeType = episodeType;
      }

      console.log(`[REST Server] Successfully generated ${parsedData.segments.length}-segment podcast for "${resolvedTopic}" [Mode: ${episodeType}] in ${language}`);
      return res.json({ success: true, data: parsedData });
    } catch (aiErr: any) {
      console.warn("[REST Server] Gemini podcast generation failed, using procedural podcast fallback:", aiErr?.message);
      const proceduralData = buildProceduralPodcast(
        resolvedTopic,
        resolvedSubject,
        grade,
        language,
        hostPair,
        episodeType,
        resolvedTargetMins,
        notesOrDocumentText
      );
      return res.json({ success: true, data: proceduralData, isFallback: true, note: aiErr?.message });
    }
  } catch (err: any) {
    console.error("[REST Server] Critical error in /api/generate-podcast:", err);
    sendApiError(res, "Failed to generate audio podcast overview", err);
  }
});

router.post("/api/synthesize-speech", async (req, res) => {
  const {
    text = "",
    speaker = "mentor",
    voiceName,
    language = "Hinglish",
  } = req.body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ success: false, error: "Text is required for speech synthesis" });
  }

  const cleanText = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[*#_`~>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const isStudent = speaker === "student" || speaker === "host2" || speaker === "riya";
  const isCherry = !isStudent && (speaker === "cherry" || speaker === "cherry_maam" || speaker === "mentor_female" || voiceName === "Aoede");
  const isMentor = !isStudent && (speaker === "mentor" || speaker === "host1" || speaker === "aarav" || isCherry);
  const primaryVoice = voiceName || (isCherry ? "Aoede" : isMentor ? "Charon" : "Kore");
  const backupVoice = isCherry ? "Kore" : isMentor ? "Fenrir" : "Aoede";

  const cacheKey = `${speaker}:${primaryVoice}:${cleanText.toLowerCase()}`;
  if (ttsAudioCache.has(cacheKey)) {
    const cached = ttsAudioCache.get(cacheKey)!;
    return res.json({
      success: true,
      ...cached,
      speaker,
      isCached: true,
    });
  }

  const apiKey = resolveApiKey(req);
  if (!apiKey) {
    try {
      const neuralResult = await synthesizeWithGoogleNeuralAudio(cleanText, speaker, language);
      const resultObj = {
        audioBase64: neuralResult.buffer.toString("base64"),
        mimeType: "audio/mpeg",
        durationSec: neuralResult.durationSec,
        voiceName: neuralResult.voiceName,
      };
      ttsAudioCache.set(cacheKey, resultObj);
      return res.json({
        success: true,
        ...resultObj,
        speaker,
        isNeuralStudio: true,
      });
    } catch (fallbackErr: any) {
      return res.json({
        success: false,
        fallback: true,
        message: "Audio synthesis unavailable",
      });
    }
  }

  // 1. 🌟 Primary Pipeline: Script-Anchored Live Voice Actor (Gemini 3.1 Flash Live API)
  // Provides authentic human vocal cadence, natural breath pauses, and 24kHz HD studio sound
  try {
    console.log(`[REST Server] 🎙️ Synthesizing via Script-Anchored Live Actor Pipeline ("${primaryVoice}", speaker: ${speaker})`);
    const liveResult = await synthesizeWithLiveActor(cleanText, primaryVoice, speaker, apiKey);
    const resultObj = {
      audioBase64: liveResult.buffer.toString("base64"),
      mimeType: "audio/wav",
      durationSec: liveResult.durationSec,
      voiceName: liveResult.voiceName,
    };

    if (ttsAudioCache.size >= 300) {
      const firstKey = ttsAudioCache.keys().next().value;
      if (firstKey) ttsAudioCache.delete(firstKey);
    }
    ttsAudioCache.set(cacheKey, resultObj);

    return res.json({
      success: true,
      ...resultObj,
      speaker,
      isLiveActor: true,
    });
  } catch (liveErr: any) {
    console.warn(`[REST Server] Live Actor Pipeline notice (${liveErr?.message}), trying secondary TTS...`);
  }

  const aiClient = getAiClient(apiKey);
  let response: any = null;
  let usedVoice = primaryVoice;

  try {
    // Secondary fallback: Direct generateContent TTS models
    const ttsModels = ["gemini-2.5-flash-preview-tts", "gemini-3.1-flash-tts-preview"];
    const voicesToTry = [primaryVoice, backupVoice];

    outerLoop:
    for (const voiceToTry of voicesToTry) {
      for (const ttsModel of ttsModels) {
        try {
          console.log(`[REST Server] Synthesizing Ultra-Realistic Human Speech (${ttsModel}, "${voiceToTry}", speaker: ${speaker})`);
          response = await aiClient.models.generateContent({
            model: ttsModel,
            contents: [{ parts: [{ text: cleanText }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: voiceToTry },
                },
              },
            },
          });
          usedVoice = voiceToTry;
          if (response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
            break outerLoop;
          }
        } catch (trialErr: any) {
          const errMsg = trialErr?.message || "";
          const isQuota = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || trialErr?.status === 429;
          const is503 = errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || trialErr?.status === 503;

          console.warn(`[REST Server] Gemini TTS trial (${ttsModel}, voice "${voiceToTry}"):`, isQuota ? "Rate limit" : errMsg);

          if (isQuota) {
            await new Promise((r) => setTimeout(r, 800));
            continue;
          }

          if (is503) {
            await new Promise((r) => setTimeout(r, 500));
            continue;
          }

          await new Promise((r) => setTimeout(r, 300));
        }
      }
    }

    const inlineData = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (inlineData && inlineData.data) {
      const rawBuffer = Buffer.from(inlineData.data, "base64");
      const incomingMime = inlineData.mimeType || "audio/pcm";

      let finalBuffer: Buffer;
      let finalMime = "audio/wav";

      if (incomingMime.includes("wav") || incomingMime.includes("mp3") || incomingMime.includes("mpeg")) {
        finalBuffer = rawBuffer;
        finalMime = incomingMime;
      } else {
        finalBuffer = convertPcmToWavBuffer(rawBuffer, 24000, 1);
        finalMime = "audio/wav";
      }

      const durationSec = Math.max(1, Math.round((rawBuffer.length / (24000 * 2)) * 10) / 10);
      const resultObj = {
        audioBase64: finalBuffer.toString("base64"),
        mimeType: finalMime,
        durationSec,
        voiceName: usedVoice,
      };

      if (ttsAudioCache.size >= 250) {
        const firstKey = ttsAudioCache.keys().next().value;
        if (firstKey) ttsAudioCache.delete(firstKey);
      }
      ttsAudioCache.set(cacheKey, resultObj);

      return res.json({
        success: true,
        ...resultObj,
        speaker,
      });
    }

    // If Gemini TTS didn't produce inline audio (e.g. rate-limit or quota), synthesize with High-Definition Neural Speech
    const neuralResult = await synthesizeWithGoogleNeuralAudio(cleanText, speaker, language);
    const resultObj = {
      audioBase64: neuralResult.buffer.toString("base64"),
      mimeType: "audio/mpeg",
      durationSec: neuralResult.durationSec,
      voiceName: neuralResult.voiceName,
    };

    if (ttsAudioCache.size >= 250) {
      const firstKey = ttsAudioCache.keys().next().value;
      if (firstKey) ttsAudioCache.delete(firstKey);
    }
    ttsAudioCache.set(cacheKey, resultObj);

    return res.json({
      success: true,
      ...resultObj,
      speaker,
      isNeuralStudio: true,
    });
  } catch (err: any) {
    const errMsg = err?.message || "";
    console.warn("[REST Server] Gemini TTS error, falling back to High-Definition Neural Speech:", errMsg);

    try {
      const neuralResult = await synthesizeWithGoogleNeuralAudio(cleanText, speaker, language);
      const resultObj = {
        audioBase64: neuralResult.buffer.toString("base64"),
        mimeType: "audio/mpeg",
        durationSec: neuralResult.durationSec,
        voiceName: neuralResult.voiceName,
      };
      ttsAudioCache.set(cacheKey, resultObj);
      return res.json({
        success: true,
        ...resultObj,
        speaker,
        isNeuralStudio: true,
      });
    } catch (finalFallbackErr: any) {
      return res.json({
        success: false,
        fallback: true,
        error: errMsg || "Speech synthesis unavailable",
      });
    }
  }
});

/**
 * 🎙️ Batch Full-Podcast Audio Stitcher & Downloader
 * Synthesizes and losslessly stitches all dialogue turns into a unified 24kHz studio .wav file
 * for instant offline playback and native device download.
 */
router.post("/api/synthesize-full-podcast", async (req, res) => {
  const {
    segments = [],
    hosts = {},
    language = "Hinglish",
    topic = "Audio_Podcast",
  } = req.body;

  if (!Array.isArray(segments) || segments.length === 0) {
    return res.status(400).json({ success: false, error: "Segments array is required" });
  }

  const apiKey = resolveApiKey(req);
  const isCherryMentor =
    hosts?.mentor?.name?.toLowerCase().includes("cherry") ||
    hosts?.mentor?.voiceGender === "female";

  const pcmBuffers: Buffer[] = [];
  const pauseBytes = 24000 * 2 * 0.3; // 300ms pause at 24kHz 16-bit mono
  const pauseBuffer = Buffer.alloc(pauseBytes);

  try {
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const isMentor = seg.speaker === "mentor";
      const speakerParam = isMentor ? (isCherryMentor ? "cherry" : "mentor") : "student";
      const voiceParam = isMentor ? (isCherryMentor ? "Aoede" : "Charon") : "Kore";

      const cleanText = (seg.text || "")
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/[*#_`~>|]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (!cleanText) continue;

      const cacheKey = `${speakerParam}:${voiceParam}:${cleanText.toLowerCase()}`;
      let audioBuffer: Buffer | null = null;
      let mimeType = "audio/wav";

      if (ttsAudioCache.has(cacheKey)) {
        const cached = ttsAudioCache.get(cacheKey)!;
        audioBuffer = Buffer.from(cached.audioBase64, "base64");
        mimeType = cached.mimeType;
      } else if (apiKey) {
        try {
          const liveResult = await synthesizeWithLiveActor(cleanText, voiceParam, speakerParam, apiKey);
          audioBuffer = liveResult.buffer;
          mimeType = "audio/wav";
          ttsAudioCache.set(cacheKey, {
            audioBase64: liveResult.buffer.toString("base64"),
            mimeType: "audio/wav",
            durationSec: liveResult.durationSec,
            voiceName: liveResult.voiceName,
          });
        } catch (e) {
          // fallback to neural
          const neuralResult = await synthesizeWithGoogleNeuralAudio(cleanText, speakerParam, language);
          audioBuffer = neuralResult.buffer;
          mimeType = "audio/mpeg";
        }
      } else {
        const neuralResult = await synthesizeWithGoogleNeuralAudio(cleanText, speakerParam, language);
        audioBuffer = neuralResult.buffer;
        mimeType = "audio/mpeg";
      }

      if (audioBuffer) {
        // If WAV audio, strip 44-byte header to get pure PCM
        if (mimeType.includes("wav") && audioBuffer.length > 44) {
          const pcm = audioBuffer.subarray(44);
          pcmBuffers.push(pcm);
          if (i < segments.length - 1) {
            pcmBuffers.push(pauseBuffer);
          }
        } else {
          // Keep buffer
          pcmBuffers.push(audioBuffer);
        }
      }
    }

    if (pcmBuffers.length === 0) {
      return res.status(500).json({ success: false, error: "Could not synthesize any audio segments" });
    }

    const totalPcm = Buffer.concat(pcmBuffers);
    const finalWavBuffer = convertPcmToWavBuffer(totalPcm, 24000, 1);
    const durationSec = Math.max(10, Math.round((totalPcm.length / (24000 * 2)) * 10) / 10);
    const safeTopic = topic.replace(/[^a-zA-Z0-9_\-\u0900-\u097F]/g, "_");
    const filename = `${safeTopic}_CherryAI_Podcast.wav`;

    if (req.query.download === "true") {
      res.setHeader("Content-Type", "audio/wav");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Length", finalWavBuffer.length);
      return res.send(finalWavBuffer);
    }

    return res.json({
      success: true,
      audioBase64: finalWavBuffer.toString("base64"),
      mimeType: "audio/wav",
      durationSec,
      filename,
    });
  } catch (err: any) {
    console.error("[REST Server] Error in /api/synthesize-full-podcast:", err);
    return res.status(500).json({ success: false, error: err?.message || "Failed to synthesize full podcast" });
  }
});

export default router;
