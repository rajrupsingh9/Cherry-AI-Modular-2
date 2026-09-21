/**
 * ReaderHeader.tsx
 * Top navigation toolbar orchestrating metadata, audio narration, tabs, and styling controls.
 */
import React from "react";
import { BookOpen, Sigma } from "lucide-react";
import {
  ReaderTab,
  ReaderTheme,
  ReaderFontFamily,
  ReaderFontSize,
  ReaderLayout,
  ThemeStyleClasses,
} from "./readerTypes";
import { ReaderHeaderMeta } from "./header/ReaderHeaderMeta";
import { ReaderHeaderAudioControls } from "./header/ReaderHeaderAudioControls";
import { ReaderHeaderStyleControls } from "./header/ReaderHeaderStyleControls";

interface ReaderHeaderProps {
  book: any;
  subject: string;
  chaptersCount: number;
  totalEstMins: number;
  progressPercent: number;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: ReaderTab;
  setActiveTab: (tab: ReaderTab) => void;
  allBookFormulasCount: number;
  isSpeaking: boolean;
  isPaused: boolean;
  speechRate: number;
  handleToggleSpeech: () => void;
  handleCycleSpeechRate: () => void;
  stopSpeech: () => void;
  isGeneratingPodcast: boolean;
  handleTriggerBookPodcast: () => void;
  theme: ReaderTheme;
  setTheme: (t: ReaderTheme) => void;
  fontFamily: ReaderFontFamily;
  setFontFamily: React.Dispatch<React.SetStateAction<ReaderFontFamily>>;
  fontSize: ReaderFontSize;
  setFontSize: React.Dispatch<React.SetStateAction<ReaderFontSize>>;
  readingLayout: ReaderLayout;
  setReadingLayout: React.Dispatch<React.SetStateAction<ReaderLayout>>;
  isFullscreen: boolean;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  copied: boolean;
  handleCopyChapter: () => void;
  handleExportFullHandbookMarkdown: () => void;
  onOpenRevisionDeck?: (book: any) => void;
  onClose: () => void;
  themeClasses: ThemeStyleClasses;
}

export const ReaderHeader: React.FC<ReaderHeaderProps> = ({
  book,
  subject,
  chaptersCount,
  totalEstMins,
  progressPercent,
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  allBookFormulasCount,
  isSpeaking,
  isPaused,
  speechRate,
  handleToggleSpeech,
  handleCycleSpeechRate,
  stopSpeech,
  isGeneratingPodcast,
  handleTriggerBookPodcast,
  theme,
  setTheme,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  readingLayout,
  setReadingLayout,
  isFullscreen,
  setIsFullscreen,
  copied,
  handleCopyChapter,
  handleExportFullHandbookMarkdown,
  onOpenRevisionDeck,
  onClose,
  themeClasses,
}) => {
  return (
    <header
      className={`px-4 sm:px-6 py-2.5 sm:py-3 border-b flex items-center justify-between gap-2.5 shrink-0 ${themeClasses.headerBg}`}
    >
      {/* Left Title & Metadata */}
      <ReaderHeaderMeta
        book={book}
        subject={subject}
        chaptersCount={chaptersCount}
        totalEstMins={totalEstMins}
        progressPercent={progressPercent}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        themeClasses={themeClasses}
      />

      {/* Right Toolbar Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* View Mode Tabs: Reader Notes vs Formula Crib Sheet */}
        <div className="hidden lg:flex items-center border rounded-xl p-0.5 bg-black/20 border-current/20 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab("reader")}
            className={`min-h-[44px] sm:min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "reader"
                ? "bg-current/20 text-current shadow-xs"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Notes</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("formulas")}
            className={`min-h-[44px] sm:min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "formulas"
                ? "bg-current/20 text-current shadow-xs"
                : "opacity-60 hover:opacity-100"
            }`}
            title="View All Extracted Formulas & Equations"
          >
            <Sigma className="w-3.5 h-3.5 text-amber-400" />
            <span>Formulas ({allBookFormulasCount})</span>
          </button>
        </div>

        {/* Audio Speech Synthesis & 2-Host Podcast Controls */}
        <ReaderHeaderAudioControls
          isSpeaking={isSpeaking}
          isPaused={isPaused}
          speechRate={speechRate}
          handleToggleSpeech={handleToggleSpeech}
          handleCycleSpeechRate={handleCycleSpeechRate}
          stopSpeech={stopSpeech}
          isGeneratingPodcast={isGeneratingPodcast}
          handleTriggerBookPodcast={handleTriggerBookPodcast}
        />

        {/* Themes, Fonts, Layouts, Copy, and Close Controls */}
        <ReaderHeaderStyleControls
          theme={theme}
          setTheme={setTheme}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          fontSize={fontSize}
          setFontSize={setFontSize}
          readingLayout={readingLayout}
          setReadingLayout={setReadingLayout}
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
          copied={copied}
          handleCopyChapter={handleCopyChapter}
          handleExportFullHandbookMarkdown={handleExportFullHandbookMarkdown}
          onOpenRevisionDeck={onOpenRevisionDeck}
          book={book}
          stopSpeech={stopSpeech}
          onClose={onClose}
        />
      </div>
    </header>
  );
};
