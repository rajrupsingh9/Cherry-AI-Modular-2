/**
 * bookSynthesisUtils.ts
 * Logic for synthesizing active sessions, past sessions, formatting lecture dates, and deduplicating board snapshots.
 */
import { BoardSnapshot } from "../../accountTypes";
import { ProcessedBook } from "../libraryTypes";
import { inferBookSubject, inferSnapshotSubject } from "./subjectInferenceUtils";

export const formatSessionDate = (creationDate: any, isLiveActive: boolean): string => {
  if (isLiveActive) return "🟢 Active Now (Live Context)";
  if (!creationDate) return "Recently Synced";

  try {
    const date = creationDate.toDate
      ? creationDate.toDate()
      : new Date(
          creationDate.seconds ? creationDate.seconds * 1000 : creationDate,
        );
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const dayVal = String(date.getDate()).padStart(2, "0");
    const monthVal = months[date.getMonth()];
    const yearVal = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeVal = `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
    return `${dayVal} ${monthVal} ${yearVal}, ${timeVal}`;
  } catch {
    return "Recently Synced";
  }
};

export const buildSynthesizedBooks = (
  pastSessions: any[],
  activeDocument: any,
  activeCtx: any,
  sessionId?: string,
  subject = "Mathematics",
  grade = "Class 10",
  board = "CBSE",
  customBoardContent = "",
  topicBoardsContent?: Record<number, string>,
  topics?: string[],
): ProcessedBook[] => {
  const existingSessionIds = new Set(
    pastSessions.map((s) => s.sessionId).filter(Boolean),
  );
  const existingDocNames = new Set(
    pastSessions.map((s) => s.activeDocumentName).filter(Boolean),
  );

  const synthesizedActiveBooks: any[] = [];
  if (activeDocument && (activeDocument.markdown || activeDocument.filename)) {
    const docName = activeDocument.filename || "Active Study Document";
    if (
      !existingDocNames.has(docName) &&
      (!sessionId || !existingSessionIds.has(sessionId))
    ) {
      synthesizedActiveBooks.push({
        sessionId: sessionId || "active_live_session",
        isLiveActive: true,
        activeDocumentName: docName,
        activeDocumentMarkdown: activeDocument.markdown || "",
        documentMarkdown: activeDocument.markdown || "",
        sourceMode:
          activeDocument.mimeType === "video/youtube"
            ? "explainer_youtube"
            : "explainer_doc",
        subject: activeDocument.detectedSubject || subject,
        grade,
        board,
        customBoardContent,
        topicBoardsContent,
        topics: topics && topics.length > 0 ? topics : [docName],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  } else if (
    activeCtx &&
    (activeCtx.documentMarkdown || activeCtx.blackboardContent) &&
    activeCtx.sessionId &&
    !existingSessionIds.has(activeCtx.sessionId)
  ) {
    synthesizedActiveBooks.push({
      sessionId: activeCtx.sessionId,
      isLiveActive: true,
      activeDocumentName: activeCtx.title || "Active Learning Session",
      activeDocumentMarkdown: activeCtx.documentMarkdown || "",
      documentMarkdown: activeCtx.documentMarkdown || "",
      sourceMode: activeCtx.sourceMode || "live_blackboard",
      subject: activeCtx.subject || subject,
      grade: activeCtx.grade || grade,
      board: activeCtx.board || board,
      customBoardContent:
        activeCtx.blackboardContent || customBoardContent || "",
      topicBoardsContent,
      topics:
        activeCtx.topics && activeCtx.topics.length > 0
          ? activeCtx.topics
          : topics || [],
      createdAt: activeCtx.lastUpdated || new Date().toISOString(),
      updatedAt: activeCtx.lastUpdated || new Date().toISOString(),
    });
  }

  const combinedList = [...synthesizedActiveBooks, ...pastSessions];

  return combinedList.map((sess, index) => {
    const originalTitle =
      sess.activeDocumentName ||
      sess.title ||
      `Class Lecture Hand-Handbook #${combinedList.length - index}`;
    const creationDate = sess.createdAt || sess.updatedAt;
    const isLiveActive = !!sess.isLiveActive;
    const dateString = formatSessionDate(creationDate, isLiveActive);

    return {
      ...sess,
      sessionId: sess.sessionId || sess.id || `book_${combinedList.length - index}`,
      processedTitle: originalTitle,
      formattedDateTime: dateString,
      index: combinedList.length - index,
      inferredSubject: inferBookSubject(sess, subject),
      sourceMode:
        sess.sourceMode ||
        (sess.mimeType === "video/youtube" ||
        (sess.activeDocumentName && sess.activeDocumentName.includes("YouTube"))
          ? "explainer_youtube"
          : sess.documentMarkdown || sess.activeDocumentMarkdown
            ? "explainer_doc"
            : "live_blackboard"),
      documentMarkdown:
        sess.documentMarkdown || sess.activeDocumentMarkdown || "",
      activeDocumentMarkdown:
        sess.activeDocumentMarkdown || sess.documentMarkdown || "",
    };
  });
};

export const synthesizeSnapshots = (
  snapshots: any[],
  sessionSnapshots: any[] | undefined,
  subject = "Science",
  grade = "Class 10",
): BoardSnapshot[] => {
  const combined: BoardSnapshot[] = [];
  const pushIfUnique = (s: any) => {
    if (!s || !s.imgData) return;
    const sub = inferSnapshotSubject(s, subject);
    const existingIdx = combined.findIndex(
      (fb) =>
        fb.snapshotId === s.snapshotId ||
        (typeof s.topicIndex === "number" &&
          typeof fb.topicIndex === "number" &&
          fb.topicIndex === s.topicIndex &&
          fb.subject?.toLowerCase() === sub.toLowerCase()) ||
        (fb.topicTitle?.trim().toLowerCase() ===
          (s.topicTitle || "").trim().toLowerCase() &&
          fb.subject?.toLowerCase() === sub.toLowerCase()),
    );

    const normalized: BoardSnapshot = {
      id:
        s.id ||
        `snap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      snapshotId: s.snapshotId || s.id || `snap_${Date.now()}`,
      userId: s.userId || "",
      topicTitle: s.topicTitle || "Classroom Board Snapshot",
      description:
        s.description || "Interactive calculation whiteboard screenshot.",
      imgData: s.imgData,
      subject: sub,
      grade: s.grade || grade,
      topicIndex: typeof s.topicIndex === "number" ? s.topicIndex : undefined,
      timestamp: s.timestamp,
    };

    if (existingIdx >= 0) {
      combined[existingIdx] = normalized;
    } else {
      combined.push(normalized);
    }
  };

  snapshots.forEach(pushIfUnique);
  if (sessionSnapshots && sessionSnapshots.length > 0) {
    sessionSnapshots.forEach(pushIfUnique);
  }
  return combined;
};
