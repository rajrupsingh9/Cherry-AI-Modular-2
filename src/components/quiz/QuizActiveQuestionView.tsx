/**
 * QuizActiveQuestionView.tsx
 * Active Question Interface: Race Track, Timer, Question Card, Options & Voice Quiz CTA
 */
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Crown,
  Zap,
  Flame,
  Clock,
  ArrowRight,
  Volume2
} from "lucide-react";
import { BattleRoomData } from "../../services/battleRoomService";
import { QuizQuestion, RankedBattleParticipant } from "./quizTypes";
import { auth } from "../../lib/firebase";

interface QuizActiveQuestionViewProps {
  activeBattleRoom: BattleRoomData | null;
  rankedBattleParticipants: RankedBattleParticipant[];
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  scorePopup: {
    points: number;
    speedBonus: number;
    streakBonus: number;
    streak: number;
  } | null;
  timePerQuestion: number;
  timeLeft: number;
  currentQuestion: QuizQuestion;
  selectedOption: number | null;
  handleSelectOption: (idx: number) => void;
  handleManualNext: () => void;
  handleVoiceQuizRequest: () => void;
}

export const QuizActiveQuestionView: React.FC<QuizActiveQuestionViewProps> = ({
  activeBattleRoom,
  rankedBattleParticipants,
  questions,
  currentQuestionIndex,
  scorePopup,
  timePerQuestion,
  timeLeft,
  currentQuestion,
  selectedOption,
  handleSelectOption,
  handleManualNext,
  handleVoiceQuizRequest
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-3.5 py-1 text-left"
    >
      {/* 1. BATTLE ARENA REAL-TIME RACE TRACK (Only shown in multiplayer mode) */}
      {activeBattleRoom && (
        <div className="bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E293B] p-3 rounded-2xl border border-slate-700/80 shadow-md text-white space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-amber-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
              <span>🏎️ LIVE SPRINT RACE</span>
              <span className="text-slate-400 font-normal">({activeBattleRoom.title})</span>
            </span>
            <span className="text-slate-400 font-bold">
              Q{currentQuestionIndex + 1}/{questions.length}
            </span>
          </div>

          {/* Race Track Container */}
          <div className="relative h-11 bg-slate-800/80 rounded-xl border border-slate-700/60 overflow-hidden px-3 flex items-center">
            {/* Finish Line Checkered Marker */}
            <div className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-7 bg-amber-400/20 border-r-2 border-dashed border-amber-400/80 flex items-center justify-center text-[10px]">
              🏁
            </div>

            {/* Avatars moving across track */}
            {rankedBattleParticipants.map((p, idx) => {
              const rawProgress = ((p.currentQuestionIndex || 0) / (questions.length || 1)) * 88;
              const progressPct = Math.min(88, Math.max(3, rawProgress));
              const isMe = p.isUser || p.uid === (auth.currentUser?.uid || "my_uid");

              return (
                <motion.div
                  key={p.uid || idx}
                  initial={false}
                  animate={{ left: `${progressPct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer z-10"
                >
                  <div className={`relative flex items-center justify-center w-7 h-7 rounded-full text-xs shadow-md border-2 transition-transform hover:scale-125 ${
                    isMe 
                      ? "border-[#796AEF] bg-[#1E293B] ring-2 ring-[#796AEF]/60 scale-110" 
                      : "border-slate-400 bg-slate-800"
                  }`}>
                    <span>{p.avatar || (isMe ? "🧑" : "🎓")}</span>
                    {idx === 0 && (
                      <Crown className="w-3 h-3 text-amber-400 fill-amber-400 absolute -top-2.5 -right-1 animate-bounce" />
                    )}
                  </div>
                  
                  <div className="bg-[#0F172A]/90 text-slate-200 border border-slate-700 text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded absolute -bottom-4 whitespace-nowrap shadow-sm">
                    {isMe ? "You" : p.name.split(" ")[0]} • {p.score || 0}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. SPEED BONUS POPUP FEEDBACK */}
      <AnimatePresence>
        {scorePopup && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="bg-gradient-to-r from-[#796AEF] to-[#6858E0] text-white px-3 py-1.5 rounded-xl shadow-md flex items-center justify-between text-[11px] font-mono font-black"
          >
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-bounce" />
              <span>+{scorePopup.points} PTS! (100 Base {scorePopup.speedBonus > 0 ? `+ ⚡${scorePopup.speedBonus} Speed Bonus` : ""})</span>
            </div>
            {scorePopup.streakBonus > 0 && (
              <span className="text-amber-300 flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full text-[10px]">
                <Flame className="w-3 h-3 fill-amber-300" />
                +{scorePopup.streakBonus} Streak Bonus
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Header info banner with active TIMER */}
      <div className="bg-[#FFFFFF] border border-[#EFF1F5] p-3 rounded-2xl shadow-xs flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] font-mono font-black uppercase tracking-wider text-[#4A4E5A]">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          <h6 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#796AEF]">
            {currentQuestion.cognitiveCategory || "CONCEPT TEST"}
          </h6>
        </div>

        {/* Countdown Ticking Timer */}
        <div className="flex items-center gap-2 bg-[#F6F7FB] px-3 py-1.5 rounded-xl border border-[#E2E8F0]">
          <Clock className={`w-3.5 h-3.5 text-[#796AEF] ${timePerQuestion > 0 && timeLeft <= 5 ? "animate-spin text-rose-500" : ""}`} />
          <span className={`text-[13px] font-black font-mono tracking-tight ${
            timePerQuestion === 0 
              ? "text-emerald-700" 
              : timeLeft <= 5 
              ? "text-rose-600 animate-pulse" 
              : "text-[#1E293B]"
          }`}>
            {timePerQuestion === 0 ? "Untimed 🧘" : `${timeLeft}s`}
          </span>
        </div>
      </div>

      {/* Timer visual progress bar (only rendered if timed) */}
      {timePerQuestion > 0 && (
        <div className="w-full h-1 bg-[#EFF1F5] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: `${Math.min(100, Math.max(0, (timeLeft / (timePerQuestion || 1)) * 100))}%` }}
            transition={{ duration: 1, ease: "linear" }}
            className={`h-full rounded-full ${timeLeft <= 5 ? "bg-rose-500" : "bg-[#796AEF]"}`}
          />
        </div>
      )}

      {/* 4. Question Details Card */}
      <div className="bg-[#FFFFFF] border border-[#EFF1F5] p-3.5 rounded-2xl shadow-xs space-y-2">
        <h5 className="text-[13.5px] sm:text-[14px] font-extrabold text-[#1E293B] leading-snug">
          {currentQuestion.question}
        </h5>
        
        <div className="flex items-center gap-2">
          <span className="text-[10.5px] font-mono font-bold uppercase tracking-wide bg-[#F6F7FB] border border-[#E2E8F0] text-[#4A4E5A] px-2 py-0.5 rounded-md">
            Concept: {currentQuestion.conceptTested}
          </span>
          <span className={`text-[10.5px] font-mono font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${
            currentQuestion.difficulty === "Easy" 
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
              : currentQuestion.difficulty === "Hard"
              ? "bg-rose-50 text-rose-600 border border-rose-100"
              : "bg-amber-50 text-amber-600 border border-amber-100"
          }`}>
            Diff: {currentQuestion.difficulty}
          </span>
        </div>
      </div>

      {/* 5. Options List */}
      <div className="grid grid-cols-1 gap-1.5">
        {currentQuestion.options.map((opt, oIdx) => {
          const isSelected = selectedOption === oIdx;
          let optionStyle = "border-[#E2E8F0] bg-[#FFFFFF] text-[#4A4E5A] hover:bg-[#F6F7FB]";
          if (isSelected) {
            optionStyle = "border-[#796AEF] bg-[#796AEF]/10 text-[#796AEF] font-extrabold shadow-xs";
          }

          return (
            <button
              key={oIdx}
              onClick={() => handleSelectOption(oIdx)}
              className={`p-3 border text-[12px] sm:text-[12.5px] rounded-xl text-left transition-all duration-200 cursor-pointer active:scale-98 flex items-center justify-between ${optionStyle}`}
            >
              <span className="leading-tight">{opt}</span>
              {isSelected && <div className="w-2 h-2 rounded-full bg-[#796AEF] shrink-0 ml-1" />}
            </button>
          );
        })}
      </div>

      {/* 6. Navigation (Next / Finish) Button */}
      <div className="pt-2">
        <button
          onClick={handleManualNext}
          disabled={selectedOption === null}
          className={`w-full py-3 px-3 text-white text-[11.5px] font-black rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs ${
            selectedOption !== null 
              ? "bg-[#796AEF] hover:bg-[#6858E0]" 
              : "bg-slate-200 cursor-not-allowed text-slate-400 opacity-60"
          }`}
        >
          <span>{currentQuestionIndex === questions.length - 1 ? "FINISH & GENERATE EXPLANATIONS" : "NEXT QUESTION"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 7. Cherry Ma'am Voice Quiz CTA */}
      <button
        onClick={handleVoiceQuizRequest}
        className="w-full py-2.5 bg-[#796AEF]/10 hover:bg-[#796AEF]/15 border border-[#796AEF]/25 text-[11px] font-black text-[#796AEF] rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
      >
        <Volume2 className="w-3.5 h-3.5 text-[#796AEF]" />
        <span>Ask Cherry Ma'am to voice-quiz about this topic! 🎙️</span>
      </button>
    </motion.div>
  );
};
