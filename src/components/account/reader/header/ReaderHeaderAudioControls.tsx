/**
 * ReaderHeaderAudioControls.tsx
 * Audio speech synthesis (read aloud) controls and 2-Host podcast generator launcher.
 */
import React from "react";
import { Volume2, Pause, Play, RotateCcw, Sparkles, Radio } from "lucide-react";

interface ReaderHeaderAudioControlsProps {
  isSpeaking: boolean;
  isPaused: boolean;
  speechRate: number;
  handleToggleSpeech: () => void;
  handleCycleSpeechRate: () => void;
  stopSpeech: () => void;
  isGeneratingPodcast: boolean;
  handleTriggerBookPodcast: () => void;
}

export const ReaderHeaderAudioControls: React.FC<ReaderHeaderAudioControlsProps> = ({
  isSpeaking,
  isPaused,
  speechRate,
  handleToggleSpeech,
  handleCycleSpeechRate,
  stopSpeech,
  isGeneratingPodcast,
  handleTriggerBookPodcast,
}) => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Audio Speech Synthesis (Listen Aloud) */}
      <div className="flex items-center gap-1 border rounded-xl p-0.5 bg-black/20 border-current/20 text-xs font-mono">
        <button
          type="button"
          onClick={handleToggleSpeech}
          className={`min-h-[44px] sm:min-h-[32px] px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            isSpeaking
              ? "bg-amber-400 text-slate-950 animate-pulse font-black shadow-xs"
              : "opacity-75 hover:opacity-100"
          }`}
          title={
            isSpeaking
              ? isPaused
                ? "Resume Reading"
                : "Pause Reading"
              : "Listen Aloud (Cherry Speech)"
          }
        >
          {isSpeaking ? (
            isPaused ? (
              <Play className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Pause className="w-3.5 h-3.5 fill-current" />
            )
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {isSpeaking ? (isPaused ? "Resume" : "Listening") : "Read Aloud"}
          </span>
        </button>
        {isSpeaking && (
          <button
            type="button"
            onClick={handleCycleSpeechRate}
            className="min-h-[44px] sm:min-h-[30px] px-1.5 py-1 rounded text-[10px] font-mono font-black bg-black/30 hover:bg-black/50 text-amber-300"
            title="Cycle Audio Playback Speed"
          >
            {speechRate}x
          </button>
        )}
        {isSpeaking && (
          <button
            type="button"
            onClick={stopSpeech}
            className="min-h-[44px] sm:min-h-[30px] p-1 rounded text-[10px] hover:bg-rose-500/20 text-rose-400"
            title="Stop Audio Narration"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 2-Host Dual-Voice Multilingual Podcast Button */}
      <button
        type="button"
        onClick={handleTriggerBookPodcast}
        disabled={isGeneratingPodcast}
        className="min-h-[44px] sm:min-h-[34px] px-2.5 py-1 sm:py-1.5 rounded-xl border border-indigo-400/40 bg-indigo-500/25 hover:bg-indigo-500/40 text-indigo-200 hover:text-white text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95 disabled:opacity-50"
        title="Listen to 2-Host Dual-Voice Podcast Overview (Aarav Sir & Riya)"
      >
        {isGeneratingPodcast ? (
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin text-amber-300" />
        ) : (
          <Radio className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-300" />
        )}
        <span className="hidden sm:inline">
          {isGeneratingPodcast ? "Generating..." : "2-Host Podcast"}
        </span>
      </button>
    </div>
  );
};
