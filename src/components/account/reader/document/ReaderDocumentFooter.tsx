/**
 * ReaderDocumentFooter.tsx
 * Sub-component for bottom pagination, chapter progress bar, and next/prev buttons.
 */
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ThemeStyleClasses } from "../readerTypes";

interface ReaderDocumentFooterProps {
  activeChapterIndex: number;
  setActiveChapterIndex: React.Dispatch<React.SetStateAction<number>>;
  chaptersCount: number;
  isSpeaking: boolean;
  stopSpeech: () => void;
  themeClasses: ThemeStyleClasses;
}

export const ReaderDocumentFooter: React.FC<ReaderDocumentFooterProps> = ({
  activeChapterIndex,
  setActiveChapterIndex,
  chaptersCount,
  isSpeaking,
  stopSpeech,
  themeClasses,
}) => {
  return (
    <footer
      className={`px-4 sm:px-8 py-3 border-t ${themeClasses.pageRuler} flex items-center justify-between gap-3 shrink-0 ${themeClasses.headerBg}`}
    >
      {/* Previous Chapter Button */}
      <button
        type="button"
        onClick={() => {
          if (isSpeaking) stopSpeech();
          setActiveChapterIndex((prev) => Math.max(0, prev - 1));
        }}
        disabled={activeChapterIndex === 0}
        className={`min-h-[44px] sm:min-h-[36px] px-3 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
          activeChapterIndex === 0
            ? "opacity-30 cursor-not-allowed border border-current/10"
            : "border border-current/25 hover:bg-current/10 active:scale-95"
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous Chapter</span>
      </button>

      {/* Middle Page Progress Indicator */}
      <div className="flex flex-col items-center gap-1 min-w-0">
        <span className="text-xs font-mono font-bold text-center">
          Chapter {activeChapterIndex + 1} of {chaptersCount}
        </span>
        <div className="w-32 sm:w-48 h-1.5 bg-black/20 rounded-full overflow-hidden border border-current/15">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-amber-400 transition-all duration-300 rounded-full"
            style={{
              width: `${Math.round(
                ((activeChapterIndex + 1) / Math.max(1, chaptersCount)) * 100,
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Next Chapter Button */}
      <button
        type="button"
        onClick={() => {
          if (isSpeaking) stopSpeech();
          setActiveChapterIndex((prev) =>
            Math.min(chaptersCount - 1, prev + 1),
          );
        }}
        disabled={activeChapterIndex === chaptersCount - 1}
        className={`min-h-[44px] sm:min-h-[36px] px-3 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
          activeChapterIndex === chaptersCount - 1
            ? "opacity-30 cursor-not-allowed border border-current/10"
            : `${themeClasses.primaryBtn} active:scale-95 shadow-xs`
        }`}
      >
        <span className="hidden sm:inline">Next Chapter</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </footer>
  );
};
