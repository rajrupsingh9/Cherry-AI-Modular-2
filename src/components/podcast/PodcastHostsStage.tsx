/**
 * PodcastHostsStage.tsx
 * Dark 2-Host Visual Studio Stage with active speaker indicators and audio wave visualizer
 */
import React from "react";
import { Sparkles } from "lucide-react";
import { AudioPodcastData } from "../../types";

interface PodcastHostsStageProps {
  podcast: AudioPodcastData;
  currentSegmentIndex: number;
  totalSegments: number;
  isMentorSpeaking: boolean;
  isStudentSpeaking: boolean;
  isPlaying: boolean;
}

export const PodcastHostsStage: React.FC<PodcastHostsStageProps> = ({
  podcast,
  currentSegmentIndex,
  totalSegments,
  isMentorSpeaking,
  isStudentSpeaking,
  isPlaying,
}) => {
  return (
    <div
      id="podcast-hosts-stage"
      className="relative rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-4 text-white overflow-hidden shadow-inner border border-slate-800"
    >
      {/* Background aura orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#796AEF]/15 rounded-full blur-2xl pointer-events-none" />

      {/* Sub-header topic info */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3 z-10 relative">
        <span className="font-semibold text-indigo-300">
          {podcast.subject} • {podcast.grade}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-300">
            Segment {currentSegmentIndex + 1}/{totalSegments}
          </span>
        </div>
      </div>

      {/* DUAL HOST AVATARS */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        {/* MENTOR HOST CARD */}
        <div
          id="host-card-mentor"
          className={`rounded-xl p-2.5 transition-all duration-300 border flex flex-col items-center text-center ${
            isMentorSpeaking
              ? "bg-indigo-950/70 border-[#796AEF] shadow-[0_0_15px_rgba(121,106,239,0.35)] scale-[1.02]"
              : "bg-slate-800/40 border-slate-700/50 opacity-65"
          }`}
        >
          <div className="relative mb-1.5">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition ${
                isMentorSpeaking
                  ? "bg-gradient-to-tr from-[#796AEF] to-violet-500 ring-4 ring-[#796AEF]/40"
                  : "bg-slate-800"
              }`}
            >
              {podcast.hosts.mentor.avatar || "👨‍🏫"}
            </div>
            {isMentorSpeaking && isPlaying && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Speaking
              </div>
            )}
          </div>
          <span className="text-xs font-bold text-white truncate max-w-full">
            {podcast.hosts.mentor.name}
          </span>
          <span className="text-[10px] text-indigo-200 font-medium">
            {podcast.hosts.mentor.title}
          </span>
          <span className="text-[9px] text-slate-400 font-mono mt-0.5 truncate max-w-[120px] px-1.5 py-0.5 rounded bg-slate-900/60 border border-slate-700/50">
            {podcast.hosts.mentor.name.toLowerCase().includes("cherry") ||
            podcast.hosts.mentor.voiceGender === "female"
              ? "🎙️ Aoede (24kHz HD)"
              : "🎙️ Charon (24kHz HD)"}
          </span>
        </div>

        {/* STUDENT HOST CARD */}
        <div
          id="host-card-student"
          className={`rounded-xl p-2.5 transition-all duration-300 border flex flex-col items-center text-center ${
            isStudentSpeaking
              ? "bg-indigo-950/70 border-[#796AEF] shadow-[0_0_15px_rgba(121,106,239,0.35)] scale-[1.02]"
              : "bg-slate-800/40 border-slate-700/50 opacity-65"
          }`}
        >
          <div className="relative mb-1.5">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition ${
                isStudentSpeaking
                  ? "bg-gradient-to-tr from-amber-500 to-rose-500 ring-4 ring-amber-500/40"
                  : "bg-slate-800"
              }`}
            >
              {podcast.hosts.student.avatar || "👩‍🎓"}
            </div>
            {isStudentSpeaking && isPlaying && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Speaking
              </div>
            )}
          </div>
          <span className="text-xs font-bold text-white truncate max-w-full">
            {podcast.hosts.student.name}
          </span>
          <span className="text-[10px] text-amber-200 font-medium">
            {podcast.hosts.student.title}
          </span>
          <span className="text-[9px] text-slate-400 font-mono mt-0.5 truncate max-w-[120px] px-1.5 py-0.5 rounded bg-slate-900/60 border border-slate-700/50">
            🎙️ Kore (16yr Female)
          </span>
        </div>
      </div>

      {/* SEAMLESS ZERO-GAP STUDIO AUDIO STATUS BAR */}
      <div className="mt-2.5 flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-indigo-500/30 text-[10px]">
        <div className="flex items-center gap-1.5 text-slate-200 min-w-0">
          <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-400 animate-pulse" />
          <span className="truncate">
            🎙️ <strong className="text-emerald-300">Seamless Studio Audio</strong> • 24kHz HD (Zero Gap)
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold text-[10px] flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Natural Human Flow</span>
          </span>
        </div>
      </div>

      {/* ANIMATED SOUNDWAVE VISUALIZER */}
      <div
        id="podcast-audio-soundwave"
        className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-center gap-1 h-7"
      >
        {Array.from({ length: 24 }).map((_, i) => {
          const isCenter = Math.abs(i - 12) < 6;
          const heightClass = isPlaying
            ? isCenter
              ? "animate-pulse h-5 bg-[#796AEF]"
              : "h-3 bg-indigo-400/80"
            : "h-1.5 bg-slate-700";

          return (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-200 ${heightClass}`}
              style={{
                animationDelay: `${(i % 5) * 0.12}s`,
                animationDuration: isPlaying ? "0.6s" : "0s",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
