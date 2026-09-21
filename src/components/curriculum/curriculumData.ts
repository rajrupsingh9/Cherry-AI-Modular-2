/**
 * curriculumData.ts
 * Unified curriculum registry combining Mathematics, Class 10 Integrated Science,
 * and Senior Secondary Physics, Chemistry, and Biology.
 */
import { ChapterCurriculum } from "./curriculumTypes";
import { MATH_CURRICULUM } from "./data/mathCurriculumData";
import { SCIENCE_CLASS10_CURRICULUM } from "./data/scienceCurriculumData";
import { SENIOR_SCIENCE_CURRICULUM } from "./data/seniorScienceCurriculumData";

export const CURRICULUM_DATABASE: ChapterCurriculum[] = [
  ...MATH_CURRICULUM,
  ...SCIENCE_CLASS10_CURRICULUM,
  ...SENIOR_SCIENCE_CURRICULUM
];
