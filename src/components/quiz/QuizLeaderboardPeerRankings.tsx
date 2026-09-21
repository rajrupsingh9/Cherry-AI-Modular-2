/**
 * QuizLeaderboardPeerRankings.tsx
 * Classroom Peer Standings Benchmark Table
 */
import React from "react";
import { Crown } from "lucide-react";

interface PeerEntry {
  id: string;
  name: string;
  scoreAcc: number;
  quizzes: number;
  grade: string;
  subject: string;
  badge: string;
  isCurrentUser: boolean;
  rank: number;
}

interface QuizLeaderboardPeerRankingsProps {
  peerLeaderboard: PeerEntry[];
  grade: string;
  subject: string;
}

export const QuizLeaderboardPeerRankings: React.FC<QuizLeaderboardPeerRankingsProps> = ({
  peerLeaderboard,
  grade,
  subject
}) => {
  return (
    <div className="bg-[#FFFFFF] border border-[#EFF1F5] p-3.5 rounded-2xl shadow-xs space-y-2.5">
      <div className="flex items-center justify-between border-b border-[#EFF1F5] pb-2">
        <div className="flex items-center gap-1.5">
          <Crown className="w-4 h-4 text-amber-500" />
          <h6 className="text-[11.5px] font-black uppercase tracking-wider text-[#1E293B]">
            Classroom Peer Standings
          </h6>
        </div>
        <span className="text-[10px] font-mono text-[#4A4E5A] font-bold">
          {grade} • {subject}
        </span>
      </div>

      <div className="space-y-1.5">
        {peerLeaderboard.map((peer) => {
          const isMe = peer.isCurrentUser;
          let rankBadgeClass = "bg-[#EFF1F5] text-[#4A4E5A]";
          if (peer.rank === 1) rankBadgeClass = "bg-amber-400 text-amber-950 font-black";
          else if (peer.rank === 2) rankBadgeClass = "bg-slate-300 text-slate-900 font-black";
          else if (peer.rank === 3 && !isMe) rankBadgeClass = "bg-amber-600 text-white font-black";

          return (
            <div
              key={peer.id}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                isMe
                  ? "bg-[#796AEF]/5 border-[#796AEF] shadow-2xs font-extrabold"
                  : "bg-[#FFFFFF] border-[#EFF1F5] text-[#1E293B] hover:bg-[#F6F7FB]"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg text-[10px] font-mono flex items-center justify-center shrink-0 ${rankBadgeClass}`}>
                  #{peer.rank}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11.5px] font-bold text-[#1E293B]">
                      {peer.name}
                    </span>
                    {isMe && (
                      <span className="bg-[#796AEF] text-white text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded-full">
                        YOU
                      </span>
                    )}
                  </div>
                  <span className="text-[9.5px] text-[#4A4E5A] block font-medium">
                    {peer.badge} • {peer.quizzes} Quizzes
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[12px] font-mono font-black text-[#1E293B] block">
                  {peer.scoreAcc}%
                </span>
                <span className="text-[8.5px] text-[#4A4E5A] uppercase font-mono">Avg Accuracy</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
