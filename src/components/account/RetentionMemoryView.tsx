/**
 * RetentionMemoryView.tsx
 * Thin Core Orchestrator for Ebbinghaus Memory Decay Radar & Spaced Repetition (< 80 LOC).
 */
import React from "react";
import {
  RetentionMemoryViewProps,
  useRetentionMemory,
  RetentionHeroHeader,
  EbbinghausCurveVisualizer,
  RepetitionSchedulerQueue,
  ChalkboardFlashcardModal,
} from "./retention";

export type { RetentionMemoryViewProps };

export const RetentionMemoryView: React.FC<RetentionMemoryViewProps> = ({
  subject,
  grade,
  studentName,
  isEnglish = false,
  onDiscussWithCherry,
  onEnterClassroom,
}) => {
  const {
    retentionFilterUrgency,
    setRetentionFilterUrgency,
    retentionActiveSubject,
    setRetentionActiveSubject,
    retentionViewMode,
    setRetentionViewMode,
    selectedRetentionFlashcard,
    setSelectedRetentionFlashcard,
    activeFlashcardFlipped,
    setActiveFlashcardFlipped,
    retentionEngineData,
  } = useRetentionMemory();

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in text-left">
      {/* Hero Header for Retention */}
      <RetentionHeroHeader
        studentName={studentName}
        isEnglish={isEnglish}
        retentionEngineData={retentionEngineData}
      />

      {/* SECTION 1: INTERACTIVE EBBINGHAUS RETENTION CURVE VISUALIZER */}
      <EbbinghausCurveVisualizer
        isEnglish={isEnglish}
        retentionEngineData={retentionEngineData}
      />

      {/* SECTION 2: TOPICS DECAY RADAR & REVISION SCHEDULER */}
      <RepetitionSchedulerQueue
        isEnglish={isEnglish}
        retentionEngineData={retentionEngineData}
        retentionViewMode={retentionViewMode}
        setRetentionViewMode={setRetentionViewMode}
        retentionActiveSubject={retentionActiveSubject}
        setRetentionActiveSubject={setRetentionActiveSubject}
        retentionFilterUrgency={retentionFilterUrgency}
        setRetentionFilterUrgency={setRetentionFilterUrgency}
        onOpenFlashcard={(item) => {
          setActiveFlashcardFlipped(false);
          setSelectedRetentionFlashcard(item);
        }}
        onDiscussWithCherry={onDiscussWithCherry}
        onEnterClassroom={onEnterClassroom}
      />

      {/* Interactive Chalkboard Flashcard Modal */}
      {selectedRetentionFlashcard && (
        <ChalkboardFlashcardModal
          selectedRetentionFlashcard={selectedRetentionFlashcard}
          onClose={() => setSelectedRetentionFlashcard(null)}
          isEnglish={isEnglish}
          activeFlashcardFlipped={activeFlashcardFlipped}
          setActiveFlashcardFlipped={setActiveFlashcardFlipped}
          onDiscussWithCherry={onDiscussWithCherry}
          onEnterClassroom={onEnterClassroom}
        />
      )}
    </div>
  );
};
