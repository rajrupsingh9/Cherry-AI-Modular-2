/**
 * readerTypes.ts
 * Type definitions and contracts for the In-App Chapter Book Reader.
 */

export type ReaderTheme = "chalkboard" | "paper" | "obsidian";
export type ReaderFontFamily = "sans" | "serif" | "mono";
export type ReaderFontSize = "sm" | "base" | "lg" | "xl";
export type ReaderLayout = "focused" | "wide";
export type ReaderTab = "reader" | "formulas" | "takeaways";

export interface ChapterItem {
  id: string;
  index: number;
  title: string;
  content: string;
  formulaCount: number;
  wordCount: number;
  estReadingMins: number;
  extractedFormulas: string[];
}

export interface BookFormulaItem {
  formula: string;
  chapterTitle: string;
  chapterIndex: number;
}

export interface ThemeStyleClasses {
  modalBg: string;
  headerBg: string;
  sidebarBg: string;
  contentBg: string;
  sidebarItemActive: string;
  sidebarItemInactive: string;
  accentBadge: string;
  cardBorder: string;
  mathText: string;
  highlightCallout: string;
  formulaCard: string;
  scrollbarColor: string;
  pageRuler: string;
  secondaryBtn: string;
  primaryBtn: string;
}

export interface InAppBookReaderModalProps {
  isOpen: boolean;
  book: any | null;
  onClose: () => void;
  onOpenRevisionDeck?: (book: any) => void;
  onDiscussWithCherry?: (topicDetails: {
    topic: string;
    question?: string;
    answer?: string;
    hint?: string;
    conceptTested?: string;
    subject?: string;
  }) => void;
}
