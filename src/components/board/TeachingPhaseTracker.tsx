/**
 * TeachingPhaseTracker.tsx
 * Horizontal flow state visualizer for the 5-phase teaching lifecycle
 */
import React from "react";
import { getTranslations } from "../../utils/i18n";

interface TeachingPhaseTrackerProps {
  teachingPhase?: string;
}

export const TeachingPhaseTracker: React.FC<TeachingPhaseTrackerProps> = ({ teachingPhase }) => {
  const t = getTranslations();
  const phases = [
    { key: "intro", label: `🎒 ${t.phaseIntro}`, desc: "Prediction Poll" },
    { key: "concept", label: `🖊️ ${t.phaseConcept}`, desc: "Scaffolded Board" },
    { key: "example", label: `🔍 ${t.phaseExample}`, desc: "Line-by-Line & Trap Alert" },
    { key: "doubt", label: `❓ ${t.phaseDoubt}`, desc: "Socratic Practice" },
    { key: "transition", label: `🚀 ${t.phaseTransition}`, desc: "Memory Retrieval" },
    { key: "complete", label: "🎓 Graduation", desc: "Class End" }
  ];

  return (
    <div className="hidden" id="teaching-phase-tracker">
      <div className="flex items-center justify-between w-full md:w-auto shrink-0">
        <div className="flex items-center gap-1.5 font-sans text-[10px] text-[#4A4E5A] uppercase tracking-wider leading-none font-bold">
          <span className="flex h-1.5 w-1.5 shrink-0 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#796AEF] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#796AEF]"></span>
          </span>
          <span>Flow State:</span>
        </div>
        <span className="md:hidden text-[10px] font-black text-[#796AEF] bg-[#796AEF]/10 px-2 py-0.5 rounded-full border border-[#796AEF]/20">
          Active: {(teachingPhase || "intro").toUpperCase()}
        </span>
      </div>

      <div className="flex items-center gap-1.5 md:gap-2 text-[10.5px] font-sans font-semibold tracking-wide text-[#4A4E5A] overflow-x-auto no-scrollbar pb-1 md:pb-0 w-full md:w-auto touch-pan-x select-none">
        {phases.map((phaseInfo, pIdx, arr) => {
          const isCurrent = (teachingPhase || "intro").toLowerCase() === phaseInfo.key.toLowerCase();
          const themeColors = isCurrent
            ? "text-[#796AEF] border-[#796AEF]/35 bg-[#796AEF]/10 shadow-xs scale-[1.03] font-black"
            : "text-[#4A4E5A] border-[#EFF1F5] bg-white hover:text-[#1E293B] hover:border-[#796AEF]/30";

          return (
            <React.Fragment key={phaseInfo.key}>
              <div className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 transition-all duration-300 select-none cursor-default shrink-0 ${themeColors}`}>
                <span className="whitespace-nowrap text-[10px] md:text-[11px] leading-tight font-sans">{phaseInfo.label}</span>
                <span className="hidden md:inline-block h-2 w-[1px] bg-[#EFF1F5]" />
                <span className="text-[9.5px] md:text-[10px] opacity-75 font-mono select-none hidden md:inline-block font-semibold">{phaseInfo.desc}</span>
              </div>
              {pIdx < arr.length - 1 && (
                <span className={`text-[9px] md:text-[10.5px] font-mono select-none transition-colors duration-300 shrink-0 ${isCurrent ? "text-[#796AEF] animate-pulse font-extrabold" : "text-[#EFF1F5] font-bold"}`}>
                  ➔
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
