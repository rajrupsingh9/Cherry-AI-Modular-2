import React from "react";
import { Youtube, RefreshCw } from "lucide-react";
import { AppHeader } from "../AppHeader";
import { ClassroomBoard } from "../ClassroomBoard";
import { QuickDoubtWidget } from "../QuickDoubtWidget";
import { THEME_CONFIGS, ThemeType } from "../../types";

export interface ClassroomScreenProps {
  isFullScreenBoard: boolean;
  setIsFullScreenBoard: (val: boolean) => void;
  currentScreen: string;
  studentSubject: string;
  studentGrade: string;
  studentMedium?: string;
  state: any;
  handlePowerToggle: () => void;
  isPaused: boolean;
  togglePauseTeaching: () => void;
  t: any;
  theme: ThemeType;
  handleThemeChange: (theme: ThemeType) => void;
  THEME_CONFIGS: typeof THEME_CONFIGS;
  speechSpeed: number;
  setSpeechSpeed: (speed: number) => void;
  activeColors: any;
  activeDocument: any;
  showMobileYtPlayer: boolean;
  setShowMobileYtPlayer: (val: boolean) => void;
  addToast: (msg: string, type: "info" | "success" | "error" | "warning") => void;

  uploadedButWaitingWakeup: boolean;
  latestSpeechText: string;
  setDialogueHistory: React.Dispatch<React.SetStateAction<any[]>>;
  setCustomBoardContent: (content: string) => void;
  setTopicBoardsContent: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  handleSelectPrompt: (prompt: string) => void;
  studentAskedForWritingOrDrawing: boolean;
  cherryVolume: number;
  handleOpenSyllabus: () => void;
  teachingPhase: any;
  customBoardContent: string;
  handleManualSaveSnapshot: () => void;
  topics: any[];
  activeTopicIndex: number;
  topicBoardsContent: Record<number, string>;
  handleSyncBoardContent: (topicIdx: number, content: string) => void;
  pauseTeaching: () => void;
  resumeTeaching: () => void;
  showCaptions: boolean;
  dialogueHistory: Array<{ id: string; sender: "user" | "cherry"; text: string }>;
  injectPromptText: (text: string) => void;
}

