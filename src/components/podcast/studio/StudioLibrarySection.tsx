/**
 * StudioLibrarySection.tsx
 * Recent episodes and offline audio library with quick play, .wav download, and delete actions
 */
import React from "react";
import {
  Headphones,
  HardDrive,
  WifiOff,
  Play,
  CheckCircle2,
  Download,
  Trash2,
} from "lucide-react";
import { AudioPodcastData } from "../../../types";
import { OfflinePodcastRecord } from "../../../utils/offlineAudioStorage";
import { LibraryTabType } from "./studioTypes";

interface StudioLibrarySectionProps {
  savedEpisodes: AudioPodcastData[];
  offlineEpisodes: OfflinePodcastRecord[];
  activeLibraryTab: LibraryTabType;
  setActiveLibraryTab: (tab: LibraryTabType) => void;
  onOpenPodcast: (podcast: AudioPodcastData) => void;
  onDownloadWav: (record: OfflinePodcastRecord, e: React.MouseEvent) => void;
  onDeleteOffline: (id: string, e: React.MouseEvent) => void;
}

export const StudioLibrarySection: React.FC<StudioLibrarySectionProps> = ({
  savedEpisodes,
  offlineEpisodes,
  activeLibraryTab,
  setActiveLibraryTab,
  onOpenPodcast,
  onDownloadWav,
  onDeleteOffline,
}) => {
  if (savedEpisodes.length === 0 && offlineEpisodes.length === 0) {
    return null;
  }

  return (
    <div id="studio-library-section" className="pt-3 border-t border-slate-100 space-y-2.5">
      {/* Library Tab Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-0.5 bg-slate-100 rounded-xl">
          <button
            id="studio-tab-recent-library-btn"
            type="button"
            onClick={() => setActiveLibraryTab("recent")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              activeLibraryTab === "recent"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Headphones className="w-3 h-3 text-[#796AEF]" />
            <span>Recent ({savedEpisodes.length})</span>
          </button>

          <button
            id="studio-tab-offline-library-btn"
            type="button"
            onClick={() => setActiveLibraryTab("offline")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              activeLibraryTab === "offline"
                ? "bg-[#796AEF] text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <HardDrive className="w-3 h-3" />
            <span>Offline ({offlineEpisodes.length})</span>
            {offlineEpisodes.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>

        {activeLibraryTab === "offline" && offlineEpisodes.length > 0 && (
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <WifiOff className="w-2.5 h-2.5" />
            <span>Zero Data Playback</span>
          </span>
        )}
      </div>

      {/* TAB 1: RECENT EPISODES */}
      {activeLibraryTab === "recent" && (
        <div id="studio-recent-episodes-list" className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {savedEpisodes.slice(0, 4).map((ep) => {
            const isOffline = offlineEpisodes.some((off) => off.id === ep.id);
            return (
              <div
                key={ep.id}
                onClick={() => onOpenPodcast(ep)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/70 hover:border-indigo-200 transition cursor-pointer flex items-center justify-between gap-2 group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 group-hover:border-indigo-300 flex items-center justify-center text-[#796AEF] shrink-0">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {ep.title || ep.topic}
                    </p>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2 flex-wrap">
                      <span>{ep.language || "Hinglish"}</span>
                      <span>•</span>
                      <span>{ep.segments?.length || 10} turns</span>
                      {ep.episodeType && (
                        <span className="font-semibold px-1.5 py-0.5 text-[9px] rounded bg-indigo-50 text-[#796AEF] border border-indigo-100">
                          {ep.episodeType === "rapid_viva"
                            ? "🎯 Rapid Viva"
                            : ep.episodeType === "exam_booster"
                            ? "🚀 Exam Booster"
                            : ep.episodeType === "quick_revision"
                            ? "⚡ Quick Recap"
                            : ep.episodeType === "exam_trap"
                            ? "🛡️ Exam Traps"
                            : "🎙️ Audio Overview"}
                        </span>
                      )}
                      {isOffline && (
                        <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
                          • <CheckCircle2 className="w-2.5 h-2.5" /> Offline
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-[#796AEF] group-hover:translate-x-0.5 transition-transform shrink-0">
                  Play ➔
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: OFFLINE IN-APP LIBRARY */}
      {activeLibraryTab === "offline" && (
        <div id="studio-offline-episodes-list" className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {offlineEpisodes.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1">
              <p className="text-xs font-bold text-slate-700">No Offline Episodes Yet</p>
              <p className="text-[10px] text-slate-500">
                Open any podcast above and tap "Save Offline" or "Download .wav" to store audio on your device for network-free listening!
              </p>
            </div>
          ) : (
            offlineEpisodes.map((offRec) => (
              <div
                key={offRec.id}
                onClick={() => onOpenPodcast(offRec.podcast)}
                className="p-2.5 rounded-xl bg-white hover:bg-emerald-50/40 border border-emerald-200/80 hover:border-emerald-300 transition cursor-pointer flex items-center justify-between gap-2 group shadow-2xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {offRec.title || offRec.topic}
                    </p>
                    <p className="text-[10px] text-emerald-700 flex items-center gap-1.5">
                      <span className="font-bold">✓ Ready Offline</span>
                      <span>•</span>
                      <span>{(offRec.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => onDownloadWav(offRec, e)}
                    title="Download .wav audio to device storage"
                    className="p-1.5 text-slate-500 hover:text-[#796AEF] hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => onDeleteOffline(offRec.id, e)}
                    title="Delete from offline storage"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
