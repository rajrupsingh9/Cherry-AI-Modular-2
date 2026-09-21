/**
 * SubtopicCard.tsx
 * Card representing an individual syllabus subtopic with status, formulas, exam types, and tutor trigger.
 */
import React from "react";
import katex from "katex";
import { CheckCircle2, CircleDashed, AlertTriangle, Sparkles } from "lucide-react";
import { SubtopicWithStatus, ChapterWithStatus } from "./curriculumTypes";

interface SubtopicCardProps {
  subtopic: SubtopicWithStatus;
  chapter: ChapterWithStatus;
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

export const SubtopicCard: React.FC<SubtopicCardProps> = ({
  subtopic,
  chapter,
  isEng,
  onDiscussWithCherry,
  onEnterClassroom
}) => {
  const isBlindspot = subtopic.status === "blindspot";
  const isMastered = subtopic.status === "mastered";

  const renderFormula = (formula?: string) => {
    if (!formula) return null;
    try {
      return (
        <span
          dangerouslySetInnerHTML={{
            __html: katex.renderToString(formula, { displayMode: false, throwOnError: false })
          }}
        />
      );
    } catch {
      return <span>{formula}</span>;
    }
  };

  const handleAction = () => {
    if (onDiscussWithCherry) {
      onDiscussWithCherry({
        topic: subtopic.title,
        subject: chapter.subject,
        conceptTested: subtopic.title,
        hint: subtopic.coreTakeaway,
        question: `Cherry Ma'am, please explain the concept and board exam questions for "${subtopic.title}" from ${chapter.title} on the chalkboard!`
      });
    } else if (onEnterClassroom) {
      onEnterClassroom();
    }
  };

  return (
    <div
      className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3.5 transition-all text-left ${
        isMastered
          ? "bg-white border-emerald-300/80 shadow-2xs"
          : isBlindspot
          ? "bg-white border-dashed border-rose-300 shadow-2xs hover:border-rose-400"
          : "bg-white border-amber-200/80 shadow-2xs"
      }`}
    >
      {/* Subtopic Header */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-1.5">
          <span
            className={`text-[9.5px] font-mono font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 ${
              isMastered
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : isBlindspot
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {isMastered ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isEng ? "Mastered ✓" : "Mastered • सिद्ध ✓"}</span>
              </>
            ) : isBlindspot ? (
              <>
                <CircleDashed className="w-3.5 h-3.5 text-rose-500" />
                <span>{isEng ? "Blindspot!" : "Blindspot • छूटा हुआ!"}</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{isEng ? "Review Due" : "Review Due • दोहराएं"}</span>
              </>
            )}
          </span>

          <span className="text-[9.5px] font-mono text-slate-500 font-bold">
            {subtopic.weightagePercent}% of Ch
          </span>
        </div>

        <h5 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
          {subtopic.title}
        </h5>
        {!isEng && subtopic.hindiTitle && (
          <p className="text-[11px] font-medium text-slate-500 leading-tight">
            {subtopic.hindiTitle}
          </p>
        )}

        <span className="text-[9.5px] font-mono text-[#796AEF] bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60 block w-fit font-bold">
          📋 {subtopic.examType}
        </span>
      </div>

      {/* Core Takeaway & Formula */}
      <div className="space-y-1.5 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
        {subtopic.keyFormula && (
          <div className="p-2 bg-amber-50/80 text-amber-900 border border-amber-200/60 rounded-lg font-mono text-[10.5px] text-center overflow-x-auto shadow-2xs">
            {renderFormula(subtopic.keyFormula)}
          </div>
        )}
        <p className="font-semibold text-slate-800 leading-normal">
          {subtopic.coreTakeaway}
        </p>
        {!isEng && subtopic.hindiCoreTakeaway && (
          <p className="font-normal text-slate-600 leading-normal text-[10.5px]">
            {subtopic.hindiCoreTakeaway}
          </p>
        )}
      </div>

      {/* Launch Action */}
      <button
        type="button"
        onClick={handleAction}
        className={`w-full min-h-[44px] py-2 px-3 rounded-xl font-mono text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-2xs ${
          isBlindspot
            ? "bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200"
            : "bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200"
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>
          {isBlindspot
            ? (isEng ? "Solve Blindspot 🚀" : "Solve Blindspot • हल करें 🚀")
            : isMastered
            ? (isEng ? "Practice Advanced 🎯" : "Practice Advanced • अभ्यास करें 🎯")
            : (isEng ? "Revise Subtopic ✨" : "Revise Subtopic • दोहराएं ✨")}
        </span>
      </button>
    </div>
  );
};
