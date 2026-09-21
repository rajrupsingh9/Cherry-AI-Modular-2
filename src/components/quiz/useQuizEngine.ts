/**
 * useQuizEngine.ts
 * Core question loader, ticking timer, scoring engine & persistence hook
 */
import { useState, useEffect, useMemo, useRef, Dispatch, SetStateAction } from "react";
import { BattleRoomData, updateParticipantBattleProgress } from "../../services/battleRoomService";
import { auth } from "../../lib/firebase";
import { QuizQuestion, QuizAnswerHistoryItem, QUIZ_POOL } from "./quizTypes";
import {
  computeMicroCategoryData,
  computeConceptualStrengths,
  computeConceptualGrowthAreas,
  computeGroupBlindspots,
  persistQuizAttempt
} from "./quizAnalytics";

interface UseQuizEngineProps {
  selectedSubject: string;
  grade: string;
  examLevel: "Board" | "Competition";
  activeTopicIndex: number;
  topics: string[];
  selectedTopicTitles: string[];
  selectedTopicIndices: number[];
  compiledDiscussedNotes: { notesMap: Record<number, string>; formulas: string[]; totalDiscussedTopics: number };
  customBoardContent: string;
  topicBoardsContent: Record<number, string>;
  timePerQuestion: number;
  difficulty: "Easy" | "Medium" | "Hard";
  sessionId: string | null;
  onToast: (text: string, type: "success" | "info" | "error") => void;
  activeBattleRoom: BattleRoomData | null;
  battleScore: number;
  setBattleScore: Dispatch<SetStateAction<number>>;
  speedBonusTotal: number;
  setSpeedBonusTotal: Dispatch<SetStateAction<number>>;
  setScorePopup: (val: any) => void;
  onAttemptSaved?: () => void;
}

