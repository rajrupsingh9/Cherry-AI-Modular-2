import React, { FormEvent } from "react";
import { AnimatePresence } from "motion/react";
import { LearnerProfileModal } from "../LearnerProfileModal";
import { SubscriptionModal } from "../SubscriptionModal";
import { PwaInstallPromptModal } from "../PwaInstallPromptModal";
import AudioPodcastPlayerModal from "../AudioPodcastPlayerModal";
import { PostLessonAudioModal, PostLessonSessionData } from "../PostLessonAudioModal";
import { PostLoginMicPromptModal } from "../PostLoginMicPromptModal";
import { AudioPodcastData } from "../../types";
import { QuickQuizModal } from "./QuickQuizModal";
import { TipsDrawer } from "./TipsDrawer";
import { StudentLoginModal } from "./StudentLoginModal";
import { StudentAccountHub } from "../StudentAccountHub";
import { StudentOnboardingForm } from "../StudentOnboardingForm";

interface AppModalsContainerProps {
  // Existing Modals
  isLearnerProfileModalOpen: boolean;
  onCloseLearnerProfileModal: () => void;
  showSubscriptionModal: boolean;
  onCloseSubscriptionModal: () => void;
  studentName: string;
  showPwaInstallModal: boolean;
  onClosePwaInstallModal: () => void;
  onPwaInstalledSuccess: () => void;
  isAudioPodcastModalOpen: boolean;
  onCloseAudioPodcastModal: () => void;
  activeAudioPodcast: AudioPodcastData | null;
  showPostLessonModal: boolean;
  onClosePostLessonModal: () => void;
  postLessonSession: PostLessonSessionData | null;
  mediumOfLearning: string;
  onGoToRevisionHub: () => void;
  showPostLoginMicModal: boolean;
  onAllowPostLoginMic: () => void;
  onDismissPostLoginMic: () => void;
  addToast: (message: string, type: "info" | "success" | "error") => void;
  onSignOut: () => void;

  // Quick Quiz Modal
  isQuizFullScreenOpen?: boolean;
  onCloseQuizFullScreen?: () => void;
  studentSubject?: string;
  studentGrade?: string;
  state?: any;
  onInjectPrompt?: (promptText: string) => void;
  topics?: string[];
  activeTopicIndex?: number;
  customBoardContent?: string;
  topicBoardsContent?: Record<number, string>;
  sessionId?: string | null;

  // Tips Drawer
  showTips?: boolean;
  onCloseTips?: () => void;

  // Student Account Hub
  showStudentAccountHub?: boolean;
  onCloseStudentAccountHub?: () => void;
  studentBoard?: string;
  totalSessionsCount?: number;
  pastSessions?: any[];
  sessionSnapshots?: any[];
  activeDocument?: any;
  onDiscussWithCherry?: (details: any) => void;
  onEnterClassroomFromHub?: () => void;
  onRefreshProfile?: () => Promise<void>;

  // Student Onboarding
  showOnboarding?: boolean;
  onOnboardingSubmit?: (details: any) => Promise<void>;

  // Student Login Modal
  showLoginModal?: boolean;
  onCloseLoginModal?: () => void;
  onGoogleSignIn?: () => Promise<void>;
  onStudentNameChange?: (name: string) => void;
  onStudentGradeChange?: (grade: string) => void;
  onGuestSubmit?: (e: FormEvent) => void;
  onMobileLoginSuccess?: (studentUser: any, profileData: any, subscription: any) => void;
}

