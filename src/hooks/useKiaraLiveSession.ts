import { useState, useRef, useEffect, useCallback } from "react";
import { SessionState, LiveTranscription } from "../types";

interface UseKiaraLiveSessionParams {
  onToast?: (msg: string, type: "info" | "success" | "error") => void;
  studentName?: string;
  grade?: string;
  board?: string;
  subject?: string;
  performanceData?: any;
  initialTopicPrompt?: string;
}

export function useKiaraLiveSession({
  onToast,
  studentName = "Student",
  grade = "Class 10",
  board = "CBSE",
  subject = "Science",
  performanceData,
  initialTopicPrompt,
}: UseKiaraLiveSessionParams) {
  const [state, setState] = useState<SessionState>("disconnected");
  const [userVolume, setUserVolume] = useState<number>(0);
  const [kiaraVolume, setKiaraVolume] = useState<number>(0);
  const [userTranscript, setUserTranscript] = useState<LiveTranscription>({ text: "", finished: true });
  const [kiaraTranscript, setKiaraTranscript] = useState<LiveTranscription>({ text: "", finished: true });

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis || null;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-IN";

        recognition.onresult = (event: any) => {
          let interim = "";
          let final = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          if (final) {
            setUserTranscript({ text: final, finished: true });
            handleUserResponse(final);
          } else if (interim) {
            setUserTranscript({ text: interim, finished: false });
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const speakKiara = useCallback((text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.1;

    setKiaraTranscript({ text, finished: false });
    setState("speaking");
    setKiaraVolume(0.8);

    utterance.onend = () => {
      setKiaraTranscript({ text, finished: true });
      setState("listening");
      setKiaraVolume(0);
    };

    synthRef.current.speak(utterance);
  }, []);

  const handleUserResponse = useCallback((userText: string) => {
    setState("speaking");
    setTimeout(() => {
      const response = `I understand, ${studentName}. Remember that consistent practice and conceptual clarity will help you overcome any challenge in ${subject}! Let's tackle it step-by-step.`;
      speakKiara(response);
    }, 600);
  }, [studentName, subject, speakKiara]);

  const connect = useCallback(async (customPrompt?: string) => {
    setState("connecting");
    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {}
      }
      setState("idle");
      onToast?.("🌟 Connected with Kiara Ma'am!", "success");

      const promptToUse = customPrompt || initialTopicPrompt;
      const greeting = promptToUse
        ? `Hello ${studentName}! I see we are discussing ${promptToUse}. How are you feeling about this topic today?`
        : `Hello ${studentName}! I'm Kiara, your academic mentor for ${grade} ${subject}. How is your study session going today?`;

      setTimeout(() => {
        speakKiara(greeting);
      }, 500);
    } catch (err) {
      console.warn("Kiara voice connection failed:", err);
      setState("error");
      onToast?.("Could not access microphone.", "error");
    }
  }, [initialTopicPrompt, studentName, grade, subject, onToast, speakKiara]);

  const disconnect = useCallback(() => {
    if (synthRef.current) synthRef.current.cancel();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setState("disconnected");
    setKiaraVolume(0);
    setUserVolume(0);
  }, []);

  const sendTopicPrompt = useCallback((prompt: string) => {
    speakKiara(prompt);
  }, [speakKiara]);

  return {
    state,
    userVolume,
    kiaraVolume,
    userTranscript,
    kiaraTranscript,
    connect,
    disconnect,
    sendTopicPrompt,
  };
}
