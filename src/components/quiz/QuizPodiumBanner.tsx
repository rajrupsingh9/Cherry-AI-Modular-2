/**
 * QuizPodiumBanner.tsx
 * Winner Podium Display (1st, 2nd, 3rd places with avatars & pedestals)
 */
import React from "react";
import { motion } from "motion/react";
import { Crown, Trophy } from "lucide-react";
import { BattleRoomData } from "../../services/battleRoomService";
import { RankedBattleParticipant } from "./quizTypes";

interface QuizPodiumBannerProps {
  activeBattleRoom: BattleRoomData | null;
  selectedSubject: string;
  rankedBattleParticipants: RankedBattleParticipant[];
}

export const QuizPodiumBanner: React.FC<QuizPodiumBannerProps> = ({
  activeBattleRoom,
  selectedSubject,
  rankedBattleParticipants
}) => {
  return (
    <div className="bg-gradient-to-b from-[#1E293B] via-[#2A334A] to-[#1E293B] p-4 rounded-3xl border border-slate-700/50 shadow-lg text-center relative overflow-hidden space-y-4 text-white">
      <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
        <Trophy className="w-24 h-24 text-amber-300" />
      </div>

      {/* Title & Badge */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full text-amber-300 text-[10.5px] font-mono font-black uppercase tracking-wider">
          <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-bounce" />
          <span>{activeBattleRoom ? "Battle Arena Grand Finale" : "Quiz Champion Podium"}</span>
        </div>
        <h4 className="text-sm font-black tracking-tight text-white">
          {activeBattleRoom ? activeBattleRoom.title : `${selectedSubject} Knowledge Sprint`}
        </h4>
        <p className="text-[11px] text-slate-300 font-mono">
          Final Synchronized Match Results & Speed Standings
        </p>
      </div>

      {/* 3-Column Podium Display (1st Center, 2nd Left, 3rd Right) */}
      <div className="flex items-end justify-center gap-2 sm:gap-4 pt-4 pb-2 px-1">
        {/* 2nd Place (Silver) */}
        {rankedBattleParticipants.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 max-w-[95px] sm:max-w-[110px] flex flex-col items-center"
          >
            <div className="relative mb-1.5 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-300 flex items-center justify-center text-lg shadow-md">
                {rankedBattleParticipants[1].avatar || "👧"}
              </div>
              <span className="text-[10px] font-bold text-slate-300 mt-1 truncate max-w-[85px]">
                {rankedBattleParticipants[1].isUser ? "You" : rankedBattleParticipants[1].name.split(" ")[0]}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {rankedBattleParticipants[1].score || 0} pts
              </span>
            </div>
            {/* Silver Pedestal */}
            <div className="w-full h-18 bg-gradient-to-b from-slate-400/30 to-slate-900/60 rounded-t-xl border-t-2 border-x border-slate-300/40 flex flex-col items-center justify-center p-1.5 shadow-inner">
              <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center shadow-sm">
                🥈 2
              </div>
              <span className="text-[8.5px] font-mono text-slate-400 mt-1">
                {rankedBattleParticipants[1].accuracy || 80}% ACC
              </span>
            </div>
          </motion.div>
        )}

        {/* 1st Place (Gold Champion) */}
        {rankedBattleParticipants.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 max-w-[110px] sm:max-w-[130px] flex flex-col items-center -mt-4 z-10"
          >
            <div className="relative mb-2 flex flex-col items-center">
              <Crown className="w-5 h-5 text-amber-300 fill-amber-300 absolute -top-4 animate-bounce" />
              <div className="w-13 h-13 rounded-full bg-[#1E293B] border-3 border-amber-300 ring-4 ring-amber-400/40 flex items-center justify-center text-2xl shadow-xl">
                {rankedBattleParticipants[0].avatar || "🧑"}
              </div>
              <span className="text-[11px] font-black text-amber-200 mt-1 truncate max-w-[95px] flex items-center gap-1">
                {rankedBattleParticipants[0].isUser ? "You 👑" : rankedBattleParticipants[0].name.split(" ")[0]}
              </span>
              <span className="text-[11px] font-mono font-black text-amber-300">
                {rankedBattleParticipants[0].score || 0} pts
              </span>
            </div>
            {/* Gold Pedestal */}
            <div className="w-full h-26 bg-gradient-to-b from-amber-500/40 via-amber-600/30 to-amber-950/80 rounded-t-2xl border-t-3 border-x-2 border-amber-400/80 flex flex-col items-center justify-center p-2 shadow-2xl">
              <div className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shadow-md">
                🥇 1
              </div>
              <span className="text-[9.5px] font-mono font-black text-amber-200 uppercase mt-1">
                CHAMPION
              </span>
              <span className="text-[9px] font-mono text-amber-300 font-bold">
                {rankedBattleParticipants[0].accuracy || 90}% ACC
              </span>
            </div>
          </motion.div>
        )}

        {/* 3rd Place (Bronze) */}
        {rankedBattleParticipants.length > 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1 max-w-[95px] sm:max-w-[110px] flex flex-col items-center"
          >
            <div className="relative mb-1.5 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-amber-700 flex items-center justify-center text-lg shadow-md">
                {rankedBattleParticipants[2].avatar || "👦"}
              </div>
              <span className="text-[10px] font-bold text-slate-300 mt-1 truncate max-w-[85px]">
                {rankedBattleParticipants[2].isUser ? "You" : rankedBattleParticipants[2].name.split(" ")[0]}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {rankedBattleParticipants[2].score || 0} pts
              </span>
            </div>
            {/* Bronze Pedestal */}
            <div className="w-full h-14 bg-gradient-to-b from-amber-700/30 to-slate-900/60 rounded-t-xl border-t-2 border-x border-amber-700/40 flex flex-col items-center justify-center p-1.5 shadow-inner">
              <div className="w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-sm">
                🥉 3
              </div>
              <span className="text-[8.5px] font-mono text-slate-400 mt-1">
                {rankedBattleParticipants[2].accuracy || 70}% ACC
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
