/**
 * PodcastHeaderBar.tsx
 * Top app-style navigation bar with podcast title, episode badges, and download/share actions
 */
import React from "react";
import {
  Headphones,
  CheckCircle2,
  FileAudio,
  Download,
  Copy,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { AudioPodcastData } from "../../types";

interface PodcastHeaderBarProps {
  podcast: AudioPodcastData;
  isSavedOffline: boolean;
  isDownloadingAudio: boolean;
  copiedId: string | null;
  onDownloadAudioWav: () => void;
  onDownloadTakeaways: () => void;
  onCopyTranscript: () => void;
  onCloseModal: () => void;
}

export const PodcastHeaderBar: React.FC<PodcastHeaderBarProps> = ({
  podcast,
  isSavedOffline,
  isDownloadingAudio,
  copiedId,
  onDownloadAudioWav,
  onDownloadTakeaways,
  onCopyTranscript,
  onCloseModal,
}) => {
  return (
    <div
      id="podcast-player-header"
      className="px-4 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#796AEF] to-indigo-500 flex items-center justify-center text-white shadow-xs shrink-0">
          <Headphones className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-[#796AEF] border border-indigo-100">
              {podcast.episodeType === "rapid_viva"
                ? "🎯 Rapid Viva / Quiz"
                : podcast.episodeType === "exam_booster"
                ? "🚀 Exam-Morning Booster"
                : podcast.episodeType === "quick_revision"
                ? "⚡ Quick Recap Blitz"
                : podcast.episodeType === "exam_trap"
                ? "🛡️ Exam Traps Shield"
                : "🎙️ Socratic Audio"}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {podcast.language || "Hinglish"}
            </span>
            {isSavedOffline && (
              <span
                id="podcast-header-offline-badge"
                className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"
              >
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                <span>Offline Ready</span>
              </span>
            )}
          </div>
          <h3 className="text-xs font-bold text-slate-800 truncate mt-0.5">
            {podcast.title}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          id="podcast-header-download-audio-btn"
          onClick={onDownloadAudioWav}
          disabled={isDownloadingAudio}
          title="Download High-Fidelity Audio Podcast (.wav) with Real Human Voice"
          className="p-1.5 text-[#796AEF] hover:text-indigo-800 hover:bg-indigo-50 rounded-xl transition cursor-pointer disabled:opacity-50"
        >
          {isDownloadingAudio ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#796AEF]" />
          ) : (
            <FileAudio className="w-4 h-4" />
          )}
        </button>
        <button
          id="podcast-download-takeaways-btn"
          onClick={onDownloadTakeaways}
          title="Download Takeaways & Full Script (.md)"
          className="p-1.5 text-slate-500 hover:text-[#796AEF] hover:bg-indigo-50 rounded-xl transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          id="podcast-copy-transcript-btn"
          onClick={onCopyTranscript}
          title="Copy Entire Episode Script"
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
        >
          {copiedId === "full" ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
        <button
          id="podcast-close-modal-btn"
          onClick={onCloseModal}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
