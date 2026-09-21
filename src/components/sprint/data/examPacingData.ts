/**
 * examPacingData.ts
 * Clean modular aggregator for all Exam Pacing Profiles (Physics, Math, Chemistry Track C, Biology Track D).
 * Preserves strict backward compatibility and enforces < 300 LOC per file.
 */
import { ExamPacingProfile } from "../sprintTypes";
import { PHYSICS_PACING_PROFILE } from "./physicsPacingData";
import { MATH_PACING_PROFILE } from "./mathPacingData";
import { CHEMISTRY_PACING_PROFILE } from "./chemistryPacingData";
import { BIOLOGY_PACING_PROFILE } from "./biologyPacingData";

export { PHYSICS_PACING_PROFILE } from "./physicsPacingData";
export { MATH_PACING_PROFILE } from "./mathPacingData";
export { CHEMISTRY_PACING_PROFILE } from "./chemistryPacingData";
export { BIOLOGY_PACING_PROFILE } from "./biologyPacingData";

export const EXAM_PACING_DATA: ExamPacingProfile[] = [
  PHYSICS_PACING_PROFILE,
  MATH_PACING_PROFILE,
  CHEMISTRY_PACING_PROFILE,
  BIOLOGY_PACING_PROFILE
];
