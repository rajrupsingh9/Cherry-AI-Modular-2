import React from "react";
import { User as FirebaseUser } from "firebase/auth";

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
  setIsAdmin: (val: boolean) => void;
  setAdminViewMode: (val: "admin" | "student") => void;
  setStudentDetails: React.Dispatch<React.SetStateAction<StudentDetails>>;
  setShowLoginModal: (val: boolean) => void;
  setShowOnboarding: (val: boolean) => void;
  setShowStudentAccountHub: (val: boolean) => void;
  setIsLearnerProfileModalOpen: (val: boolean) => void;
  handleGoogleSignIn: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  handleOnboardingSubmit: (data: { name: string; grade: string; board: string; mediumOfLearning: string }) => Promise<void>;
  handleGuestLogin: (name: string, grade: string) => Promise<void>;
  handleMobileLoginSuccess: (studentUser: any, profileData: any, subscription: any) => void;
  refreshProfile: () => Promise<void>;
}

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
