/**
 * useReaderProgress.ts
 * Sub-hook for reading and persisting chapter completion statuses and bookmarks to localStorage.
 */
import { useState, useEffect } from "react";

interface UseReaderProgressParams {
  isOpen: boolean;
  bookId: string;
  onResetActiveChapter: () => void;
}

export const useReaderProgress = ({
  isOpen,
  bookId,
  onResetActiveChapter,
}: UseReaderProgressParams) => {
  const [completedChapters, setCompletedChapters] = useState<Record<number, boolean>>({});
  const [bookmarkedChapters, setBookmarkedChapters] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!isOpen) return;
    try {
      const savedCompleted = localStorage.getItem(`book_progress_${bookId}`);
      if (savedCompleted) {
        setCompletedChapters(JSON.parse(savedCompleted));
      }
      const savedBookmarks = localStorage.getItem(`book_bookmarks_${bookId}`);
      if (savedBookmarks) {
        setBookmarkedChapters(JSON.parse(savedBookmarks));
      }
    } catch (_) {}
    onResetActiveChapter();
  }, [isOpen, bookId]);

  const toggleChapterCompleted = (idx: number) => {
    setCompletedChapters((prev) => {
      const updated = { ...prev, [idx]: !prev[idx] };
      try {
        localStorage.setItem(`book_progress_${bookId}`, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const toggleChapterBookmark = (idx: number) => {
    setBookmarkedChapters((prev) => {
      const updated = { ...prev, [idx]: !prev[idx] };
      try {
        localStorage.setItem(`book_bookmarks_${bookId}`, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  return {
    completedChapters,
    bookmarkedChapters,
    toggleChapterCompleted,
    toggleChapterBookmark,
  };
};
