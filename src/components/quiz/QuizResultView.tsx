/**
 * QuizResultView.tsx
 * Master Quiz Results & Review View (Podium, Macro Score, Cognitive Diagnostics, Review CTA)
 */
import React from "react";
import { motion } from "motion/react";
import { Award, Zap, Flame, Brain } from "lucide-react";
import { BattleRoomData } from "../../services/battleRoomService";
import {
  QuizQuestion,
  QuizAnswerHistoryItem,
  QuizBlindspot,
  RankedBattleParticipant,
  CognitiveCategoryData
} from "./quizTypes";
import { QuizPodiumBanner } from "./QuizPodiumBanner";
import { QuizCognitiveBreakdown } from "./QuizCognitiveBreakdown";
import { QuizSolutionsReview } from "./QuizSolutionsReview";

interface QuizResultViewProps {
  activeBattleRoom: BattleRoomData | null;
  selectedSubject: string;
  rankedBattleParticipants: RankedBattleParticipant[];
  questions: QuizQuestion[];
  answersHistory: QuizAnswerHistoryItem[];
  battleScore: number;
  speedBonusTotal: number;
  streak: number;
  groupBlindspots: QuizBlindspot[];
  handleReviewWithCherryMaam: () => void;
  handleReturnToSetup: () => void;
  microCategoryData: CognitiveCategoryData[];
  conceptualStrengths: Array<{ concept: string; category: string }>;
  conceptualGrowthAreas: Array<{ concept: string; category: string; explanation?: string }>;
  isSavingToDb: boolean;
  dbStatus: "idle" | "saved" | "failed";
}

export const QuizResultView: React.FC<QuizResultViewProps> = ({
  activeBattleRoom,
  selectedSubject,
  rankedBattleParticipants,
  questions,
  answersHistory,
  battleScore,
  speedBonusTotal,
  streak,
  groupBlindspots,
  handleReviewWithCherryMaam,
  handleReturnToSetup,
  microCategoryData,
  conceptualStrengths,
  conceptualGrowthAreas,
  isSavingToDb,
  dbStatus
}) => {
  const correctCount = answersHistory.filter(h => h.isCorrect).length;
  const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="space-y-4 py-2"
    >
      {/* 1. WINNER PODIUM CARDS (1st, 2nd, 3rd Podium) */}
      <QuizPodiumBanner
        activeBattleRoom={activeBattleRoom}
        selectedSubject={selectedSubject}
        rankedBattleParticipants={rankedBattleParticipants}
      />

      {/* 2. MACRO SCORE SUMMARY CARD */}
      <div className="bg-[#FFFFFF] border border-[#EFF1F5] p-4 rounded-2xl shadow-xs text-left space-y-3">
        <div className="flex items-center justify-between border-b border-[#EFF1F5] pb-2.5">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
              Session Performance
            </span>
            <h5 className="text-[13px] font-extrabold text-[#1E293B]">
              Accuracy & Precision Score
            </h5>
          </div>
          <div className="text-right">
            <span className="text-xl font-black font-mono text-[#796AEF]">
              {correctCount} / {questions.length}
            </span>
            <span className="text-[10px] font-mono text-slate-400 block">
              {accuracy}% Accuracy
            </span>
          </div>
        </div>

        {/* Quick KPI badges */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#F6F7FB] p-2 rounded-xl border border-[#EFF1F5]">
            <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase block">Total Points</span>
            <span className="text-sm font-black font-mono text-[#1E293B]">
              {battleScore > 0 ? `${battleScore} pts` : `${correctCount * 100} pts`}
            </span>
          </div>
          <div className="bg-[#F6F7FB] p-2 rounded-xl border border-[#EFF1F5]">
            <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase block">Speed Bonus</span>
            <span className="text-sm font-black font-mono text-amber-600 flex items-center justify-center gap-0.5">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>+{speedBonusTotal}</span>
            </span>
          </div>
          <div className="bg-[#F6F7FB] p-2 rounded-xl border border-[#EFF1F5]">
            <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase block">Best Streak</span>
            <span className="text-sm font-black font-mono text-rose-600 flex items-center justify-center gap-0.5">
              <Flame className="w-3 h-3 text-rose-500 fill-rose-500" />
              <span>{streak}x</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. ONE-CLICK BLINDSPOT REVIEW WITH CHERRY MA'AM */}
      {groupBlindspots.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border border-amber-300/40 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-amber-900">
              <Award className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-[12px] font-black uppercase tracking-wider">
                Resolve {groupBlindspots.length} Group Blindspot{groupBlindspots.length > 1 ? "s" : ""} on Blackboard
              </span>
            </div>
            <p className="text-[11.5px] text-amber-800/90 font-medium">
              Cherry Ma'am will write step-by-step visual proofs and trap warnings for the questions you struggled with!
            </p>
          </div>
          <button
            onClick={handleReviewWithCherryMaam}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-amber-950 text-[11px] font-black rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 shrink-0 flex items-center gap-1.5"
          >
            <span>Review on Blackboard 🧑‍🏫📝</span>
          </button>
        </div>
      )}

      {/* 4. COGNITIVE CATEGORY PERFORMANCE & GROWTH AREAS */}
      <QuizCognitiveBreakdown
        microCategoryData={microCategoryData}
        conceptualStrengths={conceptualStrengths}
        conceptualGrowthAreas={conceptualGrowthAreas}
        isSavingToDb={isSavingToDb}
        dbStatus={dbStatus}
      />

      {/* 5. DETAILED SOLUTIONS REVIEW ACCORDION */}
      <QuizSolutionsReview
        questions={questions}
        answersHistory={answersHistory}
      />

      {/* 6. BOTTOM ACTION BUTTON */}
      <div className="pt-2">
        <button
          onClick={handleReturnToSetup}
          className="w-full py-3 bg-[#FFFFFF] hover:bg-[#F6F7FB] border border-[#796AEF]/30 text-[11.5px] font-black text-[#796AEF] rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-xs"
        >
          <Brain className="w-3.5 h-3.5 text-[#796AEF]" />
          <span>Configure & Take New Practice Quiz ⚡</span>
        </button>
      </div>
    </motion.div>
  );
};
