/**
 * SubtopicDrilldownModal.tsx
 * Modal drilldown examining past question attempts, submitted steps, and model solutions.
 */
import React from "react";
import { Sparkles, X, Zap } from "lucide-react";
import { ProcessedSubtopic } from "./microTypes";

interface SubtopicDrilldownModalProps {
  selectedDrillSubtopic: ProcessedSubtopic;
  onClose: () => void;
  onDiscussWithCherry?: (topicDetails: {
    topic: string;
    question?: string;
    answer?: string;
    hint?: string;
    conceptTested?: string;
    subject?: string;
  }) => void;
  onEnterClassroom?: () => void;
}

export const SubtopicDrilldownModal: React.FC<SubtopicDrilldownModalProps> = ({
  selectedDrillSubtopic,
  onClose,
  onDiscussWithCherry,
  onEnterClassroom,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-left">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-white border-b border-slate-100 text-slate-900 flex items-center justify-between shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-50 text-[#796AEF] border border-indigo-100/90 px-2 py-0.5 rounded-md">
                {selectedDrillSubtopic.subject} • {selectedDrillSubtopic.chapter}
              </span>
              <span className="text-[11px] font-mono text-slate-500 font-medium">
                Mastery: <strong className="text-slate-900 font-bold">{selectedDrillSubtopic.masteryScore}%</strong>
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {selectedDrillSubtopic.name} • Diagnostics
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Prescription Banner */}
          <div className="bg-indigo-50/70 border border-indigo-100/90 rounded-2xl p-3.5 text-xs text-indigo-950 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#796AEF] shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">
                Socratic Strategy:
              </strong>{" "}
              {selectedDrillSubtopic.prescriptionHint}
            </div>
          </div>

          {/* Question Logs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Diagnostic Problem History ({selectedDrillSubtopic.recentQuestions?.length || 0})
            </h4>

            {selectedDrillSubtopic.recentQuestions?.map((q, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border space-y-2.5 ${
                  q.isCorrect
                    ? "bg-emerald-50/30 border-emerald-200/80"
                    : "bg-rose-50/30 border-rose-200/80"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    Problem #{idx + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500">
                      {q.latencySec}s
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                        q.isCorrect
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {q.isCorrect
                        ? "Solved Correctly"
                        : `${q.mistakeType || "Review"} Error`}
                    </span>
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-900 leading-snug">
                  {q.question}
                </p>

                <div className="bg-white p-2.5 rounded-xl border border-slate-100 text-[11.5px] space-y-1.5 leading-relaxed">
                  <div className="text-slate-600">
                    <strong className="text-slate-800 font-bold">
                      Your Submitted Step:
                    </strong>{" "}
                    {q.userAnswer}
                  </div>
                  <div className="text-emerald-900">
                    <strong className="text-emerald-950 font-bold">
                      Standard Derivation:
                    </strong>{" "}
                    {q.explanation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Close Drilldown
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onDiscussWithCherry) {
                onDiscussWithCherry({
                  topic: selectedDrillSubtopic.name,
                  subject: selectedDrillSubtopic.subject,
                  conceptTested: selectedDrillSubtopic.name,
                  hint: selectedDrillSubtopic.prescriptionHint,
                  question: `Cherry Ma'am, please explain ${selectedDrillSubtopic.name} step-by-step on the blackboard with a targeted problem to fix my calculation accuracy.`,
                });
              } else if (onEnterClassroom) {
                onEnterClassroom();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-[#796AEF] hover:bg-indigo-700 text-white text-xs font-bold font-mono tracking-wide transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-white" />
            <span>Practice on Blackboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
