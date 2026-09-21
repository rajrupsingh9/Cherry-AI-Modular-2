/**
 * prerequisiteChainsData.ts
 * Aggregator for all STEM Concept Dependency Chains.
 */
import { ConceptDependencyChain } from "../prerequisiteTypes";
import { MATH_PREREQUISITE_CHAINS } from "./mathPrereqData";
import { PHYSICS_PREREQUISITE_CHAINS } from "./physicsPrereqData";
import { CHEMISTRY_PREREQUISITE_CHAINS } from "./chemistryPrereqData";
import { BIOLOGY_PREREQUISITE_CHAINS } from "./biologyPrereqData";

export { MATH_PREREQUISITE_CHAINS } from "./mathPrereqData";
export { PHYSICS_PREREQUISITE_CHAINS } from "./physicsPrereqData";
export { CHEMISTRY_PREREQUISITE_CHAINS } from "./chemistryPrereqData";
export { BIOLOGY_PREREQUISITE_CHAINS } from "./biologyPrereqData";

export const PREREQUISITE_CHAINS_DATABASE: ConceptDependencyChain[] = [
  ...MATH_PREREQUISITE_CHAINS,
  ...PHYSICS_PREREQUISITE_CHAINS,
  ...CHEMISTRY_PREREQUISITE_CHAINS,
  ...BIOLOGY_PREREQUISITE_CHAINS
];
