/**
 * QuizSolutionsReview.tsx
 * Detailed Question Solutions & Explanations Review Component
 */
import React from "react";
import { BookOpen, HelpCircle } from "lucide-react";
import { QuizQuestion, QuizAnswerHistoryItem } from "./quizTypes";

interface QuizSolutionsReviewProps {
  questions: QuizQuestion[];
  answersHistory: QuizAnswerHistoryItem[];
}

export const QuizSolutionsReview: React.FC<QuizSolutionsReviewProps> = ({
  questions,
  answersHistory
}) => {
  return (
    <div className="bg-[#FFFFFF] border border-[#EFF1F5] p-4 rounded-2xl shadow-xs space-y-4 text-left">
      <div className="flex items-center gap-1.5 border-b border-[#EFF1F5] pb-2">
        <BookOpen className="w-4 h-4 text-[#796AEF]" />
        <h6 className="text-[12px] font-sans font-black uppercase tracking-wider text-[#1E293B]">
          Detailed Solutions & Review
        </h6>
      </div>

      <div className="space-y-4 divide-y divide-[#EFF1F5]">
        {questions.map((q, idx) => {
          const record = answersHistory.find(h => h.questionIndex === idx);
          const isCorrect = record ? record.isCorrect : false;
          const selectedOpt = record ? record.selectedOption : -1;

          return (
            <div key={q.id || idx} className="pt-3 first:pt-0 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[10.5px] font-mono font-black text-slate-400 uppercase">
                    QUESTION {idx + 1}
                  </span>
                  <h5 className="text-[12.5px] sm:text-[13px] font-extrabold text-[#1E293B] leading-snug">
                    {q.question}
                  </h5>
                </div>
                {selectedOpt === -1 ? (
                  <span className="text-[10px] font-bold uppercase bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md shrink-0 border border-amber-100">
                    Timed Out
                  </span>
                ) : isCorrect ? (
                  <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md shrink-0 border border-emerald-100">
                    Correct
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md shrink-0 border border-rose-100">
                    Incorrect
                  </span>
                )}
              </div>

              {/* Options with feedback colors */}
              <div className="grid grid-cols-1 gap-1.5 pl-1">
                {q.options.map((opt, oIdx) => {
                  const wasSelected = selectedOpt === oIdx;
                  const isTheCorrectOpt = q.correctAnswer === oIdx;

                  let badgeClass = "border-[#EFF1F5] text-[#4A4E5A] bg-[#F6F7FB]";
                  if (isTheCorrectOpt) {
                    badgeClass = "border-emerald-200 bg-emerald-50 text-emerald-900 font-extrabold";
                  } else if (wasSelected && !isCorrect) {
                    badgeClass = "border-rose-200 bg-rose-50 text-rose-900 font-bold";
                  }

                  return (
                    <div
                      key={oIdx}
                      className={`p-2 rounded-lg border text-[11px] flex items-center justify-between transition-colors ${badgeClass}`}
                    >
                      <span className="leading-tight">{opt}</span>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {isTheCorrectOpt && (
                          <span className="text-[9.5px] font-mono font-black text-emerald-700 uppercase bg-emerald-100/60 px-1.5 py-0.5 rounded">
                            Correct Answer ✓
                          </span>
                        )}
                        {wasSelected && !isTheCorrectOpt && (
                          <span className="text-[9.5px] font-mono font-bold text-rose-700 uppercase bg-rose-100/60 px-1.5 py-0.5 rounded">
                            Your Pick ✗
                          </span>
                        )}
                        {wasSelected && isTheCorrectOpt && (
                          <span className="text-[9.5px] font-mono font-bold text-emerald-700 uppercase bg-emerald-100/60 px-1.5 py-0.5 rounded">
                            Your Pick ✓
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mathematical Formula / Intuition note */}
              {q.calculationFormula && q.calculationFormula !== "None" && (
                <div className="bg-[#F6F7FB] border border-[#EFF1F5] p-2 rounded-lg flex items-start gap-1.5 text-[11px] font-mono">
                  <span className="font-bold text-[#796AEF] shrink-0">Formula / Rule:</span>
                  <span className="text-[#1E293B]">{q.calculationFormula}</span>
                </div>
              )}

              {/* Detailed Explanation */}
              <div className="bg-[#796AEF]/5 border border-[#796AEF]/15 p-2.5 rounded-xl space-y-1">
                <div className="flex items-center gap-1 text-[#796AEF] text-[10.5px] font-bold uppercase tracking-wider">
                  <HelpCircle className="w-3 h-3 text-[#796AEF]" />
                  <span>Explanation & Reasoning:</span>
                </div>
                <p className="text-[11.5px] text-[#4A4E5A] leading-relaxed font-medium">
                  {q.explanation}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
