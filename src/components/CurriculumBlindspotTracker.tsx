/**
 * CurriculumBlindspotTracker.tsx
 * Modular orchestrator for Syllabus Radar, official board blueprints, marks locking, and blindspot tracking.
 */
import React from "react";
import { Compass } from "lucide-react";
import { CurriculumBlindspotTrackerProps } from "./curriculum/curriculumTypes";
import { useCurriculumBlindspot } from "./curriculum/useCurriculumBlindspot";
import { CurriculumHeroBanner } from "./curriculum/CurriculumHeroBanner";
import { TopYieldBlindspotAlert } from "./curriculum/TopYieldBlindspotAlert";
import { CurriculumFiltersBar } from "./curriculum/CurriculumFiltersBar";
import { ChapterAccordionItem } from "./curriculum/ChapterAccordionItem";
import { CurriculumMotivationFooter } from "./curriculum/CurriculumMotivationFooter";

export type { CurriculumBlindspotTrackerProps } from "./curriculum/curriculumTypes";

export const CurriculumBlindspotTracker: React.FC<CurriculumBlindspotTrackerProps> = ({
  studentGrade = 12,
  pastSessions = [],
  quizAttempts = [],
  snapshots = [],
  mediumOfLearning,
  isEnglish,
  onDiscussWithCherry,
  onEnterClassroom
}) => {
  const isEng = isEnglish ?? (mediumOfLearning === "English");

  const {
    selectedBoard,
    setSelectedBoard,
    selectedGrade,
    setSelectedGrade,
    selectedSubject,
    setSelectedSubject,
    selectedStatusFilter,
    setSelectedStatusFilter,
    searchQuery,
    setSearchQuery,
    expandedChapterIds,
    toggleChapter,
    computedCurriculum,
    topYieldBlindspot
  } = useCurriculumBlindspot({
    studentGrade,
    pastSessions,
    quizAttempts,
    snapshots
  });

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in text-left w-full max-w-full overflow-hidden">
      {/* High-level syllabus coverage radar & 4-metric bento cards */}
      <CurriculumHeroBanner
        selectedBoard={selectedBoard}
        selectedGrade={selectedGrade}
        computedCurriculum={computedCurriculum}
        isEng={isEng}
      />

      {/* Recommended Sprint: Highest Yield Blindspot Alert */}
      {topYieldBlindspot && (
        <TopYieldBlindspotAlert
          topYieldBlindspot={topYieldBlindspot}
          isEng={isEng}
          onDiscussWithCherry={onDiscussWithCherry}
          onEnterClassroom={onEnterClassroom}
        />
      )}

      {/* Filter & Control Bar */}
      <CurriculumFiltersBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedBoard={selectedBoard}
        setSelectedBoard={setSelectedBoard}
        selectedGrade={selectedGrade}
        setSelectedGrade={setSelectedGrade}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        selectedStatusFilter={selectedStatusFilter}
        setSelectedStatusFilter={setSelectedStatusFilter}
        computedCurriculum={computedCurriculum}
        isEng={isEng}
      />

      {/* Chapters & Subtopics Interactive Tree */}
      <div className="space-y-4">
        {computedCurriculum.chapters.length > 0 ? (
          computedCurriculum.chapters.map((ch) => (
            <ChapterAccordionItem
              key={ch.id}
              chapter={ch}
              isExpanded={expandedChapterIds[ch.id] ?? false}
              onToggle={() => toggleChapter(ch.id)}
              isEng={isEng}
              onDiscussWithCherry={onDiscussWithCherry}
              onEnterClassroom={onEnterClassroom}
            />
          ))
        ) : (
          <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-2">
            <Compass className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-xs font-bold text-slate-700">
              {isEng
                ? "No chapters found for this filter"
                : "No chapters found for this filter • कोई अध्याय नहीं मिला"}
            </h4>
            <p className="text-[10.5px] text-slate-400 font-mono">
              Try clearing your search query or adjusting Grade and Subject filters.
            </p>
          </div>
        )}
      </div>

      {/* Why Curriculum & Blindspot Mapping Matters */}
      <CurriculumMotivationFooter isEng={isEng} />
    </div>
  );
};
