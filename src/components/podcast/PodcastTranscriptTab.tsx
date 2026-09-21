/**
 * PodcastTranscriptTab.tsx
 * Interactive episode transcript with click-to-seek, speaker indicators, and intent badges
 */
import React from "react";
import { Copy } from "lucide-react";
import { AudioPodcastData } from "../../types";
import { getIntentBadge } from "./podcastPlayerTypes";

interface PodcastTranscriptTabProps {
  podcast: AudioPodcastData;
  currentSegmentIndex: number;
  isPlaying: boolean;
  transcriptScrollRef: React.RefObject<HTMLDivElement | null>;
  onSelectSegment: (idx: number) => void;
  onCopyTranscript: () => void;
}

export const PodcastTranscriptTab: React.FC<PodcastTranscriptTabProps> = ({
  podcast,
  currentSegmentIndex,
  isPlaying,
  transcriptScrollRef,
  onSelectSegment,
  onCopyTranscript,
}) => {
  return (
    <div
      id="podcast-transcript-tab-content"
      ref={transcriptScrollRef}
      className="flex flex-col gap-2.5 max-h-[55vh] overflow-y-auto pr-1"
    >
      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
        <span>Click any statement to play directly from that point</span>
        <button
          type="button"
          onClick={onCopyTranscript}
          className="text-[#796AEF] font-bold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy All</span>
        </button>
      </div>

      {podcast.segments.map((seg, idx) => {
        const isActive = idx === currentSegmentIndex;
        const isMentor = seg.speaker === "mentor";
        const badge = getIntentBadge(seg.intent);
        const Icon = badge.icon;

        return (
          <div
            key={seg.id || idx}
            data-segment-idx={idx}
            onClick={() => onSelectSegment(idx)}
            className={`p-3 rounded-2xl border transition cursor-pointer text-left ${
              isActive
                ? "bg-indigo-50/90 border-[#796AEF] shadow-xs ring-1 ring-[#796AEF]/30"
                : "bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="text-base">
                  {isMentor
                    ? podcast.hosts.mentor.avatar || "👨‍🏫"
                    : podcast.hosts.student.avatar || "👩‍🎓"}
                </span>
                <span className="font-extrabold text-xs text-slate-900">
                  {seg.speakerName}
                </span>
                {isActive && isPlaying && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                )}
              </div>

              <div
                className={`flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}
              >
                <Icon className="w-2.5 h-2.5" />
                <span>{badge.label}</span>
              </div>
            </div>
            <p
              className={`text-xs leading-relaxed ${
                isActive ? "text-slate-900 font-semibold" : "text-slate-700"
              }`}
            >
              {seg.text}
            </p>
          </div>
        );
      })}
    </div>
  );
};
