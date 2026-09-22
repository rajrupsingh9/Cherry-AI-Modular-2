/**
 * AppModalsSlot.tsx
 * Encapsulated AppModalsContainer slot renderer passing controller bindings.
 */
import React from "react";
import { AppModalsContainer } from "../modals/AppModalsContainer";
import { AppControllerType } from "../../hooks/app/useAppController";
import { loadSubscriptionState } from "../../utils/subscriptionStore";

interface AppModalsSlotProps {
  app: AppControllerType;
}

export const AppModalsSlot: React.FC<AppModalsSlotProps> = ({ app }) => {
  const {
    showSubscriptionModal,
    setShowSubscriptionModal,
    setSubscriptionState,
    showPwaInstallModal,
    setShowPwaInstallModal,
    isAudioPodcastModalOpen,
    setIsAudioPodcastModalOpen,
    activeAudioPodcast,
    showPostLessonModal,
    setShowPostLessonModal,
    postLessonSession,
    showPostLoginMicModal,
    showBrandSplash,
    showIntroWalkthrough,
    showEnrollmentScreen,
    isQuizFullScreenOpen,
    setIsQuizFullScreenOpen,
    showTips,
    setShowTips,
    topics,
    sessionId,
    addToast,
    setCurrentScreen,
    authBundle,
    docBundle,
    snapshotBundle,
    classroomBundle,
    eventListenersBundle,
    cherryActionsBundle,
  } = app;

  return (
    <AppModalsContainer
      isLearnerProfileModalOpen={authBundle.isLearnerProfileModalOpen}
      onCloseLearnerProfileModal={() => {
        authBundle.setIsLearnerProfileModalOpen(false);
        setSubscriptionState(loadSubscriptionState());
      }}
      showSubscriptionModal={showSubscriptionModal}
      onCloseSubscriptionModal={() => {
        setShowSubscriptionModal(false);
        setSubscriptionState(loadSubscriptionState());
      }}
      studentName={authBundle.studentDetails.name || (authBundle.user?.displayName || "Student")}
      showPwaInstallModal={showPwaInstallModal}
      onClosePwaInstallModal={() => {
        setShowPwaInstallModal(false);
        try {
          sessionStorage.setItem("pwa_install_dismissed_session", "true");
        } catch (_) {}
      }}
      onPwaInstalledSuccess={() => {
        addToast("🎉 Cherry AI Web App installed successfully to your Home Screen!", "success");
      }}
      isAudioPodcastModalOpen={isAudioPodcastModalOpen}
      onCloseAudioPodcastModal={() => setIsAudioPodcastModalOpen(false)}
      activeAudioPodcast={activeAudioPodcast}
      showPostLessonModal={showPostLessonModal}
      onClosePostLessonModal={() => setShowPostLessonModal(false)}
      postLessonSession={postLessonSession}
      mediumOfLearning={authBundle.studentDetails.mediumOfLearning}
      onGoToRevisionHub={() => {
        setCurrentScreen("syllabus");
        authBundle.setShowStudentAccountHub(true);
      }}
      showPostLoginMicModal={
        showPostLoginMicModal &&
        !showBrandSplash &&
        !showIntroWalkthrough &&
        !showEnrollmentScreen &&
        !authBundle.isAdmin
      }
      onAllowPostLoginMic={eventListenersBundle.handleAllowPostLoginMic}
      onDismissPostLoginMic={eventListenersBundle.handleDismissPostLoginMic}
      addToast={addToast}
      onSignOut={authBundle.handleSignOut}
      isQuizFullScreenOpen={isQuizFullScreenOpen}
      onCloseQuizFullScreen={() => setIsQuizFullScreenOpen(false)}
      studentSubject={authBundle.studentDetails.subject}
      studentGrade={authBundle.studentDetails.grade}
      state={classroomBundle.state}
      onInjectPrompt={classroomBundle.injectPromptText}
      topics={topics}
      activeTopicIndex={docBundle.activeTopicIndex}
      customBoardContent={docBundle.customBoardContent}
      topicBoardsContent={docBundle.topicBoardsContent}
      sessionId={sessionId}
      showTips={showTips}
      onCloseTips={() => setShowTips(false)}
      showStudentAccountHub={authBundle.showStudentAccountHub}
      onCloseStudentAccountHub={() => authBundle.setShowStudentAccountHub(false)}
      studentBoard={authBundle.studentDetails.board}
      totalSessionsCount={authBundle.pastSessions.length}
      pastSessions={authBundle.pastSessions}
      sessionSnapshots={snapshotBundle.sessionSnapshots}
      activeDocument={docBundle.activeDocument}
      onDiscussWithCherry={cherryActionsBundle.handleDiscussConceptWithCherry}
      onEnterClassroomFromHub={() => {
        setCurrentScreen("classroom");
        authBundle.setShowStudentAccountHub(false);
      }}
      onRefreshProfile={authBundle.handleRefreshProfile}
      showOnboarding={authBundle.showOnboarding}
      onOnboardingSubmit={authBundle.handleOnboardingSubmit}
      showLoginModal={authBundle.showLoginModal}
      onCloseLoginModal={() => authBundle.setShowLoginModal(false)}
      onGoogleSignIn={authBundle.handleGoogleSignIn}
      onStudentNameChange={(name) => authBundle.setStudentDetails((prev: any) => ({ ...prev, name }))}
      onStudentGradeChange={(grade) => authBundle.setStudentDetails((prev: any) => ({ ...prev, grade }))}
      onGuestSubmit={authBundle.handleGuestSubmit}
      onMobileLoginSuccess={authBundle.handleMobileLoginSuccess}
    />
  );
};
