import { normalizeSubjectName, classifyAcademicDiscipline } from "../services/subjectClassifierService";
import { sliceMarkdownToTopics, generateSourceContentBlock } from "./markdownSlicer";

export { normalizeSubjectName, classifyAcademicDiscipline, sliceMarkdownToTopics, generateSourceContentBlock };

// Key document-driven syllabus store
export interface ActiveDoc {
  filename: string;
  mimeType: string;
  markdown: string;
  mode?: string;
  detectedSubject?: string;
}

export let activeDocument: ActiveDoc | null = null;

export function setGlobalActiveDocument(doc: ActiveDoc | null) {
  activeDocument = doc;
}

// Global memory store for persistent live session state across WebSocket reconnections
export interface SessionBackup {
  history: Array<{ sender: "student" | "cherry"; text: string }>;
  teachingPhase: string;
  whiteboardNotes: string;
  activeTopicIndex?: number;
}

export let activeSessionBackup: SessionBackup = {
  history: [],
  teachingPhase: "intro",
  whiteboardNotes: "",
  activeTopicIndex: 0,
};

export function setGlobalActiveSessionBackup(backup: SessionBackup) {
  activeSessionBackup = backup;
}

export interface SessionState {
  activeDocument: ActiveDoc | null;
  activeSessionBackup: SessionBackup;
}

export const MAX_SESSIONS = 200;
export const sessions = new Map<string, SessionState>();

export function getOrCreateSession(sessionId?: string | null): SessionState {
  const sid = (sessionId && typeof sessionId === "string") ? sessionId.slice(0, 128) : "default";
  if (!sessions.has(sid)) {
    // Evict oldest session if limit exceeded (FIFO protection against unbounded memory exhaustion)
    if (sessions.size >= MAX_SESSIONS) {
      const oldestKey = sessions.keys().next().value;
      if (oldestKey && oldestKey !== "default") {
        sessions.delete(oldestKey);
      }
    }
    sessions.set(sid, {
      activeDocument: null,
      activeSessionBackup: {
        history: [],
        teachingPhase: "intro",
        whiteboardNotes: "",
        activeTopicIndex: 0,
      }
    });
  }
  return sessions.get(sid)!;
}
