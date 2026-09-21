/**
 * StrengthsAndGrowthTiles.tsx
 * Tiles displaying verified conceptual strengths and targeted mastery growth areas.
 */
import React from "react";

interface StrengthsAndGrowthTilesProps {
  dashboardStats: any;
}

export const StrengthsAndGrowthTiles: React.FC<StrengthsAndGrowthTilesProps> = ({
  dashboardStats
}) => {
  return (
    <>
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
            .map((str: any, idx: number) => (
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
          {dashboardStats.growths.slice(0, 3).map((g: any, idx: number) => (
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
    </>
  );
};
