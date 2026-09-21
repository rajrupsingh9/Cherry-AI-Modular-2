/**
 * SprintModeSwitcher.tsx
 * Mode switcher segmented bar between Live Sprint Arena and 7-Day Score Booster.
 */
import React from "react";
import { Zap, Calendar } from "lucide-react";

interface SprintModeSwitcherProps {
  isEng: boolean;
  activeViewMode: "sprint_arena" | "seven_day_booster";
  setActiveViewMode: (mode: "sprint_arena" | "seven_day_booster") => void;
  totalBoosterMarks: number;
  completedBoosterDaysCount: number;
  completedMarksEarned: number;
}

export const SprintModeSwitcher: React.FC<SprintModeSwitcherProps> = ({
  isEng,
  activeViewMode,
  setActiveViewMode,
  totalBoosterMarks,
  completedBoosterDaysCount,
  completedMarksEarned
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-2 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => setActiveViewMode("sprint_arena")}
          className={`min-h-[44px] flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
            activeViewMode === "sprint_arena"
              ? "bg-[#796AEF] text-white border-[#796AEF] shadow-2xs ring-2 ring-indigo-200"
              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>{isEng ? "⏱️ Live Time-Pacing Sprint Arena" : "⏱️ लाइव टाइम-पेसिंग स्प्रिंट (Live Arena)"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewMode("seven_day_booster")}
          className={`min-h-[44px] flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
            activeViewMode === "seven_day_booster"
              ? "bg-[#796AEF] text-white border-[#796AEF] shadow-2xs ring-2 ring-indigo-200"
              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>
            {isEng
              ? `📅 7-Day Board Score Booster (+${totalBoosterMarks} Marks)`
              : `📅 7-दिवसीय बोर्ड स्कोर बूस्टर (+${totalBoosterMarks} अंक)`}
          </span>
        </button>
      </div>

      <div className="text-[11px] font-mono text-slate-500 px-3 py-1 bg-slate-50 rounded-lg border border-slate-200/80 w-full sm:w-auto text-center sm:text-right">
        {activeViewMode === "sprint_arena" ? (
          <span>{isEng ? "Target: Accurate answer in 30-60 seconds" : "लक्ष्य: 30-60 सेकंड में सटीक उत्तर"}</span>
        ) : (
          <span className="text-emerald-700 font-bold">
            {isEng
              ? `Progress: ${completedBoosterDaysCount}/7 Days Complete (+${completedMarksEarned} Marks Secured)`
              : `प्रगति: ${completedBoosterDaysCount}/7 दिन पूर्ण (+${completedMarksEarned} अंक सुरक्षित)`}
          </span>
        )}
      </div>
    </div>
  );
};
