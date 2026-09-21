/**
 * useQuizLeaderboardData.ts
 * Fetches past quiz attempts from Firestore or guest localStorage, computes rankings & metric aggregates
 */
import { useState, useEffect, useMemo } from "react";
import { auth, db } from "../../lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

interface UseQuizLeaderboardDataProps {
  subject: string;
  grade: string;
  refreshTrigger?: number;
}

export function useQuizLeaderboardData({
  subject,
  grade,
  refreshTrigger = 0
}: UseQuizLeaderboardDataProps) {
  const [pastAttempts, setPastAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState<string>("all");

  const fetchLeaderboard = async () => {
    setLoading(true);
    const uid = auth.currentUser?.uid;
    const isGuest = !uid || uid === "local_guest_student" || uid.startsWith("local_");

    if (isGuest) {
      try {
        const guestSubject = JSON.parse(localStorage.getItem(`guest_quiz_attempts_${subject}`) || "[]");
        const guestGeneral = JSON.parse(localStorage.getItem(`guest_quiz_attempts_General`) || "[]");
        const guestMath = JSON.parse(localStorage.getItem(`guest_quiz_attempts_Mathematics`) || "[]");
        const guestSci = JSON.parse(localStorage.getItem(`guest_quiz_attempts_Science`) || "[]");

        const combinedMap = new Map();
        [...guestSubject, ...guestGeneral, ...guestMath, ...guestSci].forEach(item => {
          const key = (item.timestamp || "") + "_" + (item.score || "0");
          if (!combinedMap.has(key)) {
            combinedMap.set(key, item);
          }
        });
        const list = Array.from(combinedMap.values()).sort((a: any, b: any) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        setPastAttempts(list);
      } catch (err) {
        console.error("Error fetching guest leaderboard:", err);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const attemptsRef = collection(db, "studentProfiles", uid, "quizAttempts");
      const q = query(attemptsRef, orderBy("timestamp", "desc"), limit(30));
      const querySnapshot = await getDocs(q);
      const fetched: any[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let formattedDate = "Recently";
        if (data.timestamp?.toDate) {
          formattedDate = data.timestamp.toDate().toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });
        } else if (data.timestamp && typeof data.timestamp === "string") {
          formattedDate = new Date(data.timestamp).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });
        }
        fetched.push({
          id: docSnap.id,
          ...data,
          formattedDate
        });
      });
      setPastAttempts(fetched);
    } catch (err) {
      console.warn("Firestore quiz leaderboard fetch error (using local guest data):", err);
      try {
        const guestSubject = JSON.parse(localStorage.getItem(`guest_quiz_attempts_${subject}`) || "[]");
        setPastAttempts(guestSubject);
      } catch (e) {
        console.error("Guest storage fallback error:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [subject, refreshTrigger]);

  const filteredAttempts = useMemo(() => {
    if (filterSubject === "all") return pastAttempts;
    return pastAttempts.filter((a) => (a.subject || "").toLowerCase() === filterSubject.toLowerCase());
  }, [pastAttempts, filterSubject]);

  const metrics = useMemo(() => {
    const totalQuizzes = pastAttempts.length;
    if (totalQuizzes === 0) {
      return {
        totalQuizzes: 0,
        avgAccuracy: 0,
        bestAccuracy: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        streak: 0,
        rankTier: "Class Candidate 🌟",
        rankPercentile: "Unranked",
        rankBadge: "🌟"
      };
    }

    const totalQuestions = pastAttempts.reduce((acc, a) => acc + (a.total || 0), 0);
    const totalCorrect = pastAttempts.reduce((acc, a) => acc + (a.score || 0), 0);
    const avgAcc = Math.round((totalCorrect / (totalQuestions || 1)) * 100);
    const bestAcc = Math.max(...pastAttempts.map((a) => a.accuracy !== undefined ? a.accuracy : Math.round(((a.score || 0) / (a.total || 1)) * 100)));

    let streakCount = 0;
    for (const attempt of pastAttempts) {
      const acc = attempt.accuracy !== undefined ? attempt.accuracy : Math.round(((attempt.score || 0) / (attempt.total || 1)) * 100);
      if (acc >= 60) {
        streakCount++;
      } else {
        break;
      }
    }

    let tier = "Rising Star 🥉";
    let percentile = "Top 30%";
    let badge = "🥉";
    if (avgAcc >= 90 && totalQuizzes >= 3) {
      tier = "Grandmaster Scholar 🏆";
      percentile = "Top 1%";
      badge = "🏆";
    } else if (avgAcc >= 80 && totalQuizzes >= 2) {
      tier = "Diamond Achiever 💎";
      percentile = "Top 5%";
      badge = "💎";
    } else if (avgAcc >= 65) {
      tier = "Gold Explorer 🥇";
      percentile = "Top 15%";
      badge = "🥇";
    } else if (avgAcc >= 50) {
      tier = "Silver Challenger 🥈";
      percentile = "Top 25%";
      badge = "🥈";
    }

    return {
      totalQuizzes,
      avgAccuracy: avgAcc,
      bestAccuracy: bestAcc,
      totalQuestions,
      totalCorrect,
      streak: streakCount,
      rankTier: tier,
      rankPercentile: percentile,
      rankBadge: badge
    };
  }, [pastAttempts]);

  const peerLeaderboard = useMemo(() => {
    const studentName = auth.currentUser?.displayName || "You (Student)";
    const benchmarkPeers = [
      { id: "p1", name: "Aarav Sharma", scoreAcc: 96, quizzes: 18, grade: "Class 10", subject: "Mathematics", badge: "🏆 Grandmaster", isCurrentUser: false },
      { id: "p2", name: "Ananya Patel", scoreAcc: 92, quizzes: 15, grade: "Class 10", subject: "Science", badge: "💎 Diamond", isCurrentUser: false },
      { id: "p4", name: "Rohan Verma", scoreAcc: 78, quizzes: 12, grade: "Class 10", subject: "Physics", badge: "🥇 Gold", isCurrentUser: false },
      { id: "p5", name: "Priya Nair", scoreAcc: 70, quizzes: 9, grade: "Class 10", subject: "General", badge: "🥈 Silver", isCurrentUser: false }
    ];

    const currentStudentEntry = {
      id: "current_user",
      name: studentName,
      scoreAcc: metrics.avgAccuracy,
      quizzes: metrics.totalQuizzes,
      grade: grade,
      subject: subject,
      badge: metrics.rankTier,
      isCurrentUser: true
    };

    const combined = [...benchmarkPeers, currentStudentEntry].sort((a, b) => {
      if (b.scoreAcc !== a.scoreAcc) return b.scoreAcc - a.scoreAcc;
      return b.quizzes - a.quizzes;
    });

    return combined.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  }, [metrics, grade, subject]);

  return {
    pastAttempts,
    loading,
    filterSubject,
    setFilterSubject,
    fetchLeaderboard,
    filteredAttempts,
    metrics,
    peerLeaderboard
  };
}
