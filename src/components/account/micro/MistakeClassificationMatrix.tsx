/**
 * MistakeClassificationMatrix.tsx
 * 4-Way Mistake Classification Matrix (Conceptual, Calculation, Formula, Speed).
 */
import React from "react";
import { Crosshair, X } from "lucide-react";
import { MistakeArchetype, MicroDiagnosticsData } from "./microTypes";

interface MistakeClassificationMatrixProps {
  microDiagnosticsData: MicroDiagnosticsData;
  microMistakeFilter: "all" | MistakeArchetype;
  setMicroMistakeFilter: (filter: "all" | MistakeArchetype) => void;
}

export const MistakeClassificationMatrix: React.FC<MistakeClassificationMatrixProps> = ({
  microDiagnosticsData,
  microMistakeFilter,
  setMicroMistakeFilter,
}) => {
  const toggleMistakeFilter = (archetype: MistakeArchetype) => {
    setMicroMistakeFilter(microMistakeFilter === archetype ? "all" : archetype);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-[#796AEF] border border-indigo-100/90 flex items-center justify-center text-xs shadow-2xs shrink-0">
              <Crosshair className="w-3.5 h-3.5 text-[#796AEF]" />
            </span>
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              Error Classification Matrix
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Tap any mistake archetype to filter and target vulnerable sub-topics.
          </p>
        </div>

        {microMistakeFilter !== "all" && (
          <button
            type="button"
            onClick={() => setMicroMistakeFilter("all")}
            className="text-[11px] font-bold text-[#796AEF] bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200/80 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-2xs min-h-[36px]"
          >
            <X className="w-3.5 h-3.5" /> <span>Clear Filter (Reset)</span>
          </button>
        )}
      </div>

      {/* 4 Mistake Archetype Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* 1. Conceptual Gap */}
        <div
          onClick={() => toggleMistakeFilter("conceptual")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[128px] ${
            microMistakeFilter === "conceptual"
              ? "bg-rose-50/90 border-rose-500 ring-2 ring-rose-400/40 shadow-xs"
              : "bg-white hover:bg-rose-50/30 border-slate-200/80 hover:border-rose-300"
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🎯</span>
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  Conceptual
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {microDiagnosticsData.mistakeDistribution.conceptual.percent}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
              Misunderstanding fundamental rules, theorems, or core definitions.
            </p>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all"
                style={{
                  width: `${microDiagnosticsData.mistakeDistribution.conceptual.percent}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold">
              <span className="text-rose-600">Visual Derivations</span>
              {microMistakeFilter === "conceptual" && (
                <span className="text-[#796AEF] font-black">● Active</span>
              )}
            </div>
          </div>
        </div>

        {/* 2. Calculation Slip */}
        <div
          onClick={() => toggleMistakeFilter("calculation")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[128px] ${
            microMistakeFilter === "calculation"
              ? "bg-amber-50/90 border-amber-500 ring-2 ring-amber-400/40 shadow-xs"
              : "bg-white hover:bg-amber-50/30 border-slate-200/80 hover:border-amber-300"
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🧮</span>
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  Calculation
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {microDiagnosticsData.mistakeDistribution.calculation.percent}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
              Sign errors (+/-), algebraic transposition, or arithmetic oversights.
            </p>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{
                  width: `${microDiagnosticsData.mistakeDistribution.calculation.percent}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold">
              <span className="text-amber-600">Step-Checking</span>
              {microMistakeFilter === "calculation" && (
                <span className="text-[#796AEF] font-black">● Active</span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Formula Misrecall */}
        <div
          onClick={() => toggleMistakeFilter("formula")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[128px] ${
            microMistakeFilter === "formula"
              ? "bg-indigo-50/90 border-[#796AEF] ring-2 ring-indigo-400/40 shadow-xs"
              : "bg-white hover:bg-indigo-50/30 border-slate-200/80 hover:border-indigo-300"
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <span className="text-base">⚡</span>
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  Formula Recall
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {microDiagnosticsData.mistakeDistribution.formula.percent}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
              Misremembering standard formulas, exponents, or unit conversions.
            </p>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#796AEF] rounded-full transition-all"
                style={{
                  width: `${microDiagnosticsData.mistakeDistribution.formula.percent}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold">
              <span className="text-[#796AEF]">Formula Cards</span>
              {microMistakeFilter === "formula" && (
                <span className="text-[#796AEF] font-black">● Active</span>
              )}
            </div>
          </div>
        </div>

        {/* 4. Speed / Panic Trap */}
        <div
          onClick={() => toggleMistakeFilter("speed")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[128px] ${
            microMistakeFilter === "speed"
              ? "bg-sky-50/90 border-sky-500 ring-2 ring-sky-400/40 shadow-xs"
              : "bg-white hover:bg-sky-50/30 border-slate-200/80 hover:border-sky-300"
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <span className="text-base">⏱️</span>
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  Speed Trap
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {microDiagnosticsData.mistakeDistribution.speed.percent}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
              Rushing under time pressure or misreading problem statements.
            </p>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all"
                style={{
                  width: `${microDiagnosticsData.mistakeDistribution.speed.percent}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold">
              <span className="text-sky-600">45s Pacing Sprints</span>
              {microMistakeFilter === "speed" && (
                <span className="text-[#796AEF] font-black">● Active</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
