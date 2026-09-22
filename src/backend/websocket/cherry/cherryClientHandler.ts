import { WebSocket, RawData } from "ws";
import { sliceMarkdownToTopics } from "../../state/sessionStore";

export interface ClientHandlerContext {
  clientWs: WebSocket;
  session: any;
  isGeminiActive: () => boolean;
  setGeminiActive: (active: boolean) => void;
  activeSessionBackup: any;
  activeDocument: any;
}

export function handleCherryClientMessage(
  messageBuffer: RawData,
  ctx: ClientHandlerContext
): void {
  const { clientWs, session, isGeminiActive, setGeminiActive, activeSessionBackup, activeDocument } = ctx;

  try {
    const msg = JSON.parse(messageBuffer.toString());

    if (msg.type === "audio" && msg.data) {
      if (isGeminiActive() && session) {
        try {
          session.sendRealtimeInput({
            audio: {
              data: msg.data,
              mimeType: "audio/pcm;rate=16000",
            },
          });
        } catch (sendErr: any) {
          console.error("[WS Server] Error sending audio input to Gemini:", sendErr.message);
          setGeminiActive(false);
          try {
            session.close();
          } catch (e) {}
        }
      }
    } else if (msg.type === "toolResponse" && msg.id && msg.name) {
      console.log("[WS Server] Client acknowledged tool execution:", msg.name, msg.id);
    } else if (msg.type === "injectPrompt" && msg.text) {
      console.log("[WS Server] Injecting client text prompt to Gemini:", msg.text);
      if (isGeminiActive() && session) {
        try {
          session.sendClientContent({
            turns: [
              {
                role: "user",
                parts: [{ text: msg.text }],
              },
            ],
            turnComplete: true,
          });
        } catch (error: any) {
          console.error("[WS Server] Failed to inject prompt text:", error);
        }
      }
    } else if (msg.type === "syncActiveTopic" && typeof msg.activeTopicIndex === "number") {
      console.log("[WS Server] Synced active topic index from client:", msg.activeTopicIndex);
      activeSessionBackup.activeTopicIndex = msg.activeTopicIndex;
      if (activeDocument && isGeminiActive() && session) {
        try {
          const chunkList = sliceMarkdownToTopics(activeDocument.markdown);
          session.sendClientContent({
            turns: [
              {
                role: "user",
                parts: [
                  {
                    text: `[SYSTEM MESSAGE]: Active topic segment synchronized to Part ${activeSessionBackup.activeTopicIndex + 1} of ${chunkList.length}.`,
                  },
                ],
                turnComplete: true,
              },
            ],
          });
        } catch (err) {
          console.error("[WS Server] Error pushing syncActiveTopic update to Gemini Live:", err);
        }
      }
    } else if (msg.type === "ping") {
      clientWs.send(JSON.stringify({ type: "pong" }));
    }
  } catch (err: any) {
    console.error("[WS Server] Error processing client message:", err);
  }
}
