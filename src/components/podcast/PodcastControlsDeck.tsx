/**
 * PodcastControlsDeck.tsx
 * Active dialogue bubble, playback progress bar, and comprehensive audio controls deck
 */
import React from "react";
import {
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Sliders,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { PodcastSegment } from "../../types";
import { getIntentBadge } from "./podcastPlayerTypes";

interface PodcastControlsDeckProps {
  currentSegment: PodcastSegment | undefined;
  currentSegmentIndex: number;
  totalSegments: number;
  isMentorSpeaking: boolean;
  isPlaying: boolean;
  isSegmentLoading: boolean;
  progressPercent: number;
  playbackSpeed: number;
  isMuted: boolean;
  onCycleSpeed: () => void;
  onRewind10: () => void;
  onPrevSegment: () => void;
  onTogglePlay: () => void;
  onNextSegment: () => void;
  onForward10: () => void;
  onToggleMute: () => void;
}

export const PodcastControlsDeck: React.FC<PodcastControlsDeckProps> = ({
  currentSegment,
  currentSegmentIndex,
  totalSegments,
  isMentorSpeaking,
  isPlaying,
  isSegmentLoading,
  progressPercent,
  playbackSpeed,
  isMuted,
  onCycleSpeed,
  onRewind10,
  onPrevSegment,
  onTogglePlay,
  onNextSegment,
  onForward10,
  onToggleMute,
}) => {
  return (
    <div className="space-y-4">
      {/* CURRENT ACTIVE DIALOGUE BUBBLE */}
      {currentSegment && (
        <div
          id="podcast-current-dialogue"
          className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 relative"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs text-slate-900">
                {currentSegment.speakerName}
              </span>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  isMentorSpeaking
                    ? "bg-indigo-50 text-[#796AEF] border-indigo-100"
                    : "bg-amber-50 text-amber-800 border-amber-100"
                }`}
              >
                {isMentorSpeaking ? "Mentor" : "Peer Student"}
              </span>
              {isSegmentLoading && (
                <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  <span>Streaming Studio Audio...</span>
                </span>
              )}
            </div>

            {/* Intent badge */}
            {(() => {
              const badge = getIntentBadge(currentSegment.intent);
              const Icon = badge.icon;
              return (
                <div
                  className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{badge.label}</span>
                </div>
              );
            })()}
          </div>

          <p className="text-slate-800 text-sm font-medium leading-relaxed italic">
            "{currentSegment.text}"
          </p>
        </div>
      )}

      {/* PROGRESS SLIDER */}
      <div id="podcast-progress-container" className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span>
            Turn {currentSegmentIndex + 1} of {totalSegments}
          </span>
          <span>{progressPercent}% Complete</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative cursor-pointer">
          <div
            className="h-full bg-gradient-to-r from-[#796AEF] to-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* CONTROLS DECK */}
      <div
        id="podcast-controls-deck"
        className="flex items-center justify-between gap-2 pt-1"
      >
        {/* Speed toggle */}
        <button
          id="podcast-speed-toggle-btn"
          onClick={onCycleSpeed}
          title="Playback Speed"
          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{playbackSpeed}x</span>
        </button>

        {/* Center playback buttons */}
        <div className="flex items-center gap-2">
          <button
            id="podcast-rewind-btn"
            onClick={onRewind10}
            title="Rewind 10 Seconds"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            id="podcast-prev-btn"
            onClick={onPrevSegment}
            disabled={currentSegmentIndex === 0}
            title="Previous Segment"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 rounded-full transition cursor-pointer"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Big Play/Pause Button */}
          <button
            id="podcast-play-pause-btn"
            onClick={onTogglePlay}
            title={isPlaying ? "Pause Episode" : "Play Episode"}
            className="w-13 h-13 rounded-full bg-[#796AEF] hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-200 transition transform active:scale-95 cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          <button
            id="podcast-next-btn"
            onClick={onNextSegment}
            disabled={currentSegmentIndex >= totalSegments - 1}
            title="Next Segment"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 rounded-full transition cursor-pointer"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <button
            id="podcast-forward-btn"
            onClick={onForward10}
            title="Forward 10 Seconds"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Mute toggle */}
        <button
          id="podcast-mute-toggle-btn"
          onClick={onToggleMute}
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
          className={`p-2 rounded-xl transition cursor-pointer ${
            isMuted
              ? "bg-rose-50 text-rose-600 border border-rose-200"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
