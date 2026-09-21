/**
 * SprintBoosterView.tsx
 * 7-Day Board Score Booster Plan: Curriculum stepper and progress bar,
 * composing the detailed day card.
 */
import React from "react";
import { SevenDayBoosterDay } from "./sprintTypes";
import { SEVEN_DAY_BOOSTER_PLAN } from "./sprintData";
import { SprintBoosterDayDetail } from "./SprintBoosterDayDetail";

interface SprintBoosterViewProps {
  isEng: boolean;
  activeBoosterDayNumber: number;
  setActiveBoosterDayNumber: (dayNum: number) => void;
  activeBoosterDay: SevenDayBoosterDay;
  completedBoosterDays: number[];
  toggleBoosterDayComplete: (dayNum: number) => void;
  totalBoosterMarks: number;
  completedMarksEarned: number;
  onDiscussWithCherry?: (params: {
    topic: string;
    subject: string;
    conceptTested?: string;
    hint?: string;
    question?: string;
  }) => void;
  onEnterClassroom?: () => void;
}

export const SprintBoosterView: React.FC<SprintBoosterViewProps> = ({
  isEng,
  activeBoosterDayNumber,
  setActiveBoosterDayNumber,
  activeBoosterDay,
  completedBoosterDays,
  toggleBoosterDayComplete,
  totalBoosterMarks,
  completedMarksEarned,
  onDiscussWithCherry,
  onEnterClassroom
}) => {
  return (
    <div className="space-y-6 text-left">
      {/* Booster Overview Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="space-y-1">
            <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded-md">
              {isEng ? "7-Day Micro-Drill Curriculum • 15 Mins Daily" : "7-Day Micro-Drill Curriculum • दैनिक 15 मिनट"}
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {isEng
                ? `7-Day Board Score Booster Plan (+${totalBoosterMarks} Marks Target)`
                : `7-दिवसीय बोर्ड स्कोर बूस्टर प्लान (+${totalBoosterMarks} अंक लक्ष्य)`}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">
                {isEng ? "Secured Marks" : "सुरक्षित अंक"}
              </span>
              <span className="text-base sm:text-lg font-black text-[#796AEF] font-mono">
                +{completedMarksEarned} / +{totalBoosterMarks} Marks
              </span>
            </div>
            <div className="w-24 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-[#796AEF] h-full transition-all duration-500"
                style={{
                  width: `${Math.round((completedMarksEarned / totalBoosterMarks) * 100)}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* 7-Day Day Selector Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {SEVEN_DAY_BOOSTER_PLAN.map((day) => {
            const isSelected = activeBoosterDayNumber === day.dayNumber;
            const isDone = completedBoosterDays.includes(day.dayNumber);

            return (
              <button
                key={day.dayNumber}
                type="button"
                onClick={() => setActiveBoosterDayNumber(day.dayNumber)}
                className={`min-h-[72px] p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-indigo-50/80 border-[#796AEF] text-slate-900 shadow-sm ring-2 ring-[#796AEF]/30"
                    : isDone
                    ? "bg-emerald-50/70 border-emerald-300 text-slate-900"
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-mono font-black">Day {day.dayNumber}</span>
                  {isDone && (
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-bold line-clamp-1">{day.subject}</div>
                <div className="text-[9.5px] font-mono text-amber-700 font-bold">+{day.targetMarks} Marks</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Day Detail Card */}
      <SprintBoosterDayDetail
        isEng={isEng}
        activeBoosterDay={activeBoosterDay}
        completedBoosterDays={completedBoosterDays}
        toggleBoosterDayComplete={toggleBoosterDayComplete}
        onDiscussWithCherry={onDiscussWithCherry}
        onEnterClassroom={onEnterClassroom}
      />
    </div>
  );
};
