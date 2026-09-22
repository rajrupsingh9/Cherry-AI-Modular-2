/**
 * toolCallDispatcher.ts
 * Dispatches client-side function calls requested by Cherry Gemini Live.
 */

import type { MutableRefObject } from "react";
import { ThemeType } from "../../types";

export interface ToolCallDispatcherCallbacks {
  onThemeChange: (theme: ThemeType) => void;
  onToast: (message: string, type: "info" | "success" | "error") => void;
  nextTopicRef: MutableRefObject<(() => void) | undefined>;
  classCompleteRef: MutableRefObject<(() => void) | undefined>;
  updateWhiteboardRef: MutableRefObject<((content: string, append: boolean) => void) | undefined>;
  onTeachingPhaseChange?: (phase: string) => void;
  setTeachingPhase: (phase: string) => void;
  teachingPhaseRef: MutableRefObject<string>;
  lastActiveTopicIndexRef: MutableRefObject<number | undefined>;
  activeTopicIndex?: number;
  wsRef: MutableRefObject<WebSocket | null>;
}

export function dispatchToolCalls(
  toolCall: { functionCalls?: Array<{ name: string; args: any; id: string }> },
  callbacks: ToolCallDispatcherCallbacks
): void {
  if (!toolCall || !toolCall.functionCalls) return;

  for (const fc of toolCall.functionCalls) {
    const { name, args, id } = fc;
    console.log("[Client Hook] Executing Cherry action:", name, args);

    let toolResult: any = { success: true };

    if (name === "openWebsite") {
      try {
        let targetUrl = args.url;
        if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
          targetUrl = "https://" + targetUrl;
        }
        window.open(targetUrl, "_blank");
        callbacks.onToast(`Launching ${args.name || "requested page"}! 🚀`, "success");
        toolResult = { success: true, status: "opened", url: targetUrl };
      } catch (err: any) {
        console.error("openWebsite failed:", err);
        toolResult = { success: false, error: err.message };
        callbacks.onToast("Darn, I couldn't open that tab! Check permissions.", "error");
      }
    } else if (name === "changeTheme") {
      try {
        callbacks.onThemeChange(args.theme);
        callbacks.onToast(`Changed style dashboard to '${args.theme}'! 🎨`, "info");
        toolResult = { success: true, theme: args.theme };
      } catch (err: any) {
        toolResult = { success: false, error: err.message };
      }
    } else if (name === "moveToNextTopic") {
      try {
        if (callbacks.nextTopicRef.current) {
          callbacks.nextTopicRef.current();
          toolResult = { success: true, message: "Successfully transitioned the classroom slide to next topic." };
        } else {
          console.warn("[Client Hook] onNextTopic callback is not registered.");
          toolResult = { success: false, error: "onNextTopic callback not registered on front-end" };
        }
      } catch (err: any) {
        console.error("[Client Hook] moveToNextTopic trigger failed:", err);
        toolResult = { success: false, error: err.message };
      }
    } else if (name === "classIsComplete") {
      try {
        if (callbacks.classCompleteRef.current) {
          callbacks.classCompleteRef.current();
          toolResult = { success: true, message: "Class graduation sequence completed successfully." };
        } else {
          console.warn("[Client Hook] onClassComplete callback is not registered.");
          toolResult = { success: false, error: "onClassComplete callback not registered on front-end" };
        }
      } catch (err: any) {
        console.error("[Client Hook] classIsComplete trigger failed:", err);
        toolResult = { success: false, error: err.message };
      }
    } else if (name === "setTeachingState") {
      try {
        let phase = (args.phase || "intro").toLowerCase();
        if (phase === "explaining" || phase === "explanation" || phase === "explain" || phase === "explanating") {
          phase = "example";
        }
        const curPhase = (callbacks.teachingPhaseRef.current || "intro").toLowerCase();
        
        const validPhases = ["intro", "concept", "example", "doubt", "transition", "complete"];
        const isValid = validPhases.includes(phase);

        let sequenceValid = true;
        let expectedNext = "";
        
        const topicChanged = callbacks.activeTopicIndex !== undefined && callbacks.lastActiveTopicIndexRef.current !== callbacks.activeTopicIndex;
        if (topicChanged) {
          callbacks.lastActiveTopicIndexRef.current = callbacks.activeTopicIndex;
        }

        if (isValid && curPhase !== phase) {
          const nextMap: Record<string, string[]> = {
            intro: ["concept", "intro"],
            concept: ["example", "intro"],
            example: ["doubt", "concept", "intro"],
            doubt: ["transition", "complete", "intro"],
            transition: ["intro", "complete"],
            complete: ["intro", "concept", "example", "doubt", "transition", "complete"]
          };
          
          const allowedNext = [...(nextMap[curPhase] || [])];
          if (topicChanged) {
            allowedNext.push("intro", "concept");
          }

          if (!allowedNext.includes(phase)) {
            sequenceValid = false;
            expectedNext = allowedNext.join(" or ");
          }
        }

        if (!isValid) {
          const errorMsg = `Invalid teaching state: '${phase}'. Allowed phases are: intro, concept, example, doubt, transition, complete.`;
          console.warn("[Client Hook]", errorMsg);
          toolResult = { success: false, error: errorMsg };
        } else if (!sequenceValid) {
          const errorMsg = `Sequence violation! You cannot transit directly from '${curPhase}' to '${phase}'. You MUST follow the absolute sequential workflow: intro -> concept -> example -> doubt -> transition -> intro. Your current state is '${curPhase}', so your NEXT transition MUST be setTeachingState with phase='${expectedNext}'. Please call setTeachingState for the correct next phase!`;
          console.warn("[Client Hook]", errorMsg);
          toolResult = { success: false, error: errorMsg };
        } else {
          console.log(`[Client Hook] Phase transition: ${curPhase} -> ${phase}`);
          callbacks.setTeachingPhase(phase);
          callbacks.teachingPhaseRef.current = phase;
          if (callbacks.onTeachingPhaseChange) {
            callbacks.onTeachingPhaseChange(phase);
          }
          toolResult = { success: true, phase };
        }
      } catch (err: any) {
        console.error("[Client Hook] setTeachingState trigger failed:", err);
        toolResult = { success: false, error: err.message };
      }
    } else if (name === "updateWhiteboard") {
      try {
        const content = args.content || "";
        const append = !!args.append;
        if (callbacks.updateWhiteboardRef.current) {
          callbacks.updateWhiteboardRef.current(content, append);
          toolResult = { success: true, message: "Whiteboard updated successfully" };
        } else {
          console.warn("[Client Hook] onUpdateWhiteboard callback not registered.");
          toolResult = { success: false, error: "onUpdateWhiteboard callback not registered" };
        }
      } catch (err: any) {
        console.error("[Client Hook] updateWhiteboard trigger failed:", err);
        toolResult = { success: false, error: err.message };
      }
    }

    // Immediately post response back to socket
    if (callbacks.wsRef.current && callbacks.wsRef.current.readyState === WebSocket.OPEN) {
      callbacks.wsRef.current.send(
        JSON.stringify({
          type: "toolResponse",
          id,
          name,
          response: toolResult,
        })
      );
    }
  }
}
