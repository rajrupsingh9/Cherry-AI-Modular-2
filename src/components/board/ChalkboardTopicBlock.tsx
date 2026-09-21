/**
 * ChalkboardTopicBlock.tsx
 * Isolated topic block with clean headers, chalk typewriter and vector blackboard rendering
 */
import React from "react";
import { Sparkles, CheckCircle2, Bookmark } from "lucide-react";
import { ChalkboardTopicBlockProps } from "./boardTypes";
import { ChalkTypewriter } from "../ChalkTypewriter";
import { VectorDisplay } from "../VectorDisplay";
import { cleanTopicHeader, filterBoardContentByPhase } from "../../utils/boardFilter";

export const ChalkboardTopicBlock: React.FC<ChalkboardTopicBlockProps> = React.memo(({
  idx,
  isCurrent,
  topicText,
  detectedSubject,
  blockContent,
  accentColor,
  teachingPhase,
  lessonTitle,
  customBoardContent,
  state,
  cherryVolume,
  latestSpeech,
  isPaused,
  speechSpeed,
  activeBlockRef,
  isLightBg
}) => {
  const cleanTitle = cleanTopicHeader(topicText, detectedSubject, idx);
  const filteredContent = filterBoardContentByPhase(blockContent, teachingPhase, isCurrent);

  return (
    <div
      ref={isCurrent && activeBlockRef ? activeBlockRef : undefined}
      className={`w-full rounded-2xl transition-all duration-500 relative select-text border ${
        isCurrent
          ? isLightBg
            ? "bg-[#F6F7FB] border-[#EFF1F5] shadow-xs ring-1 ring-[#796AEF]/30 p-5 md:p-6"
            : "bg-white/[0.04] border-white/20 shadow-lg ring-1 ring-white/15 p-5 md:p-6"
          : isLightBg
            ? "bg-white border-[#EFF1F5] opacity-80 hover:opacity-100 p-4 md:p-5"
            : "bg-white/[0.02] border-white/10 opacity-75 hover:opacity-100 p-4 md:p-5"
      }`}
    >
      {/* Block Header / Phase Banner */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#EFF1F5] pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2.5">
          <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 ${
            isCurrent
              ? "bg-[#796AEF] text-white shadow-xs"
              : isLightBg
                ? "bg-[#F6F7FB] text-[#4A4E5A] border border-[#EFF1F5]"
                : "bg-white/10 text-zinc-300 border border-white/10"
          }`}>
            {isCurrent ? (
              <>
                <Sparkles className="w-3 h-3 animate-spin text-white" />
                <span>ACTIVE TOPIC {idx + 1}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>TOPIC {idx + 1} • COMPLETED</span>
              </>
            )}
          </span>

          <h4 className={`text-base md:text-lg font-sans font-black tracking-wide ${
            isLightBg ? "text-[#1E293B]" : "text-white"
          }`}>
            {cleanTitle}
          </h4>
        </div>

        {isCurrent && teachingPhase && (
          <span className="text-[10px] md:text-[10.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#796AEF]/10 border border-[#796AEF]/20 text-[#796AEF] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#796AEF] animate-ping" />
            <span>PHASE: {teachingPhase.toUpperCase()}</span>
          </span>
        )}
      </div>

      {/* Vector Layout / Geometric Diagram if present */}
      {filteredContent && filteredContent.includes("<svg") && (
        <div className="mb-4">
          <VectorDisplay svgString={filteredContent} />
        </div>
      )}

      {/* Chalkboard Notes Body with Instant KaTeX Rendering */}
      <div className={`chalk-font leading-relaxed tracking-wide text-sm md:text-base ${
        isLightBg ? "text-[#1E293B]" : "text-zinc-100"
      }`}>
        <ChalkTypewriter
          text={filteredContent}
          state={state}
          cherryVolume={cherryVolume}
          latestSpeech={latestSpeech}
          isAcademicNotes={!isCurrent}
          isPaused={isPaused}
          teachingPhase={teachingPhase}
          speechSpeed={speechSpeed}
        />
      </div>

      {/* Past Topic Subtle Watermark */}
      {!isCurrent && (
        <div className="mt-3 pt-2 border-t border-[#EFF1F5] flex items-center justify-between text-[11px] font-mono text-[#4A4E5A]">
          <span className="flex items-center gap-1">
            <Bookmark className="w-3 h-3 text-[#796AEF]" />
            <span>Topic {idx + 1} Notes Archived</span>
          </span>
          <span className="text-[10px] text-[#4A4E5A]/70">Scroll up anytime to review</span>
        </div>
      )}
    </div>
  );
});
