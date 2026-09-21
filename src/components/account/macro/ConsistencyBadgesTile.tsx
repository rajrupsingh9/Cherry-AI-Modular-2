/**
 * ConsistencyBadgesTile.tsx
 * Consistency, Milestone & Badges Progress tile with circular Stamina gauge and sync counters.
 */
import React from "react";

interface ConsistencyBadgesTileProps {
  dashboardStats: any;
  pastSessions?: any[];
  snapshots?: any[];
  quizAttempts?: any[];
  masteredCards?: Record<string, boolean>;
}

export const ConsistencyBadgesTile: React.FC<ConsistencyBadgesTileProps> = ({
  dashboardStats,
  pastSessions = [],
  snapshots = [],
  quizAttempts = [],
  masteredCards = {}
}) => {
  return (
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
                  (175.9 * dashboardStats.socraticStamina) / 100
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
  );
};
