/**
 * QuickQuizView.tsx
 * Ultra-Lean Orchestrator (<260 LOC) for Interactive & Battle Quizzes
 */
import React, { useState, useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { BattleRoomData } from "../services/battleRoomService";
import { BattleArenaLanding } from "./BattleArenaLanding";
import { BattleRoomLobbyModal } from "./BattleRoomLobbyModal";
import { getTranslations } from "../utils/i18n";
import { QuickQuizViewProps } from "./quiz/quizTypes";
import { useQuizSetupTopics } from "./quiz/useQuizSetupTopics";
import { useQuizBattleSync } from "./quiz/useQuizBattleSync";
import { useQuizEngine } from "./quiz/useQuizEngine";
import { QuizTabHeader } from "./quiz/QuizTabHeader";
import { QuizConfigView } from "./quiz/QuizConfigView";
import { QuizActiveQuestionView } from "./quiz/QuizActiveQuestionView";
import { QuizResultView } from "./quiz/QuizResultView";
import { QuizLeaderboard } from "./quiz/QuizLeaderboard";

export { QuizLeaderboard } from "./quiz/QuizLeaderboard";

export const QuickQuizView: React.FC<QuickQuizViewProps> = ({
  subject = "Mathematics",
  grade = "Class 10",
  state,
  onInjectPrompt,
  onToast,
  topics = [],
  activeTopicIndex = 0,
  customBoardContent = "",
  topicBoardsContent = {},
  sessionId = null,
  mediumOfLearning = "hinglish"
}) => {
  const t = useMemo(() => getTranslations(mediumOfLearning), [mediumOfLearning]);

  const [activeTab, setActiveTab] = useState<"quiz" | "leaderboard">("quiz");
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [timePerQuestion, setTimePerQuestion] = useState<number>(30);
  const [examLevel, setExamLevel] = useState<"Board" | "Competition">("Board");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [quizHubMode, setQuizHubMode] = useState<"solo" | "battle">("solo");
  const [isBattleLobbyOpen, setIsBattleLobbyOpen] = useState(false);
  const [activeBattleRoom, setActiveBattleRoom] = useState<BattleRoomData | null>(null);
  const [leaderboardRefreshTrigger, setLeaderboardRefreshTrigger] = useState(0);

  const {
    selectedSubject,
    setSelectedSubject,
    extractedTopics,
    selectedTopicIndices,
    handleToggleTopic,
    handleSelectAllTopics,
    handleSelectActiveTopicOnly,
    handleSelectDiscussedOnly,
    selectedTopicTitles,
    compiledDiscussedNotes
  } = useQuizSetupTopics({
    subject,
    topics,
    activeTopicIndex,
    customBoardContent,
    topicBoardsContent,
    onToast
  });

  const totalDurationFormatted = useMemo(() => {
    if (timePerQuestion === 0) return "Untimed (Self-Paced)";
    const totalSec = numQuestions * timePerQuestion;
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return mins > 0 ? `${mins}m ${secs > 0 ? `${secs}s` : ""}` : `${secs}s`;
  }, [numQuestions, timePerQuestion]);

  const [isQuizCompletedState, setIsQuizCompletedState] = useState(false);
  const {
    battleScore,
    setBattleScore,
    speedBonusTotal,
    setSpeedBonusTotal,
    scorePopup,
    setScorePopup,
    rankedBattleParticipants
  } = useQuizBattleSync({
    activeBattleRoom,
    isQuizCompleted: isQuizCompletedState,
    questions: [],
    currentQuestionIndex: 0,
    answersHistory: []
  });

  const {
    questions,
    loading,
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
  } = useQuizEngine({
    selectedSubject,
    grade,
    examLevel,
    activeTopicIndex,
    topics,
    selectedTopicIndices,
    selectedTopicTitles,
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
    onAttemptSaved: () => setLeaderboardRefreshTrigger(prev => prev + 1)
  });

  if (isQuizCompleted !== isQuizCompletedState) {
    setIsQuizCompletedState(isQuizCompleted);
  }

  const handleStartQuiz = () => {
    setIsConfiguring(false);
    loadQuiz(numQuestions);
  };

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
    processAnswerAndAdvance(idx);
  };

  const handleReturnToSetup = () => {
    setIsConfiguring(true);
    setLeaderboardRefreshTrigger(prev => prev + 1);
  };

  const handleReviewWithCherryMaam = () => {
    const blindspotPrompts = groupBlindspots.map((b, i) =>
      `Problem ${i + 1}: ${b.question}\nCore Concept: ${b.conceptTested}\nFormula/Rule: ${b.calculationFormula}\nTarget Answer: ${b.correctAnswer}`
    ).join("\n\n");
    onInjectPrompt(`Cherry Ma'am, humari quiz me group blindspots aaye hain! Please whiteboard par in tricky problems ko solve karke step-by-step intuition, derivation aur trap warning explain kijiye:\n\n${blindspotPrompts}`);
    onToast("Sent blindspots to Cherry Ma'am! Whiteboard session starting... 🧑‍🏫📝", "success");
  };

  const handleVoiceQuizRequest = () => {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;
    onInjectPrompt(`Cherry Ma'am, mujhe is question par ek quick oral voice-quiz lijiye aur meri conceptual reasoning check kijiye:\n"${currentQ.question}"\n(Concept: ${currentQ.conceptTested})`);
    onToast("Cherry Ma'am voice quiz trigger dispatched! 🎙️⚡", "success");
  };

  return (
    <div className="space-y-3.5 animate-fade-in text-[#1E293B]">
      <QuizTabHeader
        quizHubMode={quizHubMode}
        setQuizHubMode={setQuizHubMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        t={t}
      />

      {quizHubMode === "battle" ? (
        <div className="space-y-4">
          <BattleArenaLanding
            subject={selectedSubject}
            grade={grade}
            onOpenCreateOrJoin={() => setIsBattleLobbyOpen(true)}
            onStartSoloSprint={() => {
              setQuizHubMode("solo");
              setActiveTab("quiz");
              setIsConfiguring(true);
            }}
          />
          {isBattleLobbyOpen && (
            <BattleRoomLobbyModal
              subject={selectedSubject}
              grade={grade}
              isOpen={isBattleLobbyOpen}
              onClose={() => setIsBattleLobbyOpen(false)}
              onLaunchBattle={(room) => {
                setActiveBattleRoom(room);
                setIsBattleLobbyOpen(false);
                setIsConfiguring(false);
                loadQuiz(room.questionCount || 5);
              }}
              onToast={onToast}
            />
          )}
        </div>
      ) : activeTab === "leaderboard" ? (
        <QuizLeaderboard
          subject={selectedSubject}
          grade={grade}
          onStartQuiz={() => {
            setActiveTab("quiz");
            setIsConfiguring(true);
          }}
          onToast={onToast}
          refreshTrigger={leaderboardRefreshTrigger}
        />
      ) : loading ? (
        <div className="py-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#796AEF] animate-spin mx-auto" />
          <div className="space-y-1">
            <h5 className="text-[13px] font-black uppercase tracking-wider text-[#1E293B]">
              Crafting Classroom Aligned Quiz...
            </h5>
            <p className="text-[11.5px] text-[#4A4E5A] font-medium">
              Generating dynamic questions, formulas, and cognitive diagnosis test cases.
            </p>
          </div>
        </div>
      ) : isConfiguring ? (
        <QuizConfigView
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          grade={grade}
          extractedTopics={extractedTopics}
          selectedTopicIndices={selectedTopicIndices}
          handleToggleTopic={handleToggleTopic}
          handleSelectAllTopics={handleSelectAllTopics}
          handleSelectDiscussedOnly={handleSelectDiscussedOnly}
          handleSelectActiveTopicOnly={handleSelectActiveTopicOnly}
          numQuestions={numQuestions}
          setNumQuestions={setNumQuestions}
          timePerQuestion={timePerQuestion}
          setTimePerQuestion={setTimePerQuestion}
          examLevel={examLevel}
          setExamLevel={setExamLevel}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          totalDurationFormatted={totalDurationFormatted}
          handleStartQuiz={handleStartQuiz}
          t={t}
        />
      ) : isQuizCompleted ? (
        <QuizResultView
          activeBattleRoom={activeBattleRoom}
          selectedSubject={selectedSubject}
          rankedBattleParticipants={rankedBattleParticipants}
          questions={questions}
          answersHistory={answersHistory}
          battleScore={battleScore}
          speedBonusTotal={speedBonusTotal}
          streak={streak}
          groupBlindspots={groupBlindspots}
          handleReviewWithCherryMaam={handleReviewWithCherryMaam}
          handleReturnToSetup={handleReturnToSetup}
          microCategoryData={microCategoryData}
          conceptualStrengths={conceptualStrengths}
          conceptualGrowthAreas={conceptualGrowthAreas}
          isSavingToDb={isSavingToDb}
          dbStatus={dbStatus}
        />
      ) : questions.length > 0 ? (
        <QuizActiveQuestionView
          activeBattleRoom={activeBattleRoom}
          rankedBattleParticipants={rankedBattleParticipants}
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          scorePopup={scorePopup}
          timePerQuestion={timePerQuestion}
          timeLeft={timeLeft}
          currentQuestion={questions[currentQuestionIndex]}
          selectedOption={selectedOption}
          handleSelectOption={handleSelectOption}
          handleManualNext={handleManualNext}
          handleVoiceQuizRequest={handleVoiceQuizRequest}
        />
      ) : null}
    </div>
  );
};
