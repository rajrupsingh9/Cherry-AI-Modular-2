/**
 * PreClassClassroomHub.tsx
 * Pre-class classroom hub with motivational thoughts, quick start prompts, focus audio and subject overview
 */
import React, { useState } from "react";
import { GraduationCap, RefreshCw } from "lucide-react";
import { DAILY_MOTIVATIONAL_THOUGHTS } from "./boardTypes";

interface PreClassClassroomHubProps {
  state: string;
  detectedSubject?: string;
  isSynthPlaying: boolean;
  toggleSynth: () => void;
  stopSynth: () => void;
  onWakeUp?: () => void;
  onOpenSyllabus?: () => void;
  onSelectPrompt?: (promptText: string) => void;
}

export const PreClassClassroomHub: React.FC<PreClassClassroomHubProps> = ({
  state,
  detectedSubject,
  isSynthPlaying,
  toggleSynth,
  stopSynth,
  onWakeUp,
  onOpenSyllabus,
  onSelectPrompt
}) => {
  const [thoughtIndex, setThoughtIndex] = useState<number>(() => Math.floor(Math.random() * DAILY_MOTIVATIONAL_THOUGHTS.length));

  const currentThought = DAILY_MOTIVATIONAL_THOUGHTS[thoughtIndex] || DAILY_MOTIVATIONAL_THOUGHTS[0];

  const handleNextThought = (e: React.MouseEvent) => {
    e.stopPropagation();
    setThoughtIndex(prev => (prev + 1) % DAILY_MOTIVATIONAL_THOUGHTS.length);
  };

  const quickPrompts = [
    detectedSubject === "Biology" ? "Introductory overview bataiye" : "Core concepts explain kariye",
    "Real-world application dikhaiye",
    "Basic formula summary likhein",
    "line by line padhkar samjhaye",
    "Diagram se samjhaye"
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 text-left space-y-8 select-none pointer-events-auto animate-fade-in">
      {/* Majestic Pre-Class Interactive Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-[#EFF1F5] pb-5 gap-4 relative">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#796AEF]/10 border border-[#796AEF]/20 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#796AEF]/60 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#796AEF]"></span>
            </span>
            <span className="text-[10.5px] sm:text-[11px] font-mono tracking-wider font-black text-[#796AEF] uppercase">CLASSROOM HUB ACTIVE</span>
          </div>
          <h3 className="text-2xl font-sans font-black text-[#1E293B] tracking-tight uppercase leading-none">
            Cherry Ma'am's <span className="text-[#796AEF]">Interactive Classroom</span>
          </h3>
          <p className="text-[13px] text-[#4A4E5A] font-sans font-medium leading-relaxed max-w-2xl">
            Ab Blackboard fully interactive hai! Class shuru hone se pehle digi-slate par scribble karke likhein ya preparation check karein.
          </p>
        </div>

        {/* Pre-Class Advanced Focus Audio & Subject Widget */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 lg:self-center">
          <button
            onClick={toggleSynth}
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border transition-all duration-300 cursor-pointer text-[11px] font-mono font-bold uppercase ${
              isSynthPlaying
                ? "bg-[#796AEF]/15 border-[#796AEF]/40 text-[#796AEF] shadow-xs scale-[1.02]"
                : "bg-white border-[#EFF1F5] text-[#4A4E5A] hover:text-[#1E293B] hover:border-[#796AEF]/30"
            }`}
            title="Toggle study-friendly relaxing synth background sound"
          >
            <div className="flex items-center gap-1">
              <span className={`w-1 h-3 bg-current rounded-full transition-all duration-300 ${isSynthPlaying ? "animate-[bounce_0.8s_infinite]" : "opacity-60"}`} />
              <span className={`w-1 h-4 bg-current rounded-full transition-all duration-300 ${isSynthPlaying ? "animate-[bounce_0.8s_infinite_0.15s]" : "opacity-60"}`} style={{ animationDelay: "0.1s" }} />
              <span className={`w-1 h-2 bg-current rounded-full transition-all duration-300 ${isSynthPlaying ? "animate-[bounce_0.8s_infinite_0.3s]" : "opacity-60"}`} style={{ animationDelay: "0.2s" }} />
            </div>
            <span>{isSynthPlaying ? "Focus Audio: ON" : "Ambient Synth"}</span>
          </button>

          <div className="flex items-center gap-2.5 bg-white border border-[#EFF1F5] rounded-xl px-4 py-2 hover:border-[#796AEF]/30 transition-colors duration-300">
            <GraduationCap className="w-5 h-5 text-[#796AEF]" />
            <div className="text-left font-mono">
              <p className="text-[10px] text-[#4A4E5A] uppercase tracking-wider font-extrabold">Active Class Subject</p>
              <p className="text-[13px] text-[#1E293B] font-black tracking-wide">{detectedSubject || "General Science / Maths"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Motivational Thought Card */}
      <div className="bg-white border border-[#EFF1F5] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-sm relative overflow-hidden group min-h-[360px]">
        <div className="space-y-6 z-10 flex-1 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between border-b border-[#EFF1F5] pb-4 gap-3">
            <div className="space-y-1 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#796AEF]/10 border border-[#796AEF]/20 backdrop-blur-md">
                <span className="text-[#796AEF] text-xs">🌟</span>
                <span className="text-[10.5px] sm:text-[11px] font-mono tracking-wider font-black text-[#796AEF] uppercase">
                  DAILY MOTIVATIONAL THOUGHT • आज का विचार
                </span>
              </div>
              <h4 className="text-lg font-sans font-black tracking-tight text-[#1E293B] uppercase flex items-center gap-2 mt-1">
                Inspiration for Learning & Growth {currentThought.icon}
              </h4>
            </div>

            <button
              onClick={handleNextThought}
              className="flex items-center gap-2 px-4 py-2 bg-[#F6F7FB] hover:bg-[#EFF1F5] border border-[#EFF1F5] text-[#796AEF] hover:text-[#5d4edb] text-xs font-mono font-bold rounded-xl transition-all duration-200 cursor-pointer active:scale-95 shadow-xs"
              title="Read another motivational thought"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Next Thought / अगला विचार</span>
            </button>
          </div>

          <div className="bg-[#F6F7FB] border border-[#EFF1F5] rounded-xl p-6 sm:p-7 relative text-left space-y-4 shadow-inner">
            <span className="absolute -top-3 left-6 text-6xl text-[#796AEF]/15 font-serif leading-none select-none pointer-events-auto">“</span>
            <p className="text-lg sm:text-xl font-sans font-bold text-[#1E293B] leading-relaxed tracking-wide pt-2">
              "{currentThought.thoughtHi}"
            </p>
            <p className="text-[13px] sm:text-sm font-sans italic text-[#4A4E5A] leading-relaxed border-l-2 border-[#796AEF]/40 pl-4 py-0.5">
              "{currentThought.thoughtEn}"
            </p>
            <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[#EFF1F5] gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">✒️</span>
                <span className="text-xs sm:text-sm font-mono font-black text-[#796AEF] tracking-wide">
                  — {currentThought.author}
                </span>
              </div>
              <span className="text-[10.5px] sm:text-[11px] font-mono font-bold px-3 py-1 rounded-md bg-white border border-[#EFF1F5] text-[#4A4E5A] uppercase tracking-wider">
                🏷️ {currentThought.tag}
              </span>
            </div>
          </div>

          {/* Quick Start Prompts */}
          <div className="border-t border-[#EFF1F5] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 z-10">
            <div className="text-left">
              <p className="text-[10.5px] font-mono font-black text-[#796AEF] uppercase tracking-wider">Quick Start Prompts:</p>
              <p className="text-[12px] text-[#4A4E5A] leading-normal font-sans font-semibold">Click a prompt or wake up Cherry Ma'am to begin!</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {quickPrompts.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => onSelectPrompt && onSelectPrompt(prompt)}
                  className="px-3 py-1.5 bg-[#F6F7FB] hover:bg-[#EFF1F5] text-[11px] font-sans font-bold text-[#4A4E5A] hover:text-[#1E293B] border border-[#EFF1F5] hover:border-[#796AEF]/40 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 shadow-xs"
                >
                  💡 {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Class Launch CTA Station */}
      <div className="pt-2 flex flex-col items-center text-center space-y-4">
        {state === "disconnected" && onWakeUp ? (
          <button
            onClick={e => {
              e.stopPropagation();
              stopSynth();
              onWakeUp();
            }}
            className="py-3.5 px-8 text-white font-black font-sans text-xs tracking-wider uppercase rounded-xl transition-all duration-300 hover:scale-[1.03] active:scale-97 cursor-pointer flex items-center justify-center gap-3 relative shadow-sm border border-[#796AEF] bg-[#796AEF] hover:bg-[#6858e0]"
          >
            <span className="relative flex h-3.5 w-3.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white"></span>
            </span>
            <span className="font-black tracking-widest flex items-center gap-2">
              WAKE UP CHERRY MA'AM TO START CLASS <span className="animate-[bounce_1s_infinite]">🎙️🎓</span>
            </span>
          </button>
        ) : (
          onOpenSyllabus && (
            <button
              onClick={e => {
                e.stopPropagation();
                onOpenSyllabus();
              }}
              className="w-full max-w-md py-3 px-5 border border-dashed border-[#EFF1F5] bg-white hover:bg-[#F6F7FB] text-[#1E293B] rounded-xl text-[11px] font-sans tracking-wider uppercase font-black transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span className="text-[#796AEF]">📚 Upload Course Syllabus or Lesson Plan</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-[#796AEF]/10 text-[#796AEF]">Click Here</span>
            </button>
          )
        )}
      </div>
    </div>
  );
};
