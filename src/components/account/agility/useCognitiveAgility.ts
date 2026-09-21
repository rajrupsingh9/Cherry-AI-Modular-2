/**
 * useCognitiveAgility.ts
 * Custom hook isolating analytical computations, quadrant classification, and sprint drill state.
 */
import { useState, useMemo } from "react";
import {
  AgilityQuadrant,
  ClassifiedAgilityTopic,
  StaminaAnalyticsData,
} from "./agilityTypes";
import { AGILITY_TOPICS, SESSION_FATIGUE_CURVE } from "./data/agilityTopicsData";

export function useCognitiveAgility() {
  const [staminaQuadrantFilter, setStaminaQuadrantFilter] = useState<
    "all" | AgilityQuadrant
  >("all");
  const [staminaActiveSubject, setStaminaActiveSubject] = useState<string>("all");
  const [selectedAgilityDrillTopic, setSelectedAgilityDrillTopic] =
    useState<ClassifiedAgilityTopic | null>(null);
  const [staminaViewMode, setStaminaViewMode] = useState<"carousel" | "list">(
    "carousel",
  );
  const [activeSprintSeconds, setActiveSprintSeconds] = useState<number>(60);
  const [isSprintRunning, setIsSprintRunning] = useState<boolean>(false);
  const [sprintStepIndex, setSprintStepIndex] = useState<number>(0);
  const [sprintScore, setSprintScore] = useState<number>(0);

  const staminaAnalyticsData: StaminaAnalyticsData = useMemo(() => {
    const classifiedTopics: ClassifiedAgilityTopic[] = AGILITY_TOPICS.map((item) => {
      const isHighAcc = item.accuracy >= 75;
      const isFast = item.avgLatencySec <= 45;

      let quadrant: AgilityQuadrant = "flow";
      let quadrantTitle = "Flow State (Automaticity)";
      let quadrantBadge = "⚡ Optimal Mastery";
      let quadrantColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
      let prescription =
        "Maintain high-speed automaticity with weekly spaced recall.";

      if (isHighAcc && !isFast) {
        quadrant = "overthink";
        quadrantTitle = "Over-Calculation / Deep Deliberation";
        quadrantBadge = "⏱️ Slow but Accurate";
        quadrantColor = "text-sky-700 bg-sky-50 border-sky-200";
        prescription =
          "Learn algebraic shortcuts and tabular methods to save 30+ seconds per problem.";
      } else if (!isHighAcc && isFast) {
        quadrant = "rushing";
        quadrantTitle = "Impulsive Rushing / Panic Trap";
        quadrantBadge = "⚠️ Rushed Mistakes";
        quadrantColor = "text-amber-700 bg-amber-50 border-amber-200";
        prescription =
          "Enforce 5-second diagram verification before selecting an answer choice.";
      } else if (!isHighAcc && !isFast) {
        quadrant = "roadblock";
        quadrantTitle = "Cognitive Roadblock / Concept Gap";
        quadrantBadge = "🔴 Critical Bottleneck";
        quadrantColor = "text-rose-700 bg-rose-50 border-rose-200";
        prescription =
          "First-principles derivation with Cherry Ma'am on chalkboard to rebuild foundation.";
      }

      return {
        ...item,
        quadrant,
        quadrantTitle,
        quadrantBadge,
        quadrantColor,
        prescription,
      };
    });

    const filteredTopics = classifiedTopics.filter((t) => {
      if (
        staminaActiveSubject !== "all" &&
        t.subject.toLowerCase() !== staminaActiveSubject.toLowerCase()
      ) {
        return false;
      }
      if (
        staminaQuadrantFilter !== "all" &&
        t.quadrant !== staminaQuadrantFilter
      ) {
        return false;
      }
      return true;
    });

    const flowCount = classifiedTopics.filter((t) => t.quadrant === "flow").length;
    const overthinkCount = classifiedTopics.filter(
      (t) => t.quadrant === "overthink",
    ).length;
    const rushingCount = classifiedTopics.filter(
      (t) => t.quadrant === "rushing",
    ).length;
    const roadblockCount = classifiedTopics.filter(
      (t) => t.quadrant === "roadblock",
    ).length;

    const projectedRawScore = Math.min(
      96,
      Math.max(
        68,
        Math.round(
          (flowCount * 96 +
            overthinkCount * 88 +
            rushingCount * 65 +
            roadblockCount * 45) /
            Math.max(1, classifiedTopics.length),
        ),
      ),
    );
    const confidenceMargin = 4;
    const agilityScore = Math.round(
      ((flowCount * 1.0 +
        overthinkCount * 0.75 +
        rushingCount * 0.5 +
        roadblockCount * 0.3) /
        classifiedTopics.length) *
        100,
    );

    return {
      topics: filteredTopics,
      allTopics: classifiedTopics,
      flowCount,
      overthinkCount,
      rushingCount,
      roadblockCount,
      sessionFatigueCurve: SESSION_FATIGUE_CURVE,
      projectedRawScore,
      confidenceMargin,
      agilityScore,
      optimalFocusMinutes: 25,
    };
  }, [staminaQuadrantFilter, staminaActiveSubject]);

  return {
    staminaAnalyticsData,
    staminaQuadrantFilter,
    setStaminaQuadrantFilter,
    staminaActiveSubject,
    setStaminaActiveSubject,
    selectedAgilityDrillTopic,
    setSelectedAgilityDrillTopic,
    staminaViewMode,
    setStaminaViewMode,
    activeSprintSeconds,
    setActiveSprintSeconds,
    isSprintRunning,
    setIsSprintRunning,
    sprintStepIndex,
    setSprintStepIndex,
    sprintScore,
    setSprintScore,
  };
}
