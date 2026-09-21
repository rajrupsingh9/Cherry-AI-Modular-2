/**
 * AccountBooksLibraryView.tsx
 * Thin Core Orchestrator for the Chapter Books & Board Slates Library Hub (< 100 LOC).
 * Deconstructed into modular sub-components in `./library/`.
 */
import React from "react";
import {
  AccountBooksLibraryViewProps,
  useAccountBooksLibrary,
  LibraryHeroHeader,
  LibraryToolbar,
  BooksGridList,
  SnapshotsGridList,
} from "./library";

export const AccountBooksLibraryView: React.FC<AccountBooksLibraryViewProps> = (props) => {
  const {
    studentName,
    grade,
    board,
    subject,
    mediumOfLearning,
    onOpenBookReader,
    onTriggerBookPodcast,
    generatingPodcastBookId,
    onExportSessionToPDF,
    onOpenSnapshotModal,
    onDeleteSnapshot,
    snapshots,
  } = props;

  const lib = useAccountBooksLibrary(props);

  return (
    <div className="space-y-4">
      {/* 1. Hero Banner with Student Context & 2-Way View Switcher */}
      <LibraryHeroHeader
        studentName={studentName}
        grade={grade}
        board={board}
        mediumOfLearning={mediumOfLearning}
        bookHubActiveTab={lib.bookHubActiveTab}
        setBookHubActiveTab={lib.setBookHubActiveTab}
        allBooks={lib.allBooks}
        allSnapshots={lib.allSnapshots}
        bookSubjectCounts={lib.bookSubjectCounts}
      />

      {/* 2. Floating Search, View Toggles & Subject Filter Toolbar */}
      <LibraryToolbar
        bookHubActiveTab={lib.bookHubActiveTab}
        archiveSearchQuery={lib.archiveSearchQuery}
        setArchiveSearchQuery={lib.setArchiveSearchQuery}
        snapshotSearchQuery={lib.snapshotSearchQuery}
        setSnapshotSearchQuery={lib.setSnapshotSearchQuery}
        bookSearchInputRef={lib.bookSearchInputRef}
        bookSortOrder={lib.bookSortOrder}
        setBookSortOrder={lib.setBookSortOrder}
        booksViewMode={lib.booksViewMode}
        setBooksViewMode={lib.setBooksViewMode}
        snapshotsViewMode={lib.snapshotsViewMode}
        setSnapshotsViewMode={lib.setSnapshotsViewMode}
        currentBookHorizontalIndex={lib.currentBookHorizontalIndex}
        setCurrentBookHorizontalIndex={lib.setCurrentBookHorizontalIndex}
        handleBooksHorizontalScroll={lib.handleBooksHorizontalScroll}
        filteredBooksLength={lib.filteredBooks.length}
        allBooksLength={lib.allBooks.length}
        currentSnapshotHorizontalIndex={lib.currentSnapshotHorizontalIndex}
        setCurrentSnapshotHorizontalIndex={lib.setCurrentSnapshotHorizontalIndex}
        handleSnapshotHorizontalScroll={lib.handleSnapshotHorizontalScroll}
        filteredSnapshotsLength={lib.filteredSnapshots.length}
        handleBatchExportSnapshotsMarkdown={lib.handleBatchExportSnapshotsMarkdown}
        selectedBookSubjectFilter={lib.selectedBookSubjectFilter}
        setSelectedBookSubjectFilter={lib.setSelectedBookSubjectFilter}
        selectedSnapshotSubjectFilter={lib.selectedSnapshotSubjectFilter}
        setSelectedSnapshotSubjectFilter={lib.setSelectedSnapshotSubjectFilter}
        bookSubjectCounts={lib.bookSubjectCounts}
        snapshotSubjectCounts={lib.snapshotSubjectCounts}
        starredBookIds={lib.starredBookIds}
        subject={subject}
      />

      {/* 3. Active Viewport: Chapter Books or Board Slates */}
      {lib.bookHubActiveTab === "books" ? (
        <BooksGridList
          allBooks={lib.allBooks}
          filteredBooks={lib.filteredBooks}
          booksViewMode={lib.booksViewMode}
          booksScrollContainerRef={lib.booksScrollContainerRef}
          archiveSearchQuery={lib.archiveSearchQuery}
          selectedBookSubjectFilter={lib.selectedBookSubjectFilter}
          starredBookIds={lib.starredBookIds}
          toggleStarBook={lib.toggleStarBook}
          onOpenBookReader={onOpenBookReader}
          onTriggerBookPodcast={onTriggerBookPodcast}
          generatingPodcastBookId={generatingPodcastBookId}
          onExportSessionToPDF={onExportSessionToPDF}
          subject={subject}
          onResetFilters={() => {
            lib.setArchiveSearchQuery("");
            lib.setSelectedBookSubjectFilter("all");
          }}
        />
      ) : (
        <SnapshotsGridList
          snapshots={snapshots}
          filteredSnapshots={lib.filteredSnapshots}
          snapshotsViewMode={lib.snapshotsViewMode}
          snapshotScrollContainerRef={lib.snapshotScrollContainerRef}
          snapshotSearchQuery={lib.snapshotSearchQuery}
          subject={subject}
          onOpenSnapshotModal={onOpenSnapshotModal}
          onDeleteSnapshot={onDeleteSnapshot}
        />
      )}
    </div>
  );
};
