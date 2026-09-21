/**
 * useAccountBooksLibrary.ts
 * Custom hook managing book synthesis, snapshot filtering, starred items, and horizontal navigation.
 */
import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  AccountBooksLibraryViewProps,
  BookHubTab,
  LibraryViewMode,
  BookSortOrder,
  ProcessedBook,
} from "./libraryTypes";
import { exportSnapshotsMarkdownAlbum } from "./utils/subjectInferenceUtils";
import {
  buildSynthesizedBooks,
  synthesizeSnapshots,
} from "./utils/bookSynthesisUtils";
import {
  computeBookSubjectCounts,
  filterAndSortBooks,
  computeSnapshotSubjectCounts,
  filterSnapshots,
} from "./utils/libraryFilterUtils";

export const useAccountBooksLibrary = (props: AccountBooksLibraryViewProps) => {
  const {
    pastSessions = [],
    snapshots = [],
    sessionSnapshots = [],
    activeDocument,
    sessionId,
    customBoardContent,
    topicBoardsContent,
    topics,
    subject = "Mathematics",
    grade = "Class 10",
    board = "CBSE",
    studentName = "Scholar",
    getActiveLearningContext,
    activeDesktopTab = "books",
  } = props;

  const [bookHubActiveTab, setBookHubActiveTab] = useState<BookHubTab>("books");
  const [archiveSearchQuery, setArchiveSearchQuery] = useState("");
  const [snapshotSearchQuery, setSnapshotSearchQuery] = useState("");
  const [selectedBookSubjectFilter, setSelectedBookSubjectFilter] = useState<string>("all");
  const [selectedSnapshotSubjectFilter, setSelectedSnapshotSubjectFilter] = useState<string>("all");
  const [booksViewMode, setBooksViewMode] = useState<LibraryViewMode>("grid");
  const [snapshotsViewMode, setSnapshotsViewMode] = useState<LibraryViewMode>("grid");
  const [bookSortOrder, setBookSortOrder] = useState<BookSortOrder>("newest");

  const booksScrollContainerRef = useRef<HTMLDivElement>(null);
  const snapshotScrollContainerRef = useRef<HTMLDivElement>(null);
  const bookSearchInputRef = useRef<HTMLInputElement>(null);

  const [currentBookHorizontalIndex, setCurrentBookHorizontalIndex] = useState(0);
  const [currentSnapshotHorizontalIndex, setCurrentSnapshotHorizontalIndex] = useState(0);

  // Starred / Favorite Books (Persisted)
  const [starredBookIds, setStarredBookIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved =
        typeof window !== "undefined"
          ? localStorage.getItem("cherry_starred_books")
          : null;
      return saved ? JSON.parse(saved) : {};
    } catch (_) {
      return {};
    }
  });

  const toggleStarBook = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setStarredBookIds((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("cherry_starred_books", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  // Keyboard shortcut listener for quick library search (Press "/" or "Ctrl+K")
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        activeDesktopTab === "books" &&
        (e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k"))
      ) {
        if (
          document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "TEXTAREA"
        ) {
          return;
        }
        e.preventDefault();
        bookSearchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeDesktopTab]);

  const handleBooksHorizontalScroll = (direction: "prev" | "next") => {
    if (!booksScrollContainerRef.current) return;
    const container = booksScrollContainerRef.current;
    const itemWidth = container.clientWidth;
    const newScrollLeft =
      direction === "next"
        ? container.scrollLeft + itemWidth
        : container.scrollLeft - itemWidth;
    container.scrollTo({ left: newScrollLeft, behavior: "smooth" });
  };

  const handleSnapshotHorizontalScroll = (direction: "prev" | "next") => {
    if (!snapshotScrollContainerRef.current) return;
    const container = snapshotScrollContainerRef.current;
    const itemWidth = container.clientWidth;
    const newScrollLeft =
      direction === "next"
        ? container.scrollLeft + itemWidth
        : container.scrollLeft - itemWidth;
    container.scrollTo({ left: newScrollLeft, behavior: "smooth" });
  };

  const allBooks = useMemo<ProcessedBook[]>(() => {
    const activeCtx = getActiveLearningContext ? getActiveLearningContext() : null;
    return buildSynthesizedBooks(
      pastSessions,
      activeDocument,
      activeCtx,
      sessionId,
      subject,
      grade,
      board,
      customBoardContent,
      topicBoardsContent,
      topics,
    );
  }, [
    pastSessions,
    subject,
    activeDocument,
    sessionId,
    customBoardContent,
    topicBoardsContent,
    topics,
    grade,
    board,
    getActiveLearningContext,
  ]);

  const bookSubjectCounts = useMemo(
    () => computeBookSubjectCounts(allBooks, starredBookIds),
    [allBooks, starredBookIds],
  );

  const filteredBooks = useMemo(
    () =>
      filterAndSortBooks(
        allBooks,
        selectedBookSubjectFilter,
        archiveSearchQuery,
        bookSortOrder,
        starredBookIds,
      ),
    [allBooks, selectedBookSubjectFilter, archiveSearchQuery, bookSortOrder, starredBookIds],
  );

  const allSnapshots = useMemo(
    () => synthesizeSnapshots(snapshots, sessionSnapshots, subject, grade),
    [snapshots, sessionSnapshots, subject, grade],
  );

  const snapshotSubjectCounts = useMemo(
    () => computeSnapshotSubjectCounts(allSnapshots, subject),
    [allSnapshots, subject],
  );

  const filteredSnapshots = useMemo(
    () =>
      filterSnapshots(
        allSnapshots,
        selectedSnapshotSubjectFilter,
        snapshotSearchQuery,
        subject,
      ),
    [allSnapshots, selectedSnapshotSubjectFilter, snapshotSearchQuery, subject],
  );

  const handleBatchExportSnapshotsMarkdown = () => {
    exportSnapshotsMarkdownAlbum(snapshots, {
      studentName,
      grade,
      board,
      subject,
    });
  };

  return {
    bookHubActiveTab,
    setBookHubActiveTab,
    archiveSearchQuery,
    setArchiveSearchQuery,
    snapshotSearchQuery,
    setSnapshotSearchQuery,
    selectedBookSubjectFilter,
    setSelectedBookSubjectFilter,
    selectedSnapshotSubjectFilter,
    setSelectedSnapshotSubjectFilter,
    booksViewMode,
    setBooksViewMode,
    snapshotsViewMode,
    setSnapshotsViewMode,
    bookSortOrder,
    setBookSortOrder,
    booksScrollContainerRef,
    snapshotScrollContainerRef,
    bookSearchInputRef,
    currentBookHorizontalIndex,
    setCurrentBookHorizontalIndex,
    currentSnapshotHorizontalIndex,
    setCurrentSnapshotHorizontalIndex,
    starredBookIds,
    toggleStarBook,
    handleBooksHorizontalScroll,
    handleSnapshotHorizontalScroll,
    allBooks,
    filteredBooks,
    bookSubjectCounts,
    allSnapshots,
    filteredSnapshots,
    snapshotSubjectCounts,
    handleBatchExportSnapshotsMarkdown,
  };
};
