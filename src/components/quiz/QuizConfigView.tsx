/**
 * QuizConfigView.tsx
 * Pre-Quiz Configuration Form (Subject, Topics, Count, Timer, Exam Level, Difficulty)
 */
import React from "react";
import { Brain, BookOpen, GraduationCap, Trophy, Clock, AlertCircle } from "lucide-react";
import { ExtractedTopicItem } from "./quizTypes";
import { QuizConfigTopicSelector } from "./QuizConfigTopicSelector";

interface QuizConfigViewProps {
  selectedSubject: string;
  setSelectedSubject: (subj: string) => void;
  grade: string;
  extractedTopics: ExtractedTopicItem[];
  selectedTopicIndices: number[];
  handleToggleTopic: (idx: number) => void;
  handleSelectAllTopics: () => void;
  handleSelectDiscussedOnly: () => void;
  handleSelectActiveTopicOnly: () => void;
  numQuestions: number;
  setNumQuestions: (n: number) => void;
  timePerQuestion: number;
  setTimePerQuestion: (s: number) => void;
  examLevel: "Board" | "Competition";
  setExamLevel: (lvl: "Board" | "Competition") => void;
  difficulty: "Easy" | "Medium" | "Hard";
  setDifficulty: (diff: "Easy" | "Medium" | "Hard") => void;
  totalDurationFormatted: string;
  handleStartQuiz: () => void;
  t: any;
}

