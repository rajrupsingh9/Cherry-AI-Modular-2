import { useState, useEffect, useCallback } from "react";
import { db, auth } from "../../lib/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { safeSetItem } from "../../utils/safeStorage";
import { BoardSnapshot } from "./accountTypes";

export interface UseStudentDataSyncProps {
  subject?: string;
}

export function useStudentDataSync({ subject }: UseStudentDataSyncProps = {}) {
  const [snapshots, setSnapshots] = useState<BoardSnapshot[]>([]);
  const [loadingSnapshots, setLoadingSnapshots] = useState(false);
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  const currentUser =
    auth.currentUser ||
    (() => {
      const cached = localStorage.getItem("local_active_user");
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (_) {}
      }
      return {
        uid: "local_guest_student",
        displayName: "Student",
        isAnonymous: true,
      };
    })();

  // Retrieve blackboard snapshots from Firebase & local fallback keys
  const fetchSnapshots = useCallback(async () => {
    const uid = currentUser?.uid || "local_guest_student";
    setLoadingSnapshots(true);
    try {
      if (uid === "local_guest_student" || uid.startsWith("local_")) {
        throw new Error("Local guest user bypassed database fetch");
      }
      const snapRef = collection(db, "studentProfiles", uid, "boardSnapshots");
      const q = query(snapRef, orderBy("timestamp", "desc"), limit(40));
      const snapshotDocs = await getDocs(q);
      const parsed = snapshotDocs.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          snapshotId: d.snapshotId || docSnap.id,
          userId: d.userId,
          topicTitle: d.topicTitle || "Classroom Board Snapshot",
          description:
            d.description || "Interactive calculation whiteboard screenshot.",
          imgData: d.imgData,
          subject: d.subject,
          grade: d.grade,
          topicIndex: d.topicIndex,
          timestamp: d.timestamp,
        } as BoardSnapshot;
      });
      setSnapshots(parsed);
      safeSetItem(`snapshots_${uid}`, JSON.stringify(parsed));
    } catch (e) {
      const cachedStr =
        localStorage.getItem(`snapshots_${uid}`) ||
        localStorage.getItem("snapshots_local_guest_student") ||
        localStorage.getItem("snapshots_guest") ||
        localStorage.getItem("all_board_snapshots");
      if (cachedStr) {
        try {
          setSnapshots(JSON.parse(cachedStr));
        } catch (_) {}
      }
    } finally {
      setLoadingSnapshots(false);
    }
  }, [currentUser?.uid]);

  // Real-time snapshots and quiz attempts listeners
  useEffect(() => {
    const uid = currentUser?.uid || "local_guest_student";
    const isGuest = uid === "local_guest_student" || uid.startsWith("local_");
    if (isGuest) {
      // Local Guest fallbacks - load across all storage keys
      const cachedSnapsStr =
        localStorage.getItem(`snapshots_${uid}`) ||
        localStorage.getItem("snapshots_local_guest_student") ||
        localStorage.getItem("snapshots_guest") ||
        localStorage.getItem("all_board_snapshots");
      if (cachedSnapsStr) {
        try {
          setSnapshots(JSON.parse(cachedSnapsStr));
        } catch (_) {}
      }
      const cachedQuizzes = localStorage.getItem(
        `guest_quiz_attempts_${subject}`,
      );
      if (cachedQuizzes) {
        try {
          setQuizAttempts(JSON.parse(cachedQuizzes));
        } catch (_) {}
      }
      return;
    }

    // 1. Real-time board snapshots listener
    const snapRef = collection(db, "studentProfiles", uid, "boardSnapshots");
    const qSnaps = query(snapRef, orderBy("timestamp", "desc"), limit(40));
    const unsubSnaps = onSnapshot(
      qSnaps,
      (snapshotDocs) => {
        const parsed = snapshotDocs.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            snapshotId: d.snapshotId || docSnap.id,
            userId: d.userId,
            topicTitle: d.topicTitle || "Classroom Board Snapshot",
            description:
              d.description || "Interactive calculation whiteboard screenshot.",
            imgData: d.imgData,
            subject: d.subject,
            grade: d.grade,
            topicIndex: d.topicIndex,
            timestamp: d.timestamp,
          } as BoardSnapshot;
        });
        setSnapshots(parsed);
        safeSetItem(`snapshots_${uid}`, JSON.stringify(parsed));
      },
      (error) => {
        console.warn(
          "Realtime board snapshots listener failed, using local cache:",
          error,
        );
        const cachedSnapsStr =
          localStorage.getItem(`snapshots_${uid}`) ||
          localStorage.getItem("snapshots_local_guest_student") ||
          localStorage.getItem("all_board_snapshots");
        if (cachedSnapsStr) {
          try {
            setSnapshots(JSON.parse(cachedSnapsStr));
          } catch (_) {}
        }
      },
    );

    // 2. Real-time quiz attempts listener
    const attemptsRef = collection(db, "studentProfiles", uid, "quizAttempts");
    const qQuizzes = query(
      attemptsRef,
      orderBy("timestamp", "desc"),
      limit(50),
    );
    const unsubQuizzes = onSnapshot(
      qQuizzes,
      (snapshotDocs) => {
        const parsed = snapshotDocs.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            attemptId: docSnap.id,
            timestamp: d.timestamp,
            score: d.score,
            total: d.total,
            accuracy: d.accuracy,
            source: d.source,
            docName: d.docName,
            subject: d.subject,
            grade: d.grade,
            history: d.history || [],
          };
        });
        setQuizAttempts(parsed);
        safeSetItem(`quizAttempts_${uid}`, JSON.stringify(parsed));
      },
      (error) => {
        console.warn("Realtime quiz attempts listener failed:", error);
      },
    );

    return () => {
      unsubSnaps();
      unsubQuizzes();
    };
  }, [currentUser?.uid, subject]);

  const handleDeleteSnapshot = useCallback(async (id: string) => {
    const uid = currentUser?.uid || "local_guest_student";
    if (!confirm("Are you sure you want to delete this board snapshot?"))
      return;
    try {
      // Delete from all local storage caches
      const cleanKey = (k: string) => {
        const cachedStr = localStorage.getItem(k);
        if (cachedStr) {
          try {
            const localSnaps = JSON.parse(cachedStr);
            const filtered = localSnaps.filter(
              (s: any) => s.id !== id && s.snapshotId !== id,
            );
            safeSetItem(k, JSON.stringify(filtered));
          } catch (_) {}
        }
      };

      cleanKey(`snapshots_${uid}`);
      cleanKey("snapshots_local_guest_student");
      cleanKey("all_board_snapshots");

      setSnapshots((prev) =>
        prev.filter((s) => s.id !== id && s.snapshotId !== id),
      );

      if (uid !== "local_guest_student" && !uid.startsWith("local_")) {
        await deleteDoc(doc(db, "studentProfiles", uid, "boardSnapshots", id));
      }
    } catch (e) {
      console.warn(
        "Failed deleting snapshot from Firestore, deleted locally:",
        e,
      );
    }
  }, [currentUser?.uid]);

  return {
    currentUser,
    snapshots,
    setSnapshots,
    loadingSnapshots,
    quizAttempts,
    setQuizAttempts,
    loadingAttempts,
    fetchSnapshots,
    handleDeleteSnapshot,
  };
}
