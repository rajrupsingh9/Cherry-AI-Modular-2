import { SubscriptionState } from "../../utils/subscriptionStore";

export interface StudentProfileData {
  name: string;
  grade: string;
  subject: string;
  board?: string;
  mediumOfLearning?: string;
}

export interface UseStudentAuthProps {
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
