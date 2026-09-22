import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { ThemeType, THEME_CONFIGS } from "../types";
import { smartMergeWhiteboardNotes } from "../utils/boardFilter";
import { splitDocumentIntoTopics } from "./classroomTopicSplitter";

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
    return splitDocumentIntoTopics(activeDocument?.markdown || "");
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
      } catch (_) {}
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
