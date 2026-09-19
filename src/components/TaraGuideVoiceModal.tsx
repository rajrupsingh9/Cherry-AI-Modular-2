import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  MessageSquare,
  HelpCircle,
} from "lucide-react";

interface TaraGuideVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  grade?: string;
  board?: string;
  subject?: string;
  problemText?: string;
  replyContext?: string;
  autoStart?: boolean;
}

export const TaraGuideVoiceModal: React.FC<TaraGuideVoiceModalProps> = ({
  isOpen,
  onClose,
  studentName = "Student",
  grade = "Class 10",
  board = "CBSE",
  subject = "Science",
  problemText = "Let's discuss this problem step-by-step.",
  replyContext = "",
  autoStart = true,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis || null;
    }

    if (isOpen && autoStart) {
      startVoiceExplanation();
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [isOpen]);

  const startVoiceExplanation = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const speechText = replyContext
      ? `Namaste ${studentName}! Looking at your problem: "${problemText.slice(0, 80)}...", ${replyContext}`
      : `Namaste ${studentName}! I'm Tara Ma'am. Let's break down: "${problemText}". First, let's identify the given values and formula. What do you think is the first step?`;

    setTranscript(speechText);
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const handleToggleVoice = () => {
    if (isSpeaking) {
      if (synthRef.current) synthRef.current.cancel();
      setIsSpeaking(false);
    } else {
      startVoiceExplanation();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0a3641] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#c4f500]/20 border border-[#c4f500]/40 text-[#c4f500] flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Tara Ma'am 1-on-1 Voice Guide</h3>
              <p className="text-[11px] text-teal-200/80">{grade} • {subject}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Pulse Orb */}
        <div className="p-8 flex flex-col items-center justify-center gap-5 bg-gradient-to-b from-[#f7f9f6] to-white">
          <div className="relative flex items-center justify-center">
            {isSpeaking && (
              <div className="absolute w-32 h-32 rounded-full bg-[#c4f500]/30 animate-ping" />
            )}
            <div
              onClick={handleToggleVoice}
              className={`w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-lg ${
                isSpeaking
                  ? "bg-[#0a3641] text-[#c4f500] ring-4 ring-[#c4f500]/50"
                  : "bg-slate-200 text-slate-600 hover:bg-slate-300"
              }`}
            >
              {isSpeaking ? <Volume2 className="w-10 h-10 animate-pulse" /> : <Mic className="w-10 h-10" />}
            </div>
          </div>

          <div className="text-center">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              {isSpeaking ? "Tara Ma'am is speaking..." : "Tap orb to replay explanation"}
            </span>
          </div>

          {/* Spoken Text Box */}
          <div className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto shadow-2xs">
            <span className="font-bold text-[#0a3641] block mb-1">Live Transcript:</span>
            {transcript || "Preparing voice synthesis..."}
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
