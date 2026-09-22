import React, { useState, useCallback } from "react";
import { auth, db, OperationType, handleFirestoreError } from "../../lib/firebase";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";
import { safeSavePastSessions } from "../../utils/safeStorage";

interface UsePastSessionsSyncProps {
  addToast: (message: string, type: "info" | "success" | "error") => void;
}

export function usePastSessionsSync({ addToast }: UsePastSessionsSyncProps) {
  const [pastSessions, setPastSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Load Past Sessions from Firestore or Local Cache
  const loadPastSessions = useCallback(
    async (uid: string) => {
      setSessionsLoading(true);
      if (!auth.currentUser || uid === "local_guest_student" || uid.startsWith("local_")) {
        const cached = localStorage.getItem(`pastSessions_${uid}`);
        if (cached) {
          try {
            const sessions = JSON.parse(cached);
            setPastSessions(sessions);
          } catch (_) {}
        } else {
          setPastSessions([]);
        }
        setSessionsLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "classSessions"),
          where("userId", "==", uid),
          orderBy("updatedAt", "desc")
        );
        const snapshot = await getDocs(q);
        const sessions = snapshot.docs.map((d) => d.data());
        setPastSessions(sessions);
        safeSavePastSessions(uid, sessions);
      } catch (error: any) {
        const isPermissionDenied =
          error.code === "permission-denied" ||
          (error.message &&
            (error.message.includes("permission-denied") ||
              error.message.includes("permission") ||
              error.message.includes("Permissions")));

        if (isPermissionDenied) {
          handleFirestoreError(error, OperationType.LIST, "classSessions");
        }

        console.error("Error loading past sessions, falling back to local storage:", error);
        const cached = localStorage.getItem(`pastSessions_${uid}`);
        if (cached) {
          try {
            const sessions = JSON.parse(cached);
            setPastSessions(sessions);
            addToast("Loaded study activities from local cache! 🏛️📱", "info");
          } catch (_) {}
        }
      } finally {
        setSessionsLoading(false);
      }
    },
    [addToast]
  );

  // Delete Past Session Handler
  const handleDeletePastSession = async (sessId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, "classSessions", sessId));
      addToast("Cloud session deleted successfully! 🗑️", "success");
      loadPastSessions(currentUser.uid);
    } catch (dbErr) {
      handleFirestoreError(dbErr, OperationType.DELETE, `classSessions/${sessId}`);
    }
  };

  return {
    pastSessions,
    setPastSessions,
    sessionsLoading,
    loadPastSessions,
    handleDeletePastSession,
  };
}
