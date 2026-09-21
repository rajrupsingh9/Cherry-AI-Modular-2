/**
 * useQuizBattleSync.ts
 * Real-time multiplayer synchronization, speed bonus & podium standings
 */
import { useState, useEffect, useMemo } from "react";
import { auth } from "../../lib/firebase";
import {
  BattleRoomData,
  BattleParticipant,
  subscribeToBattleParticipants
} from "../../services/battleRoomService";
import { QuizAnswerHistoryItem, QuizQuestion, RankedBattleParticipant } from "./quizTypes";

interface UseQuizBattleSyncProps {
  activeBattleRoom: BattleRoomData | null;
  isQuizCompleted: boolean;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answersHistory: QuizAnswerHistoryItem[];
}

export function useQuizBattleSync({
  activeBattleRoom,
  isQuizCompleted,
  questions,
  currentQuestionIndex,
  answersHistory
}: UseQuizBattleSyncProps) {
  const [battleParticipants, setBattleParticipants] = useState<BattleParticipant[]>([]);
  const [battleScore, setBattleScore] = useState<number>(0);
  const [speedBonusTotal, setSpeedBonusTotal] = useState<number>(0);
  const [scorePopup, setScorePopup] = useState<{
    points: number;
    speedBonus: number;
    streakBonus: number;
    streak: number;
  } | null>(null);

  // Subscribe to live battle participants or seed demo peers
  useEffect(() => {
    if (!activeBattleRoom?.roomId) return;

    const myUid = auth.currentUser?.uid || "my_uid";
    const myName = auth.currentUser?.displayName || "You";

    const seedParticipants: BattleParticipant[] = [
      {
        uid: myUid,
        name: myName,
        isHost: activeBattleRoom.hostUid === myUid,
        isReady: true,
        score: 0,
        correctCount: 0,
        currentQuestionIndex: 0,
        avatar: "🧑"
      },
      {
        uid: "peer_ananya",
        name: "Ananya Sharma",
        isHost: false,
        isReady: true,
        score: 0,
        correctCount: 0,
        currentQuestionIndex: 0,
        avatar: "👧"
      },
      {
        uid: "peer_rohan",
        name: "Rohan Verma",
        isHost: false,
        isReady: true,
        score: 0,
        correctCount: 0,
        currentQuestionIndex: 0,
        avatar: "👦"
      },
      {
        uid: "peer_priya",
        name: "Priya Patel",
        isHost: false,
        isReady: true,
        score: 0,
        correctCount: 0,
        currentQuestionIndex: 0,
        avatar: "👩"
      }
    ];
    setBattleParticipants(seedParticipants);

    const unsub = subscribeToBattleParticipants(activeBattleRoom.roomId, (liveList) => {
      if (liveList && liveList.length > 0) {
        setBattleParticipants(liveList);
      }
    });

    return () => {
      if (unsub) unsub();
    };
  }, [activeBattleRoom?.roomId]);

  // Sync realistic friend race progress on question change
  useEffect(() => {
    if (!activeBattleRoom || isQuizCompleted || questions.length === 0) return;

    setBattleParticipants(prev => {
      const myUid = auth.currentUser?.uid || "my_uid";
      return prev.map(p => {
        if (p.uid === myUid || p.name === "You") {
          return {
            ...p,
            currentQuestionIndex,
            score: battleScore,
            correctCount: answersHistory.filter(h => h.isCorrect).length
          };
        }
        const targetQ = Math.min(
          questions.length,
          Math.max(0, currentQuestionIndex + (Math.random() > 0.6 ? 1 : 0))
        );
        const simCorrect = Math.max(0, Math.round(targetQ * 0.8));
        const simSpeed = simCorrect * 35;
        const simScore = (simCorrect * 100) + simSpeed;
        return {
          ...p,
          currentQuestionIndex: targetQ,
          score: simScore,
          correctCount: simCorrect
        };
      });
    });
  }, [currentQuestionIndex, battleScore, isQuizCompleted, activeBattleRoom, questions.length]);

  // Ranked Battle Participants for Podium (1st, 2nd, 3rd)
  const rankedBattleParticipants: RankedBattleParticipant[] = useMemo(() => {
    const myUid = auth.currentUser?.uid || "my_uid";
    const myName = auth.currentUser?.displayName || "You";
    const myCorrect = answersHistory.filter(h => h.isCorrect).length;
    const myAcc = questions.length > 0 ? Math.round((myCorrect / questions.length) * 100) : 0;

    const list: RankedBattleParticipant[] = battleParticipants.map(p => {
      if (p.uid === myUid || p.name === "You") {
        return {
          ...p,
          score: battleScore,
          correctCount: myCorrect,
          accuracy: myAcc,
          avatar: "🧑",
          isUser: true
        };
      }
      return {
        ...p,
        accuracy: p.accuracy || Math.round(((p.correctCount || 0) / (questions.length || 1)) * 100),
        isUser: false
      };
    });

    if (!list.some(p => p.isUser)) {
      list.push({
        uid: myUid,
        name: myName,
        isHost: activeBattleRoom ? activeBattleRoom.hostUid === myUid : true,
        isReady: true,
        score: battleScore,
        correctCount: myCorrect,
        accuracy: myAcc,
        avatar: "🧑",
        isUser: true
      });
    }

    return list.sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [battleParticipants, battleScore, answersHistory, questions.length, activeBattleRoom]);

  return {
    battleParticipants,
    setBattleParticipants,
    battleScore,
    setBattleScore,
    speedBonusTotal,
    setSpeedBonusTotal,
    scorePopup,
    setScorePopup,
    rankedBattleParticipants
  };
}
