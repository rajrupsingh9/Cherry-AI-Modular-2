import { useState, useEffect } from "react";
import { ActiveDocumentState, UseDocumentSyncProps } from "./document/types";
import { uploadDocumentFile } from "./document/documentUploadService";
import { syncDocumentToSessionAndCloud, clearDocumentOnServer } from "./document/documentSessionSync";

export type { ActiveDocumentState };

export function useDocumentSync({
  user,
  studentDetails,
  setStudentDetails,
  sessionId,
  setSessionId,
  disconnect,
  setDialogueHistory,
  setCurrentScreen,
  loadPastSessions,
  setPastSessions,
  addToast,
  setUser,
}: UseDocumentSyncProps) {
  const [activeDocument, setActiveDocument] = useState<ActiveDocumentState | null>(() => {
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

  const [uploadMode, setUploadMode] = useState<
    "guide" | "explain" | "mistake" | "homework" | "doubt" | "socratic" | "cheatsheet" | "pyq" | "podcast"
  >("explain");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedButWaitingWakeup, setUploadedButWaitingWakeup] = useState(false);
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [customBoardContent, setCustomBoardContent] = useState("");
  const [topicBoardsContent, setTopicBoardsContent] = useState<Record<number, string>>({});

  // Sync active syllabus document on mount with auto-retry and cache resilience
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
            if (data.activeDocument?.filename?.toLowerCase().includes("quadratic")) return;
            setActiveDocument(data.activeDocument);
            if (data.activeDocument?.detectedSubject) {
              setStudentDetails((prev: any) => ({ ...prev, subject: data.activeDocument.detectedSubject }));
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
            setTimeout(() => fetchWithRetry(retries - 1, delay * 1.5), delay);
          } else {
            console.warn("[useDocumentSync] Active document sync running in offline/cached mode:", err?.message || err);
          }
        });
    };

    fetchWithRetry();
    return () => { active = false; };
  }, [setStudentDetails]);

  // Synchronize activeDocument and sessionId to the server and local storage when they change
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
            sessionId: sessionId || "default",
            activeDocument,
          }),
        });
      } catch (_) {}
    };
    syncDoc();
  }, [activeDocument, sessionId]);

  // Handle syllabus or notes file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);

    try {
      const data = await uploadDocumentFile({
        file,
        uploadMode,
        sessionId,
        addToast,
      });

      if (!data) {
        setIsUploading(false);
        return;
      }

      if (data.success) {
        disconnect();
        setDialogueHistory([]);
        setUploadedButWaitingWakeup(true);
        setActiveDocument({
          filename: data.filename || "",
          mimeType: data.mimeType || "",
          markdown: data.markdown || "",
          mode: data.mode,
          detectedSubject: data.detectedSubject,
        });
        setActiveTopicIndex(0);

        const finalSb = data.detectedSubject || studentDetails.subject;
        setStudentDetails((prev: any) => ({ ...prev, subject: finalSb }));
        setCurrentScreen("classroom");

        const newSessionId = "session_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        setSessionId(newSessionId);

        await syncDocumentToSessionAndCloud({
          data,
          studentDetails,
          finalSubject: finalSb,
          newSessionId,
          user,
          setUser,
          setPastSessions,
          loadPastSessions,
        });

        addToast(
          data.mode === "socratic"
            ? "Socratic problem deconstruction ready! Press 'Wake Up' to start step-by-step guidance! 🎯🧠"
            : data.mode === "mistake"
            ? "Calculations notes diagnostic processed. Click 'Wake Up' to check your mistakes! 🔍✨"
            : "Syllabus document loaded silently in Cherry's memory. Press 'Wake Up' to start the board! 📚✨",
          "success"
        );
      } else {
        addToast(data.error || "Failed to analyze document.", "error");
      }
    } catch (err: any) {
      console.error("Upload fetch error inside reader load:", err);
      addToast("Gateway upload failed. Try optimizing the file size (under 3MB for PDF documents, or use jpeg/png images).", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearDocument = async () => {
    try {
      const ok = await clearDocumentOnServer();
      setActiveDocument(null);
      setUploadedButWaitingWakeup(false);
      setActiveTopicIndex(0);
      setCustomBoardContent("");
      setTopicBoardsContent({});
      if (ok) {
        addToast("Syllabus cleared. General teaching mode active!", "info");
      } else {
        addToast("Active document state reset locally.", "info");
      }
    } catch (err) {
      console.error("Failed clearing document:", err);
      setActiveDocument(null);
      setUploadedButWaitingWakeup(false);
      setActiveTopicIndex(0);
      setCustomBoardContent("");
      setTopicBoardsContent({});
      addToast("Active document state reset locally.", "info");
    }
  };

  return {
    activeDocument,
    setActiveDocument,
    uploadMode,
    setUploadMode,
    isUploading,
    setIsUploading,
    uploadedButWaitingWakeup,
    setUploadedButWaitingWakeup,
    activeTopicIndex,
    setActiveTopicIndex,
    customBoardContent,
    setCustomBoardContent,
    topicBoardsContent,
    setTopicBoardsContent,
    handleFileUpload,
    handleClearDocument,
  };
}
