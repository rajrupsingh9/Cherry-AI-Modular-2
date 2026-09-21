/**
 * RapidFireSpeedDrillModal.tsx
 * Rapid-fire speed drill test modal with instant answer evaluation and shortcut reveals.
 */
import React from "react";
import { CheckCircle, Sparkles, X, Zap } from "lucide-react";
import { ClassifiedAgilityTopic } from "./agilityTypes";

interface RapidFireSpeedDrillModalProps {
  selectedAgilityDrillTopic: ClassifiedAgilityTopic;
  onClose: () => void;
  isEnglish: boolean;
  sprintStepIndex: number;
  setSprintStepIndex: (step: number) => void;
  setSprintScore: (score: number) => void;
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

export const RapidFireSpeedDrillModal: React.FC<RapidFireSpeedDrillModalProps> = ({
  selectedAgilityDrillTopic,
  onClose,
  isEnglish,
  sprintStepIndex,
  setSprintStepIndex,
  setSprintScore,
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
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-50 text-[#796AEF] px-2 py-0.5 rounded-md border border-indigo-100/90 shadow-2xs">
                {selectedAgilityDrillTopic.subject} • {isEnglish ? "45s Speed Drill" : "45s स्पीड ड्रिल"}
              </span>
              <span className="text-[10.5px] font-mono text-emerald-800 font-bold">
                {isEnglish ? "Benchmark: " : "आदर्श समय: "}
                <strong>
                  {selectedAgilityDrillTopic.benchmarkSec}s
                </strong>
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {selectedAgilityDrillTopic.topicName}
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

        {/* Speed Drill Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Question Card */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-mono text-[#796AEF]">
              <span className="font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#796AEF]" />{" "}
                {isEnglish ? "Rapid-Fire Question:" : "रैपिड-फ़ायर प्रश्न (Rapid Question):"}
              </span>
              <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {isEnglish ? "Target: <30s" : "लक्ष्य: <30s"}
              </span>
            </div>

            <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
              {selectedAgilityDrillTopic.rapidFireQuestion}
            </p>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {selectedAgilityDrillTopic.rapidFireOptions.map((opt: string, optIdx: number) => {
                const isCorrect = optIdx === selectedAgilityDrillTopic.correctOptionIndex;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => {
                      setSprintScore(isCorrect ? 100 : 0);
                      setSprintStepIndex(1);
                    }}
                    className={`min-h-[44px] p-3 rounded-xl border text-xs font-mono font-bold text-left transition-all cursor-pointer ${
                      sprintStepIndex > 0
                        ? isCorrect
                          ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-black shadow-2xs"
                          : "bg-rose-50 border-rose-200 text-rose-700 opacity-60"
                        : "bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800 hover:border-[#796AEF]"
                    }`}
                  >
                    <span className="text-[#796AEF] mr-2">
                      {String.fromCharCode(65 + optIdx)}.
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Solution & Speed Strategy Reveal if answered */}
          {sprintStepIndex > 0 && (
            <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 space-y-2 animate-fade-in text-[11.5px] font-mono shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-800 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />{" "}
                  {isEnglish ? "Correct Answer: Option " : "सही उत्तर: विकल्प "}
                  {String.fromCharCode(65 + selectedAgilityDrillTopic.correctOptionIndex)}
                </span>
                <span className="text-[#796AEF] font-bold">
                  {isEnglish ? "Shortcut Verified ✓" : "शॉर्टकट सत्यापित ✓"}
                </span>
              </div>
              <p className="text-slate-700 text-xs font-sans leading-relaxed">
                {selectedAgilityDrillTopic.explanation}
              </p>
              <div className="text-[11px] text-slate-700 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/80 mt-1">
                💡 <strong>{isEnglish ? "Blackboard Shortcut (Trick):" : "ब्लैकबोर्ड शॉर्टकट (Shortcut Trick):"}</strong>{" "}
                {selectedAgilityDrillTopic.speedStrategy}
              </div>
            </div>
          )}
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
              const drill = selectedAgilityDrillTopic;
              onClose();
              if (onDiscussWithCherry) {
                onDiscussWithCherry({
                  topic: drill.topicName,
                  subject: drill.subject,
                  conceptTested: drill.topicName,
                  hint: drill.explanation,
                  question: `Cherry Ma'am, let's do a fast 3-question speed sprint on ${drill.topicName} on the digital blackboard!`,
                });
              } else if (onEnterClassroom) {
                onEnterClassroom();
              }
            }}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#796AEF] hover:bg-indigo-700 text-white text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-white shrink-0" />
            <span>{isEnglish ? "Speed Sprint with Cherry 🚀" : "मैम के साथ स्पीड स्प्रिंट करें 🚀"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
