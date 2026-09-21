/**
 * MicroDiagnosticsView.tsx
 * Thin Core Orchestrator for Granular Micro-Diagnostics and Mistake Analysis (< 90 LOC).
 * Composes isolated hero stats, error classification matrix, competency deck, and drilldown modal.
 */
import React from "react";
import {
  MicroDiagnosticsViewProps,
  useMicroDiagnostics,
  MicroDiagnosticsHero,
  MistakeClassificationMatrix,
  SubtopicFilterBar,
  SubtopicCardList,
  SubtopicDrilldownModal,
} from "./micro";

export type { MicroDiagnosticsViewProps };

export const MicroDiagnosticsView: React.FC<MicroDiagnosticsViewProps> = ({
  quizAttempts = [],
  subject,
  grade,
  dashboardStats,
  studentName,
  onDiscussWithCherry,
  onEnterClassroom,
}) => {
  const {
    microDiagnosticsData,
    microSubjectFilter,
    setMicroSubjectFilter,
    microMasteryFilter,
    setMicroMasteryFilter,
    microMistakeFilter,
    setMicroMistakeFilter,
    microSearchQuery,
    setMicroSearchQuery,
    microViewMode,
    setMicroViewMode,
    selectedDrillSubtopic,
    setSelectedDrillSubtopic,
  } = useMicroDiagnostics(quizAttempts, subject, dashboardStats);

  const handleResetFilters = () => {
    setMicroSubjectFilter("all");
    setMicroMasteryFilter("all");
    setMicroMistakeFilter("all");
    setMicroSearchQuery("");
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in text-left">
      {/* Micro Diagnostic Hero Bar */}
      <MicroDiagnosticsHero
        subject={subject}
        grade={grade}
        microDiagnosticsData={microDiagnosticsData}
      />

      {/* SECTION 1: 4-WAY MISTAKE CLASSIFICATION MATRIX */}
      <MistakeClassificationMatrix
        microDiagnosticsData={microDiagnosticsData}
        microMistakeFilter={microMistakeFilter}
        setMicroMistakeFilter={setMicroMistakeFilter}
      />

      {/* SECTION 2: GRANULAR SUB-TOPIC MASTERY & DIRECT ACTION HUB */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4 text-left">
        <SubtopicFilterBar
          microDiagnosticsData={microDiagnosticsData}
          microViewMode={microViewMode}
          setMicroViewMode={setMicroViewMode}
          microSearchQuery={microSearchQuery}
          setMicroSearchQuery={setMicroSearchQuery}
          microSubjectFilter={microSubjectFilter}
          setMicroSubjectFilter={setMicroSubjectFilter}
          microMasteryFilter={microMasteryFilter}
          setMicroMasteryFilter={setMicroMasteryFilter}
        />

        <SubtopicCardList
          subtopics={microDiagnosticsData.subtopics}
          microViewMode={microViewMode}
          setSelectedDrillSubtopic={setSelectedDrillSubtopic}
          onDiscussWithCherry={onDiscussWithCherry}
          onEnterClassroom={onEnterClassroom}
          onResetFilters={handleResetFilters}
        />
      </div>

      {/* Question Drilldown Modal */}
      {selectedDrillSubtopic && (
        <SubtopicDrilldownModal
          selectedDrillSubtopic={selectedDrillSubtopic}
          onClose={() => setSelectedDrillSubtopic(null)}
          onDiscussWithCherry={onDiscussWithCherry}
          onEnterClassroom={onEnterClassroom}
        />
      )}
    </div>
  );
};
