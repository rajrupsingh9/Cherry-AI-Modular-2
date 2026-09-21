/**
 * sprintTypes.ts
 * Type definitions and interfaces for Exam Speed Sprint Simulator & 7-Day Board Booster
 */

export interface ExamSpeedSprintSimulatorProps {
  studentName?: string;
  studentGrade?: string | number;
  pastSessions?: any[];
  quizAttempts?: any[];
  snapshots?: any[];
  mediumOfLearning?: string;
  isEnglish?: boolean;
  onDiscussWithCherry?: (params: {
    topic: string;
    subject: string;
    conceptTested?: string;
    hint?: string;
    question?: string;
  }) => void;
  onEnterClassroom?: () => void;
}

export interface SpeedQuestionOption {
  label: string;
  text: string;
  hindiText?: string;
}

export interface SpeedQuestion {
  id: string;
  subject: "Mathematics" | "Physics" | "Chemistry" | "Biology";
  topic: string;
  hindiTopic?: string;
  questionText: string;
  hindiQuestionText?: string;
  formulaOrContext?: string;
  idealSeconds: number; // Target speed (e.g. 35s, 45s, 60s, 75s)
  options: SpeedQuestionOption[];
  correctIndex: number;
  explanation: string;
  hindiExplanation?: string;
  speedTrap: string; // The cognitive trick that steals student time
  hindiSpeedTrap?: string;
  shortcutTip: string; // The 10-second mental shortcut
  hindiShortcutTip?: string;
}

export interface ExamPacingProfile {
  id: string;
  examName: string;
  hindiExamName?: string;
  subject: "Mathematics" | "Physics" | "Chemistry" | "Biology";
  totalExamQuestions: number;
  totalExamMinutes: number;
  targetSecondsPerQuestion: number;
  paceBand: "rapid_mcq" | "balanced_application" | "step_by_step_numerical";
  description: string;
  hindiDescription?: string;
  questions: SpeedQuestion[];
}

export interface SevenDayBoosterDay {
  dayNumber: number;
  title: string;
  hindiTitle: string;
  subject: "Mathematics" | "Physics" | "Chemistry" | "Biology";
  targetMarks: number;
  minutesBudget: number;
  keyTopics: string[];
  hindiKeyTopics: string[];
  highYieldTrick: string;
  hindiHighYieldTrick: string;
  diagnosticTrap: string;
  hindiDiagnosticTrap: string;
  drillQuestion: string;
  classroomPrompt: string;
}

export interface SprintLogEntry {
  questionId: string;
  secondsTaken: number;
  idealSeconds: number;
  isCorrect: boolean;
  paceStatus: "lightning" | "optimal" | "overtime";
}

export interface SprintStats {
  totalAnswered: number;
  accuracy: number;
  avgSeconds: number;
  timeSavedSeconds: number;
  lightningCount: number;
  overtimeCount: number;
}
