/**
 * BoardReadinessEstimatorTile.tsx
 * Target Board Exam Readiness Index, Predicted Grade Band & Action Triggers.
 */
import React from "react";
import { FileText, Sparkles } from "lucide-react";

interface BoardReadinessEstimatorTileProps {
  dashboardStats: any;
  grade: string | number;
  board?: string;
  onOpenReportCard?: () => void;
  onOpenKiaraVoice?: () => void;
}

export const BoardReadinessEstimatorTile: React.FC<BoardReadinessEstimatorTileProps> = ({
  dashboardStats,
  grade,
  board = "CBSE",
  onOpenReportCard,
  onOpenKiaraVoice
}) => {
  const examReadinessScore = Math.min(
    100,
    Math.max(
      10,
      Math.round(
        dashboardStats.conceptClarity * 0.25 +
          dashboardStats.theoreticalCore * 0.2 +
          dashboardStats.calculationPrecision * 0.25 +
          dashboardStats.formulaRecall * 0.15 +
          dashboardStats.socraticStamina * 0.15,
      ),
    ),
  );

  const projectedPercentile = Math.min(
    99.4,
    75 + (examReadinessScore - 50) * 0.45,
  ).toFixed(1);

  const gradeBand =
    examReadinessScore >= 90
      ? "A1 (91–100%) • Top Distinction"
      : examReadinessScore >= 80
        ? "A2 (81–90%) • Outstanding"
        : examReadinessScore >= 70
          ? "B1 (71–80%) • Solid Merit"
          : examReadinessScore >= 60
            ? "B2 (61–70%) • Good Progress"
            : "C1 (51–60%) • Foundation Reinforcement Needed";

  return (
    <div className="bg-white border border-[#EFF1F5] rounded-2xl p-4 sm:p-5 text-[#1E293B] shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5 text-left">
      <div className="space-y-2.5 max-w-xl z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#796AEF] border border-indigo-200/60 text-[10.5px] font-bold uppercase tracking-wider font-sans">
            🎯 Board Readiness Metric
          </span>
          <span className="text-[11px] font-sans font-semibold text-[#4A4E5A]">
            Curriculum: {grade || "Class 10"} • {board || "CBSE"}
          </span>
        </div>
        <h3 className="text-sm sm:text-base font-bold text-[#1E293B] tracking-tight flex items-center gap-2">
          <span>Target Board Exam Readiness Index</span>
          <span className="text-[#796AEF] font-bold">
            ({examReadinessScore}%)
          </span>
        </h3>
        <p className="text-xs text-[#4A4E5A] font-sans leading-relaxed">
          Predicted Grade Band:{" "}
          <strong className="text-[#1E293B] font-bold">
            {gradeBand}
          </strong>{" "}
          • Estimated Percentile:{" "}
          <strong className="text-emerald-700 font-bold">
            Top {projectedPercentile}%
          </strong>{" "}
          nationwide.
        </p>
        <div className="w-full bg-[#F6F7FB] h-2.5 rounded-full overflow-hidden border border-[#EFF1F5]">
          <div
            className="h-full bg-[#796AEF] rounded-full transition-all duration-500"
            style={{ width: `${examReadinessScore}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 z-10 w-full md:w-auto">
        <button
          type="button"
          onClick={() => {
            if (onOpenReportCard) onOpenReportCard();
          }}
          className="px-4 py-2.5 bg-[#796AEF] hover:bg-[#6858e0] active:scale-95 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <FileText className="w-4 h-4 stroke-[2.5]" />
          <span>Generate Report Card 🎓</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (onOpenKiaraVoice) onOpenKiaraVoice();
          }}
          className="px-4 py-2.5 bg-[#F6F7FB] hover:bg-slate-100 active:scale-95 text-[#1E293B] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#EFF1F5] shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Kiara Strategy Call 🎙️</span>
        </button>
      </div>
    </div>
  );
};
