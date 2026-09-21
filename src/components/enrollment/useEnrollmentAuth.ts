/**
 * useEnrollmentAuth.ts
 * Manages Google authentication, direct student mobile lookup, and Firestore profile synchronization
 */
import { useState } from "react";
import { signInWithPopup, User as FirebaseUser } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "../../lib/firebase";
import { isAdminEmail } from "../../utils/adminConfig";
import { matchProvisionedStudent } from "../../utils/subscriptionStore";
import { OnboardingStep } from "./enrollmentTypes";

interface UseEnrollmentAuthProps {
  propUser?: FirebaseUser | null;
  name: string;
  setName: (name: string) => void;
  setCurrentStep: (step: OnboardingStep) => void;
  onToast?: (message: string, type?: "info" | "success" | "warning" | "error") => void;
  onUserAuthenticated?: (user: any) => void;
  onComplete: (data: any) => void;
}

export function useEnrollmentAuth({
  propUser,
  name,
  setName,
  setCurrentStep,
  onToast,
  onUserAuthenticated,
  onComplete,
}: UseEnrollmentAuthProps) {
  const activeAuthUser = auth.currentUser || propUser;
  const isGoogleAuthenticated = Boolean(
    activeAuthUser && !activeAuthUser.isAnonymous && !activeAuthUser.uid.startsWith("local_")
  );

  const [authedUser, setAuthedUser] = useState<FirebaseUser | null>(activeAuthUser || null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // STEP 1: Direct Session Helper (For enrolled student mobile lookup)
  const handleDirectStudentLogin = async (customEmailOrPhone?: string) => {
    const input = (customEmailOrPhone || "").trim();
    if (!input) return;
    const isPhone = /^\d{10}$/.test(input.replace(/\D/g, ""));
    const cleanPhone = isPhone ? input.replace(/\D/g, "") : "";
    const isEmail = input.includes("@");
    const isSuperAdmin = isAdminEmail(input);

    const matchedProvision = await matchProvisionedStudent({
      phone: cleanPhone || undefined,
      email: isEmail ? input.toLowerCase() : undefined,
    });

    if (matchedProvision && matchedProvision.profileData && matchedProvision.subscription) {
      const studentUser = {
        uid: matchedProvision.subscription.id,
        displayName: matchedProvision.profileData.name,
        email: matchedProvision.subscription.studentEmail || (cleanPhone ? `student_${cleanPhone}@cherry.ai` : "student@cherry.ai"),
        phoneNumber: cleanPhone || undefined,
        isAnonymous: false,
        photoURL: null,
      };
      try {
        localStorage.setItem("local_active_user", JSON.stringify(studentUser));
      } catch (_) {}
      setAuthedUser(studentUser as any);
      setName(matchedProvision.profileData.name);
      onUserAuthenticated?.(studentUser);
      onToast?.(
        `🎉 Welcome back ${matchedProvision.profileData.name}! Admin-activated ${matchedProvision.subscription.planName} Pro access loaded!`,
        "success"
      );
      onComplete({
        name: matchedProvision.profileData.name,
        grade: matchedProvision.profileData.grade,
        board: matchedProvision.profileData.board,
        mediumOfLearning: matchedProvision.profileData.mediumOfLearning,
      });
      return;
    }

    if (isSuperAdmin) {
      const adminUser = {
        uid: "admin_" + input.replace(/[^a-zA-Z0-9]/g, "_"),
        displayName: "Admin",
        email: input,
        phoneNumber: cleanPhone || undefined,
        isAnonymous: false,
        photoURL: null,
      };
      try {
        localStorage.setItem("local_active_user", JSON.stringify(adminUser));
      } catch (_) {}
      setAuthedUser(adminUser as any);
      onUserAuthenticated?.(adminUser);
      onToast?.(`Admin Access Granted: ${input}! Redirecting to Admin Dashboard 👑`, "success");
      return;
    }

    const studentName = name.trim() || (isEmail ? (input.split("@")[0] || "Student") : `Student ${cleanPhone.slice(-4)}`);
    const studentUser = {
      uid: cleanPhone ? `phone_${cleanPhone}` : ("student_" + Math.random().toString(36).substring(2, 9)),
      displayName: studentName,
      email: isEmail ? input : `${cleanPhone || "student"}@cherry.ai`,
      phoneNumber: cleanPhone || undefined,
      isAnonymous: false,
      photoURL: null,
    };
    try {
      localStorage.setItem("local_active_user", JSON.stringify(studentUser));
    } catch (_) {}
    setAuthedUser(studentUser as any);
    if (!name.trim()) {
      setName(studentName);
    }
    onUserAuthenticated?.(studentUser);
    onToast?.(`Logged in as ${studentName}! Profile verified 🧑‍🎓✨`, "success");
    setTimeout(() => {
      setCurrentStep("profile_setup");
    }, 300);
  };

  // STEP 1: Handle Google Sign-In
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedUser = result.user;
      setAuthedUser(loggedUser);
      onUserAuthenticated?.(loggedUser);
      if (isAdminEmail(loggedUser.email)) {
        onToast?.(
          `Admin Access Granted: ${loggedUser.email}! Redirecting to Admin Dashboard 👑`,
          "success"
        );
        return;
      }
      if (loggedUser.displayName && !name) {
        setName(loggedUser.displayName);
      }

      const provisionCheck = await matchProvisionedStudent({
        uid: loggedUser.uid,
        email: loggedUser.email || undefined,
        phone: (loggedUser as any).phoneNumber || undefined,
      });

      if (provisionCheck && provisionCheck.profileData && provisionCheck.subscription) {
        onToast?.(
          `🎉 Welcome ${provisionCheck.profileData.name}! Admin has already pre-activated your ${provisionCheck.subscription.planName} Pro access!`,
          "success"
        );
        onComplete({
          name: provisionCheck.profileData.name,
          grade: provisionCheck.profileData.grade,
          board: provisionCheck.profileData.board,
          mediumOfLearning: provisionCheck.profileData.mediumOfLearning,
        });
        return;
      }

      onToast?.(
        `Google account verified: ${loggedUser.displayName || loggedUser.email}! 🧑‍🎓✨`,
        "success"
      );
      setTimeout(() => {
        setCurrentStep("profile_setup");
      }, 400);
    } catch (err: any) {
      const isPopupClosed =
        err?.code === "auth/popup-closed-by-user" ||
        err?.message?.includes("popup-closed-by-user") ||
        err?.code === "auth/cancelled-popup-request";

      if (isPopupClosed) {
        onToast?.("Google sign-in was cancelled. Click again when ready.", "info");
      } else {
        console.error("Google sign-in error:", err);
        onToast?.(`Google Sign-In: ${err.message || "Please try again."}`, "error");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const saveProfileToCloud = async (profileData: {
    name: string;
    grade: string;
    board: string;
    mediumOfLearning: string;
    avatarEmoji: string;
  }) => {
    const targetUser = auth.currentUser || authedUser;
    if (targetUser && !targetUser.uid.startsWith("local_")) {
      try {
        const profileRef = doc(db, "studentProfiles", targetUser.uid);
        await setDoc(
          profileRef,
          {
            userId: targetUser.uid,
            ...profileData,
            email: targetUser.email || "",
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn("Firestore profile save warning:", err);
      }
    }
  };

  return {
    activeAuthUser,
    isGoogleAuthenticated,
    authedUser,
    setAuthedUser,
    isLoggingIn,
    handleGoogleLogin,
    handleDirectStudentLogin,
    saveProfileToCloud,
  };
}
