/**
 * ChalkboardFlashcardModal.tsx
 * Interactive flip flashcard modal with KaTeX equation rendering and digital blackboard action.
 */
import React from "react";
import { RotateCw, Sparkles, X } from "lucide-react";
import { renderKaTeXHtmlSafe } from "../../../utils/whiteboardPdfCompiler";
import { RetentionComputedItem } from "./retentionTypes";

interface ChalkboardFlashcardModalProps {
  selectedRetentionFlashcard: RetentionComputedItem;
  onClose: () => void;
  isEnglish: boolean;
  activeFlashcardFlipped: boolean;
  setActiveFlashcardFlipped: (flipped: boolean) => void;
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

export const ChalkboardFlashcardModal: React.FC<ChalkboardFlashcardModalProps> = ({
  selectedRetentionFlashcard,
  onClose,
  isEnglish,
  activeFlashcardFlipped,
  setActiveFlashcardFlipped,
  onDiscussWithCherry,
  onEnterClassroom,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-white border border-slate-200/80 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden text-left text-slate-900">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0">
          <div className="space-y-0.5 min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-indigo-50 text-[#796AEF] border border-indigo-100/90 px-2 py-0.5 rounded-md shadow-2xs">
                {selectedRetentionFlashcard.subject} • {isEnglish ? "Flashcard" : "फ्लैशकार्ड"}
              </span>
              <span className="text-[10.5px] font-mono text-slate-500">
                {isEnglish ? "Retention: " : "याददाश्त स्तर: "}
                <strong className="text-slate-900 font-bold">
                  {selectedRetentionFlashcard.currentRetention}%
                </strong>
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900 truncate">
              {selectedRetentionFlashcard.topicName}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] sm:min-h-[38px] sm:min-w-[38px] flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title={isEnglish ? "Close" : "बंद करें"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Flashcard Body */}
        <div className="p-5 sm:p-6 flex flex-col items-center justify-center text-center space-y-3">
          <div
            onClick={() => setActiveFlashcardFlipped(!activeFlashcardFlipped)}
            className="w-full bg-slate-50/90 border border-slate-200/80 hover:border-[#796AEF]/60 rounded-2xl p-5 sm:p-6 transition-all cursor-pointer shadow-2xs space-y-3 relative group"
          >
            <div className="text-[10px] font-mono text-[#796AEF] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
              <RotateCw className="w-3 h-3 animate-spin-slow" />
              <span>
                {activeFlashcardFlipped
                  ? (isEnglish ? "Answer & Explanation (Tap to Flip)" : "उत्तर व व्याख्या • Answer (टैप करें)")
                  : (isEnglish ? "Question Prompt (Tap to reveal solution)" : "प्रश्न / संकेत • Prompt (टैप करके समाधान देखें)")}
              </span>
            </div>

            {!activeFlashcardFlipped ? (
              <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed py-2">
                {selectedRetentionFlashcard.flashcardPrompt}
              </p>
            ) : (
              <div className="space-y-3 animate-fade-in text-left py-1">
                <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                  {selectedRetentionFlashcard.flashcardAnswer}
                </p>
                {selectedRetentionFlashcard.formulaKatex && (
                  <div className="p-3 bg-white rounded-xl border border-indigo-100 text-center font-mono text-slate-900 shadow-2xs overflow-x-auto">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: renderKaTeXHtmlSafe(
                          selectedRetentionFlashcard.formulaKatex,
                        ),
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="text-[10.5px] font-mono text-slate-500 pt-1 font-medium">
              💡 {isEnglish ? "Active recall strengthens neural retention 3x faster." : "सक्रिय पुनरावृत्ति (Active recall) याददाश्त को 3 गुना तेज़ करती है।"}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            {isEnglish ? "Close" : "बंद करें (Close)"}
          </button>

          <button
            type="button"
            onClick={() => {
              const card = selectedRetentionFlashcard;
              onClose();
              if (onDiscussWithCherry) {
                onDiscussWithCherry({
                  topic: card.topicName,
                  subject: card.subject,
                  conceptTested: card.topicName,
                  hint: card.flashcardAnswer,
                  question: `Cherry Ma'am, please explain ${card.topicName} on the chalkboard with an intuitive example so I retain it long-term.`,
                });
              } else if (onEnterClassroom) {
                onEnterClassroom();
              }
            }}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#796AEF] hover:bg-indigo-700 text-white text-xs font-bold font-mono tracking-wide transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>{isEnglish ? "Ask Ma'am on Blackboard 🚀" : "मैम से ब्लैकबोर्ड पर पूछें 🚀"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
