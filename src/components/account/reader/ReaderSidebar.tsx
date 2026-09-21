/**
 * ReaderSidebar.tsx
 * Collapsible table of contents sidebar for navigating book chapters, tracking progress, and bookmarks.
 */
import React from "react";
import { Search, CheckCircle2, Star } from "lucide-react";
import { ChapterItem, ThemeStyleClasses } from "./readerTypes";

interface ReaderSidebarProps {
  isSidebarOpen: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredChapters: ChapterItem[];
  activeChapterIndex: number;
  setActiveChapterIndex: (idx: number) => void;
  completedChapters: Record<number, boolean>;
  toggleChapterCompleted: (idx: number) => void;
  bookmarkedChapters: Record<number, boolean>;
  toggleChapterBookmark: (idx: number) => void;
  totalFormulas: number;
  completedCount: number;
  chaptersCount: number;
  isSpeaking: boolean;
  stopSpeech: () => void;
  themeClasses: ThemeStyleClasses;
}

export const ReaderSidebar: React.FC<ReaderSidebarProps> = ({
  isSidebarOpen,
  searchQuery,
  setSearchQuery,
  filteredChapters,
  activeChapterIndex,
  setActiveChapterIndex,
  completedChapters,
  toggleChapterCompleted,
  bookmarkedChapters,
  toggleChapterBookmark,
  totalFormulas,
  completedCount,
  chaptersCount,
  isSpeaking,
  stopSpeech,
  themeClasses,
}) => {
  if (!isSidebarOpen) return null;

  return (
    <aside
      className={`w-72 sm:w-80 md:w-88 border-r flex flex-col shrink-0 overflow-hidden transition-all duration-200 ${themeClasses.sidebarBg}`}
    >
      {/* Sidebar Search / Filter Bar */}
      <div className="p-3 border-b border-current/15">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50 stroke-[2.5]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chapters or topics..."
            className="w-full pl-9 pr-7 py-1.5 rounded-xl text-xs font-mono bg-black/20 focus:bg-black/30 border border-current/20 focus:border-current/40 outline-none text-current placeholder:opacity-50 min-h-[44px] sm:min-h-[34px]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="min-h-[44px] min-w-[44px] sm:min-h-[26px] sm:min-w-[26px] flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 text-[11px] opacity-60 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Chapters Table of Contents List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
        {filteredChapters.length === 0 ? (
          <div className="p-6 text-center text-xs opacity-50 font-mono">
            No matching chapters found.
          </div>
        ) : (
          filteredChapters.map((chap) => {
            const isActive = activeChapterIndex === chap.index;
            const isDone = !!completedChapters[chap.index];
            const isStarred = !!bookmarkedChapters[chap.index];

            return (
              <div
                key={chap.id}
                onClick={() => {
                  if (isSpeaking) stopSpeech();
                  setActiveChapterIndex(chap.index);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  isActive
                    ? themeClasses.sidebarItemActive
                    : themeClasses.sidebarItemInactive
                }`}
              >
                {/* Completion Checkbox */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleChapterCompleted(chap.index);
                  }}
                  className="mt-0.5 opacity-70 hover:opacity-100 transition-opacity shrink-0 min-h-[36px] min-w-[36px] sm:min-h-[24px] sm:min-w-[24px] flex items-center justify-center"
                  title={isDone ? "Mark as Incomplete" : "Mark as Completed"}
                >
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      isDone
                        ? "text-emerald-400 fill-emerald-400/20"
                        : "opacity-40 hover:opacity-80"
                    }`}
                  />
                </button>

                {/* Chapter Meta */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1 text-[9.5px] font-mono">
                    <span className="font-bold opacity-75">
                      Chapter #{chap.index + 1}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {chap.formulaCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-black/20 text-[8.5px] font-mono">
                          ∑ {chap.formulaCount} math
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleChapterBookmark(chap.index);
                        }}
                        className="text-amber-400 opacity-60 hover:opacity-100 transition-opacity min-h-[36px] min-w-[36px] sm:min-h-[20px] sm:min-w-[20px] flex items-center justify-center"
                        title={isStarred ? "Remove Bookmark" : "Bookmark Chapter"}
                      >
                        <Star
                          className={`w-3 h-3 ${
                            isStarred ? "fill-amber-400 text-amber-400" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold leading-snug line-clamp-2">
                    {chap.title}
                  </h4>

                  <div className="flex items-center gap-2 text-[9px] font-mono opacity-60">
                    <span>~{chap.estReadingMins} min</span>
                    <span>•</span>
                    <span>{chap.wordCount} words</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer Stats */}
      <div className="p-3 border-t border-current/15 text-[10px] font-mono opacity-70 flex items-center justify-between">
        <span>
          Total Formulas: <strong>{totalFormulas}</strong>
        </span>
        <span>
          Completed:{" "}
          <strong>
            {completedCount}/{chaptersCount}
          </strong>
        </span>
      </div>
    </aside>
  );
};
