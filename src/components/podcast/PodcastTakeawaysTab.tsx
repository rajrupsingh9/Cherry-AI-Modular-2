/**
 * PodcastTakeawaysTab.tsx
 * Episode executive overview, numbered high-yield takeaways, and exam cautions
 */
import React from "react";
import { Sparkles, AlertTriangle, Download } from "lucide-react";
import { AudioPodcastData } from "../../types";

interface PodcastTakeawaysTabProps {
  podcast: AudioPodcastData;
  onDownloadTakeaways: () => void;
}

export const PodcastTakeawaysTab: React.FC<PodcastTakeawaysTabProps> = ({
  podcast,
  onDownloadTakeaways,
}) => {
  return (
    <div id="podcast-takeaways-tab-content" className="flex flex-col gap-4">
      {/* Executive Summary */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-slate-800">
        <div className="flex items-center gap-2 font-bold text-xs text-[#796AEF] mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Episode Executive Summary</span>
        </div>
        <p className="text-xs leading-relaxed text-slate-700 font-medium">
          {podcast.overview}
        </p>
      </div>

      {/* Numbered High-Yield Takeaways */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
          🎯 High-Yield Takeaways
        </span>
        {podcast.keyTakeaways.map((takeaway, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              {i + 1}
            </div>
            <p className="text-xs text-slate-800 font-medium leading-relaxed">
              {takeaway}
            </p>
          </div>
        ))}
      </div>

      {/* Exam Trap Caution */}
      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2 text-xs">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <span>
          <strong>Exam Caution:</strong> Revision audio is optimized for building intuitive mental models. Pair this with numerical practice and PYQ solving for complete mastery.
        </span>
      </div>

      {/* Download Key Takeaways & Transcript Button */}
      <button
        type="button"
        onClick={onDownloadTakeaways}
        className="w-full py-2.5 px-4 rounded-xl bg-[#796AEF] hover:bg-[#6858e0] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
      >
        <Download className="w-4 h-4" />
        <span>Download Takeaways & Full Audio Transcript (.md)</span>
      </button>
    </div>
  );
};
