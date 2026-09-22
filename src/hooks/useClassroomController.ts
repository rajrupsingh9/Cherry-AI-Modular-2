import { useRef, useEffect, type Dispatch, type SetStateAction } from "react";
import { ThemeType } from "../types";
import { useLiveSession } from "./useLiveSession";
import { smartMergeWhiteboardNotes } from "../utils/boardFilter";
import { saveActiveLearningContext } from "../utils/activeLearningStore";
import { triggerCelebrationConfetti } from "../utils/confetti";
import { isBoardContentComplete } from "../utils/blackboardSnapshotEngine";
import { buildAutoLessonPromptAndToast } from "../utils/cherryAutoPrompts";
import { useClassroomTopicNavigation } from "./classroom/useClassroomTopicNavigation";
import { useClassroomSessionEnd } from "./classroom/useClassroomSessionEnd";
import { useClassroomPrompts } from "./classroom/useClassroomPrompts";
import { UseClassroomControllerProps } from "./classroom/types";

export type { UseClassroomControllerProps };

export function useClassroomController({
  sessionId,
  setSessionId,
  user,
  studentDetails,
  customBoardContent,
  setCustomBoardContent,
  topicBoardsContent,
  setTopicBoardsContent,
  activeTopicIndex,
  setActiveTopicIndex,
  topics,
  activeDocument,
  currentScreen,
  setCurrentScreen,
  showBrandSplash,
  showIntroWalkthrough,
  showEnrollmentScreen,
  setUploadedButWaitingWakeup,
  setPostLessonSession,
  setShowPostLessonModal,
  setPastSessions,
  addToast,
  handleThemeChange,
  autoCaptureSnapshot,
}: UseClassroomControllerProps) {
  const onNextTopicRef = useRef<() => void>(undefined);
  const onClassCompleteRef = useRef<() => void>(undefined);

  // 1. Hook Live Session
  const {
    state,
    isPaused,
    pauseTeaching,
    resumeTeaching,
    togglePauseTeaching,
    userVolume,
    cherryVolume,
    userTranscript,
    cherryTranscript,
    connect,
    disconnect,
    injectPromptText,
    speechSpeed,
    setSpeechSpeed,
    teachingPhase,
    micStream,
    playbackStream,
  } = useLiveSession({
    onThemeChange: handleThemeChange,
    onToast: addToast,
    onNextTopic: () => onNextTopicRef.current?.(),
    onClassComplete: () => {
      onClassCompleteRef.current?.();
      triggerCelebrationConfetti();
    },
    onTeachingPhaseChange: (phase) => {
      const phaseLabels: Record<string, string> = {
        intro: "Intro (Prichey) 🎒",
        concept: "Concept (Chalk Notes) 🖊️",
        example: "Deep Dive (Explanations) 🔍",
        doubt: "Doubts Solving (Sawal-Jawab) ❓",
        transition: "Transition Sequence 🚀",
        complete: "Class Graduation 🎉🎓",
      };
      if (phase.toLowerCase() === "complete") {
        triggerCelebrationConfetti();
      }
      addToast(`Cherry Ma'am moved to: ${phaseLabels[phase] || phase}`, "info");

      saveActiveLearningContext({
        sourceMode: activeDocument
          ? activeDocument.mimeType === "video/youtube"
            ? "explainer_youtube"
            : "explainer_doc"
          : "live_blackboard",
        title: activeDocument?.filename || `Classroom: ${studentDetails.subject || "Lesson"}`,
        subject: studentDetails.subject,
        grade: studentDetails.grade,
        board: studentDetails.board,
        mediumOfLearning: studentDetails.mediumOfLearning,
        blackboardContent: customBoardContent,
        documentMarkdown: activeDocument?.markdown || "",
        topics,
        sessionId: sessionId || undefined,
      });
    },
    onUpdateWhiteboard: (content, append) => {
      setCustomBoardContent((prev) => {
        const merged = smartMergeWhiteboardNotes(prev, content, append);
        setTopicBoardsContent((tb) => ({
          ...tb,
          [activeTopicIndex]: merged,
        }));

        saveActiveLearningContext({
          sourceMode: activeDocument
            ? activeDocument.mimeType === "video/youtube"
              ? "explainer_youtube"
              : "explainer_doc"
            : "live_blackboard",
          title: activeDocument?.filename || `Classroom: ${studentDetails.subject || "Lesson"}`,
          subject: studentDetails.subject,
          grade: studentDetails.grade,
          board: studentDetails.board,
          mediumOfLearning: studentDetails.mediumOfLearning,
          blackboardContent: merged,
          documentMarkdown: activeDocument?.markdown || "",
          topics,
          sessionId: sessionId || undefined,
        });

        return merged;
      });
    },
    studentName: studentDetails.name,
    grade: studentDetails.grade,
    board: studentDetails.board,
    mediumOfLearning: studentDetails.mediumOfLearning,
    subject: studentDetails.subject,
    activeTopicIndex,
    sessionId,
  });

  // 2. Classroom Topic Navigation Sub-Hook
  const { handleNextTopic, handlePrevTopic, handleSyncBoardContent } = useClassroomTopicNavigation({
    topics,
    activeTopicIndex,
    setActiveTopicIndex,
    customBoardContent,
    setCustomBoardContent,
    topicBoardsContent,
    setTopicBoardsContent,
    teachingPhase,
    activeDocument,
    studentDetails,
    currentScreen,
    showBrandSplash,
    showIntroWalkthrough,
    showEnrollmentScreen,
    state,
    togglePauseTeaching,
    addToast,
    autoCaptureSnapshot,
  });

  useEffect(() => {
    onNextTopicRef.current = handleNextTopic;
  }, [handleNextTopic]);

  // 3. Dialogue & Interactive Prompts Sub-Hook
  const {
    dialogueHistory,
    setDialogueHistory,
    typedInput,
    setTypedInput,
    handleSendPromptText,
    studentAskedForWritingOrDrawing,
    latestSpeechText,
    handleSelectPrompt,
    getSubTitleText,
  } = useClassroomPrompts({
    state,
    teachingPhase,
    userVolume,
    userTranscript,
    cherryTranscript,
    injectPromptText,
    addToast,
  });

  // 4. Session Archive & Lifecycle Sub-Hook
  const { handleEndAndArchiveSession, handlePowerToggle, handleClassComplete } = useClassroomSessionEnd({
    sessionId,
    setSessionId,
    user,
    state,
    connect,
    disconnect,
    customBoardContent,
    setCustomBoardContent,
    topicBoardsContent,
    setTopicBoardsContent,
    topics,
    activeTopicIndex,
    studentDetails,
    currentScreen,
    setCurrentScreen,
    setPastSessions,
    setPostLessonSession,
    setShowPostLessonModal,
    setDialogueHistory,
    setUploadedButWaitingWakeup,
    addToast,
  });

  useEffect(() => {
    onClassCompleteRef.current = handleClassComplete;
  }, [handleClassComplete]);

  // Automatic snapshot trigger on topic conclusion/transition
  useEffect(() => {
    if (customBoardContent && isBoardContentComplete(customBoardContent) && teachingPhase) {
      if (["transition", "graduation", "completed", "quiz"].includes(teachingPhase)) {
        autoCaptureSnapshot(activeTopicIndex, customBoardContent);
      }
    }
  }, [teachingPhase, activeTopicIndex, customBoardContent, autoCaptureSnapshot]);

  // Automatically start teaching continuous document when class connects
  const lastStateRef = useRef<string>("disconnected");
  useEffect(() => {
    if (state === "idle" && lastStateRef.current === "connecting" && activeDocument) {
      const { prompt, toastMessage } = buildAutoLessonPromptAndToast(activeDocument, studentDetails);
      injectPromptText(prompt);
      addToast(toastMessage, "success");
    }
    lastStateRef.current = state;
  }, [state, activeDocument, injectPromptText, addToast, studentDetails]);

  // Sync state to automatically exit uploaded waiting screen when state is active
  useEffect(() => {
    if (state !== "disconnected") {
      setUploadedButWaitingWakeup(false);
    }
  }, [state, setUploadedButWaitingWakeup]);

  return {
    // Live Session State & Audio Streams
    state,
    isPaused,
    pauseTeaching,
    resumeTeaching,
    togglePauseTeaching,
    userVolume,
    cherryVolume,
    userTranscript,
    cherryTranscript,
    connect,
    disconnect,
    injectPromptText,
    speechSpeed,
    setSpeechSpeed,
    teachingPhase,
    micStream,
    playbackStream,

    // Dialogue & Typing
    dialogueHistory,
    setDialogueHistory,
    typedInput,
    setTypedInput,
    handleSendPromptText,
    latestSpeechText,
    studentAskedForWritingOrDrawing,

    // Navigation & Board Controls
    handleNextTopic,
    handlePrevTopic,
    handleSyncBoardContent,
    handlePowerToggle,
    handleClassComplete,
    handleEndAndArchiveSession,
    handleSelectPrompt,
    getSubTitleText,
  };
}
