/**
 * BoardEmptyStates.tsx
 * Clean placeholder and preparation states for syllabus, loading, and document sync
 */
import React from "react";
import { BookOpen } from "lucide-react";
import { cleanTopicHeader } from "../../utils/boardFilter";

interface BoardReadyPreClassProps {
  topics: string[];
  activeTopicIndex: number;
  detectedSubject?: string;
  isLightBg?: boolean;
  onWakeUp?: () => void;
}

export const BoardReadyPreClass: React.FC<BoardReadyPreClassProps> = ({
  topics,
  activeTopicIndex,
  detectedSubject,
  isLightBg,
  onWakeUp
}) => {
  return (
    <div
      className={`w-full max-w-2xl mx-auto py-8 px-6 rounded-2xl text-center space-y-5 shadow-sm animate-chalk-fade my-6 ${
        isLightBg ? "bg-white border border-[#EFF1F5]" : "bg-black/40 border border-white/15"
      }`}
    >
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#796AEF]/10 border border-[#796AEF]/20 text-[#796AEF] font-mono text-[11px] uppercase font-bold tracking-wider">
        <span className="w-2 h-2 rounded-full bg-[#796AEF] animate-ping" />
        <span>🎓 Board Ready</span>
      </div>

      <div className="space-y-2">
        <h3 className={`text-lg md:text-xl font-black font-sans tracking-wide ${isLightBg ? "text-[#1E293B]" : "text-white"}`}>
          {detectedSubject ? `${detectedSubject.toUpperCase()} • ` : ""}
          {cleanTopicHeader(topics[activeTopicIndex] || "", detectedSubject, activeTopicIndex) || "Uploaded Syllabus"}
        </h3>
        <p className={`text-[13px] font-sans max-w-md mx-auto leading-relaxed ${isLightBg ? "text-[#4A4E5A]" : "text-zinc-300"}`}>
          Syllabus is loaded in Cherry Ma'am's memory! Click below to start your live interactive lesson. She will explain live and write chalkboard notes step-by-step.
        </p>
      </div>

      {topics.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 max-w-lg mx-auto">
          {topics.map((t, tIdx) => {
            const tHeader = cleanTopicHeader(t, detectedSubject, tIdx);
            return (
              <span
                key={tIdx}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] sm:text-[11px] font-mono font-bold border ${
                  tIdx === activeTopicIndex
                    ? "bg-[#796AEF]/15 border-[#796AEF]/35 text-[#796AEF]"
                    : isLightBg
                      ? "bg-[#F6F7FB] border-[#EFF1F5] text-[#4A4E5A]"
                      : "bg-white/10 border-white/10 text-zinc-300"
                }`}
              >
                Part {tIdx + 1}: {tHeader.length > 25 ? tHeader.substring(0, 25) + "..." : tHeader}
              </span>
            );
          })}
        </div>
      )}

      {onWakeUp && (
        <div className="pt-2">
          <button
            onClick={e => {
              e.stopPropagation();
              onWakeUp();
            }}
            className="px-6 py-3 bg-[#796AEF] hover:bg-[#6858e0] text-white font-black font-mono text-xs tracking-wider uppercase rounded-xl shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer inline-flex items-center gap-2 relative z-10 pointer-events-auto"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span>▶ WAKE UP CHERRY MA'AM TO START CLASS 🎙️🎓</span>
          </button>
        </div>
      )}
    </div>
  );
};

interface BoardConnectingStateProps {
  isLightBg?: boolean;
}

export const BoardConnectingState: React.FC<BoardConnectingStateProps> = ({ isLightBg }) => {
  return (
    <div
      className={`w-full max-w-xl mx-auto py-10 px-6 rounded-2xl text-center space-y-3 shadow-sm animate-pulse my-6 ${
        isLightBg ? "bg-white border border-[#EFF1F5]" : "bg-black/40 border border-white/15"
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-[#796AEF]/10 border border-[#796AEF]/20 flex items-center justify-center mx-auto text-[#796AEF] font-mono text-lg">
        ✍️
      </div>
      <div className="space-y-1">
        <p className="text-[13px] font-extrabold font-mono text-[#796AEF] uppercase tracking-wider">
          Connecting to Cherry Ma'am...
        </p>
        <p className={`text-[12px] sm:text-[12.5px] font-sans ${isLightBg ? "text-[#4A4E5A]" : "text-zinc-300"}`}>
          Setting up Phase 1: Interactive Mystery Hook & Live Chalkboard Notes
        </p>
      </div>
    </div>
  );
};

interface DocumentSyncStateProps {
  state: string;
  onWakeUp?: () => void;
}

export const DocumentSyncState: React.FC<DocumentSyncStateProps> = ({ state, onWakeUp }) => {
  return (
    <div className="text-[#4A4E5A] py-10 space-y-5 text-center flex flex-col items-center justify-center animate-chalk-fade">
      <BookOpen className="w-14 h-14 mx-auto stroke-[1.2] opacity-40 text-[#796AEF] animate-pulse-slow" />
      <div className="space-y-1.5 font-mono text-xs tracking-widest leading-relaxed">
        <p className="font-bold uppercase text-[#796AEF]">📚 Syllabus Document Sync Mode</p>
        <p className="text-[12.5px] text-[#4A4E5A] font-sans tracking-wide max-w-md mx-auto normal-case font-medium leading-relaxed px-4">
          Today's chapters are synced inside Cherry Ma'am's memory! She will write notes on this board topic-by-topic as we discuss each section.
        </p>
        <p className="text-[11px] text-[#796AEF] max-w-sm mx-auto flex items-center justify-center gap-1.5 mt-2 bg-[#796AEF]/10 border border-[#EFF1F5] py-1.5 px-3 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-[#796AEF] animate-pulse" />
          <span>Topic-wise chalkboard flow active</span>
        </p>
      </div>
      {state === "disconnected" && onWakeUp && (
        <button
          onClick={e => {
            e.stopPropagation();
            onWakeUp();
          }}
          className="px-5 py-2.5 bg-[#796AEF] hover:bg-[#6858e0] text-white font-bold font-mono text-[11px] tracking-wider uppercase rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer flex items-center gap-2 relative z-10 pointer-events-auto shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/80 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span>WAKE UP CHERRY MA'AM TO START CLASS 🎙️🎓</span>
        </button>
      )}
    </div>
  );
};
