import React from "react";
import { Brain, Home } from "lucide-react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { BrandSplashScreen } from "../BrandSplashScreen";
import { IntroWalkthroughScreen } from "../IntroWalkthroughScreen";
import { StudentEnrollmentScreen } from "../StudentEnrollmentScreen";
import { MobileAppSplashScreen } from "../MobileAppSplashScreen";
import { SyllabusDeskModern } from "../SyllabusDeskModern";
import { QuickQuizView } from "../QuickQuizView";
import { VirtualLabStudio } from "../VirtualLabStudio";
import { StudentAccountHub } from "../StudentAccountHub";
import { AdminDashboard } from "../AdminDashboard";
import { isAdminEmail } from "../../utils/adminConfig";
import { safeSetItem } from "../../utils/safeStorage";
import { AudioPodcastData } from "../../types";

export interface StudentDetailsType {
  name: string;
  grade: string;
  subject: string;
  board?: string;
  mediumOfLearning?: string;
}

export interface AppViewRouterProps {
  currentScreen: any;
  setCurrentScreen: any;
  showStudentAccountHub: boolean;
  setShowStudentAccountHub: (val: boolean) => void;

  // Home Screen props
  showBrandSplash: boolean;
  setShowBrandSplash: (val: boolean) => void;
  showIntroWalkthrough: boolean;
  setShowIntroWalkthrough: (val: boolean) => void;
  showEnrollmentScreen: boolean;
  setShowEnrollmentScreen: (val: boolean) => void;
  studentDetails: StudentDetailsType;
  setStudentDetails: React.Dispatch<React.SetStateAction<StudentDetailsType>>;
  user: any;
  setUser: (user: any) => void;
  subscriptionState: any;
  setSubscriptionState: (val: any) => void;
  addToast: (msg: string, type: "info" | "success" | "error") => void;
  setIsAdmin: (val: boolean) => void;
  setAdminViewMode: any;
  setShowOnboarding: (val: boolean) => void;
  setShowLoginModal: (val: boolean) => void;
  setShowPwaInstallModal: (val: boolean) => void;
  handleSignOut: () => void;
  db: any;
  auth: any;
  triggerCelebrationConfetti: () => void;

  // Syllabus Screen props
  activeDocument: any;
  setActiveDocument: (doc: any) => void;
  uploadMode: any;
  setUploadMode: (mode: any) => void;
  youtubeUrl: string;
  setYoutubeUrl: (url: string) => void;
  isYoutubeLoading: boolean;
  setIsYoutubeLoading: (loading: boolean) => void;
  isUploading: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement> | any) => Promise<void>;
  setSessionId: (id: string) => void;
  setDialogueHistory: (history: any) => void;
  setCustomBoardContent: (content: any) => void;
  setTopicBoardsContent: (content: any) => void;
  pastSessions: any[];
  setPastSessions: (sessions: any) => void;
  loadPastSessions: (uid: string) => void;
  disconnect: () => void;
  setUploadedButWaitingWakeup: (val: boolean) => void;
  setActiveTopicIndex: (index: number) => void;
  extractYoutubeId: (url: string) => string | null;
  handleLoadPastSession: (session: any) => void;
  onOpenAudioPodcast: (podcast: AudioPodcastData) => void;

  // Classroom Slot
  classroomSlot: React.ReactNode;

  // Quiz Arena props
  state: any;
  injectPromptText: (text: string) => void;
  topics: any[];
  activeTopicIndex: number;
  customBoardContent: string;
  topicBoardsContent: Record<number, string>;
  sessionId: string;

  // Virtual Lab props
  handleExplainExperimentOnWhiteboard: (topicTitle: string, experimentDetails?: any) => void;

  // Student Profile props
  sessionSnapshots: any[];
  handleDiscussConceptWithCherry: (concept: any) => void;
}

