/**
 * ReaderHeaderMeta.tsx
 * Left section of the reader header containing sidebar toggle, subject badge, reading time, and book title.
 */
import React from "react";
import { Layers } from "lucide-react";
import { ThemeStyleClasses } from "../readerTypes";

interface ReaderHeaderMetaProps {
  book: any;
  subject: string;
  chaptersCount: number;
  totalEstMins: number;
  progressPercent: number;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  themeClasses: ThemeStyleClasses;
}

export const ReaderHeaderMeta: React.FC<ReaderHeaderMetaProps> = ({
  book,
  subject,
  chaptersCount,
  totalEstMins,
  progressPercent,
  isSidebarOpen,
  setIsSidebarOpen,
  themeClasses,
}) => {
  return (
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <button
        type="button"
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        className="min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center p-2 rounded-xl border border-current/20 hover:bg-current/10 transition-colors cursor-pointer shrink-0"
        title={isSidebarOpen ? "Collapse Chapter Sidebar" : "Expand Chapter Sidebar"}
      >
        <Layers className="w-4 h-4" />
      </button>

      <div className="min-w-0 space-y-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[9px] sm:text-[9.5px] font-mono font-black uppercase px-2.5 py-0.5 rounded-lg border ${themeClasses.accentBadge}`}
          >
            📖 {subject} • Lesson #{book?.index || 1}
          </span>
          <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
            {chaptersCount} {chaptersCount === 1 ? "Chapter" : "Chapters"} • ~{totalEstMins} min read
          </span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-black/20 text-emerald-400 font-bold hidden md:inline">
            {progressPercent}% Complete
          </span>
        </div>
        <h3 className="text-xs sm:text-sm md:text-base font-black truncate max-w-sm sm:max-w-md md:max-w-xl">
          {book?.processedTitle}
        </h3>
      </div>
    </div>
  );
};
