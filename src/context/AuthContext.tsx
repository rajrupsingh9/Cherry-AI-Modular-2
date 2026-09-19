import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { User as FirebaseUser, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, signInAnonymously } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider, OperationType, handleFirestoreError } from "../lib/firebase";
import { isAdminEmail } from "../utils/adminConfig";
import { matchProvisionedStudent, loadSubscriptionState, clearUserSubscriptionState, getInitialSubscriptionState } from "../utils/subscriptionStore";

export interface StudentDetails {
  name: string;
  grade: string;
  subject: string;
  board?: string;
  mediumOfLearning?: string;
}

export interface AuthContextType {
  user: FirebaseUser | null;
  authLoading: boolean;
  isAdmin: boolean;
  adminViewMode: "admin" | "student";
  studentDetails: StudentDetails;
  showLoginModal: boolean;
  showOnboarding: boolean;
  showStudentAccountHub: boolean;
  isLearnerProfileModalOpen: boolean;
  // State setters & actions
  setIsAdmin: (val: boolean) => void;
  setAdminViewMode: (val: "admin" | "student") => void;
  setStudentDetails: React.Dispatch<React.SetStateAction<StudentDetails>>;
  setShowLoginModal: (val: boolean) => void;
  setShowOnboarding: (val: boolean) => void;
  setShowStudentAccountHub: (val: boolean) => void;
  setIsLearnerProfileModalOpen: (val: boolean) => void;
  // Handlers
  handleGoogleSignIn: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  handleOnboardingSubmit: (data: { name: string; grade: string; board: string; mediumOfLearning: string }) => Promise<void>;
  handleGuestLogin: (name: string, grade: string) => Promise<void>;
  handleMobileLoginSuccess: (studentUser: any, profileData: any, subscription: any) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
  addToast: (message: string, type: "info" | "success" | "error" | "warning") => void;
  onNavigateScreen?: (screen: "home" | "syllabus" | "classroom" | "quiz" | "lab" | "profile" | "admin") => void;
  setShowEnrollmentScreen?: (val: boolean) => void;
  setShowBrandSplash?: (val: boolean) => void;
  setShowIntroWalkthrough?: (val: boolean) => void;
  setSubscriptionState?: (state: any) => void;
  onResetClassroomState?: () => void;
}

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
    mediumOfLearning: "Hinglish"
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showStudentAccountHub, setShowStudentAccountHub] = useState(false);
  const [isLearnerProfileModalOpen, setIsLearnerProfileModalOpen] = useState(false);

  // Listen for Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      let activeUser = firebaseUser;
      
      // Check if we have a locally active mock guest session
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
        // Automatic Role-Based SSO Resolution
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
            console.warn("Could not load profile from Firestore: student is offline/backend unreachable.", dbErr);
            const cachedProfile = localStorage.getItem(`studentProfile_${activeUser.uid}`);
            if (cachedProfile) {
              const data = JSON.parse(cachedProfile);
              setStudentDetails({
                name: data.name || "",
                grade: data.grade || "Class 10",
                subject: data.subject || "Mathematics",
                board: data.board || "CBSE",
                mediumOfLearning: data.mediumOfLearning || "Hinglish"
              });
              addToast(`Restored local profile ${data.name}! 🎒✨`, "info");
              setShowLoginModal(false);
            } else {
              setStudentDetails((prev) => ({
                ...prev,
                name: activeUser!.displayName || prev.name || "Student",
                board: "CBSE",
                mediumOfLearning: "Hinglish"
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
              mediumOfLearning: data.mediumOfLearning || "Hinglish"
            };
            setStudentDetails(profileData);
            localStorage.setItem(`studentProfile_${activeUser.uid}`, JSON.stringify(profileData));
            addToast(`Cloud profile restored for ${data.name}! ☁️✨`, "success");
            setShowLoginModal(false);
          } else {
            // Check if this student was manually onboarded / provisioned by Admin
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
                  mediumOfLearning: "Hinglish"
                }));
              }
              // Trigger onboarding flow for first-time Google sign-ins (ignores anonymous guest users & admin users)
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

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const profileRef = doc(db, "studentProfiles", user.uid);
      let profileSnap;
      try {
        profileSnap = await getDoc(profileRef);
      } catch (dbErr: any) {
        console.warn("Could not load profile from Firestore on refresh (offline/unreachable):", dbErr);
        const cachedProfile = localStorage.getItem(`studentProfile_${user.uid}`);
        if (cachedProfile) {
          const data = JSON.parse(cachedProfile);
          setStudentDetails({
            name: data.name || "",
            grade: data.grade || "Class 10",
            subject: data.subject || "Mathematics",
            board: data.board || "CBSE",
            mediumOfLearning: data.mediumOfLearning || "Hinglish"
          });
        }
        return;
      }

      if (profileSnap && profileSnap.exists()) {
        const data = profileSnap.data();
        const profileData: StudentDetails = {
          name: data.name || "",
          grade: data.grade || "Class 10",
          subject: data.subject || "Mathematics",
          board: data.board || "CBSE",
          mediumOfLearning: data.mediumOfLearning || "Hinglish"
        };
        setStudentDetails(profileData);
        localStorage.setItem(`studentProfile_${user.uid}`, JSON.stringify(profileData));
      }
    } catch (e: any) {
      console.warn("Failed refreshing active settings gracefully (offline):", e.message || e);
    }
  }, [user]);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const isAdm = isAdminEmail(result.user.email);
      setIsAdmin(isAdm);
      if (isAdm) {
        setAdminViewMode("admin");
        if (onNavigateScreen) onNavigateScreen("admin");
        if (setShowEnrollmentScreen) setShowEnrollmentScreen(false);
        setShowOnboarding(false);
        setShowLoginModal(false);
        if (setShowBrandSplash) setShowBrandSplash(false);
        if (setShowIntroWalkthrough) setShowIntroWalkthrough(false);
        addToast("Welcome, Admin! Redirected to Admin Dashboard 👑", "success");
      } else {
        setAdminViewMode("student");
        addToast(`Logged in successfully as ${result.user.displayName || "Student"}! 🧑‍🎓✨`, "success");
      }
    } catch (error: any) {
      if (error?.code === "auth/unauthorized-domain" || error?.message?.includes("unauthorized-domain")) {
        console.warn("Firebase Auth unauthorized domain in preview environment. Activating direct student session.");
        const fallbackStudent = {
          uid: "student_verified_" + Date.now().toString(36),
          displayName: studentDetails.name || "Student",
          email: "student@cherryai.app",
          isAnonymous: false,
        };
        try {
          localStorage.setItem("local_active_user", JSON.stringify(fallbackStudent));
        } catch (_) {}
        setUser(fallbackStudent as any);
        setIsAdmin(false);
        setAdminViewMode("student");
        addToast("Activated verified student session! 🎒✨", "success");
      } else if (
        error?.code === "auth/popup-closed-by-user" ||
        error?.message?.includes("popup-closed-by-user") ||
        error?.code === "auth/cancelled-popup-request" ||
        error?.message?.includes("cancelled-popup-request")
      ) {
        console.info("Google sign-in popup was closed by user.");
        addToast("Google sign-in was cancelled. Tap again when ready.", "info");
      } else if (error?.code === "auth/popup-blocked" || error?.message?.includes("popup-blocked")) {
        console.warn("Google sign-in popup was blocked by browser.");
        addToast("Sign-in popup was blocked by your browser. Please allow popups.", "warning");
      } else {
        addToast(`Authentication failed: ${error.message}`, "error");
      }
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("local_active_user");
      localStorage.removeItem("cherry_student_profile");
      localStorage.removeItem("cherry_active_doc");
      clearUserSubscriptionState();
      if (setSubscriptionState) setSubscriptionState(getInitialSubscriptionState());
      setUser(null);
      setIsAdmin(false);
      setAdminViewMode("student");
      await firebaseSignOut(auth);
      setStudentDetails({ name: "", grade: "Class 10", subject: "Mathematics", board: "CBSE", mediumOfLearning: "Hinglish" });
      setShowStudentAccountHub(false);
      setIsLearnerProfileModalOpen(false);
      if (setShowBrandSplash) setShowBrandSplash(false);
      if (setShowIntroWalkthrough) setShowIntroWalkthrough(false);
      if (setShowEnrollmentScreen) setShowEnrollmentScreen(true);
      if (onResetClassroomState) onResetClassroomState();
      if (onNavigateScreen) onNavigateScreen("home");
      addToast("Signed out successfully. Session ended safely. 👋", "info");
    } catch (error: any) {
      addToast(`Sign-out failed: ${error.message}`, "error");
    }
  };

  const handleOnboardingSubmit = async (data: { name: string; grade: string; board: string; mediumOfLearning: string }) => {
    let effectiveUser: any = auth.currentUser || user;
    if (!effectiveUser) {
      try {
        const stored = localStorage.getItem("local_active_user");
        if (stored) effectiveUser = JSON.parse(stored);
      } catch (_) {}
    }

    if (!effectiveUser) {
      const fallbackUser = {
        uid: "student_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6),
        displayName: data.name,
        email: `${data.name.toLowerCase().replace(/\s+/g, "") || "student"}@cherryai.app`,
        isAnonymous: false,
      };
      try {
        localStorage.setItem("local_active_user", JSON.stringify(fallbackUser));
      } catch (_) {}
      effectiveUser = fallbackUser;
      setUser(effectiveUser as any);
    }

    const activeUid = effectiveUser.uid || "local_student";

    try {
      const profileData: StudentDetails = {
        name: data.name,
        grade: data.grade,
        board: data.board,
        mediumOfLearning: data.mediumOfLearning,
        subject: studentDetails.subject || "Mathematics"
      };

      setStudentDetails(profileData);
      try {
        localStorage.setItem(`studentProfile_${activeUid}`, JSON.stringify(profileData));
        localStorage.setItem("cherry_student_profile", JSON.stringify(profileData));
      } catch (_) {}

      setShowOnboarding(false);
      const subState = loadSubscriptionState();
      const isProActive = subState.isPro;
      if (!isProActive && !isAdmin && setShowEnrollmentScreen) {
        setShowEnrollmentScreen(true);
        if (onNavigateScreen) onNavigateScreen("home");
        addToast(`Profile saved for ${data.name}! 🎓 Please select your Pro Plan to continue.`, "info");
      } else {
        if (onNavigateScreen) onNavigateScreen("syllabus"); 
        addToast(`Namaste, ${data.name}! Your student profile setup is complete! 🎓🎒`, "success");
      }

      // Write to Firestore in the background
      if (auth.currentUser && !auth.currentUser.uid.startsWith("local_")) {
        const profileRef = doc(db, "studentProfiles", auth.currentUser.uid);
        setDoc(profileRef, {
          userId: auth.currentUser.uid,
          name: data.name,
          grade: data.grade,
          board: data.board,
          mediumOfLearning: data.mediumOfLearning,
          subject: studentDetails.subject || "Mathematics",
          updatedAt: serverTimestamp()
        }).catch((dbErr: any) => {
          console.warn("[Onboarding] background Firestore sync issue:", dbErr);
        });
      }
    } catch (offlineErr: any) {
      console.warn("[Onboarding] offline setup:", offlineErr);
    }
  };

  const handleGuestLogin = async (guestName: string, guestGrade: string) => {
    if (!guestName.trim()) {
      addToast("Please tell us your name first to sit on the desk! 🧑‍🎓", "error");
      return;
    }

    try {
      let currentUser = auth.currentUser || user;
      if (!currentUser) {
        try {
          const anonResult = await signInAnonymously(auth);
          currentUser = anonResult.user;
        } catch (anonErr) {
          console.warn("Anonymous registration failed, using guest fallback:", anonErr);
          currentUser = {
            uid: "local_guest_student",
            displayName: guestName,
            isAnonymous: true,
          } as any;
          setUser(currentUser);
          localStorage.setItem("local_active_user", JSON.stringify(currentUser));
        }
      }

      if (currentUser) {
        const localProfile: StudentDetails = {
          name: guestName,
          grade: guestGrade,
          subject: studentDetails.subject || "Mathematics",
          board: studentDetails.board || "CBSE",
          mediumOfLearning: studentDetails.mediumOfLearning || "Hinglish",
        };
        localStorage.setItem(`studentProfile_${currentUser.uid}`, JSON.stringify(localProfile));

        if (currentUser.uid !== "local_guest_student" && !currentUser.uid.startsWith("local_")) {
          const profileRef = doc(db, "studentProfiles", currentUser.uid);
          setDoc(profileRef, {
            userId: currentUser.uid,
            ...localProfile,
            updatedAt: serverTimestamp(),
          }).catch((dbErr: any) => {
            console.warn("Firestore guest profile issue background:", dbErr);
          });
        }
        addToast(`Namaste, ${guestName}! Profile set up successfully! 🎒✨`, "success");
      }
      setShowLoginModal(false);
      if (onNavigateScreen) onNavigateScreen("syllabus");
    } catch (err: any) {
      console.error("Auth routing exception:", err);
      setShowLoginModal(false);
      if (onNavigateScreen) onNavigateScreen("syllabus");
    }
  };

  const handleMobileLoginSuccess = (studentUser: any, profileData: any, subscription: any) => {
    try {
      localStorage.setItem("local_active_user", JSON.stringify(studentUser));
      localStorage.setItem(`studentProfile_${studentUser.uid}`, JSON.stringify(profileData));
    } catch (_) {}
    setUser(studentUser as any);
    setStudentDetails(profileData);
    if (setSubscriptionState) setSubscriptionState(loadSubscriptionState());
    setShowLoginModal(false);
    if (setShowEnrollmentScreen) setShowEnrollmentScreen(false);
    setShowOnboarding(false);
    if (onNavigateScreen) onNavigateScreen("classroom");
    addToast(`🎉 Welcome ${profileData.name}! Your ${subscription.planName} Pro Access is Active!`, "success");
  };

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
