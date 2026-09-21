/**
 * ReaderDocumentView.tsx
 * Active chapter viewport displaying chapter header banner, live TTS banner, LaTeX math markdown, and footer navigation.
 */
import React from "react";
import { Lightbulb, MessageSquare } from "lucide-react";
import { MathRenderer } from "../../MathRenderer";
import {
  ChapterItem,
  ReaderLayout,
  ReaderTheme,
  ThemeStyleClasses,
} from "./readerTypes";
import { ReaderDocumentHeader } from "./document/ReaderDocumentHeader";
import { ReaderDocumentFooter } from "./document/ReaderDocumentFooter";

interface ReaderDocumentViewProps {
  currentChapter: ChapterItem;
  activeChapterIndex: number;
  setActiveChapterIndex: React.Dispatch<React.SetStateAction<number>>;
  chaptersCount: number;
  bookmarkedChapters: Record<number, boolean>;
  toggleChapterBookmark: (idx: number) => void;
  completedChapters: Record<number, boolean>;
  toggleChapterCompleted: (idx: number) => void;
  copied: boolean;
  handleCopyChapter: () => void;
  readingLayout: ReaderLayout;
  fontFamilyClasses: string;
  fontClasses: string;
  theme: ReaderTheme;
  themeClasses: ThemeStyleClasses;
  isSpeaking: boolean;
  isPaused: boolean;
  speechRate: number;
  handleToggleSpeech: () => void;
  stopSpeech: () => void;
  onDiscussWithCherry?: (topicDetails: {
    topic: string;
    question?: string;
    answer?: string;
    hint?: string;
    conceptTested?: string;
    subject?: string;
  }) => void;
  onClose: () => void;
  subject: string;
}

export const ReaderDocumentView: React.FC<ReaderDocumentViewProps> = ({
  currentChapter,
  activeChapterIndex,
  setActiveChapterIndex,
  chaptersCount,
  bookmarkedChapters,
  toggleChapterBookmark,
  completedChapters,
  toggleChapterCompleted,
  copied,
  handleCopyChapter,
  readingLayout,
  fontFamilyClasses,
  fontClasses,
  theme,
  themeClasses,
  isSpeaking,
  isPaused,
  speechRate,
  handleToggleSpeech,
  stopSpeech,
  onDiscussWithCherry,
  onClose,
  subject,
}) => {
  const isDone = !!completedChapters[activeChapterIndex];
  const isStarred = !!bookmarkedChapters[activeChapterIndex];

  return (
    <>
      {/* Active Chapter Header Banner */}
      <ReaderDocumentHeader
        currentChapter={currentChapter}
        activeChapterIndex={activeChapterIndex}
        chaptersCount={chaptersCount}
        isStarred={isStarred}
        isDone={isDone}
        toggleChapterBookmark={toggleChapterBookmark}
        toggleChapterCompleted={toggleChapterCompleted}
        copied={copied}
        handleCopyChapter={handleCopyChapter}
        themeClasses={themeClasses}
      />

      {/* Main Reading Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10 scrollbar-thin">
        <div
          className={`${
            readingLayout === "focused" ? "max-w-4xl" : "max-w-6xl"
          } mx-auto space-y-6 ${fontFamilyClasses} ${fontClasses}`}
        >
          {/* Chapter Audio Speaking Live Banner */}
          {isSpeaking && (
            <div className="p-3.5 rounded-2xl bg-amber-400/15 border border-amber-400/40 text-amber-200 text-xs font-mono flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1">
                  <span className="w-1 h-3 bg-amber-400 animate-bounce rounded-full" />
                  <span className="w-1 h-5 bg-amber-400 animate-bounce delay-75 rounded-full" />
                  <span className="w-1 h-2.5 bg-amber-400 animate-bounce delay-150 rounded-full" />
                </div>
                <span>
                  Cherry AI is narrating Chapter {activeChapterIndex + 1} (
                  {speechRate}x speed)...
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleSpeech}
                  className="min-h-[36px] sm:min-h-[28px] px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-[10.5px] cursor-pointer"
                >
                  {isPaused ? "Resume" : "Pause"}
                </button>
                <button
                  type="button"
                  onClick={stopSpeech}
                  className="min-h-[36px] sm:min-h-[28px] px-2 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-white text-[10.5px] cursor-pointer"
                >
                  Stop
                </button>
              </div>
            </div>
          )}

          {/* MathRenderer with LaTeX derivations */}
          <div
            className={`prose max-w-none ${
              theme === "paper" ? "prose-slate" : "prose-invert"
            } leading-relaxed`}
          >
            <MathRenderer content={currentChapter.content} />
          </div>

          {/* Socratic Discussion Prompt with Cherry */}
          {onDiscussWithCherry && (
            <div
              className={`mt-8 p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${themeClasses.highlightCallout}`}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs font-mono font-black uppercase text-amber-400">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Have a doubt about this derivation?</span>
                </div>
                <p className="text-xs opacity-80 leading-relaxed">
                  Take this chapter's formulas directly into live voice & chalkboard
                  discussion with Cherry Ma'am.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  onClose();
                  onDiscussWithCherry({
                    topic: currentChapter.title,
                    conceptTested: currentChapter.title,
                    question: `Can you explain the key concepts and derivations from ${currentChapter.title}?`,
                    subject: subject,
                  });
                }}
                className={`min-h-[44px] px-4 py-2 ${themeClasses.primaryBtn} rounded-xl text-xs font-bold font-mono tracking-wide uppercase transition-all cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-teal-300" />
                <span>Discuss with Cherry</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Reading Footer Navigation */}
      <ReaderDocumentFooter
        activeChapterIndex={activeChapterIndex}
        setActiveChapterIndex={setActiveChapterIndex}
        chaptersCount={chaptersCount}
        isSpeaking={isSpeaking}
        stopSpeech={stopSpeech}
        themeClasses={themeClasses}
      />
    </>
  );
};
