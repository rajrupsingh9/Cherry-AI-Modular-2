import React, { useCallback } from "react";
import { signInAnonymously, type User as FirebaseUser } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { isStudentSubscribed, loadSubscriptionState, type SubscriptionState } from "../../utils/subscriptionStore";
import type { StudentProfileData } from "./types";

interface UseOnboardingWorkflowProps {
  user: FirebaseUser | null;
  setUser: (user: FirebaseUser | null) => void;
  studentDetails: StudentProfileData;
  setStudentDetails: (data: StudentProfileData) => void;
  isAdmin: boolean;
  subscriptionState: SubscriptionState;
  setSubscriptionState: (state: SubscriptionState) => void;
  setCurrentScreen: (screen: "home" | "syllabus" | "classroom" | "quiz" | "lab" | "profile" | "admin") => void;
  setShowOnboarding: (show: boolean) => void;
  setShowEnrollmentScreen: (show: boolean) => void;
  setShowLoginModal: (show: boolean) => void;
  loadPastSessions: (uid: string) => Promise<void>;
  addToast: (message: string, type: "info" | "success" | "error") => void;
}

export function useOnboardingWorkflow({
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
}: UseOnboardingWorkflowProps) {
  // Handle Onboarding submission
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
      const profileData: StudentProfileData = {
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
      const isProActive = isStudentSubscribed(effectiveUser) || subscriptionState.isPro;
      if (!isProActive && !isAdmin) {
        setShowEnrollmentScreen(true);
        setCurrentScreen("home");
        addToast(`Profile saved for ${data.name}! 🎓 Please select your Pro Plan to continue.`, "info");
      } else {
        setCurrentScreen("syllabus");
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
        })
          .then(() => {
            loadPastSessions(auth.currentUser!.uid).catch((err) => {
              console.warn("Could not load past sessions:", err);
            });
          })
          .catch((dbErr: any) => {
            console.warn("[Onboarding] background Firestore sync issue:", dbErr);
          });
      }
    } catch (offlineErr: any) {
      console.warn("[Onboarding] offline setup:", offlineErr);
      const offlineProfileData: StudentProfileData = {
        name: data.name,
        grade: data.grade,
        board: data.board,
        mediumOfLearning: data.mediumOfLearning,
        subject: studentDetails.subject || "Mathematics",
      };
      setStudentDetails(offlineProfileData);
      try {
        localStorage.setItem(`studentProfile_${activeUid}`, JSON.stringify(offlineProfileData));
        localStorage.setItem("cherry_student_profile", JSON.stringify(offlineProfileData));
      } catch (_) {}
      setShowOnboarding(false);
      const isProActive = isStudentSubscribed(effectiveUser) || subscriptionState.isPro;
      if (!isProActive && !isAdmin) {
        setShowEnrollmentScreen(true);
        setCurrentScreen("home");
        addToast(`Profile setup saved! 🎓 Please select your Pro Plan to continue.`, "info");
      } else {
        setCurrentScreen("syllabus");
        addToast(`Profile setup in offline/fallback mode! 🎒`, "info");
      }
      loadPastSessions(activeUid).catch((err) => {
        console.warn("Could not load past sessions:", err);
      });
    }
  };

  // Refresh Profile Handler
  const handleRefreshProfile = useCallback(async () => {
    if (user) {
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
              mediumOfLearning: data.mediumOfLearning || "Hinglish",
            });
          }
          return;
        }

        if (profileSnap && profileSnap.exists()) {
          const data = profileSnap.data();
          const profileData: StudentProfileData = {
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
        console.warn("Failed refreshing active settings gracefully (offline):", e.message || e);
      }
    }
  }, [user, setStudentDetails]);

  // Guest Registration Handler
  const handleGuestSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!studentDetails.name.trim()) {
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
              displayName: studentDetails.name,
              isAnonymous: true,
            } as any;
            setUser(currentUser);
            localStorage.setItem("local_active_user", JSON.stringify(currentUser));
          }
        }

        if (currentUser) {
          const localProfile: StudentProfileData = {
            name: studentDetails.name,
            grade: studentDetails.grade,
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
            })
              .then(() => {
                loadPastSessions(currentUser!.uid);
              })
              .catch((dbErr: any) => {
                console.warn("Firestore guest profile issue background:", dbErr);
              });
          } else {
            loadPastSessions(currentUser.uid);
          }
          addToast(`Namaste, ${studentDetails.name}! Profile set up successfully! 🎒✨`, "success");
        }
        setShowLoginModal(false);
        setCurrentScreen("syllabus");
      } catch (err: any) {
        console.error("Auth routing exception:", err);
        setShowLoginModal(false);
        setCurrentScreen("syllabus");
      }
    },
    [studentDetails, user, addToast, loadPastSessions, setCurrentScreen, setUser, setShowLoginModal]
  );

  // Mobile Login Success Handler
  const handleMobileLoginSuccess = useCallback(
    (studentUser: any, profileData: any, subscription: any) => {
      try {
        localStorage.setItem("local_active_user", JSON.stringify(studentUser));
        localStorage.setItem(`studentProfile_${studentUser.uid}`, JSON.stringify(profileData));
      } catch (_) {}
      setUser(studentUser as any);
      setStudentDetails(profileData);
      setSubscriptionState(loadSubscriptionState());
      setShowLoginModal(false);
      setShowEnrollmentScreen(false);
      setShowOnboarding(false);
      setCurrentScreen("classroom");
      addToast(`🎉 Welcome ${profileData.name}! Your ${subscription.planName} Pro Access is Active!`, "success");
    },
    [addToast, setCurrentScreen, setSubscriptionState, setShowEnrollmentScreen, setShowOnboarding, setUser, setStudentDetails, setShowLoginModal]
  );

  return {
    handleOnboardingSubmit,
    handleRefreshProfile,
    handleGuestSubmit,
    handleMobileLoginSuccess,
  };
}
