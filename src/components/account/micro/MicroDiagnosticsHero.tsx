/**
 * MicroDiagnosticsHero.tsx
 * Hero banner and 4 executive summary metrics for Granular Micro-Diagnostics.
 */
import React from "react";
import { MicroDiagnosticsData } from "./microTypes";

interface MicroDiagnosticsHeroProps {
  subject: string;
  grade: string | number;
  microDiagnosticsData: MicroDiagnosticsData;
}

export const MicroDiagnosticsHero: React.FC<MicroDiagnosticsHeroProps> = ({
  subject,
  grade,
  microDiagnosticsData,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-slate-900 shadow-2xs relative overflow-hidden space-y-4">
      {/* Top Info Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#796AEF] border border-indigo-100/90 text-[11px] font-bold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#796AEF] animate-pulse" />
              Micro Overview
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100/90 px-2.5 py-0.5 rounded-full border border-slate-200/80">
              {subject} • {grade}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Sub-Topic Mastery &amp; Error Matrix
          </h3>
          <p className="text-xs text-slate-500 font-normal leading-relaxed max-w-2xl">
            Granular diagnostic of conceptual gaps, arithmetic precision, formula retention, and pacing health.
          </p>
        </div>
      </div>

      {/* 4 Summary Metrics - Clean 2x2 on Mobile, 4x1 on Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 border-t border-slate-100">
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 text-left transition-all hover:bg-white hover:shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
            Total Topics
          </span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {microDiagnosticsData.allSubtopics.length}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">sub-topics</span>
          </div>
          <span className="text-[10.5px] text-slate-500 font-medium block">
            Curriculum Scope
          </span>
        </div>

        <div className="bg-rose-50/40 border border-rose-200/70 rounded-xl p-3 text-left transition-all hover:bg-rose-50/80 hover:shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 block">
            Critical Gaps
          </span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-xl sm:text-2xl font-black text-rose-600 font-mono">
              {microDiagnosticsData.criticalGapsCount}
            </span>
            <span className="text-[10px] text-rose-400 font-mono">&lt;60% score</span>
          </div>
          <span className="text-[10.5px] text-rose-600 font-medium block">
            High Priority Fix
          </span>
        </div>

        <div className="bg-amber-50/40 border border-amber-200/70 rounded-xl p-3 text-left transition-all hover:bg-amber-50/80 hover:shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 block">
            In Progress
          </span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
              {microDiagnosticsData.practicingCount}
            </span>
            <span className="text-[10px] text-amber-500 font-mono">60–84%</span>
          </div>
          <span className="text-[10.5px] text-amber-600 font-medium block">
            Approaching Mastery
          </span>
        </div>

        <div className="bg-emerald-50/40 border border-emerald-200/70 rounded-xl p-3 text-left transition-all hover:bg-emerald-50/80 hover:shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 block">
            Avg Latency
          </span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
              {microDiagnosticsData.overallAvgLatency}s
            </span>
            <span className="text-[10px] text-emerald-500 font-mono">/ question</span>
          </div>
          <span className="text-[10.5px] text-emerald-600 font-medium block">
            Pacing Health
          </span>
        </div>
      </div>
    </div>
  );
};
