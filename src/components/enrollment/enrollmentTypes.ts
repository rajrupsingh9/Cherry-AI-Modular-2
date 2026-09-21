/**
 * enrollmentTypes.ts
 * Type definitions & configuration options for the student onboarding flow
 */
import { User as FirebaseUser } from "firebase/auth";
import { SubscriptionState } from "../../utils/subscriptionStore";

export type OnboardingStep =
  | "google_login"
  | "profile_setup"
  | "payment_149"
  | "api_key_setup"
  | "launch_app";

export interface StudentEnrollmentScreenProps {
  initialDetails: {
    name: string;
    grade: string;
    board?: string;
    mediumOfLearning?: string;
    subject?: string;
  };
  currentUser?: FirebaseUser | null;
  subscriptionState?: SubscriptionState;
  onComplete: (data: {
    name: string;
    grade: string;
    board: string;
    mediumOfLearning: string;
    avatarEmoji?: string;
  }) => void;
  onSkipToDesk?: () => void;
  onToast?: (message: string, type?: "info" | "success" | "warning" | "error") => void;
  onSubscriptionUpdated?: (state: SubscriptionState) => void;
  onUserAuthenticated?: (user: any) => void;
}

export const AVATAR_OPTIONS = ["🧑‍🎓", "👩‍🎓", "🚀", "🔬", "⚡", "🍒"];

export const GRADE_OPTIONS = [
  { id: "Class 6", label: "Class 6", desc: "Middle School Foundation" },
  { id: "Class 7", label: "Class 7", desc: "STEM Fundamentals" },
  { id: "Class 8", label: "Class 8", desc: "Pre-Boards & Science Core" },
  { id: "Class 9", label: "Class 9", desc: "Foundational STEM & CBSE/ICSE" },
  { id: "Class 10", label: "Class 10", desc: "Board Exam Mastery & PYQs" },
  { id: "Class 11", label: "Class 11", desc: "Science (Physics, Chem, Math/Bio)" },
  { id: "Class 12", label: "Class 12", desc: "Senior Boards & Fast Track" },
  { id: "NEET", label: "NEET", desc: "Medical Competitive Entrance" },
  { id: "JEE", label: "JEE", desc: "Engineering Competitive Entrance" },
];

export const BOARD_OPTIONS = [
  "CBSE Board",
  "ICSE / ISC",
  "UP Board",
  "Bihar Board (BSEB)",
  "Jharkhand Board (JAC)",
  "West Bengal Board (WBBSE/WBCHSE)",
  "Odisha Board (CHSE/BSE)",
  "Maharashtra Board",
  "Rajasthan Board (RBSE)",
  "MP Board",
  "Other State Board",
];

export const MEDIUM_OPTIONS = [
  { id: "Hinglish", label: "Hinglish", icon: "🇮🇳", desc: "Hindi + English Mix (Best)" },
  { id: "English", label: "English", icon: "🇬🇧", desc: "Pure English Explanation" },
  { id: "Hindi", label: "Hindi", icon: "🇮🇳", desc: "शुद्ध हिंदी माध्यम" },
  { id: "Bengali", label: "Bengali (বাংলা)", icon: "🇮🇳", desc: "বাংলা মাধ্যম" },
  { id: "Odisha", label: "Odisha / Odia (ଓଡ଼ିଆ)", icon: "🇮🇳", desc: "ଓଡ଼ିଆ ମାଧ୍ୟମ (Odisha)" },
  { id: "Marathi", label: "Marathi (मराठी)", icon: "🇮🇳", desc: "मराठी माध्यम" },
];

export const STEPS_NAV = [
  { id: "google_login", label: "1. Google Login", short: "Login" },
  { id: "profile_setup", label: "2. Profile", short: "Profile" },
  { id: "payment_149", label: "3. Choose Plan & Pay", short: "Plans" },
  { id: "api_key_setup", label: "4. API Key", short: "API Key" },
  { id: "launch_app", label: "5. Ready", short: "Use App" },
];
