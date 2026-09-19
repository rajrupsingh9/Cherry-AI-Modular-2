import React, { useState, useEffect, useRef } from "react";
import { compressImageIfPossible } from "../utils/imageCompressor";
import { getActiveApiKey } from "../utils/geminiKeyStorage";
import { saveActiveLearningContext } from "../utils/activeLearningStore";
import { auth, db, OperationType, handleFirestoreError } from "../lib/firebase";
import { signInAnonymously } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { safeSavePastSessions } from "../utils/safeStorage";

export interface ActiveDocumentState {
  filename: string;
  mimeType: string;
  markdown: string;
  mode?: string;
  detectedSubject?: string;
}

interface UseDocumentSyncProps {
  user: any;
  studentDetails: { name: string; grade: string; subject: string; board?: string; mediumOfLearning?: string };
  setStudentDetails: React.Dispatch<React.SetStateAction<any>>;
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  disconnect: () => void;
  setDialogueHistory: (history: any[]) => void;
  setCurrentScreen: (screen: "home" | "syllabus" | "classroom" | "quiz" | "lab" | "profile" | "admin") => void;
  loadPastSessions: (uid: string) => Promise<void>;
  setPastSessions: React.Dispatch<React.SetStateAction<any[]>>;
  addToast: (message: string, type: "info" | "success" | "error") => void;
  setUser: (user: any) => void;
}

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

  const [uploadMode, setUploadMode] = useState<"guide" | "explain" | "mistake" | "homework" | "doubt" | "socratic" | "cheatsheet" | "pyq" | "podcast">("explain");
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
          if (!res.ok) {
            throw new Error(`HTTP error: ${res.status}`);
          }
          return res.text();
        })
        .then((text) => {
          if (text.trim().startsWith("{")) {
            return JSON.parse(text);
          }
          throw new Error("Invalid json response payload format");
        })
        .then((data) => {
          if (!active) return;
          if (data && data.activeDocument) {
            if (data.activeDocument?.filename?.toLowerCase().includes("quadratic")) {
              return;
            }
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
            setTimeout(() => {
              fetchWithRetry(retries - 1, delay * 1.5);
            }, delay);
          } else {
            console.warn("[useDocumentSync] Active document sync running in offline/cached mode:", err?.message || err);
          }
        });
    };

    fetchWithRetry();

    return () => {
      active = false;
    };
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
            activeDocument
          })
        });
      } catch (err) {
        // Silently handle offline / background sync
      }
    };
    syncDoc();
  }, [activeDocument, sessionId]);

  // Handle syllabus or notes file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);

    const isImage = (file.type && file.type.startsWith("image/")) || /\.(jpe?g|png|webp|gif|bmp|heic|tiff)$/i.test(file.name);
    const isPDFOrDoc = !isImage;

    if (isPDFOrDoc && file.size > 5 * 1024 * 1024) {
      addToast(`Syllabus document size of ${(file.size / (1024 * 1024)).toFixed(1)}MB exceeds the 5MB gateway limit for non-image files. Please upload a more compact PDF or text file.`, "error");
      setIsUploading(false);
      return;
    }

    addToast(isImage ? "Optimizing calculations image..." : "Analyzing document with Gemini...", "info");

    try {
      const result = await compressImageIfPossible(file, 1200, 0.70);
      if (!result) {
        throw new Error("Failed to read document contents safely.");
      }

      const splitResult = result.split(",");
      if (splitResult.length < 2) {
        throw new Error("Invalid base64 payload returned from document reader.");
      }

      let resolvedMime = file.type || "";
      if (!resolvedMime || resolvedMime === "application/octet-stream") {
        const lower = file.name.toLowerCase();
        if (lower.endsWith(".pdf")) resolvedMime = "application/pdf";
        else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) resolvedMime = "image/jpeg";
        else if (lower.endsWith(".png")) resolvedMime = "image/png";
        else if (lower.endsWith(".webp")) resolvedMime = "image/webp";
        else if (lower.endsWith(".gif")) resolvedMime = "image/gif";
        else if (lower.endsWith(".txt")) resolvedMime = "text/plain";
        else if (lower.endsWith(".md") || lower.endsWith(".markdown")) resolvedMime = "text/markdown";
        else if (lower.endsWith(".json")) resolvedMime = "application/json";
        else if (lower.endsWith(".csv")) resolvedMime = "text/csv";
        else resolvedMime = isImage ? "image/jpeg" : "application/pdf";
      }

      const base64Data = splitResult[1];
      const activeKey = getActiveApiKey();
      const payload = {
        filename: file.name,
        mimeType: resolvedMime,
        base64Data,
        mode: uploadMode,
        sessionId,
        apiKey: activeKey || undefined,
      };

      let response: Response | null = null;
      const attempts = 3;
      for (let attempt = 1; attempt <= attempts; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000);
        try {
          const res = await fetch("/api/upload-document", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(activeKey ? { "x-gemini-api-key": activeKey } : {}),
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          response = res;
          if (res.ok || res.status === 413 || res.status === 500) {
            break;
          }
          throw new Error(`Server returned HTTP status ${res.status}`);
        } catch (fetchErr: any) {
          clearTimeout(timeoutId);
          console.warn(`Upload attempt ${attempt} failed:`, fetchErr);
          if (attempt === attempts) {
            throw fetchErr;
          }
          addToast(`Upload interrupted. Retrying automatically (attempt ${attempt + 1}/${attempts})...`, "info");
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (!response || !response.ok) {
        let errorMsg = "Internal server or gateway error during upload";
        if (response) {
          try {
            const rawText = await response.text();
            if (rawText.trim().startsWith("{")) {
              const errData = JSON.parse(rawText);
              errorMsg = errData.error || errorMsg;
            } else if (rawText.toLowerCase().includes("payload too large") || response.status === 413) {
              errorMsg = "File is too large! Please upload a syllabus document or image smaller than 3MB to avoid network timeouts.";
            } else {
              errorMsg = `Server error (Status ${response.status}). Please try optimizing your document content or try again.`;
            }
          } catch (pErr) {
            if (response.status === 413) {
              errorMsg = "Request entity too large! Please upload a smaller document (< 4MB) to bypass server buffers.";
            }
          }
        }
        addToast(errorMsg, "error");
        setIsUploading(false);
        return;
      }

      let data: any;
      try {
        const rawText = await response.text();
        if (!rawText.trim().startsWith("{")) {
          throw new Error("Invalid response format received from the server.");
        }
        data = JSON.parse(rawText);
      } catch (jsonErr: any) {
        throw new Error(jsonErr?.message || "The classroom portal received an unreadable response from the diagnostic server. Please try a smaller or more optimized document file.");
      }
      
      if (data.success) {
        disconnect();
        setDialogueHistory([]);
        setUploadedButWaitingWakeup(true);
        setActiveDocument({
          filename: data.filename,
          mimeType: data.mimeType,
          markdown: data.markdown,
          mode: data.mode,
          detectedSubject: data.detectedSubject,
        });
        setActiveTopicIndex(0);
        
        const finalSb = data.detectedSubject || studentDetails.subject;
        setStudentDetails((prev: any) => ({ ...prev, subject: finalSb }));

        setCurrentScreen("classroom");

        const newSessionId = "session_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        setSessionId(newSessionId);

        saveActiveLearningContext({
          sourceMode: data.mode === "mistake" ? "mistake_vault" : data.mode === "doubt" ? "doubt_solver" : "explainer_doc",
          title: data.filename || "Uploaded Notes Document",
          subject: finalSb,
          grade: studentDetails.grade,
          board: studentDetails.board,
          mediumOfLearning: studentDetails.mediumOfLearning,
          documentMarkdown: data.markdown || "",
          blackboardContent: "",
          sessionId: newSessionId,
          metadata: {
            mode: data.mode,
            mimeType: data.mimeType,
            detectedSubject: data.detectedSubject
          }
        });

        const firestoreSync = async () => {
          let currentUser = auth.currentUser || user;
          if (!currentUser) {
            try {
              const anonResult = await signInAnonymously(auth);
              currentUser = anonResult.user;
            } catch (err) {
              console.warn("Anonymous authentication failed, using local guest fallback:", err);
              currentUser = {
                uid: "local_guest_student",
                displayName: studentDetails.name || "Guest Student",
                email: null,
                isAnonymous: true,
                emailVerified: false,
              } as any;
              setUser(currentUser);
              localStorage.setItem("local_active_user", JSON.stringify(currentUser));
            }
          }

          if (currentUser) {
            const newSessionObj = {
              sessionId: newSessionId,
              userId: currentUser.uid,
              grade: studentDetails.grade,
              subject: finalSb,
              activeDocumentName: data.filename || "Uploaded Notes",
              activeDocumentMarkdown: data.markdown || "",
              documentMarkdown: data.markdown || "",
              sourceMode: data.mode === "mistake" ? "mistake_vault" : data.mode === "doubt" ? "doubt_solver" : "explainer_doc",
              customBoardContent: "",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            const cachedKey = `pastSessions_${currentUser.uid}`;
            const cachedStr = localStorage.getItem(cachedKey);
            let sessions = [];
            if (cachedStr) {
              try { sessions = JSON.parse(cachedStr); } catch (_) {}
            }
            sessions = [newSessionObj, ...sessions.filter((s: any) => s.sessionId !== newSessionId)];
            safeSavePastSessions(currentUser.uid, sessions);
            setPastSessions(sessions);

            if (currentUser.uid !== "local_guest_student" && !currentUser.uid.startsWith("local_")) {
              const profileRef = doc(db, "studentProfiles", currentUser.uid);
              setDoc(profileRef, { subject: finalSb, updatedAt: serverTimestamp() }, { merge: true })
                .catch(profileErr => console.warn("Could not sync detected subject to student profile:", profileErr));

              const sessionRef = doc(db, "classSessions", newSessionId);
              setDoc(sessionRef, {
                sessionId: newSessionId,
                userId: currentUser.uid,
                grade: studentDetails.grade,
                subject: finalSb,
                activeDocumentName: data.filename || "Uploaded Notes",
                activeDocumentMarkdown: data.markdown || "",
                documentMarkdown: data.markdown || "",
                sourceMode: data.mode === "mistake" ? "mistake_vault" : data.mode === "doubt" ? "doubt_solver" : "explainer_doc",
                customBoardContent: "",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              }).then(() => {
                loadPastSessions(currentUser!.uid);
              }).catch(dbErr => {
                console.warn("Could not sync session to Firestore:", dbErr);
              });
            }
          }
        };
        firestoreSync();

        addToast(data.mode === "socratic"
          ? "Socratic problem deconstruction ready! Press 'Wake Up' to start step-by-step guidance! 🎯🧠"
          : data.mode === "mistake" 
          ? "Calculations notes diagnostic processed. Click 'Wake Up' to check your mistakes! 🔍✨" 
          : "Syllabus document loaded silently in Cherry's memory. Press 'Wake Up' to start the board! 📚✨", "success");
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
      const res = await fetch("/api/clear-document", { method: "POST" });
      const rawText = await res.text();
      let data: any = {};
      if (rawText.trim().startsWith("{")) {
        data = JSON.parse(rawText);
      }
      if (data.success) {
        setActiveDocument(null);
        setUploadedButWaitingWakeup(false);
        setActiveTopicIndex(0);
        setCustomBoardContent("");
        setTopicBoardsContent({});
        addToast("Syllabus cleared. General teaching mode active!", "info");
      } else {
        throw new Error(data.error || "Failed to parse clear-document JSON response.");
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
