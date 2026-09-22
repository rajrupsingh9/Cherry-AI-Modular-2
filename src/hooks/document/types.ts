import React from "react";

export interface ActiveDocumentState {
  filename: string;
  mimeType: string;
  markdown: string;
  mode?: string;
  detectedSubject?: string;
}

export interface UseDocumentSyncProps {
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
