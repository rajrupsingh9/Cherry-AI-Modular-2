/**
 * ReaderHeaderStyleControls.tsx
 * Theme switcher, typography controls, layout toggle, export actions, and modal close triggers.
 */
import React from "react";
import {
  X,
  Columns,
  AlignLeft,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Download,
  Sparkles,
} from "lucide-react";
import {
  ReaderTheme,
  ReaderFontFamily,
  ReaderFontSize,
  ReaderLayout,
} from "../readerTypes";

interface ReaderHeaderStyleControlsProps {
  theme: ReaderTheme;
  setTheme: (t: ReaderTheme) => void;
  fontFamily: ReaderFontFamily;
  setFontFamily: React.Dispatch<React.SetStateAction<ReaderFontFamily>>;
  fontSize: ReaderFontSize;
  setFontSize: React.Dispatch<React.SetStateAction<ReaderFontSize>>;
  readingLayout: ReaderLayout;
  setReadingLayout: React.Dispatch<React.SetStateAction<ReaderLayout>>;
  isFullscreen: boolean;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  copied: boolean;
  handleCopyChapter: () => void;
  handleExportFullHandbookMarkdown: () => void;
  onOpenRevisionDeck?: (book: any) => void;
  book: any;
  stopSpeech: () => void;
  onClose: () => void;
}

export const ReaderHeaderStyleControls: React.FC<ReaderHeaderStyleControlsProps> = ({
  theme,
  setTheme,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  readingLayout,
  setReadingLayout,
  isFullscreen,
  setIsFullscreen,
  copied,
  handleCopyChapter,
  handleExportFullHandbookMarkdown,
  onOpenRevisionDeck,
  book,
  stopSpeech,
  onClose,
}) => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Theme Selector Toggle */}
      <div className="flex items-center border rounded-xl p-0.5 bg-black/20 border-current/20 text-xs font-mono">
        <button
          type="button"
          onClick={() => setTheme("chalkboard")}
          className={`min-h-[44px] sm:min-h-[32px] px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
            theme === "chalkboard"
              ? "bg-teal-700 text-white shadow-xs"
              : "opacity-60 hover:opacity-100"
          }`}
          title="Chalkboard Green Slate Theme"
        >
          <span>🟢</span>
          <span className="hidden md:inline">Chalk</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("paper")}
          className={`min-h-[44px] sm:min-h-[32px] px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
            theme === "paper"
              ? "bg-amber-200 text-amber-950 shadow-xs"
              : "opacity-60 hover:opacity-100"
          }`}
          title="Parchment Notebook Theme"
        >
          <span>📜</span>
          <span className="hidden md:inline">Paper</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("obsidian")}
          className={`min-h-[44px] sm:min-h-[32px] px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
            theme === "obsidian"
              ? "bg-slate-800 text-cyan-300 shadow-xs"
              : "opacity-60 hover:opacity-100"
          }`}
          title="Obsidian Dark Modern Theme"
        >
          <span>🌑</span>
          <span className="hidden md:inline">Dark</span>
        </button>
      </div>

      {/* Font Typography Options */}
      <div className="hidden sm:flex items-center border rounded-xl p-0.5 bg-black/20 border-current/20 text-xs font-mono">
        <button
          type="button"
          onClick={() =>
            setFontFamily((prev) =>
              prev === "sans" ? "serif" : prev === "serif" ? "mono" : "sans",
            )
          }
          className="min-h-[44px] sm:min-h-[32px] px-2 py-1 rounded-lg text-[10px] font-bold opacity-70 hover:opacity-100 uppercase"
          title="Switch Font Family: Sans / Serif / Monospace"
        >
          {fontFamily}
        </button>
        <button
          type="button"
          onClick={() =>
            setFontSize((prev) =>
              prev === "sm" ? "base" : prev === "base" ? "lg" : prev === "lg" ? "xl" : "sm",
            )
          }
          className="min-h-[44px] sm:min-h-[32px] px-2 py-1 rounded-lg text-[10px] font-bold opacity-70 hover:opacity-100"
          title="Cycle Font Scaling (A- to A++)"
        >
          {fontSize === "sm" ? "A-" : fontSize === "base" ? "A" : fontSize === "lg" ? "A+" : "A++"}
        </button>
      </div>

      {/* Layout Mode */}
      <button
        type="button"
        onClick={() =>
          setReadingLayout((prev) => (prev === "focused" ? "wide" : "focused"))
        }
        className="min-h-[44px] min-w-[44px] sm:min-h-[34px] sm:min-w-[34px] p-2 rounded-xl border border-current/20 hover:bg-current/10 transition-all cursor-pointer hidden md:flex items-center justify-center"
        title={readingLayout === "focused" ? "Switch to Wide Mode" : "Switch to Focused Reading Column"}
      >
        {readingLayout === "focused" ? (
          <Columns className="w-3.5 h-3.5" />
        ) : (
          <AlignLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Fullscreen Toggle */}
      <button
        type="button"
        onClick={() => setIsFullscreen((prev) => !prev)}
        className="min-h-[44px] min-w-[44px] sm:min-h-[34px] sm:min-w-[34px] p-2 rounded-xl border border-current/20 hover:bg-current/10 transition-all cursor-pointer hidden sm:flex items-center justify-center"
        title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
      >
        {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
      </button>

      {/* Copy Chapter */}
      <button
        type="button"
        onClick={handleCopyChapter}
        className="min-h-[44px] sm:min-h-[34px] p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-current/20 hover:bg-current/10 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
        title="Copy active chapter notes to clipboard"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        <span className="hidden xl:inline">{copied ? "Copied" : "Copy Notes"}</span>
      </button>

      {/* Export Markdown */}
      <button
        type="button"
        onClick={handleExportFullHandbookMarkdown}
        className="min-h-[44px] sm:min-h-[34px] p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-current/20 hover:bg-current/10 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer hidden sm:flex"
        title="Download Full Markdown Handbook (.md)"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden xl:inline">Export .md</span>
      </button>

      {/* AI Revision Deck Launcher */}
      {onOpenRevisionDeck && (
        <button
          type="button"
          onClick={() => {
            stopSpeech();
            onClose();
            onOpenRevisionDeck(book);
          }}
          className="min-h-[44px] sm:min-h-[34px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
          title="Launch AI Flashcards & Mind Map for this book"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
          <span className="hidden sm:inline">AI Revision</span>
        </button>
      )}

      {/* Close Button */}
      <button
        type="button"
        onClick={() => {
          stopSpeech();
          onClose();
        }}
        className="min-h-[44px] min-w-[44px] sm:min-h-[34px] sm:min-w-[34px] flex items-center justify-center p-2 rounded-xl border border-current/20 hover:bg-rose-500/20 hover:border-rose-500 text-current transition-colors cursor-pointer"
        title="Close Reader (Esc)"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
