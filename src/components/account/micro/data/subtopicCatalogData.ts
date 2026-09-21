/**
 * subtopicCatalogData.ts
 * Aggregated subtopic catalog combining Mathematics, Physics, Chemistry, and Biology.
 */
import { SubtopicCatalogItem } from "../microTypes";
import { MATH_SUBTOPICS } from "./mathSubtopics";
import { SCIENCE_SUBTOPICS } from "./scienceSubtopics";

export const SUBTOPIC_CATALOG: SubtopicCatalogItem[] = [
  ...MATH_SUBTOPICS,
  ...SCIENCE_SUBTOPICS,
];
