/**
 * useInAppBookReader.ts
 * Main hook coordinating themes, navigation, speech synthesis, and chapter progress.
 */
import { useState, useMemo, useCallback } from "react";
import {
  InAppBookReaderModalProps,
  ReaderTheme,
  ReaderFontFamily,
  ReaderFontSize,
  ReaderLayout,
  ReaderTab,
  ChapterItem,
} from "./readerTypes";
import {
  THEME_CLASSES,
  FONT_CLASSES,
  FONT_FAMILY_CLASSES,
} from "./readerThemeConfig";
import {
  extractBookChapters,
  extractAllBookFormulas,
} from "./utils/readerChapterUtils";
import {
  copyChapterNotes,
  copyFormulaLatex,
  exportFullHandbookMarkdown,
} from "./utils/readerExportUtils";
import { useReaderSpeech } from "./hooks/useReaderSpeech";
import { useReaderKeyboard } from "./hooks/useReaderKeyboard";
import { useReaderProgress } from "./hooks/useReaderProgress";

export const useInAppBookReader = (props: InAppBookReaderModalProps) => {
  const { isOpen, book, onClose } = props;

  // Theme & Appearance State
  const [theme, setTheme] = useState<ReaderTheme>("chalkboard");
  const [fontFamily, setFontFamily] = useState<ReaderFontFamily>("sans");
  const [fontSize, setFontSize] = useState<ReaderFontSize>("base");
  const [readingLayout, setReadingLayout] = useState<ReaderLayout>("focused");
  const [activeTab, setActiveTab] = useState<ReaderTab>("reader");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Chapter Navigation & Filtering State
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedFormulaIdx, setCopiedFormulaIdx] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const bookId =
    book?.sessionId ||
    book?.id ||
    (book?.index !== undefined ? `book_${book.index}` : "current_book");

  // Reset function called on book switch or open
  const handleResetActiveState = useCallback(() => {
    setActiveChapterIndex(0);
    setSearchQuery("");
    setCopied(false);
    setActiveTab("reader");
  }, []);

  // Parse structured chapters from book
  const chapters: ChapterItem[] = useMemo(() => {
    return extractBookChapters(book);
  }, [book]);

  const currentChapter: ChapterItem =
    chapters[activeChapterIndex] ||
    chapters[0] || {
      id: "fallback",
      index: 0,
      title: "Chapter Notes",
      content: "",
      formulaCount: 0,
      wordCount: 0,
      estReadingMins: 1,
      extractedFormulas: [],
    };

  // Sub-Hooks for Speech, Keyboard, and LocalStorage Progress
  const speech = useReaderSpeech({
    book,
    currentChapter,
    activeChapterIndex,
  });

  const progress = useReaderProgress({
    isOpen,
    bookId,
    onResetActiveChapter: () => {
      handleResetActiveState();
      speech.stopSpeech();
    },
  });

  useReaderKeyboard({
    isOpen,
    isFullscreen,
    setIsFullscreen,
    onClose,
    chaptersLength: chapters.length,
    setActiveChapterIndex,
    setTheme,
  });

  // Filter chapters for table of contents
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return chapters;
    const q = searchQuery.toLowerCase();
    return chapters.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.content.toLowerCase().includes(q),
    );
  }, [chapters, searchQuery]);

  // All extracted formulas across the entire book
  const allBookFormulas = useMemo(() => {
    return extractAllBookFormulas(chapters);
  }, [chapters]);

  const subject = book?.inferredSubject || book?.subject || "Mathematics";
  const totalWords = chapters.reduce((acc, c) => acc + c.wordCount, 0);
  const totalFormulas = chapters.reduce((acc, c) => acc + c.formulaCount, 0);
  const totalEstMins = chapters.reduce((acc, c) => acc + c.estReadingMins, 0);
  const completedCount = Object.keys(progress.completedChapters).filter(
    (k) => progress.completedChapters[Number(k)],
  ).length;
  const progressPercent = Math.round(
    (completedCount / Math.max(1, chapters.length)) * 100,
  );

  const handleCopyChapter = async () => {
    const success = await copyChapterNotes(book, currentChapter, activeChapterIndex);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCopyFormula = async (formulaStr: string, idx: number) => {
    const success = await copyFormulaLatex(formulaStr);
    if (success) {
      setCopiedFormulaIdx(idx);
      setTimeout(() => setCopiedFormulaIdx(null), 2000);
    }
  };

  const handleExportFullHandbookMarkdown = () => {
    exportFullHandbookMarkdown(book, chapters, subject);
  };

  return {
    theme,
    setTheme,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    readingLayout,
    setReadingLayout,
    activeTab,
    setActiveTab,
    isFullscreen,
    setIsFullscreen,
    activeChapterIndex,
    setActiveChapterIndex,
    copied,
    copiedFormulaIdx,
    searchQuery,
    setSearchQuery,
    isSidebarOpen,
    setIsSidebarOpen,
    completedChapters: progress.completedChapters,
    bookmarkedChapters: progress.bookmarkedChapters,
    isSpeaking: speech.isSpeaking,
    isPaused: speech.isPaused,
    speechRate: speech.speechRate,
    isGeneratingPodcast: speech.isGeneratingPodcast,
    stopSpeech: speech.stopSpeech,
    chapters,
    currentChapter,
    filteredChapters,
    allBookFormulas,
    subject,
    totalWords,
    totalFormulas,
    totalEstMins,
    completedCount,
    progressPercent,
    handleCopyChapter,
    handleCopyFormula,
    handleExportFullHandbookMarkdown,
    toggleChapterCompleted: progress.toggleChapterCompleted,
    toggleChapterBookmark: progress.toggleChapterBookmark,
    handleToggleSpeech: speech.handleToggleSpeech,
    handleCycleSpeechRate: speech.handleCycleSpeechRate,
    handleTriggerBookPodcast: speech.handleTriggerBookPodcast,
    themeClasses: THEME_CLASSES[theme],
    fontClasses: FONT_CLASSES[fontSize],
    fontFamilyClasses: FONT_FAMILY_CLASSES[fontFamily],
  };
};
