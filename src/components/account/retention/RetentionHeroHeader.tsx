/**
 * RetentionHeroHeader.tsx
 * Spaced Repetition engine hero banner with Leitner algorithm indicators and 4 summary metrics.
 */
import React from "react";
import { RetentionEngineData } from "./retentionTypes";

interface RetentionHeroHeaderProps {
  studentName?: string;
  isEnglish: boolean;
  retentionEngineData: RetentionEngineData;
}

export const RetentionHeroHeader: React.FC<RetentionHeroHeaderProps> = ({
  studentName,
  isEnglish,
  retentionEngineData,
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 text-slate-900 shadow-xs relative overflow-hidden space-y-4">
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-50/60 rounded-full blur-3xl pointer-events-none" />

      {/* Top Info Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 z-10 relative">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#796AEF] border border-indigo-100/90 text-[11px] font-bold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#796AEF] animate-pulse" />
              Spaced Repetition Engine
            </span>
            <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200/70">
              Algorithm: <strong className="text-slate-800">Ebbinghaus R = e^(-t/S)</strong>
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            {studentName
              ? `${studentName}'s Memory Decay & Spaced Repetition Radar`
              : "Memory Decay & Spaced Repetition Radar"}
          </h3>
          <p className="text-xs text-slate-600 font-sans leading-relaxed max-w-2xl">
            {isEnglish
              ? "Scientifically schedules chalkboard flashcard reviews at Day 1, 3, 7, 14, and 30 intervals to reset memory decay back to 100%."
              : "विस्मृति को 100% पर रीसेट करने के लिए 1, 3, 7, 14, और 30 दिन के अंतराल पर वैज्ञानिक रूप से ब्लैकबोर्ड फ्लैशकार्ड रिवीज़न निर्धारित करता है।"}
          </p>
        </div>
      </div>

      {/* 4 Summary Metrics - 2x2 Grid on Mobile, 4x1 on Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 z-10 relative pt-0.5">
        <div className="bg-slate-50/90 border border-slate-200/70 rounded-xl p-2.5 sm:p-3 text-center transition-all hover:bg-white hover:shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            {isEnglish ? "Avg Retention" : "औसत याददाश्त • Memory"}
          </span>
          <span className="text-lg sm:text-xl font-black text-slate-900 font-mono block my-0.5">
            {retentionEngineData.avgRetention}%
          </span>
          <span className="text-[10.5px] text-slate-600 font-medium block">
            {isEnglish ? "Across All Topics" : "समग्र विषयों की स्थिति"}
          </span>
        </div>

        <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-2.5 sm:p-3 text-center transition-all hover:bg-rose-50 hover:shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
            {isEnglish ? "Due for Revision" : "आज रिवीज़न ज़रूरी • Due"}
          </span>
          <span className="text-lg sm:text-xl font-black text-rose-700 font-mono block my-0.5">
            {retentionEngineData.criticalCount}
          </span>
          <span className="text-[10.5px] text-rose-700 font-semibold block">
            {isEnglish ? "<50% (High Decay Risk)" : "<50% (भूलने का जोखिम)"}
          </span>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 sm:p-3 text-center transition-all hover:bg-amber-50 hover:shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
            {isEnglish ? "Review Soon" : "जल्द दोहराएं • Soon"}
          </span>
          <span className="text-lg sm:text-xl font-black text-amber-800 font-mono block my-0.5">
            {retentionEngineData.warningCount}
          </span>
          <span className="text-[10.5px] text-amber-800 font-semibold block">
            {isEnglish ? "50–72% (Moderate Retention)" : "50–72% (मध्यम स्तर)"}
          </span>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 sm:p-3 text-center transition-all hover:bg-emerald-50 hover:shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            {isEnglish ? "Optimal Retention" : "पक्की याददाश्त • Optimal"}
          </span>
          <span className="text-lg sm:text-xl font-black text-emerald-800 font-mono block my-0.5">
            {retentionEngineData.stableCount}
          </span>
          <span className="text-[10.5px] text-emerald-800 font-semibold block">
            {isEnglish ? "73%+ (Long-Term Retained)" : "73%+ (दीर्घकालिक सुरक्षित)"}
          </span>
        </div>
      </div>
    </div>
  );
};
