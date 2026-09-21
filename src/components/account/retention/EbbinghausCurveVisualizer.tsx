/**
 * EbbinghausCurveVisualizer.tsx
 * Interactive SVG comparison between rapid single-lecture decay vs reinforced spaced repetition curves.
 */
import React from "react";
import { TrendingUp } from "lucide-react";
import { RetentionEngineData } from "./retentionTypes";

interface EbbinghausCurveVisualizerProps {
  isEnglish: boolean;
  retentionEngineData: RetentionEngineData;
}

export const EbbinghausCurveVisualizer: React.FC<EbbinghausCurveVisualizerProps> = ({
  isEnglish,
  retentionEngineData,
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 gap-2">
        <div>
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-[#796AEF] border border-indigo-100/90 flex items-center justify-center shrink-0 text-xs shadow-2xs">
              <TrendingUp className="w-3.5 h-3.5 text-[#796AEF]" />
            </span>
            <span>
              {isEnglish
                ? "The Science of Spaced Repetition • Ebbinghaus Forgetting Curve"
                : "The Science of Spaced Repetition • विस्मृति वक्र व वैज्ञानिक दोहराव"}
            </span>
          </h4>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            {isEnglish
              ? "Without spaced reviews, retention drops by up to 70% in 7 days. A timely 3-minute flashcard session resets recall back to 100%."
              : "बिना रिवीज़न 7 दिनों में 70% तक विस्मृति हो जाती है। समय पर 3-मिनट फ्लैशकार्ड रिवीज़न से याददाश्त 100% पर रीसेट हो जाती है।"}
          </p>
        </div>
        <span className="text-[10.5px] font-mono font-bold text-[#796AEF] bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/80 shrink-0 self-start sm:self-auto shadow-2xs">
          🧠 Leitner Spacing Active
        </span>
      </div>

      {/* SVG Interactive Forgetting Curve Comparison Graphic */}
      <div className="bg-slate-50/90 border border-slate-200/70 rounded-xl p-3.5 sm:p-5 text-slate-900 relative overflow-hidden shadow-2xs">
        <div className="flex flex-wrap items-center justify-between mb-3 text-xs font-mono gap-2">
          <span className="text-rose-600 font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            {isEnglish ? "Single Lecture (Fast Decay)" : "एकल व्याख्यान (तेज़ विस्मृति)"}
          </span>
          <span className="text-emerald-700 font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            {isEnglish ? "Spaced Repetition (Reinforced Memory)" : "अंतरालीय पुनरावृत्ति (मजबूत स्मृति)"}
          </span>
        </div>

        {/* Responsive SVG Chart */}
        <div className="w-full h-44 sm:h-52 relative">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 500 160"
            preserveAspectRatio="none"
          >
            {/* Grid Lines */}
            <line
              x1="40"
              y1="20"
              x2="480"
              y2="20"
              stroke="#E2E8F0"
              strokeDasharray="3 3"
              strokeWidth="0.8"
            />
            <line
              x1="40"
              y1="55"
              x2="480"
              y2="55"
              stroke="#E2E8F0"
              strokeDasharray="3 3"
              strokeWidth="0.8"
            />
            <line
              x1="40"
              y1="90"
              x2="480"
              y2="90"
              stroke="#E2E8F0"
              strokeDasharray="3 3"
              strokeWidth="0.8"
            />
            <line
              x1="40"
              y1="125"
              x2="480"
              y2="125"
              stroke="#E2E8F0"
              strokeDasharray="3 3"
              strokeWidth="0.8"
            />

            {/* Y Axis Labels */}
            <text
              x="5"
              y="24"
              fill="#64748B"
              fontSize="9.5"
              fontFamily="monospace"
            >
              100%
            </text>
            <text
              x="12"
              y="59"
              fill="#64748B"
              fontSize="9.5"
              fontFamily="monospace"
            >
              75%
            </text>
            <text
              x="12"
              y="94"
              fill="#64748B"
              fontSize="9.5"
              fontFamily="monospace"
            >
              50%
            </text>
            <text
              x="12"
              y="129"
              fill="#64748B"
              fontSize="9.5"
              fontFamily="monospace"
            >
              25%
            </text>

            {/* X Axis Labels */}
            <text
              x="40"
              y="152"
              fill="#64748B"
              fontSize="9.5"
              fontFamily="monospace"
            >
              Day 0
            </text>
            <text
              x="110"
              y="152"
              fill="#64748B"
              fontSize="9.5"
              fontFamily="monospace"
            >
              Day 1
            </text>
            <text
              x="190"
              y="152"
              fill="#64748B"
              fontSize="9.5"
              fontFamily="monospace"
            >
              Day 3
            </text>
            <text
              x="270"
              y="152"
              fill="#64748B"
              fontSize="9.5"
              fontFamily="monospace"
            >
              Day 7
            </text>
            <text
              x="360"
              y="152"
              fill="#64748B"
              fontSize="9.5"
              fontFamily="monospace"
            >
              Day 14
            </text>
            <text
              x="450"
              y="152"
              fill="#64748B"
              fontSize="9.5"
              fontFamily="monospace"
            >
              Day 30
            </text>

            {/* Curve 1: Rapid Decay without review (Rose) */}
            <path
              d="M 40 20 Q 120 100 270 120 T 480 135"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="3"
              strokeDasharray="4 2"
            />

            {/* Curve 2: Spaced Repetition (Reinforced Peaks - Emerald) */}
            <path
              d="M 40 20 Q 80 50 110 65 L 110 20 Q 150 45 190 55 L 190 20 Q 230 35 270 42 L 270 20 Q 320 30 360 35 L 360 20 Q 420 25 480 28"
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
            />

            {/* Key Review Nodes with Pulsing Glow */}
            <circle cx="110" cy="20" r="4" fill="#10B981" />
            <circle cx="190" cy="20" r="4" fill="#10B981" />
            <circle cx="270" cy="20" r="4" fill="#10B981" />
            <circle cx="360" cy="20" r="4" fill="#10B981" />

            {/* Annotations */}
            <text
              x="115"
              y="14"
              fill="#796AEF"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
            >
              1st Review
            </text>
            <text
              x="195"
              y="14"
              fill="#796AEF"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
            >
              2nd
            </text>
            <text
              x="275"
              y="14"
              fill="#796AEF"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
            >
              3rd
            </text>
            <text
              x="365"
              y="14"
              fill="#796AEF"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
            >
              4th (Mastered)
            </text>
          </svg>
        </div>

        <div className="mt-3 text-[11px] text-slate-600 font-mono flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/70 pt-2.5">
          <span className="flex items-center gap-1.5">
            <span className="text-slate-400">💡</span>{" "}
            {isEnglish ? "Current Retention: " : "वर्तमान याददाश्त स्तर: "}
            <strong className="text-slate-900 font-bold">
              {retentionEngineData.avgRetention}%
            </strong>{" "}
            {isEnglish ? "Across All Subjects" : "समग्र विषयों में"}
          </span>
          <span className="text-[#796AEF] font-bold">
            {isEnglish ? "Recommended Review: " : "अनुशंसित रिवीज़न: "}
            <strong className="underline decoration-[#796AEF]/40 underline-offset-2">
              {isEnglish
                ? `${retentionEngineData.criticalCount} Topics Due Today`
                : `${retentionEngineData.criticalCount} टॉपिक्स आज देय हैं`}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
