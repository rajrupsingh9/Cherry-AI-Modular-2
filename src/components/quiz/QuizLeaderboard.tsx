/**
 * QuizLeaderboard.tsx
 * Classroom Competitive Rank Leaderboard view
 */
import React from "react";
import { Trophy, RefreshCw, Target, Zap, Flame } from "lucide-react";
import { auth } from "../../lib/firebase";
import { QuizLeaderboardProps } from "./quizTypes";
import { useQuizLeaderboardData } from "./useQuizLeaderboardData";
import { QuizLeaderboardPeerRankings } from "./QuizLeaderboardPeerRankings";
import { QuizLeaderboardHistoryList } from "./QuizLeaderboardHistoryList";

export const QuizLeaderboard: React.FC<QuizLeaderboardProps> = ({
  subject,
  grade,
  onStartQuiz,
  onToast,
  refreshTrigger = 0
}) => {
  const {
    loading,
    filterSubject,
    setFilterSubject,
    fetchLeaderboard,
    filteredAttempts,
    metrics,
    peerLeaderboard
  } = useQuizLeaderboardData({ subject, grade, refreshTrigger });

  return (
    <div className="space-y-3.5 text-left animate-fade-in text-[#1E293B] py-1">
      {/* Banner */}
      <div className="bg-[#FFFFFF] border border-[#EFF1F5] p-3.5 rounded-2xl shadow-xs relative overflow-hidden flex items-center justify-between gap-3 text-[#1E293B]">
        <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
          <Trophy className="w-24 h-24 -mr-4 -mt-4 text-[#796AEF]" />
        </div>

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-[#796AEF]/10 text-[#796AEF] border border-[#796AEF]/20 px-2 py-0.5 rounded-full">
              Classroom Competitive Rank
            </span>
            {auth.currentUser ? (
              <span className="text-[10px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Firestore Synced
              </span>
            ) : (
              <span className="text-[10px] font-mono text-amber-600 font-bold">Guest Mode</span>
            )}
          </div>

          <h4 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-[#1E293B]">
            <span>Quiz Leaderboard & Stats</span>
          </h4>

          <p className="text-[11.5px] text-[#4A4E5A] font-medium leading-relaxed max-w-xs">
            Compare past practice quiz accuracy, test streaks, and syllabus concept mastery with classroom peers.
          </p>
        </div>

        <button
          onClick={() => {
            fetchLeaderboard();
            onToast("Leaderboard updated from Firestore! 🔄", "info");
          }}
          disabled={loading}
          className="bg-[#F6F7FB] hover:bg-[#EFF1F5] active:scale-95 text-[#1E293B] p-2 rounded-xl transition-all cursor-pointer shrink-0 relative z-10 border border-[#E2E8F0]"
          title="Refresh Leaderboard Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#796AEF]" : "text-[#4A4E5A]"}`} />
        </button>
      </div>

      {/* Student Rank Overview Card */}
      <div className="bg-[#FFFFFF] border border-[#EFF1F5] p-3.5 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#EFF1F5] pb-2">
          <div className="flex items-center gap-2">
            <div className="bg-[#796AEF]/10 border border-[#796AEF]/20 text-[#796AEF] p-1.5 rounded-xl font-black text-sm">
              {metrics.rankBadge}
            </div>
            <div>
              <span className="text-[9.5px] font-mono uppercase font-bold text-[#4A4E5A] block tracking-wider">
                Your Mastery Rank
              </span>
              <h5 className="text-[12px] font-black text-[#1E293B] uppercase tracking-wide">
                {metrics.rankTier}
              </h5>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9.5px] font-mono uppercase font-bold text-[#4A4E5A] block tracking-wider">
              Percentile Tier
            </span>
            <span className="text-[11px] font-black text-emerald-700 font-mono bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full inline-block">
              {metrics.rankPercentile}
            </span>
          </div>
        </div>

        {/* 4 Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-[#F6F7FB] border border-[#EFF1F5] p-2.5 rounded-xl space-y-0.5">
            <div className="flex items-center justify-between text-[#4A4E5A]">
              <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider">Accuracy</span>
              <Target className="w-3.5 h-3.5 text-[#796AEF]" />
            </div>
            <p className="text-sm font-black text-[#1E293B] font-mono">{metrics.avgAccuracy}%</p>
            <span className="text-[9.5px] text-[#4A4E5A] font-medium">Overall Score %</span>
          </div>

          <div className="bg-[#F6F7FB] border border-[#EFF1F5] p-2.5 rounded-xl space-y-0.5">
            <div className="flex items-center justify-between text-[#4A4E5A]">
              <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider">Quizzes</span>
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-sm font-black text-[#1E293B] font-mono">{metrics.totalQuizzes}</p>
            <span className="text-[9.5px] text-[#4A4E5A] font-medium">Total Taken</span>
          </div>

          <div className="bg-[#F6F7FB] border border-[#EFF1F5] p-2.5 rounded-xl space-y-0.5">
            <div className="flex items-center justify-between text-[#4A4E5A]">
              <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider">Best Score</span>
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-sm font-black text-[#1E293B] font-mono">{metrics.bestAccuracy}%</p>
            <span className="text-[9.5px] text-[#4A4E5A] font-medium">Peak Score</span>
          </div>

          <div className="bg-[#F6F7FB] border border-[#EFF1F5] p-2.5 rounded-xl space-y-0.5">
            <div className="flex items-center justify-between text-[#4A4E5A]">
              <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider">Streak</span>
              <Flame className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <p className="text-sm font-black text-[#1E293B] font-mono">{metrics.streak}🔥</p>
            <span className="text-[9.5px] text-[#4A4E5A] font-medium">Consecutive ≥60%</span>
          </div>
        </div>
      </div>

      {/* CLASSROOM PEER BENCHMARK LEADERBOARD TABLE */}
      <QuizLeaderboardPeerRankings
        peerLeaderboard={peerLeaderboard}
        grade={grade}
        subject={subject}
      />

      {/* PAST ATTEMPTS HISTORY LOG FROM FIRESTORE */}
      <QuizLeaderboardHistoryList
        filteredAttempts={filteredAttempts}
        subject={subject}
        filterSubject={filterSubject}
        setFilterSubject={setFilterSubject}
        loading={loading}
        onStartQuiz={onStartQuiz}
      />

      {/* Action to start a new quiz */}
      <button
        onClick={onStartQuiz}
        className="w-full py-3 bg-[#796AEF] hover:bg-[#6858E0] text-white text-[11.5px] font-black rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-xs"
      >
        <Zap className="w-3.5 h-3.5 fill-white text-white" />
        <span>START NEW QUIZ TO IMPROVE RANK ⚡</span>
      </button>
    </div>
  );
};
