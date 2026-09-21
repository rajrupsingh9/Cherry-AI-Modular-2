/**
 * retentionTypes.ts
 * Type definitions for Ebbinghaus retention curves, spaced repetition intervals, and flashcards.
 */

export type UrgencyLevel = "all" | "critical" | "warning" | "stable";

export interface MemoryTrackItem {
  id: string;
  topicName: string;
  chapter: string;
  subject: string;
  initialStrength: number; // 0 - 100
  lastStudiedDaysAgo: number;
  repetitionCount: number; // 1, 2, 3, 4+
  halfLifeDays: number; // Stability S in Ebbinghaus R = e^(-t/S)
  keyPoints: string[];
  flashcardPrompt: string;
  flashcardAnswer: string;
  formulaKatex?: string;
}

export interface RetentionComputedItem extends MemoryTrackItem {
  currentRetention: number;
  daysOverdue: number;
  nextReviewDays: number;
  urgency: "critical" | "warning" | "stable";
  urgencyLabel: string;
  urgencyColor: string;
  curveTimeline: Array<{ day: number; r: number }>;
}

export interface RetentionEngineData {
  items: RetentionComputedItem[];
  allItems: RetentionComputedItem[];
  criticalCount: number;
  warningCount: number;
  stableCount: number;
  avgRetention: number;
}

export interface RetentionMemoryViewProps {
  subject: string;
  grade: string | number;
  studentName?: string;
  isEnglish?: boolean;
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
