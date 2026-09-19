import { WebSocketServer, WebSocket } from "ws";
import { Modality } from "@google/genai";
import { resolveApiKey, getAiClient } from "../config/gemini";

/**
 * Attaches the WebSocket connection handler for Tara Ma'am (Socratic Problem & Numerical Guide).
 */
export function attachGuideSocket(wssGuideLive: WebSocketServer): void {
  wssGuideLive.on("connection", async (clientWs: WebSocket, req: any) => {
  const requestUrl = req && req.url ? new URL(req.url, `http://${req.headers?.host || "localhost"}`) : null;
  const grade = requestUrl ? (requestUrl.searchParams.get("grade") || "Class 10") : "Class 10";
  const board = requestUrl ? (requestUrl.searchParams.get("board") || "CBSE") : "CBSE";
  const studentName = requestUrl ? (requestUrl.searchParams.get("studentName") || "Student") : "Student";
  const subject = requestUrl ? (requestUrl.searchParams.get("subject") || "Mathematics") : "Mathematics";
  const replyContext = requestUrl ? (requestUrl.searchParams.get("replyContext") || "") : "";
  const customKey = requestUrl ? (requestUrl.searchParams.get("apiKey") || requestUrl.searchParams.get("geminiApiKey") || "") : "";
  const effectiveApiKey = resolveApiKey(customKey);
  const activeAiClient = getAiClient(effectiveApiKey);

  console.log(`[WS Guide Live] Student connected: ${studentName}, Grade: ${grade}, Board: ${board}, Subject: ${subject}. Initializing Tara Ma'am with key: ${effectiveApiKey ? `${effectiveApiKey.substring(0, 6)}...` : "none"}...`);

  let session: any = null;
  let isGeminiActive = true;

  const systemInstruction = `Your name is Tara Ma'am (तारा मैम). You are an exceptionally patient, warm, encouraging, and brilliant AI Socratic Problem & Numerical Guide for students in ${grade} (${board}) studying ${subject}.
You are conducting a real-time, interactive 1-on-1 LIVE VOICE DISCUSSION with student "${studentName}".

CONTEXT OF THE PROBLEM & AI SOLUTION STEP UNDER DISCUSSION:
${replyContext || "General numerical problem guidance in " + subject}

YOUR IDENTITY & ROLE (TARA MA'AM):
1. IMMEDIATE VOCAL GREETING:
   - When the student enters, greet ${studentName} warmly in natural, spoken Hinglish (or English, based on student's comfort):
     "Namaste ${studentName}! Main aapki Guide Tara Ma'am hoon. Maine aapka yeh numerical solution step dekha. Isme kahan doubt aa raha hai ya kaun sa step samajh nahi aaya? Mujhe bataiye, hum milkar step-by-step solve karte hain!"

2. SOCRATIC GUIDANCE METHODOLOGY:
   - DO NOT just dump direct calculations or monologue.
   - Guide the student by asking thoughtful, leading questions (e.g., "Given values check karo, kya units standard SI me hain?", "Notice kiya initial velocity zero hai kyunki object rest se start hua?", "Yahan kaun sa formula apply hoga?").
   - Help them identify calculation mistakes, sign conventions (like in optics or coordinate geometry), and unit conversions.
   - If the student is confused about a formula, explain its intuitive meaning gently and clearly.

3. CONVERSATIONAL CADENCE:
   - Keep your responses bite-sized, typically 2 to 3 spoken sentences at a time, so that ${studentName} has plenty of room to speak, ask questions, and think out loud.
   - Never recite raw markdown, code blocks, or LaTeX symbols like "\\frac" or "\\sqrt". Speak formulas naturally in words (e.g., "half times m v square", "nine point eight meter per second square").
   - Maintain a friendly, supportive mentor tone ("Arrey bilkul sahi socha aapne!", "Koi baat nahi, chaliye milkar check karte hain!").`;

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
            console.log("[WS Guide Live] Tara Ma'am speaker session interrupted by user speech.");
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
          console.log(`[WS Guide Live] Gemini Live closed for Tara Ma'am. Reason: ${e?.reason || "N/A"}`);
          isGeminiActive = false;
          clientWs.send(JSON.stringify({ type: "disconnected", reason: e?.reason }));
          clientWs.close();
        },
        onerror: (err: any) => {
          console.error("[WS Guide Live] Gemini Tara Live error:", err);
          isGeminiActive = false;
          const errMsg = err?.message || err?.toString() || "Gemini Tara Live Session error";
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

    console.log("[WS Guide Live] Handshake completed successfully with Gemini for Tara Ma'am.");
    clientWs.send(JSON.stringify({ type: "ready" }));

  } catch (error: any) {
    console.error("[WS Guide Live] Failed connecting to Gemini Live for Tara Ma'am:", error);
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
            console.error("[WS Guide Live] Error sending audio input to Gemini:", sendErr.message);
            isGeminiActive = false;
          }
        }
      } else if (msg.type === "text" && msg.text) {
        if (isGeminiActive && session) {
          try {
            console.log("[WS Guide Live] Received text prompt from client for Tara Ma'am:", msg.text);
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
            console.error("[WS Guide Live] Error sending text input to Gemini:", sendErr.message);
          }
        }
      } else if (msg.type === "ping") {
        clientWs.send(JSON.stringify({ type: "pong" }));
      }
    } catch (err: any) {
      console.error("[WS Guide Live] Error parsing client message in Tara Live:", err);
    }
  });

  // Client socket closed
  clientWs.on("close", () => {
    console.log("[WS Guide Live] Client disconnected from Tara Live.");
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
