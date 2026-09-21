/**
 * InAppBookReaderModal.tsx
 * Thin Core Orchestrator for the In-App Chapter Book Reader Modal (< 100 LOC).
 * Deconstructed into modular sub-components in `./account/reader/`.
 */
import React from "react";
import { createPortal } from "react-dom";
import {
  InAppBookReaderModalProps,
  useInAppBookReader,
  ReaderHeader,
  ReaderSidebar,
  ReaderFormulasView,
  ReaderDocumentView,
} from "./account/reader";

export { type InAppBookReaderModalProps } from "./account/reader";

export const InAppBookReaderModal: React.FC<InAppBookReaderModalProps> = (props) => {
  const { isOpen, book, onClose, onOpenRevisionDeck, onDiscussWithCherry } = props;
  const r = useInAppBookReader(props);

  if (!isOpen || !book) return null;

  const readerModalNode = (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[9999] p-0 sm:p-3 md:p-5 animate-fade-in select-none">
      <div
        className={`w-full ${
          r.isFullscreen
            ? "max-w-none h-full rounded-none"
            : "max-w-7xl h-full sm:h-[95vh] rounded-none sm:rounded-3xl"
        } border ${r.themeClasses.cardBorder} ${r.themeClasses.modalBg} flex flex-col overflow-hidden shadow-2xl transition-all duration-200 relative`}
      >
        {/* Top Reading Navigation Bar */}
        <ReaderHeader
          book={book}
          subject={r.subject}
          chaptersCount={r.chapters.length}
          totalEstMins={r.totalEstMins}
          progressPercent={r.progressPercent}
          isSidebarOpen={r.isSidebarOpen}
          setIsSidebarOpen={r.setIsSidebarOpen}
          activeTab={r.activeTab}
          setActiveTab={r.setActiveTab}
          allBookFormulasCount={r.allBookFormulas.length}
          isSpeaking={r.isSpeaking}
          isPaused={r.isPaused}
          speechRate={r.speechRate}
          handleToggleSpeech={r.handleToggleSpeech}
          handleCycleSpeechRate={r.handleCycleSpeechRate}
          stopSpeech={r.stopSpeech}
          isGeneratingPodcast={r.isGeneratingPodcast}
          handleTriggerBookPodcast={r.handleTriggerBookPodcast}
          theme={r.theme}
          setTheme={r.setTheme}
          fontFamily={r.fontFamily}
          setFontFamily={r.setFontFamily}
          fontSize={r.fontSize}
          setFontSize={r.setFontSize}
          readingLayout={r.readingLayout}
          setReadingLayout={r.setReadingLayout}
          isFullscreen={r.isFullscreen}
          setIsFullscreen={r.setIsFullscreen}
          copied={r.copied}
          handleCopyChapter={r.handleCopyChapter}
          handleExportFullHandbookMarkdown={r.handleExportFullHandbookMarkdown}
          onOpenRevisionDeck={onOpenRevisionDeck}
          onClose={onClose}
          themeClasses={r.themeClasses}
        />

        {/* Main Body: Collapsible Chapter Sidebar + Reader Document Canvas */}
        <div className="flex-1 flex overflow-hidden relative">
          <ReaderSidebar
            isSidebarOpen={r.isSidebarOpen}
            searchQuery={r.searchQuery}
            setSearchQuery={r.setSearchQuery}
            filteredChapters={r.filteredChapters}
            activeChapterIndex={r.activeChapterIndex}
            setActiveChapterIndex={r.setActiveChapterIndex}
            completedChapters={r.completedChapters}
            toggleChapterCompleted={r.toggleChapterCompleted}
            bookmarkedChapters={r.bookmarkedChapters}
            toggleChapterBookmark={r.toggleChapterBookmark}
            totalFormulas={r.totalFormulas}
            completedCount={r.completedCount}
            chaptersCount={r.chapters.length}
            isSpeaking={r.isSpeaking}
            stopSpeech={r.stopSpeech}
            themeClasses={r.themeClasses}
          />

          {/* Main Reading Stage */}
          <main className={`flex-1 flex flex-col overflow-hidden ${r.themeClasses.contentBg}`}>
            {r.activeTab === "formulas" ? (
              <ReaderFormulasView
                allBookFormulas={r.allBookFormulas}
                setActiveTab={r.setActiveTab}
                setActiveChapterIndex={r.setActiveChapterIndex}
                handleCopyFormula={r.handleCopyFormula}
                copiedFormulaIdx={r.copiedFormulaIdx}
                onDiscussWithCherry={onDiscussWithCherry}
                stopSpeech={r.stopSpeech}
                onClose={onClose}
                subject={r.subject}
                themeClasses={r.themeClasses}
              />
            ) : (
              <ReaderDocumentView
                currentChapter={r.currentChapter}
                activeChapterIndex={r.activeChapterIndex}
                setActiveChapterIndex={r.setActiveChapterIndex}
                chaptersCount={r.chapters.length}
                bookmarkedChapters={r.bookmarkedChapters}
                toggleChapterBookmark={r.toggleChapterBookmark}
                completedChapters={r.completedChapters}
                toggleChapterCompleted={r.toggleChapterCompleted}
                copied={r.copied}
                handleCopyChapter={r.handleCopyChapter}
                readingLayout={r.readingLayout}
                fontFamilyClasses={r.fontFamilyClasses}
                fontClasses={r.fontClasses}
                theme={r.theme}
                themeClasses={r.themeClasses}
                isSpeaking={r.isSpeaking}
                isPaused={r.isPaused}
                speechRate={r.speechRate}
                handleToggleSpeech={r.handleToggleSpeech}
                stopSpeech={r.stopSpeech}
                onDiscussWithCherry={onDiscussWithCherry}
                onClose={onClose}
                subject={r.subject}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(readerModalNode, document.body);
  }
  return readerModalNode;
};
