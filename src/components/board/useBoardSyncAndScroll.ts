/**
 * useBoardSyncAndScroll.ts
 * Manages blackboard content synchronization, speech tag extraction, and vertical viewport scrolling
 */
import { useState, useRef, useEffect } from "react";
import { extractBoardContent, sanitizeRawBoardData } from "../../utils/boardFilter";
import { triggerCelebrationConfetti } from "../../utils/confetti";
import { AutoSavedDraft } from "./boardTypes";
import { exportChalkboardPdf } from "./boardPdfExport";

interface UseBoardSyncAndScrollProps {
  latestSpeech: string;
  state: string;
  teachingPhase: string;
  customBoardContent?: string;
  activeTopicIndex: number;
  onSyncBoardContent?: (topicIndex: number, content: string) => void;
  primaryColor?: string;
  onClearBoard?: () => void;
}

export function useBoardSyncAndScroll({
  latestSpeech,
  state,
  teachingPhase,
  customBoardContent,
  activeTopicIndex,
  onSyncBoardContent,
  primaryColor = "#0c201a",
  onClearBoard
}: UseBoardSyncAndScrollProps) {
  const [activeBoardContent, setActiveBoardContent] = useState("");
  const [isBoardTagActive, setIsBoardTagActive] = useState(false);
  const [showJumpBadge, setShowJumpBadge] = useState(false);
  const [autoSavedDrafts, setAutoSavedDrafts] = useState<AutoSavedDraft[]>([]);

  const boardSliceRef = useRef<HTMLDivElement>(null);
  const activeBlockRef = useRef<HTMLDivElement>(null);
  const lastProcessedSpeechRef = useRef("");
  const lastSavedContentRef = useRef<string>("");

  // Sync customBoardContent if provided by the parent
  useEffect(() => {
    if (customBoardContent !== undefined) {
      const sanitized = sanitizeRawBoardData(customBoardContent);
      setActiveBoardContent(prev => {
        if (prev.trim() === sanitized.trim()) return prev;
        setIsBoardTagActive(sanitized.trim() !== "");
        return sanitized;
      });
    }
  }, [customBoardContent]);

  // Sync latest speech to active blackboard state
  useEffect(() => {
    if (!latestSpeech || latestSpeech.trim() === "") {
      lastProcessedSpeechRef.current = "";
      return;
    }

    if (latestSpeech === lastProcessedSpeechRef.current) return;
    lastProcessedSpeechRef.current = latestSpeech;

    const isWipeTrigger =
      latestSpeech.toLowerCase().includes("<board></board>") ||
      latestSpeech.toLowerCase().includes("<board> //clear") ||
      latestSpeech.toLowerCase().includes("<board>clear</board>") ||
      latestSpeech.toLowerCase().includes("//clear board") ||
      latestSpeech.toLowerCase().includes("clear the board") ||
      latestSpeech.toLowerCase().includes("board clear kare");

    if (isWipeTrigger) {
      setActiveBoardContent("");
      setIsBoardTagActive(false);
      return;
    }

    const hasBoardTags = latestSpeech.toLowerCase().includes("<board>");
    const hasActiveToolContent = customBoardContent && customBoardContent.trim() !== "";

    if (hasActiveToolContent && !hasBoardTags) {
      return;
    }

    const extracted = extractBoardContent(latestSpeech);
    if (extracted && extracted.trim() !== "") {
      if (hasActiveToolContent && !hasBoardTags) {
        return;
      }
      setActiveBoardContent(extracted);
      setIsBoardTagActive(true);
    }
  }, [latestSpeech, state, customBoardContent]);

  // Propagate real-time whiteboard updates back up to parent
  useEffect(() => {
    if (onSyncBoardContent && activeBoardContent !== undefined) {
      onSyncBoardContent(activeTopicIndex, activeBoardContent);
    }
  }, [activeBoardContent, activeTopicIndex, onSyncBoardContent]);

  // Scroll to active topic block when topic index changes
  useEffect(() => {
    if (boardSliceRef.current && activeBlockRef.current) {
      const parent = boardSliceRef.current;
      const child = activeBlockRef.current;
      const scrollOffset = child.offsetTop - parent.offsetTop;

      parent.scrollTo({
        top: Math.max(0, scrollOffset - 24),
        behavior: "smooth"
      });
    }
  }, [activeTopicIndex]);

  // Keep scrolling to match active writing updates if student was near the bottom
  useEffect(() => {
    if (boardSliceRef.current) {
      const el = boardSliceRef.current;
      const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 240;
      if (isAtBottom && activeBoardContent) {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: "smooth"
        });
      }
    }
  }, [activeBoardContent, teachingPhase]);

  const handleScroll = () => {
    if (boardSliceRef.current) {
      const el = boardSliceRef.current;
      const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 180;
      setShowJumpBadge(!isAtBottom);
    }
  };

  const handleJumpToActive = () => {
    if (boardSliceRef.current && activeBlockRef.current) {
      const parent = boardSliceRef.current;
      const child = activeBlockRef.current;
      const scrollOffset = child.offsetTop - parent.offsetTop;

      parent.scrollTo({
        top: Math.max(0, scrollOffset - 24),
        behavior: "smooth"
      });
    }
  };

  const triggerBackgroundAutoSave = async (reason: string) => {
    if (!activeBoardContent || activeBoardContent.trim() === "" || activeBoardContent === lastSavedContentRef.current) {
      return;
    }
    lastSavedContentRef.current = activeBoardContent;

    const timestampStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const filename = `Session_Auto_Draft_${Date.now()}.pdf`;

    const pdfBlob = await exportChalkboardPdf(primaryColor, filename);
    if (pdfBlob && pdfBlob instanceof Blob) {
      const blobUrl = URL.createObjectURL(pdfBlob);
      const newDraft: AutoSavedDraft = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: timestampStr,
        topicTitle: reason,
        blobUrl: blobUrl,
        filename: `Cherry_Classroom_Whiteboard_Draft_${timestampStr.replace(/[:\s]/g, "_")}.pdf`
      };

      setAutoSavedDrafts(prev => [newDraft, ...prev].slice(0, 5));
    }
  };

  // Class completion trigger
  const lastStateRef = useRef(state);
  useEffect(() => {
    const prev = lastStateRef.current;
    const curr = state;
    lastStateRef.current = state;

    if ((prev === "connected" || prev === "idle") && curr === "disconnected") {
      triggerBackgroundAutoSave("Class Ended (Automatic Save)");
    }
  }, [state, activeBoardContent]);

  // Major section / Phase change complete trigger
  const lastPhaseRef = useRef(teachingPhase);
  useEffect(() => {
    const prev = lastPhaseRef.current;
    const curr = teachingPhase;
    lastPhaseRef.current = teachingPhase;

    if (prev && curr && prev !== curr) {
      triggerBackgroundAutoSave(`Phase Complete: ${prev.toUpperCase()}`);
      if (curr.toLowerCase() === "complete") {
        triggerCelebrationConfetti();
      }
    }
  }, [teachingPhase, activeBoardContent]);

  const fullClassroomReset = () => {
    setActiveBoardContent("");
    setIsBoardTagActive(false);
    if (onClearBoard) {
      onClearBoard();
    }
  };

  return {
    activeBoardContent,
    setActiveBoardContent,
    isBoardTagActive,
    boardSliceRef,
    activeBlockRef,
    showJumpBadge,
    autoSavedDrafts,
    handleScroll,
    handleJumpToActive,
    triggerBackgroundAutoSave,
    fullClassroomReset
  };
}
