/**
 * useAppController.ts
 * Central frontend application state manager coordinating auth, document sync, classroom engine, and layout state.
 */
import { useState, useCallback, useMemo, useEffect } from "react";
import { AudioPodcastData } from "../../types";
import { useAppToasts } from "./useAppToasts";
import { useAppTheme } from "./useAppTheme";
import { useStudentAuth } from "../useStudentAuth";
import { useDocumentSync } from "../useDocumentSync";
import { useSessionSnapshots } from "../useSessionSnapshots";
import { useClassroomController } from "../useClassroomController";
import { useAppEventListeners } from "./useAppEventListeners";
import { useAppSessionSync } from "./useAppSessionSync";
import { useAppCherryActions } from "./useAppCherryActions";
import { parseSyllabusTopics } from "../../utils/topicParser";
import { getTranslations } from "../../utils/i18n";
import { loadSubscriptionState, SubscriptionState } from "../../utils/subscriptionStore";
import { auth } from "../../lib/firebase";

export function useAppController() {
  // 1. Floating Toasts
  const { toasts, addToast, removeToast } = useAppToasts();

  // 2. Blackboard Theme
  const { theme, setTheme, handleThemeChange, activeColors } = useAppTheme({ addToast });

  // 3. Screen & Workspace Navigation States
  const [showTips, setShowTips] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"board" | "document">("board");
  const [isFullScreenBoard, setIsFullScreenBoard] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<
    "home" | "syllabus" | "classroom" | "quiz" | "lab" | "profile" | "admin"
  >("home");
  const [showBrandSplash, setShowBrandSplash] = useState(true);
  const [showIntroWalkthrough, setShowIntroWalkthrough] = useState(false);
  const [showEnrollmentScreen, setShowEnrollmentScreen] = useState(false);
  const [showPostLoginMicModal, setShowPostLoginMicModal] = useState(false);

  // 4. Subscription & Pro Access
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>(loadSubscriptionState());
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // 5. Dialogue History & Subtitle components
  const [dialogueHistory, setDialogueHistory] = useState<
    Array<{ id: string; sender: "user" | "cherry"; text: string }>
  >([]);

  // 6. Hook: Student Auth & Profile Management
  const authBundle = useStudentAuth({
    addToast,
    setCurrentScreen,
    setShowBrandSplash,
    setShowIntroWalkthrough,
    setShowEnrollmentScreen,
    showEnrollmentScreen,
    subscriptionState,
    setSubscriptionState,
    onClearSessionState: () => {
      setSessionId(null);
      setDialogueHistory([]);
    },
  });

  const t = useMemo(
    () => getTranslations(authBundle.studentDetails.mediumOfLearning),
    [authBundle.studentDetails.mediumOfLearning]
  );

  // 7. Hook: Document Sync & Upload Management
  const docBundle = useDocumentSync({
    user: authBundle.user,
    studentDetails: authBundle.studentDetails,
    setStudentDetails: authBundle.setStudentDetails,
    sessionId,
    setSessionId,
    disconnect: () => classroomBundle.disconnect(),
    setDialogueHistory: (history: any[]) => setDialogueHistory(history),
    setCurrentScreen,
    loadPastSessions: authBundle.loadPastSessions,
    setPastSessions: authBundle.setPastSessions,
    addToast,
    setUser: authBundle.setUser,
  });

  // 8. YouTube Course Explanation states
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isYoutubeLoading, setIsYoutubeLoading] = useState(false);
  const [isYtPlayerExpanded, setIsYtPlayerExpanded] = useState(true);
  const [showMobileYtPlayer, setShowMobileYtPlayer] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"mic" | "topics" | "doubt" | "quiz">("quiz");
  const [isQuizFullScreenOpen, setIsQuizFullScreenOpen] = useState(false);
  const [showPwaInstallModal, setShowPwaInstallModal] = useState(false);

  // 9. Podcast & Post Lesson Session States
  const [activeAudioPodcast, setActiveAudioPodcast] = useState<AudioPodcastData | null>(null);
  const [isAudioPodcastModalOpen, setIsAudioPodcastModalOpen] = useState(false);
  const [postLessonSession, setPostLessonSession] = useState<any | null>(null);
  const [showPostLessonModal, setShowPostLessonModal] = useState(false);

  // 10. Topics parsing
  const topics = useMemo(() => {
    return parseSyllabusTopics(docBundle.activeDocument?.markdown);
  }, [docBundle.activeDocument?.markdown]);

  // 11. Snapshots Hook
  const snapshotBundle = useSessionSnapshots({
    auth,
    user: authBundle.user,
    studentDetails: authBundle.studentDetails,
    theme,
    topics,
    activeTopicIndex: docBundle.activeTopicIndex,
    customBoardContent: docBundle.customBoardContent,
    sessionId,
    currentScreen,
    showBrandSplash,
    showIntroWalkthrough,
    showEnrollmentScreen,
    addToast,
  });

  // 12. Classroom Controller Hook
  const classroomBundle = useClassroomController({
    sessionId,
    setSessionId,
    user: authBundle.user,
    studentDetails: authBundle.studentDetails,
    setStudentDetails: authBundle.setStudentDetails,
    customBoardContent: docBundle.customBoardContent,
    setCustomBoardContent: docBundle.setCustomBoardContent,
    topicBoardsContent: docBundle.topicBoardsContent,
    setTopicBoardsContent: docBundle.setTopicBoardsContent,
    activeTopicIndex: docBundle.activeTopicIndex,
    setActiveTopicIndex: docBundle.setActiveTopicIndex,
    topics,
    activeDocument: docBundle.activeDocument,
    setActiveDocument: docBundle.setActiveDocument,
    currentScreen,
    setCurrentScreen,
    showBrandSplash,
    showIntroWalkthrough,
    showEnrollmentScreen,
    setUploadedButWaitingWakeup: docBundle.setUploadedButWaitingWakeup,
    setPostLessonSession,
    setShowPostLessonModal,
    setPastSessions: authBundle.setPastSessions,
    addToast,
    handleThemeChange,
    autoCaptureSnapshot: snapshotBundle.autoCaptureSnapshot,
  });

  // Automatically exit the uploaded waiting screen as soon as state is active
  useEffect(() => {
    if (classroomBundle.state !== "disconnected") {
      docBundle.setUploadedButWaitingWakeup(false);
    }
  }, [classroomBundle.state, docBundle.setUploadedButWaitingWakeup]);

  // 13. Event Listeners Hook
  const eventListenersBundle = useAppEventListeners({
    addToast,
    subscriptionState,
    setSubscriptionState,
    setShowEnrollmentScreen,
    setShowStudentAccountHub: authBundle.setShowStudentAccountHub,
    setActiveAudioPodcast,
    setIsAudioPodcastModalOpen,
    setShowPwaInstallModal,
    showPostLoginMicModal,
    setShowPostLoginMicModal,
    user: authBundle.user,
    isAdmin: authBundle.isAdmin,
    showBrandSplash,
    showIntroWalkthrough,
    showEnrollmentScreen,
    currentScreen,
    state: classroomBundle.state,
    togglePauseTeaching: classroomBundle.togglePauseTeaching,
  });

  // 14. Session Persistence & Restoration Hook
  const sessionSyncBundle = useAppSessionSync({
    sessionId,
    setSessionId,
    user: authBundle.user,
    studentDetails: authBundle.studentDetails,
    setStudentDetails: authBundle.setStudentDetails,
    dialogueHistory,
    setDialogueHistory,
    customBoardContent: docBundle.customBoardContent,
    setCustomBoardContent: docBundle.setCustomBoardContent,
    topicBoardsContent: docBundle.topicBoardsContent,
    setTopicBoardsContent: docBundle.setTopicBoardsContent,
    topics,
    pastSessions: authBundle.pastSessions,
    setPastSessions: authBundle.setPastSessions,
    setActiveDocument: docBundle.setActiveDocument,
    setCurrentScreen,
    addToast,
  });

  // 15. Cherry Actions Hook
  const cherryActionsBundle = useAppCherryActions({
    state: classroomBundle.state,
    sessionId,
    setSessionId,
    studentDetails: authBundle.studentDetails,
    activeDocument: docBundle.activeDocument,
    setActiveDocument: docBundle.setActiveDocument,
    customBoardContent: docBundle.customBoardContent,
    setCustomBoardContent: docBundle.setCustomBoardContent,
    topics,
    activeTopicIndex: docBundle.activeTopicIndex,
    setActiveWorkspaceTab,
    setIsFullScreenBoard,
    setShowStudentAccountHub: authBundle.setShowStudentAccountHub,
    setCurrentScreen,
    setActiveAudioPodcast,
    setIsAudioPodcastModalOpen,
    injectPromptText: classroomBundle.injectPromptText,
    connect: classroomBundle.connect,
    addToast,
  });

  return {
    theme,
    setTheme,
    handleThemeChange,
    activeColors,
    toasts,
    addToast,
    removeToast,
    showTips,
    setShowTips,
    showCaptions,
    setShowCaptions,
    activeWorkspaceTab,
    setActiveWorkspaceTab,
    isFullScreenBoard,
    setIsFullScreenBoard,
    currentScreen,
    setCurrentScreen,
    showBrandSplash,
    setShowBrandSplash,
    showIntroWalkthrough,
    setShowIntroWalkthrough,
    showEnrollmentScreen,
    setShowEnrollmentScreen,
    showPostLoginMicModal,
    setShowPostLoginMicModal,
    subscriptionState,
    setSubscriptionState,
    showSubscriptionModal,
    setShowSubscriptionModal,
    sessionId,
    setSessionId,
    dialogueHistory,
    setDialogueHistory,
    t,
    topics,
    youtubeUrl,
    setYoutubeUrl,
    isYoutubeLoading,
    setIsYoutubeLoading,
    isYtPlayerExpanded,
    setIsYtPlayerExpanded,
    showMobileYtPlayer,
    setShowMobileYtPlayer,
    activeMobileTab,
    setActiveMobileTab,
    isQuizFullScreenOpen,
    setIsQuizFullScreenOpen,
    showPwaInstallModal,
    setShowPwaInstallModal,
    activeAudioPodcast,
    setActiveAudioPodcast,
    isAudioPodcastModalOpen,
    setIsAudioPodcastModalOpen,
    postLessonSession,
    setPostLessonSession,
    showPostLessonModal,
    setShowPostLessonModal,
    // Bundles
    authBundle,
    docBundle,
    snapshotBundle,
    classroomBundle,
    eventListenersBundle,
    sessionSyncBundle,
    cherryActionsBundle,
  };
}

export type AppControllerType = ReturnType<typeof useAppController>;
