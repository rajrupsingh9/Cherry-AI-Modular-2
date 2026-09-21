/**
 * MacroPerformanceView.tsx
 * Thin Core Orchestrator for Macro Performance Analytics (< 100 LOC).
 * Composes decoupled executive snapshot, cognitive radar, badges, trends, and weekly study planner.
 */
import React, { useState } from "react";
import {
  MacroPerformanceViewProps,
  ExecutiveStudentSnapshot,
  MacroRadarChartTile,
  ConsistencyBadgesTile,
  PerformanceTrendTimelineTile,
  StrengthsAndGrowthTiles,
  BoardReadinessEstimatorTile,
  WeeklySmartStudyPlannerTile
} from "./macro";

export type { MacroPerformanceViewProps };

export const MacroPerformanceView: React.FC<MacroPerformanceViewProps> = ({
  dashboardStats,
  subject,
  grade,
  board = "CBSE",
  studentName,
  isEnglish = false,
  t = (k: string) => k,
  pastSessions = [],
  snapshots = [],
  quizAttempts = [],
  masteredCards = {},
  onEnterClassroom,
  onOpenReportCard,
  onOpenKiaraVoice,
}) => {
  const [activeDimensionIndex, setActiveDimensionIndex] = useState<number>(0);

  return (
    <div className="space-y-4 text-left">
      {/* Executive Student Snapshot Card - 1-Glance Overview */}
      <ExecutiveStudentSnapshot
        dashboardStats={dashboardStats}
        isEnglish={isEnglish}
      />

      {/* Main Bento Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* TILE 1: Radar Chart (Cognitive Mastery Dimensions) - Spans 2 columns */}
        <MacroRadarChartTile
          dashboardStats={dashboardStats}
          activeDimensionIndex={activeDimensionIndex}
          setActiveDimensionIndex={setActiveDimensionIndex}
          isEnglish={isEnglish}
        />

        {/* TILE 2: Consistency, Milestone & Badges Progress */}
        <ConsistencyBadgesTile
          dashboardStats={dashboardStats}
          pastSessions={pastSessions}
          snapshots={snapshots}
          quizAttempts={quizAttempts}
          masteredCards={masteredCards}
        />

        {/* TILE 3: Performance Trend & Accuracy Timeline - Spans 2 columns */}
        <PerformanceTrendTimelineTile dashboardStats={dashboardStats} />

        {/* TILE 4: Conceptual Strengths & TILE 5: Growth Areas */}
        <StrengthsAndGrowthTiles dashboardStats={dashboardStats} />
      </div>

      {/* Board Exam Readiness Index & Projected Score Estimator */}
      <BoardReadinessEstimatorTile
        dashboardStats={dashboardStats}
        grade={grade}
        board={board}
        onOpenReportCard={onOpenReportCard}
        onOpenKiaraVoice={onOpenKiaraVoice}
      />

      {/* Weekly AI Smart Study Timetable & Daily Revision Planner */}
      <WeeklySmartStudyPlannerTile
        subject={subject}
        onEnterClassroom={onEnterClassroom}
      />
    </div>
  );
};
