/**
 * PrerequisiteHeroHeader.tsx
 * Hero banner presenting multi-year root tracing and global foundation metrics.
 */
import React from "react";
import { GitFork } from "lucide-react";

interface PrerequisiteHeroHeaderProps {
  isEng: boolean;
  totalBrokenLinks: number;
  totalShakyBridges: number;
  totalSolidRoots: number;
}

export const PrerequisiteHeroHeader: React.FC<PrerequisiteHeroHeaderProps> = ({
  isEng,
  totalBrokenLinks,
  totalShakyBridges,
  totalSolidRoots
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 text-slate-900 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/50 rounded-full blur-2xl pointer-events-none" />

      <div className="space-y-2 min-w-0 z-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs bg-indigo-50 text-indigo-700 font-mono px-3 py-1 rounded-full font-bold border border-indigo-200/80 flex items-center gap-1.5 shadow-2xs">
            <GitFork className="w-3.5 h-3.5 text-[#796AEF]" />
            {isEng ? "Cognitive Prerequisite Graph • Foundation Diagnostics" : "Cognitive Prerequisite Graph • बुनियादी समझ व फाउंडेशन गैप्स"}
          </span>
          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {isEng ? "Multi-Year Root Tracing (Classes 9-12)" : "Multi-Year Root Tracing (कक्षा 9-12)"}
          </span>
        </div>

        <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-tight flex flex-wrap items-center gap-2">
          <span>{isEng ? "Upstream Prerequisite Diagnostics & Root Gaps" : "बुनियादी कमजोरी पहचानें: Upstream Prerequisite Gaps"}</span>
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed max-w-2xl">
          {isEng
            ? "STEM subjects build sequentially like a multi-story building. When you get stuck on a Class 12 derivation or complex numerical, the true root obstacle is often a missing bridge or broken foundation from Class 9 or 10. Trace and repair the root cause below."
            : "STEM विषय एक बहुमंजिला इमारत की तरह हैं। जब कक्षा 12 के किसी कठिन सवाल या डेरिवेशन में रुकावट आती है, तो असली कारण 12वीं का सूत्र नहीं बल्कि कक्षा 9 या 10 का कोई अनसुलझा गैप होता है। नीचे दिए गए रूट कॉज़ ट्री से तुरंत समझें और सुधारें।"}
        </p>
      </div>

      {/* Global Graph Metrics - 3-col Grid */}
      <div className="grid grid-cols-3 gap-2.5 w-full md:w-auto shrink-0 z-10">
        <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-3 text-center shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 block">
            {isEng ? "Broken Links" : "टूटी कड़ियाँ"}
          </span>
          <span className="text-lg sm:text-xl font-black text-rose-700 font-mono">
            {totalBrokenLinks}
          </span>
          <span className="text-[9.5px] text-rose-500 font-medium block">Broken Links</span>
        </div>

        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3 text-center shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 block">
            {isEng ? "Shaky Bridges" : "कमजोर पुल"}
          </span>
          <span className="text-lg sm:text-xl font-black text-amber-800 font-mono">
            {totalShakyBridges}
          </span>
          <span className="text-[9.5px] text-amber-600 font-medium block">Shaky Bridges</span>
        </div>

        <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3 text-center shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 block">
            {isEng ? "Solid Roots" : "मजबूत नींव"}
          </span>
          <span className="text-lg sm:text-xl font-black text-emerald-800 font-mono">
            {totalSolidRoots}
          </span>
          <span className="text-[9.5px] text-emerald-600 font-medium block">Solid Roots</span>
        </div>
      </div>
    </div>
  );
};
