import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { ThemeType, THEME_CONFIGS } from "../types";
import { smartMergeWhiteboardNotes } from "../utils/boardFilter";
import { saveActiveLearningContext } from "../utils/activeLearningStore";

export interface ActiveDocumentData {
  filename: string;
  mimeType: string;
  markdown: string;
  mode?: string;
  detectedSubject?: string;
}

export interface ClassroomContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  handleThemeChange: (newTheme: ThemeType) => void;
  activeDocument: ActiveDocumentData | null;
  setActiveDocument: React.Dispatch<React.SetStateAction<ActiveDocumentData | null>>;
  activeTopicIndex: number;
  setActiveTopicIndex: React.Dispatch<React.SetStateAction<number>>;
  customBoardContent: string;
  setCustomBoardContent: React.Dispatch<React.SetStateAction<string>>;
  topicBoardsContent: Record<number, string>;
  setTopicBoardsContent: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  topics: string[];
  sessionSnapshots: any[];
  setSessionSnapshots: React.Dispatch<React.SetStateAction<any[]>>;
  uploadMode: "guide" | "explain" | "mistake" | "homework" | "doubt" | "socratic" | "cheatsheet" | "pyq" | "podcast";
  setUploadMode: (mode: "guide" | "explain" | "mistake" | "homework" | "doubt" | "socratic" | "cheatsheet" | "pyq" | "podcast") => void;
  isUploading: boolean;
  setIsUploading: (val: boolean) => void;
  uploadedButWaitingWakeup: boolean;
  setUploadedButWaitingWakeup: (val: boolean) => void;
  updateWhiteboardWithSmartMerge: (content: string, append?: boolean) => void;
  resetClassroom: () => void;
}

const ClassroomContext = createContext<ClassroomContextType | undefined>(undefined);

export interface ClassroomProviderProps {
  children: React.ReactNode;
  addToast?: (message: string, type?: "info" | "success" | "error" | "warning") => void;
  studentSubject?: string;
  onSubjectDetected?: (subject: string) => void;
}

