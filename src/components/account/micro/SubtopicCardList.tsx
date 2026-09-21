/**
 * SubtopicCardList.tsx
 * Sub-Topic Competency Card Deck / Grid with KaTeX formula references and direct practice triggers.
 */
import React from "react";
import { Search, Sparkles, Zap } from "lucide-react";
import katex from "katex";
import { ProcessedSubtopic } from "./microTypes";

interface SubtopicCardListProps {
  subtopics: ProcessedSubtopic[];
  microViewMode: "carousel" | "list";
  setSelectedDrillSubtopic: (sub: ProcessedSubtopic) => void;
  onDiscussWithCherry?: (topicDetails: {
    topic: string;
    question?: string;
    answer?: string;
    hint?: string;
    conceptTested?: string;
    subject?: string;
  }) => void;
  onEnterClassroom?: () => void;
  onResetFilters: () => void;
}

export const SubtopicCardList: React.FC<SubtopicCardListProps> = ({
  subtopics,
  microViewMode,
  setSelectedDrillSubtopic,
  onDiscussWithCherry,
  onEnterClassroom,
  onResetFilters,
}) => {
  if (subtopics.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200/80 space-y-2">
        <p className="text-xs text-slate-500 font-medium">
          No sub-topics found matching your search or filters.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-[11px] font-mono font-bold text-[#796AEF] underline cursor-pointer"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  return (
    <>
      {microViewMode === "carousel" && (
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1 pb-0.5 font-medium">
          <span>
            Horizontal swipe deck • {subtopics.length} topics
          </span>
          <span>Swipe or drag horizontally</span>
        </div>
      )}
      <div
        className={
          microViewMode === "carousel"
            ? "flex overflow-x-auto gap-3.5 pb-3 pt-0.5 snap-x snap-mandatory scrollbar-thin"
            : "grid grid-cols-1 md:grid-cols-2 gap-3.5"
        }
      >
        {subtopics.map((sub) => {
          const isCritical = sub.masteryStatus === "critical";
          const isMastered = sub.masteryStatus === "mastered";

          return (
            <div
              key={sub.id}
              className={`rounded-2xl border p-4 transition-all flex flex-col justify-between space-y-3.5 relative overflow-hidden bg-white shadow-2xs hover:shadow-xs ${
                microViewMode === "carousel"
                  ? "w-[85vw] sm:w-[360px] shrink-0 snap-center"
                  : ""
              } ${
                isCritical
                  ? "border-rose-200/90 hover:border-rose-300"
                  : isMastered
                    ? "border-emerald-200/90 hover:border-emerald-300"
                    : "border-slate-200/80 hover:border-slate-300"
              }`}
            >
              {/* Header: Subject badge & Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/70 shrink-0">
                      {sub.subject}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 font-medium truncate">
                      {sub.chapter}
                    </span>
                  </div>

                  {/* Mastery Status Badge */}
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      isCritical
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : isMastered
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {sub.masteryScore}%{" "}
                    {isCritical
                      ? "Gap"
                      : isMastered
                        ? "Mastered"
                        : "In Progress"}
                  </span>
                </div>

                <h5 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-snug">
                  {sub.name}
                </h5>
              </div>

              {/* Metrics bar: Accuracy & Latency */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 font-medium">
                    <span>Accuracy</span>
                    <span className="text-slate-900 font-bold">
                      {sub.accuracy}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCritical
                          ? "bg-rose-500"
                          : isMastered
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                      }`}
                      style={{ width: `${sub.accuracy}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1 border-l border-slate-200/80 pl-2.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 font-medium">
                    <span>Latency</span>
                    <span className="text-slate-900 font-bold">
                      {sub.avgLatencySec}s
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between font-medium">
                    <span>Target: {sub.benchmarkLatencySec}s</span>
                    {sub.avgLatencySec <= sub.benchmarkLatencySec ? (
                      <span className="text-emerald-600 font-bold">Fast</span>
                    ) : (
                      <span className="text-amber-600 font-bold">Pacing Lag</span>
                    )}
                  </div>
                </div>
              </div>

              {/* KaTeX Key Formulas / Rules */}
              {sub.keyFormulas && sub.keyFormulas.length > 0 && (
                <div className="bg-slate-50/80 text-slate-800 p-2.5 rounded-xl border border-slate-200/70 text-[11px] font-mono overflow-x-auto">
                  <div className="text-[9.5px] font-mono text-[#796AEF] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span>Formula Reference</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {sub.keyFormulas.slice(0, 2).map((formula, fIdx) => (
                      <span
                        key={fIdx}
                        dangerouslySetInnerHTML={{
                          __html: katex.renderToString(formula, {
                            throwOnError: false,
                          }),
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Socratic Prescription Tip */}
              <div className="text-[11px] text-slate-700 leading-relaxed bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/80 flex items-start gap-2 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#796AEF] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-slate-900 font-bold">
                    Coach Tip:
                  </strong>{" "}
                  {sub.prescriptionHint}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDrillSubtopic(sub)}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                >
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <span>Review ({sub.recentQuestions?.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onDiscussWithCherry) {
                      onDiscussWithCherry({
                        topic: sub.name,
                        subject: sub.subject,
                        conceptTested: sub.name,
                        hint: sub.prescriptionHint,
                        question: `Cherry Ma'am, please explain ${sub.name} step-by-step on the blackboard with a targeted problem to fix my calculation accuracy.`,
                      });
                    } else if (onEnterClassroom) {
                      onEnterClassroom();
                    }
                  }}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-[#796AEF] hover:bg-indigo-700 text-white text-[11px] font-bold tracking-wide font-mono transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 text-white" />
                  <span>Board Practice</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
