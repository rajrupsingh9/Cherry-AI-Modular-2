/**
 * curriculumTypes.ts
 * Type contracts and data interfaces for the Curriculum Blindspot Tracker & Syllabus Radar.
 */

export interface SubtopicNode {
  id: string;
  title: string;
  hindiTitle?: string;
  weightagePercent: number; // contribution to chapter
  keyFormula?: string;
  difficulty: "easy" | "medium" | "hard";
  examType: string; // e.g. "3-Mark Numerical", "5-Mark Derivation", "1-Mark MCQ"
  coreTakeaway: string;
  hindiCoreTakeaway?: string;
}

export interface SubtopicWithStatus extends SubtopicNode {
  status: "blindspot" | "review" | "mastered";
}

export interface ChapterCurriculum {
  id: string;
  chapterNumber: number;
  title: string;
  hindiTitle?: string;
  subject: "Mathematics" | "Physics" | "Chemistry" | "Biology";
  grade: number; // 9, 10, 11, 12
  boardWeightageMarks: number; // e.g. 10 marks in 80-mark board paper
  tier: "critical" | "high" | "moderate";
  subtopics: SubtopicNode[];
}

export interface ChapterWithStatus extends Omit<ChapterCurriculum, "subtopics"> {
  subtopics: SubtopicWithStatus[];
  chapterCompletionPercent: number;
  chapterLockedMarks: number;
  isFullyCovered: boolean;
  hasBlindspots: boolean;
}

export interface ComputedCurriculum {
  chapters: ChapterWithStatus[];
  allChapters: ChapterWithStatus[];
  totalCurriculumMarks: number;
  lockedCurriculumMarks: number;
  overallSyllabusPercent: number;
  totalSubtopicsCount: number;
  masteredCount: number;
  inProgressCount: number;
  blindspotCount: number;
}

export interface TopYieldBlindspot {
  chapter: ChapterWithStatus;
  subtopic: SubtopicWithStatus;
}

export type BoardType = "CBSE" | "ICSE" | "State Board" | "NEET" | "JEE";
export type StatusFilterType = "all" | "blindspot" | "review" | "mastered";

export interface CurriculumBlindspotTrackerProps {
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
