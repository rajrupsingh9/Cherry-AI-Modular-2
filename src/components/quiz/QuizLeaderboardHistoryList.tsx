/**
 * QuizLeaderboardHistoryList.tsx
 * Past Quiz Attempts list with concept breakdown accordion & subject filter pills
 */
import React, { useState } from "react";
import { Clock, RefreshCw, Brain } from "lucide-react";

interface QuizLeaderboardHistoryListProps {
  filteredAttempts: any[];
  subject: string;
  filterSubject: string;
  setFilterSubject: (subj: string) => void;
  loading: boolean;
  onStartQuiz: () => void;
}

export const QuizLeaderboardHistoryList: React.FC<QuizLeaderboardHistoryListProps> = ({
  filteredAttempts,
  subject,
  filterSubject,
  setFilterSubject,
  loading,
  onStartQuiz
}) => {
  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(null);

  return (
    <div className="bg-[#FFFFFF] border border-[#EFF1F5] p-3.5 rounded-2xl shadow-xs space-y-2.5">
      <div className="flex items-center justify-between border-b border-[#EFF1F5] pb-2">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#796AEF]" />
          <h6 className="text-[11.5px] font-black uppercase tracking-wider text-[#1E293B]">
            Past Quiz History ({filteredAttempts.length})
          </h6>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1">
          {["all", subject, "General"].map((subKey) => (
            <button
              key={subKey}
              onClick={() => setFilterSubject(subKey)}
              className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-sm uppercase transition-all cursor-pointer ${
                filterSubject.toLowerCase() === subKey.toLowerCase()
                  ? "bg-[#796AEF] text-white shadow-2xs"
                  : "bg-[#F6F7FB] text-[#4A4E5A] border border-[#E2E8F0] hover:bg-[#EFF1F5]"
              }`}
            >
              {subKey}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-6 text-center space-y-2">
          <RefreshCw className="w-4 h-4 text-[#796AEF] animate-spin mx-auto" />
          <p className="text-[11px] font-mono text-[#4A4E5A] font-bold uppercase">
            Fetching Firestore Quiz Records...
          </p>
        </div>
      ) : filteredAttempts.length === 0 ? (
        <div className="py-6 text-center space-y-2 bg-[#F6F7FB] border border-dashed border-[#EFF1F5] rounded-xl">
          <Brain className="w-7 h-7 text-[#4A4E5A]/40 mx-auto" />
          <div className="space-y-0.5">
            <p className="text-[11.5px] font-bold text-[#1E293B]">No Past Quiz Attempts Logged Yet</p>
            <p className="text-[10.5px] text-[#4A4E5A]">
              Take your first aligned classroom quiz to appear on the Firestore leaderboard!
            </p>
          </div>
          <button
            onClick={onStartQuiz}
            className="mt-1 px-3 py-1.5 bg-[#796AEF] hover:bg-[#6858E0] text-white text-[11px] font-black rounded-xl inline-flex items-center gap-1 transition-all cursor-pointer shadow-xs"
          >
            <span>Take Your First Quiz Now ⚡</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar pr-0.5">
          {filteredAttempts.map((attempt, idx) => {
            const attemptAcc = attempt.accuracy !== undefined 
              ? attempt.accuracy 
              : Math.round(((attempt.score || 0) / (attempt.total || 1)) * 100);
            const isExpanded = expandedAttemptId === (attempt.id || `${idx}`);

            return (
              <div
                key={attempt.id || idx}
                className="bg-[#F6F7FB] border border-[#EFF1F5] p-2.5 rounded-xl space-y-1.5 hover:bg-white hover:border-[#E2E8F0] transition-all text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1">
                      <span className="text-[9.5px] font-mono font-bold text-[#4A4E5A] uppercase">
                        {attempt.formattedDate || "Recently"}
                      </span>
                      <span className="text-[8.5px] font-mono font-extrabold uppercase bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-xs">
                        {attempt.subject || subject}
                      </span>
                    </div>
                    <h6 className="text-[11.5px] font-extrabold text-[#1E293B] leading-tight">
                      {attempt.docName || "Classroom Live Quiz"}
                    </h6>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[11px] font-black font-mono px-2 py-0.5 rounded-full inline-block ${
                      attemptAcc >= 80 
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                        : attemptAcc >= 60 
                        ? "bg-amber-100 text-amber-800 border border-amber-200" 
                        : "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}>
                      {attempt.score}/{attempt.total} ({attemptAcc}%)
                    </span>
                  </div>
                </div>

                {attempt.history && attempt.history.length > 0 && (
                  <div className="pt-0.5">
                    <button
                      onClick={() => setExpandedAttemptId(isExpanded ? null : (attempt.id || `${idx}`))}
                      className="text-[9.5px] font-mono font-bold text-[#4A4E5A] hover:text-[#796AEF] flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? "Hide Concept Breakdown ▲" : "View Concept Breakdown ▼"}</span>
                    </button>
                    {isExpanded && (
                      <div className="mt-1.5 pt-1.5 border-t border-[#EFF1F5] space-y-1 animate-fade-in">
                        <span className="text-[9px] font-mono uppercase font-bold text-[#4A4E5A] block">
                          Tested Concepts:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {attempt.history.map((h: any, hIdx: number) => (
                            <span
                              key={hIdx}
                              className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded-xs border ${
                                h.isCorrect 
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold" 
                                  : "bg-rose-50 border-rose-200 text-rose-800"
                              }`}
                            >
                              {h.conceptTested || `Q${hIdx + 1}`} {h.isCorrect ? "✓" : "✗"}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
