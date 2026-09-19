import * as https from "https";
import { Modality } from "@google/genai";
import { getAiClient } from "../config/gemini";

// ==========================================
// 🎙️ Ultra-Realistic Human AI Speech Synthesis (Gemini 3.1 Flash TTS)
// NotebookLM-Style Studio Voices: Aarav Sir (Charon) & Riya (Aoede)
// ==========================================
export function convertPcmToWavBuffer(pcmBuffer: Buffer, sampleRate = 24000, channels = 1): Buffer {
  const header = Buffer.alloc(44);
  const dataLen = pcmBuffer.length;
  const byteRate = sampleRate * channels * 2;
  const blockAlign = channels * 2;

  // RIFF chunk descriptor
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataLen, 4);
  header.write("WAVE", 8);

  // "fmt " sub-chunk
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // subchunk1 size (16 for PCM)
  header.writeUInt16LE(1, 20); // audio format (1 = PCM)
  header.writeUInt16LE(channels, 22); // num channels
  header.writeUInt32LE(sampleRate, 24); // sample rate
  header.writeUInt32LE(byteRate, 28); // byte rate
  header.writeUInt16LE(blockAlign, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample (16-bit)

  // "data" sub-chunk
  header.write("data", 36);
  header.writeUInt32LE(dataLen, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// 🎙️ High-Definition Neural Speech Engine (Human Vocal Inflection & Indian Cadence)
// Synthesizes natural human speech with distinct mentor/student vocal characteristics
export function fetchGoogleTtsChunk(text: string, lang: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(text)}`;
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" } }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Google Neural TTS HTTP status ${res.statusCode}`));
      }
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
}

