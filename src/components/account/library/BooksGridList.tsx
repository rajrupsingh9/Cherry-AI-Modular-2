/**
 * BooksGridList.tsx
 * Renders chapter books in Grid or Carousel layout with podcast generation, PDF export, and starring.
 */
import React from "react";
import { BookOpen, Headphones, Download, Sparkles, Star } from "lucide-react";
import { ProcessedBook, LibraryViewMode } from "./libraryTypes";
import { getSubjectBookTheme } from "./utils/subjectInferenceUtils";

interface BooksGridListProps {
  allBooks: ProcessedBook[];
  filteredBooks: ProcessedBook[];
  booksViewMode: LibraryViewMode;
  booksScrollContainerRef: React.RefObject<HTMLDivElement | null>;
  archiveSearchQuery: string;
  selectedBookSubjectFilter: string;
  starredBookIds: Record<string, boolean>;
  toggleStarBook: (id: string, e?: React.MouseEvent) => void;
  onOpenBookReader: (book: any) => void;
  onTriggerBookPodcast: (book: any) => void;
  generatingPodcastBookId?: string | null;
  onExportSessionToPDF: (book: any) => void;
  subject?: string;
  onResetFilters: () => void;
}

export const BooksGridList: React.FC<BooksGridListProps> = ({
  allBooks,
  filteredBooks,
  booksViewMode,
  booksScrollContainerRef,
  archiveSearchQuery,
  selectedBookSubjectFilter,
  starredBookIds,
  toggleStarBook,
  onOpenBookReader,
  onTriggerBookPodcast,
  generatingPodcastBookId,
  onExportSessionToPDF,
  subject,
  onResetFilters,
}) => {
  if (!allBooks || allBooks.length === 0) {
    return (
      <div className="border border-dashed border-[#EFF1F5] rounded-2xl p-10 bg-[#F6F7FB]/60 text-center select-none space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#796AEF] border border-[#796AEF]/30 flex items-center justify-center text-xl mx-auto shadow-2xs">
          📖
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-800">No Lecture Books Yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            As you attend classes or review chalkboard topics with Cherry Ma'am, comprehensive study books are automatically compiled here.
          </p>
        </div>
      </div>
    );
  }

  if (filteredBooks.length === 0) {
    return (
      <div className="border border-dashed border-[#EFF1F5] rounded-2xl p-10 bg-[#F6F7FB]/60 text-center select-none space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#796AEF] border border-[#796AEF]/30 flex items-center justify-center text-xl mx-auto shadow-2xs">
          📚
        </div>
        <div className="space-y-1">
          <p className="text-sm font-black text-slate-700">No matching lecture books found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {archiveSearchQuery
              ? `No chapter books matched "${archiveSearchQuery}". Try clearing search or selecting a different subject filter.`
              : "Try selecting a different subject tab to explore available board books."}
          </p>
        </div>
        {(archiveSearchQuery || selectedBookSubjectFilter !== "all") && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-2 min-h-[44px] sm:min-h-[38px] px-4 py-2 bg-[#796AEF] hover:bg-[#6857e8] text-white rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shadow-xs inline-flex items-center justify-center"
          >
            Reset All Filters & Show All Books
          </button>
        )}
      </div>
    );
  }

  const renderBookCard = (book: ProcessedBook, idx: number) => {
    const isStarred = !!starredBookIds[book.sessionId];
    const theme = getSubjectBookTheme(book.inferredSubject || book.subject || subject || "Science");
    const chaptersCount = book.topics?.length || 1;
    const bookTitle = book.activeDocumentName || book.title || "Lecture Handbook";
    const isPodcastGenerating =
      generatingPodcastBookId === (book.sessionId || book.id || `book_${book.index || 0}`);

    return (
      <div
        key={book.sessionId || idx}
        className={`bg-white border border-[#EFF1F5]/90 rounded-2xl p-4.5 hover:shadow-md transition-all flex flex-col justify-between group relative space-y-3 ${
          booksViewMode === "carousel" ? "snap-start shrink-0 w-[88vw] sm:w-[360px]" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#EEF2FF] border border-[#796AEF]/20 flex items-center justify-center text-base shrink-0">
              {theme.icon || "📘"}
            </span>
            <div className="min-w-0">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#796AEF] bg-[#EEF2FF] px-2 py-0.5 rounded-md border border-[#796AEF]/20 inline-block truncate max-w-[140px]">
                {theme.name || book.subject || subject}
              </span>
              <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                {chaptersCount} {chaptersCount === 1 ? "Chapter" : "Chapters"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => toggleStarBook(book.sessionId, e)}
            className={`min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] flex items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer ${
              isStarred
                ? "text-amber-500 bg-amber-50"
                : "text-slate-300 hover:text-slate-500 hover:bg-[#F6F7FB]"
            }`}
            title={isStarred ? "Unstar book" : "Star book"}
          >
            <Star
              className={`w-4 h-4 ${
                isStarred ? "fill-amber-400 text-amber-500" : ""
              }`}
            />
          </button>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#796AEF] transition-colors">
            {bookTitle}
          </h4>
        </div>

        <div className="pt-2 border-t border-[#EFF1F5] flex items-center justify-between gap-1.5">
          <button
            type="button"
            onClick={() => onOpenBookReader(book)}
            className="flex-1 min-h-[44px] sm:min-h-[38px] py-2 px-2.5 rounded-xl bg-[#796AEF] hover:bg-[#6857e8] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Read Book</span>
          </button>
          <button
            type="button"
            onClick={() => onTriggerBookPodcast(book)}
            disabled={isPodcastGenerating}
            className="min-h-[44px] sm:min-h-[38px] py-2 px-2.5 rounded-xl border border-[#796AEF]/30 bg-[#EEF2FF] text-[#796AEF] hover:bg-[#796AEF] hover:text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
            title="Listen to 2-Host Audio Podcast Recap"
          >
            {isPodcastGenerating ? (
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Headphones className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Podcast</span>
          </button>
          <button
            type="button"
            onClick={() => onExportSessionToPDF(book)}
            className="min-h-[44px] sm:min-h-[38px] p-2.5 rounded-xl border border-[#EFF1F5] text-slate-600 hover:text-[#796AEF] hover:border-[#796AEF]/30 hover:bg-[#EEF2FF] transition-all cursor-pointer flex items-center justify-center"
            title="Export as PDF Book"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {booksViewMode === "carousel" ? (
        <div
          ref={booksScrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none"
        >
          {filteredBooks.map((book, idx) => renderBookCard(book, idx))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book, idx) => renderBookCard(book, idx))}
        </div>
      )}
    </div>
  );
};
