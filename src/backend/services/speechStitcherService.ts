import { Modality } from "@google/genai";
import { getAiClient } from "../config/gemini";
import {
  ttsAudioCache,
  synthesizeWithLiveActor,
  synthesizeWithGoogleNeuralAudio,
  convertPcmToWavBuffer,
} from "./speechSynthesisService";

export interface SpeechSynthesisResult {
  success: boolean;
  audioBase64?: string;
  mimeType?: string;
  durationSec?: number;
  voiceName?: string;
  speaker?: string;
  isCached?: boolean;
  isLiveActor?: boolean;
  isNeuralStudio?: boolean;
  fallback?: boolean;
  message?: string;
  error?: string;
}

/**
 * Synthesizes speech for an individual dialogue turn using Live Actor, Gemini TTS, or Google Neural Audio.
 */
export async function synthesizeSpeechSegment(
  text: string,
  speaker: string = "mentor",
  voiceName?: string,
  language: string = "Hinglish",
  apiKey?: string
): Promise<SpeechSynthesisResult> {
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
    return {
      success: true,
      ...cached,
      speaker,
      isCached: true,
    };
  }

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
      return {
        success: true,
        ...resultObj,
        speaker,
        isNeuralStudio: true,
      };
    } catch (fallbackErr: any) {
      return {
        success: false,
        fallback: true,
        message: "Audio synthesis unavailable",
      };
    }
  }

  // 1. Primary Pipeline: Script-Anchored Live Voice Actor (Gemini 3.1 Flash Live API)
  try {
    console.log(`[Speech Service] Synthesizing via Script-Anchored Live Actor Pipeline ("${primaryVoice}", speaker: ${speaker})`);
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

    return {
      success: true,
      ...resultObj,
      speaker,
      isLiveActor: true,
    };
  } catch (liveErr: any) {
    console.warn(`[Speech Service] Live Actor notice (${liveErr?.message}), trying secondary TTS...`);
  }

  // 2. Secondary fallback: Direct generateContent TTS models
  const aiClient = getAiClient(apiKey);
  let response: any = null;
  let usedVoice = primaryVoice;

  const ttsModels = ["gemini-2.5-flash-preview-tts", "gemini-3.1-flash-tts-preview"];
  const voicesToTry = [primaryVoice, backupVoice];

  outerLoop:
  for (const voiceToTry of voicesToTry) {
    for (const ttsModel of ttsModels) {
      try {
        console.log(`[Speech Service] Synthesizing speech (${ttsModel}, "${voiceToTry}", speaker: ${speaker})`);
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

        console.warn(`[Speech Service] Gemini TTS trial (${ttsModel}, voice "${voiceToTry}"):`, isQuota ? "Rate limit" : errMsg);
        if (isQuota) await new Promise((r) => setTimeout(r, 800));
        else if (is503) await new Promise((r) => setTimeout(r, 500));
        else await new Promise((r) => setTimeout(r, 300));
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

    return {
      success: true,
      ...resultObj,
      speaker,
    };
  }

  // 3. Fallback to High-Definition Neural Speech
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

  return {
    success: true,
    ...resultObj,
    speaker,
    isNeuralStudio: true,
  };
}

/**
 * Synthesizes and losslessly stitches all dialogue turns into a unified 24kHz studio .wav buffer.
 */
export async function stitchFullPodcastAudio(
  segments: Array<{ speaker: string; text: string }>,
  hosts: any = {},
  language: string = "Hinglish",
  apiKey?: string
): Promise<{ finalWavBuffer: Buffer; durationSec: number }> {
  const isCherryMentor =
    hosts?.mentor?.name?.toLowerCase().includes("cherry") ||
    hosts?.mentor?.voiceGender === "female";

  const pcmBuffers: Buffer[] = [];
  const pauseBytes = 24000 * 2 * 0.3; // 300ms pause at 24kHz 16-bit mono
  const pauseBuffer = Buffer.alloc(pauseBytes);

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
      if (mimeType.includes("wav") && audioBuffer.length > 44) {
        const pcm = audioBuffer.subarray(44);
        pcmBuffers.push(pcm);
        if (i < segments.length - 1) {
          pcmBuffers.push(pauseBuffer);
        }
      } else {
        pcmBuffers.push(audioBuffer);
      }
    }
  }

  if (pcmBuffers.length === 0) {
    throw new Error("Could not synthesize any audio segments");
  }

  const totalPcm = Buffer.concat(pcmBuffers);
  const finalWavBuffer = convertPcmToWavBuffer(totalPcm, 24000, 1);
  const durationSec = Math.max(10, Math.round((totalPcm.length / (24000 * 2)) * 10) / 10);

  return { finalWavBuffer, durationSec };
}
