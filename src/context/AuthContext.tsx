import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { isAdminEmail } from "../utils/adminConfig";
import { matchProvisionedStudent, loadSubscriptionState } from "../utils/subscriptionStore";
import {
  StudentDetails,
  AuthContextType,
  AuthProviderProps,
} from "./authContextTypes";
import { createAuthSignOperations } from "./authOperationsSign";
import { createAuthOnboardingOperations } from "./authOperationsOnboarding";

export type { StudentDetails, AuthContextType, AuthProviderProps };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  addToast,
  onNavigateScreen,
  setShowEnrollmentScreen,
  setShowBrandSplash,
  setShowIntroWalkthrough,
  setSubscriptionState,
  onResetClassroomState,
}) => {
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
  const [studentDetails, setStudentDetails] = useState<StudentDetails>({
    name: "",
    grade: "Class 10",
    subject: "Mathematics",
    board: "CBSE",
    mediumOfLearning: "Hinglish",
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showStudentAccountHub, setShowStudentAccountHub] = useState(false);
  const [isLearnerProfileModalOpen, setIsLearnerProfileModalOpen] = useState(false);

  // Listen for Auth state changes
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
          if (onNavigateScreen) onNavigateScreen("admin");
          setShowOnboarding(false);
          setShowLoginModal(false);
          if (setShowEnrollmentScreen) setShowEnrollmentScreen(false);
          if (setShowBrandSplash) setShowBrandSplash(false);
          if (setShowIntroWalkthrough) setShowIntroWalkthrough(false);
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
            return;
          }

          if (profileSnap.exists()) {
            const data = profileSnap.data();
            const profileData: StudentDetails = {
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
              if (setSubscriptionState) setSubscriptionState(loadSubscriptionState());
              setShowOnboarding(false);
              setShowLoginModal(false);
              if (setShowEnrollmentScreen) setShowEnrollmentScreen(false);
              if (setShowIntroWalkthrough) setShowIntroWalkthrough(false);
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
                setShowOnboarding(true);
                setShowLoginModal(false);
              }
            }
          }
        } catch (error) {
          console.error("Error loading student profile:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [addToast, onNavigateScreen, setShowBrandSplash, setShowEnrollmentScreen, setShowIntroWalkthrough, setSubscriptionState]);

  const { refreshProfile, handleGoogleSignIn, handleSignOut } = createAuthSignOperations({
    user,
    setUser,
    studentDetails,
    setStudentDetails,
    setIsAdmin,
    setAdminViewMode,
    setShowLoginModal,
    setShowOnboarding,
    setShowStudentAccountHub,
    setIsLearnerProfileModalOpen,
    addToast,
    onNavigateScreen,
    setShowEnrollmentScreen,
    setShowBrandSplash,
    setShowIntroWalkthrough,
    setSubscriptionState,
    onResetClassroomState,
  });

  const { handleOnboardingSubmit, handleGuestLogin, handleMobileLoginSuccess } = createAuthOnboardingOperations({
    user,
    setUser,
    studentDetails,
    setStudentDetails,
    setShowLoginModal,
    setShowOnboarding,
    addToast,
    onNavigateScreen,
    setShowEnrollmentScreen,
    setSubscriptionState,
  });

  const value = useMemo(
    () => ({
      user,
      authLoading,
      isAdmin,
      adminViewMode,
      studentDetails,
      showLoginModal,
      showOnboarding,
      showStudentAccountHub,
      isLearnerProfileModalOpen,
      setIsAdmin,
      setAdminViewMode,
      setStudentDetails,
      setShowLoginModal,
      setShowOnboarding,
      setShowStudentAccountHub,
      setIsLearnerProfileModalOpen,
      handleGoogleSignIn,
      handleSignOut,
      handleOnboardingSubmit,
      handleGuestLogin,
      handleMobileLoginSuccess,
      refreshProfile,
    }),
    [
      user,
      authLoading,
      isAdmin,
      adminViewMode,
      studentDetails,
      showLoginModal,
      showOnboarding,
      showStudentAccountHub,
      isLearnerProfileModalOpen,
      handleGoogleSignIn,
      handleSignOut,
      handleOnboardingSubmit,
      handleGuestLogin,
      handleMobileLoginSuccess,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
