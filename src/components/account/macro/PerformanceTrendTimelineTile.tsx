/**
 * PerformanceTrendTimelineTile.tsx
 * Chronological Accuracy Trendline with smooth Bézier SVG area & hover tooltips.
 */
import React from "react";

interface PerformanceTrendTimelineTileProps {
  dashboardStats: any;
}

export const PerformanceTrendTimelineTile: React.FC<PerformanceTrendTimelineTileProps> = ({
  dashboardStats
}) => {
  return (
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
  );
};
