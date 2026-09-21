/**
 * WeeklySmartStudyPlannerTile.tsx
 * Personalized 7-Day AI Study Timetable & Daily Revision Planner with interactive task completion.
 */
import React, { useState, useMemo } from "react";
import { Check } from "lucide-react";
import { getStudyDaysPlan } from "./plannerData";

interface WeeklySmartStudyPlannerTileProps {
  subject: string;
  onEnterClassroom?: () => void;
}

export const WeeklySmartStudyPlannerTile: React.FC<WeeklySmartStudyPlannerTileProps> = ({
  subject,
  onEnterClassroom
}) => {
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

  const days = useMemo(() => getStudyDaysPlan(subject), [subject]);
  const currentDayPlan = days[activePlannerDayIndex] || days[0];

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
                onClick={() => togglePlannerTask(task.id)}
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
                      if (onEnterClassroom) onEnterClassroom();
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
};
