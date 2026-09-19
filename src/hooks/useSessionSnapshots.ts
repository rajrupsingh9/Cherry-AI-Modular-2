import { useState, useRef, useCallback, useEffect } from "react";
import { THEME_CONFIGS, ThemeType } from "../types";
import { isBoardContentComplete, captureClassroomSnapshot } from "../utils/blackboardSnapshotEngine";

export interface UseSessionSnapshotsProps {
  auth: any;
  user: any;
  studentDetails: {
    subject?: string;
    grade?: string;
  };
  theme: ThemeType;
  topics: string[];
  activeTopicIndex: number;
  customBoardContent: string;
  sessionId: string | null;
  currentScreen: string;
  showBrandSplash: boolean;
  showIntroWalkthrough: boolean;
  showEnrollmentScreen: boolean;
  addToast: (message: string, type: "info" | "success" | "error" | "warning") => void;
}

export function useSessionSnapshots({
  auth,
  user,
  studentDetails,
  theme,
  topics,
  activeTopicIndex,
  customBoardContent,
  sessionId,
  currentScreen,
  showBrandSplash,
  showIntroWalkthrough,
  showEnrollmentScreen,
  addToast,
}: UseSessionSnapshotsProps) {
  const [sessionSnapshots, setSessionSnapshots] = useState<any[]>(() => {
    try {
      const u = auth.currentUser || JSON.parse(localStorage.getItem("local_active_user") || "null");
      const uid = u?.uid || "local_guest_student";
      const cached =
        localStorage.getItem(`snapshots_${uid}`) ||
        localStorage.getItem("classroom_snapshots") ||
        localStorage.getItem("sessionSnapshots");
      return cached ? JSON.parse(cached) : [];
    } catch (_) {
      return [];
    }
  });

  const sessionSnapshottedTopics = useRef<Map<string, number>>(new Map());

  // Automatically capture the whiteboard content as a comprehensive snapshot for a given topic
  const autoCaptureSnapshot = useCallback(
    async (topicIndex: number, boardContent: string, isManual = false) => {
      // Strictly prevent any capture while on splash, intro, enrollment, or outside classroom
      if (showBrandSplash || showIntroWalkthrough || showEnrollmentScreen || currentScreen !== "classroom") {
        return;
      }

      const currentUser = auth.currentUser || user;
      if (!boardContent || !boardContent.trim()) return;

      // Quality gate: do not auto-capture "adha adhura" intermediate chunks
      if (!isManual && !isBoardContentComplete(boardContent)) {
        return;
      }

      const topicContent = topics[topicIndex] || "";
      let topicTitle = `Topic ${topicIndex + 1}`;
      if (topicContent) {
        const lines = topicContent.split("\n");
        for (const line of lines) {
          const trimmed = line.replace(/[#*📌$]/g, "").trim();
          if (trimmed) {
            topicTitle = trimmed;
            break;
          }
        }
      }

      // Deterministic topic key for 1-topic = 1-snapshot rule
      const topicKey = `topic_${topicIndex}_${topicTitle.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 25)}`;
      const contentLen = boardContent.trim().length;
      const lastLen = sessionSnapshottedTopics.current.get(topicKey) || 0;
      if (!isManual && Math.abs(contentLen - lastLen) < 30 && lastLen > 0) {
        return;
      }
      sessionSnapshottedTopics.current.set(topicKey, contentLen);

      const boardBg = THEME_CONFIGS[theme]?.primary || "#0c201a";

      await captureClassroomSnapshot({
        topicIndex,
        boardContent,
        isManual,
        topics,
        boardBg,
        subject: studentDetails.subject || "Mathematics",
        grade: studentDetails.grade || "Class 10",
        sessionId,
        currentUser,
        onSnapshotSaved: (newSnapshot) => {
          setSessionSnapshots((prev) => {
            const filtered = prev.filter(
              (s) =>
                !(
                  s.topicIndex === topicIndex ||
                  s.topicTitle?.trim().toLowerCase() === topicTitle.trim().toLowerCase()
                )
            );
            return [newSnapshot, ...filtered];
          });
        },
        addToast,
      });
    },
    [
      topics,
      addToast,
      theme,
      user,
      auth,
      studentDetails.subject,
      studentDetails.grade,
      sessionId,
      showBrandSplash,
      showIntroWalkthrough,
      showEnrollmentScreen,
      currentScreen,
    ]
  );

  // Handle manual/instant save snapshots triggered by onClick handler on active Blackboard
  const handleManualSaveSnapshot = useCallback(async () => {
    if (!customBoardContent || !customBoardContent.trim()) {
      addToast("Blackboard matches an empty slate! Write something first. 📝✍️", "warning");
      return;
    }
    await autoCaptureSnapshot(activeTopicIndex, customBoardContent, true);
  }, [activeTopicIndex, customBoardContent, autoCaptureSnapshot, addToast]);

  // Automatic snapshot trigger that takes a screenshot of the blackboard
  // after writing stabilizes (7 seconds of inactivity) and content is fully complete.
  // STRICT GUARD: Runs ONLY when the student is in an active classroom session, never on splash/intro/enrollment.
  useEffect(() => {
    if (
      currentScreen !== "classroom" ||
      showBrandSplash ||
      showIntroWalkthrough ||
      showEnrollmentScreen ||
      !customBoardContent ||
      !customBoardContent.trim() ||
      !isBoardContentComplete(customBoardContent)
    ) {
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      autoCaptureSnapshot(activeTopicIndex, customBoardContent);
    }, 7000); // 7 seconds debounce so Cherry Ma'am completes whole derivation before capturing

    return () => clearTimeout(delayDebounceFn);
  }, [
    customBoardContent,
    activeTopicIndex,
    autoCaptureSnapshot,
    currentScreen,
    showBrandSplash,
    showIntroWalkthrough,
    showEnrollmentScreen,
  ]);

  return {
    sessionSnapshots,
    setSessionSnapshots,
    autoCaptureSnapshot,
    handleManualSaveSnapshot,
  };
}
