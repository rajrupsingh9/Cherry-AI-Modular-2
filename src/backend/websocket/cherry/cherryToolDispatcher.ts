import { WebSocket } from "ws";
import {
  sliceMarkdownToTopics,
  generateSourceContentBlock,
} from "../../state/sessionStore";
import { smartMergeWhiteboardNotes, cleanTopicHeader } from "../../../utils/boardFilter";

export interface ToolDispatcherContext {
  clientWs: WebSocket;
  session: any;
  isGeminiActive: boolean;
  activeSessionBackup: any;
  activeDocument: any;
  currentSessionHistory: { sender: string; text: string }[];
}

export function handleCherryToolCalls(message: any, ctx: ToolDispatcherContext): void {
  const { clientWs, session, isGeminiActive, activeSessionBackup, activeDocument, currentSessionHistory } = ctx;

  if (!message.toolCall || !message.toolCall.functionCalls) return;

  console.log("[WS Server] Tool call from Gemini received:", message.toolCall);
  const functionResponses: any[] = [];
  const hasUpdateWhiteboardInBatch = message.toolCall.functionCalls.some(
    (fc: any) => fc.name === "updateWhiteboard"
  );

  for (const fc of message.toolCall.functionCalls) {
    const { name, args, id } = fc;

    if (name === "setTeachingState") {
      const phaseVal = args?.phase;
      let finalPhase = "intro";
      if (typeof phaseVal === "string") {
        let proposed = phaseVal.toLowerCase().trim();
        if (["explaining", "explanation", "explain", "explanating", "examples"].includes(proposed)) {
          proposed = "example";
        } else if (["concepts", "concept_decoding", "theory"].includes(proposed)) {
          proposed = "concept";
        } else if (["doubts", "doubt_solving", "practice", "qa", "questions"].includes(proposed)) {
          proposed = "doubt";
        } else if (["transitions", "summary", "conclusion", "next_topic"].includes(proposed)) {
          proposed = "transition";
        } else if (["intros", "introduction", "hook"].includes(proposed)) {
          proposed = "intro";
        } else if (["completed", "finish", "finished", "graduation"].includes(proposed)) {
          proposed = "complete";
        }
        const validPhases = ["intro", "concept", "example", "doubt", "transition", "complete"];
        if (validPhases.includes(proposed)) {
          finalPhase = proposed;
          activeSessionBackup.teachingPhase = proposed;
          console.log("[WS Server] Intercepted valid setTeachingState. Saved phase to backup:", activeSessionBackup.teachingPhase);
        }
      }

      // Phase 2 ('concept' / 'example') MANDATORY CHALKBOARD TOPIC GUARD
      if (finalPhase === "concept" || finalPhase === "example") {
        const currentNotes = activeSessionBackup.whiteboardNotes || "";
        const currentIdx = typeof activeSessionBackup.activeTopicIndex === "number" ? activeSessionBackup.activeTopicIndex : 0;

        let sourceBlock = "";
        if (activeDocument && activeDocument.markdown && activeDocument.mode !== "open_board") {
          const chunkList = sliceMarkdownToTopics(activeDocument.markdown);
          const topicText = chunkList[currentIdx] || activeDocument.markdown;
          sourceBlock = generateSourceContentBlock(topicText, currentIdx);
        }

        const hasSufficientNotes = currentNotes.trim().length > 40 && !currentNotes.includes("### ❓ PREDICTION POLL");

        if (!hasSufficientNotes && !hasUpdateWhiteboardInBatch && sourceBlock) {
          activeSessionBackup.whiteboardNotes = sourceBlock;
          console.log(`[WS Server] Auto-injected clean topic notes for Part ${currentIdx + 1} in Phase 2 concept phase!`);

          clientWs.send(
            JSON.stringify({
              type: "toolCall",
              toolCall: {
                functionCalls: [
                  {
                    id: `auto_source_${Date.now()}`,
                    name: "updateWhiteboard",
                    args: {
                      content: activeSessionBackup.whiteboardNotes,
                      append: false,
                    },
                  },
                ],
              },
            })
          );
        }
      }

      functionResponses.push({
        id,
        name,
        response: {
          success: true,
          phase: args?.phase,
          whiteboardNotes: activeSessionBackup.whiteboardNotes,
          instruction:
            finalPhase === "concept" || finalPhase === "example"
              ? "Phase set to concept/example. Line-by-line decode on chalkboard followed by real-world intuitive examples and KaTeX formulas."
              : undefined,
        },
      });
    } else if (name === "updateWhiteboard") {
      const contentVal = args?.content;
      const appendVal = args?.append;
      if (typeof contentVal === "string" && contentVal.trim().length > 0) {
        const prevNotes = activeSessionBackup.whiteboardNotes || "";
        activeSessionBackup.whiteboardNotes = smartMergeWhiteboardNotes(prevNotes, contentVal, !!appendVal);
        console.log("[WS Server] Intercepted updateWhiteboard with smartMerge. Length:", activeSessionBackup.whiteboardNotes.length);
      }
      functionResponses.push({ id, name, response: { success: true, message: "Whiteboard updated successfully" } });
    } else if (name === "moveToNextTopic") {
      if (activeDocument) {
        const chunkList = sliceMarkdownToTopics(activeDocument.markdown);
        const maxIdx = chunkList.length - 1;
        const currentIdx = typeof activeSessionBackup.activeTopicIndex === "number" ? activeSessionBackup.activeTopicIndex : 0;
        if (currentIdx < maxIdx) {
          const nextTopicIdx = currentIdx + 1;
          activeSessionBackup.activeTopicIndex = nextTopicIdx;
          activeSessionBackup.teachingPhase = "intro";
          activeSessionBackup.whiteboardNotes = "";

          clientWs.send(
            JSON.stringify({
              type: "toolCall",
              toolCall: {
                functionCalls: [
                  {
                    id: `auto_next_topic_${Date.now()}`,
                    name: "moveToNextTopic",
                    args: { topicIndex: nextTopicIdx },
                  },
                  {
                    id: `auto_phase_intro_${Date.now()}`,
                    name: "setTeachingState",
                    args: { phase: "intro" },
                  },
                ],
              },
            })
          );

          const nextTopicContent = chunkList[nextTopicIdx] || "";
          const nextTopicTitle = cleanTopicHeader(nextTopicContent, activeDocument.detectedSubject || "Topic", nextTopicIdx);

          functionResponses.push({
            id,
            name,
            response: {
              success: true,
              activeTopicIndex: nextTopicIdx,
              partNumber: nextTopicIdx + 1,
              totalParts: chunkList.length,
              activeTopicTitle: nextTopicTitle,
              activeTopicSourceContent: nextTopicContent,
              instruction: `Transitioned to Part ${nextTopicIdx + 1} of ${chunkList.length} ("${nextTopicTitle}"). Begin Phase 1 ('intro') with curiosity story and prediction poll!`,
            },
          });
        } else {
          functionResponses.push({
            id,
            name,
            response: {
              success: false,
              message: "All syllabus topics completed. Call classIsComplete() to conclude.",
            },
          });
        }
      } else {
        functionResponses.push({ id, name, response: { success: true, message: "Transitioned to next topic", nextPhase: "intro" } });
      }
    } else if (name === "getWhiteboardContent") {
      const activeWhiteboardNotes = activeSessionBackup.whiteboardNotes || "No notes written on the blackboard yet.";
      const conversationTranscript = currentSessionHistory
        .map((h) => `${h.sender === "cherry" ? "Cherry Ma'am" : "Student"}: ${h.text}`)
        .join("\n");

      const responseText = `[ACTIVE BLACKBOARD CONTENT]:\n${activeWhiteboardNotes}\n\n[CONVERSATION TRANSCRIPT]:\n${conversationTranscript || "No conversation started yet."}`;
      functionResponses.push({ id, name, response: { success: true, whiteboardContent: responseText } });
    } else {
      functionResponses.push({ id, name, response: { success: true } });
    }
  }

  // Send instant tool response to Gemini
  if (session && isGeminiActive && functionResponses.length > 0) {
    try {
      session.sendToolResponse({ functionResponses });
      console.log("[WS Server] Sent instant tool response to Gemini Live for:", functionResponses.map((f) => f.name).join(", "));
    } catch (err) {
      console.error("[WS Server] Error sending instant tool response to Gemini:", err);
    }
  }

  // Relay toolCall to client browser for real-time UI execution
  clientWs.send(JSON.stringify({ type: "toolCall", toolCall: message.toolCall }));
}