export const AppViewRouter: React.FC<AppViewRouterProps> = ({
  currentScreen,
  setCurrentScreen,
  showStudentAccountHub,
  setShowStudentAccountHub,

  // Home Screen props
  showBrandSplash,
  setShowBrandSplash,
  showIntroWalkthrough,
  setShowIntroWalkthrough,
  showEnrollmentScreen,
  setShowEnrollmentScreen,
  studentDetails,
  setStudentDetails,
  user,
  setUser,
  subscriptionState,
  setSubscriptionState,
  addToast,
  setIsAdmin,
  setAdminViewMode,
  setShowOnboarding,
  setShowLoginModal,
  setShowPwaInstallModal,
  handleSignOut,
  db,
  auth,
  triggerCelebrationConfetti,

  // Syllabus Screen props
  activeDocument,
  setActiveDocument,
  uploadMode,
  setUploadMode,
  youtubeUrl,
  setYoutubeUrl,
  isYoutubeLoading,
  setIsYoutubeLoading,
  isUploading,
  handleFileUpload,
  setSessionId,
  setDialogueHistory,
  setCustomBoardContent,
  setTopicBoardsContent,
  pastSessions,
  setPastSessions,
  loadPastSessions,
  disconnect,
  setUploadedButWaitingWakeup,
  setActiveTopicIndex,
  extractYoutubeId,
  handleLoadPastSession,
  onOpenAudioPodcast,

  // Classroom Slot
  classroomSlot,

  // Quiz Arena props
  state,
  injectPromptText,
  topics,
  activeTopicIndex,
  customBoardContent,
  topicBoardsContent,
  sessionId,

  // Virtual Lab props
  handleExplainExperimentOnWhiteboard,

  // Student Profile props
  sessionSnapshots,
  handleDiscussConceptWithCherry,
}) => {
  // 1. Home Screen (Splash, Walkthrough, Enrollment, or Mobile Splash)
  if (currentScreen === "home" && !showStudentAccountHub) {
    if (showBrandSplash) {
      return (
        <BrandSplashScreen
          onComplete={() => {
            setShowBrandSplash(false);
            setShowIntroWalkthrough(true);
          }}
        />
      );
    }

    if (showIntroWalkthrough) {
      return (
        <IntroWalkthroughScreen
          mediumOfLearning={studentDetails.mediumOfLearning}
          onComplete={() => {
            setShowIntroWalkthrough(false);
            setShowEnrollmentScreen(true);
          }}
          onSkip={() => {
            setShowIntroWalkthrough(false);
            setShowEnrollmentScreen(true);
          }}
        />
      );
    }

    if (showEnrollmentScreen) {
      return (
        <StudentEnrollmentScreen
          initialDetails={studentDetails}
          currentUser={user}
          subscriptionState={subscriptionState}
          onSubscriptionUpdated={setSubscriptionState}
          onToast={addToast}
          onUserAuthenticated={(authedUser) => {
            setUser(authedUser);
            if (authedUser && isAdminEmail(authedUser.email)) {
              setIsAdmin(true);
              setAdminViewMode("admin");
              setCurrentScreen("admin");
              setShowEnrollmentScreen(false);
              setShowBrandSplash(false);
              setShowIntroWalkthrough(false);
              setShowOnboarding(false);
              setShowLoginModal(false);
            }
          }}
          onComplete={async (data) => {
            const updatedDetails = {
              ...studentDetails,
              name: data.name,
              grade: data.grade,
              board: data.board,
              mediumOfLearning: data.mediumOfLearning,
            };
            setStudentDetails(updatedDetails);

            // Persist locally
            safeSetItem("cherry_student_profile", JSON.stringify(updatedDetails));
            if (user?.uid) {
              safeSetItem(`studentProfile_${user.uid}`, JSON.stringify(updatedDetails));
              // Save to Firestore if authenticated
              if (!user.uid.startsWith("local_")) {
                try {
                  const profileRef = doc(db, "studentProfiles", user.uid);
                  await setDoc(
                    profileRef,
                    {
                      userId: user.uid,
                      name: data.name,
                      grade: data.grade,
                      board: data.board,
                      mediumOfLearning: data.mediumOfLearning,
                      updatedAt: serverTimestamp(),
                    },
                    { merge: true }
                  );
                } catch (e) {
                  console.warn("[Enrollment] Firestore sync warn:", e);
                }
              }
            }

            // Celebration and Toast
            triggerCelebrationConfetti();
            addToast(`Namaste, ${data.name}! Welcome to Cherry AI Study Desk! 🎒✨`, "success");
            setShowEnrollmentScreen(false);
            setCurrentScreen("syllabus");
          }}
        />
      );
    }

    return (
      <MobileAppSplashScreen
        user={user}
        studentDetails={studentDetails}
        onStartLearning={(selectedGrade, selectedSubject) => {
          if (selectedGrade || selectedSubject) {
            setStudentDetails((prev) => ({
              ...prev,
              grade: selectedGrade || prev.grade,
              subject: selectedSubject || prev.subject,
            }));
          }
          setCurrentScreen("syllabus");
        }}
        onOpenLogin={() => setShowLoginModal(true)}
        onOpenProfile={() => {
          if (!user) {
            setShowLoginModal(true);
          } else {
            setShowStudentAccountHub(true);
          }
        }}
        onOpenClassroom={() => {
          setCurrentScreen("classroom");
        }}
        onOpenLab={() => {
          setCurrentScreen("lab");
        }}
        onOpenQuiz={() => {
          setCurrentScreen("quiz");
        }}
        onInstallPwa={() => setShowPwaInstallModal(true)}
        onSignOut={handleSignOut}
      />
    );
  }

  // 2. Syllabus & Document Desk Workspace
  if (currentScreen === "syllabus" && !showStudentAccountHub) {
    return (
      <SyllabusDeskModern
        studentDetails={studentDetails}
        setStudentDetails={setStudentDetails}
        activeDocument={activeDocument}
        setActiveDocument={setActiveDocument}
        uploadMode={uploadMode}
        setUploadMode={setUploadMode}
        youtubeUrl={youtubeUrl}
        setYoutubeUrl={setYoutubeUrl}
        isYoutubeLoading={isYoutubeLoading}
        setIsYoutubeLoading={setIsYoutubeLoading}
        isUploading={isUploading}
        handleFileUpload={handleFileUpload}
        setCurrentScreen={setCurrentScreen}
        setShowStudentAccountHub={setShowStudentAccountHub}
        addToast={addToast}
        auth={auth}
        db={db}
        user={user}
        setUser={setUser}
        setSessionId={setSessionId}
        setDialogueHistory={setDialogueHistory}
        setCustomBoardContent={setCustomBoardContent}
        setTopicBoardsContent={setTopicBoardsContent}
        setPastSessions={setPastSessions}
        loadPastSessions={loadPastSessions}
        disconnect={disconnect}
        setUploadedButWaitingWakeup={setUploadedButWaitingWakeup}
        setActiveTopicIndex={setActiveTopicIndex}
        extractYoutubeId={extractYoutubeId}
        pastSessions={pastSessions}
        handleLoadPastSession={handleLoadPastSession}
        onOpenAudioPodcast={onOpenAudioPodcast}
      />
    );
  }

  // 3. Live Classroom Board Room (Passed as Slot)
  if (currentScreen === "classroom" && !showStudentAccountHub) {
    return <>{classroomSlot}</>;
  }

  // 4. Dedicated Quick Quiz View
  if (currentScreen === "quiz" && !showStudentAccountHub) {
    return (
      <div className="flex-1 flex flex-col w-full h-full min-h-0 bg-[#F6F7FB] relative overflow-hidden select-none">
        {/* Header (Uniform 52px Native Header) */}
        <div className="w-full h-[52px] min-h-[52px] max-h-[52px] px-3.5 sm:px-5 flex items-center justify-between bg-white border-b border-slate-200/80 shrink-0 shadow-2xs z-20">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/90 text-[#796AEF] flex items-center justify-center shadow-xs shrink-0">
              <Brain className="w-4 h-4 text-[#796AEF]" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="text-xs sm:text-sm font-sans font-extrabold uppercase tracking-wide text-slate-900 truncate">
                Quiz Arena
              </h3>
              <span className="text-[9.5px] font-mono font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full border border-amber-200/80 shrink-0">
                Live XP
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCurrentScreen("syllabus")}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 rounded-full cursor-pointer active:scale-95 transition-all text-[11px] font-bold shadow-2xs shrink-0"
            title="Back to Study Desk"
          >
            <Home className="w-3.5 h-3.5 text-[#796AEF]" />
            <span className="hidden xs:inline text-[10.5px]">Desk</span>
          </button>
        </div>

        {/* Quiz Body */}
        <div className="flex-1 p-3 xs:p-4 overflow-y-auto no-scrollbar bg-[#F6F7FB] pb-24 md:pb-6">
          <QuickQuizView
            subject={studentDetails.subject}
            grade={studentDetails.grade}
            state={state}
            onInjectPrompt={injectPromptText}
            onToast={addToast}
            topics={topics}
            activeTopicIndex={activeTopicIndex}
            customBoardContent={customBoardContent}
            topicBoardsContent={topicBoardsContent}
            sessionId={sessionId}
            mediumOfLearning={studentDetails.mediumOfLearning}
          />
        </div>
      </div>
    );
  }

  // 5. Virtual Lab Simulation Studio
  if (currentScreen === "lab" && !showStudentAccountHub) {
    return (
      <div className="flex-1 flex flex-col w-full min-h-0 bg-[#F6F7FB] relative pb-20 md:pb-6">
        <VirtualLabStudio
          studentGrade={studentDetails.grade}
          studentSubject={studentDetails.subject}
          mediumOfLearning={studentDetails.mediumOfLearning}
          onOpenClassroomWithTopic={(topicTitle, experimentDetails) => {
            handleExplainExperimentOnWhiteboard(topicTitle, experimentDetails);
          }}
        />
      </div>
    );
  }

  // 6. Full-Page Student Profile & Performance Hub
  if (currentScreen === "profile" && !showStudentAccountHub) {
    return (
      <div className="flex-1 flex flex-col w-full h-full min-h-0 bg-slate-50 relative overflow-hidden pb-20 md:pb-0">
        <StudentAccountHub
          onClose={() => setCurrentScreen("syllabus")}
          studentName={studentDetails.name}
          grade={studentDetails.grade}
          subject={studentDetails.subject}
          board={studentDetails.board}
          mediumOfLearning={studentDetails.mediumOfLearning}
          totalSessionsCount={pastSessions.length}
          customBoardContent={customBoardContent}
          pastSessions={pastSessions}
          sessionSnapshots={sessionSnapshots}
          topics={topics}
          activeTopicIndex={activeTopicIndex}
          topicBoardsContent={topicBoardsContent}
          sessionId={sessionId}
          activeDocument={activeDocument}
          onDiscussWithCherry={(details: any) => handleDiscussConceptWithCherry(typeof details === "string" ? details : details?.topic || details?.conceptTested || "")}
          onEnterClassroom={() => {
            setCurrentScreen("classroom");
          }}
          onRefreshProfile={async () => {
            if (user) {
              try {
                const profileRef = doc(db, "studentProfiles", user.uid);
                let profileSnap;
                try {
                  profileSnap = await getDoc(profileRef);
                } catch (dbErr: any) {
                  console.warn(
                    "Could not load profile from Firestore on refresh (offline/unreachable):",
                    dbErr
                  );
                  const cachedProfile = localStorage.getItem(`studentProfile_${user.uid}`);
                  if (cachedProfile) {
                    const data = JSON.parse(cachedProfile);
                    setStudentDetails({
                      name: data.name || "",
                      grade: data.grade || "Class 10",
                      subject: data.subject || "Mathematics",
                      board: data.board || "CBSE",
                      mediumOfLearning: data.mediumOfLearning || "Hinglish",
                    });
                  }
                  return;
                }

                if (profileSnap && profileSnap.exists()) {
                  const data = profileSnap.data();
                  const profileData = {
                    name: data.name || "",
                    grade: data.grade || "Class 10",
                    subject: data.subject || "Mathematics",
                    board: data.board || "CBSE",
                    mediumOfLearning: data.mediumOfLearning || "Hinglish",
                  };
                  setStudentDetails(profileData);
                  localStorage.setItem(`studentProfile_${user.uid}`, JSON.stringify(profileData));
                }
              } catch (e: any) {
                console.warn(
                  "Failed refreshing active settings gracefully (offline):",
                  e.message || e
                );
              }
            }
          }}
          onSignOut={handleSignOut}
        />
      </div>
    );
  }

  // 7. Admin Dashboard
  if (currentScreen === "admin") {
    return (
      <AdminDashboard
        currentUser={user}
        onSignOut={handleSignOut}
        onSwitchToStudentView={(preset) => {
          if (preset) {
            setStudentDetails((prev) => ({
              ...prev,
              name: preset.name || prev.name,
              grade: preset.grade || prev.grade,
              subject: preset.subject || prev.subject,
              board: preset.board || prev.board,
              mediumOfLearning: preset.mediumOfLearning || prev.mediumOfLearning,
            }));
          }
          setAdminViewMode("student");
          setCurrentScreen("syllabus");
          addToast(
            preset?.name
              ? `Switched to Preview as ${preset.name} (${preset.grade} ${preset.board}) 👨‍🎓`
              : "Switched to Student Preview Mode 👨‍🎓 Tapping 'Return to Admin' returns here anytime.",
            "info"
          );
        }}
        onToast={addToast}
        studentDetails={studentDetails}
      />
    );
  }

  return null;
};
