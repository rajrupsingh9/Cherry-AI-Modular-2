/**
 * SprintSpeedDiagnosisCard.tsx
 * Post-submission speed analysis, 10-second mental shortcuts, and speed trap deconstruction.
 */
import React from "react";
import { CheckCircle2, XCircle, Timer, Sparkles, Zap, ShieldAlert } from "lucide-react";
import { ExamPacingProfile, SpeedQuestion } from "./sprintTypes";

interface SprintSpeedDiagnosisCardProps {
  isEng: boolean;
  activeQuestion: SpeedQuestion;
  activeProfile: ExamPacingProfile;
  selectedOptionIndex: number | null;
  elapsedSeconds: number;
  onDiscussWithCherry?: (params: {
    topic: string;
    subject: string;
    conceptTested?: string;
    hint?: string;
    question?: string;
  }) => void;
  onEnterClassroom?: () => void;
}

export const SprintSpeedDiagnosisCard: React.FC<SprintSpeedDiagnosisCardProps> = ({
  isEng,
  activeQuestion,
  activeProfile,
  selectedOptionIndex,
  elapsedSeconds,
  onDiscussWithCherry,
  onEnterClassroom
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl border space-y-4 animate-scale-up bg-slate-50 border-slate-200 text-left">
      {/* Speed Pacing Feedback Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          {selectedOptionIndex === activeQuestion.correctIndex ? (
            <span className="text-xs font-mono font-black uppercase text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              {isEng ? "Correct Option!" : "सटीक उत्तर (Correct)!"}
            </span>
          ) : (
            <span className="text-xs font-mono font-black uppercase text-rose-800 bg-rose-100 border border-rose-300 px-3 py-1 rounded-lg flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-700" />
              {isEng ? "Incorrect Option" : "गलत विकल्प (Incorrect)"}
            </span>
          )}

          <span
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
              elapsedSeconds <= activeQuestion.idealSeconds
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            {isEng
              ? `Time Taken: ${elapsedSeconds}s (Target: ${activeQuestion.idealSeconds}s)`
              : `लिया गया समय: ${elapsedSeconds}s (लक्ष्य: ${activeQuestion.idealSeconds}s)`}
          </span>
        </div>

        {/* Discuss With Cherry Button */}
        <button
          type="button"
          onClick={() => {
            if (onDiscussWithCherry) {
              onDiscussWithCherry({
                topic: activeQuestion.topic,
                subject: activeProfile.subject,
                conceptTested: activeQuestion.topic,
                hint:
                  !isEng && activeQuestion.hindiShortcutTip
                    ? activeQuestion.hindiShortcutTip
                    : activeQuestion.shortcutTip,
                question: `Cherry Ma'am, please demonstrate the 10-second mental shortcut on the chalkboard for this question: "${activeQuestion.questionText}"!`
              });
            } else if (onEnterClassroom) {
              onEnterClassroom();
            }
          }}
          className="min-h-[44px] w-full sm:w-auto px-4 py-2 rounded-xl bg-[#796AEF] hover:bg-indigo-700 text-white font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>
            {isEng ? "Learn 10-Second Shortcut on Chalkboard 🚀" : "मैम से 10-सेकंड शॉर्टकट ब्लैकबोर्ड पर सीखें 🚀"}
          </span>
        </button>
      </div>

      {/* The 10-Second Mental Shortcut Box */}
      <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-300/80 rounded-2xl space-y-1.5 text-left">
        <span className="text-xs font-mono font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-700" />
          {isEng
            ? "⚡ 10-Second Chalkboard Shortcut (Exam-Winner Shortcut):"
            : "⚡ 10-सेकंड ब्लैकबोर्ड शॉर्टकट (Exam-Winner Shortcut):"}
        </span>
        <p className="text-xs sm:text-sm text-amber-950 font-bold leading-relaxed">
          {!isEng && activeQuestion.hindiShortcutTip ? activeQuestion.hindiShortcutTip : activeQuestion.shortcutTip}
        </p>
        {!isEng && activeQuestion.hindiShortcutTip && (
          <p className="text-[11px] text-amber-900 font-medium font-sans">EN: {activeQuestion.shortcutTip}</p>
        )}
      </div>

      {/* The Time-Stealing Speed Trap Callout */}
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1.5 text-left">
        <span className="text-xs font-mono font-black uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-rose-700" />
          {isEng
            ? "🚨 Time-Stealing Trap (Where 80% students waste minutes):"
            : "🚨 समय चुराने वाला ट्रैप (Where 80% students waste minutes):"}
        </span>
        <p className="text-xs sm:text-sm text-rose-900 font-medium leading-relaxed">
          {!isEng && activeQuestion.hindiSpeedTrap ? activeQuestion.hindiSpeedTrap : activeQuestion.speedTrap}
        </p>
      </div>

      {/* Complete Detailed Derivation */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1 text-left">
        <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
          {isEng ? "Standard Step-by-Step Derivation:" : "मानक चरणबद्ध हल (Step-by-Step Derivation):"}
        </span>
        <p className="text-xs sm:text-sm text-slate-700 font-sans leading-relaxed">
          {!isEng && activeQuestion.hindiExplanation ? activeQuestion.hindiExplanation : activeQuestion.explanation}
        </p>
      </div>
    </div>
  );
};
