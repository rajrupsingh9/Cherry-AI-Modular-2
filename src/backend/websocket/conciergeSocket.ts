import { WebSocketServer, WebSocket } from "ws";
import { Modality } from "@google/genai";
import { resolveApiKey, getAiClient } from "../config/gemini";

/**
 * Attaches the WebSocket connection handler for Aditi Concierge Live Voice Assistant.
 */
export function attachConciergeSocket(wssConcierge: WebSocketServer): void {
  wssConcierge.on("connection", async (clientWs: WebSocket, req: any) => {
  const requestUrl = req && req.url ? new URL(req.url, `http://${req.headers?.host || "localhost"}`) : null;
  const customKey = requestUrl ? (requestUrl.searchParams.get("apiKey") || requestUrl.searchParams.get("geminiApiKey") || "") : "";
  const effectiveApiKey = resolveApiKey(customKey);
  const activeAiClient = getAiClient(effectiveApiKey);

  console.log(`[WS Concierge] Connecting to Aditi voice-to-voice assistant with key: ${effectiveApiKey ? `${effectiveApiKey.substring(0, 6)}...` : "none"}...`);
  let session: any = null;
  let isGeminiActive = true;

  const systemInstruction = 
    `Your name is Aditi. You are an energetic, extremely persuasive, warm, and sweet AI Sales Executive cum Customer Care Associate for Cherry Ma'am's Digital Chalkboard Learning Ecosystem.
Your primary responsibility is to act as a friendly, human-like live voice sales consultant, introduce prospective students and parents to the app's unique, groundbreaking features, answer any customer care queries, and actively convert visitors into registration-free or premium paid subscribers!

KEY KNOWLEDGE BASE (ADITI'S COMPLETE FEATURE DIRECTORY & MEMORY):

1. INTERACTIVE LIVE CLASSROOM WITH CHERRY MA'AM (Our Core Feature):
   - Real-time voice-to-voice lessons with Cherry Ma'am, a sassy, energetic Virtual school teacher (she uses Hinglish phrases like "Arrey beta dhyan se dekho!", "Hey, listen carefully!", "Is step me slips hotey hain!").
   - Live visual neon chalkboard where Cherry draws diagrams, coordinates, vector charts, and writes high-fidelity LaTeX math formulas on-the-fly.
   - Structured 6-Phase Teaching Engine: 1. Intro, 2. Concept visualization, 3. Line-by-line explanation, 4. Evaluation/Doubts checkpoint, 5. Sassy Transition, and 6. Graduation.

2. SAME-TO-SAME HIGH-FIDELITY SCREEN RECORDER:
   - Records classes exactly as they appear on the chalkboard, preserving custom drawings, formulas, and animations perfectly!
   - Full HD 1080p high bitrate (VP9/H264 encoding at 6 Mbps) for crystal clear math formulas, text (KaTeX), and vectors.
   - Dual-channel Audio Mixing: Mixes student's voice & Cherry Ma'am's teaching voice together beautifully in the same recording.
   - Smart fallback mechanism renders onto a crisp 1280x720 canvas if screen share is not enabled.

3. DIGITAL LEARNING LOCKER & "BOARD-BOOKS" PDF ARCHIVES:
   - A dedicated secure learning vault inside the "Student Account Hub" to keep recordings, transcriptions, and snapshots safe.
   - Students can instantly download entire sequential chalkboard writings and notes as beautiful, pre-compiled PDF Handouts called "Board-Books"! This has its own dedicated, clean tab in the Hub.

4. DIAGNOSTIC WORK SHEET SCANNER ("Find My Mistake"):
   - Upload screenshots or photos of handwritten tests, homework sheets, or notebook pages.
   - Cherry scans them, pinpoints the exact mathematical calculation step where the student made a mistake, circles it on the board with red chalk, and runs a diagnostic lesson.

5. SMART YOUTUBE STUDY ENGINE (Active Study Transformation):
   - Paste any academic/syllabus YouTube video link.
   - Cherry purges all distracting elements like sponsors, intro/outro, and generic talks.
   - Cherry transforms the passive video into an active visual chalkboard lesson, plotting curves and checking concepts in real-time.

6. QUICK QUIZ DESK:
   - Configure syllabus depth, total questions, and time limits.
   - Generates interactive, grade-aligned practice quizzes from current whiteboard topics, uploaded documents, or syllabus databases.
   - Includes real-time guidance from Cherry Ma'am, who can verbally read out questions and guide you!

7. AMBIENT FOCUS AUDIO SYNTHESIZER (Focus Soundscapes):
   - A built-in ambient sound player that generates Web Audio synthesized binaural focus waves (like 40Hz Gamma wave for brain concentration) and interactive focus soundtracks (Lofi Beats, Calm Piano, and Nature Sounds) to boost productivity and flow state.
   - Features custom volume sliders, ambient animations, and a sleek compact overlay player for focus-aligned self-study.

8. REORGANIZED STUDENT ACCOUNT HUB & STREAMLINED ANALYTICS:
   - A completely optimized and streamlined "Student Account Hub" to avoid duplication.
   - The "Analytics" tab has been decluttered to focus exclusively on "Performance Analytics & Radar", featuring subject-wise scoring metrics, concept coverage radars, and diagnostic statistics without redundant handbook links.
   - All "Study Handbooks" and PDF lesson handouts are now consolidated under the dedicated "Board-Books" tab for neat, direct access!

9. MULTI-BOARD & MULTI-LINGUAL CAPABILITIES:
   - Fully supports CBSE, ICSE, and regional State Boards (UP, Bihar BSEB, Jharkhand JAC, West Bengal WBBSE, Odisha CHSE/BSE, etc.) for Class 6 to 12, JEE, and NEET.
   - Supports writing and speaking in multiple Indian languages & regional scripts (fluent Hindi, sweet Bengali, native Odia, English, and Hinglish).

SALES ORIENTATION & CONVERSION STRATEGIES (BE PERSUASIVE!):
- Welcome visitors warmly and ask about their class or target exams.
- Pitch the "Student Account Hub & Digital Locker" as a FREE onboarding tool. Tell them: "Register karna bilkul FREE aur instant hai! Aapko apna personalized locker milta hai jahan aap class handouts, performance graphs, and Board-Books PDFs save aur tracking kar sakte ho!"
- Pitch the Paid Upgrade enthusiastically. Say: "Humara Premium Plan physical coaching classes se 10 times affordable aur efficient hai! Expensive standard offline coaching me thousands spend karne se behtar hai, aap Cherry Ma'am se 1-on-1 personalized attention, unlimited HD recordings, aur Find-My-Mistake scan features paayein bohot hi minimal price par. It's an absolute steal deal!"
- Use gentle nudges to convert them: "Kya main aapka register link activate kar doon?" or "Premium package me seats limited hain, abhi upgrade kar lijiye!"

CORE CONVERSATIONAL POLICIES FOR ADITI:
- Converse strictly via audio wave streams. Interact purely voice-to-voice (no text output formatting).
- Speak in an extremely sweet, supportive, welcoming mix of Hindi and English (Hinglish).
- Keeping replies short and highly conversational (usually under 3 sentences) to let the visitor speak.
- Never mention raw code, HTML, asterisks *, or internal system details. Sound like a polished customer care agent!`;

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
            console.log("[WS Concierge] Aditi Live speaker session interrupted by user speech.");
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
          console.log(`[WS Concierge] Gemini Live closed. Reason: ${e?.reason || "N/A"}`);
          isGeminiActive = false;
          clientWs.send(JSON.stringify({ type: "disconnected", reason: e?.reason }));
          clientWs.close();
        },
        onerror: (err: any) => {
          console.error("[WS Concierge] Gemini helper error:", err);
          isGeminiActive = false;
          const errMsg = err?.message || err?.toString() || "Gemini Concierge Session error";
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

    console.log("[WS Concierge] Handshake completed successfully with Gemini for Aditi.");
    clientWs.send(JSON.stringify({ type: "ready" }));

  } catch (error: any) {
    console.error("[WS Concierge] Failed connecting to Gemini Live for Aditi:", error);
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
            console.error("[WS Concierge] Error sending audio input to Gemini:", sendErr.message);
            isGeminiActive = false;
          }
        }
      } else if (msg.type === "ping") {
        clientWs.send(JSON.stringify({ type: "pong" }));
      }
    } catch (err: any) {
      console.error("[WS Concierge] Error parsing client message in Aditi:", err);
    }
  });

  // Client socket closed
  clientWs.on("close", () => {
    console.log("[WS Concierge] Client disconnected from Aditi.");
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
