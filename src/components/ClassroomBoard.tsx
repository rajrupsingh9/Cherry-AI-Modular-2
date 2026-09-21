/**
 * ClassroomBoard.tsx
 * Thin orchestrator for the interactive digital blackboard & live classroom session
 */
import React, { useState, useEffect } from "react";
import { Minimize2 } from "lucide-react";
import { ClassroomBoardProps, getDetectedSubject } from "./board/boardTypes";
import { ChalkboardTopicBlock } from "./board/ChalkboardTopicBlock";
import { TeachingPhaseTracker } from "./board/TeachingPhaseTracker";
import { BoardReadyPreClass, BoardConnectingState, DocumentSyncState } from "./board/BoardEmptyStates";
import { PreClassClassroomHub } from "./board/PreClassClassroomHub";
import { useAmbientSynth } from "./board/useAmbientSynth";
import { useChalkCanvas } from "./board/useChalkCanvas";
import { useBoardSyncAndScroll } from "./board/useBoardSyncAndScroll";
import { ChalkTypewriter } from "./ChalkTypewriter";
import { filterBoardContentByPhase } from "../utils/boardFilter";

export const ClassroomBoard: React.FC<ClassroomBoardProps> = ({
  latestSpeech,
  state,
  primaryColor,
  accentColor,
  onClearBoard,
  onSelectPrompt,
  overrideBlank = false,
  activeDocumentText,
  hasActiveDocument = false,
  studentAskedForWritingOrDrawing = false,
  isFullScreen = false,
  onToggleFullScreen = () => {},
  cherryVolume = 0,
  onOpenSyllabus,
  onWakeUp,
  teachingPhase = "intro",
  customBoardContent,
  onSaveSnapshot,
  topics,
  activeTopicIndex = 0,
  topicBoardsContent = {},
  onSyncBoardContent,
  detectedSubject,
  onCanvasRef,
  lessonTitle,
  isPaused = false,
  speechSpeed
}) => {
  const isLightBg =
    !primaryColor ||
    primaryColor === "#ffffff" ||
    primaryColor === "#F8FAFC" ||
    primaryColor.startsWith("#f") ||
    primaryColor.startsWith("#F");

  // Exit full-screen floating button controls
  const [showExitButton, setShowExitButton] = useState<boolean>(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isFullScreen) {
      setShowExitButton(true);
      timer = setTimeout(() => setShowExitButton(false), 3500);
    }
    return () => clearTimeout(timer);
  }, [isFullScreen]);

  const handleSlateClick = () => {
    if (isFullScreen) {
      setShowExitButton(true);
    }
  };

  // Focus ambient synthesizer
  const { isSynthPlaying, stopSynth, toggleSynth } = useAmbientSynth();

  // Blackboard content sync & scroll management
  const {
    activeBoardContent,
    boardSliceRef,
    activeBlockRef,
    handleScroll
  } = useBoardSyncAndScroll({
    latestSpeech,
    state,
    teachingPhase,
    customBoardContent,
    activeTopicIndex,
    onSyncBoardContent,
    primaryColor,
    onClearBoard
  });

  // Canvas drawing hooks
  useChalkCanvas({
    primaryColor,
    isLightBg,
    state,
    onCanvasRef
  });

  const subject = getDetectedSubject(activeBoardContent || latestSpeech);

  return (
    <div className="flex flex-col h-full w-full select-none" id="classroom-whiteboard-main">
      {/* Active Teaching Flow Phase Progress Tracker */}
      <TeachingPhaseTracker teachingPhase={teachingPhase} />

      {/* Blackboard Content Area */}
      <div
        className={`relative blackboard-chalk z-0 overflow-hidden flex flex-col w-full h-full min-h-0 ${
          isFullScreen ? "md:h-full md:max-h-none" : "md:h-[640px] md:max-h-[640px]"
        } ${isLightBg ? "light-board-chalk" : ""}`}
        id="chalkboard-main-slate"
        style={{
          backgroundColor: isLightBg ? "#ffffff" : primaryColor || "#0c201a",
          borderColor: isLightBg ? "#EFF1F5" : "rgba(255, 255, 255, 0.12)",
          boxShadow: isLightBg
            ? "0 1px 3px rgba(0, 0, 0, 0.05)"
            : "inset 0 0 60px rgba(0, 0, 0, 0.6), 0 4px 30px rgba(0, 0, 0, 0.2)"
        }}
        onClick={handleSlateClick}
        onTouchStart={handleSlateClick}
      >
        {/* Floating Exit Full Screen Button */}
        {isFullScreen && (
          <div
            className={`absolute top-4 right-4 z-50 transition-all duration-300 ${
              showExitButton
                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                : "opacity-0 scale-75 -translate-y-2 pointer-events-none"
            }`}
          >
            <button
              onClick={e => {
                e.stopPropagation();
                onToggleFullScreen();
              }}
              className="px-4 py-2 bg-white hover:bg-[#F6F7FB] text-[#1E293B] rounded-full border border-[#EFF1F5] shadow-md flex items-center gap-2 text-xs font-bold transition-all duration-200 cursor-pointer active:scale-90"
              title="Exit Full Screen Mode"
            >
              <Minimize2 className="w-4 h-4 text-[#796AEF]" />
              <span className="font-sans uppercase tracking-wider text-[11px]">Exit Fit</span>
            </button>
          </div>
        )}

        {/* Inner Scrollable Slate Sheet */}
        <div
          ref={boardSliceRef}
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto p-4 md:p-6 flex flex-col items-center ${
            activeBoardContent || hasActiveDocument || (activeDocumentText && !overrideBlank) || (topics && topics.length > 0)
              ? "justify-start"
              : "justify-center"
          } select-text scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent w-full pb-28 touch-pan-y`}
        >
          <div className="w-full max-w-4xl lg:max-w-5xl text-center space-y-4 z-10 relative pointer-events-auto">
            {topics && topics.length > 0 ? (
              <div className="w-full text-left space-y-8 py-2 animate-chalk-fade">
                {state === "disconnected" ? (
                  <BoardReadyPreClass
                    topics={topics}
                    activeTopicIndex={activeTopicIndex}
                    detectedSubject={detectedSubject}
                    isLightBg={isLightBg}
                    onWakeUp={onWakeUp}
                  />
                ) : state === "connecting" ? (
                  <BoardConnectingState isLightBg={isLightBg} />
                ) : (
                  topics.slice(0, activeTopicIndex + 1).map((topicText, idx) => {
                    const isCurrent = idx === activeTopicIndex;
                    const blockContent = isCurrent
                      ? activeBoardContent
                      : topicBoardsContent[idx] || topicText || "";

                    return (
                      <ChalkboardTopicBlock
                        key={`topic-block-${idx}`}
                        idx={idx}
                        isCurrent={isCurrent}
                        topicText={topicText}
                        detectedSubject={detectedSubject}
                        blockContent={blockContent}
                        accentColor={accentColor}
                        teachingPhase={teachingPhase || "intro"}
                        lessonTitle={lessonTitle}
                        customBoardContent={customBoardContent}
                        state={state}
                        cherryVolume={cherryVolume}
                        latestSpeech={latestSpeech}
                        isPaused={isPaused || false}
                        speechSpeed={speechSpeed}
                        activeBlockRef={isCurrent ? activeBlockRef : null}
                        isLightBg={isLightBg}
                      />
                    );
                  })
                )}
              </div>
            ) : activeBoardContent ? (
              <div className="animate-chalk-fade text-left w-full">
                <div
                  className={`chalk-font px-2 md:px-4 leading-loose tracking-wide ${
                    isLightBg ? "text-[#1E293B]" : "text-zinc-100/95"
                  } select-text w-full`}
                >
                  <ChalkTypewriter
                    text={filterBoardContentByPhase(activeBoardContent, teachingPhase, true)}
                    state={state}
                    cherryVolume={cherryVolume}
                    latestSpeech={latestSpeech}
                    isAcademicNotes={state === "disconnected"}
                    isPaused={isPaused}
                    teachingPhase={teachingPhase || "intro"}
                    speechSpeed={speechSpeed}
                  />
                </div>
              </div>
            ) : hasActiveDocument ? (
              <DocumentSyncState state={state} onWakeUp={onWakeUp} />
            ) : overrideBlank ? (
              <div className="text-[#4A4E5A]/50 py-10 space-y-3 text-center animate-pulse">
                <span className="text-2xl">⚡</span>
                <p className="font-mono text-[11px] uppercase tracking-widest font-bold">
                  Cherry is ready. Waiting for "Wake Up" click...
                </p>
              </div>
            ) : (
              <PreClassClassroomHub
                state={state}
                detectedSubject={detectedSubject}
                isSynthPlaying={isSynthPlaying}
                toggleSynth={toggleSynth}
                stopSynth={stopSynth}
                onWakeUp={onWakeUp}
                onOpenSyllabus={onOpenSyllabus}
                onSelectPrompt={onSelectPrompt}
              />
            )}
          </div>
        </div>

        {/* Minimal Chalk Ledge bottom bar */}
        <div className="absolute bottom-0 inset-x-0 h-1.5 bg-[#EFF1F5] z-10 flex items-center shadow-xs pointer-events-none select-none">
          <div className="w-12 h-1 bg-[#796AEF]/40 rounded ml-10" title="Chalk stick" />
          <div className="w-8 h-1 bg-[#796AEF]/20 rounded ml-4" title="Chalk stick" />
        </div>
      </div>
    </div>
  );
};
