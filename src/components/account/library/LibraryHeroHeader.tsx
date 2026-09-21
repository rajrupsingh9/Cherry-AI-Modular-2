/**
 * LibraryHeroHeader.tsx
 * Hero banner with student profile context, live sync badges, and 2-way switcher (Chapter Books vs Board Slates).
 */
import React from "react";
import { BookOpen, Camera, Layers, Sparkles } from "lucide-react";
import { BookHubTab, ProcessedBook } from "./libraryTypes";
import { BoardSnapshot } from "../accountTypes";

interface LibraryHeroHeaderProps {
  studentName?: string;
  grade?: string;
  board?: string;
  mediumOfLearning?: string;
  bookHubActiveTab: BookHubTab;
  setBookHubActiveTab: (tab: BookHubTab) => void;
  allBooks: ProcessedBook[];
  allSnapshots: BoardSnapshot[];
  bookSubjectCounts: Record<string, number>;
}

export const LibraryHeroHeader: React.FC<LibraryHeroHeaderProps> = ({
  studentName = "Scholar",
  grade = "Class 10",
  board = "CBSE",
  mediumOfLearning = "Hinglish",
  bookHubActiveTab,
  setBookHubActiveTab,
  allBooks,
  allSnapshots,
  bookSubjectCounts,
}) => {
  const activeSubjectCount =
    Object.keys(bookSubjectCounts).filter(
      (k) => k !== "all" && bookSubjectCounts[k] > 0,
    ).length || 1;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 rounded-2xl text-white shadow-xl border border-indigo-500/20 relative overflow-hidden flex flex-col gap-5">
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar inside Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400/25 to-teal-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center text-2xl font-bold shrink-0 shadow-inner">
            📖
          </div>
          <div className="text-left min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg md:text-xl font-black tracking-tight text-white truncate">
                {studentName ? `${studentName}'s Books & Smart Handbooks` : "Classroom Books & Smart Handbooks"}
              </h3>
              <span className="text-[10.5px] font-mono font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full shadow-xs">
                Live Sync
              </span>
            </div>
            <p className="text-[11.5px] sm:text-xs text-slate-300 font-medium truncate mt-0.5">
              Multi-page chalkboard lecture books, step-by-step derivations & AI flashcard decks.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative z-10 shrink-0 self-start sm:self-auto">
          <span className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider bg-black/40 text-indigo-200 px-3.5 py-1.5 rounded-xl border border-indigo-400/25 backdrop-blur-md shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {grade || "Class 10"} • {board || "CBSE"} • {mediumOfLearning || "Hinglish"}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider bg-black/40 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-400/25 backdrop-blur-md shadow-inner">
            <Layers className="w-3 h-3 text-emerald-400" />
            <span>
              {activeSubjectCount} {activeSubjectCount === 1 ? "Subject" : "Subjects"}
            </span>
          </span>
        </div>
      </div>

      {/* UNIFIED 2-WAY VIEW SWITCHER */}
      <div className="bg-black/40 p-2.5 rounded-2xl border border-indigo-500/25 relative z-10 space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5 w-full">
          {/* Button 1: Chapter Books */}
          <button
            type="button"
            onClick={() => setBookHubActiveTab("books")}
            className={`p-3 sm:p-3.5 rounded-xl transition-all flex flex-col justify-between text-left cursor-pointer border min-h-[44px] ${
              bookHubActiveTab === "books"
                ? "bg-white text-slate-900 border-white shadow-lg ring-2 ring-emerald-400/40"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-indigo-200"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  bookHubActiveTab === "books"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-white/10 text-emerald-400"
                }`}
              >
                <BookOpen className="w-4 h-4" />
              </div>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-black ${
                  bookHubActiveTab === "books"
                    ? "bg-[#EEF2FF] text-[#796AEF] border border-[#796AEF]/30"
                    : "bg-white/15 text-white"
                }`}
              >
                {allBooks.length} {allBooks.length === 1 ? "Book" : "Books"}
              </span>
            </div>

            <div className="w-full">
              <div
                className={`text-xs sm:text-sm font-black tracking-tight leading-tight ${
                  bookHubActiveTab === "books" ? "text-slate-900" : "text-white"
                }`}
              >
                Chapter Books
              </div>
              <div
                className={`text-[11px] sm:text-[12px] leading-snug mt-1 ${
                  bookHubActiveTab === "books"
                    ? "text-slate-600 font-medium"
                    : "text-indigo-200/80"
                }`}
              >
                Lecture Notes & AI Decks
              </div>
            </div>
          </button>

          {/* Button 2: Board Slates */}
          <button
            type="button"
            onClick={() => setBookHubActiveTab("slates")}
            className={`p-3 sm:p-3.5 rounded-xl transition-all flex flex-col justify-between text-left cursor-pointer border min-h-[44px] ${
              bookHubActiveTab === "slates"
                ? "bg-white text-slate-900 border-white shadow-lg ring-2 ring-indigo-400/40"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-indigo-200"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  bookHubActiveTab === "slates"
                    ? "bg-indigo-50 text-indigo-700"
                    : "bg-white/10 text-indigo-400"
                }`}
              >
                <Camera className="w-4 h-4" />
              </div>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-black ${
                  bookHubActiveTab === "slates"
                    ? "bg-[#EEF2FF] text-[#796AEF] border border-[#796AEF]/30"
                    : "bg-white/15 text-white"
                }`}
              >
                {allSnapshots.length} {allSnapshots.length === 1 ? "Slate" : "Slates"}
              </span>
            </div>

            <div className="w-full">
              <div
                className={`text-xs sm:text-sm font-black tracking-tight leading-tight ${
                  bookHubActiveTab === "slates" ? "text-slate-900" : "text-white"
                }`}
              >
                Board Slates
              </div>
              <div
                className={`text-[11px] sm:text-[12px] leading-snug mt-1 ${
                  bookHubActiveTab === "slates"
                    ? "text-slate-600 font-medium"
                    : "text-indigo-200/80"
                }`}
              >
                Chalkboard Photo Slides
              </div>
            </div>
          </button>
        </div>

        <div className="flex items-center justify-between text-[11.5px] font-mono text-indigo-200/90 px-1 pt-0.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              {bookHubActiveTab === "books"
                ? "Active: Chapter Books — Complete interactive lecture handbooks"
                : "Active: Board Slates — High-resolution chalkboard photos & formula captures"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
