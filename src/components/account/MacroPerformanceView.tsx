import React, { useState } from "react";
import { Target, Check, Sparkles, FileText } from "lucide-react";
import { DIMENSION_DETAILS } from "./accountTypes";

export interface MacroPerformanceViewProps {
  dashboardStats: any;
  subject: string;
  grade: string | number;
  board?: string;
  studentName?: string;
  isEnglish?: boolean;
  t?: any;
  pastSessions?: any[];
  snapshots?: any[];
  quizAttempts?: any[];
  masteredCards?: Record<string, boolean>;
  onEnterClassroom?: () => void;
  onOpenReportCard?: () => void;
  onOpenKiaraVoice?: () => void;
}

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
  const [activePlannerDayIndex, setActivePlannerDayIndex] = useState<number>(0);
  const [completedPlannerTasks, setCompletedPlannerTasks] = useState<
    Record<string, boolean>
  >(() => {
    try {
      const saved =
        typeof window !== "undefined"
          ? localStorage.getItem("cherry_study_planner_tasks")
          : null;
      return saved ? JSON.parse(saved) : {};
    } catch (_) {
      return {};
    }
  });

  const togglePlannerTask = (taskId: string) => {
    setCompletedPlannerTasks((prev) => {
      const updated = { ...prev, [taskId]: !prev[taskId] };
      try {
        localStorage.setItem(
          "cherry_study_planner_tasks",
          JSON.stringify(updated),
        );
      } catch (_) {}
      return updated;
    });
  };

  const setIsReportCardModalOpen = (open: boolean) => {
    if (open && onOpenReportCard) onOpenReportCard();
  };

  return (
                  <>
                    {/* Executive Student Snapshot Card - 1-Glance Overview */}
                    {(() => {
                      const examReadinessScore = Math.min(
                        100,
                        Math.max(
                          10,
                          Math.round(
                            dashboardStats.conceptClarity * 0.25 +
                              dashboardStats.theoreticalCore * 0.2 +
                              dashboardStats.calculationPrecision * 0.25 +
                              dashboardStats.formulaRecall * 0.15 +
                              dashboardStats.socraticStamina * 0.15
                          )
                        )
                      );
                      const topStrength = [
                        { name: "Concept Clarity", score: dashboardStats.conceptClarity, icon: "🎯" },
                        { name: "Theoretical Core", score: dashboardStats.theoreticalCore, icon: "📖" },
                        { name: "Calculations", score: dashboardStats.calculationPrecision, icon: "🧮" },
                        { name: "Formula Recall", score: dashboardStats.formulaRecall, icon: "⚡" },
                        { name: "Socratic Stamina", score: dashboardStats.socraticStamina, icon: "🔥" },
                      ].sort((a, b) => b.score - a.score)[0];

                      const priorityFocus = [
                        { 
                          name: "Concept Clarity", 
                          score: dashboardStats.conceptClarity, 
                          icon: "🎯", 
                          tip: isEnglish ? "Strengthen core concepts with blackboard practice" : "Whiteboard practice से कॉन्सेप्ट मजबूत करें" 
                        },
                        { 
                          name: "Theoretical Core", 
                          score: dashboardStats.theoreticalCore, 
                          icon: "📖", 
                          tip: isEnglish ? "Revise handbook definitions and textbook proofs" : "हैंडबुक डेफिनिशन्स व नोट्स दोहराएं" 
                        },
                        { 
                          name: "Calculations", 
                          score: dashboardStats.calculationPrecision, 
                          icon: "🧮", 
                          tip: isEnglish ? "Verify step-by-step signs, units & arithmetic" : "स्टेप-बाय-स्टेप साइन व यूनिट्स चेक करें" 
                        },
                        { 
                          name: "Formula Recall", 
                          score: dashboardStats.formulaRecall, 
                          icon: "⚡", 
                          tip: isEnglish ? "Do 5-minute daily flashcard spaced repetition" : "स्मार्ट फ़्लैशकार्ड्स से रोज़ 5 मिनट रिवीज़न करें" 
                        },
                        { 
                          name: "Socratic Stamina", 
                          score: dashboardStats.socraticStamina, 
                          icon: "🔥", 
                          tip: isEnglish ? "Attend live lectures & take interactive quizzes" : "लाइव लेक्चर्स व क्विज़ में नियमित भाग लें" 
                        },
                      ].sort((a, b) => a.score - b.score)[0];

                      return (
                        <div className="bg-white border border-[#EFF1F5] rounded-2xl p-4 sm:p-5 shadow-xs text-left space-y-3.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#EFF1F5]">
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 rounded-xl bg-indigo-50 text-[#796AEF] border border-indigo-200/60 text-sm">
                                📊
                              </span>
                              <div>
                                <h4 className="text-xs sm:text-sm font-bold text-[#1E293B] uppercase tracking-wider font-sans">
                                  {isEnglish ? "Quick Academic Health Check • Executive Summary" : "Quick Academic Health Check • तैयारी का संक्षिप्त सारांश"}
                                </h4>
                                <p className="text-[11px] text-[#4A4E5A] font-sans">
                                  {isEnglish ? "Overall exam readiness status and high-priority focus for today" : "आपकी समग्र तैयारी की स्थिति और आज का सबसे महत्वपूर्ण फ़ोकस"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* 3 Quick Snapshot Highlights */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Card 1: Readiness */}
                            <div className="bg-gradient-to-br from-indigo-50/80 to-slate-50 border border-indigo-100 rounded-xl p-3 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-indigo-700">
                                  🎯 Board Readiness
                                </span>
                                <span className="text-xs font-bold text-[#796AEF]">
                                  {examReadinessScore}%
                                </span>
                              </div>
                              <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-indigo-100">
                                <div
                                  className="h-full bg-[#796AEF] rounded-full transition-all duration-500"
                                  style={{ width: `${examReadinessScore}%` }}
                                />
                              </div>
                              <p className="text-[10.5px] text-slate-600 font-medium">
                                {examReadinessScore >= 80 
                                  ? (isEnglish ? "Excellent Pacing • High-Score Track" : "उत्कृष्ट गति • टॉप स्कोर की ओर") 
                                  : (isEnglish ? "In Progress • Consistent Practice Required" : "प्रगतिशील • निरंतर अभ्यास आवश्यक")}
                              </p>
                            </div>

                            {/* Card 2: Top Strength */}
                            <div className="bg-gradient-to-br from-emerald-50/80 to-slate-50 border border-emerald-100 rounded-xl p-3 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700">
                                  {isEnglish ? "🌟 Top Strength" : "🌟 मुख्य ताकत"}
                                </span>
                                <span className="text-xs font-bold text-emerald-800">
                                  {topStrength.score}%
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 pt-0.5">
                                <span className="text-sm">{topStrength.icon}</span>
                                <span className="text-xs font-bold text-slate-800 truncate">
                                  {topStrength.name}
                                </span>
                              </div>
                              <p className="text-[10.5px] text-emerald-800/80 font-medium">
                                {isEnglish ? "Strong mastery • High scoring reliability" : "मजबूत पकड़ • परीक्षा में भरोसेमंद अंक"}
                              </p>
                            </div>

                            {/* Card 3: Priority Focus */}
                            <div className="bg-gradient-to-br from-amber-50/80 to-slate-50 border border-amber-100 rounded-xl p-3 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-800">
                                  {isEnglish ? "⚠️ Priority Area" : "⚠️ प्राथमिक सुधार"}
                                </span>
                                <span className="text-xs font-bold text-amber-900">
                                  {priorityFocus.score}%
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 pt-0.5">
                                <span className="text-sm">{priorityFocus.icon}</span>
                                <span className="text-xs font-bold text-slate-800 truncate">
                                  {priorityFocus.name}
                                </span>
                              </div>
                              <p className="text-[10.5px] text-amber-900/80 font-medium truncate" title={priorityFocus.tip}>
                                {priorityFocus.tip}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Main Bento Grid layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
                      {/* TILE 1: Radar Chart (Cognitive Mastery Dimensions) - Spans 2 columns on desktop */}
                      {(() => {
                        // Calculate Radar points
                        const width = 300;
                        const height = 300;
                        const cx = width / 2;
                        const cy = height / 2;
                        const rMax = 80;

                        // 5 Dimensions matching the discussed points
                        const keys = [
                          {
                            label: "Concept Clarity",
                            val: dashboardStats.conceptClarity,
                            icon: "🎯",
                          },
                          {
                            label: "Theoretical Core",
                            val: dashboardStats.theoreticalCore,
                            icon: "📖",
                          },
                          {
                            label: "Calculations",
                            val: dashboardStats.calculationPrecision,
                            icon: "🧮",
                          },
                          {
                            label: "Formula Recall",
                            val: dashboardStats.formulaRecall,
                            icon: "⚡",
                          },
                          {
                            label: "Socratic Stamina",
                            val: dashboardStats.socraticStamina,
                            icon: "🔥",
                          },
                        ];

                        const points = keys.map((key, i) => {
                          const angle = ((-90 + i * 72) * Math.PI) / 180;
                          const length = rMax * (key.val / 100);
                          const x = cx + Math.cos(angle) * length;
                          const y = cy + Math.sin(angle) * length;
                          return {
                            x,
                            y,
                            label: key.label,
                            score: key.val,
                            angle,
                          };
                        });

                        const pointsStr = points
                          .map((p) => `${p.x},${p.y}`)
                          .join(" ");

                        // Grid Polygons
                        const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

                        const dim = DIMENSION_DETAILS[activeDimensionIndex];
                        const dimensionScore =
                          activeDimensionIndex === 0
                            ? dashboardStats.conceptClarity
                            : activeDimensionIndex === 1
                              ? dashboardStats.theoreticalCore
                              : activeDimensionIndex === 2
                                ? dashboardStats.calculationPrecision
                                : activeDimensionIndex === 3
                                  ? dashboardStats.formulaRecall
                                  : dashboardStats.socraticStamina;

                        return (
                          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between text-left space-y-4">
                            {/* Card Header */}
                            <div className="flex items-center justify-between w-full pb-2.5 border-b border-slate-100">
                              <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-xl bg-indigo-50 text-[#796AEF] border border-indigo-100/90 flex items-center justify-center text-xs shadow-2xs shrink-0">
                                  <Target className="w-4 h-4 text-[#796AEF]" />
                                </span>
                                <div>
                                  <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
                                    Micro-Cognitive Dimensions
                                  </h4>
                                  <span className="text-[10.5px] font-mono text-slate-400 font-medium">
                                    5-Axis Mastery Analysis
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10.5px] font-mono font-bold bg-indigo-50 text-[#796AEF] border border-indigo-100/90 px-2.5 py-0.5 rounded-full">
                                Real-time Sync
                              </span>
                            </div>

                            {/* Middle section: Radar SVG on left, Selected Dimension Insights on right */}
                            <div className="flex flex-col md:flex-row items-center md:items-stretch gap-5 justify-between flex-1">
                              {/* SVG Radar Chart container */}
                              <div className="flex-1 flex flex-col items-center justify-center w-full py-1">
                                <div className="w-[260px] h-[260px] sm:w-[280px] sm:h-[280px] relative flex items-center justify-center">
                                  <svg
                                    viewBox={`0 0 ${width} ${height}`}
                                    className="w-full h-full overflow-visible select-none"
                                  >
                                    {/* Background Grids */}
                                    {gridLevels.map((lvl, idx) => {
                                      const gridPoints = Array.from(
                                        { length: 5 },
                                        (_, i) => {
                                          const angle =
                                            ((-90 + i * 72) * Math.PI) / 180;
                                          const x =
                                            cx + Math.cos(angle) * rMax * lvl;
                                          const y =
                                            cy + Math.sin(angle) * rMax * lvl;
                                          return `${x},${y}`;
                                        },
                                      ).join(" ");

                                      return (
                                        <polygon
                                          key={idx}
                                          points={gridPoints}
                                          className="fill-none stroke-slate-200"
                                          strokeWidth="1"
                                          strokeDasharray={
                                            idx < 4 ? "3,3" : "none"
                                          }
                                        />
                                      );
                                    })}

                                    {/* Spoke lines */}
                                    {Array.from({ length: 5 }, (_, i) => {
                                      const angle =
                                        ((-90 + i * 72) * Math.PI) / 180;
                                      const x = cx + Math.cos(angle) * rMax;
                                      const y = cy + Math.sin(angle) * rMax;
                                      return (
                                        <line
                                          key={i}
                                          x1={cx}
                                          y1={cy}
                                          x2={x}
                                          y2={y}
                                          className="stroke-slate-200"
                                          strokeWidth="1"
                                        />
                                      );
                                    })}

                                    {/* Performance Polygon Area with gradient */}
                                    <polygon
                                      points={pointsStr}
                                      className="fill-[#796AEF]/15 stroke-[#796AEF]"
                                      strokeWidth="2.5"
                                      strokeLinejoin="round"
                                    />

                                    {/* Vertex interactive markers */}
                                    {points.map((p, i) => {
                                      const labelAngle = p.angle;
                                      const labelDist = rMax + 20;
                                      const lx =
                                        cx + Math.cos(labelAngle) * labelDist;
                                      const ly =
                                        cy + Math.sin(labelAngle) * labelDist;

                                      const isSelected =
                                        activeDimensionIndex === i;

                                      return (
                                        <g
                                          key={i}
                                          className="cursor-pointer"
                                          onClick={() =>
                                            setActiveDimensionIndex(i)
                                          }
                                        >
                                          {/* Invisible large hit-target */}
                                          <circle
                                            cx={p.x}
                                            cy={p.y}
                                            r="16"
                                            fill="transparent"
                                          />
                                          {/* Glowing active point */}
                                          {isSelected && (
                                            <circle
                                              cx={p.x}
                                              cy={p.y}
                                              r="8"
                                              className="fill-[#796AEF]/25 animate-ping"
                                            />
                                          )}
                                          {/* Score vertex circle */}
                                          <circle
                                            cx={p.x}
                                            cy={p.y}
                                            r={isSelected ? "5.5" : "4.5"}
                                            className={
                                              isSelected
                                                ? "fill-[#796AEF] stroke-white"
                                                : "fill-white stroke-[#796AEF]"
                                            }
                                            strokeWidth="2"
                                          />
                                          {/* Label text */}
                                          <text
                                            x={lx}
                                            y={ly}
                                            textAnchor="middle"
                                            alignmentBaseline="middle"
                                            className={`text-[10px] font-bold font-mono transition-all ${
                                              isSelected
                                                ? "fill-[#796AEF] font-black"
                                                : "fill-slate-700"
                                            }`}
                                          >
                                            {keys[i].icon} {p.label} ({p.score}%)
                                          </text>
                                        </g>
                                      );
                                    })}
                                  </svg>
                                </div>
                              </div>

                              {/* Interactive Dimension Educator Insights box */}
                              <div className="w-full md:w-72 lg:w-80 bg-slate-50/80 border border-slate-200/80 p-4 rounded-2xl flex flex-col justify-between space-y-3 min-h-[220px]">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                                    <span className="text-[10.5px] font-mono font-bold text-[#796AEF] uppercase tracking-wider flex items-center gap-1.5">
                                      <span>{dim.icon}</span>
                                      <span>Selected Dimension</span>
                                    </span>
                                    <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">
                                      {dimensionScore}%
                                    </span>
                                  </div>
                                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                                    {dim.name}
                                  </h4>
                                  <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">
                                    {dim.description}
                                  </p>
                                </div>

                                <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1 shadow-2xs">
                                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 tracking-wider flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span>Cherry Ma'am's Strategic Advice:</span>
                                  </span>
                                  <p className="text-[11.5px] text-slate-800 font-semibold leading-normal italic">
                                    "
                                    {dim.recommendation.replace(
                                      "{score}",
                                      dimensionScore.toString(),
                                    )}
                                    "
                                  </p>
                                </div>

                                <div className="text-[10.5px] font-mono text-slate-500 font-medium flex items-center gap-1 pt-0.5">
                                  <span>💡</span>
                                  <span>{isEnglish ? "Tap points on the radar chart to view personalized advice." : "रेडार चार्ट के बिंदुओं पर टैप करके सलाह देखें।"}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* TILE 2: Consistency, Milestone & Badges Progress */}
                      <div className="bg-white border border-[#EFF1F5] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4 text-left">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-[#EFF1F5] pb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E293B] font-sans flex items-center gap-1.5">
                              🏆 Consistency Milestone
                            </span>
                            <span className="text-[10.5px] font-bold text-[#4A4E5A] font-sans">
                              Target: Scholar
                            </span>
                          </div>

                          {/* Dynamic Gauge details */}
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  className="stroke-[#EFF1F5]"
                                  strokeWidth="4.5"
                                  fill="transparent"
                                />
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  className="stroke-amber-500 transition-all duration-500"
                                  strokeWidth="4.5"
                                  fill="transparent"
                                  strokeDasharray="175.9"
                                  strokeDashoffset={
                                    175.9 -
                                    (175.9 * dashboardStats.socraticStamina) /
                                      100
                                  }
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute text-xs font-bold text-[#1E293B]">
                                {dashboardStats.socraticStamina}%
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">
                                Socratic Stamina
                              </span>
                              <p className="text-[11.5px] text-[#4A4E5A] leading-relaxed">
                                Calculated dynamically based on your classroom attendance, notes saved, and quiz participation.
                              </p>
                            </div>
                          </div>

                          {/* Classroom Real-time sync list */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div className="bg-[#F6F7FB] border border-[#EFF1F5] rounded-xl p-2.5 text-center">
                              <span className="text-sm font-bold text-[#1E293B] block">
                                {pastSessions?.length || 0}
                              </span>
                              <span className="text-[10.5px] text-[#4A4E5A] font-bold uppercase tracking-wider block">
                                Classes Done
                              </span>
                            </div>
                            <div className="bg-[#F6F7FB] border border-[#EFF1F5] rounded-xl p-2.5 text-center">
                              <span className="text-sm font-bold text-[#1E293B] block">
                                {snapshots?.length || 0}
                              </span>
                              <span className="text-[10.5px] text-[#4A4E5A] font-bold uppercase tracking-wider block">
                                Saved Notes
                              </span>
                            </div>
                            <div className="bg-[#F6F7FB] border border-[#EFF1F5] rounded-xl p-2.5 text-center">
                              <span className="text-sm font-bold text-[#1E293B] block">
                                {quizAttempts?.length || 0}
                              </span>
                              <span className="text-[10.5px] text-[#4A4E5A] font-bold uppercase tracking-wider block">
                                Quizzes Taken
                              </span>
                            </div>
                            <div className="bg-[#F6F7FB] border border-[#EFF1F5] rounded-xl p-2.5 text-center">
                              <span className="text-sm font-bold text-[#1E293B] block">
                                {
                                  Object.keys(masteredCards).filter(
                                    (k) => masteredCards[k],
                                  ).length
                                }
                              </span>
                              <span className="text-[10.5px] text-[#4A4E5A] font-bold uppercase tracking-wider block">
                                Decks Mastered
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Unlocked Badges Row */}
                        <div className="pt-3 border-t border-[#EFF1F5] space-y-2">
                          <span className="text-[10.5px] font-bold uppercase text-[#4A4E5A] tracking-wider block">
                            🏆 Earned Scholars Badges:
                          </span>
                          <div className="flex gap-2 flex-wrap">
                            {pastSessions?.length > 0 && (
                              <span
                                className="bg-emerald-50 text-emerald-800 border border-emerald-200/70 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold"
                                title="Attended at least 1 live session with Cherry Ma'am"
                              >
                                🌿 Chalkboard Pioneer
                              </span>
                            )}
                            {snapshots?.length > 0 && (
                              <span
                                className="bg-indigo-50 text-[#796AEF] border border-indigo-200/70 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold"
                                title="Saved chalkboard whiteboard equations"
                              >
                                📸 Formula Archivist
                              </span>
                            )}
                            {quizAttempts?.length > 0 && (
                              <span
                                className="bg-purple-50 text-purple-800 border border-purple-200/70 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold"
                                title="Completed at least 1 practice classroom quiz"
                              >
                                📝 Quiz Conqueror
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* TILE 3: Performance Trend & Accuracy Timeline (Smooth Wavy Area/Line Chart) - Spans 2 columns */}
                      <div className="lg:col-span-2 bg-white border border-[#EFF1F5] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4 text-left">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between border-b border-[#EFF1F5] pb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E293B] font-sans flex items-center gap-1.5">
                              📈 Classroom Quiz Accuracy Trendline
                            </span>
                            <span className="text-[10.5px] font-bold text-[#4A4E5A] font-sans">
                              Timeline Order
                            </span>
                          </div>
                          <p className="text-[11px] text-[#4A4E5A] leading-relaxed">
                            Tracks your accuracy percentages chronologically across your class test sittings to visualize your learning trajectory.
                          </p>
                        </div>

                        {/* Elegant custom inline SVG Line Chart */}
                        <div className="h-44 w-full relative flex items-center justify-center">
                          {(() => {
                            // Chronological attempts (ascending order of timestamp)
                            const chronological = [
                              ...dashboardStats.subjectAttempts,
                            ].reverse();
                            const count = chronological.length;

                            if (count === 0) {
                              // Display a beautiful mock visual path for "Initial Baseline"
                              return (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-2 bg-[#F6F7FB] rounded-2xl border border-dashed border-[#EFF1F5] p-4 select-none">
                                  <span className="text-lg">⏳</span>
                                  <div className="space-y-0.5">
                                    <h6 className="text-[11px] font-bold text-[#1E293B] uppercase tracking-wide">
                                      No Test History Available Yet
                                    </h6>
                                    <p className="text-[11px] text-[#4A4E5A] max-w-xs mx-auto leading-relaxed">
                                      Take your first classroom-aligned Quick Quiz to unlock your dynamic learning accuracy trendline and watch your curve grow!
                                    </p>
                                  </div>
                                </div>
                              );
                            }

                            // Dimensions
                            const w = 480;
                            const h = 150;
                            const paddingX = 40;
                            const paddingY = 20;

                            const chartW = w - paddingX * 2;
                            const chartH = h - paddingY * 2;

                            // Map chronological attempts to chart points
                            const points = chronological.map((att, i) => {
                              const x =
                                paddingX +
                                (count > 1
                                  ? (i / (count - 1)) * chartW
                                  : chartW / 2);
                              // Accuracy: 0 to 100
                              const y =
                                h - paddingY - (att.accuracy / 100) * chartH;
                              return {
                                x,
                                y,
                                accuracy: att.accuracy,
                                date:
                                  att.docName?.split("•")?.[0]?.trim() ||
                                  "Quiz",
                              };
                            });

                            // Draw curved path using cubic Bézier curves (smooth wavy curve)
                            let dPath = "";
                            if (points.length === 1) {
                              dPath = `M ${points[0].x - 10} ${points[0].y} L ${points[0].x + 10} ${points[0].y}`;
                            } else if (points.length > 1) {
                              dPath = `M ${points[0].x} ${points[0].y}`;
                              for (let i = 0; i < points.length - 1; i++) {
                                const curr = points[i];
                                const next = points[i + 1];
                                const cp1X = curr.x + (next.x - curr.x) / 2;
                                const cp1Y = curr.y;
                                const cp2X = curr.x + (next.x - curr.x) / 2;
                                const cp2Y = next.y;
                                dPath += ` C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${next.x} ${next.y}`;
                              }
                            }

                            // Area path (closed polygon back to bottom axis for gradient filling)
                            let dArea = "";
                            if (points.length > 1) {
                              dArea = `${dPath} L ${points[points.length - 1].x} ${h - paddingY} L ${points[0].x} ${h - paddingY} Z`;
                            }

                            return (
                              <svg
                                viewBox={`0 0 ${w} ${h}`}
                                className="w-full h-full overflow-visible select-none"
                              >
                                <defs>
                                  <linearGradient
                                    id="chartAreaGrad"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                  >
                                    <stop
                                      offset="0%"
                                      stopColor="#796AEF"
                                      stopOpacity="0.2"
                                    />
                                    <stop
                                      offset="100%"
                                      stopColor="#796AEF"
                                      stopOpacity="0.0"
                                    />
                                  </linearGradient>
                                </defs>

                                {/* Horizontal gridlines */}
                                {[0, 25, 50, 75, 100].map((val) => {
                                  const y = h - paddingY - (val / 100) * chartH;
                                  return (
                                    <g key={val}>
                                      <line
                                        x1={paddingX}
                                        y1={y}
                                        x2={w - paddingX}
                                        y2={y}
                                        className="stroke-[#EFF1F5]"
                                        strokeWidth="1"
                                        strokeDasharray="2,2"
                                      />
                                      <text
                                        x={paddingX - 8}
                                        y={y + 3}
                                        textAnchor="end"
                                        className="text-[9.5px] font-sans font-bold fill-[#4A4E5A]"
                                      >
                                        {val}%
                                      </text>
                                    </g>
                                  );
                                })}

                                {/* Smooth Gradient Area Fill */}
                                {dArea && (
                                  <path
                                    d={dArea}
                                    fill="url(#chartAreaGrad)"
                                  />
                                )}

                                {/* Crisp wavy line path */}
                                {dPath && (
                                  <path
                                    d={dPath}
                                    fill="none"
                                    className="stroke-[#796AEF]"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                  />
                                )}

                                {/* Point circles & tooltips */}
                                {points.map((p, idx) => (
                                  <g key={idx} className="cursor-pointer group">
                                    <circle
                                      cx={p.x}
                                      cy={p.y}
                                      r="7"
                                      className="fill-[#796AEF]/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                      strokeWidth="0"
                                    />
                                    <circle
                                      cx={p.x}
                                      cy={p.y}
                                      r="4.5"
                                      className="fill-[#796AEF] stroke-white"
                                      strokeWidth="2"
                                    />

                                    {/* Label index below point */}
                                    <text
                                      x={p.x}
                                      y={h - paddingY + 12}
                                      textAnchor="middle"
                                      className="text-[9px] font-sans font-bold fill-[#4A4E5A]"
                                    >
                                      #{idx + 1}
                                    </text>

                                    {/* Mini overlay tooltip on hover */}
                                    <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                                      <rect
                                        x={p.x - 30}
                                        y={p.y - 24}
                                        width="60"
                                        height="16"
                                        rx="6"
                                        className="fill-[#1E293B]"
                                      />
                                      <text
                                        x={p.x}
                                        y={p.y - 13}
                                        textAnchor="middle"
                                        className="text-[9.5px] font-bold fill-white"
                                      >
                                        {p.accuracy}% Correct
                                      </text>
                                    </g>
                                  </g>
                                ))}
                              </svg>
                            );
                          })()}
                        </div>

                        <div className="flex items-center justify-between text-[10.5px] font-sans text-[#4A4E5A] pt-2 border-t border-[#EFF1F5]">
                          <span>⬅️ Earlier attempts</span>
                          <span>Latest sittings ➡️</span>
                        </div>
                      </div>

                      {/* TILE 4: Conceptual Strengths (Mastery Highlights) */}
                      <div className="bg-white border border-[#EFF1F5] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4 text-left">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between border-b border-[#EFF1F5] pb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 font-sans flex items-center gap-1.5">
                              🏆 Conceptual Strengths
                            </span>
                            <span className="text-[10.5px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200/60 font-sans">
                              Verified
                            </span>
                          </div>
                          <p className="text-[11px] text-[#4A4E5A] leading-relaxed">
                            Topics & theories where you have demonstrated flawless accuracy and solid deductive clarity in class tests.
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:hidden pb-0.5 text-[11px] text-emerald-700 font-bold">
                          <span>← Swipe Verified Strengths →</span>
                          <span>{dashboardStats.strengths.length} Topics</span>
                        </div>
                        <div className="flex sm:flex-col overflow-x-auto sm:overflow-visible gap-2.5 pb-2 sm:pb-0 scrollbar-thin snap-x snap-mandatory">
                          {dashboardStats.strengths
                            .slice(0, 4)
                            .map((str, idx) => (
                              <div
                                key={idx}
                                className="bg-[#F6F7FB] border border-[#EFF1F5] p-3 rounded-xl text-left flex items-start gap-2.5 w-[76vw] sm:w-auto shrink-0 sm:shrink snap-center shadow-2xs"
                              >
                                <span className="p-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs shrink-0 font-bold border border-emerald-200/60">
                                  ✓
                                </span>
                                <div className="space-y-0.5 min-w-0">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                                    {str.category}
                                  </span>
                                  <p className="text-[11.5px] text-[#1E293B] font-bold leading-tight">
                                    {str.concept}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>

                        <div className="text-[10.5px] text-emerald-800 font-semibold bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/60 flex items-center gap-1 justify-center">
                          <span>
                            💎 Keep it up! These are ready for board revisions.
                          </span>
                        </div>
                      </div>

                      {/* TILE 5: Growth Areas & Recommendations */}
                      <div className="bg-white border border-[#EFF1F5] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4 text-left">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between border-b border-[#EFF1F5] pb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 font-sans flex items-center gap-1.5">
                              ⚠️ Mastery Focus Areas
                            </span>
                            <span className="text-[10.5px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200/60 font-sans">
                              Action Needed
                            </span>
                          </div>
                          <p className="text-[11px] text-[#4A4E5A] leading-relaxed">
                            Questions and concepts where revision will directly boost your accuracy score.
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:hidden pb-0.5 text-[11px] text-amber-700 font-bold">
                          <span>← Swipe Growth Areas →</span>
                          <span>{dashboardStats.growths.length} Focus Points</span>
                        </div>
                        <div className="flex sm:flex-col overflow-x-auto sm:overflow-visible gap-2.5 pb-2 sm:pb-0 scrollbar-thin snap-x snap-mandatory">
                          {dashboardStats.growths.slice(0, 3).map((g, idx) => (
                            <div
                              key={idx}
                              className="bg-[#F6F7FB] border border-[#EFF1F5] p-3 rounded-xl text-left space-y-2 w-[76vw] sm:w-auto shrink-0 sm:shrink snap-center shadow-2xs"
                            >
                              <div className="flex items-start gap-2">
                                <span className="p-1 bg-amber-50 text-amber-700 rounded-lg text-xs shrink-0 font-bold border border-amber-200/60">
                                  !
                                </span>
                                <div className="min-w-0">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                                    {g.category}
                                  </span>
                                  <p className="text-[11.5px] text-[#1E293B] font-bold leading-tight">
                                    {g.concept}
                                  </p>
                                </div>
                              </div>
                              <p className="text-[11px] text-[#4A4E5A] font-medium bg-white p-2 rounded-xl border border-[#EFF1F5] leading-relaxed">
                                {g.explanation}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="text-[10.5px] text-amber-800 font-semibold bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 flex items-center gap-1 justify-center">
                          <span>
                            📖 Practice flashcards to master these topics!
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* PHASE 4: Board Exam Readiness Index & Projected Score Estimator */}
                    {(() => {
                      const examReadinessScore = Math.min(
                        100,
                        Math.max(
                          10,
                          Math.round(
                            dashboardStats.conceptClarity * 0.25 +
                              dashboardStats.theoreticalCore * 0.2 +
                              dashboardStats.calculationPrecision * 0.25 +
                              dashboardStats.formulaRecall * 0.15 +
                              dashboardStats.socraticStamina * 0.15,
                          ),
                        ),
                      );
                      const projectedPercentile = Math.min(
                        99.4,
                        75 + (examReadinessScore - 50) * 0.45,
                      ).toFixed(1);
                      const gradeBand =
                        examReadinessScore >= 90
                          ? "A1 (91–100%) • Top Distinction"
                          : examReadinessScore >= 80
                            ? "A2 (81–90%) • Outstanding"
                            : examReadinessScore >= 70
                              ? "B1 (71–80%) • Solid Merit"
                              : examReadinessScore >= 60
                                ? "B2 (61–70%) • Good Progress"
                                : "C1 (51–60%) • Foundation Reinforcement Needed";

                      return (
                        <div className="bg-white border border-[#EFF1F5] rounded-2xl p-4 sm:p-5 text-[#1E293B] shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5 text-left">
                          <div className="space-y-2.5 max-w-xl z-10">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#796AEF] border border-indigo-200/60 text-[10.5px] font-bold uppercase tracking-wider font-sans">
                                🎯 Board Readiness Metric
                              </span>
                              <span className="text-[11px] font-sans font-semibold text-[#4A4E5A]">
                                Curriculum: {grade || "Class 10"} •{" "}
                                {board || "CBSE"}
                              </span>
                            </div>
                            <h3 className="text-sm sm:text-base font-bold text-[#1E293B] tracking-tight flex items-center gap-2">
                              <span>Target Board Exam Readiness Index</span>
                              <span className="text-[#796AEF] font-bold">
                                ({examReadinessScore}%)
                              </span>
                            </h3>
                            <p className="text-xs text-[#4A4E5A] font-sans leading-relaxed">
                              Predicted Grade Band:{" "}
                              <strong className="text-[#1E293B] font-bold">
                                {gradeBand}
                              </strong>{" "}
                              • Estimated Percentile:{" "}
                              <strong className="text-emerald-700 font-bold">
                                Top {projectedPercentile}%
                              </strong>{" "}
                              nationwide.
                            </p>
                            <div className="w-full bg-[#F6F7FB] h-2.5 rounded-full overflow-hidden border border-[#EFF1F5]">
                              <div
                                className="h-full bg-[#796AEF] rounded-full transition-all duration-500"
                                style={{ width: `${examReadinessScore}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 z-10 w-full md:w-auto">
                            <button
                              type="button"
                              onClick={() => setIsReportCardModalOpen(true)}
                              className="px-4 py-2.5 bg-[#796AEF] hover:bg-[#6858e0] active:scale-95 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                            >
                              <FileText className="w-4 h-4 stroke-[2.5]" />
                              <span>Generate Report Card 🎓</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (onOpenKiaraVoice) onOpenKiaraVoice();
                              }}
                              className="px-4 py-2.5 bg-[#F6F7FB] hover:bg-slate-100 active:scale-95 text-[#1E293B] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#EFF1F5] shadow-2xs"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>Kiara Strategy Call 🎙️</span>
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    {/* PHASE 4: Weekly AI Smart Study Timetable & Daily Revision Planner */}
                    {(() => {
                      const days = [
                        {
                          day: "Monday",
                          title: "Core Theory & Definitions",
                          icon: "📖",
                          theme: "Theoretical Foundations",
                          focus:
                            "Deep definition memorization & theorem statements",
                          tasks: [
                            {
                              id: "mon-1",
                              label: `Review 5 key theorems for ${subject || "Mathematics"} from Chapter Books`,
                            },
                            {
                              id: "mon-2",
                              label: "Practice 1 foundational conceptual derivation",
                            },
                            {
                              id: "mon-3",
                              label: "Take 1 quick 5-question baseline quiz",
                            },
                          ],
                        },
                        {
                          day: "Tuesday",
                          title: "Formula & Identity Sprint",
                          icon: "⚡",
                          theme: "Formula Recall Acceleration",
                          focus:
                            "Instant flashcard recall without looking at answer keys",
                          tasks: [
                            {
                              id: "tue-1",
                              label: "Run through 15 flashcards in Speed Mode",
                            },
                            {
                              id: "tue-2",
                              label: "Derive key identity equations on scratchpad",
                            },
                            {
                              id: "tue-3",
                              label: "Bookmark tricky formulas into personal notebook",
                            },
                          ],
                        },
                        {
                          day: "Wednesday",
                          title: "Numerical & Precision Drills",
                          icon: "🧮",
                          theme: "Calculation Accuracy",
                          focus:
                            "Step-by-step arithmetic without sign or rounding errors",
                          tasks: [
                            {
                              id: "wed-1",
                              label: "Solve 3 multi-step calculation problems",
                            },
                            {
                              id: "wed-2",
                              label: "Verify unit conversions and final decimal precision",
                            },
                            {
                              id: "wed-3",
                              label: "Check working steps against blackboard notes",
                            },
                          ],
                        },
                        {
                          day: "Thursday",
                          title: "Blindspot & Error Eradication",
                          icon: "🔍",
                          theme: "Targeted Weak-Zone Remediation",
                          focus:
                            "Re-attempt previously missed questions until 100% clear",
                          tasks: [
                            {
                              id: "thu-1",
                              label: "Re-take 1 quiz with previous mistakes",
                            },
                            {
                              id: "thu-2",
                              label: "Ask Cherry Ma'am during live lecture for doubts",
                            },
                            {
                              id: "thu-3",
                              label: "Summarize 1 tricky concept in own words",
                            },
                          ],
                        },
                        {
                          day: "Friday",
                          title: "Socratic Speed & Rapid Fire",
                          icon: "🔥",
                          theme: "Cognitive Agility & Pace",
                          focus:
                            "Solve questions under 60-second exam countdown pressure",
                          tasks: [
                            {
                              id: "fri-1",
                              label: "Complete 1 Speed Sprint test in under 5 minutes",
                            },
                            {
                              id: "fri-2",
                              label: "Eliminate wrong MCQ options using mental shortcuts",
                            },
                            {
                              id: "fri-3",
                              label: "Log timing benchmarks on Agility radar",
                            },
                          ],
                        },
                        {
                          day: "Saturday",
                          title: "Comprehensive Mock Sitting",
                          icon: "🎯",
                          theme: "Full Syllabus Integration",
                          focus:
                            "Simulated board exam condition with mixed chapter questions",
                          tasks: [
                            {
                              id: "sat-1",
                              label: "Take complete 15-question mixed chapter exam",
                            },
                            {
                              id: "sat-2",
                              label: "Analyze Cognitive Radar shifts post-test",
                            },
                            {
                              id: "sat-3",
                              label: "Export/Print updated Performance Report Card",
                            },
                          ],
                        },
                        {
                          day: "Sunday",
                          title: "Consolidation & Strategy Reset",
                          icon: "🧘",
                          theme: "Reflection & Next Week Planning",
                          focus:
                            "Relax, review overall progress, and sync with Kiara AI counselor",
                          tasks: [
                            {
                              id: "sun-1",
                              label: "Review weekly accuracy gains and earned badges",
                            },
                            {
                              id: "sun-2",
                              label: "Discuss study mindset & exam pacing with Kiara AI",
                            },
                            {
                              id: "sun-3",
                              label: "Prepare chapter goals for the upcoming week",
                            },
                          ],
                        },
                      ];

                      const currentDayPlan =
                        days[activePlannerDayIndex] || days[0];

                      return (
                        <div className="bg-white border border-[#EFF1F5] rounded-2xl p-4 sm:p-5 shadow-xs text-left space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EFF1F5]">
                            <div className="flex items-center gap-2.5">
                              <span className="p-1.5 rounded-xl bg-indigo-50 text-[#796AEF] border border-indigo-200/60 text-sm">
                                📅
                              </span>
                              <div>
                                <h4 className="text-xs sm:text-sm font-bold text-[#1E293B] uppercase tracking-wider font-sans">
                                  Personalized AI Study Timetable & Daily Planner
                                </h4>
                                <p className="text-[11px] text-[#4A4E5A] font-sans">
                                  Structured 7-day revision regimen aligned with your{" "}
                                  <strong className="text-[#796AEF] font-bold">
                                    Cognitive Radar
                                  </strong>{" "}
                                  deficits
                                </p>
                              </div>
                            </div>

                            {/* Status badge */}
                            <div className="flex items-center gap-2.5 bg-[#F6F7FB] px-3 py-1.5 rounded-xl border border-[#EFF1F5] shrink-0 self-start sm:self-auto shadow-2xs">
                              <div className="text-right">
                                <span className="text-[10px] font-sans uppercase font-bold text-[#4A4E5A] block">
                                  Today's Focus
                                </span>
                                <span className="text-xs font-bold text-[#1E293B]">
                                  {currentDayPlan.theme}
                                </span>
                              </div>
                              <div className="w-7 h-7 rounded-xl bg-indigo-50 text-[#796AEF] flex items-center justify-center text-xs font-bold border border-indigo-200/60">
                                {currentDayPlan.icon}
                              </div>
                            </div>
                          </div>

                          {/* Day pills selector strip */}
                          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 px-0.5 scrollbar-thin">
                            {days.map((d, idx) => {
                              const isActive = activePlannerDayIndex === idx;
                              return (
                                <button
                                  key={d.day}
                                  type="button"
                                  onClick={() => setActivePlannerDayIndex(idx)}
                                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                                    isActive
                                      ? "bg-[#796AEF] text-white border-[#796AEF] shadow-xs font-bold"
                                      : "bg-[#F6F7FB] hover:bg-slate-100 text-[#4A4E5A] hover:text-[#1E293B] border-[#EFF1F5]"
                                  }`}
                                >
                                  <span>{d.icon}</span>
                                  <span>{d.day.slice(0, 3)}</span>
                                  {idx ===
                                    (new Date().getDay() === 0
                                      ? 6
                                      : new Date().getDay() - 1) && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Current selected day revision card */}
                          <div className="bg-[#F6F7FB] border border-[#EFF1F5] rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between border-b border-[#EFF1F5] pb-2">
                              <div>
                                <span className="text-[10.5px] font-bold uppercase text-[#796AEF] tracking-wider font-sans">
                                  {currentDayPlan.day} • {currentDayPlan.theme}
                                </span>
                                <h5 className="text-xs sm:text-sm font-bold text-[#1E293B] mt-0.5">
                                  {currentDayPlan.title}
                                </h5>
                              </div>
                              <span className="text-[11px] text-[#4A4E5A] italic hidden sm:inline font-sans">
                                Focus: {currentDayPlan.focus}
                              </span>
                            </div>

                            {/* Tasks checklist */}
                            <div className="space-y-2">
                              {currentDayPlan.tasks.map((task) => {
                                const isDone = completedPlannerTasks[task.id];
                                return (
                                  <div
                                    key={task.id}
                                    onClick={() =>
                                      togglePlannerTask(task.id)
                                    }
                                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                      isDone
                                        ? "bg-emerald-50/70 border-emerald-300/60 text-emerald-950"
                                        : "bg-white border-[#EFF1F5] hover:border-indigo-300 text-[#1E293B] shadow-2xs"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div
                                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                                          isDone
                                            ? "bg-emerald-600 text-white"
                                            : "border-2 border-[#CBD5E1] bg-white"
                                        }`}
                                      >
                                        {isDone && (
                                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                                        )}
                                      </div>
                                      <span
                                        className={`text-xs font-semibold truncate ${
                                          isDone
                                            ? "line-through text-emerald-900/70"
                                            : "text-[#1E293B]"
                                        }`}
                                      >
                                        {task.label}
                                      </span>
                                    </div>

                                    {task.id.includes("-1") && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onEnterClassroom();
                                        }}
                                        className="px-2.5 py-1 bg-[#796AEF] hover:bg-[#6858e0] text-white rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                                      >
                                        <span>Start 🚀</span>
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </>
  );
};
