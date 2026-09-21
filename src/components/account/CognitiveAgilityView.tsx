/**
 * CognitiveAgilityView.tsx
 * Thin Core Orchestrator for Socratic Speed-Accuracy Agility, Fatigue Curve & Exam Readiness (< 95 LOC).
 */
import React from "react";
import {
  CognitiveAgilityViewProps,
  useCognitiveAgility,
  AgilityHeroHeader,
  CognitiveQuadrantMatrix,
  FatigueAndPacingSection,
  AgilityTopicQueue,
  RapidFireSpeedDrillModal,
} from "./agility";

export type { CognitiveAgilityViewProps };

export const CognitiveAgilityView: React.FC<CognitiveAgilityViewProps> = ({
  subject,
  grade,
  studentName,
  isEnglish = false,
  t = (k: string) => k,
  onDiscussWithCherry,
  onEnterClassroom,
}) => {
  const {
    staminaAnalyticsData,
    staminaQuadrantFilter,
    setStaminaQuadrantFilter,
    staminaActiveSubject,
    setStaminaActiveSubject,
    selectedAgilityDrillTopic,
    setSelectedAgilityDrillTopic,
    staminaViewMode,
    setStaminaViewMode,
    sprintStepIndex,
    setSprintStepIndex,
    setSprintScore,
  } = useCognitiveAgility();

  const handleStartDrill = (item: any) => {
    setSelectedAgilityDrillTopic(item);
    setSprintStepIndex(0);
    setSprintScore(0);
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in text-left">
      {/* Hero Header for Agility & Stamina */}
      <AgilityHeroHeader
        studentName={studentName}
        isEnglish={isEnglish}
        staminaAnalyticsData={staminaAnalyticsData}
      />

      {/* SECTION 1: THE 4-QUADRANT SPEED VS ACCURACY COGNITIVE MATRIX */}
      <CognitiveQuadrantMatrix
        isEnglish={isEnglish}
        staminaAnalyticsData={staminaAnalyticsData}
        staminaQuadrantFilter={staminaQuadrantFilter}
        setStaminaQuadrantFilter={setStaminaQuadrantFilter}
      />

      {/* SECTION 2: SOCRATIC SESSION FATIGUE & EXAM PACING FORECAST */}
      <FatigueAndPacingSection
        isEnglish={isEnglish}
        subject={subject}
        staminaAnalyticsData={staminaAnalyticsData}
        onDiscussWithCherry={onDiscussWithCherry}
        onEnterClassroom={onEnterClassroom}
      />

      {/* SECTION 3: TOPICS AGILITY QUEUE & RAPID-FIRE SPEED DRILL SIMULATOR */}
      <AgilityTopicQueue
        isEnglish={isEnglish}
        staminaAnalyticsData={staminaAnalyticsData}
        staminaViewMode={staminaViewMode}
        setStaminaViewMode={setStaminaViewMode}
        staminaActiveSubject={staminaActiveSubject}
        setStaminaActiveSubject={setStaminaActiveSubject}
        staminaQuadrantFilter={staminaQuadrantFilter}
        setStaminaQuadrantFilter={setStaminaQuadrantFilter}
        onStartDrill={handleStartDrill}
        onDiscussWithCherry={onDiscussWithCherry}
        onEnterClassroom={onEnterClassroom}
      />

      {/* Interactive Rapid-Fire Speed Drill Modal */}
      {selectedAgilityDrillTopic && (
        <RapidFireSpeedDrillModal
          selectedAgilityDrillTopic={selectedAgilityDrillTopic}
          onClose={() => setSelectedAgilityDrillTopic(null)}
          isEnglish={isEnglish}
          sprintStepIndex={sprintStepIndex}
          setSprintStepIndex={setSprintStepIndex}
          setSprintScore={setSprintScore}
          onDiscussWithCherry={onDiscussWithCherry}
          onEnterClassroom={onEnterClassroom}
        />
      )}
    </div>
  );
};
