/**
 * QuizTabHeader.tsx
 * Top switcher for Solo vs Battle mode & Quiz vs Leaderboard tabs
 */
import React from "react";
import { Trophy } from "lucide-react";

interface QuizTabHeaderProps {
  quizHubMode: "solo" | "battle";
  setQuizHubMode: (mode: "solo" | "battle") => void;
  activeTab: "quiz" | "leaderboard";
  setActiveTab: (tab: "quiz" | "leaderboard") => void;
  t: any;
}

export const QuizTabHeader: React.FC<QuizTabHeaderProps> = ({
  quizHubMode,
  setQuizHubMode,
  activeTab,
  setActiveTab,
  t
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#EFF1F5]">
      {/* 1. Mode Switcher (Solo vs Battle) */}
      <div className="flex items-center gap-1 bg-[#F6F7FB] p-1 rounded-xl border border-[#EFF1F5] self-start">
        <button
          type="button"
          onClick={() => setQuizHubMode("solo")}
          className={`px-3 py-1.5 rounded-lg text-[11.5px] font-black tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
            quizHubMode === "solo"
              ? "bg-[#796AEF] text-white shadow-xs"
              : "text-[#4A4E5A] hover:bg-[#EFF1F5]"
          }`}
        >
          <span>👤 {t.quizTabSolo}</span>
        </button>
        <button
          type="button"
          onClick={() => setQuizHubMode("battle")}
          className={`px-3 py-1.5 rounded-lg text-[11.5px] font-black tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
            quizHubMode === "battle"
              ? "bg-[#796AEF] text-white shadow-xs"
              : "text-[#4A4E5A] hover:bg-[#EFF1F5]"
          }`}
        >
          <span>👥 {t.quizTabBattle}</span>
        </button>
      </div>

      {/* 2. Tab Navigation (Only shown in Solo Mode) */}
      {quizHubMode === "solo" && (
        <div className="flex items-center gap-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("quiz")}
            className={`px-3 py-1.5 rounded-xl text-[11.5px] font-black tracking-wide transition-all cursor-pointer ${
              activeTab === "quiz"
                ? "bg-[#796AEF]/15 text-[#796AEF] border border-[#796AEF]/30"
                : "text-[#4A4E5A] hover:bg-[#F6F7FB]"
            }`}
          >
            Practice Quiz
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("leaderboard")}
            className={`px-3 py-1.5 rounded-xl text-[11.5px] font-black tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "leaderboard"
                ? "bg-[#796AEF] text-white shadow-xs"
                : "text-[#4A4E5A] hover:bg-[#F6F7FB]"
            }`}
          >
            <Trophy className={`w-3.5 h-3.5 ${activeTab === "leaderboard" ? "text-amber-300" : "text-[#796AEF]"}`} />
            <span>Leaderboard</span>
          </button>
        </div>
      )}
    </div>
  );
};
