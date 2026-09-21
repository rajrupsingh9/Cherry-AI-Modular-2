/**
 * useCurriculumBlindspot.ts
 * Computes syllabus mastery, marks lock, blindspots, and search/filter states
 * from student past sessions, quiz attempts, and snapshots against the official curriculum.
 */
import { useState, useMemo } from "react";
import {
  BoardType,
  StatusFilterType,
  ComputedCurriculum,
  TopYieldBlindspot
} from "./curriculumTypes";
import { CURRICULUM_DATABASE } from "./curriculumData";

interface UseCurriculumBlindspotParams {
  studentGrade?: string | number;
  pastSessions?: any[];
  quizAttempts?: any[];
  snapshots?: any[];
}

export function useCurriculumBlindspot({
  studentGrade = 12,
  pastSessions = [],
  quizAttempts = [],
  snapshots = []
}: UseCurriculumBlindspotParams) {
  const [selectedBoard, setSelectedBoard] = useState<BoardType>("CBSE");
  const [selectedGrade, setSelectedGrade] = useState<number>(
    typeof studentGrade === "number" ? studentGrade : 12
  );
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<StatusFilterType>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedChapterIds, setExpandedChapterIds] = useState<Record<string, boolean>>({
    "math-trig": true,
    "phy-optics": true
  });

  const toggleChapter = (chapterId: string) => {
    setExpandedChapterIds((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const computedCurriculum: ComputedCurriculum = useMemo(() => {
    const studiedTopicNames = new Set<string>();
    const highScoredTopicNames = new Set<string>();

    pastSessions.forEach((s) => {
      if (s.topic) studiedTopicNames.add(s.topic.toLowerCase());
      if (s.subject) studiedTopicNames.add(s.subject.toLowerCase());
    });

    quizAttempts.forEach((q) => {
      const topic = (q.topic || "").toLowerCase();
      studiedTopicNames.add(topic);
      const score =
        typeof q.percentage === "number"
          ? q.percentage
          : (q.score / (q.totalQuestions || 1)) * 100;
      if (score >= 70) {
        highScoredTopicNames.add(topic);
      }
    });

    snapshots.forEach((snap) => {
      if (snap.topic) studiedTopicNames.add(snap.topic.toLowerCase());
    });

    let totalCurriculumMarks = 0;
    let lockedCurriculumMarks = 0;
    let totalSubtopicsCount = 0;
    let masteredCount = 0;
    let inProgressCount = 0;
    let blindspotCount = 0;

    const chapters = CURRICULUM_DATABASE.filter((ch) => {
      if (selectedGrade !== 0 && ch.grade !== selectedGrade) {
        if (selectedGrade === 10 && ch.grade !== 10) return false;
        if (selectedGrade === 12 && ch.grade < 11) return false;
      }
      if (selectedSubject !== "all" && ch.subject.toLowerCase() !== selectedSubject.toLowerCase()) {
        return false;
      }
      return true;
    }).map((chapter) => {
      totalCurriculumMarks += chapter.boardWeightageMarks;

      const subtopicsWithStatus = chapter.subtopics.map((sub) => {
        totalSubtopicsCount++;
        const titleLower = sub.title.toLowerCase();
        const chapterLower = chapter.title.toLowerCase();

        const hasStudied =
          studiedTopicNames.has(titleLower) ||
          studiedTopicNames.has(chapterLower) ||
          Array.from(studiedTopicNames).some((t) => titleLower.includes(t) || t.includes(titleLower));

        const isMastered =
          hasStudied &&
          (highScoredTopicNames.has(titleLower) ||
            highScoredTopicNames.has(chapterLower) ||
            Array.from(highScoredTopicNames).some((t) => titleLower.includes(t)));

        let status: "blindspot" | "review" | "mastered" = "blindspot";
        if (isMastered) {
          status = "mastered";
          masteredCount++;
        } else if (hasStudied) {
          status = "review";
          inProgressCount++;
        } else {
          status = "blindspot";
          blindspotCount++;
        }

        return {
          ...sub,
          status
        };
      });

      const masteredSubtopics = subtopicsWithStatus.filter((s) => s.status === "mastered").length;
      const reviewSubtopics = subtopicsWithStatus.filter((s) => s.status === "review").length;
      const chapterScoreFraction =
        (masteredSubtopics * 1.0 + reviewSubtopics * 0.5) / (subtopicsWithStatus.length || 1);
      const chapterCompletionPercent = Math.round(chapterScoreFraction * 100);

      const chapterLockedMarks = Number((chapter.boardWeightageMarks * chapterScoreFraction).toFixed(1));
      lockedCurriculumMarks += chapterLockedMarks;

      return {
        ...chapter,
        subtopics: subtopicsWithStatus,
        chapterCompletionPercent,
        chapterLockedMarks,
        isFullyCovered: chapterCompletionPercent >= 80,
        hasBlindspots: subtopicsWithStatus.some((s) => s.status === "blindspot")
      };
    });

    const filteredChapters = chapters.filter((ch) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesChapter =
          ch.title.toLowerCase().includes(q) ||
          (ch.hindiTitle && ch.hindiTitle.toLowerCase().includes(q)) ||
          ch.subject.toLowerCase().includes(q);
        const matchesSub = ch.subtopics.some(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            (s.hindiTitle && s.hindiTitle.toLowerCase().includes(q)) ||
            s.examType.toLowerCase().includes(q)
        );
        if (!matchesChapter && !matchesSub) return false;
      }

      if (selectedStatusFilter === "blindspot") {
        return ch.subtopics.some((s) => s.status === "blindspot");
      }
      if (selectedStatusFilter === "review") {
        return ch.subtopics.some((s) => s.status === "review");
      }
      if (selectedStatusFilter === "mastered") {
        return ch.subtopics.some((s) => s.status === "mastered");
      }

      return true;
    });

    const overallSyllabusPercent =
      totalCurriculumMarks > 0 ? Math.round((lockedCurriculumMarks / totalCurriculumMarks) * 100) : 0;

    return {
      chapters: filteredChapters,
      allChapters: chapters,
      totalCurriculumMarks,
      lockedCurriculumMarks: Number(lockedCurriculumMarks.toFixed(1)),
      overallSyllabusPercent,
      totalSubtopicsCount,
      masteredCount,
      inProgressCount,
      blindspotCount
    };
  }, [selectedBoard, selectedGrade, selectedSubject, selectedStatusFilter, searchQuery, pastSessions, quizAttempts, snapshots]);

  const topYieldBlindspot: TopYieldBlindspot | null = useMemo(() => {
    for (const ch of computedCurriculum.allChapters) {
      const blindspot = ch.subtopics.find((s) => s.status === "blindspot");
      if (blindspot) {
        return {
          chapter: ch,
          subtopic: blindspot
        };
      }
    }
    return null;
  }, [computedCurriculum.allChapters]);

  return {
    selectedBoard,
    setSelectedBoard,
    selectedGrade,
    setSelectedGrade,
    selectedSubject,
    setSelectedSubject,
    selectedStatusFilter,
    setSelectedStatusFilter,
    searchQuery,
    setSearchQuery,
    expandedChapterIds,
    toggleChapter,
    computedCurriculum,
    topYieldBlindspot
  };
}
