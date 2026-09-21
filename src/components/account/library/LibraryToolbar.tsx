/**
 * LibraryToolbar.tsx
 * Floating filter and search toolbar composing LibrarySearchControls and LibrarySubjectFilterPills.
 */
import React from "react";
import { BookHubTab, LibraryViewMode, BookSortOrder } from "./libraryTypes";
import { LibrarySearchControls } from "./LibrarySearchControls";
import { LibrarySubjectFilterPills } from "./LibrarySubjectFilterPills";

interface LibraryToolbarProps {
  bookHubActiveTab: BookHubTab;
  archiveSearchQuery: string;
  setArchiveSearchQuery: (q: string) => void;
  snapshotSearchQuery: string;
  setSnapshotSearchQuery: (q: string) => void;
  bookSearchInputRef: React.RefObject<HTMLInputElement | null>;
  bookSortOrder: BookSortOrder;
  setBookSortOrder: (order: BookSortOrder) => void;
  booksViewMode: LibraryViewMode;
  setBooksViewMode: (m: LibraryViewMode) => void;
  snapshotsViewMode: LibraryViewMode;
  setSnapshotsViewMode: (m: LibraryViewMode) => void;
  currentBookHorizontalIndex: number;
  setCurrentBookHorizontalIndex: (idx: number) => void;
  handleBooksHorizontalScroll: (dir: "prev" | "next") => void;
  filteredBooksLength: number;
  allBooksLength: number;
  currentSnapshotHorizontalIndex: number;
  setCurrentSnapshotHorizontalIndex: (idx: number) => void;
  handleSnapshotHorizontalScroll: (dir: "prev" | "next") => void;
  filteredSnapshotsLength: number;
  handleBatchExportSnapshotsMarkdown: () => void;
  selectedBookSubjectFilter: string;
  setSelectedBookSubjectFilter: (filter: string) => void;
  selectedSnapshotSubjectFilter: string;
  setSelectedSnapshotSubjectFilter: (filter: string) => void;
  bookSubjectCounts: Record<string, number>;
  snapshotSubjectCounts: Record<string, number>;
  starredBookIds: Record<string, boolean>;
  subject?: string;
}

export const LibraryToolbar: React.FC<LibraryToolbarProps> = ({
  bookHubActiveTab,
  archiveSearchQuery,
  setArchiveSearchQuery,
  snapshotSearchQuery,
  setSnapshotSearchQuery,
  bookSearchInputRef,
  bookSortOrder,
  setBookSortOrder,
  booksViewMode,
  setBooksViewMode,
  snapshotsViewMode,
  setSnapshotsViewMode,
  currentBookHorizontalIndex,
  setCurrentBookHorizontalIndex,
  handleBooksHorizontalScroll,
  filteredBooksLength,
  allBooksLength,
  currentSnapshotHorizontalIndex,
  setCurrentSnapshotHorizontalIndex,
  handleSnapshotHorizontalScroll,
  filteredSnapshotsLength,
  handleBatchExportSnapshotsMarkdown,
  selectedBookSubjectFilter,
  setSelectedBookSubjectFilter,
  selectedSnapshotSubjectFilter,
  setSelectedSnapshotSubjectFilter,
  bookSubjectCounts,
  snapshotSubjectCounts,
  starredBookIds,
  subject,
}) => {
  const activeSearch =
    bookHubActiveTab === "books" ? archiveSearchQuery : snapshotSearchQuery;

  const handleSearchChange = (val: string) => {
    if (bookHubActiveTab === "books") {
      setArchiveSearchQuery(val);
      setCurrentBookHorizontalIndex(0);
    } else {
      setSnapshotSearchQuery(val);
      setCurrentSnapshotHorizontalIndex(0);
    }
  };

  const handleClearSearch = () => {
    if (bookHubActiveTab === "books") {
      setArchiveSearchQuery("");
      setCurrentBookHorizontalIndex(0);
    } else {
      setSnapshotSearchQuery("");
      setCurrentSnapshotHorizontalIndex(0);
    }
  };

  const handleResetFilters = () => {
    if (bookHubActiveTab === "books") {
      setSelectedBookSubjectFilter("all");
      setArchiveSearchQuery("");
    } else {
      setSelectedSnapshotSubjectFilter("all");
      setSnapshotSearchQuery("");
    }
  };

  const hasActiveFilter =
    bookHubActiveTab === "books"
      ? selectedBookSubjectFilter !== "all" || archiveSearchQuery
      : selectedSnapshotSubjectFilter !== "all" || snapshotSearchQuery;

  return (
    <div className="bg-white border border-[#EFF1F5]/80 rounded-2xl p-3 shadow-xs space-y-3">
      {/* 1. Top Controls Row: Search, View Mode, Sort, Stepper */}
      <LibrarySearchControls
        bookHubActiveTab={bookHubActiveTab}
        activeSearch={activeSearch}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        bookSearchInputRef={bookSearchInputRef}
        bookSortOrder={bookSortOrder}
        setBookSortOrder={setBookSortOrder}
        booksViewMode={booksViewMode}
        setBooksViewMode={setBooksViewMode}
        snapshotsViewMode={snapshotsViewMode}
        setSnapshotsViewMode={setSnapshotsViewMode}
        currentBookHorizontalIndex={currentBookHorizontalIndex}
        handleBooksHorizontalScroll={handleBooksHorizontalScroll}
        filteredBooksLength={filteredBooksLength}
        currentSnapshotHorizontalIndex={currentSnapshotHorizontalIndex}
        handleSnapshotHorizontalScroll={handleSnapshotHorizontalScroll}
        filteredSnapshotsLength={filteredSnapshotsLength}
        handleBatchExportSnapshotsMarkdown={handleBatchExportSnapshotsMarkdown}
      />

      {/* 2. Bottom Subject & Starred Filter Pills */}
      <LibrarySubjectFilterPills
        bookHubActiveTab={bookHubActiveTab}
        selectedBookSubjectFilter={selectedBookSubjectFilter}
        setSelectedBookSubjectFilter={setSelectedBookSubjectFilter}
        selectedSnapshotSubjectFilter={selectedSnapshotSubjectFilter}
        setSelectedSnapshotSubjectFilter={setSelectedSnapshotSubjectFilter}
        bookSubjectCounts={bookSubjectCounts}
        snapshotSubjectCounts={snapshotSubjectCounts}
        starredBookIds={starredBookIds}
        allBooksLength={allBooksLength}
        subject={subject}
        hasActiveFilter={hasActiveFilter}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
};
