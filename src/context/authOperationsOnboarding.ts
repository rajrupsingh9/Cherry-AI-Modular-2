import React from "react";
import { User as FirebaseUser, signInAnonymously } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { loadSubscriptionState } from "../utils/subscriptionStore";
import { StudentDetails } from "./authContextTypes";

export interface AuthOnboardingParams {
  user: FirebaseUser | null;
  setUser: React.Dispatch<React.SetStateAction<FirebaseUser | null>>;
  studentDetails: StudentDetails;
  setStudentDetails: React.Dispatch<React.SetStateAction<StudentDetails>>;
  setShowLoginModal: (val: boolean) => void;
  setShowOnboarding: (val: boolean) => void;
  addToast: (message: string, type: "info" | "success" | "error" | "warning") => void;
  onNavigateScreen?: (screen: "home" | "syllabus" | "classroom" | "quiz" | "lab" | "profile" | "admin") => void;
  setShowEnrollmentScreen?: (val: boolean) => void;
  setSubscriptionState?: (state: any) => void;
}

export function createAuthOnboardingOperations(params: AuthOnboardingParams) {
  const {
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
  } = params;

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
        subject: studentDetails.subject || "Mathematics",
      };

      setStudentDetails(profileData);
      try {
        localStorage.setItem(`studentProfile_${activeUid}`, JSON.stringify(profileData));
        localStorage.setItem("cherry_student_profile", JSON.stringify(profileData));
      } catch (_) {}

      setShowOnboarding(false);
      const subState = loadSubscriptionState();
      const isProActive = subState.isPro;
      if (!isProActive && !params.user && setShowEnrollmentScreen) {
        setShowEnrollmentScreen(true);
        if (onNavigateScreen) onNavigateScreen("home");
        addToast(`Profile saved for ${data.name}! 🎓 Please select your Pro Plan to continue.`, "info");
      } else {
        if (onNavigateScreen) onNavigateScreen("syllabus");
        addToast(`Namaste, ${data.name}! Your student profile setup is complete! 🎓🎒`, "success");
      }

      if (auth.currentUser && !auth.currentUser.uid.startsWith("local_")) {
        const profileRef = doc(db, "studentProfiles", auth.currentUser.uid);
        setDoc(profileRef, {
          userId: auth.currentUser.uid,
          name: data.name,
          grade: data.grade,
          board: data.board,
          mediumOfLearning: data.mediumOfLearning,
          subject: studentDetails.subject || "Mathematics",
          updatedAt: serverTimestamp(),
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

  return {
    handleOnboardingSubmit,
    handleGuestLogin,
    handleMobileLoginSuccess,
  };
}
