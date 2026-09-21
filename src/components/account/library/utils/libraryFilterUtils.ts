/**
 * libraryFilterUtils.ts
 * Filtering, sorting, and count calculations for Chapter Books and Board Slates.
 */
import { BoardSnapshot } from "../../accountTypes";
import { BookSortOrder, ProcessedBook } from "../libraryTypes";
import { inferSnapshotSubject } from "./subjectInferenceUtils";

export const computeBookSubjectCounts = (
  allBooks: ProcessedBook[],
  starredBookIds: Record<string, boolean>,
): Record<string, number> => {
  const counts: Record<string, number> = {
    all: allBooks.length,
    starred: 0,
    Mathematics: 0,
    Physics: 0,
    Chemistry: 0,
    Biology: 0,
    Science: 0,
  };
  allBooks.forEach((b) => {
    const subj = b.inferredSubject;
    counts[subj] = (counts[subj] || 0) + 1;
    const bKey = b.sessionId || b.id || `book_${b.index}`;
    if (starredBookIds[bKey]) {
      counts.starred = (counts.starred || 0) + 1;
    }
  });
  return counts;
};

export const filterAndSortBooks = (
  allBooks: ProcessedBook[],
  selectedBookSubjectFilter: string,
  archiveSearchQuery: string,
  bookSortOrder: BookSortOrder,
  starredBookIds: Record<string, boolean>,
): ProcessedBook[] => {
  let result = [...allBooks];
  if (selectedBookSubjectFilter === "starred") {
    result = result.filter(
      (b) => !!starredBookIds[b.sessionId || b.id || `book_${b.index}`],
    );
  } else if (selectedBookSubjectFilter !== "all") {
    result = result.filter(
      (b) =>
        b.inferredSubject.toLowerCase() ===
        selectedBookSubjectFilter.toLowerCase(),
    );
  }
  if (archiveSearchQuery.trim()) {
    const q = archiveSearchQuery.toLowerCase();
    result = result.filter(
      (b) =>
        (b.processedTitle && b.processedTitle.toLowerCase().includes(q)) ||
        (b.inferredSubject && b.inferredSubject.toLowerCase().includes(q)) ||
        (b.formattedDateTime &&
          b.formattedDateTime.toLowerCase().includes(q)) ||
        (Array.isArray(b.topics) &&
          b.topics.some((t: string) => t.toLowerCase().includes(q))),
    );
  }
  if (bookSortOrder === "oldest") {
    result = [...result].reverse();
  } else if (bookSortOrder === "title") {
    result = [...result].sort((a, b) =>
      (a.processedTitle || "").localeCompare(b.processedTitle || ""),
    );
  } else if (bookSortOrder === "topics") {
    result = [...result].sort(
      (a, b) => (b.topics?.length || 1) - (a.topics?.length || 1),
    );
  }
  return result;
};

export const computeSnapshotSubjectCounts = (
  allSnapshots: BoardSnapshot[],
  subject = "Mathematics",
): Record<string, number> => {
  const counts: Record<string, number> = {
    all: allSnapshots.length,
    Mathematics: 0,
    Physics: 0,
    Chemistry: 0,
    Biology: 0,
    Science: 0,
    General: 0,
  };
  allSnapshots.forEach((snap) => {
    const subj = inferSnapshotSubject(snap, subject);
    counts[subj] = (counts[subj] || 0) + 1;
  });
  return counts;
};

export const filterSnapshots = (
  allSnapshots: BoardSnapshot[],
  selectedSnapshotSubjectFilter: string,
  snapshotSearchQuery: string,
  subject = "Mathematics",
): BoardSnapshot[] => {
  let result = allSnapshots;
  if (selectedSnapshotSubjectFilter !== "all") {
    result = result.filter(
      (s) =>
        inferSnapshotSubject(s, subject).toLowerCase() ===
        selectedSnapshotSubjectFilter.toLowerCase(),
    );
  }
  if (snapshotSearchQuery.trim()) {
    const q = snapshotSearchQuery.toLowerCase();
    result = result.filter(
      (s) =>
        (s.topicTitle && s.topicTitle.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.subject && s.subject.toLowerCase().includes(q)),
    );
  }
  return result;
};