export const ClassroomScreen: React.FC<ClassroomScreenProps> = ({
  isFullScreenBoard,
  setIsFullScreenBoard,
  currentScreen,
  studentSubject,
  studentGrade,
  studentMedium,
  state,
  handlePowerToggle,
  isPaused,
  togglePauseTeaching,
  t,
  theme,
  handleThemeChange,
  THEME_CONFIGS,
  speechSpeed,
  setSpeechSpeed,
  activeColors,
  activeDocument,
  showMobileYtPlayer,
  setShowMobileYtPlayer,
  addToast,
  uploadedButWaitingWakeup,
  latestSpeechText,
  setDialogueHistory,
  setCustomBoardContent,
  setTopicBoardsContent,
  handleSelectPrompt,
  studentAskedForWritingOrDrawing,
  cherryVolume,
  handleOpenSyllabus,
  teachingPhase,
  customBoardContent,
  handleManualSaveSnapshot,
  topics,
  activeTopicIndex,
  topicBoardsContent,
  handleSyncBoardContent,
  pauseTeaching,
  resumeTeaching,
  showCaptions,
  dialogueHistory,
  injectPromptText,
}) => {
  return (
    <div
      id="live-classroom-container"
      className="flex-1 flex flex-col justify-between w-full h-full min-h-0 overflow-hidden relative bg-[#F6F7FB]"
    >
      {/* Subtle Mobile Top HUD - Sleek, Clean, Modern Light Header Bar (Uniform 52px Native Header) */}
      <AppHeader
        isFullScreenBoard={isFullScreenBoard}
        setIsFullScreenBoard={setIsFullScreenBoard}
        currentScreen={currentScreen}
        studentSubject={studentSubject}
        studentGrade={studentGrade}
        state={state}
        handlePowerToggle={handlePowerToggle}
        isPaused={isPaused}
        togglePauseTeaching={togglePauseTeaching}
        t={t}
        theme={theme}
        handleThemeChange={handleThemeChange}
        THEME_CONFIGS={THEME_CONFIGS}
        speechSpeed={speechSpeed}
        setSpeechSpeed={setSpeechSpeed}
        activeColors={activeColors}
        activeDocument={activeDocument}
        showMobileYtPlayer={showMobileYtPlayer}
        setShowMobileYtPlayer={setShowMobileYtPlayer}
        addToast={addToast}
      />

      {/* Core Interactive Blackboard Slate Section */}
      <div className="flex-1 flex flex-col relative min-h-0 w-full overflow-hidden">
        {/* WHITE BOARD: Spans entire layout width & height, floats inside a nice padded card on desktop */}
        <div
          className={`w-full flex-1 md:aspect-auto md:flex-1 shrink-0 landscape:aspect-auto landscape:flex-1 landscape:h-full flex flex-col relative min-h-0 bg-[#f8fafc] transition-all duration-300 ${
            isFullScreenBoard ? "p-0" : "p-3 md:p-6"
          }`}
        >
          {/* Mobile YouTube Video Banner Overlay */}
          {showMobileYtPlayer && activeDocument?.mimeType === "video/youtube" && (() => {
            const matchYtId = activeDocument?.filename?.match(/\(ID:\s*([a-zA-Z0-9_-]{11})\)/);
            const currentVideoId = matchYtId ? matchYtId[1] : null;
            if (!currentVideoId) return null;
            return (
              <div className="w-full bg-white border-b border-red-100 p-2 space-y-1.5 animate-fade-in text-left z-20 absolute top-0 inset-x-0 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-red-600 text-[9px] font-mono font-black uppercase">
                    <Youtube className="w-3 h-3 text-red-600 animate-pulse" />
                    <span>Source Video</span>
                  </div>
                  <button
                    onClick={() => setShowMobileYtPlayer(false)}
                    className="text-[8px] font-bold text-red-600 hover:text-red-750 px-1.5 py-0.5 border border-red-200 rounded"
                  >
                    ✕ Close
                  </button>
                </div>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black shadow-lg">
                  <iframe
                    src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=0&rel=0`}
                    title="Chalkboard YouTube Mobile reference"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full border-0"
                  />
                </div>
              </div>
            );
          })()}

          {uploadedButWaitingWakeup ? (
            <ClassroomBoard
              latestSpeech=""
              state={state}
              primaryColor={activeColors.primary}
              accentColor={activeColors.accent}
              onClearBoard={() => {
                setDialogueHistory([]);
                setCustomBoardContent("");
                setTopicBoardsContent({});
              }}
              onSelectPrompt={handleSelectPrompt}
              overrideBlank={true}
              activeDocumentText={activeDocument?.markdown || ""}
              hasActiveDocument={!!activeDocument}
              studentAskedForWritingOrDrawing={studentAskedForWritingOrDrawing}
              isFullScreen={isFullScreenBoard}
              onToggleFullScreen={() => setIsFullScreenBoard(!isFullScreenBoard)}
              cherryVolume={cherryVolume}
              onOpenSyllabus={handleOpenSyllabus}
              onWakeUp={handlePowerToggle}
              teachingPhase={teachingPhase}
              customBoardContent={customBoardContent}
              onSaveSnapshot={handleManualSaveSnapshot}
              topics={topics}
              activeTopicIndex={activeTopicIndex}
              topicBoardsContent={topicBoardsContent}
              onSyncBoardContent={handleSyncBoardContent}
              detectedSubject={activeDocument?.detectedSubject}
              isPaused={isPaused}
              onTogglePause={togglePauseTeaching}
              pauseTeaching={pauseTeaching}
              resumeTeaching={resumeTeaching}
              speechSpeed={speechSpeed}
              mediumOfLearning={studentMedium}
            />
          ) : state === "connecting" ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2 bg-[#0c201a] blackboard-chalk m-1.5 rounded-lg min-h-[220px]">
              <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
              <p className="text-zinc-400 text-[10px] font-mono tracking-widest uppercase">
                Preparing Blackboard slides...
              </p>
            </div>
          ) : (
            <ClassroomBoard
              latestSpeech={latestSpeechText}
              state={state}
              primaryColor={activeColors.primary}
              accentColor={activeColors.accent}
              onClearBoard={() => {
                setDialogueHistory([]);
                setCustomBoardContent("");
                setTopicBoardsContent({});
              }}
              onSelectPrompt={handleSelectPrompt}
              activeDocumentText={activeDocument?.markdown || ""}
              hasActiveDocument={!!activeDocument}
              studentAskedForWritingOrDrawing={studentAskedForWritingOrDrawing}
              isFullScreen={isFullScreenBoard}
              onToggleFullScreen={() => setIsFullScreenBoard(!isFullScreenBoard)}
              cherryVolume={cherryVolume}
              onOpenSyllabus={handleOpenSyllabus}
              onWakeUp={handlePowerToggle}
              teachingPhase={teachingPhase}
              customBoardContent={customBoardContent}
              onSaveSnapshot={handleManualSaveSnapshot}
              topics={topics}
              activeTopicIndex={activeTopicIndex}
              topicBoardsContent={topicBoardsContent}
              onSyncBoardContent={handleSyncBoardContent}
              detectedSubject={activeDocument?.detectedSubject}
              isPaused={isPaused}
              onTogglePause={togglePauseTeaching}
              pauseTeaching={pauseTeaching}
              resumeTeaching={resumeTeaching}
              speechSpeed={speechSpeed}
              mediumOfLearning={studentMedium}
            />
          )}

          {/* FLOATING SUBTITLE FEED ON BOARD */}
          {showCaptions && dialogueHistory.length > 0 && (
            <div className="absolute bottom-4 inset-x-3 z-20 pointer-events-none flex justify-center">
              <div className="bg-white/95 backdrop-blur-md border border-[#EFF1F5] text-[#1E293B] px-3.5 py-2 rounded-xl shadow-md text-[11.5px] text-center max-w-sm animate-bounce-short leading-relaxed pointer-events-auto font-medium">
                <span className="font-mono text-[#796AEF] text-[10px] block uppercase tracking-wider mb-0.5 font-bold">
                  Cherry Ma&apos;am:
                </span>
                <p className="italic">
                  &quot;{dialogueHistory.filter((item) => item.sender === "cherry").slice(-1)[0]?.text || "Speak loudly, let's learn!"}&quot;
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FLOATING QUICK DOUBT BUTTON & POPOVER */}
        <QuickDoubtWidget
          state={state}
          onInjectPrompt={injectPromptText}
          onToast={addToast}
          setDialogueHistory={setDialogueHistory}
          mediumOfLearning={studentMedium}
        />
      </div>
    </div>
  );
};
