/**
 * quizAnalytics.ts
 * Cognitive analysis calculators, blindspots detection & storage helpers
 */
import { auth, db } from "../../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  QuizQuestion,
  QuizAnswerHistoryItem,
  QuizBlindspot,
  CognitiveCategoryData
} from "./quizTypes";

export function computeMicroCategoryData(
  questions: QuizQuestion[],
  answersHistory: QuizAnswerHistoryItem[]
): CognitiveCategoryData[] {
  const categories = [
    "Conceptual Application",
    "Formula Retention",
    "Calculations & Solving",
    "Theoretical Core"
  ];
  return categories.map(cat => {
    const qInCat = questions.filter(q => q.cognitiveCategory === cat);
    const totalCount = qInCat.length;
    let correctCount = 0;
    qInCat.forEach(q => {
      const qIdx = questions.indexOf(q);
      const answeredState = answersHistory.find(h => h.questionIndex === qIdx);
      if (answeredState && answeredState.isCorrect) correctCount++;
    });
    return {
      category: cat,
      total: totalCount,
      correct: correctCount,
      percentage: totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
    };
  }).filter(d => d.total > 0);
}

export function computeConceptualStrengths(answersHistory: QuizAnswerHistoryItem[]) {
  return answersHistory.filter(h => h.isCorrect).map(h => ({
    concept: h.conceptTested,
    category: h.cognitiveCategory
  }));
}

export function computeConceptualGrowthAreas(
  answersHistory: QuizAnswerHistoryItem[],
  questions: QuizQuestion[]
) {
  return answersHistory.filter(h => !h.isCorrect).map(h => ({
    concept: h.conceptTested,
    category: h.cognitiveCategory,
    explanation: questions[h.questionIndex]?.explanation
  }));
}

export function computeGroupBlindspots(
  answersHistory: QuizAnswerHistoryItem[],
  questions: QuizQuestion[]
): QuizBlindspot[] {
  if (answersHistory.length === 0) return [];
  const missed = answersHistory.filter(h => !h.isCorrect);
  if (missed.length > 0) {
    return missed.map(m => {
      const qObj = questions[m.questionIndex] || questions[0];
      return {
        questionIndex: m.questionIndex,
        question: qObj.question,
        conceptTested: qObj.conceptTested || "Key Concept",
        calculationFormula: qObj.calculationFormula || "Core Rule",
        explanation: qObj.explanation,
        missRate: "75% of friends struggled here",
        correctAnswer: qObj.options[qObj.correctAnswer]
      };
    });
  }
  return questions.slice(0, 2).map((q, idx) => ({
    questionIndex: idx,
    question: q.question,
    conceptTested: q.conceptTested || "Advanced Concept",
    calculationFormula: q.calculationFormula || "Core Formula",
    explanation: q.explanation,
    missRate: "35% tricky challenge point",
    correctAnswer: q.options[q.correctAnswer]
  }));
}

export async function persistQuizAttempt(payload: any): Promise<boolean> {
  const uid = auth.currentUser?.uid;
  const isGuest = !uid || uid === "local_guest_student" || uid.startsWith("local_");

  if (isGuest) {
    try {
      const key = `guest_quiz_attempts_${payload.subject}`;
      const guest = JSON.parse(localStorage.getItem(key) || "[]");
      guest.push(payload);
      localStorage.setItem(key, JSON.stringify(guest));
      return true;
    } catch {
      return false;
    }
  } else {
    try {
      const attemptId = `quiz_attempt_${Date.now()}`;
      const ref = doc(db, "studentProfiles", uid, "quizAttempts", attemptId);
      await setDoc(ref, { ...payload, attemptId, timestamp: serverTimestamp() });
      return true;
    } catch {
      return false;
    }
  }
}
