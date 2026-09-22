/**
 * AppShell.tsx
 * Top-level mobile frame canvas, ambient gradients, router, bottom navigation, modals, and toasts.
 */
import React from "react";
import { ShieldCheck } from "lucide-react";
import { AppControllerType } from "../../hooks/app/useAppController";
import { AppViewRouter } from "./AppViewRouter";
import { AppBottomNav } from "./AppBottomNav";
import { AppClassroomSlot } from "./AppClassroomSlot";
import { AppModalsSlot } from "./AppModalsSlot";
import { AppToastsContainer } from "./AppToastsContainer";
import { extractYoutubeId } from "../../utils/youtubeUtils";
import { triggerCelebrationConfetti } from "../../utils/confetti";
import { db, auth } from "../../lib/firebase";
import { AudioPodcastData } from "../../types";

interface AppShellProps {
  app: AppControllerType;
}

export const AppShell: React.FC<AppShellProps> = ({ app }) => {
  const {
    activeColors,
    currentScreen,
    setCurrentScreen,
    showBrandSplash,
    setShowBrandSplash,
    showIntroWalkthrough,
    setShowIntroWalkthrough,
    showEnrollmentScreen,
    setShowEnrollmentScreen,
    isFullScreenBoard,
    isQuizFullScreenOpen,
    setIsQuizFullScreenOpen,
    toasts,
    addToast,
    t,
    topics,
    sessionId,
    setSessionId,
    setDialogueHistory,
    youtubeUrl,
    setYoutubeUrl,
    isYoutubeLoading,
    setIsYoutubeLoading,
    setActiveAudioPodcast,
    setIsAudioPodcastModalOpen,
    subscriptionState,
    setSubscriptionState,
    authBundle,
    docBundle,
    snapshotBundle,
    classroomBundle,
    sessionSyncBundle,
    cherryActionsBundle,
  } = app;

  return (
    <div className="min-h-screen bg-[#071312] text-[#0a3641] flex flex-col items-center justify-center font-sans relative select-none p-0 md:p-6 transition-all duration-1000 overflow-hidden">
      {/* Background decoration for the desktop study room / desk view */}
      <div className="absolute inset-0 bg-[radial-gradient(#152d29_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none opacity-40 z-0" />

      {/* Dynamic Floating Desktop Backlights */}
      <div
        className="hidden md:block absolute top-10 left-10 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.08] pointer-events-none z-0"
        style={{ background: `radial-gradient(circle, ${activeColors.primary} 0%, transparent 85%)` }}
      />
      <div
        className="hidden md:block absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.08] pointer-events-none z-0"
        style={{ background: `radial-gradient(circle, ${activeColors.accent} 0%, transparent 85%)` }}
      />

      {/* Modern High-Fidelity Mobile Device Frame Mockup */}
      <div
        id="studyverse-mobile-frame"
        className="relative w-full h-[100dvh] md:h-[860px] md:w-[410px] md:max-w-md bg-[#04110e] md:rounded-[44px] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_0_12px_#1c2825,0_0_0_13px_#121b19,0_0_30px_5px_rgba(196,245,0,0.12)] flex flex-col overflow-hidden z-10 border border-teal-500/10 transition-all duration-500"
      >
        {/* The App Main Viewport wrapper */}
        <div className="flex-1 flex flex-col relative overflow-hidden min-h-0 bg-[#f4f7f5] text-[#0a3641]">
          {/* Admin Student-Preview Quick Return Sticky Banner */}
          {authBundle.isAdmin && authBundle.adminViewMode === "student" && currentScreen !== "admin" && (
            <div className="w-full bg-[#796AEF] text-white px-3 py-1.5 flex items-center justify-between text-xs z-30 shrink-0 shadow-xs select-none">
              <div className="flex items-center gap-1.5 truncate pr-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[10.5px] font-bold tracking-tight truncate">
                  Admin Preview: Student Mode
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  authBundle.setAdminViewMode("admin");
                  setCurrentScreen("admin");
                }}
                className="px-2.5 py-1 bg-white text-[#796AEF] font-bold rounded-lg hover:bg-indigo-50 active:scale-95 transition-all text-[10px] flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Return to Admin</span>
              </button>
            </div>
          )}

          {/* Inner ambient gradients of the active study theme */}
          <div className={`absolute inset-0 bg-gradient-to-b ${activeColors.bgGradient} transition-all duration-1000 z-0`} />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40 mix-blend-overlay z-0" />
          <div
            className="absolute top-1/4 left-1/4 w-[120%] h-[50%] rounded-full blur-[80px] opacity-[0.06] pointer-events-none transition-all duration-1000 z-0"
            style={{ background: `radial-gradient(circle, ${activeColors.primary} 0%, transparent 80%)` }}
          />

          {/* Scrolling active viewport box */}
          <div className="flex-1 flex flex-col min-h-0 relative z-10 overflow-y-auto overflow-x-hidden scroll-smooth">
            <AppViewRouter
              currentScreen={currentScreen}
              setCurrentScreen={setCurrentScreen}
              showStudentAccountHub={authBundle.showStudentAccountHub}
              setShowStudentAccountHub={authBundle.setShowStudentAccountHub}
              showBrandSplash={showBrandSplash}
              setShowBrandSplash={setShowBrandSplash}
              showIntroWalkthrough={showIntroWalkthrough}
              setShowIntroWalkthrough={setShowIntroWalkthrough}
              showEnrollmentScreen={showEnrollmentScreen}
              setShowEnrollmentScreen={setShowEnrollmentScreen}
              studentDetails={authBundle.studentDetails}
              setStudentDetails={authBundle.setStudentDetails}
              user={authBundle.user}
              setUser={authBundle.setUser}
              subscriptionState={subscriptionState}
              setSubscriptionState={setSubscriptionState}
              addToast={addToast}
              setIsAdmin={authBundle.setIsAdmin}
              setAdminViewMode={authBundle.setAdminViewMode}
              setShowOnboarding={authBundle.setShowOnboarding}
              setShowLoginModal={authBundle.setShowLoginModal}
              setShowPwaInstallModal={app.setShowPwaInstallModal}
              handleSignOut={authBundle.handleSignOut}
              db={db}
              auth={auth}
              triggerCelebrationConfetti={triggerCelebrationConfetti}
              activeDocument={docBundle.activeDocument}
              setActiveDocument={docBundle.setActiveDocument}
              uploadMode={docBundle.uploadMode}
              setUploadMode={docBundle.setUploadMode}
              youtubeUrl={youtubeUrl}
              setYoutubeUrl={setYoutubeUrl}
              isYoutubeLoading={isYoutubeLoading}
              setIsYoutubeLoading={setIsYoutubeLoading}
              isUploading={docBundle.isUploading}
              handleFileUpload={docBundle.handleFileUpload}
              setSessionId={setSessionId}
              setDialogueHistory={setDialogueHistory}
              setCustomBoardContent={docBundle.setCustomBoardContent}
              setTopicBoardsContent={docBundle.setTopicBoardsContent}
              pastSessions={authBundle.pastSessions}
              setPastSessions={authBundle.setPastSessions}
              loadPastSessions={authBundle.loadPastSessions}
              disconnect={classroomBundle.disconnect}
              setUploadedButWaitingWakeup={docBundle.setUploadedButWaitingWakeup}
              setActiveTopicIndex={docBundle.setActiveTopicIndex}
              extractYoutubeId={extractYoutubeId}
              handleLoadPastSession={sessionSyncBundle.handleLoadPastSession}
              onOpenAudioPodcast={(podcast: AudioPodcastData) => {
                setActiveAudioPodcast(podcast);
                setIsAudioPodcastModalOpen(true);
              }}
              classroomSlot={<AppClassroomSlot app={app} />}
              state={classroomBundle.state}
              injectPromptText={classroomBundle.injectPromptText}
              topics={topics}
              activeTopicIndex={docBundle.activeTopicIndex}
              customBoardContent={docBundle.customBoardContent}
              topicBoardsContent={docBundle.topicBoardsContent}
              sessionId={sessionId}
              handleExplainExperimentOnWhiteboard={cherryActionsBundle.handleExplainExperimentOnWhiteboard}
              sessionSnapshots={snapshotBundle.sessionSnapshots}
              handleDiscussConceptWithCherry={cherryActionsBundle.handleDiscussConceptWithCherry}
            />
          </div>

          {/* 5-TAB MOBILE NATIVE BOTTOM TAB BAR */}
          <AppBottomNav
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            showStudentAccountHub={authBundle.showStudentAccountHub}
            setShowStudentAccountHub={authBundle.setShowStudentAccountHub}
            isQuizFullScreenOpen={isQuizFullScreenOpen}
            setIsQuizFullScreenOpen={setIsQuizFullScreenOpen}
            isFullScreenBoard={isFullScreenBoard}
            user={authBundle.user}
            studentName={authBundle.studentDetails.name}
            setShowLoginModal={authBundle.setShowLoginModal}
            setShowOnboarding={authBundle.setShowOnboarding}
            addToast={addToast}
            t={t}
          />
        </div>
      </div>

      {/* Application Modals & Drawers */}
      <AppModalsSlot app={app} />

      {/* Floating Toast Notifications */}
      <AppToastsContainer
        toasts={toasts}
        currentScreen={currentScreen}
        showBrandSplash={showBrandSplash}
        showIntroWalkthrough={showIntroWalkthrough}
        showEnrollmentScreen={showEnrollmentScreen}
      />
    </div>
  );
};
