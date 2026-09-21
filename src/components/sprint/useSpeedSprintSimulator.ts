/**
 * useSpeedSprintSimulator.ts
 * Custom hook managing the time pacing stopwatch, question evaluation,
 * sprint logs, stats calculation, and 7-day booster completion states.
 */
import { useState, useMemo, useEffect } from "react";
import { ExamSpeedSprintSimulatorProps, SprintLogEntry, SprintStats } from "./sprintTypes";
import { EXAM_PACING_DATA, SEVEN_DAY_BOOSTER_PLAN } from "./sprintData";

export function useSpeedSprintSimulator({
  mediumOfLearning,
  isEnglish
}: Pick<ExamSpeedSprintSimulatorProps, "mediumOfLearning" | "isEnglish">) {
  const isEng = isEnglish ?? (mediumOfLearning === "English");

  // View mode: Live Sprint Arena vs 7-Day Score Booster
  const [activeViewMode, setActiveViewMode] = useState<"sprint_arena" | "seven_day_booster">("sprint_arena");

  // 7-Day Booster Active Day and Tracked Completed Days
  const [activeBoosterDayNumber, setActiveBoosterDayNumber] = useState<number>(1);
  const [completedBoosterDays, setCompletedBoosterDays] = useState<number[]>([1]);

  // Active selected module for Live Sprint
  const [selectedModuleId, setSelectedModuleId] = useState<string>("pacing-jee-neet-phy");

  // Interactive Simulator State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Score & Pacing Log
  const [sprintLogs, setSprintLogs] = useState<SprintLogEntry[]>([]);

  // Active Profile
  const activeProfile = useMemo(() => {
    return EXAM_PACING_DATA.find((p) => p.id === selectedModuleId) || EXAM_PACING_DATA[0];
  }, [selectedModuleId]);

  // Current Active Question
  const activeQuestion = useMemo(() => {
    return activeProfile.questions[currentQuestionIndex] || activeProfile.questions[0];
  }, [activeProfile, currentQuestionIndex]);

  // Active 7-Day Booster Day Object
  const activeBoosterDay = useMemo(() => {
    return SEVEN_DAY_BOOSTER_PLAN.find((d) => d.dayNumber === activeBoosterDayNumber) || SEVEN_DAY_BOOSTER_PLAN[0];
  }, [activeBoosterDayNumber]);

  // Live Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && !isAnswerSubmitted) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, isAnswerSubmitted]);

  // Reset question state on module switch
  const handleSelectModule = (id: string) => {
    setSelectedModuleId(id);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setElapsedSeconds(0);
    setIsTimerRunning(true);
  };

  // Submit Answer & Calculate Speed Rating
  const handleSubmitAnswer = () => {
    if (selectedOptionIndex === null) return;
    setIsAnswerSubmitted(true);
    setIsTimerRunning(false);

    const isCorrect = selectedOptionIndex === activeQuestion.correctIndex;
    const ratio = elapsedSeconds / activeQuestion.idealSeconds;
    let paceStatus: "lightning" | "optimal" | "overtime" = "optimal";
    if (ratio < 0.75) {
      paceStatus = "lightning";
    } else if (ratio > 1.25) {
      paceStatus = "overtime";
    }

    setSprintLogs((prev) => [
      ...prev,
      {
        questionId: activeQuestion.id,
        secondsTaken: elapsedSeconds,
        idealSeconds: activeQuestion.idealSeconds,
        isCorrect,
        paceStatus
      }
    ]);
  };

  // Next Question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeProfile.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswerSubmitted(false);
      setElapsedSeconds(0);
      setIsTimerRunning(true);
    }
  };

  // Toggle Day Completion in 7-Day Booster
  const toggleBoosterDayComplete = (dayNum: number) => {
    setCompletedBoosterDays((prev) =>
      prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum]
    );
  };

  // Aggregated Performance Statistics
  const sprintStats: SprintStats = useMemo(() => {
    if (sprintLogs.length === 0) {
      return {
        totalAnswered: 0,
        accuracy: 0,
        avgSeconds: 0,
        timeSavedSeconds: 0,
        lightningCount: 0,
        overtimeCount: 0
      };
    }

    const totalAnswered = sprintLogs.length;
    const correctCount = sprintLogs.filter((l) => l.isCorrect).length;
    const accuracy = Math.round((correctCount / totalAnswered) * 100);
    const totalTime = sprintLogs.reduce((acc, l) => acc + l.secondsTaken, 0);
    const avgSeconds = Math.round(totalTime / totalAnswered);
    const idealTotal = sprintLogs.reduce((acc, l) => acc + l.idealSeconds, 0);
    const timeSavedSeconds = idealTotal - totalTime;
    const lightningCount = sprintLogs.filter((l) => l.paceStatus === "lightning").length;
    const overtimeCount = sprintLogs.filter((l) => l.paceStatus === "overtime").length;

    return {
      totalAnswered,
      accuracy,
      avgSeconds,
      timeSavedSeconds,
      lightningCount,
      overtimeCount
    };
  }, [sprintLogs]);

  // Total Marks in 7-Day Plan
  const totalBoosterMarks = useMemo(() => {
    return SEVEN_DAY_BOOSTER_PLAN.reduce((acc, d) => acc + d.targetMarks, 0);
  }, []);

  const completedMarksEarned = useMemo(() => {
    return SEVEN_DAY_BOOSTER_PLAN.filter((d) => completedBoosterDays.includes(d.dayNumber)).reduce(
      (acc, d) => acc + d.targetMarks,
      0
    );
  }, [completedBoosterDays]);

  return {
    isEng,
    activeViewMode,
    setActiveViewMode,
    activeBoosterDayNumber,
    setActiveBoosterDayNumber,
    completedBoosterDays,
    toggleBoosterDayComplete,
    selectedModuleId,
    handleSelectModule,
    currentQuestionIndex,
    selectedOptionIndex,
    setSelectedOptionIndex,
    isAnswerSubmitted,
    elapsedSeconds,
    isTimerRunning,
    setIsTimerRunning,
    activeProfile,
    activeQuestion,
    activeBoosterDay,
    sprintLogs,
    sprintStats,
    totalBoosterMarks,
    completedMarksEarned,
    handleSubmitAnswer,
    handleNextQuestion
  };
}
