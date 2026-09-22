import { useState, useRef, useEffect, useMemo, type FormEvent } from "react";

interface UseClassroomPromptsProps {
  state: string;
  teachingPhase: string;
  userVolume: number;
  userTranscript: { text?: string };
  cherryTranscript: { text?: string; id?: string };
  injectPromptText: (text: string) => void;
  addToast: (message: string, type: "info" | "success" | "error") => void;
}

export function useClassroomPrompts({
  state,
  teachingPhase,
  userVolume,
  userTranscript,
  cherryTranscript,
  injectPromptText,
  addToast,
}: UseClassroomPromptsProps) {
  // Dialogue History state
  const [dialogueHistory, setDialogueHistory] = useState<Array<{ id: string; sender: "user" | "cherry"; text: string }>>([]);
  const [typedInput, setTypedInput] = useState("");

  // ASR Live Dialogue Sync Logic
  useEffect(() => {
    if (cherryTranscript.text && cherryTranscript.text.trim() && cherryTranscript.id) {
      setDialogueHistory((prev) => {
        const index = prev.findIndex((item) => item.id === cherryTranscript.id);
        if (index !== -1) {
          const next = [...prev];
          next[index] = { ...next[index], text: cherryTranscript.text! };
          return next;
        } else {
          return [
            ...prev,
            { id: cherryTranscript.id!, sender: "cherry", text: cherryTranscript.text! },
          ];
        }
      });
    }
  }, [cherryTranscript.text, cherryTranscript.id]);

  // Client-side VAD Silence Detection Effect for Phase 4 (Doubt / Q&A)
  const hasTriggeredSilenceProbeRef = useRef(false);
  useEffect(() => {
    if (teachingPhase !== "doubt" || state !== "listening") {
      hasTriggeredSilenceProbeRef.current = false;
      return;
    }

    if (userVolume > 0.08) {
      hasTriggeredSilenceProbeRef.current = false;
      return;
    }

    if (hasTriggeredSilenceProbeRef.current) return;

    const timer = setTimeout(() => {
      if (
        teachingPhase === "doubt" &&
        state === "listening" &&
        !hasTriggeredSilenceProbeRef.current &&
        userVolume < 0.08
      ) {
        hasTriggeredSilenceProbeRef.current = true;
        console.log("[Client VAD] 7s Silence detected in Doubt phase. Triggering gentle probe prompt.");
        injectPromptText("[SYSTEM_EVENT: STUDENT_SILENT_7_SEC]");
      }
    }, 7000);

    return () => clearTimeout(timer);
  }, [teachingPhase, state, userVolume, injectPromptText]);

  const handleSendPromptText = (e: FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;

    const safeMsgId = "student_typed_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

    setDialogueHistory((prev) => [
      ...prev,
      {
        id: safeMsgId,
        sender: "user",
        text: typedInput,
      },
    ]);

    injectPromptText(typedInput);
    addToast(`Prompt sent to Cherry Ma'am!`, "success");
    setTypedInput("");
  };

  const studentAskedForWritingOrDrawing = useMemo(() => {
    const keywords = [
      "write", "draw", "sketch", "diagram", "plot", "graph", "formula", "equation", "solve",
      "calculate", "show me", "explain on board", "table", "chart", "figure", "visualize", "illustrate", "derive",
      "likh", "likho", "likhiye", "bana", "banao", "banaye", "draw karo", "solve karo", "dikhao", "dikhaye", "diagram banao", "graph banao", "figure banao", "board pe",
    ];

    if (userTranscript?.text) {
      const lower = userTranscript.text.toLowerCase();
      if (keywords.some((kw) => lower.includes(kw))) {
        return true;
      }
    }

    const userMessages = dialogueHistory.filter((item) => item.sender === "user");
    if (userMessages.length > 0) {
      const lastMsg = userMessages[userMessages.length - 1].text.toLowerCase();
      if (keywords.some((kw) => lastMsg.includes(kw))) {
        return true;
      }
    }

    return false;
  }, [dialogueHistory, userTranscript?.text]);

  const latestSpeechText = cherryTranscript.text || (dialogueHistory.filter((item) => item.sender === "cherry").slice(-1)[0]?.text || "");

  const handleSelectPrompt = (promptText: string) => {
    const isLive = state !== "disconnected" && state !== "connecting" && state !== "error";
    if (isLive) {
      injectPromptText(promptText);
      addToast(`Sending query: "${promptText}"`, "info");
    } else {
      addToast(`To ask Cherry Ma'am, read aloud: "${promptText}" or connect the live session first!`, "info");
    }
  };

  const getSubTitleText = () => {
    switch (state) {
      case "disconnected":
        return "Class is at recess. Wake up Cherry Ma'am to start studying! 🤓🎒";
      case "connecting":
        return "Cherry Ma'am is preparing today's sassy lesson slides... Brief moment... ☕📝";
      case "idle":
        return "Ask anything—Maths, Physics formulas, or poetic classics! 📐✨";
      case "listening":
        return "Tell me your query... I'm listening like an incredibly smart friend! 🧠👂";
      case "speaking":
        return "Listen closely, I'm delivering some effortless intellect! 🎙️🌟";
      case "error":
        return "Oops student, class network dropped. Let's hit reconnect... 💔🔌";
      default:
        return "Connected and ready to learn.";
    }
  };

  return {
    dialogueHistory,
    setDialogueHistory,
    typedInput,
    setTypedInput,
    handleSendPromptText,
    studentAskedForWritingOrDrawing,
    latestSpeechText,
    handleSelectPrompt,
    getSubTitleText,
  };
}
