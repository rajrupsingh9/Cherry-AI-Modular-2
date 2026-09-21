import React from "react";
import { ReferAndEarnHub } from "../ReferAndEarnHub";
import { KiaraCounselorTabWrapper } from "./KiaraCounselorTabWrapper";
import { PerformanceWorkspaceView } from "./PerformanceWorkspaceView";
import { AccountBooksLibraryView } from "./AccountBooksLibraryView";
import { BoardSnapshot } from "./accountTypes";

export interface AccountWorkspaceMainContentProps {
  activeDesktopTab: "profile" | "books" | "stats" | "counselor" | "referral";
  setActiveDesktopTab: (tab: "profile" | "books" | "stats" | "counselor" | "referral") => void;
  activeMobileSubTab: "profile" | "books" | "stats" | "counselor" | "referral";
  setActiveMobileSubTab: (tab: "profile" | "books" | "stats" | "counselor" | "referral") => void;
  isKiaraFullScreenOpen: boolean;
  setIsKiaraFullScreenOpen: (open: boolean) => void;
  studentName?: string;
  grade?: any;
  subject?: string;
  board?: string;
  mediumOfLearning?: string;
  isEnglish: boolean;
  t: (key: string, defaultVal?: string) => string;
  currentUser: any;
  dashboardStats: any;
  quizAttempts?: any[];
  pastSessions?: any[];
  snapshots?: BoardSnapshot[];
  sessionSnapshots?: any[];
  activeDocument?: any;
  sessionId?: string | null;
  customBoardContent?: string;
  topicBoardsContent?: Record<string, string>;
  topics?: any[];
  lowestMetric?: string;
  masteredCards: Record<string, boolean>;
  performanceWorkspaceTab: "macro" | "micro" | "retention" | "agility" | "curriculum" | "prerequisites" | "sprint";
  setPerformanceWorkspaceTab: (tab: any) => void;
  onEnterClassroom?: () => void;
  onDiscussWithCherry?: (topic: string) => void;
  onStartVoiceCall: (topic?: string) => void;
  onOpenReportCard: () => void;
  onOpenKiaraVoice: () => void;
  onOpenBookReader: (book: any) => void;
  onOpenSnapshotModal: (snap: BoardSnapshot) => void;
  onDeleteSnapshot: (id: string) => void;
  onTriggerBookPodcast: (book: any) => void;
  generatingPodcastBookId: string | null;
  onExportSessionToPDF: (book: any) => void;
  getActiveLearningContext: () => any;
}

export const AccountWorkspaceMainContent: React.FC<AccountWorkspaceMainContentProps> = ({
  activeDesktopTab,
  setActiveDesktopTab,
  activeMobileSubTab,
  setActiveMobileSubTab,
  isKiaraFullScreenOpen,
  setIsKiaraFullScreenOpen,
  studentName = "Student",
  grade,
  subject,
  board,
  mediumOfLearning,
  isEnglish,
  t,
  currentUser,
  dashboardStats,
  quizAttempts = [],
  pastSessions = [],
  snapshots = [],
  sessionSnapshots = [],
  activeDocument,
  sessionId,
  customBoardContent,
  topicBoardsContent,
  topics = [],
  lowestMetric,
  masteredCards,
  performanceWorkspaceTab,
  setPerformanceWorkspaceTab,
  onEnterClassroom,
  onDiscussWithCherry,
  onStartVoiceCall,
  onOpenReportCard,
  onOpenKiaraVoice,
  onOpenBookReader,
  onOpenSnapshotModal,
  onDeleteSnapshot,
  onTriggerBookPodcast,
  generatingPodcastBookId,
  onExportSessionToPDF,
  getActiveLearningContext,
}) => {
  if (activeDesktopTab === "referral" || activeMobileSubTab === "referral") {
    return (
      <div className="flex-1 p-2 sm:p-4 text-left min-h-[600px]">
        <ReferAndEarnHub
          studentName={studentName}
          userUid={currentUser?.uid}
          onOpenSubscriptionPlans={() => {
            window.dispatchEvent(new CustomEvent("cherry_open_subscription_plans"));
          }}
          onClose={() => {
            setActiveMobileSubTab("profile");
            setActiveDesktopTab("stats");
          }}
        />
      </div>
    );
  }

  if (
    activeDesktopTab === "counselor" ||
    activeMobileSubTab === "counselor" ||
    isKiaraFullScreenOpen
  ) {
    return (
      <KiaraCounselorTabWrapper
        studentName={studentName}
        grade={grade}
        subject={subject}
        board={board}
        mediumOfLearning={mediumOfLearning}
        dashboardStats={dashboardStats}
        quizAttempts={quizAttempts}
        pastSessions={pastSessions}
        snapshots={snapshots}
        lowestMetric={lowestMetric}
        onEnterClassroom={onEnterClassroom}
        onStartVoiceCall={onStartVoiceCall}
        onClose={() => {
          setActiveDesktopTab("stats");
          setActiveMobileSubTab("profile");
          setIsKiaraFullScreenOpen(false);
        }}
      />
    );
  }

  if (activeDesktopTab === "stats") {
    return (
      <PerformanceWorkspaceView
        performanceWorkspaceTab={performanceWorkspaceTab}
        setPerformanceWorkspaceTab={setPerformanceWorkspaceTab}
        isEnglish={isEnglish}
        dashboardStats={dashboardStats}
        subject={subject}
        grade={grade}
        board={board}
        studentName={studentName}
        t={t}
        pastSessions={pastSessions}
        snapshots={snapshots}
        quizAttempts={quizAttempts}
        masteredCards={masteredCards}
        mediumOfLearning={mediumOfLearning}
        onEnterClassroom={onEnterClassroom}
        onDiscussWithCherry={onDiscussWithCherry}
        onOpenReportCard={onOpenReportCard}
        onOpenKiaraVoice={onOpenKiaraVoice}
      />
    );
  }

  return (
    <AccountBooksLibraryView
      pastSessions={pastSessions}
      snapshots={snapshots}
      sessionSnapshots={sessionSnapshots}
      activeDocument={activeDocument}
      sessionId={sessionId}
      customBoardContent={customBoardContent}
      topicBoardsContent={topicBoardsContent}
      topics={topics}
      studentName={studentName}
      grade={grade}
      board={board}
      subject={subject}
      mediumOfLearning={mediumOfLearning}
      isEnglish={isEnglish}
      onDiscussWithCherry={onDiscussWithCherry}
      onEnterClassroom={onEnterClassroom}
      onOpenBookReader={onOpenBookReader}
      onOpenSnapshotModal={onOpenSnapshotModal}
      onDeleteSnapshot={onDeleteSnapshot}
      onTriggerBookPodcast={onTriggerBookPodcast}
      generatingPodcastBookId={generatingPodcastBookId}
      onExportSessionToPDF={onExportSessionToPDF}
      getActiveLearningContext={getActiveLearningContext}
      activeDesktopTab={activeDesktopTab}
    />
  );
};
