import { useEffect, useCallback, type Dispatch, type SetStateAction } from "react";
import { isBoardContentComplete } from "../../utils/blackboardSnapshotEngine";

interface UseClassroomTopicNavigationProps {
  topics: string[];
  activeTopicIndex: number;
  setActiveTopicIndex: Dispatch<SetStateAction<number>>;
  customBoardContent: string;
  setCustomBoardContent: Dispatch<SetStateAction<string>>;
  topicBoardsContent: Record<number, string>;
  setTopicBoardsContent: Dispatch<SetStateAction<Record<number, string>>>;
  teachingPhase: string;
  activeDocument: any;
  studentDetails: { subject?: string; [key: string]: any };
  currentScreen: any;
  showBrandSplash: boolean;
  showIntroWalkthrough: boolean;
  showEnrollmentScreen: boolean;
  state: string;
  togglePauseTeaching: () => void;
  addToast: (message: string, type: "info" | "success" | "error") => void;
  autoCaptureSnapshot: (topicIndex: number, boardContent: string, isManual?: boolean) => Promise<void>;
}

export function useClassroomTopicNavigation({
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
}: UseClassroomTopicNavigationProps) {
  // Slide player transitions and notifications
  const handleNextTopic = useCallback(() => {
    if (customBoardContent && isBoardContentComplete(customBoardContent)) {
      autoCaptureSnapshot(activeTopicIndex, customBoardContent);
    }
    setActiveTopicIndex((prev) => {
      const nextIndex = prev + 1 < topics.length ? prev + 1 : prev;
      if (nextIndex !== prev) {
        addToast(`Syllabus screen updated to topic: Part ${nextIndex + 1}! 📖`, "info");
        setTopicBoardsContent((tb) => ({ ...tb, [prev]: customBoardContent }));
        setCustomBoardContent(topicBoardsContent[nextIndex] || "");
      }
      return nextIndex;
    });
  }, [topics, addToast, activeTopicIndex, customBoardContent, autoCaptureSnapshot, topicBoardsContent, setActiveTopicIndex, setTopicBoardsContent, setCustomBoardContent]);

  const handlePrevTopic = useCallback(() => {
    if (customBoardContent && isBoardContentComplete(customBoardContent)) {
      autoCaptureSnapshot(activeTopicIndex, customBoardContent);
    }
    setActiveTopicIndex((prev) => {
      const prevIndex = prev > 0 ? prev - 1 : prev;
      if (prevIndex !== prev) {
        addToast(`Syllabus screen updated to topic: Part ${prevIndex + 1}! 📖`, "info");
        setTopicBoardsContent((tb) => ({ ...tb, [prev]: customBoardContent }));
        setCustomBoardContent(topicBoardsContent[prevIndex] || "");
      }
      return prevIndex;
    });
  }, [addToast, activeTopicIndex, customBoardContent, autoCaptureSnapshot, topicBoardsContent, setActiveTopicIndex, setTopicBoardsContent, setCustomBoardContent]);

  const handleSyncBoardContent = useCallback(
    (idx: number, content: string) => {
      setTopicBoardsContent((prev) => {
        if (prev[idx] === content) return prev;
        return {
          ...prev,
          [idx]: content,
        };
      });
    },
    [setTopicBoardsContent]
  );

  // Synchronize customBoardContent specifically for Phase 1 ('intro')
  useEffect(() => {
    if (currentScreen !== "classroom" || showBrandSplash || showIntroWalkthrough || showEnrollmentScreen) return;
    if (activeDocument?.mode === "open_board" || activeDocument?.mode === "discuss_concept" || activeDocument?.mode === "explain_experiment") return;
    const currentPhase = (teachingPhase || "intro").toLowerCase();
    const isIntroPhase = currentPhase === "intro";

    if (isIntroPhase && (!customBoardContent || customBoardContent.trim() === "")) {
      const activeTopicText = topics && topics.length > activeTopicIndex && topics[activeTopicIndex] ? topics[activeTopicIndex] : "";
      const topicHeaderLine = activeTopicText.split("\n")[0] || "";

      const rawFallback = activeDocument?.filename
        ? activeDocument.filename.replace(/\.[^/.]+$/, "")
        : activeDocument?.detectedSubject || studentDetails.subject || "Classroom Lesson";
      const isRawFallbackId = /^\d{8,}$/.test(rawFallback.trim()) || (rawFallback.trim().length > 20 && /^[0-9a-fA-F\-]+$/.test(rawFallback.trim()));
      const safeFallbackTitle = isRawFallbackId ? activeDocument?.detectedSubject || studentDetails.subject || "Classroom Lesson" : rawFallback;

      const rawHeaderClean = topicHeaderLine
        .replace(/[#*_~`]/g, "")
        .replace(/\.(md|markdown|txt|pdf|docx|jpg|jpeg|png|webp|gif)$/i, "")
        .replace(/^["']|["']$/g, "")
        .replace(/[\_]/g, " ")
        .trim();
      const isRawHeaderId = /^\d{8,}$/.test(rawHeaderClean) || (rawHeaderClean.length > 20 && /^[0-9a-fA-F\-]+$/.test(rawHeaderClean));
      const safeTopicTitle = !isRawHeaderId && rawHeaderClean ? rawHeaderClean : `Topic Part ${activeTopicIndex + 1}`;
      const cleanHeader = `# ${safeTopicTitle}`;

      if (activeTopicText.trim() || activeDocument?.filename) {
        setCustomBoardContent(cleanHeader);
      }
    }
  }, [teachingPhase, activeTopicIndex, topics, customBoardContent, studentDetails.subject, activeDocument, currentScreen, showBrandSplash, showIntroWalkthrough, showEnrollmentScreen, setCustomBoardContent]);

  // Synchronize customBoardContent with topics when transitioning to concept/example/doubt phases
  useEffect(() => {
    if (currentScreen !== "classroom" || showBrandSplash || showIntroWalkthrough || showEnrollmentScreen) return;
    if (activeDocument?.mode === "open_board" || activeDocument?.mode === "discuss_concept" || activeDocument?.mode === "explain_experiment") return;
    const currentPhase = (teachingPhase || "intro").toLowerCase();
    const isConceptOrLater = currentPhase === "concept" || currentPhase === "example" || currentPhase === "doubt" || currentPhase === "transition";

    if (isConceptOrLater && topics && topics.length > 0 && activeTopicIndex < topics.length) {
      const activeTopicText = topics[activeTopicIndex] || "";
      if (activeTopicText.trim() !== "") {
        const isHeaderOnly = customBoardContent.trim().startsWith("#") && !customBoardContent.includes("\n") && customBoardContent.length < 90;
        const isPollOnly = customBoardContent.includes("PREDICTION POLL") && !customBoardContent.includes("### 📌");
        const isCurrentlyEmpty = !customBoardContent || customBoardContent.trim() === "" || isHeaderOnly || isPollOnly;

        if (isCurrentlyEmpty) {
          setCustomBoardContent(activeTopicText);
        }
      }
    }
  }, [teachingPhase, activeTopicIndex, topics, customBoardContent, activeDocument, currentScreen, showBrandSplash, showIntroWalkthrough, showEnrollmentScreen, setCustomBoardContent]);

  // Keyboard shortcut listener: Space or P to Pause/Resume live session
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || "").toLowerCase();
      const isInput = activeTag === "input" || activeTag === "textarea" || (document.activeElement as HTMLElement)?.isContentEditable;
      if (isInput) return;

      if (currentScreen === "classroom" && state !== "disconnected") {
        if (e.code === "Space" || e.key === "p" || e.key === "P") {
          e.preventDefault();
          togglePauseTeaching();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentScreen, state, togglePauseTeaching]);

  return {
    handleNextTopic,
    handlePrevTopic,
    handleSyncBoardContent,
  };
}
