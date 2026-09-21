/**
 * agilityTypes.ts
 * Types and interfaces for Cognitive Agility, Fatigue Curve, and Rapid-Fire Drills.
 */

export type AgilityQuadrant = "flow" | "overthink" | "rushing" | "roadblock";

export interface AgilityTopicItem {
  id: string;
  topicName: string;
  chapter: string;
  subject: string;
  accuracy: number;
  avgLatencySec: number;
  benchmarkSec: number;
  dominantSlip: string;
  speedStrategy: string;
  rapidFireQuestion: string;
  rapidFireOptions: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface ClassifiedAgilityTopic extends AgilityTopicItem {
  quadrant: AgilityQuadrant;
  quadrantTitle: string;
  quadrantBadge: string;
  quadrantColor: string;
  prescription: string;
}

export interface FatiguePhaseItem {
  phase: string;
  accuracy: number;
  latencySec: number;
  cognitiveLoad: number;
  status: string;
}

export interface StaminaAnalyticsData {
  topics: ClassifiedAgilityTopic[];
  allTopics: ClassifiedAgilityTopic[];
  flowCount: number;
  overthinkCount: number;
  rushingCount: number;
  roadblockCount: number;
  sessionFatigueCurve: FatiguePhaseItem[];
  projectedRawScore: number;
  confidenceMargin: number;
  agilityScore: number;
  optimalFocusMinutes: number;
}

export interface CognitiveAgilityViewProps {
  subject: string;
  grade: string | number;
  studentName?: string;
  isEnglish?: boolean;
  t?: (key: string) => string;
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
