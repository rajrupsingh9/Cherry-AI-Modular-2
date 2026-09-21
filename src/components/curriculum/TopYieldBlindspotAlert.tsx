/**
 * TopYieldBlindspotAlert.tsx
 * High-priority action banner recommending the most impactful blindspot to eliminate next.
 */
import React from "react";
import { AlertTriangle, Sparkles } from "lucide-react";
import { TopYieldBlindspot } from "./curriculumTypes";

interface TopYieldBlindspotAlertProps {
  topYieldBlindspot: TopYieldBlindspot;
  isEng: boolean;
  onDiscussWithCherry?: (params: {
    topic: string;
    subject: string;
    conceptTested?: string;
    hint?: string;
    question?: string;
  }) => void;
  onEnterClassroom?: () => void;
}

export const TopYieldBlindspotAlert: React.FC<TopYieldBlindspotAlertProps> = ({
  topYieldBlindspot,
  isEng,
  onDiscussWithCherry,
  onEnterClassroom
}) => {
  const { chapter, subtopic } = topYieldBlindspot;

  const handleLaunch = () => {
    if (onDiscussWithCherry) {
      onDiscussWithCherry({
        topic: subtopic.title,
        subject: chapter.subject,
        conceptTested: subtopic.title,
        hint: subtopic.coreTakeaway,
        question: `Cherry Ma'am, let's cover this crucial board exam blindspot: "${subtopic.title}" from ${chapter.title} step-by-step on the blackboard!`
      });
    } else if (onEnterClassroom) {
      onEnterClassroom();
    }
  };

  return (
    <div className="bg-white border-2 border-rose-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-slate-900 shadow-xs space-y-3 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10.5px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2.5 py-1 rounded-md border border-rose-200 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            {isEng ? "Priority 1 Exam Blindspot" : "Priority 1 Exam Blindspot • उच्च प्राथमिकता ब्लाइंडस्पॉट"}
          </span>
          <span className="text-[10.5px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
            {isEng
              ? `+${chapter.boardWeightageMarks} Potential Board Marks`
              : `+${chapter.boardWeightageMarks} संभावित बोर्ड अंक`}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
          {chapter.title}
          {!isEng && chapter.hindiTitle ? ` (${chapter.hindiTitle})` : ""}
          <span className="text-[#796AEF] ml-1.5">
            • {subtopic.title}
          </span>
        </h4>
        <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium">
          {(isEng ? subtopic.coreTakeaway : subtopic.hindiCoreTakeaway) || subtopic.coreTakeaway}
        </div>
      </div>

      <button
        type="button"
        onClick={handleLaunch}
        className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#796AEF] hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
        <span>{isEng ? "Eliminate Blindspot with Cherry 🚀" : "मैम से अभी सीखें • Eliminate Blindspot 🚀"}</span>
      </button>
    </div>
  );
};
