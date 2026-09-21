/**
 * prerequisiteTypes.ts
 * Type definitions for Multi-Year Cognitive Prerequisite Gap Finder.
 */

export interface PrerequisiteGapFinderProps {
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

export interface PrerequisiteNode {
  id: string;
  title: string;
  hindiTitle?: string;
  gradeLevel: number;
  type: "root_foundation" | "bridge_concept" | "target_mastery";
  subject: "Mathematics" | "Physics" | "Chemistry" | "Biology";
  description: string;
  hindiDescription?: string;
  keyFormula?: string;
  commonTrap: string;
  hindiCommonTrap?: string;
  diagnosedStatus?: "solid" | "shaky" | "broken";
}

export interface ConceptDependencyChain {
  id: string;
  targetConcept: string;
  hindiTargetConcept?: string;
  subject: "Mathematics" | "Physics" | "Chemistry" | "Biology";
  grade: number;
  chapterName: string;
  hindiChapterName?: string;
  importance: "critical" | "high";
  nodes: PrerequisiteNode[];
  summaryDiagnosis: string;
  hindiSummaryDiagnosis?: string;
  boardMarksAtRisk: number;
}

export interface DiagnosedChain extends ConceptDependencyChain {
  hasBrokenLink: boolean;
  rootCauseNode: PrerequisiteNode;
  brokenFoundationsCount: number;
  shakyBridgesCount: number;
  solidAnchorsCount: number;
}
