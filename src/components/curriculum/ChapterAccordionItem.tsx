/**
 * ChapterAccordionItem.tsx
 * Interactive accordion item for an entire curriculum chapter, rendering its subtopics tree.
 */
import React from "react";
import { ChevronDown, ChevronRight, Brain, BookOpen } from "lucide-react";
import { ChapterWithStatus } from "./curriculumTypes";
import { SubtopicCard } from "./SubtopicCard";

interface ChapterAccordionItemProps {
  chapter: ChapterWithStatus;
  isExpanded: boolean;
  onToggle: () => void;
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

export const ChapterAccordionItem: React.FC<ChapterAccordionItemProps> = ({
  chapter,
  isExpanded,
  onToggle,
  isEng,
  onDiscussWithCherry,
  onEnterClassroom
}) => {
  const handleChapterReview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDiscussWithCherry) {
      onDiscussWithCherry({
        topic: chapter.title,
        subject: chapter.subject,
        conceptTested: chapter.title,
        question: `Cherry Ma'am, please guide me through an official board blueprint revision of Chapter ${chapter.chapterNumber}: ${chapter.title} on the blackboard!`
      });
    } else if (onEnterClassroom) {
      onEnterClassroom();
    }
  };

  return (
    <div
      className={`bg-white border rounded-2xl sm:rounded-3xl transition-all overflow-hidden ${
        chapter.hasBlindspots
          ? "border-slate-200 shadow-2xs hover:border-indigo-300"
          : "border-emerald-200/80 shadow-2xs bg-gradient-to-br from-white to-emerald-50/15"
      }`}
    >
      {/* Chapter Main Bar (Accordion Header) */}
      <div
        onClick={onToggle}
        className="p-3.5 sm:p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3.5 cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
      >
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            type="button"
            aria-label="Toggle Chapter"
            className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors mt-0.5 sm:mt-0 min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-[#796AEF]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                {chapter.subject} • Class {chapter.grade}
              </span>

              <span className="text-[9.5px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {isEng
                  ? `🎯 ${chapter.boardWeightageMarks} Marks in Board`
                  : `🎯 ${chapter.boardWeightageMarks} Marks in Board • ${chapter.boardWeightageMarks} अंक`}
              </span>

              {chapter.tier === "critical" && (
                <span className="text-[9px] font-mono font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 uppercase">
                  {isEng ? "High-Yield Chapter" : "High-Yield Chapter • मुख्य अध्याय"}
                </span>
              )}
            </div>

            <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              Chapter {chapter.chapterNumber}: {chapter.title}
              {!isEng && chapter.hindiTitle && (
                <span className="ml-1.5 text-slate-500 font-semibold text-xs sm:text-sm">
                  • {chapter.hindiTitle}
                </span>
              )}
            </h4>
          </div>
        </div>

        {/* Chapter Completion Bar & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto">
          <div className="space-y-1 text-left sm:text-right min-w-[130px]">
            <div className="flex items-center justify-between text-[10.5px] font-mono">
              <span className="text-slate-500 font-bold">
                {isEng ? "Coverage:" : "Coverage • पूर्णता:"}
              </span>
              <strong
                className={`font-black ml-1 ${
                  chapter.chapterCompletionPercent >= 80
                    ? "text-emerald-700"
                    : chapter.chapterCompletionPercent > 0
                    ? "text-amber-700"
                    : "text-rose-600"
                }`}
              >
                {chapter.chapterCompletionPercent}% ({chapter.chapterLockedMarks}/
                {chapter.boardWeightageMarks} M)
              </strong>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  chapter.chapterCompletionPercent >= 80
                    ? "bg-emerald-500"
                    : chapter.chapterCompletionPercent > 0
                    ? "bg-amber-500"
                    : "bg-rose-400"
                }`}
                style={{ width: `${Math.max(6, chapter.chapterCompletionPercent)}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleChapterReview}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#796AEF] hover:bg-indigo-700 text-white text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
          >
            <Brain className="w-4 h-4 text-white" />
            <span>{isEng ? "Learn with Cherry 🚀" : "Learn with Cherry • मैम से सीखें 🚀"}</span>
          </button>
        </div>
      </div>

      {/* Subtopics Accordion Content */}
      {isExpanded && (
        <div className="px-4 sm:px-6 pb-5 pt-3 space-y-3 bg-slate-50/50 border-t border-slate-100">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-bold">
            <BookOpen className="w-3.5 h-3.5 text-[#796AEF]" />
            {isEng
              ? "Subtopic Blueprint & Board Exam Question Types:"
              : "Subtopic Blueprint & Board Exam Question Types • उप-विषय ब्लूप्रिंट व प्रश्न प्रकार:"}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {chapter.subtopics.map((sub) => (
              <SubtopicCard
                key={sub.id}
                subtopic={sub}
                chapter={chapter}
                isEng={isEng}
                onDiscussWithCherry={onDiscussWithCherry}
                onEnterClassroom={onEnterClassroom}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
