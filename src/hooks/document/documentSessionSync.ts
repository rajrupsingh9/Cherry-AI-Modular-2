import { auth, db } from "../../lib/firebase";
import { signInAnonymously } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { safeSavePastSessions } from "../../utils/safeStorage";
import { saveActiveLearningContext } from "../../utils/activeLearningStore";
import { UploadFileResult } from "./documentUploadService";

export interface SyncSessionDocOptions {
  data: UploadFileResult;
  studentDetails: { name: string; grade: string; subject: string; board?: string; mediumOfLearning?: string };
  finalSubject: string;
  newSessionId: string;
  user: any;
  setUser: (u: any) => void;
  setPastSessions: (sessions: any[]) => void;
  loadPastSessions: (uid: string) => Promise<void>;
}

export async function syncDocumentToSessionAndCloud({
  data,
  studentDetails,
  finalSubject,
  newSessionId,
  user,
  setUser,
  setPastSessions,
  loadPastSessions,
}: SyncSessionDocOptions) {
  saveActiveLearningContext({
    sourceMode: data.mode === "mistake" ? "mistake_vault" : data.mode === "doubt" ? "doubt_solver" : "explainer_doc",
    title: data.filename || "Uploaded Notes Document",
    subject: finalSubject,
    grade: studentDetails.grade,
    board: studentDetails.board,
    mediumOfLearning: studentDetails.mediumOfLearning,
    documentMarkdown: data.markdown || "",
    blackboardContent: "",
    sessionId: newSessionId,
    metadata: {
      mode: data.mode,
      mimeType: data.mimeType,
      detectedSubject: data.detectedSubject,
    },
  });

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
      subject: finalSubject,
      activeDocumentName: data.filename || "Uploaded Notes",
      activeDocumentMarkdown: data.markdown || "",
      documentMarkdown: data.markdown || "",
      sourceMode: data.mode === "mistake" ? "mistake_vault" : data.mode === "doubt" ? "doubt_solver" : "explainer_doc",
      customBoardContent: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const cachedKey = `pastSessions_${currentUser.uid}`;
    const cachedStr = localStorage.getItem(cachedKey);
    let sessions = [];
    if (cachedStr) {
      try {
        sessions = JSON.parse(cachedStr);
      } catch (_) {}
    }
    sessions = [newSessionObj, ...sessions.filter((s: any) => s.sessionId !== newSessionId)];
    safeSavePastSessions(currentUser.uid, sessions);
    setPastSessions(sessions);

    if (currentUser.uid !== "local_guest_student" && !currentUser.uid.startsWith("local_")) {
      const profileRef = doc(db, "studentProfiles", currentUser.uid);
      setDoc(profileRef, { subject: finalSubject, updatedAt: serverTimestamp() }, { merge: true }).catch((profileErr) =>
        console.warn("Could not sync detected subject to student profile:", profileErr)
      );

      const sessionRef = doc(db, "classSessions", newSessionId);
      setDoc(sessionRef, {
        sessionId: newSessionId,
        userId: currentUser.uid,
        grade: studentDetails.grade,
        subject: finalSubject,
        activeDocumentName: data.filename || "Uploaded Notes",
        activeDocumentMarkdown: data.markdown || "",
        documentMarkdown: data.markdown || "",
        sourceMode: data.mode === "mistake" ? "mistake_vault" : data.mode === "doubt" ? "doubt_solver" : "explainer_doc",
        customBoardContent: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
        .then(() => {
          loadPastSessions(currentUser!.uid);
        })
        .catch((dbErr) => {
          console.warn("Could not sync session to Firestore:", dbErr);
        });
    }
  }
}

export async function clearDocumentOnServer(): Promise<boolean> {
  const res = await fetch("/api/clear-document", { method: "POST" });
  const rawText = await res.text();
  let data: any = {};
  if (rawText.trim().startsWith("{")) {
    data = JSON.parse(rawText);
  }
  return !!data.success;
}
