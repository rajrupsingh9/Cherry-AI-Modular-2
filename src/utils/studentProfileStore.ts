import { safeGetItem, safeSetItem } from "./safeStorage";

export interface ParkedConcept {
  id: string;
  concept: string;
  subject?: string;
  resolved?: boolean;
  date?: string;
  notes?: string;
  conceptName?: string;
  reason?: string;
  topicName?: string;
  dateAdded?: string;
  [key: string]: any;
}

export interface StudentProfile {
  studentName: string;
  targetExam: string;
  preferredLanguage: string;
  gradeLevel: string;
  totalStudyMinutes: number;
  totalSessionsCompleted: number;
  topicHistory: any[];
  parkedConcepts: ParkedConcept[];
}

const PROFILE_KEY = "cherry_student_profile";

export const DEFAULT_PROFILE: StudentProfile = {
  studentName: "Student",
  targetExam: "CBSE Board 2026",
  preferredLanguage: "Hinglish",
  gradeLevel: "Class 10",
  totalStudyMinutes: 120,
  totalSessionsCompleted: 8,
  topicHistory: [
    "Newton's Laws of Motion",
    "Chemical Reactions and Equations",
    "Linear Equations in Two Variables",
    "Refraction through Lenses",
  ],
  parkedConcepts: [
    {
      id: "pc_1",
      concept: "Lens Formula Sign Convention",
      subject: "Physics",
      resolved: false,
      date: new Date().toLocaleDateString(),
      notes: "Need to review object distance u is always negative",
    },
    {
      id: "pc_2",
      concept: "Balancing Redox Reactions",
      subject: "Chemistry",
      resolved: false,
      date: new Date().toLocaleDateString(),
      notes: "Oxidation number method steps",
    },
  ],
};

export function loadStudentProfile(): StudentProfile {
  try {
    const raw = safeGetItem(PROFILE_KEY, "");
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveStudentProfile(profile: Partial<StudentProfile>): void {
  try {
    const existing = loadStudentProfile();
    const updated = { ...existing, ...profile };
    safeSetItem(PROFILE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("[StudentProfileStore] Save failed:", e);
  }
}

export function resolveParkedConcept(id: string): void {
  try {
    const profile = loadStudentProfile();
    profile.parkedConcepts = profile.parkedConcepts.map((c) =>
      c.id === id ? { ...c, resolved: true } : c
    );
    saveStudentProfile(profile);
  } catch (e) {
    console.warn("[StudentProfileStore] Resolve parked concept failed:", e);
  }
}
