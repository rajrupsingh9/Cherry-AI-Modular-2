/**
 * PodcastOfflineHub.tsx
 * Offline storage status, audio synthesis progress card, and local persistence controls
 */
import React from "react";
import {
  Download,
  HardDrive,
  CheckCircle2,
  WifiOff,
  Loader2,
} from "lucide-react";
import { PodcastDownloadProgress } from "../../utils/offlineAudioStorage";

interface PodcastOfflineHubProps {
  isDownloadingAudio: boolean;
  downloadProgress: PodcastDownloadProgress | null;
  downloadStatusNote: string | null;
  isSavedOffline: boolean;
  onDownloadAudioWav: () => void;
  onSaveOffline: () => void;
  onDeleteOffline: () => void;
}

export const PodcastOfflineHub: React.FC<PodcastOfflineHubProps> = ({
  isDownloadingAudio,
  downloadProgress,
  downloadStatusNote,
  isSavedOffline,
  onDownloadAudioWav,
  onSaveOffline,
  onDeleteOffline,
}) => {
  if (isDownloadingAudio) {
    return (
      <div
        id="podcast-audio-download-progress-card"
        className="mt-3 p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col gap-2"
      >
        <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
          <span className="flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#796AEF]" />
            <span>{downloadProgress?.statusText || "Synthesizing Real Human Audio..."}</span>
          </span>
          <span className="text-[#796AEF] font-black">
            {downloadProgress?.percent || 0}%
          </span>
        </div>
        <div className="w-full h-2 bg-indigo-200/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#796AEF] to-indigo-500 transition-all duration-300"
            style={{ width: `${downloadProgress?.percent || 10}%` }}
          />
        </div>
        <p className="text-[10px] text-indigo-800 font-medium text-center">
          🎙️ Gemini Live Actor 24kHz HD Voice • Real human sound without robotic glitches
        </p>
      </div>
    );
  }

  return (
    <div
      id="podcast-offline-download-hub"
      className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2"
    >
      {downloadStatusNote && (
        <div className="text-center text-xs font-bold text-indigo-800 bg-indigo-50 py-1.5 px-2.5 rounded-xl border border-indigo-100">
          {downloadStatusNote}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {/* 1. Direct Download Button */}
        <button
          id="podcast-direct-download-wav-btn"
          type="button"
          onClick={onDownloadAudioWav}
          className="w-full py-2.5 px-3 rounded-2xl bg-[#796AEF] hover:bg-indigo-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-0.5 shadow-xs transition active:scale-[0.98] cursor-pointer min-h-[48px]"
        >
          <div className="flex items-center gap-1.5 font-extrabold">
            <Download className="w-3.5 h-3.5" />
            <span>Download .wav</span>
          </div>
          <span className="text-[9px] text-indigo-200 font-normal">
            Direct to Device Storage
          </span>
        </button>

        {/* 2. In-App Offline Player Save / Status */}
        {isSavedOffline ? (
          <div
            id="podcast-offline-saved-card"
            className="w-full py-2 px-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center gap-0.5 min-h-[48px] text-center"
          >
            <div className="flex items-center gap-1 text-emerald-800 font-extrabold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Saved Offline ✓</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-emerald-700">
              <span>बिना इंटरनेट चलेगा</span>
              <button
                type="button"
                onClick={onDeleteOffline}
                title="Remove from offline storage"
                className="text-rose-600 hover:text-rose-800 hover:underline font-semibold cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            id="podcast-save-offline-btn"
            type="button"
            onClick={onSaveOffline}
            className="w-full py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex flex-col items-center justify-center gap-0.5 transition active:scale-[0.98] cursor-pointer min-h-[48px] border border-slate-200/70"
          >
            <div className="flex items-center gap-1.5 font-extrabold">
              <HardDrive className="w-3.5 h-3.5 text-[#796AEF]" />
              <span>Save Offline</span>
            </div>
            <span className="text-[9px] text-slate-500 font-normal">
              In-App Offline Player
            </span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
        <WifiOff className="w-3 h-3 text-slate-400" />
        <span>100% Real Human Voice • No internet required once saved</span>
      </div>
    </div>
  );
};
