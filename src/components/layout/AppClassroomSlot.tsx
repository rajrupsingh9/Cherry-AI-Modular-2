/**
 * AppClassroomSlot.tsx
 * Encapsulated ClassroomScreen slot renderer passing controller bindings.
 */
import React from "react";
import { ClassroomScreen } from "../screens/ClassroomScreen";
import { AppControllerType } from "../../hooks/app/useAppController";
import { extractYoutubeId } from "../../utils/youtubeUtils";

interface AppClassroomSlotProps {
  app: AppControllerType;
}

export const AppClassroomSlot: React.FC<AppClassroomSlotProps> = ({ app }) => {
  const {
    isFullScreenBoard,
    setIsFullScreenBoard,
    activeWorkspaceTab,
    setActiveWorkspaceTab,
    activeColors,
    theme,
    setTheme,
    handleThemeChange,
    showTips,
    setShowTips,
    showCaptions,
    setShowCaptions,
    youtubeUrl,
    setYoutubeUrl,
    isYoutubeLoading,
    isYtPlayerExpanded,
    setIsYtPlayerExpanded,
    showMobileYtPlayer,
    setShowMobileYtPlayer,
    activeMobileTab,
    setActiveMobileTab,
    isQuizFullScreenOpen,
    setIsQuizFullScreenOpen,
    t,
    topics,
    dialogueHistory,
    authBundle,
    docBundle,
    snapshotBundle,
    classroomBundle,
    cherryActionsBundle,
  } = app;

  return (
    <ClassroomScreen
      isFullScreenBoard={isFullScreenBoard}
      setIsFullScreenBoard={setIsFullScreenBoard}
      activeWorkspaceTab={activeWorkspaceTab}
      setActiveWorkspaceTab={setActiveWorkspaceTab}
      activeColors={activeColors}
      theme={theme}
      setTheme={setTheme}
      state={classroomBundle.state}
      micStream={classroomBundle.micStream}
      playbackStream={classroomBundle.playbackStream}
      isPaused={classroomBundle.isPaused}
      togglePauseTeaching={classroomBundle.togglePauseTeaching}
      speechSpeed={classroomBundle.speechSpeed}
      setSpeechSpeed={classroomBundle.setSpeechSpeed}
      handleThemeChange={handleThemeChange}
      handleEndAndArchiveSession={classroomBundle.handleEndAndArchiveSession}
      handlePowerToggle={classroomBundle.handlePowerToggle}
      handleClassComplete={classroomBundle.handleClassComplete}
      user={authBundle.user}
      studentName={authBundle.studentDetails.name}
      studentGrade={authBundle.studentDetails.grade}
      studentSubject={authBundle.studentDetails.subject}
      showTips={showTips}
      setShowTips={setShowTips}
      setShowCaptions={setShowCaptions}
      youtubeUrl={youtubeUrl}
      setYoutubeUrl={setYoutubeUrl}
      isYoutubeLoading={isYoutubeLoading}
      isYtPlayerExpanded={isYtPlayerExpanded}
      setIsYtPlayerExpanded={setIsYtPlayerExpanded}
      showMobileYtPlayer={showMobileYtPlayer}
      setShowMobileYtPlayer={setShowMobileYtPlayer}
      extractYoutubeId={extractYoutubeId}
      activeMobileTab={activeMobileTab}
      setActiveMobileTab={setActiveMobileTab}
      isQuizFullScreenOpen={isQuizFullScreenOpen}
      setIsQuizFullScreenOpen={setIsQuizFullScreenOpen}
      t={t}
      activeDocument={docBundle.activeDocument}
      handleClearDocument={docBundle.handleClearDocument}
      disconnect={classroomBundle.disconnect}
      getSubTitleText={classroomBundle.getSubTitleText}
      userVolume={classroomBundle.userVolume}
      userTranscript={classroomBundle.userTranscript}
      cherryTranscript={classroomBundle.cherryTranscript}
      handlePrevTopic={classroomBundle.handlePrevTopic}
      handleNextTopic={classroomBundle.handleNextTopic}
      handleSendPromptText={classroomBundle.handleSendPromptText}
      handleSelectPrompt={classroomBundle.handleSelectPrompt}
      studentAskedForWritingOrDrawing={classroomBundle.studentAskedForWritingOrDrawing}
      cherryVolume={classroomBundle.cherryVolume}
      handleOpenSyllabus={cherryActionsBundle.handleOpenSyllabus}
      teachingPhase={classroomBundle.teachingPhase}
      customBoardContent={docBundle.customBoardContent}
      handleManualSaveSnapshot={snapshotBundle.handleManualSaveSnapshot}
      topics={topics}
      activeTopicIndex={docBundle.activeTopicIndex}
      topicBoardsContent={docBundle.topicBoardsContent}
      handleSyncBoardContent={classroomBundle.handleSyncBoardContent}
      pauseTeaching={classroomBundle.pauseTeaching}
      resumeTeaching={classroomBundle.resumeTeaching}
      showCaptions={showCaptions}
      dialogueHistory={dialogueHistory}
      injectPromptText={classroomBundle.injectPromptText}
    />
  );
};
