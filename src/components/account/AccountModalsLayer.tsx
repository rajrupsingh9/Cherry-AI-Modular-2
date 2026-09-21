import React from "react";
import { InAppBookReaderModal } from "../InAppBookReaderModal";
import { KiaraLiveVoiceModal } from "../KiaraLiveVoiceModal";
import { StudentReportCardModal } from "../StudentReportCardModal";
import { SnapshotInspectModal } from "./SnapshotInspectModal";
import { GeminiApiKeyModal } from "../GeminiApiKeyModal";
import { LogoutConfirmModal } from "./LogoutConfirmModal";
import { isCustomApiKeyConfigured } from "../../utils/geminiKeyStorage";
import { BoardSnapshot } from "./accountTypes";

export interface AccountModalsLayerProps {
  selectedBookForReader: any | null;
  setSelectedBookForReader: (book: any | null) => void;
  onDiscussWithCherry?: (topic: string) => void;
  isKiaraVoiceModalOpen: boolean;
  setIsKiaraVoiceModalOpen: (open: boolean) => void;
  kiaraVoiceInitialTopic: string;
  setKiaraVoiceInitialTopic: (topic: string) => void;
  studentName?: string;
  grade?: any;
  board?: string;
  subject?: string;
  lowestMetric?: string;
  dashboardStats: any;
  quizAttempts?: any[];
  pastSessions?: any[];
  snapshots?: any[];
  isReportCardModalOpen: boolean;
  setIsReportCardModalOpen: (open: boolean) => void;
  selectedSnapshotForModal: BoardSnapshot | null;
  setSelectedSnapshotForModal: (snap: BoardSnapshot | null) => void;
  handleDeleteSnapshot: (id: string) => void;
  showApiKeyModal: boolean;
  setShowApiKeyModal: (open: boolean) => void;
  setHasCustomKey: (val: boolean) => void;
  showLogoutConfirm: boolean;
  setShowLogoutConfirm: (open: boolean) => void;
  currentUser: any;
  onSignOut?: () => void;
}

export const AccountModalsLayer: React.FC<AccountModalsLayerProps> = ({
  selectedBookForReader,
  setSelectedBookForReader,
  onDiscussWithCherry,
  isKiaraVoiceModalOpen,
  setIsKiaraVoiceModalOpen,
  kiaraVoiceInitialTopic,
  setKiaraVoiceInitialTopic,
  studentName = "Student",
  grade,
  board,
  subject,
  lowestMetric,
  dashboardStats,
  quizAttempts = [],
  pastSessions = [],
  snapshots = [],
  isReportCardModalOpen,
  setIsReportCardModalOpen,
  selectedSnapshotForModal,
  setSelectedSnapshotForModal,
  handleDeleteSnapshot,
  showApiKeyModal,
  setShowApiKeyModal,
  setHasCustomKey,
  showLogoutConfirm,
  setShowLogoutConfirm,
  currentUser,
  onSignOut,
}) => {
  return (
    <>
      {selectedBookForReader && (
        <InAppBookReaderModal
          isOpen={!!selectedBookForReader}
          book={selectedBookForReader}
          onClose={() => setSelectedBookForReader(null)}
          onDiscussWithCherry={onDiscussWithCherry}
        />
      )}

      {isKiaraVoiceModalOpen && (
        <KiaraLiveVoiceModal
          isOpen={isKiaraVoiceModalOpen}
          onClose={() => {
            setIsKiaraVoiceModalOpen(false);
            setKiaraVoiceInitialTopic("");
          }}
          studentName={studentName}
          grade={grade}
          board={board}
          subject={subject}
          lowestMetric={lowestMetric}
          performanceData={{
            conceptClarity: dashboardStats.conceptClarity,
            theoreticalCore: dashboardStats.theoreticalCore,
            calculationPrecision: dashboardStats.calculationPrecision,
            formulaRecall: dashboardStats.formulaRecall,
            socraticStamina: dashboardStats.socraticStamina,
            strengths: dashboardStats.strengths,
            growths: dashboardStats.growths,
            totalQuizzes: quizAttempts?.length || 0,
            classesCompleted: pastSessions?.length || 0,
            snapshotsSaved: snapshots?.length || 0,
            lowestMetric: lowestMetric,
          }}
          initialDiscussionTopic={kiaraVoiceInitialTopic}
          autoStart={Boolean(kiaraVoiceInitialTopic)}
          onDiscussWithCherry={onDiscussWithCherry}
        />
      )}

      {isReportCardModalOpen && (
        <StudentReportCardModal
          isOpen={isReportCardModalOpen}
          onClose={() => setIsReportCardModalOpen(false)}
          studentName={studentName}
          grade={grade}
          subject={subject}
        />
      )}

      <SnapshotInspectModal
        snapshot={selectedSnapshotForModal}
        subject={subject}
        onClose={() => setSelectedSnapshotForModal(null)}
        onDelete={(id) => handleDeleteSnapshot(id)}
      />

      <GeminiApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => {
          setShowApiKeyModal(false);
          setHasCustomKey(isCustomApiKeyConfigured());
        }}
      />

      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        currentUserEmail={currentUser?.email}
        studentName={studentName}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirmSignOut={() => {
          if (onSignOut) {
            onSignOut();
          }
        }}
      />
    </>
  );
};
