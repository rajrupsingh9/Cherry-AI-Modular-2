import { safeGetItem, safeSetItem } from "./safeStorage";

export interface ActiveLearningContext {
  sourceMode?: string;
  title?: string;
  sessionId?: string;
  lastUpdated?: number;
  subject?: string;
  grade?: string;
  board?: string;
  mediumOfLearning?: string;
  documentMarkdown?: string;
  blackboardContent?: string;
  topics?: string[];
  metadata?: any;
  updatedAt?: number;
  [key: string]: any;
}

const ACTIVE_LEARNING_KEY = "cherry_active_learning_context";

export function saveActiveLearningContext(context: Partial<ActiveLearningContext>): void {
  try {
    const existing = getActiveLearningContext() || {};
    const updated = {
      ...existing,
      ...context,
      updatedAt: Date.now(),
    };
    safeSetItem(ACTIVE_LEARNING_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("[ActiveLearningStore] Failed to save context:", e);
  }
}

export function getActiveLearningContext(): ActiveLearningContext | null {
  try {
    const raw = safeGetItem(ACTIVE_LEARNING_KEY, "");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("[ActiveLearningStore] Failed to parse context:", e);
    return null;
  }
}

export function getUnifiedRevisionPayload(sess: any): {
  sessionTitle: string;
  subject: string;
  topics: string[];
  sourceMode: string;
  combinedContent: string;
} {
  const sessionTitle = sess?.activeDocumentName || sess?.topicTitle || sess?.subject || "Active Study Session";
  const subject = sess?.subject || "Science";
  const topics = sess?.topics || [sessionTitle];
  const sourceMode = sess?.sourceMode || "interactive";
  const combinedContent = sess?.whiteboardNotes || sess?.blackboardContent || sess?.documentMarkdown || "";

  return {
    sessionTitle,
    subject,
    topics,
    sourceMode,
    combinedContent,
  };
}
