/**
 * ReaderDocumentHeader.tsx
 * Sub-component for the active chapter title banner, status toggles, and copy action.
 */
import React from "react";
import { Star, CheckCircle2, Copy, Check } from "lucide-react";
import { ChapterItem, ThemeStyleClasses } from "../readerTypes";

interface ReaderDocumentHeaderProps {
  currentChapter: ChapterItem;
  activeChapterIndex: number;
  chaptersCount: number;
  isStarred: boolean;
  isDone: boolean;
  toggleChapterBookmark: (idx: number) => void;
  toggleChapterCompleted: (idx: number) => void;
  copied: boolean;
  handleCopyChapter: () => void;
  themeClasses: ThemeStyleClasses;
}

export const ReaderDocumentHeader: React.FC<ReaderDocumentHeaderProps> = ({
  currentChapter,
  activeChapterIndex,
  chaptersCount,
  isStarred,
  isDone,
  toggleChapterBookmark,
  toggleChapterCompleted,
  copied,
  handleCopyChapter,
  themeClasses,
}) => {
  return (
    <div
      className={`px-6 sm:px-10 py-3.5 border-b ${themeClasses.pageRuler} flex items-center justify-between gap-3 shrink-0`}
    >
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2 text-xs font-mono opacity-75 flex-wrap">
          <span className="font-bold">
            CHAPTER {activeChapterIndex + 1} OF {chaptersCount}
          </span>
          <span>•</span>
          <span>~{currentChapter.estReadingMins} MIN READ</span>
          <span>•</span>
          <span>{currentChapter.wordCount} WORDS</span>
          {currentChapter.formulaCount > 0 && (
            <>
              <span>•</span>
              <span className="text-amber-400 font-bold">
                {currentChapter.formulaCount} FORMULAS
              </span>
            </>
          )}
        </div>
        <h2 className="text-base sm:text-lg md:text-xl font-black truncate max-w-xl sm:max-w-2xl">
          {currentChapter.title}
        </h2>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => toggleChapterBookmark(activeChapterIndex)}
          className={`min-h-[44px] sm:min-h-[34px] px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            isStarred
              ? "bg-amber-400/20 border-amber-400 text-amber-300"
              : "border-current/20 hover:bg-current/10 opacity-70"
          }`}
          title={isStarred ? "Bookmarked" : "Bookmark Chapter"}
        >
          <Star
            className={`w-3.5 h-3.5 ${
              isStarred ? "fill-amber-400 text-amber-400" : ""
            }`}
          />
          <span className="hidden sm:inline">
            {isStarred ? "Saved" : "Save"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => toggleChapterCompleted(activeChapterIndex)}
          className={`min-h-[44px] sm:min-h-[34px] px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            isDone
              ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-black"
              : "border-current/20 hover:bg-current/10 opacity-70"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {isDone ? "Completed" : "Mark Complete"}
          </span>
        </button>

        <button
          type="button"
          onClick={handleCopyChapter}
          className="min-h-[44px] sm:min-h-[34px] p-2 rounded-xl border border-current/20 hover:bg-current/10 opacity-70 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
          title="Copy active chapter markdown notes"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};
