/**
 * AgilityHeroHeader.tsx
 * Hero banner and 4 executive stamina & agility metrics.
 */
import React from "react";
import { StaminaAnalyticsData } from "./agilityTypes";

interface AgilityHeroHeaderProps {
  studentName?: string;
  isEnglish: boolean;
  staminaAnalyticsData: StaminaAnalyticsData;
}

export const AgilityHeroHeader: React.FC<AgilityHeroHeaderProps> = ({
  studentName,
  isEnglish,
  staminaAnalyticsData,
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 text-slate-900 shadow-xs relative overflow-hidden space-y-4">
      <div className="absolute -top-10 -right-10 w-52 h-52 bg-indigo-50/60 rounded-full blur-3xl pointer-events-none" />

      {/* Top Info Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 z-10 relative">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#796AEF] border border-indigo-100/90 text-[11px] font-bold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#796AEF] animate-pulse" />
              Speed-Accuracy &amp; Stamina Engine
            </span>
            <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200/70">
              Cognitive Benchmark: <strong className="text-slate-800">&lt;45s Latency</strong>
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            {studentName
              ? `${studentName}'s Socratic Agility, Fatigue Curve & Exam Readiness`
              : "Socratic Agility, Fatigue Curve & Exam Readiness"}
          </h3>
          <p className="text-xs text-slate-600 font-sans leading-relaxed max-w-2xl">
            Surgically correlates response latency against conceptual precision to eliminate test anxiety, over-calculation, and cognitive fatigue.
          </p>
        </div>
      </div>

      {/* 4 Summary Metrics - 2x2 Grid on Mobile, 4x1 on Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 z-10 relative pt-0.5">
        <div className="bg-slate-50/90 border border-slate-200/70 rounded-xl p-2.5 sm:p-3 text-center transition-all hover:bg-white hover:shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            {isEnglish ? "Mental Agility • Speed" : "मानसिक गति • Agility"}
          </span>
          <span className="text-lg sm:text-xl font-black text-slate-900 font-mono block my-0.5">
            {staminaAnalyticsData.agilityScore}/100
          </span>
          <span className="text-[10.5px] text-slate-600 font-medium block">
            {isEnglish ? "Thought & Solution Speed" : "विचार व हल गति"}
          </span>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 sm:p-3 text-center transition-all hover:bg-emerald-50 hover:shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            {isEnglish ? "Flow State • Flow (Q1)" : "फ़्लो स्टेट • Flow (Q1)"}
          </span>
          <span className="text-lg sm:text-xl font-black text-emerald-800 font-mono block my-0.5">
            {staminaAnalyticsData.flowCount}
          </span>
          <span className="text-[10.5px] text-emerald-800 font-semibold block">
            {isEnglish ? "<45s & >75% Accuracy" : "<45s व >75% सटीकता"}
          </span>
        </div>

        <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-2.5 sm:p-3 text-center transition-all hover:bg-sky-50 hover:shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">
            {isEnglish ? "Overthinking • Overthink (Q2)" : "अति-विचार • Overthink (Q2)"}
          </span>
          <span className="text-lg sm:text-xl font-black text-sky-800 font-mono block my-0.5">
            {staminaAnalyticsData.overthinkCount}
          </span>
          <span className="text-[10.5px] text-sky-800 font-semibold block">
            {isEnglish ? "Slow but Correct" : "धीमा पर सही हल"}
          </span>
        </div>

        <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-2.5 sm:p-3 text-center transition-all hover:bg-indigo-50 hover:shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#796AEF] block">
            {isEnglish ? "Projected Score • Target" : "अनुमानित स्कोर • Projected"}
          </span>
          <span className="text-lg sm:text-xl font-black text-[#796AEF] font-mono block my-0.5">
            {staminaAnalyticsData.projectedRawScore}%
          </span>
          <span className="text-[10.5px] text-[#796AEF] font-semibold block">
            {isEnglish
              ? `±${staminaAnalyticsData.confidenceMargin}% Exam Margin`
              : `±${staminaAnalyticsData.confidenceMargin}% परीक्षा दायरा`}
          </span>
        </div>
      </div>
    </div>
  );
};
