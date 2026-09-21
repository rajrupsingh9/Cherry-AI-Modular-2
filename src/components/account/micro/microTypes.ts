/**
 * microTypes.ts
 * Types and interfaces for Granular Micro-Diagnostics and 4-Way Mistake Classification.
 */

export type MistakeArchetype = "conceptual" | "calculation" | "formula" | "speed";
export type MasteryLevel = "critical" | "practicing" | "mastered";

export interface SubtopicCatalogItem {
  id: string;
  name: string;
  chapter: string;
  subject: string;
  defaultMastery: number;
  benchmarkLatencySec: number;
  dominantMistake: MistakeArchetype;
  keyFormulas: string[];
  prescriptionHint: string;
  typicalQuestion: string;
  explanation: string;
}

export interface QuestionLogItem {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  latencySec: number;
  mistakeType: MistakeArchetype;
  conceptTested: string;
}

export interface ProcessedSubtopic extends SubtopicCatalogItem {
  masteryScore: number;
  accuracy: number;
  totalAttempts: number;
  avgLatencySec: number;
  masteryStatus: MasteryLevel;
  mistakeBreakdown: Record<MistakeArchetype, number>;
  recentQuestions: QuestionLogItem[];
}

export interface MistakeArchetypeMeta {
  count: number;
  percent: number;
  title: string;
  icon: string;
  color: string;
  remedy: string;
}

export interface MicroDiagnosticsData {
  subtopics: ProcessedSubtopic[];
  allSubtopics: ProcessedSubtopic[];
  criticalGapsCount: number;
  practicingCount: number;
  masteredCount: number;
  overallAvgLatency: number;
  mistakeDistribution: Record<MistakeArchetype, MistakeArchetypeMeta>;
}

export interface MicroDiagnosticsViewProps {
  quizAttempts?: any[];
  subject: string;
  grade: string | number;
  dashboardStats?: any;
  studentName?: string;
  onDiscussWithCherry?: (topicDetails: {
    topic: string;
    question?: string;
    answer?: string;
    hint?: string;
    conceptTested?: string;
    subject?: string;
  }) => void;
  onEnterClassroom?: () => void;
}