export const AppModalsContainer: React.FC<AppModalsContainerProps> = ({
  isLearnerProfileModalOpen,
  onCloseLearnerProfileModal,
  showSubscriptionModal,
  onCloseSubscriptionModal,
  studentName,
  showPwaInstallModal,
  onClosePwaInstallModal,
  onPwaInstalledSuccess,
  isAudioPodcastModalOpen,
  onCloseAudioPodcastModal,
  activeAudioPodcast,
  showPostLessonModal,
  onClosePostLessonModal,
  postLessonSession,
  mediumOfLearning,
  onGoToRevisionHub,
  showPostLoginMicModal,
  onAllowPostLoginMic,
  onDismissPostLoginMic,
  addToast,
  onSignOut,

  // Quick Quiz
  isQuizFullScreenOpen = false,
  onCloseQuizFullScreen = () => {},
  studentSubject = "",
  studentGrade = "",
  state,
  onInjectPrompt = () => {},
  topics = [],
  activeTopicIndex = 0,
  customBoardContent = "",
  topicBoardsContent = {},
  sessionId = null,

  // Tips Drawer
  showTips = false,
  onCloseTips = () => {},

  // Student Account Hub
  showStudentAccountHub = false,
  onCloseStudentAccountHub = () => {},
  studentBoard = "CBSE",
  totalSessionsCount = 0,
  pastSessions = [],
  sessionSnapshots = [],
  activeDocument = null,
  onDiscussWithCherry = () => {},
  onEnterClassroomFromHub = () => {},
  onRefreshProfile = async () => {},

  // Student Onboarding
  showOnboarding = false,
  onOnboardingSubmit = async () => {},

  // Student Login Modal
  showLoginModal = false,
  onCloseLoginModal = () => {},
  onGoogleSignIn = async () => {},
  onStudentNameChange = () => {},
  onStudentGradeChange = () => {},
  onGuestSubmit = () => {},
  onMobileLoginSuccess = () => {},
}) => {
  return (
    <>
      {/* QUICK QUIZ DESK FULL-SCREEN MODAL */}
      <QuickQuizModal
        isOpen={isQuizFullScreenOpen}
        onClose={onCloseQuizFullScreen}
        studentSubject={studentSubject}
        studentGrade={studentGrade}
        state={state}
        onInjectPrompt={onInjectPrompt}
        onToast={addToast}
        topics={topics}
        activeTopicIndex={activeTopicIndex}
        customBoardContent={customBoardContent}
        topicBoardsContent={topicBoardsContent}
        sessionId={sessionId}
      />

      {/* CLASS INFORMATION & TIPS DRAWER */}
      <TipsDrawer
        isOpen={showTips}
        onClose={onCloseTips}
      />

      {/* STUDENT ACCOUNT HUB OVERLAY */}
      <AnimatePresence>
        {showStudentAccountHub && (
          <StudentAccountHub
            onClose={onCloseStudentAccountHub}
            studentName={studentName}
            grade={studentGrade}
            subject={studentSubject}
            board={studentBoard}
            mediumOfLearning={mediumOfLearning}
            totalSessionsCount={totalSessionsCount}
            customBoardContent={customBoardContent}
            pastSessions={pastSessions}
            sessionSnapshots={sessionSnapshots}
            topics={topics}
            activeTopicIndex={activeTopicIndex}
            topicBoardsContent={topicBoardsContent}
            sessionId={sessionId}
            activeDocument={activeDocument}
            onDiscussWithCherry={onDiscussWithCherry}
            onEnterClassroom={onEnterClassroomFromHub}
            onRefreshProfile={onRefreshProfile}
            onSignOut={onSignOut}
          />
        )}

        {/* STUDENT ONBOARDING OVERLAY */}
        {showOnboarding && (
          <StudentOnboardingForm
            initialName={studentName}
            onSubmit={onOnboardingSubmit}
          />
        )}

        {/* STUDENT LOGIN MODAL */}
        <StudentLoginModal
          isOpen={showLoginModal}
          onClose={onCloseLoginModal}
          onGoogleSignIn={onGoogleSignIn}
          studentName={studentName}
          studentGrade={studentGrade}
          onStudentNameChange={onStudentNameChange}
          onStudentGradeChange={onStudentGradeChange}
          onGuestSubmit={onGuestSubmit}
          onMobileLoginSuccess={onMobileLoginSuccess}
          addToast={addToast}
        />
      </AnimatePresence>

      {/* LEARNER PROFILE MEMORY, WEAK TOPICS & DPDP 2023 HUB MODAL */}
      <LearnerProfileModal
        isOpen={isLearnerProfileModalOpen}
        onClose={onCloseLearnerProfileModal}
        onToast={addToast}
        onSignOut={onSignOut}
      />

      {/* DIRECT ZERO-FEE DYNAMIC UPI SUBSCRIPTION MODAL */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={onCloseSubscriptionModal}
        studentName={studentName || "Student"}
        onToast={addToast}
      />

      {/* PWA AUTOMATIC INSTALL APP PROMPT MODAL */}
      <PwaInstallPromptModal
        isOpen={showPwaInstallModal}
        onClose={onClosePwaInstallModal}
        onInstalledSuccess={onPwaInstalledSuccess}
      />

      {/* 2-HOST DUAL-VOICE AUDIO PODCAST PLAYER MODAL */}
      <AudioPodcastPlayerModal
        isOpen={isAudioPodcastModalOpen}
        onClose={onCloseAudioPodcastModal}
        podcast={activeAudioPodcast}
      />

      {/* POST-LESSON DUAL-VOICE AUDIO SUMMARY MODAL */}
      <PostLessonAudioModal
        isOpen={showPostLessonModal}
        onClose={onClosePostLessonModal}
        sessionData={postLessonSession}
        mediumOfLearning={mediumOfLearning}
        onGoToRevisionHub={onGoToRevisionHub}
        onToast={addToast}
      />

      {/* POST-LOGIN MICROPHONE SETUP MODAL */}
      <PostLoginMicPromptModal
        isOpen={showPostLoginMicModal}
        studentName={studentName}
        onAllow={onAllowPostLoginMic}
        onDismiss={onDismissPostLoginMic}
      />
    </>
  );
};
