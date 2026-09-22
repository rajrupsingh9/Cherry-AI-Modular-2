import { WebSocketServer, WebSocket } from "ws";
import { Modality } from "@google/genai";
import { resolveApiKey, getAiClient } from "../config/gemini";
import { getOrCreateSession } from "../state/sessionStore";
import { buildCherrySystemInstruction } from "./cherry/cherryPrompts";
import { cherryToolDeclarations } from "./cherry/cherryTools";
import { handleCherryToolCalls } from "./cherry/cherryToolDispatcher";
import { handleCherryClientMessage } from "./cherry/cherryClientHandler";

/**
 * Attaches the WebSocket connection handler for Cherry Ma'am Live Socratic Classroom.
 */
export function attachCherrySocket(wss: WebSocketServer): void {
  wss.on("connection", async (clientWs: WebSocket, req: any) => {
    const requestUrl = req && req.url ? new URL(req.url, `http://${req.headers?.host || "localhost"}`) : null;
    const grade = requestUrl ? requestUrl.searchParams.get("grade") || "Class 10" : "Class 10";
    const board = requestUrl ? requestUrl.searchParams.get("board") || "CBSE" : "CBSE";
    const mediumOfLearning = requestUrl ? requestUrl.searchParams.get("mediumOfLearning") || "Hinglish" : "Hinglish";
    const studentName = requestUrl ? requestUrl.searchParams.get("studentName") || "" : "";
    const rawSubject = requestUrl ? requestUrl.searchParams.get("subject") || "Mathematics" : "Mathematics";
    const sessionId = requestUrl ? requestUrl.searchParams.get("sessionId") : null;
    const customKey = requestUrl ? requestUrl.searchParams.get("apiKey") || requestUrl.searchParams.get("geminiApiKey") || "" : "";
    const effectiveApiKey = resolveApiKey(customKey);
    const activeAiClient = getAiClient(effectiveApiKey);

    const sessionState = getOrCreateSession(sessionId);
    const activeDocument = sessionState.activeDocument;
    const activeSessionBackup = sessionState.activeSessionBackup;

    const activeTopicIndexStr = requestUrl ? requestUrl.searchParams.get("activeTopicIndex") : null;
    const initialActiveIdx = activeTopicIndexStr ? parseInt(activeTopicIndexStr, 10) : 0;
    if (!activeSessionBackup.history || activeSessionBackup.history.length === 0) {
      activeSessionBackup.activeTopicIndex = isNaN(initialActiveIdx) ? 0 : initialActiveIdx;
    }

    const subject = activeDocument && activeDocument.detectedSubject ? activeDocument.detectedSubject : rawSubject;
    console.log(`[WS Server] Cherry connected for ${studentName || "Guest"}, Subject: ${subject}`);

    let session: any = null;
    let isGeminiActive = true;

    const currentSessionHistory: Array<{ sender: "student" | "cherry"; text: string }> = [...activeSessionBackup.history];
    let currentCherrySpeechAccumulating = "";
    let currentStudentSpeechAccumulating = "";

    const baseInstruction = buildCherrySystemInstruction({
      grade,
      board,
      mediumOfLearning,
      studentName,
      subject,
      activeDocument,
      activeSessionBackup,
    });

    try {
      session = await activeAiClient.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Aoede",
              },
            },
          },
          systemInstruction: baseInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [{ functionDeclarations: cherryToolDeclarations as any }],
        },
        callbacks: {
          onmessage: (message) => {
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              clientWs.send(JSON.stringify({ type: "audio", data: audioData }));
            }

            if (message.serverContent?.interrupted) {
              console.log("[WS Server] Gemini Live session interrupted by user input.");
              if (currentCherrySpeechAccumulating.trim()) {
                currentSessionHistory.push({ sender: "cherry", text: currentCherrySpeechAccumulating + " (Interrupted)" });
                currentCherrySpeechAccumulating = "";
                activeSessionBackup.history = [...currentSessionHistory];
              }
              clientWs.send(JSON.stringify({ type: "interrupted" }));
            }

            if (message.toolCall && message.toolCall.functionCalls) {
              handleCherryToolCalls(message, {
                clientWs,
                session,
                isGeminiActive,
                activeSessionBackup,
                activeDocument,
                currentSessionHistory,
              });
            }

            if (message.serverContent?.inputTranscription?.text) {
              const txt = message.serverContent.inputTranscription.text;
              const finished = !!message.serverContent.inputTranscription.finished;
              currentStudentSpeechAccumulating += txt;
              if (finished) {
                currentSessionHistory.push({ sender: "student", text: currentStudentSpeechAccumulating });
                currentStudentSpeechAccumulating = "";
                activeSessionBackup.history = [...currentSessionHistory];
              }
              clientWs.send(JSON.stringify({ type: "inputTranscription", text: txt, finished }));
            }

            if (message.serverContent?.outputTranscription?.text) {
              const txt = message.serverContent.outputTranscription.text;
              const finished = !!message.serverContent.outputTranscription.finished;
              currentCherrySpeechAccumulating += txt;
              if (finished) {
                currentSessionHistory.push({ sender: "cherry", text: currentCherrySpeechAccumulating });
                currentCherrySpeechAccumulating = "";
                activeSessionBackup.history = [...currentSessionHistory];
              }
              clientWs.send(JSON.stringify({ type: "outputTranscription", text: txt, finished }));
            }
          },
          onclose: (e: any) => {
            console.log(`[WS Server] Gemini Live WebSocket closed. Code: ${e?.code || "N/A"}`);
            isGeminiActive = false;
            clientWs.send(JSON.stringify({ type: "disconnected", reason: e?.reason || "closed" }));
            clientWs.close();
            if (session) {
              try {
                session.close();
              } catch (err) {}
              session = null;
            }
          },
          onerror: (err: any) => {
            console.error("[WS Server] Gemini session error:", err);
            isGeminiActive = false;
            const errMsg = err?.message || err?.toString() || "Gemini Live Session error";
            const isQuota = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota");
            try {
              clientWs.send(JSON.stringify({ type: "error", error: errMsg, code: isQuota ? 429 : 500, isQuota }));
            } catch (e) {}
            if (session) {
              try {
                session.close();
              } catch (e) {}
              session = null;
            }
          },
        },
      });

      console.log("[WS Server] Connected to Gemini bidi Socket successfully!");
      clientWs.send(JSON.stringify({ type: "ready" }));

      if (activeSessionBackup.history.length > 0) {
        clientWs.send(
          JSON.stringify({
            type: "restoreState",
            teachingPhase: activeSessionBackup.teachingPhase,
            whiteboardNotes: activeSessionBackup.whiteboardNotes,
          })
        );
      }
    } catch (error: any) {
      console.error("[WS Server] Failed connecting to Gemini Live:", error);
      const errMsg = error?.message || error?.toString() || "";
      const isQuota = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota");
      try {
        clientWs.send(JSON.stringify({ type: "error", error: "Failed to connect: " + errMsg, code: isQuota ? 429 : 500, isQuota }));
      } catch (e) {}
      return;
    }

    clientWs.on("message", (messageBuffer) => {
      handleCherryClientMessage(messageBuffer, {
        clientWs,
        session,
        isGeminiActive: () => isGeminiActive,
        setGeminiActive: (active: boolean) => {
          isGeminiActive = active;
        },
        activeSessionBackup,
        activeDocument,
      });
    });

    clientWs.on("close", () => {
      console.log("[WS Server] Client disconnected from session.");
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