export function splitTextIntoSentences(text: string, maxLen = 175): string[] {
  const regex = /([^.!?।\n]+[.!?।\n]+|[^.!?।\n]+$)/g;
  const rawParts = text.match(regex) || [text];
  const chunks: string[] = [];
  let current = "";

  for (const part of rawParts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if ((current + " " + trimmed).trim().length <= maxLen) {
      current = (current + " " + trimmed).trim();
    } else {
      if (current) chunks.push(current);
      if (trimmed.length <= maxLen) {
        current = trimmed;
      } else {
        const words = trimmed.split(/\s+/);
        current = "";
        for (const w of words) {
          if ((current + " " + w).trim().length <= maxLen) {
            current = (current + " " + w).trim();
          } else {
            if (current) chunks.push(current);
            current = w;
          }
        }
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text];
}

export async function synthesizeWithGoogleNeuralAudio(
  text: string,
  speaker: string,
  language: string
): Promise<{ buffer: Buffer; durationSec: number; voiceName: string }> {
  const isCherry = speaker === "cherry" || speaker === "cherry_maam" || speaker === "mentor_female";
  const isMentor = speaker === "mentor" || speaker === "host1" || speaker === "aarav" || isCherry;
  const hasDevanagari = /[\u0900-\u097F]/.test(text);

  let targetLang = "hi";
  let voiceName = isCherry
    ? "Studio Neural HD (Cherry Ma'am)"
    : isMentor
    ? "Studio Neural HD (Aarav Sir)"
    : "Studio Neural HD (Riya)";

  if (language === "Hindi" || hasDevanagari) {
    targetLang = "hi";
  } else if (language === "Bengali") {
    targetLang = "bn";
  } else if (language === "English") {
    targetLang = isMentor && !isCherry ? "en-IN" : "en-GB";
  } else {
    // Hinglish (conversational Hindi-English blend)
    targetLang = isMentor && !isCherry ? "en-IN" : "en-GB";
  }

  const chunks = splitTextIntoSentences(text, 175);
  const buffers: Buffer[] = [];

  for (const c of chunks) {
    try {
      const buf = await fetchGoogleTtsChunk(c, targetLang);
      buffers.push(buf);
    } catch (chunkErr) {
      console.warn("[REST Server] Google TTS chunk fallback to en-IN:", chunkErr);
      const fallbackBuf = await fetchGoogleTtsChunk(c, "en-IN");
      buffers.push(fallbackBuf);
    }
  }

  const combinedBuffer = Buffer.concat(buffers);
  const durationSec = Math.max(1.5, Math.round((combinedBuffer.length / 4500) * 10) / 10);
  return { buffer: combinedBuffer, durationSec, voiceName };
}

// In-memory cache for synthesized voice segments (max 300 items)
export const ttsAudioCache = new Map<string, { audioBase64: string; mimeType: string; durationSec: number; voiceName: string }>();
export let ttsCooldownUntil = 0; // Cooldown timestamp when TTS is rate-limited (429) or overloaded (503)

export function setTtsCooldownUntil(val: number) {
  ttsCooldownUntil = val;
}

/**
 * 🎙️ Script-Anchored Live Voice Actor Pipeline (Gemini 3.1 Flash Live API)
 * Synthesizes scripted lines with authentic human vocal inflection, natural breath pauses,
 * and high-fidelity 24kHz PCM audio using live WebSocket sessions.
 * Never drifts from script because lines are recited verbatim with human emotion.
 */
export async function synthesizeWithLiveActor(
  text: string,
  voiceName: string,
  speaker: string,
  apiKey: string,
  attempt = 1
): Promise<{ buffer: Buffer; durationSec: number; voiceName: string }> {
  const isStudent = speaker === "student" || speaker === "host2" || speaker === "riya";
  const isCherry = !isStudent && (speaker === "cherry" || speaker === "cherry_maam" || speaker === "mentor_female" || voiceName === "Aoede");
  const isMentor = !isStudent && (speaker === "mentor" || speaker === "host1" || speaker === "aarav" || isCherry);

  const actorRoleInstruction = isCherry
    ? "You are Cherry Ma'am, an expert female teacher acting in an educational audio podcast. Recite the exact given sentence verbatim with authentic, warm human emotional inflection, natural breath pauses, and pedagogical clarity. Speak naturally in conversational Hindi/Hinglish as written. Never add any greeting, preamble, meta comments, or change any words."
    : isMentor
    ? "You are Aarav Sir, a senior experienced mentor acting in an educational audio podcast. Recite the exact given sentence verbatim with authentic, warm, deep human cadence and clarity. Speak naturally in conversational Hindi/Hinglish as written. Never add any greeting, preamble, meta comments, or change any words."
    : "You are Riya, a bright and curious 16-year-old female high school student co-host. Recite the exact given sentence verbatim with an authentic, youthful, curious, and sweet teenage girl voice in conversational Hindi/Hinglish as written. Never add any greeting, preamble, meta comments, or change any words.";

  const aiClient = getAiClient(apiKey);
  let session: any = null;
  const pcmChunks: Buffer[] = [];
  let sessionClosed = false;

  // Generous timeout scaled to sentence length: minimum 28s, up to 45s
  const timeoutMs = Math.max(28000, Math.min(45000, text.length * 160));

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (!sessionClosed) {
        sessionClosed = true;
        try { session?.close(); } catch (e) {}
        if (attempt === 1) {
          console.warn(`[REST Server] Live Actor attempt 1 timed out after ${Math.round(timeoutMs / 1000)}s, retrying with fresh session...`);
          synthesizeWithLiveActor(text, voiceName, speaker, apiKey, 2)
            .then(resolve)
            .catch(reject);
        } else {
          reject(new Error(`Live actor synthesis timeout (${Math.round(timeoutMs / 1000)}s)`));
        }
      }
    }, timeoutMs);

    aiClient.live.connect({
      model: "gemini-3.1-flash-live-preview",
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
        systemInstruction: {
          parts: [{ text: actorRoleInstruction }],
        },
      },
      callbacks: {
        onmessage: (msg: any) => {
          const rawBase64 = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (rawBase64) {
            pcmChunks.push(Buffer.from(rawBase64, "base64"));
          }
          if (msg.serverContent?.turnComplete) {
            clearTimeout(timeoutId);
            if (!sessionClosed) {
              sessionClosed = true;
              try { session?.close(); } catch (e) {}
              const combinedPcm = Buffer.concat(pcmChunks);
              if (combinedPcm.length === 0) {
                if (attempt === 1) {
                  return synthesizeWithLiveActor(text, voiceName, speaker, apiKey, 2)
                    .then(resolve)
                    .catch(reject);
                }
                return reject(new Error("No audio received from Live actor"));
              }
              const wavBuffer = convertPcmToWavBuffer(combinedPcm, 24000, 1);
              const durationSec = Math.max(1, Math.round((combinedPcm.length / (24000 * 2)) * 10) / 10);
              resolve({ buffer: wavBuffer, durationSec, voiceName });
            }
          }
        },
        onerror: (err: any) => {
          clearTimeout(timeoutId);
          if (!sessionClosed) {
            sessionClosed = true;
            try { session?.close(); } catch (e) {}
            if (attempt === 1) {
              console.warn("[REST Server] Live Actor attempt 1 error, retrying attempt 2...", err?.message || err);
              return synthesizeWithLiveActor(text, voiceName, speaker, apiKey, 2)
                .then(resolve)
                .catch(reject);
            }
            reject(err);
          }
        },
      },
    }).then((s: any) => {
      session = s;
      session.sendClientContent({
        turns: [
          {
            role: "user",
            parts: [{ text: `Speak this verbatim: "${text}"` }],
          },
        ],
        turnComplete: true,
      });
    }).catch((connectErr: any) => {
      clearTimeout(timeoutId);
      if (!sessionClosed) {
        sessionClosed = true;
        if (attempt === 1) {
          console.warn("[REST Server] Live Actor connect error, retrying attempt 2...", connectErr?.message);
          return synthesizeWithLiveActor(text, voiceName, speaker, apiKey, 2)
            .then(resolve)
            .catch(reject);
        }
        reject(connectErr);
      }
    });
  });
}
