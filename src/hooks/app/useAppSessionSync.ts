/**
 * useAppSessionSync.ts
 * Handles cloud and local persistence of dialogue logs, whiteboard notes, and session restoration.
 */
import React, { useEffect, useRef, useCallback } from "react";
import { db, auth } from "../../lib/firebase";
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { safeSavePastSessions } from "../../utils/safeStorage";

interface UseAppSessionSyncParams {
  sessionId: string | null;
  setSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  user: any;
  studentDetails: any;
  setStudentDetails: React.Dispatch<React.SetStateAction<any>>;
  dialogueHistory: Array<{ id: string; sender: "user" | "cherry"; text: string }>;
  setDialogueHistory: React.Dispatch<React.SetStateAction<Array<{ id: string; sender: "user" | "cherry"; text: string }>>>;
  customBoardContent: string;
  setCustomBoardContent: React.Dispatch<React.SetStateAction<string>>;
  topicBoardsContent: Record<number, string>;
  setTopicBoardsContent: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  topics: string[];
  pastSessions: any[];
  setPastSessions: React.Dispatch<React.SetStateAction<any[]>>;
  setActiveDocument: React.Dispatch<React.SetStateAction<any>>;
  setCurrentScreen: React.Dispatch<React.SetStateAction<any>>;
  addToast: (message: string, type: "info" | "success" | "error") => void;
}

export function useAppSessionSync({
  sessionId,
  setSessionId,
  user,
  studentDetails,
  setStudentDetails,
  dialogueHistory,
  setDialogueHistory,
  customBoardContent,
  setCustomBoardContent,
  topicBoardsContent,
  setTopicBoardsContent,
  topics,
  pastSessions,
  setPastSessions,
  setActiveDocument,
  setCurrentScreen,
  addToast,
}: UseAppSessionSyncParams) {
  const syncedMessagesRef = useRef<Set<string>>(new Set());

  // 1. Persist Dialogue History messages to Firestore subcollection
  useEffect(() => {
    const currentUser = auth.currentUser || user;
    if (!sessionId || !currentUser) return;

    if (currentUser.uid === "local_guest_student" || currentUser.uid.startsWith("local_")) return;

    dialogueHistory.forEach((msg) => {
      const cacheKey = `${msg.id}_${msg.text}`;
      if (!syncedMessagesRef.current.has(cacheKey)) {
        syncedMessagesRef.current.add(cacheKey);

        const msgRef = doc(db, "classSessions", sessionId, "dialogueMessages", msg.id);
        setDoc(msgRef, {
          messageId: msg.id,
          sessionId: sessionId,
          sender: msg.sender,
          text: msg.text,
          timestamp: serverTimestamp(),
        }).catch((err) => {
          console.warn("Dialogue message sync failure:", err);
        });
      }
    });
  }, [dialogueHistory, sessionId, user]);

  // 2. Whiteboard drawings debounced save to cloud and local cache
  useEffect(() => {
    const currentUser = auth.currentUser || user;
    if (!sessionId || !currentUser) return;

    const timeout = setTimeout(async () => {
      const sanitizedTopicBoards: Record<string, string> = {};
      if (topicBoardsContent) {
        Object.entries(topicBoardsContent).forEach(([k, v]) => {
          sanitizedTopicBoards[String(k)] = v as string;
        });
      }

      setPastSessions((prevSessions) => {
        const updated = prevSessions.map((sess) => {
          if (sess.sessionId === sessionId) {
            return {
              ...sess,
              customBoardContent: customBoardContent,
              topicBoardsContent: sanitizedTopicBoards,
              topics: topics,
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
        const sessionRef = doc(db, "classSessions", sessionId);
        try {
          await updateDoc(sessionRef, {
            customBoardContent: customBoardContent,
            topicBoardsContent: sanitizedTopicBoards,
            topics: topics,
            updatedAt: serverTimestamp(),
          });
        } catch (dbErr) {
          console.warn("Cloud blackboard sync failed:", dbErr);
        }
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [customBoardContent, topicBoardsContent, topics, studentDetails.subject, sessionId, user, setPastSessions]);

  // 3. Restore a previous session from local or cloud archive
  const handleLoadPastSession = useCallback(
    async (sess: any) => {
      try {
        setSessionId(sess.sessionId);

        setStudentDetails((prev: any) => ({
          ...prev,
          grade: sess.grade || prev.grade,
          subject: sess.subject || prev.subject,
        }));
        setCustomBoardContent(sess.customBoardContent || "");

        if (sess.topicBoardsContent) {
          const restoredBoards: Record<number, string> = {};
          Object.entries(sess.topicBoardsContent).forEach(([k, v]) => {
            restoredBoards[Number(k)] = v as string;
          });
          setTopicBoardsContent(restoredBoards);
        } else {
          setTopicBoardsContent({});
        }

        try {
          const messagesRef = collection(db, "classSessions", sess.sessionId, "dialogueMessages");
          const q = query(messagesRef, orderBy("timestamp", "asc"));
          const querySnap = await getDocs(q);
          const dialogueLogs = querySnap.docs.map((docSnap) => {
            const item = docSnap.data();
            return {
              id: item.messageId,
              sender: item.sender as "user" | "cherry",
              text: item.text,
            };
          });
          setDialogueHistory(dialogueLogs);
        } catch (_) {
          // Non-blocking fallback for guests
        }

        if (sess.activeDocumentName) {
          addToast(`Loading syllabus file: "${sess.activeDocumentName}" from cloud session...`, "info");
          fetch("/api/active-document")
            .then((res) => {
              if (!res.ok) throw new Error("Network error");
              return res.text();
            })
            .then((text) => {
              if (text.trim().startsWith("{")) {
                return JSON.parse(text);
              }
              throw new Error("Invalid json format");
            })
            .then((data) => {
              if (data && data.activeDocument && data.activeDocument.filename === sess.activeDocumentName) {
                setActiveDocument(data.activeDocument);
              } else {
                setActiveDocument({
                  filename: sess.activeDocumentName,
                  mimeType: "text/markdown",
                  markdown: `# ${sess.subject} Study Session\nWelcome back to your saved classroom board! Here you can resume explaining equations or diagnostics with Cherry Ma'am.\n`,
                });
              }
            })
            .catch(() => {
              setActiveDocument({
                filename: sess.activeDocumentName,
                mimeType: "text/markdown",
                markdown: `# ${sess.subject} Study Session\nWelcome back to your saved classroom board! Here you can resume explaining equations or diagnostics with Cherry Ma'am.\n`,
              });
            });
        } else {
          setActiveDocument(null);
        }

        setCurrentScreen("classroom");
        addToast("Restored cloud session successfully! ☁️🖊️", "success");
      } catch (error: any) {
        addToast(`Could not restore cloud session: ${error.message}`, "error");
      }
    },
    [
      setSessionId,
      setStudentDetails,
      setCustomBoardContent,
      setTopicBoardsContent,
      setDialogueHistory,
      setActiveDocument,
      setCurrentScreen,
      addToast,
    ]
  );

  return {
    handleLoadPastSession,
  };
}
