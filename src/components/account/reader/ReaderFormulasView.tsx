/**
 * ReaderFormulasView.tsx
 * Consolidated formula crib sheet tab displaying all LaTeX equations with copy and AI discussion capabilities.
 */
import React from "react";
import { Check, Copy, MessageSquare } from "lucide-react";
import { MathRenderer } from "../../MathRenderer";
import { BookFormulaItem, ReaderTab, ThemeStyleClasses } from "./readerTypes";

interface ReaderFormulasViewProps {
  allBookFormulas: BookFormulaItem[];
  setActiveTab: (tab: ReaderTab) => void;
  setActiveChapterIndex: (idx: number) => void;
  handleCopyFormula: (formulaStr: string, idx: number) => void;
  copiedFormulaIdx: number | null;
  onDiscussWithCherry?: (topicDetails: {
    topic: string;
    question?: string;
    answer?: string;
    hint?: string;
    conceptTested?: string;
    subject?: string;
  }) => void;
  stopSpeech: () => void;
  onClose: () => void;
  subject: string;
  themeClasses: ThemeStyleClasses;
}

export const ReaderFormulasView: React.FC<ReaderFormulasViewProps> = ({
  allBookFormulas,
  setActiveTab,
  setActiveChapterIndex,
  handleCopyFormula,
  copiedFormulaIdx,
  onDiscussWithCherry,
  stopSpeech,
  onClose,
  subject,
  themeClasses,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Formula Vault Header */}
      <div
        className={`px-6 sm:px-10 py-4 border-b ${themeClasses.pageRuler} flex items-center justify-between gap-3 shrink-0`}
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-mono opacity-75">
            <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold">
              ∑ FORMULA VAULT
            </span>
            <span>•</span>
            <span>{allBookFormulas.length} Master Derivations</span>
          </div>
          <h2 className="text-base sm:text-xl font-black tracking-tight leading-snug mt-1">
            Consolidated Mathematical & Scientific Formulas
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab("reader")}
          className={`min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${themeClasses.secondaryBtn}`}
        >
          ← Back to Notes
        </button>
      </div>

      {/* Formulas Content Grid */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-4 scrollbar-thin">
        {allBookFormulas.length === 0 ? (
          <div className="text-center py-16 opacity-60 font-mono text-xs space-y-2">
            <p>No LaTeX formula blocks detected in this book yet.</p>
            <p className="text-[11px] opacity-75">
              Formulas written with $ or $$ will automatically compile here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
            {allBookFormulas.map((item, fIdx) => (
              <div
                key={fIdx}
                className={`p-4 rounded-2xl border ${themeClasses.formulaCard} space-y-3 flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between gap-2 text-[10px] font-mono opacity-75">
                  <span className="font-bold">From: {item.chapterTitle}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveChapterIndex(item.chapterIndex);
                      setActiveTab("reader");
                    }}
                    className="text-teal-400 hover:underline text-[9.5px] cursor-pointer min-h-[44px] sm:min-h-[24px] flex items-center"
                  >
                    Jump to Ch #{item.chapterIndex + 1} →
                  </button>
                </div>

                <div className="py-2 overflow-x-auto text-center">
                  <MathRenderer content={`$$${item.formula}$$`} />
                </div>

                <div className="pt-2 border-t border-current/10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyFormula(item.formula, fIdx)}
                    className="min-h-[44px] sm:min-h-[28px] text-[10px] font-mono font-bold flex items-center gap-1.5 opacity-70 hover:opacity-100 cursor-pointer"
                    title="Copy raw LaTeX equation code"
                  >
                    {copiedFormulaIdx === fIdx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied LaTeX!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy LaTeX</span>
                      </>
                    )}
                  </button>

                  {onDiscussWithCherry && (
                    <button
                      type="button"
                      onClick={() => {
                        stopSpeech();
                        onClose();
                        onDiscussWithCherry({
                          topic: item.chapterTitle,
                          conceptTested: item.chapterTitle,
                          question: `Can you explain the derivation and physical meaning of the formula: $$${item.formula}$$?`,
                          subject: subject,
                        });
                      }}
                      className="min-h-[44px] sm:min-h-[28px] text-[10px] font-mono font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Ask Cherry</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
