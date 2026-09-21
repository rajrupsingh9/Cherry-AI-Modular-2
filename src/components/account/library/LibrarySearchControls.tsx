/**
 * LibrarySearchControls.tsx
 * Top row of library toolbar: search input, sort selector, grid/carousel toggle, stepper, and export button.
 */
import React from "react";
import {
  Search,
  ArrowUpDown,
  Grid,
  Film,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { BookHubTab, LibraryViewMode, BookSortOrder } from "./libraryTypes";

interface LibrarySearchControlsProps {
  bookHubActiveTab: BookHubTab;
  activeSearch: string;
  onSearchChange: (val: string) => void;
  onClearSearch: () => void;
  bookSearchInputRef: React.RefObject<HTMLInputElement | null>;
  bookSortOrder: BookSortOrder;
  setBookSortOrder: (order: BookSortOrder) => void;
  booksViewMode: LibraryViewMode;
  setBooksViewMode: (m: LibraryViewMode) => void;
  snapshotsViewMode: LibraryViewMode;
  setSnapshotsViewMode: (m: LibraryViewMode) => void;
  currentBookHorizontalIndex: number;
  handleBooksHorizontalScroll: (dir: "prev" | "next") => void;
  filteredBooksLength: number;
  currentSnapshotHorizontalIndex: number;
  handleSnapshotHorizontalScroll: (dir: "prev" | "next") => void;
  filteredSnapshotsLength: number;
  handleBatchExportSnapshotsMarkdown: () => void;
}

export const LibrarySearchControls: React.FC<LibrarySearchControlsProps> = ({
  bookHubActiveTab,
  activeSearch,
  onSearchChange,
  onClearSearch,
  bookSearchInputRef,
  bookSortOrder,
  setBookSortOrder,
  booksViewMode,
  setBooksViewMode,
  snapshotsViewMode,
  setSnapshotsViewMode,
  currentBookHorizontalIndex,
  handleBooksHorizontalScroll,
  filteredBooksLength,
  currentSnapshotHorizontalIndex,
  handleSnapshotHorizontalScroll,
  filteredSnapshotsLength,
  handleBatchExportSnapshotsMarkdown,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />
        <input
          ref={bookSearchInputRef}
          type="text"
          value={activeSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={
            bookHubActiveTab === "books"
              ? "Search chapter books, topics, or formulas... (Press / to search)"
              : "Search blackboard slides by topic, formula, or concept... (Press / to search)"
          }
          className="w-full pl-10 pr-20 py-2.5 bg-[#F6F7FB] hover:bg-zinc-100/80 focus:bg-white border border-[#EFF1F5] focus:border-[#796AEF] text-slate-800 placeholder:text-slate-400 rounded-xl text-xs font-mono transition-all focus:outline-none focus:ring-1 focus:ring-[#796AEF] min-h-[44px]"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {activeSearch ? (
            <button
              type="button"
              onClick={onClearSearch}
              className="min-h-[44px] min-w-[44px] sm:min-h-[30px] sm:min-w-[30px] flex items-center justify-center p-1 rounded-md text-slate-400 hover:text-slate-700 text-xs transition-colors cursor-pointer"
              title="Clear search"
            >
              ✕
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-zinc-200/60 border border-zinc-300 rounded-md">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Controls Dock */}
      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-between md:justify-end">
        {bookHubActiveTab === "books" ? (
          <>
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-[#F6F7FB] px-2.5 py-1.5 rounded-xl border border-[#EFF1F5] text-xs font-mono min-h-[44px] sm:min-h-[36px]">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 stroke-[2.5]" />
              <select
                value={bookSortOrder}
                onChange={(e) => setBookSortOrder(e.target.value as BookSortOrder)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">By Title</option>
                <option value="topics">Most Topics</option>
              </select>
            </div>

            {/* View Switcher: Grid vs Carousel */}
            <div className="inline-flex p-1 bg-zinc-100 rounded-xl border border-[#EFF1F5]/80">
              <button
                type="button"
                onClick={() => setBooksViewMode("grid")}
                className={`min-h-[44px] sm:min-h-[34px] px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  booksViewMode === "grid"
                    ? "bg-white text-slate-900 shadow-xs font-black border border-[#EFF1F5]/60"
                    : "text-zinc-600 hover:text-slate-900"
                }`}
                title="Grid View"
              >
                <Grid className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setBooksViewMode("carousel")}
                className={`min-h-[44px] sm:min-h-[34px] px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  booksViewMode === "carousel"
                    ? "bg-white text-slate-900 shadow-xs font-black border border-[#EFF1F5]/60"
                    : "text-zinc-600 hover:text-slate-900"
                }`}
                title="Carousel View"
              >
                <Film className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Carousel</span>
              </button>
            </div>

            {/* Stepper for Books Carousel */}
            {booksViewMode === "carousel" && filteredBooksLength > 0 && (
              <div className="flex items-center gap-1.5 bg-[#F6F7FB] px-2.5 py-1 rounded-xl border border-[#EFF1F5] min-h-[44px] sm:min-h-[36px]">
                <span className="text-[11px] font-mono font-black text-slate-900">
                  {Math.min(currentBookHorizontalIndex + 1, filteredBooksLength)}/
                  {filteredBooksLength}
                </span>
                <button
                  type="button"
                  onClick={() => handleBooksHorizontalScroll("prev")}
                  disabled={currentBookHorizontalIndex === 0}
                  className="min-h-[44px] min-w-[44px] sm:min-h-[28px] sm:min-w-[28px] flex items-center justify-center p-1 rounded-lg hover:bg-zinc-200 text-slate-700 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleBooksHorizontalScroll("next")}
                  disabled={currentBookHorizontalIndex >= filteredBooksLength - 1}
                  className="min-h-[44px] min-w-[44px] sm:min-h-[28px] sm:min-w-[28px] flex items-center justify-center p-1 rounded-lg hover:bg-zinc-200 text-slate-700 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Export Album Button for Slates */}
            <button
              type="button"
              onClick={handleBatchExportSnapshotsMarkdown}
              className="min-h-[44px] sm:min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF2FF] hover:bg-indigo-100 border border-[#796AEF]/30 text-[#1E293B] text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs"
              title="Export all blackboard derivations into a consolidated Markdown revision album"
            >
              <Download className="w-3.5 h-3.5 text-[#796AEF]" />
              <span>Export Album</span>
            </button>

            {/* View Switcher: Grid vs Carousel */}
            <div className="inline-flex p-1 bg-zinc-100 rounded-xl border border-[#EFF1F5]/80">
              <button
                type="button"
                onClick={() => setSnapshotsViewMode("grid")}
                className={`min-h-[44px] sm:min-h-[34px] px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  snapshotsViewMode === "grid"
                    ? "bg-white text-slate-900 shadow-xs font-black border border-[#EFF1F5]/60"
                    : "text-zinc-600 hover:text-slate-900"
                }`}
                title="Grid View"
              >
                <Grid className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setSnapshotsViewMode("carousel")}
                className={`min-h-[44px] sm:min-h-[34px] px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  snapshotsViewMode === "carousel"
                    ? "bg-white text-slate-900 shadow-xs font-black border border-[#EFF1F5]/60"
                    : "text-zinc-600 hover:text-slate-900"
                }`}
                title="Carousel View"
              >
                <Film className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Carousel</span>
              </button>
            </div>

            {/* Stepper for Slates Carousel */}
            {snapshotsViewMode === "carousel" && filteredSnapshotsLength > 1 && (
              <div className="flex items-center gap-1.5 bg-[#F6F7FB] px-2.5 py-1 rounded-xl border border-[#EFF1F5] min-h-[44px] sm:min-h-[36px]">
                <span className="text-[11px] font-mono font-black text-slate-900">
                  {currentSnapshotHorizontalIndex + 1}/{filteredSnapshotsLength}
                </span>
                <button
                  type="button"
                  onClick={() => handleSnapshotHorizontalScroll("prev")}
                  disabled={currentSnapshotHorizontalIndex === 0}
                  className="min-h-[44px] min-w-[44px] sm:min-h-[28px] sm:min-w-[28px] flex items-center justify-center p-1 rounded-lg hover:bg-zinc-200 text-slate-700 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSnapshotHorizontalScroll("next")}
                  disabled={currentSnapshotHorizontalIndex >= filteredSnapshotsLength - 1}
                  className="min-h-[44px] min-w-[44px] sm:min-h-[28px] sm:min-w-[28px] flex items-center justify-center p-1 rounded-lg hover:bg-zinc-200 text-slate-700 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
