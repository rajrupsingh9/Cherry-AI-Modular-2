import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { isAdminEmail } from "../utils/adminConfig";
import { loadSubscriptionState, matchProvisionedStudent } from "../utils/subscriptionStore";
import { StudentProfileData, UseStudentAuthProps } from "./auth/types";
import { usePastSessionsSync } from "./auth/usePastSessionsSync";
import { useOnboardingWorkflow } from "./auth/useOnboardingWorkflow";
import { useGoogleAuthWorkflow } from "./auth/useGoogleAuthWorkflow";

export type { StudentProfileData };

export function useStudentAuth({
  addToast,
  setCurrentScreen,
  setShowBrandSplash,
  setShowIntroWalkthrough,
  setShowEnrollmentScreen,
  showEnrollmentScreen,
  subscriptionState,
  setSubscriptionState,
  onClearSessionState,
}: UseStudentAuthProps) {
  // Auth and Profile states
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem("local_active_user");
      if (cached) {
        const u = JSON.parse(cached);
        return isAdminEmail(u?.email);
      }
    } catch (_) {}
    return false;
  });
  const [adminViewMode, setAdminViewMode] = useState<"admin" | "student">("admin");
  const [studentDetails, setStudentDetails] = useState<StudentProfileData>({
    name: "",
    grade: "Class 10",
    subject: "Mathematics",
    board: "CBSE",
    mediumOfLearning: "Hinglish",
  });

  const [showStudentAccountHub, setShowStudentAccountHub] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLearnerProfileModalOpen, setIsLearnerProfileModalOpen] = useState(false);

  // 1. Past Sessions Sync Sub-Hook
  const {
    pastSessions,
    setPastSessions,
    sessionsLoading,
    loadPastSessions,
    handleDeletePastSession,
  } = usePastSessionsSync({ addToast });

  // 2. Onboarding & Registration Sub-Hook
  const {
    handleOnboardingSubmit,
    handleRefreshProfile,
    handleGuestSubmit,
    handleMobileLoginSuccess,
  } = useOnboardingWorkflow({
    user,
    setUser,
    studentDetails,
    setStudentDetails,
    isAdmin,
    subscriptionState,
    setSubscriptionState,
    setCurrentScreen,
    setShowOnboarding,
    setShowEnrollmentScreen,
    setShowLoginModal,
    loadPastSessions,
    addToast,
  });

  // 3. Google Sign-In & Sign-Out Sub-Hook
  const { handleGoogleSignIn, handleSignOut } = useGoogleAuthWorkflow({
    studentDetails,
    setStudentDetails,
    setUser,
    setIsAdmin,
    setAdminViewMode,
    setCurrentScreen,
    setShowEnrollmentScreen,
    setShowOnboarding,
    setShowLoginModal,
    setShowBrandSplash,
    setShowIntroWalkthrough,
    setSubscriptionState,
    setPastSessions,
    setShowStudentAccountHub,
    setIsLearnerProfileModalOpen,
    onClearSessionState,
    addToast,
  });

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      let activeUser = firebaseUser;

      if (!activeUser) {
        const cachedLocalUserStr = localStorage.getItem("local_active_user");
        if (cachedLocalUserStr) {
          try {
            activeUser = JSON.parse(cachedLocalUserStr);
          } catch (_) {}
        }
      }

      setUser(activeUser);
      setAuthLoading(false);

      if (activeUser) {
        const userIsAdmin = isAdminEmail(activeUser.email);
        setIsAdmin(userIsAdmin);
        if (userIsAdmin) {
          setAdminViewMode("admin");
          setCurrentScreen("admin");
          setShowOnboarding(false);
          setShowLoginModal(false);
          setShowEnrollmentScreen(false);
          setShowBrandSplash(false);
          setShowIntroWalkthrough(false);
        } else {
          setAdminViewMode("student");
        }

        try {
          const profileRef = doc(db, "studentProfiles", activeUser.uid);
          let profileSnap;
          try {
            if (activeUser.uid === "local_guest_student" || activeUser.uid.startsWith("local_")) {
              throw new Error("Local guest user bypassed database fetch");
            }
            profileSnap = await getDoc(profileRef);
          } catch (dbErr: any) {
            console.warn("Could not load profile from Firestore: offline/unreachable.", dbErr);
            const cachedProfile = localStorage.getItem(`studentProfile_${activeUser.uid}`);
            if (cachedProfile) {
              const data = JSON.parse(cachedProfile);
              setStudentDetails({
                name: data.name || "",
                grade: data.grade || "Class 10",
                subject: data.subject || "Mathematics",
                board: data.board || "CBSE",
                mediumOfLearning: data.mediumOfLearning || "Hinglish",
              });
              addToast(`Restored local profile ${data.name}! 🎒✨`, "info");
              setShowLoginModal(false);
            } else {
              setStudentDetails((prev) => ({
                ...prev,
                name: activeUser!.displayName || prev.name || "Student",
                board: "CBSE",
                mediumOfLearning: "Hinglish",
              }));
              setShowLoginModal(false);
            }
            loadPastSessions(activeUser.uid).catch((err) => {
              console.warn("Could not load past sessions:", err);
            });
            return;
          }

          if (profileSnap.exists()) {
            const data = profileSnap.data();
            const profileData = {
              name: data.name || "",
              grade: data.grade || "Class 10",
              subject: data.subject || "Mathematics",
              board: data.board || "CBSE",
              mediumOfLearning: data.mediumOfLearning || "Hinglish",
            };
            setStudentDetails(profileData);
            localStorage.setItem(`studentProfile_${activeUser.uid}`, JSON.stringify(profileData));
            addToast(`Cloud profile restored for ${data.name}! ☁️✨`, "success");
            setShowLoginModal(false);
          } else {
            const matchedProvision = await matchProvisionedStudent({
              uid: activeUser.uid,
              email: activeUser.email || undefined,
              phone: (activeUser as any).phoneNumber || undefined,
            });

            if (matchedProvision && matchedProvision.profileData && matchedProvision.subscription) {
              setStudentDetails(matchedProvision.profileData);
              localStorage.setItem(`studentProfile_${activeUser.uid}`, JSON.stringify(matchedProvision.profileData));
              setSubscriptionState(loadSubscriptionState());
              setShowOnboarding(false);
              setShowLoginModal(false);
              setShowEnrollmentScreen(false);
              setShowIntroWalkthrough(false);
              addToast(`🎉 Welcome ${matchedProvision.profileData.name}! Your ${matchedProvision.subscription.planName} Pro Access is Active!`, "success");
            } else {
              if (activeUser.displayName) {
                setStudentDetails((prev) => ({
                  ...prev,
                  name: activeUser.displayName || prev.name,
                  board: "CBSE",
                  mediumOfLearning: "Hinglish",
                }));
              }
              if (!activeUser.isAnonymous && !userIsAdmin) {
                if (!showEnrollmentScreen) {
                  setShowOnboarding(true);
                }
                setShowLoginModal(false);
              }
            }
          }
          loadPastSessions(activeUser.uid).catch((err) => {
            console.warn("Could not load past sessions:", err);
          });
        } catch (error) {
          console.error("Error loading student profile:", error);
        }
      } else {
        setPastSessions([]);
      }
    });

    return () => unsubscribe();
  }, [
    addToast,
    loadPastSessions,
    setCurrentScreen,
    setShowBrandSplash,
    setShowEnrollmentScreen,
    setShowIntroWalkthrough,
    setSubscriptionState,
    showEnrollmentScreen,
    setPastSessions,
  ]);

  return {
    user,
    setUser,
    authLoading,
    isAdmin,
    setIsAdmin,
    adminViewMode,
    setAdminViewMode,
    studentDetails,
    setStudentDetails,
    pastSessions,
    setPastSessions,
    sessionsLoading,
    loadPastSessions,
    showStudentAccountHub,
    setShowStudentAccountHub,
    showOnboarding,
    setShowOnboarding,
    showLoginModal,
    setShowLoginModal,
    isLearnerProfileModalOpen,
    setIsLearnerProfileModalOpen,
    handleOnboardingSubmit,
    handleGoogleSignIn,
    handleSignOut,
    handleRefreshProfile,
    handleGuestSubmit,
    handleMobileLoginSuccess,
    handleDeletePastSession,
  };
}
