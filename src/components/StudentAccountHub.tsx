/**
 * StudentAccountHub.tsx - Student Profile & Learning Analytics Hub
 * UTF-8 encoded
 * Decoupled Modular Orchestrator (<300 LOC Cap compliant)
 */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getTranslations } from "../utils/i18n";
import { getActiveLearningContext } from "../utils/activeLearningStore";
import { BoardSnapshot, StudentAccountHubProps } from "./account/accountTypes";
import { isCustomApiKeyConfigured, getAllStoredApiKeys } from "../utils/geminiKeyStorage";
import { StudentProfileSidebar } from "./account/StudentProfileSidebar";
import { useStudentAnalytics } from "./account/useStudentAnalytics";
import { AccountTopNavbar } from "./account/AccountTopNavbar";
import { exportSessionToPDF } from "./account/pdfExportUtils";
import { useStudentDataSync } from "./account/useStudentDataSync";
import { useStudentProfileUpdate } from "./account/useStudentProfileUpdate";
import { usePodcastPlayerTrigger } from "./account/usePodcastPlayerTrigger";
import { AccountWorkspaceHeader } from "./account/AccountWorkspaceHeader";
import { AccountWorkspaceMainContent } from "./account/AccountWorkspaceMainContent";
import { AccountModalsLayer } from "./account/AccountModalsLayer";