export const QuizConfigView: React.FC<QuizConfigViewProps> = ({
  selectedSubject,
  setSelectedSubject,
  grade,
  extractedTopics,
  selectedTopicIndices,
  handleToggleTopic,
  handleSelectAllTopics,
  handleSelectDiscussedOnly,
  handleSelectActiveTopicOnly,
  numQuestions,
  setNumQuestions,
  timePerQuestion,
  setTimePerQuestion,
  examLevel,
  setExamLevel,
  difficulty,
  setDifficulty,
  totalDurationFormatted,
  handleStartQuiz,
  t
}) => {
  return (
    <div className="space-y-4 py-2 animate-fade-in text-[#1E293B]">
      {/* Banner */}
      <div className="bg-[#FFFFFF] p-3.5 rounded-2xl border border-[#EFF1F5] shadow-xs flex gap-3 items-center">
        <div className="bg-[#796AEF]/10 p-2 rounded-xl border border-[#796AEF]/20 shrink-0">
          <Brain className="w-6 h-6 text-[#796AEF]" />
        </div>
        <div className="space-y-0.5 text-left">
          <h4 className="text-[12.5px] sm:text-[13px] font-black uppercase tracking-wider text-[#1E293B]">
            Smart Quiz Desk • Topic & Classroom Sync
          </h4>
          <p className="text-[12px] text-[#4A4E5A] leading-relaxed font-medium">
            Choose your subject, previously discussed chalkboard topics, question count, and timer settings to generate a customized live quiz.
          </p>
        </div>
      </div>

      {/* 1. Subject Selection Bar */}
      <div className="bg-[#FFFFFF] p-3.5 border border-[#EFF1F5] rounded-2xl shadow-xs space-y-2.5 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A4E5A] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#796AEF]" />
            <span>Target Subject:</span>
          </span>
          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
            <GraduationCap className="w-3 h-3 text-emerald-600" />
            <span>{grade || "Class 10"} • {selectedSubject}</span>
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {["Mathematics", "Physics", "Chemistry", "Biology", "Science", "General"].map((subj) => (
            <button
              key={subj}
              type="button"
              onClick={() => setSelectedSubject(subj)}
              className={`py-1.5 px-3 text-[11.5px] font-bold rounded-xl border transition-all cursor-pointer ${
                selectedSubject.toLowerCase() === subj.toLowerCase()
                  ? "bg-[#796AEF] text-white border-[#796AEF] shadow-xs"
                  : "bg-[#F6F7FB] hover:bg-[#EFF1F5] text-[#4A4E5A] border-[#E2E8F0]"
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Topics Selector Component */}
      <QuizConfigTopicSelector
        extractedTopics={extractedTopics}
        selectedTopicIndices={selectedTopicIndices}
        handleToggleTopic={handleToggleTopic}
        handleSelectAllTopics={handleSelectAllTopics}
        handleSelectDiscussedOnly={handleSelectDiscussedOnly}
        handleSelectActiveTopicOnly={handleSelectActiveTopicOnly}
      />

      {/* 3. Question Count, Timer & Difficulty Form */}
      <div className="bg-[#FFFFFF] p-4 border border-[#EFF1F5] rounded-2xl shadow-xs space-y-4 text-left">
        {/* Question Count */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#4A4E5A] flex justify-between">
            <span>Number of Questions:</span>
            <span className="text-[#796AEF] font-black font-mono">{numQuestions} Questions</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[3, 5, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setNumQuestions(num)}
                className={`py-2 text-[11.5px] font-bold rounded-xl border transition-all cursor-pointer ${
                  numQuestions === num
                    ? "border-[#796AEF] bg-[#796AEF] text-white font-extrabold shadow-xs"
                    : "border-[#E2E8F0] bg-[#F6F7FB] hover:bg-[#EFF1F5] text-[#4A4E5A]"
                }`}
              >
                {num} Questions
              </button>
            ))}
          </div>
        </div>

        {/* Time Limit Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#4A4E5A] flex justify-between">
            <span>Time Limit Per Question:</span>
            <span className="text-[#796AEF] font-black font-mono">
              {timePerQuestion === 0 ? "Untimed (Relaxed Mode)" : `${timePerQuestion}s / question`}
            </span>
          </label>
          <div className="grid grid-cols-5 gap-1">
            {[15, 30, 45, 60, 0].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setTimePerQuestion(sec)}
                className={`py-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                  timePerQuestion === sec
                    ? "border-[#796AEF] bg-[#796AEF] text-white font-extrabold shadow-xs"
                    : "border-[#E2E8F0] bg-[#F6F7FB] hover:bg-[#EFF1F5] text-[#4A4E5A]"
                }`}
              >
                {sec === 0 ? "Untimed 🧘" : `${sec}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Exam Standard & Target */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#4A4E5A] flex justify-between">
            <span>Exam Standard & Target:</span>
            <span className={`font-black font-mono text-[11px] uppercase ${
              examLevel === "Competition" ? "text-amber-700" : "text-[#796AEF]"
            }`}>
              {examLevel === "Competition" ? `${t.levelCompetition || "Competition"} 🏆` : `${t.levelBoard || "School / Board Exam"} 🏫`}
            </span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setExamLevel("Board")}
              className={`py-2 px-2.5 text-[11.5px] font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                examLevel === "Board"
                  ? "border-[#796AEF] bg-[#796AEF] text-white font-extrabold shadow-xs"
                  : "border-[#E2E8F0] bg-[#F6F7FB] hover:bg-[#EFF1F5] text-[#4A4E5A]"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{t.levelBoard || "School / Board Exam"}</span>
            </button>
            <button
              type="button"
              onClick={() => setExamLevel("Competition")}
              className={`py-2 px-2.5 text-[11.5px] font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                examLevel === "Competition"
                  ? "border-amber-600 bg-amber-600 text-white font-extrabold shadow-xs"
                  : "border-[#E2E8F0] bg-[#F6F7FB] hover:bg-[#EFF1F5] text-[#4A4E5A]"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>{t.levelCompetition || "JEE / NEET / Olympiad"}</span>
            </button>
          </div>
        </div>

        {/* Difficulty Level */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#4A4E5A] flex justify-between">
            <span>Difficulty Level:</span>
            <span className={`font-black font-mono text-[11px] uppercase ${
              difficulty === "Easy" ? "text-emerald-600" : difficulty === "Hard" ? "text-rose-600" : "text-amber-600"
            }`}>{difficulty} Level</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["Easy", "Medium", "Hard"] as const).map((level) => {
              const isSelected = difficulty === level;
              let activeStyle = "";
              if (isSelected) {
                if (level === "Easy") activeStyle = "border-emerald-500 bg-emerald-500 text-white font-extrabold shadow-xs";
                else if (level === "Hard") activeStyle = "border-rose-500 bg-rose-500 text-white font-extrabold shadow-xs";
                else activeStyle = "border-amber-500 bg-amber-500 text-white font-extrabold shadow-xs";
              } else {
                activeStyle = "border-[#E2E8F0] bg-[#F6F7FB] hover:bg-[#EFF1F5] text-[#4A4E5A]";
              }
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`py-2 text-[11.5px] font-bold rounded-xl border transition-all cursor-pointer ${activeStyle}`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary stats */}
        <div className="pt-3 border-t border-[#EFF1F5] flex items-center justify-between text-[11px] font-mono text-[#4A4E5A] font-medium">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#796AEF]" />
            <span>Estimated Duration:</span>
          </div>
          <span className="font-extrabold text-[#1E293B] bg-[#F6F7FB] border border-[#EFF1F5] px-2 py-0.5 rounded-sm">
            {totalDurationFormatted}
          </span>
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-amber-500/5 border border-amber-500/15 p-3.5 rounded-xl flex items-start gap-2.5 text-[11.5px] leading-relaxed text-[#4A4E5A] font-medium text-left">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-amber-800 block uppercase tracking-wider text-[10px]">Important Classroom Guidelines:</span>
          <p>1. Questions are generated strictly matching your selected topics and chalkboard formulas.</p>
          <p>2. Going back or backtracking is disabled. Lock your choices carefully!</p>
          <p>3. {timePerQuestion === 0 ? "Untimed mode active: Take your time to solve each question carefully." : "If timer ticks to zero, the question automatically advances."}</p>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStartQuiz}
        disabled={selectedTopicIndices.length === 0}
        className={`w-full py-3 text-[12px] font-black rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-md ${
          selectedTopicIndices.length === 0
            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
            : "bg-[#796AEF] hover:bg-[#6858E0] text-white"
        }`}
      >
        <span className="text-base">▶</span>
        <span>START TARGETED CLASS QUIZ ({selectedTopicIndices.length} TOPIC{selectedTopicIndices.length > 1 ? "S" : ""}) ⚡</span>
      </button>
    </div>
  );
};
