/**
 * MacroRadarChartTile.tsx
 * 5-Axis Micro-Cognitive Dimensions SVG Radar Chart and Interactive Educator Insights box.
 */
import React from "react";
import { Target, Sparkles } from "lucide-react";
import { DIMENSION_DETAILS } from "../accountTypes";

interface MacroRadarChartTileProps {
  dashboardStats: any;
  activeDimensionIndex: number;
  setActiveDimensionIndex: (index: number) => void;
  isEnglish: boolean;
}

export const MacroRadarChartTile: React.FC<MacroRadarChartTileProps> = ({
  dashboardStats,
  activeDimensionIndex,
  setActiveDimensionIndex,
  isEnglish
}) => {
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

  const pointsStr = points.map((p) => `${p.x},${p.y}`).join(" ");

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
                const gridPoints = Array.from({ length: 5 }, (_, i) => {
                  const angle = ((-90 + i * 72) * Math.PI) / 180;
                  const x = cx + Math.cos(angle) * rMax * lvl;
                  const y = cy + Math.sin(angle) * rMax * lvl;
                  return `${x},${y}`;
                }).join(" ");

                return (
                  <polygon
                    key={idx}
                    points={gridPoints}
                    className="fill-none stroke-slate-200"
                    strokeWidth="1"
                    strokeDasharray={idx < 4 ? "3,3" : "none"}
                  />
                );
              })}

              {/* Spoke lines */}
              {Array.from({ length: 5 }, (_, i) => {
                const angle = ((-90 + i * 72) * Math.PI) / 180;
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
                const lx = cx + Math.cos(labelAngle) * labelDist;
                const ly = cy + Math.sin(labelAngle) * labelDist;
                const isSelected = activeDimensionIndex === i;

                return (
                  <g
                    key={i}
                    className="cursor-pointer"
                    onClick={() => setActiveDimensionIndex(i)}
                  >
                    {/* Invisible large hit-target */}
                    <circle cx={p.x} cy={p.y} r="16" fill="transparent" />
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
              "{dim.recommendation.replace("{score}", dimensionScore.toString())}"
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
};