export const StudentAccountHub: React.FC<StudentAccountHubProps> = ({
  onClose,
  studentName = "Student",
  grade = "Class 10",
  subject = "Mathematics",
  board = "CBSE",
  mediumOfLearning = "Hinglish",
  totalSessionsCount = 0,
  onRefreshProfile,
  customBoardContent = "",
  pastSessions = [],
  sessionSnapshots = [],
  topics = [],
  activeTopicIndex = 0,
  topicBoardsContent = {},
  sessionId = null,
  activeDocument = null,
  onEnterClassroom,
  onSignOut,
  onDiscussWithCherry,
}) => {
  const t = getTranslations(mediumOfLearning);
  const isEnglish = (mediumOfLearning || "").trim().toLowerCase() === "english";
  const mobileKiaraLabel = isEnglish ? "Kiara" : "कियारा";
  const mobileAnalyticsLabel = isEnglish ? "Analytics" : "प्रगति";
  const mobileBooksLabel = isEnglish ? "Books" : "किताबें";

  // Core Data Synchronization & Profile State
  const { currentUser, snapshots, quizAttempts, handleDeleteSnapshot } = useStudentDataSync({ subject });
  const profile = useStudentProfileUpdate({
    currentUser,
    studentName,
    grade,
    board,
    subject,
    mediumOfLearning,
    onRefreshProfile,
  });

  // Navigation & Workspace State
  const [activeDesktopTab, setActiveDesktopTab] = useState<"profile" | "books" | "stats" | "counselor" | "referral">("stats");
  const [activeMobileSubTab, setActiveMobileSubTab] = useState<"profile" | "books" | "stats" | "counselor" | "referral">("stats");
  const [performanceWorkspaceTab, setPerformanceWorkspaceTab] = useState<"macro" | "micro" | "retention" | "agility" | "curriculum" | "prerequisites" | "sprint">("macro");
  const statsScrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Modals & Inspection State
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isKiaraVoiceModalOpen, setIsKiaraVoiceModalOpen] = useState(false);
  const [isKiaraFullScreenOpen, setIsKiaraFullScreenOpen] = useState(false);
  const [kiaraVoiceInitialTopic, setKiaraVoiceInitialTopic] = useState("");
  const [selectedBookForReader, setSelectedBookForReader] = useState<any | null>(null);
  const [isReportCardModalOpen, setIsReportCardModalOpen] = useState(false);
  const [selectedSnapshotForModal, setSelectedSnapshotForModal] = useState<BoardSnapshot | null>(null);
  const [masteredCards] = useState<Record<string, boolean>>({});

  // BYOK API Key State
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [hasCustomKey, setHasCustomKey] = useState(() => isCustomApiKeyConfigured());
  const [keyCount, setKeyCount] = useState(() => getAllStoredApiKeys().length);

  useEffect(() => {
    setHasCustomKey(isCustomApiKeyConfigured());
    setKeyCount(getAllStoredApiKeys().length);
  }, [showApiKeyModal]);

  // Unified unique snapshot collection memo
  const allSnapshots = useMemo(() => {
    const combined: BoardSnapshot[] = [];
    const pushIfUnique = (s: any) => {
      if (!s) return;
      const existingIdx = combined.findIndex((e) => e.id === s.id || (e.timestamp && s.timestamp && e.timestamp === s.timestamp));
      if (existingIdx === -1) combined.push(s);
    };
    (snapshots || []).forEach(pushIfUnique);
    (sessionSnapshots || []).forEach(pushIfUnique);
    return combined;
  }, [snapshots, sessionSnapshots]);

  // Analytics Engine Hook
  const { dashboardStats, lowestMetric } = useStudentAnalytics({
    quizAttempts,
    subject,
    pastSessions,
    snapshots,
    masteredCards,
    studentName,
    grade,
    board,
    mediumOfLearning,
    totalSessionsCount,
    allBooksLength: pastSessions?.length || 0,
    allSnapshotsLength: allSnapshots.length,
  });

  // Audio Podcast Generator Hook
  const { generatingPodcastBookId, handleTriggerBookPodcast } = usePodcastPlayerTrigger({ subject, grade, mediumOfLearning });

  const handleExportSessionToPDF = useCallback((sess: any) => {
    exportSessionToPDF({ sess, sessionId, topics, topicBoardsContent, customBoardContent, subject, grade, board, studentName });
  }, [sessionId, topics, topicBoardsContent, customBoardContent, subject, grade, board, studentName]);

  return (
    <div className="absolute inset-0 bg-white flex flex-col z-30 overflow-hidden">
      <div className="bg-white w-full h-full flex flex-col overflow-hidden relative">
        <AccountTopNavbar
          grade={grade}
          onClose={onClose}
          activeMobileSubTab={activeMobileSubTab}
          setActiveMobileSubTab={setActiveMobileSubTab}
          activeDesktopTab={activeDesktopTab}
          setActiveDesktopTab={setActiveDesktopTab}
          isKiaraFullScreenOpen={isKiaraFullScreenOpen}
          setIsKiaraFullScreenOpen={setIsKiaraFullScreenOpen}
          t={t}
          mobileKiaraLabel={mobileKiaraLabel}
          mobileAnalyticsLabel={mobileAnalyticsLabel}
          mobileBooksLabel={mobileBooksLabel}
        />

        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden bg-[#F6F7FB]">
          <StudentProfileSidebar
            activeMobileSubTab={activeMobileSubTab}
            editingProfile={profile.editingProfile}
            studentName={studentName}
            grade={grade}
            board={board}
            mediumOfLearning={mediumOfLearning}
            currentUser={currentUser}
            savingProfile={profile.savingProfile}
            editName={profile.editName}
            setEditName={profile.setEditName}
            editGrade={profile.editGrade}
            setEditGrade={profile.setEditGrade}
            editBoard={profile.editBoard}
            setEditBoard={profile.setEditBoard}
            editMediumOfLearning={profile.editMediumOfLearning}
            setEditMediumOfLearning={profile.setEditMediumOfLearning}
            handleUpdateProfile={profile.handleUpdateProfile}
            setEditingProfile={profile.setEditingProfile}
            totalSessionsCount={totalSessionsCount}
            allSnapshotsCount={allSnapshots.length}
            hasCustomKey={hasCustomKey}
            keyCount={keyCount}
            onOpenApiKeyModal={() => setShowApiKeyModal(true)}
            onOpenKiaraCounselor={() => {
              setActiveDesktopTab("counselor");
              setActiveMobileSubTab("counselor");
              setIsKiaraFullScreenOpen(true);
            }}
            onOpenReferrals={() => {
              setActiveDesktopTab("referral");
              setActiveMobileSubTab("referral");
            }}
            onConfirmSignOut={() => setShowLogoutConfirm(true)}
          />

          <div
            className={`${
              activeMobileSubTab === "books" ||
              activeMobileSubTab === "stats" ||
              activeMobileSubTab === "counselor" ||
              activeMobileSubTab === "referral"
                ? "flex"
                : "hidden md:flex"
            } flex-1 p-3.5 sm:p-5 pb-36 sm:pb-10 flex-col space-y-4 overflow-y-auto text-left min-h-0 bg-[#F6F7FB]`}
            ref={statsScrollContainerRef}
          >
            <AccountWorkspaceHeader activeDesktopTab={activeDesktopTab} subject={subject} grade={grade} />

            <AccountWorkspaceMainContent
              activeDesktopTab={activeDesktopTab}
              setActiveDesktopTab={setActiveDesktopTab}
              activeMobileSubTab={activeMobileSubTab}
              setActiveMobileSubTab={setActiveMobileSubTab}
              isKiaraFullScreenOpen={isKiaraFullScreenOpen}
              setIsKiaraFullScreenOpen={setIsKiaraFullScreenOpen}
              studentName={studentName}
              grade={grade}
              subject={subject}
              board={board}
              mediumOfLearning={mediumOfLearning}
              isEnglish={isEnglish}
              t={t}
              currentUser={currentUser}
              dashboardStats={dashboardStats}
              quizAttempts={quizAttempts}
              pastSessions={pastSessions}
              snapshots={snapshots}
              sessionSnapshots={sessionSnapshots}
              activeDocument={activeDocument}
              sessionId={sessionId}
              customBoardContent={customBoardContent}
              topicBoardsContent={topicBoardsContent}
              topics={topics}
              lowestMetric={lowestMetric}
              masteredCards={masteredCards}
              performanceWorkspaceTab={performanceWorkspaceTab}
              setPerformanceWorkspaceTab={setPerformanceWorkspaceTab}
              onEnterClassroom={onEnterClassroom}
              onDiscussWithCherry={onDiscussWithCherry}
              onStartVoiceCall={(topic?: string) => {
                setKiaraVoiceInitialTopic(topic || "");
                setIsKiaraVoiceModalOpen(true);
              }}
              onOpenReportCard={() => setIsReportCardModalOpen(true)}
              onOpenKiaraVoice={() => setIsKiaraVoiceModalOpen(true)}
              onOpenBookReader={(book) => setSelectedBookForReader(book)}
              onOpenSnapshotModal={(snap) => setSelectedSnapshotForModal(snap)}
              onDeleteSnapshot={(id) => handleDeleteSnapshot(id)}
              onTriggerBookPodcast={(book) => handleTriggerBookPodcast(book)}
              generatingPodcastBookId={generatingPodcastBookId}
              onExportSessionToPDF={(book) => handleExportSessionToPDF(book)}
              getActiveLearningContext={getActiveLearningContext}
            />
          </div>
        </div>
      </div>

      {/* Modals & Overlays Modular Layer */}
      <AccountModalsLayer
        selectedBookForReader={selectedBookForReader}
        setSelectedBookForReader={setSelectedBookForReader}
        onDiscussWithCherry={onDiscussWithCherry}
        isKiaraVoiceModalOpen={isKiaraVoiceModalOpen}
        setIsKiaraVoiceModalOpen={setIsKiaraVoiceModalOpen}
        kiaraVoiceInitialTopic={kiaraVoiceInitialTopic}
        setKiaraVoiceInitialTopic={setKiaraVoiceInitialTopic}
        studentName={studentName}
        grade={grade}
        board={board}
        subject={subject}
        lowestMetric={lowestMetric}
        dashboardStats={dashboardStats}
        quizAttempts={quizAttempts}
        pastSessions={pastSessions}
        snapshots={snapshots}
        isReportCardModalOpen={isReportCardModalOpen}
        setIsReportCardModalOpen={setIsReportCardModalOpen}
        selectedSnapshotForModal={selectedSnapshotForModal}
        setSelectedSnapshotForModal={setSelectedSnapshotForModal}
        handleDeleteSnapshot={handleDeleteSnapshot}
        showApiKeyModal={showApiKeyModal}
        setShowApiKeyModal={setShowApiKeyModal}
        setHasCustomKey={setHasCustomKey}
        showLogoutConfirm={showLogoutConfirm}
        setShowLogoutConfirm={setShowLogoutConfirm}
        currentUser={currentUser}
        onSignOut={onSignOut}
      />
    </div>
  );
};
