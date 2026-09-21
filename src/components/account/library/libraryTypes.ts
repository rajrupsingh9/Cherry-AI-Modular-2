/**
 * libraryTypes.ts
 * Type definitions for Chapter Books and Board Slates library.
 */
import { BoardSnapshot } from "../accountTypes";

export type BookHubTab = "books" | "slates";
export type LibraryViewMode = "grid" | "carousel";
export type BookSortOrder = "newest" | "oldest" | "title" | "topics";

export interface SubjectTheme {
  name: string;
  icon: string;
  accentPillBg: string;
}

export interface ProcessedBook {
  sessionId: string;
  id?: string;
  isLiveActive?: boolean;
  activeDocumentName?: string;
  activeDocumentMarkdown?: string;
  documentMarkdown?: string;
  sourceMode?: string;
  subject?: string;
  grade?: string;
  board?: string;
  customBoardContent?: string;
  topicBoardsContent?: Record<number, string>;
  topics?: string[];
  createdAt?: string | any;
  updatedAt?: string | any;
  title?: string;
  processedTitle: string;
  formattedDateTime: string;
  index: number;
  inferredSubject: string;
}

export interface AccountBooksLibraryViewProps {
  pastSessions: any[];
  snapshots: BoardSnapshot[];
  sessionSnapshots?: any[];
  activeDocument?: any;
  sessionId?: string;
  customBoardContent?: string;
  topicBoardsContent?: Record<number, string>;
  topics?: string[];
  studentName?: string;
  grade?: string;
  board?: string;
  subject?: string;
  mediumOfLearning?: string;
  isEnglish?: boolean;
  onDiscussWithCherry?: (topic: string) => void;
  onEnterClassroom?: () => void;
  onOpenBookReader: (book: any) => void;
  onOpenSnapshotModal: (snap: BoardSnapshot) => void;
  onDeleteSnapshot: (id: string) => void;
  onTriggerBookPodcast: (book: any) => void;
  generatingPodcastBookId?: string | null;
  onExportSessionToPDF: (book: any) => void;
  getActiveLearningContext: () => any;
  activeDesktopTab?: string;
}
