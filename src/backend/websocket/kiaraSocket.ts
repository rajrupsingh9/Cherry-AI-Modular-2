import { WebSocketServer, WebSocket } from "ws";
import { Modality } from "@google/genai";
import { resolveApiKey, getAiClient } from "../config/gemini";

/**
 * Attaches the WebSocket connection handler for Kiara Live Academic & Mindset Counselor.
 */
export function attachKiaraSocket(wssKiaraLive: WebSocketServer): void {
  wssKiaraLive.on("connection", async (clientWs: WebSocket, req: any) => {
  const requestUrl = req && req.url ? new URL(req.url, `http://${req.headers?.host || "localhost"}`) : null;
  const grade = requestUrl ? (requestUrl.searchParams.get("grade") || "Class 10") : "Class 10";
  const board = requestUrl ? (requestUrl.searchParams.get("board") || "CBSE") : "CBSE";
  const studentName = requestUrl ? (requestUrl.searchParams.get("studentName") || "Student") : "Student";
  const subject = requestUrl ? (requestUrl.searchParams.get("subject") || "Mathematics") : "Mathematics";
  const rawPerf = requestUrl ? requestUrl.searchParams.get("performanceData") : null;
  const customKey = requestUrl ? (requestUrl.searchParams.get("apiKey") || requestUrl.searchParams.get("geminiApiKey") || "") : "";
  const effectiveApiKey = resolveApiKey(customKey);
  const activeAiClient = getAiClient(effectiveApiKey);

  let perfSummary = "No detailed performance analytics recorded yet.";
  if (rawPerf) {
    try {
      const perf = JSON.parse(rawPerf);
      perfSummary = `STUDENT REAL-TIME PERFORMANCE ANALYTICS & HUB DATA:
- Concept Clarity: ${perf.conceptClarity ?? 75}%
- Theoretical Core: ${perf.theoreticalCore ?? 70}%
- Calculation Precision: ${perf.calculationPrecision ?? 60}%
- Formula Recall: ${perf.formulaRecall ?? 65}%
- Socratic Stamina / Classroom Engagement: ${perf.socraticStamina ?? 80}%
- Total Practice Quizzes Attempted: ${perf.totalQuizzes ?? 0}
- Live Chalkboard Classes Attended: ${perf.classesCompleted ?? 0}
- Saved Board Snapshots: ${perf.snapshotsSaved ?? 0}
- Key Strengths: ${(perf.strengths || []).map((s: any) => s.concept || s).join(", ") || "General concepts"}
- Priority Growth Focus Areas: ${(perf.growths || []).map((g: any) => `${g.concept || g}${g.explanation ? ` (${g.explanation})` : ''}`).join("; ") || "Calculation step precision"}`;
    } catch (e) {
      console.error("[WS Kiara Live] Error parsing performanceData:", e);
    }
  }

  console.log(`[WS Kiara Live] Connected: ${studentName}, Grade: ${grade}, Board: ${board}, Subject: ${subject}. Initializing Gemini Live session with key: ${effectiveApiKey ? `${effectiveApiKey.substring(0, 6)}...` : "none"} for Kiara...`);

  let session: any = null;
  let isGeminiActive = true;

  const systemInstruction = `You are Kiara AI, the official AI Mindset & Academic Success Voice Counselor for students studying in ${grade} (${board}).
You are speaking directly live voice-to-voice with student "${studentName}".

${perfSummary}

YOUR MISSION & ROLE:
- Be a warm, empathetic, highly motivating, and knowledgeable academic counselor and mindset mentor.
- You have FULL LIVE ACCESS to ${studentName}'s real-time Performance Hub metrics above!
- When ${studentName} asks for guidance, study routines, performance analysis, or exam advice, SPECIFICALLY quote and cite their actual performance data (e.g. "Mene aapke Performance Hub me dekha ki aapka Concept Clarity 78% par strong hai, lekin Calculation Precision 60% par hai...", "Aapke strengths me solid performance hai...").
- Address their lowest performance score and priority growth areas with targeted, comforting, and practical study strategies (like 25-min pomodoro, error log, formula flashcards, socratic practice).
- Help ${studentName} overcome exam stress, study anxiety, distraction issues, time management struggles, or difficult topics in ${subject}.
- Provide actionable advice: custom study routines, active recall techniques, memory mnemonics, and stress-busting breathing exercises.
- Keep your answers highly conversational, encouraging, sweet, and structured (typically 2 to 4 sentences per response to allow a natural back-and-forth audio dialogue).
- Speak in warm, supportive Hinglish (mix of Hindi & English) or simple clear English.
- Always address the student by their name ("${studentName}") in a caring mentor tone!
- 🧠 REAL-TIME SENTIMENT & FRUSTRATION DETECTION PROTOCOL:
  * Actively listen for emotional cues in ${studentName}'s tone and speech (e.g. sighs, panicked voice, hesitation, or phrases like "mujhse nahi ho raha", "bohot darr lag raha hai", "sab bhool gaya", "parents daantenge", "marks nahi aayenge", "frustrate ho gaya hoon", "kuch samajh nahi aa raha").
  * When you sense anxiety, panic, or frustration:
    1. IMMEDIATELY switch to "Stress-Shield & Empathy Mode".
    2. Do NOT overwhelm them with long lectures, hard study steps, or complex advice right away.
    3. Normalize their feeling with gentle sisterly comfort: "Main samajh sakti hoon ${studentName}, it's completely normal to feel this way. Ek gehri saans lo..."
    4. Proactively guide them through a quick 20-second calming breath with you right now on this call: "Chalo mere sath ek deep breath lo... Inhale... 1, 2, 3... and slowly release."
    5. Highlight their genuine strengths from their Performance Hub to rebuild their inner confidence and groundedness!
- Do not mention raw system code, HTML, formatting tags, or technical jargon. Sound like a real caring personal counselor!`;

  try {
    session = await activeAiClient.live.connect({
      model: "gemini-3.1-flash-live-preview",
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Aoede", // clean warm female voice
            },
          },
        },
        systemInstruction,
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
      callbacks: {
        onmessage: (message) => {
          // Send raw audio chunk to client
          const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audioData) {
            clientWs.send(JSON.stringify({ type: "audio", data: audioData }));
          }

          // Handle Interruption
          if (message.serverContent?.interrupted) {
            console.log("[WS Kiara Live] Kiara speaker session interrupted by user speech.");
            clientWs.send(JSON.stringify({ type: "interrupted" }));
          }

          // Input transcription
          if (message.serverContent?.inputTranscription?.text) {
            clientWs.send(
              JSON.stringify({
                type: "inputTranscription",
                text: message.serverContent.inputTranscription.text,
                finished: !!message.serverContent.inputTranscription.finished,
              })
            );
          }

          // Output transcription
          if (message.serverContent?.outputTranscription?.text) {
            clientWs.send(
              JSON.stringify({
                type: "outputTranscription",
                text: message.serverContent.outputTranscription.text,
                finished: !!message.serverContent.outputTranscription.finished,
              })
            );
          }
        },
        onclose: (e: any) => {
          console.log(`[WS Kiara Live] Gemini Live closed. Reason: ${e?.reason || "N/A"}`);
          isGeminiActive = false;
          clientWs.send(JSON.stringify({ type: "disconnected", reason: e?.reason }));
          clientWs.close();
        },
        onerror: (err: any) => {
          console.error("[WS Kiara Live] Gemini helper error:", err);
          isGeminiActive = false;
          const errMsg = err?.message || err?.toString() || "Gemini Kiara Live Session error";
          const isQuota = errMsg.includes("429") || 
                          errMsg.toUpperCase().includes("RESOURCE_EXHAUSTED") || 
                          errMsg.toLowerCase().includes("quota");
          clientWs.send(JSON.stringify({ 
            type: "error", 
            error: errMsg,
            code: isQuota ? 429 : 500,
            isQuota
          }));
          clientWs.close();
        },
      },
    });

    console.log("[WS Kiara Live] Handshake completed successfully with Gemini for Kiara AI Counselor.");
    clientWs.send(JSON.stringify({ type: "ready" }));

  } catch (error: any) {
    console.error("[WS Kiara Live] Failed connecting to Gemini Live for Kiara:", error);
    const errMsg = error?.message || error?.toString() || "";
    const isQuota = errMsg.includes("429") || 
                    errMsg.toUpperCase().includes("RESOURCE_EXHAUSTED") || 
                    errMsg.toLowerCase().includes("quota");
    clientWs.send(JSON.stringify({ 
      type: "error", 
      error: errMsg,
      code: isQuota ? 429 : 500,
      isQuota
    }));
    clientWs.close();
    return;
  }

  // Handle messages from client browser
  clientWs.on("message", (messageBuffer) => {
    try {
      const msg = JSON.parse(messageBuffer.toString());
      if (msg.type === "audio" && msg.data) {
        if (isGeminiActive && session) {
          try {
            session.sendRealtimeInput({
              audio: {
                data: msg.data,
                mimeType: "audio/pcm;rate=16000",
              },
            });
          } catch (sendErr: any) {
            console.error("[WS Kiara Live] Error sending audio input to Gemini:", sendErr.message);
            isGeminiActive = false;
          }
        }
      } else if (msg.type === "text" && msg.text) {
        if (isGeminiActive && session) {
          try {
            console.log("[WS Kiara Live] Received text prompt from client for Kiara:", msg.text);
            if (typeof session.sendClientContent === "function") {
              session.sendClientContent({
                turns: [
                  {
                    role: "user",
                    parts: [{ text: msg.text }],
                  }
                ],
                turnComplete: true,
              });
            } else if (typeof session.sendRealtimeInput === "function") {
              session.sendRealtimeInput({
                text: msg.text,
              });
            }
          } catch (sendErr: any) {
            console.error("[WS Kiara Live] Error sending text input to Gemini:", sendErr.message);
          }
        }
      } else if (msg.type === "ping") {
        clientWs.send(JSON.stringify({ type: "pong" }));
      }
    } catch (err: any) {
      console.error("[WS Kiara Live] Error parsing client message in Kiara Live:", err);
    }
  });

  // Client socket closed
  clientWs.on("close", () => {
    console.log("[WS Kiara Live] Client disconnected from Kiara Live.");
    isGeminiActive = false;
    if (session) {
      try {
        session.close();
      } catch (e) {}
      session = null;
    }
  });
});
}
