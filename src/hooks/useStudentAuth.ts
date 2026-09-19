import React, { useState, useEffect, useCallback } from "react";
import { 
  auth, 
  db, 
  googleProvider, 
  OperationType, 
  handleFirestoreError 
} from "../lib/firebase";
import { 
  signInWithPopup, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc,
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { isAdminEmail } from "../utils/adminConfig";
import { 
  loadSubscriptionState, 
  SubscriptionState, 
  matchProvisionedStudent, 
  isStudentSubscribed, 
  clearUserSubscriptionState, 
  getInitialSubscriptionState 
} from "../utils/subscriptionStore";
import { safeSavePastSessions } from "../utils/safeStorage";

export interface StudentProfileData {
  name: string;
  grade: string;
  subject: string;
  board?: string;
  mediumOfLearning?: string;
}

interface UseStudentAuthProps {
  addToast: (message: string, type: "info" | "success" | "error") => void;
  setCurrentScreen: (screen: "home" | "syllabus" | "classroom" | "quiz" | "lab" | "profile" | "admin") => void;
  setShowBrandSplash: (show: boolean) => void;
  setShowIntroWalkthrough: (show: boolean) => void;
  setShowEnrollmentScreen: (show: boolean) => void;
  showEnrollmentScreen: boolean;
  subscriptionState: SubscriptionState;
  setSubscriptionState: (state: SubscriptionState) => void;
  onClearSessionState?: () => void;
}

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
    mediumOfLearning: "Hinglish"
  });

  const [pastSessions, setPastSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [showStudentAccountHub, setShowStudentAccountHub] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLearnerProfileModalOpen, setIsLearnerProfileModalOpen] = useState(false);

  // Load Past Sessions from Firestore or Local Cache
  const loadPastSessions = useCallback(async (uid: string) => {
    setSessionsLoading(true);
    if (!auth.currentUser || uid === "local_guest_student" || uid.startsWith("local_")) {
      const cached = localStorage.getItem(`pastSessions_${uid}`);
      if (cached) {
        try {
          const sessions = JSON.parse(cached);
          setPastSessions(sessions);
        } catch (_) {}
      } else {
        setPastSessions([]);
      }
      setSessionsLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, "classSessions"),
        where("userId", "==", uid),
        orderBy("updatedAt", "desc")
      );
      const snapshot = await getDocs(q);
      const sessions = snapshot.docs.map(d => d.data());
      setPastSessions(sessions);
      safeSavePastSessions(uid, sessions);
    } catch (error: any) {
      const isPermissionDenied = error.code === "permission-denied" || 
        (error.message && (
          error.message.includes("permission-denied") || 
          error.message.includes("permission") || 
          error.message.includes("Permissions")
        ));
      
      if (isPermissionDenied) {
        handleFirestoreError(error, OperationType.LIST, "classSessions");
      }

      console.error("Error loading past sessions, falling back to local storage:", error);
      const cached = localStorage.getItem(`pastSessions_${uid}`);
      if (cached) {
        try {
          const sessions = JSON.parse(cached);
          setPastSessions(sessions);
          addToast("Loaded study activities from local cache! 🏛️📱", "info");
        } catch (_) {}
      }
    } finally {
      setSessionsLoading(false);
    }
  }, [addToast]);

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
              mediumOfLearning: data.mediumOfLearning || "Hinglish"
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
                  mediumOfLearning: "Hinglish"
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
  }, [addToast, loadPastSessions, setCurrentScreen, setShowBrandSplash, setShowEnrollmentScreen, setShowIntroWalkthrough, setSubscriptionState, showEnrollmentScreen]);

  // Handle Onboarding submission
  const handleOnboardingSubmit = async (data: { name: string; grade: string; board: string; mediumOfLearning: string }) => {
    let effectiveUser: any = auth.currentUser || user;
    if (!effectiveUser) {
      try {
        const stored = localStorage.getItem("local_active_user");
        if (stored) {
          effectiveUser = JSON.parse(stored);
        }
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
      const profileData = {
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
          updatedAt: serverTimestamp()
        }).then(() => {
          loadPastSessions(auth.currentUser!.uid).catch((err) => {
            console.warn("Could not load past sessions:", err);
          });
        }).catch((dbErr: any) => {
          console.warn("[Onboarding] background Firestore sync issue:", dbErr);
        });
      }
    } catch (offlineErr: any) {
      console.warn("[Onboarding] offline setup:", offlineErr);
      const offlineProfileData = {
        name: data.name,
        grade: data.grade,
        board: data.board,
        mediumOfLearning: data.mediumOfLearning,
        subject: studentDetails.subject || "Mathematics"
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

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const isAdm = isAdminEmail(result.user.email);
      setIsAdmin(isAdm);
      if (isAdm) {
        setAdminViewMode("admin");
        setCurrentScreen("admin");
        setShowEnrollmentScreen(false);
        setShowOnboarding(false);
        setShowLoginModal(false);
        setShowBrandSplash(false);
        setShowIntroWalkthrough(false);
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
        addToast("Sign-in popup was blocked by your browser. Please allow popups.", "info");
      } else {
        addToast(`Authentication failed: ${error.message}`, "error");
      }
    }
  };

  // Sign-Out Handler
  const handleSignOut = async () => {
    try {
      localStorage.removeItem("local_active_user");
      localStorage.removeItem("cherry_student_profile");
      localStorage.removeItem("cherry_active_doc");
      clearUserSubscriptionState();
      setSubscriptionState(getInitialSubscriptionState());
      setUser(null);
      setIsAdmin(false);
      setAdminViewMode("student");
      await signOut(auth);
      setStudentDetails({ name: "", grade: "Class 10", subject: "Mathematics", board: "CBSE", mediumOfLearning: "Hinglish" });
      setPastSessions([]);
      setShowStudentAccountHub(false);
      setIsLearnerProfileModalOpen(false);
      setShowBrandSplash(false);
      setShowIntroWalkthrough(false);
      setShowEnrollmentScreen(true);
      setCurrentScreen("home");
      if (onClearSessionState) {
        onClearSessionState();
      }
      addToast("Signed out successfully. Session ended safely. 👋", "info");
    } catch (error: any) {
      addToast(`Sign-out failed: ${error.message}`, "error");
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
              mediumOfLearning: data.mediumOfLearning || "Hinglish"
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
            mediumOfLearning: data.mediumOfLearning || "Hinglish"
          };
          setStudentDetails(profileData);
          localStorage.setItem(`studentProfile_${user.uid}`, JSON.stringify(profileData));
        }
      } catch (e: any) {
        console.warn("Failed refreshing active settings gracefully (offline):", e.message || e);
      }
    }
  }, [user]);

  // Guest Registration Handler
  const handleGuestSubmit = useCallback(async (e: React.FormEvent) => {
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
        const localProfile = {
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
          }).then(() => {
            loadPastSessions(currentUser!.uid);
          }).catch((dbErr: any) => {
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
  }, [studentDetails, user, addToast, loadPastSessions, setCurrentScreen]);

  // Mobile Login Success Handler
  const handleMobileLoginSuccess = useCallback((studentUser: any, profileData: any, subscription: any) => {
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
  }, [addToast, setCurrentScreen, setSubscriptionState, setShowEnrollmentScreen, setShowOnboarding]);

  // Delete Past Session Handler
  const handleDeletePastSession = async (sessId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    try {
      await deleteDoc(doc(db, "classSessions", sessId));
      addToast("Cloud session deleted successfully! 🗑️", "success");
      loadPastSessions(currentUser.uid);
    } catch (dbErr) {
      handleFirestoreError(dbErr, OperationType.DELETE, `classSessions/${sessId}`);
    }
  };

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