export const ClassroomProvider: React.FC<ClassroomProviderProps> = ({
  children,
  addToast,
  studentSubject,
  onSubjectDetected,
}) => {
  const [theme, setTheme] = useState<ThemeType>(() => {
    try {
      const saved = localStorage.getItem("preferred_classroom_theme");
      if (saved && saved in THEME_CONFIGS) {
        return saved as ThemeType;
      }
    } catch (_) {}
    return "cherry";
  });

  const [activeDocument, setActiveDocument] = useState<ActiveDocumentData | null>(() => {
    try {
      const cached = localStorage.getItem("cherry_active_doc");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.mode === "discuss_concept" || parsed?.filename?.toLowerCase().includes("quadratic")) {
          localStorage.removeItem("cherry_active_doc");
          return null;
        }
        return parsed;
      }
      return null;
    } catch (_) {
      return null;
    }
  });

  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [customBoardContent, setCustomBoardContent] = useState("");
  const [topicBoardsContent, setTopicBoardsContent] = useState<Record<number, string>>({});
  const [uploadMode, setUploadMode] = useState<
    "guide" | "explain" | "mistake" | "homework" | "doubt" | "socratic" | "cheatsheet" | "pyq" | "podcast"
  >("explain");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedButWaitingWakeup, setUploadedButWaitingWakeup] = useState(false);

  const [sessionSnapshots, setSessionSnapshots] = useState<any[]>(() => {
    try {
      const cached =
        localStorage.getItem("snapshots_local_guest_student") ||
        localStorage.getItem("snapshots_guest") ||
        localStorage.getItem("all_board_snapshots");
      return cached ? JSON.parse(cached) : [];
    } catch (_) {
      return [];
    }
  });

  // Theme change handler with toast feedback
  const handleThemeChange = useCallback(
    (newTheme: ThemeType) => {
      const sanitized = (newTheme || "").toString().toLowerCase() as ThemeType;
      let appliedTheme: ThemeType = "cherry";
      if (THEME_CONFIGS[sanitized]) {
        appliedTheme = sanitized;
      }
      setTheme(appliedTheme);
      try {
        localStorage.setItem("preferred_classroom_theme", appliedTheme);
      } catch (_) {}
      const themeNames: Record<ThemeType, string> = {
        cherry: "Teal Forest Cherry 🍒",
        matrix: "Digital Matrix Code 📟",
        cyber: "Neon Cyberpunk ⚡",
        sunset: "Twilight Sunset 🌅",
        slate: "Modern Graphite Slate 📓",
        ivory: "Premium Ice White 🥼",
      };
      if (addToast) {
        addToast(`Blackboard theme changed to: ${themeNames[appliedTheme]}`, "success");
      }
    },
    [addToast]
  );

  // Parse document markdown into separate pedagogical topics
  const topics = useMemo<string[]>(() => {
    const raw = activeDocument?.markdown || "";
    if (!raw.trim()) {
      return [];
    }

    const lines = raw.split("\n");
    const cleanedLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (
        /^#+\s*(Chapter|Title|Subject)\s*:/i.test(trimmed) ||
        /^\[DOC_TYPE:[^\]]*\]/i.test(trimmed)
      ) {
        continue;
      }
      cleanedLines.push(line);
    }

    const cleanedMarkdown = cleanedLines.join("\n").trim();
    if (!cleanedMarkdown) {
      return [raw];
    }

    const level1Matches = cleanedMarkdown.match(/^#\s+[^#\n]+/gm) || [];
    const level1Count = level1Matches.length;
    const level2Matches = cleanedMarkdown.match(/^##\s+[^#\n]+/gm) || [];
    const level2Count = level2Matches.length;

    let rawBlocks: string[] = [];

    if (level1Count >= 2) {
      const splitRegex = /(?=^#\s+[^#\n]+)/gm;
      rawBlocks = cleanedMarkdown.split(splitRegex);
    } else if (level2Count >= 2 && level1Count <= 1) {
      const splitRegex = /(?=^##\s+[^#\n]+)/gm;
      rawBlocks = cleanedMarkdown.split(splitRegex);
    } else {
      const paragraphs = cleanedMarkdown.split(/\n\s*\n+/);
      if (paragraphs.length >= 4) {
        const grouped: string[] = [];
        let temp = "";
        for (const p of paragraphs) {
          if (temp && (temp + "\n\n" + p).length > 600) {
            grouped.push(temp.trim());
            temp = p;
          } else {
            temp = temp ? temp + "\n\n" + p : p;
          }
        }
        if (temp.trim()) grouped.push(temp.trim());
        rawBlocks = grouped;
      } else {
        rawBlocks = [cleanedMarkdown];
      }
    }

    const validTopics: string[] = [];
    let pendingHeader = "";

    for (const block of rawBlocks) {
      const trimmed = block.trim();
      if (!trimmed) continue;

      const contentWithoutHeader = trimmed.replace(/^#+\s*[^\n]+\n?/, "").trim();
      if (contentWithoutHeader.length < 20 && rawBlocks.length > 1) {
        pendingHeader = pendingHeader ? pendingHeader + "\n\n" + trimmed : trimmed;
      } else {
        const combined = pendingHeader ? pendingHeader + "\n\n" + trimmed : trimmed;
        pendingHeader = "";
        validTopics.push(combined);
      }
    }

    if (pendingHeader && validTopics.length > 0) {
      validTopics[validTopics.length - 1] += "\n\n" + pendingHeader;
    } else if (pendingHeader) {
      validTopics.push(pendingHeader);
    }

    return validTopics.length > 0 ? validTopics : [raw];
  }, [activeDocument]);

  // Initial sync of active syllabus document from API with resilience
  useEffect(() => {
    let active = true;
    const fetchWithRetry = (retries = 3, delay = 1000) => {
      fetch("/api/active-document")
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
          return res.text();
        })
        .then((text) => {
          if (text.trim().startsWith("{")) return JSON.parse(text);
          throw new Error("Invalid json response payload format");
        })
        .then((data) => {
          if (!active) return;
          if (data && data.activeDocument) {
            if (data.activeDocument?.filename?.toLowerCase().includes("quadratic")) {
              return;
            }
            setActiveDocument(data.activeDocument);
            if (data.activeDocument?.detectedSubject && onSubjectDetected) {
              onSubjectDetected(data.activeDocument.detectedSubject);
            }
            try {
              localStorage.setItem("cherry_active_doc", JSON.stringify(data.activeDocument));
            } catch (_) {}
            setActiveTopicIndex(0);
          }
        })
        .catch((err) => {
          if (!active) return;
          if (retries > 0) {
            setTimeout(() => {
              fetchWithRetry(retries - 1, delay * 1.5);
            }, delay);
          } else {
            console.warn("[ClassroomContext] Active document sync in offline mode:", err?.message || err);
          }
        });
    };

    fetchWithRetry();
    return () => {
      active = false;
    };
  }, [onSubjectDetected]);

  // Sync active document persistence to server & local storage
  useEffect(() => {
    try {
      if (activeDocument) {
        localStorage.setItem("cherry_active_doc", JSON.stringify(activeDocument));
      } else {
        localStorage.removeItem("cherry_active_doc");
      }
    } catch (_) {}

    const syncDoc = async () => {
      try {
        await fetch("/api/active-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "default",
            activeDocument,
          }),
        });
      } catch (err) {
        // Silently handle offline / background sync
      }
    };
    syncDoc();
  }, [activeDocument]);

  // Smart merge handler for live chalk whiteboard updates from AI voice bot
  const updateWhiteboardWithSmartMerge = useCallback(
    (content: string, append: boolean = false) => {
      setCustomBoardContent((prev) => {
        const merged = smartMergeWhiteboardNotes(prev, content, append);
        setTopicBoardsContent((tb) => ({
          ...tb,
          [activeTopicIndex]: merged,
        }));
        return merged;
      });
    },
    [activeTopicIndex]
  );

  const resetClassroom = useCallback(() => {
    setActiveDocument(null);
    setCustomBoardContent("");
    setTopicBoardsContent({});
    setActiveTopicIndex(0);
    localStorage.removeItem("cherry_active_doc");
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      handleThemeChange,
      activeDocument,
      setActiveDocument,
      activeTopicIndex,
      setActiveTopicIndex,
      customBoardContent,
      setCustomBoardContent,
      topicBoardsContent,
      setTopicBoardsContent,
      topics,
      sessionSnapshots,
      setSessionSnapshots,
      uploadMode,
      setUploadMode,
      isUploading,
      setIsUploading,
      uploadedButWaitingWakeup,
      setUploadedButWaitingWakeup,
      updateWhiteboardWithSmartMerge,
      resetClassroom,
    }),
    [
      theme,
      handleThemeChange,
      activeDocument,
      activeTopicIndex,
      customBoardContent,
      topicBoardsContent,
      topics,
      sessionSnapshots,
      uploadMode,
      isUploading,
      uploadedButWaitingWakeup,
      updateWhiteboardWithSmartMerge,
      resetClassroom,
    ]
  );

  return <ClassroomContext.Provider value={value}>{children}</ClassroomContext.Provider>;
};

export const useClassroom = () => {
  const context = useContext(ClassroomContext);
  if (!context) {
    throw new Error("useClassroom must be used within a ClassroomProvider");
  }
  return context;
};
