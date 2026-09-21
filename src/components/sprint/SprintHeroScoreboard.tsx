/**
 * SprintHeroScoreboard.tsx
 * Hero banner and 3-column live speed bento scoreboard.
 */
import React from "react";
import { Zap } from "lucide-react";
import { SprintStats } from "./sprintTypes";

interface SprintHeroScoreboardProps {
  isEng: boolean;
  totalBoosterMarks: number;
  sprintStats: SprintStats;
}

export const SprintHeroScoreboard: React.FC<SprintHeroScoreboardProps> = ({
  isEng,
  totalBoosterMarks,
  sprintStats
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 text-slate-900 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5 text-left">
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/50 rounded-full blur-2xl pointer-events-none" />

      <div className="space-y-2 min-w-0 z-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs bg-indigo-50 text-indigo-700 font-mono px-3 py-1 rounded-full font-bold border border-indigo-200/80 flex items-center gap-1.5 shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-[#796AEF]" />
            {isEng
              ? "Speed Sprint & 7-Day Board Booster • Time Pacing"
              : "Speed Sprint & 7-Day Board Booster • गति व टाइम-पेसिंग"}
          </span>
          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            Stopwatch Pacing Analytics
          </span>
        </div>

        <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-tight flex flex-wrap items-center gap-2">
          <span>
            {isEng
              ? `Exam Time-Management: Bank 25+ mins & gain +${totalBoosterMarks} Board Marks`
              : `परीक्षा टाइम-मैनेजमेंट: 25+ मिनट की बचत व +${totalBoosterMarks} बोर्ड अंक वृद्धि`}
          </span>
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed max-w-2xl">
          {isEng
            ? "90% of students lose marks not from lack of concepts, but by spending 4 minutes on 45-second MCQs. Learn 10-second blackboard shortcuts and boost your board score with the 7-Day Sprint."
            : "90% छात्र अवधारणा न जानने से नहीं, बल्कि 45-सेकंड के MCQ पर 4 मिनट व्यर्थ करने के कारण अंक गँवाते हैं। 10-सेकंड के ब्लैकबोर्ड शॉर्टकट सीखें और 7-दिवसीय स्प्रिंट से अपना बोर्ड स्कोर बूस्ट करें।"}
        </p>
      </div>

      {/* Live Speed Bento Scoreboard - 3-col Grid */}
      <div className="grid grid-cols-3 gap-2.5 w-full md:w-auto shrink-0 z-10">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
            {isEng ? "Avg Time" : "औसत समय"}
          </span>
          <span className="text-lg sm:text-xl font-black text-[#796AEF] font-mono">
            {sprintStats.avgSeconds > 0 ? `${sprintStats.avgSeconds}s` : "--"}
          </span>
          <span className="text-[9.5px] text-slate-500 font-medium block">
            {isEng ? "Per Question" : "प्रति प्रश्न (Speed)"}
          </span>
        </div>

        <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3 text-center shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 block">
            {isEng ? "Accuracy" : "सटीकता"}
          </span>
          <span className="text-lg sm:text-xl font-black text-emerald-800 font-mono">
            {sprintStats.totalAnswered > 0 ? `${sprintStats.accuracy}%` : "--"}
          </span>
          <span className="text-[9.5px] text-emerald-700 font-medium block">Accuracy Rate</span>
        </div>

        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3 text-center shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 block">
            {isEng ? "Time Banked" : "समय बचत"}
          </span>
          <span className="text-lg sm:text-xl font-black text-amber-800 font-mono">
            {sprintStats.timeSavedSeconds > 0
              ? `+${sprintStats.timeSavedSeconds}s`
              : sprintStats.timeSavedSeconds < 0
              ? `${sprintStats.timeSavedSeconds}s`
              : "0s"}
          </span>
          <span className="text-[9.5px] text-amber-700 font-medium block">Time Banked</span>
        </div>
      </div>
    </div>
  );
};
