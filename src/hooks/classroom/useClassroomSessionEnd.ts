import { useCallback, useEffect, type Dispatch, type SetStateAction } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { safeSavePastSessions } from "../../utils/safeStorage";
import { triggerCelebrationConfetti } from "../../utils/confetti";

interface UseClassroomSessionEndProps {
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  user: any;
  state: string;
  connect: () => void;
  disconnect: () => void;
  customBoardContent: string;
  setCustomBoardContent: Dispatch<SetStateAction<string>>;
  topicBoardsContent: Record<number, string>;
  setTopicBoardsContent: Dispatch<SetStateAction<Record<number, string>>>;
  topics: string[];
  activeTopicIndex: number;
  studentDetails: { subject?: string; grade?: string; [key: string]: any };
  currentScreen: any;
  setCurrentScreen: any;
  setPastSessions: Dispatch<SetStateAction<any[]>>;
  setPostLessonSession: (data: any) => void;
  setShowPostLessonModal: (show: boolean) => void;
  setDialogueHistory: Dispatch<SetStateAction<Array<{ id: string; sender: "user" | "cherry"; text: string }>>>;
  setUploadedButWaitingWakeup: (val: boolean) => void;
  addToast: (message: string, type: "info" | "success" | "error") => void;
}

export function useClassroomSessionEnd({
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
}: UseClassroomSessionEndProps) {
  // Gracefully end, compile, and archive the active session
  const handleEndAndArchiveSession = useCallback(
    async (targetSessionId: string | null = sessionId) => {
      if (!targetSessionId) return;

      const currentUser = auth.currentUser || user;
      if (!currentUser) return;

      if (state !== "disconnected") {
        disconnect();
      }

      const sanitizedTopicBoards: Record<string, string> = {};
      if (topicBoardsContent) {
        Object.entries(topicBoardsContent).forEach(([k, v]) => {
          sanitizedTopicBoards[String(k)] = v as string;
        });
      }

      setPastSessions((prevSessions) => {
        const updated = prevSessions.map((sess) => {
          if (sess.sessionId === targetSessionId) {
            return {
              ...sess,
              customBoardContent,
              topicBoardsContent: sanitizedTopicBoards,
              topics,
              subject: studentDetails.subject || sess.subject,
              updatedAt: new Date().toISOString(),
            };
          }
          return sess;
        });
        safeSavePastSessions(currentUser.uid, updated);
        return updated;
      });

      if (currentUser.uid !== "local_guest_student" && !currentUser.uid.startsWith("local_")) {
        const sessionRef = doc(db, "classSessions", targetSessionId);
        try {
          await updateDoc(sessionRef, {
            customBoardContent,
            topicBoardsContent: sanitizedTopicBoards,
            topics,
            updatedAt: serverTimestamp(),
          });
        } catch (dbErr) {
          console.warn("Immediate cloud blackboard sync failed on archiving:", dbErr);
        }
      }

      if (customBoardContent && customBoardContent.trim().length > 15) {
        setPostLessonSession({
          topic: (topics && topics[activeTopicIndex]) || studentDetails.subject || "Classroom Lecture",
          subject: studentDetails.subject || "Science",
          grade: studentDetails.grade || "Class 10-12",
          customBoardContent,
          sessionId: targetSessionId,
        });
        setShowPostLessonModal(true);
      }

      setSessionId(null);
      setDialogueHistory([]);
      setCustomBoardContent("");
      setTopicBoardsContent({});

      addToast("Lesson notes automatically compiled and saved to 'Archived Classroom Lecture Books'! 📁🎓", "success");
      setCurrentScreen("syllabus");
    },
    [
      sessionId,
      user,
      state,
      disconnect,
      customBoardContent,
      topicBoardsContent,
      topics,
      activeTopicIndex,
      studentDetails,
      setPastSessions,
      setPostLessonSession,
      setShowPostLessonModal,
      setSessionId,
      setDialogueHistory,
      setCustomBoardContent,
      setTopicBoardsContent,
      addToast,
      setCurrentScreen,
    ]
  );

  // Disconnect & Auto-Archive session if student navigates away from the Classroom screen
  useEffect(() => {
    if (currentScreen !== "classroom" && sessionId) {
      handleEndAndArchiveSession(sessionId);
    } else if (currentScreen !== "classroom" && state !== "disconnected") {
      disconnect();
    }
  }, [currentScreen, sessionId, state, disconnect, handleEndAndArchiveSession]);

  const handlePowerToggle = () => {
    if (state === "disconnected") {
      setUploadedButWaitingWakeup(false);
      if (!sessionId) {
        const fallbackSessionId = "session_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        setSessionId(fallbackSessionId);
      }
      connect();
    } else {
      if (sessionId) {
        handleEndAndArchiveSession(sessionId);
      } else {
        disconnect();
        addToast("Cherry Ma'am is heading to the staff room. Talk later! 📚☕", "info");
      }
    }
  };

  const handleClassComplete = useCallback(() => {
    triggerCelebrationConfetti();
    if (sessionId) {
      handleEndAndArchiveSession(sessionId);
    } else {
      disconnect();
    }
    addToast("Congratulations! Class is complete. Cherry is heading to the staff room! 🎓🎉☕", "success");
  }, [sessionId, handleEndAndArchiveSession, disconnect, addToast]);

  return {
    handleEndAndArchiveSession,
    handlePowerToggle,
    handleClassComplete,
  };
}
