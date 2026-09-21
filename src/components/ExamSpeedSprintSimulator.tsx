/**
 * ExamSpeedSprintSimulator.tsx
 * Modular thin orchestrator for the Exam Speed Sprint Simulator & 7-Day Board Booster.
 * Deconstructed into modular hook, views, and data layers (< 300 LOC per module).
 */
import React from "react";
import { ExamSpeedSprintSimulatorProps } from "./sprint/sprintTypes";
import { useSpeedSprintSimulator } from "./sprint/useSpeedSprintSimulator";
import { SprintHeroScoreboard } from "./sprint/SprintHeroScoreboard";
import { SprintModeSwitcher } from "./sprint/SprintModeSwitcher";
import { SprintArenaView } from "./sprint/SprintArenaView";
import { SprintBoosterView } from "./sprint/SprintBoosterView";
import { SprintPedagogyRationale } from "./sprint/SprintPedagogyRationale";

// Re-export public interfaces and static curriculum for complete backward compatibility
export type {
  ExamSpeedSprintSimulatorProps,
  SpeedQuestion,
  ExamPacingProfile,
  SevenDayBoosterDay
} from "./sprint/sprintTypes";
export { SEVEN_DAY_BOOSTER_PLAN, EXAM_PACING_DATA } from "./sprint/sprintData";

export const ExamSpeedSprintSimulator: React.FC<ExamSpeedSprintSimulatorProps> = ({
  studentName = "Student",
  studentGrade = 12,
  pastSessions = [],
  quizAttempts = [],
  snapshots = [],
  mediumOfLearning,
  isEnglish,
  onDiscussWithCherry,
  onEnterClassroom
}) => {
  const sprint = useSpeedSprintSimulator({ mediumOfLearning, isEnglish });

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Hero Header for Exam Speed Pacing & 7-Day Booster */}
      <SprintHeroScoreboard
        isEng={sprint.isEng}
        totalBoosterMarks={sprint.totalBoosterMarks}
        sprintStats={sprint.sprintStats}
      />

      {/* Mode Switcher: Live Sprint Arena vs 7-Day Booster */}
      <SprintModeSwitcher
        isEng={sprint.isEng}
        activeViewMode={sprint.activeViewMode}
        setActiveViewMode={sprint.setActiveViewMode}
        totalBoosterMarks={sprint.totalBoosterMarks}
        completedBoosterDaysCount={sprint.completedBoosterDays.length}
        completedMarksEarned={sprint.completedMarksEarned}
      />

      {/* View 1: Live Speed Sprint Arena */}
      {sprint.activeViewMode === "sprint_arena" && (
        <SprintArenaView
          isEng={sprint.isEng}
          selectedModuleId={sprint.selectedModuleId}
          handleSelectModule={sprint.handleSelectModule}
          activeProfile={sprint.activeProfile}
          activeQuestion={sprint.activeQuestion}
          currentQuestionIndex={sprint.currentQuestionIndex}
          elapsedSeconds={sprint.elapsedSeconds}
          selectedOptionIndex={sprint.selectedOptionIndex}
          setSelectedOptionIndex={sprint.setSelectedOptionIndex}
          isAnswerSubmitted={sprint.isAnswerSubmitted}
          isTimerRunning={sprint.isTimerRunning}
          setIsTimerRunning={sprint.setIsTimerRunning}
          handleSubmitAnswer={sprint.handleSubmitAnswer}
          handleNextQuestion={sprint.handleNextQuestion}
          onDiscussWithCherry={onDiscussWithCherry}
          onEnterClassroom={onEnterClassroom}
        />
      )}

      {/* View 2: 7-Day Board Score Booster Plan */}
      {sprint.activeViewMode === "seven_day_booster" && (
        <SprintBoosterView
          isEng={sprint.isEng}
          activeBoosterDayNumber={sprint.activeBoosterDayNumber}
          setActiveBoosterDayNumber={sprint.setActiveBoosterDayNumber}
          activeBoosterDay={sprint.activeBoosterDay}
          completedBoosterDays={sprint.completedBoosterDays}
          toggleBoosterDayComplete={sprint.toggleBoosterDayComplete}
          totalBoosterMarks={sprint.totalBoosterMarks}
          completedMarksEarned={sprint.completedMarksEarned}
          onDiscussWithCherry={onDiscussWithCherry}
          onEnterClassroom={onEnterClassroom}
        />
      )}

      {/* Educational Pedagogical Rationale */}
      <SprintPedagogyRationale isEng={sprint.isEng} />
    </div>
  );
};