export function useQuizEngine({
  selectedSubject,
  grade,
  examLevel,
  activeTopicIndex,
  topics,
  selectedTopicTitles,
  selectedTopicIndices,
  compiledDiscussedNotes,
  customBoardContent,
  topicBoardsContent,
  timePerQuestion,
  difficulty,
  sessionId,
  onToast,
  activeBattleRoom,
  battleScore,
  setBattleScore,
  speedBonusTotal,
  setSpeedBonusTotal,
  setScorePopup,
  onAttemptSaved
}: UseQuizEngineProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [quizSource, setQuizSource] = useState<"present_topic" | "document" | "fallback" | "static">("static");
  const [docName, setDocName] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [answersHistory, setAnswersHistory] = useState<QuizAnswerHistoryItem[]>([]);
  const [isSavingToDb, setIsSavingToDb] = useState(false);
  const [dbStatus, setDbStatus] = useState<"idle" | "saved" | "failed">("idle");

  const loadQuiz = async (chosenCount: number) => {
    setLoading(true);
    setAnswersHistory([]);
    setDbStatus("idle");
    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedSubject,
          grade: grade || "Class 10",
          examLevel,
          activeTopicIndex,
          topics,
          selectedTopics: selectedTopicTitles,
          selectedTopicIndices,
          discussedContent: {
            formulas: compiledDiscussedNotes.formulas,
            notesMap: compiledDiscussedNotes.notesMap,
            customBoardContent
          },
          customBoardContent,
          topicBoardsContent,
          count: chosenCount,
          timePerQuestion,
          difficulty,
          sessionId
        })
      });

      if (!response.ok) throw new Error("Failed to generate custom quiz");
      const data = await response.json();
      if (data && data.success && data.questions && data.questions.length > 0) {
        const enriched = data.questions.map((q: any) => ({
          ...q,
          conceptTested: q.conceptTested || q.concept || "Chalkboard Concept",
          theoryTested: q.theoryTested || "Theoretical core understanding",
          calculationFormula: q.calculationFormula || "Conceptual application - no custom calculation steps needed",
          cognitiveCategory: q.cognitiveCategory || "Conceptual Application",
          difficulty: q.difficulty || difficulty || "Medium"
        }));
        setQuestions(enriched);
        setQuizSource(data.source);
        setDocName(data.documentName || "");
        onToast(
          data.source === "present_topic"
            ? `Generated Live Quiz (${chosenCount} Qs) from selected chalkboard topics! ⚡📝`
            : data.source === "document"
            ? `Generated custom quiz from selected topics: ${selectedTopicTitles.slice(0, 2).join(", ")}! 📝🎓`
            : `Generated practice quiz for ${selectedSubject} (${grade || "Class 10"})! 📝`,
          "success"
        );
      } else {
        throw new Error("Invalid questions returned");
      }
    } catch (err) {
      console.warn("Dynamic quiz generation fallback:", err);
      const normalized = Object.keys(QUIZ_POOL).find(k => k.toLowerCase() === selectedSubject.toLowerCase()) || "General";
      const fullFallback = QUIZ_POOL[normalized] || QUIZ_POOL.General;
      const fallbackQuestions = Array.from({ length: chosenCount }, (_, idx) => {
        const template = fullFallback[idx % fullFallback.length];
        return { ...template, id: `${template.id}_fallback_${idx}` };
      });
      setQuestions(fallbackQuestions);
      setQuizSource("static");
      onToast(`Loaded ${selectedSubject} practice questions! 📚`, "info");
    } finally {
      setLoading(false);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setIsQuizCompleted(false);
      setTimeLeft(timePerQuestion > 0 ? timePerQuestion : 0);
    }
  };

  useEffect(() => {
    if (loading || isQuizCompleted || questions.length === 0 || timePerQuestion === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, isQuizCompleted, questions, timePerQuestion]);

  useEffect(() => {
    if (!loading && !isQuizCompleted && questions.length > 0 && timePerQuestion > 0 && timeLeft === 0) {
      onToast("Samay Samapt! Auto-advancing to next question... ⏰", "info");
      processAnswerAndAdvance(selectedOption !== null ? selectedOption : -1);
    }
  }, [timeLeft, loading, isQuizCompleted, questions, timePerQuestion]);

  const processAnswerAndAdvance = (chosenIdx: number) => {
    const currentQ = questions[currentQuestionIndex];
    const isCorrect = chosenIdx === currentQ.correctAnswer;
    let pointsEarned = 0;
    let speedBonus = 0;
    let streakBonus = 0;
    let nextStreak = streak;

    if (isCorrect) {
      nextStreak = streak + 1;
      setStreak(nextStreak);
      speedBonus = timePerQuestion > 0 ? Math.max(0, Math.round((timeLeft / (timePerQuestion || 1)) * 50)) : 0;
      streakBonus = nextStreak >= 3 ? 25 : nextStreak >= 2 ? 10 : 0;
      pointsEarned = 100 + speedBonus + streakBonus;

      setBattleScore(prev => prev + pointsEarned);
      setSpeedBonusTotal(prev => prev + speedBonus);
      setScorePopup({ points: pointsEarned, speedBonus, streakBonus, streak: nextStreak });
      setTimeout(() => setScorePopup(null), 2500);
    } else {
      setStreak(0);
      setScorePopup(null);
    }

    const updatedHistory: QuizAnswerHistoryItem[] = [
      ...answersHistory,
      {
        questionIndex: currentQuestionIndex,
        selectedOption: chosenIdx,
        isCorrect,
        conceptTested: currentQ.conceptTested || "Topic Mastery",
        theoryTested: currentQ.theoryTested || "Theoretical Core",
        calculationFormula: currentQ.calculationFormula || "None",
        cognitiveCategory: currentQ.cognitiveCategory || "Theoretical Core",
        difficulty: currentQ.difficulty || "Medium"
      }
    ];
    setAnswersHistory(updatedHistory);

    const nextIndex = currentQuestionIndex + 1;
    const isFinished = nextIndex >= questions.length;

    if (activeBattleRoom) {
      const myUid = auth.currentUser?.uid || "my_uid";
      const totalPts = battleScore + pointsEarned;
      const correctCnt = updatedHistory.filter(h => h.isCorrect).length;
      const acc = Math.round((correctCnt / (updatedHistory.length || 1)) * 100);
      updateParticipantBattleProgress(activeBattleRoom.roomId, myUid, {
        score: totalPts,
        correctCount: correctCnt,
        currentQuestionIndex: isFinished ? questions.length : nextIndex,
        accuracy: acc,
        speedBonusTotal: speedBonusTotal + speedBonus
      });
    }

    if (!isFinished) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedOption(null);
      setTimeLeft(timePerQuestion);
    } else {
      setIsQuizCompleted(true);
      const finalScore = updatedHistory.filter(h => h.isCorrect).length;
      saveQuizAttempt(finalScore, updatedHistory);
    }
  };

  const handleManualNext = () => {
    processAnswerAndAdvance(selectedOption !== null ? selectedOption : -1);
  };

  const saveQuizAttempt = async (finalScore: number, finalHistory: QuizAnswerHistoryItem[]) => {
    setIsSavingToDb(true);
    const payload = {
      timestamp: new Date().toISOString(),
      score: finalScore,
      total: questions.length,
      accuracy: Math.round((finalScore / questions.length) * 100),
      source: quizSource,
      docName: docName || selectedTopicTitles.join(", ") || "Classroom Blackboard Topics",
      subject: selectedSubject,
      grade: grade || "Class 10",
      selectedTopics: selectedTopicTitles,
      history: finalHistory
    };

    const success = await persistQuizAttempt(payload);
    setDbStatus(success ? "saved" : "failed");
    setIsSavingToDb(false);
    if (success && onAttemptSaved) onAttemptSaved();
  };

  const microCategoryData = useMemo(() => computeMicroCategoryData(questions, answersHistory), [questions, answersHistory, isQuizCompleted]);
  const conceptualStrengths = useMemo(() => computeConceptualStrengths(answersHistory), [answersHistory]);
  const conceptualGrowthAreas = useMemo(() => computeConceptualGrowthAreas(answersHistory, questions), [answersHistory, questions]);
  const groupBlindspots = useMemo(() => computeGroupBlindspots(answersHistory, questions), [answersHistory, questions]);

  return {
    questions,
    setQuestions,
    loading,
    setLoading,
    quizSource,
    docName,
    currentQuestionIndex,
    selectedOption,
    setSelectedOption,
    isQuizCompleted,
    streak,
    timeLeft,
    answersHistory,
    isSavingToDb,
    dbStatus,
    loadQuiz,
    processAnswerAndAdvance,
    handleManualNext,
    microCategoryData,
    conceptualStrengths,
    conceptualGrowthAreas,
    groupBlindspots
  };
}
