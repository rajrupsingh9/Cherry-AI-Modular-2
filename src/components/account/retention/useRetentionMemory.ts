/**
 * useRetentionMemory.ts
 * Custom hook calculating Ebbinghaus exponential decay, Leitner intervals, and filter states.
 */
import { useState, useMemo } from "react";
import { MEMORY_TRACKS } from "./data/memoryTracksData";
import {
  RetentionComputedItem,
  RetentionEngineData,
  UrgencyLevel,
} from "./retentionTypes";

export const useRetentionMemory = () => {
  const [retentionFilterUrgency, setRetentionFilterUrgency] =
    useState<UrgencyLevel>("all");
  const [retentionActiveSubject, setRetentionActiveSubject] =
    useState<string>("all");
  const [retentionViewMode, setRetentionViewMode] = useState<
    "carousel" | "list"
  >("carousel");
  const [selectedRetentionFlashcard, setSelectedRetentionFlashcard] =
    useState<RetentionComputedItem | null>(null);
  const [activeFlashcardFlipped, setActiveFlashcardFlipped] =
    useState<boolean>(false);

  const retentionEngineData: RetentionEngineData = useMemo(() => {
    // Compute retention decay scores using Ebbinghaus Model: R = S0 * e^(-t / S)
    const computedItems: RetentionComputedItem[] = MEMORY_TRACKS.map((item) => {
      // Time t in days
      const t = item.lastStudiedDaysAgo;
      // Exponential decay: R = initial * exp(-t / halfLife)
      const retentionDecimal = Math.exp(-t / item.halfLifeDays);
      const currentRetentionPercent = Math.max(
        12,
        Math.min(100, Math.round(item.initialStrength * retentionDecimal)),
      );

      // Next optimal review day according to Leitner schedule (1, 3, 7, 14, 30 days)
      const reviewIntervals = [1, 3, 7, 14, 30];
      const nextReviewDays =
        reviewIntervals[
          Math.min(reviewIntervals.length - 1, item.repetitionCount)
        ];
      const daysOverdue = Math.max(0, t - nextReviewDays);

      // Urgency Classification
      let urgency: "critical" | "warning" | "stable" = "stable";
      let urgencyLabel = "Optimal Retention";
      let urgencyColor = "text-emerald-700 bg-emerald-50 border-emerald-200";

      if (currentRetentionPercent < 50 || daysOverdue >= 5) {
        urgency = "critical";
        urgencyLabel = "Immediate Revision Due";
        urgencyColor = "text-rose-700 bg-rose-50 border-rose-200";
      } else if (currentRetentionPercent < 72 || daysOverdue > 0) {
        urgency = "warning";
        urgencyLabel = "Decaying (Review Soon)";
        urgencyColor = "text-amber-700 bg-amber-50 border-amber-200";
      }

      // Memory Curve Projection Points: Day 0, Day 1, Day 3, Day 7, Day 14, Day 30
      const curveTimeline = [
        { day: 0, r: 100 },
        { day: 1, r: Math.round(100 * Math.exp(-1 / item.halfLifeDays)) },
        { day: 3, r: Math.round(100 * Math.exp(-3 / item.halfLifeDays)) },
        { day: 7, r: Math.round(100 * Math.exp(-7 / item.halfLifeDays)) },
        { day: 14, r: Math.round(100 * Math.exp(-14 / item.halfLifeDays)) },
        { day: 30, r: Math.round(100 * Math.exp(-30 / item.halfLifeDays)) },
      ];

      return {
        ...item,
        currentRetention: currentRetentionPercent,
        daysOverdue,
        nextReviewDays,
        urgency,
        urgencyLabel,
        urgencyColor,
        curveTimeline,
      };
    });

    // Filter by subject and urgency
    const filtered = computedItems.filter((item) => {
      if (
        retentionActiveSubject !== "all" &&
        item.subject.toLowerCase() !== retentionActiveSubject.toLowerCase()
      ) {
        return false;
      }
      if (
        retentionFilterUrgency !== "all" &&
        item.urgency !== retentionFilterUrgency
      ) {
        return false;
      }
      return true;
    });

    const criticalCount = computedItems.filter(
      (i) => i.urgency === "critical",
    ).length;
    const warningCount = computedItems.filter(
      (i) => i.urgency === "warning",
    ).length;
    const stableCount = computedItems.filter(
      (i) => i.urgency === "stable",
    ).length;
    const avgRetention = Math.round(
      computedItems.reduce((acc, i) => acc + i.currentRetention, 0) /
        computedItems.length,
    );

    return {
      items: filtered,
      allItems: computedItems,
      criticalCount,
      warningCount,
      stableCount,
      avgRetention,
    };
  }, [retentionFilterUrgency, retentionActiveSubject]);

  return {
    retentionFilterUrgency,
    setRetentionFilterUrgency,
    retentionActiveSubject,
    setRetentionActiveSubject,
    retentionViewMode,
    setRetentionViewMode,
    selectedRetentionFlashcard,
    setSelectedRetentionFlashcard,
    activeFlashcardFlipped,
    setActiveFlashcardFlipped,
    retentionEngineData,
  };
};
