/**
 * PrerequisiteGapFinder.tsx
 * Thin Core Orchestrator for Multi-Year Cognitive Prerequisite Gap Finder (< 100 LOC).
 * Coordinates usePrerequisiteDiagnosis hook with decoupled visual components.
 */
import React from "react";
import {
  PrerequisiteGapFinderProps,
  PrerequisiteNode,
  ConceptDependencyChain
} from "./prerequisites/prerequisiteTypes";
import { usePrerequisiteDiagnosis } from "./prerequisites/usePrerequisiteDiagnosis";
import { PrerequisiteHeroHeader } from "./prerequisites/PrerequisiteHeroHeader";
import { PrerequisiteChainSelector } from "./prerequisites/PrerequisiteChainSelector";
import { PrerequisiteDagPipeline } from "./prerequisites/PrerequisiteDagPipeline";
import { PrerequisiteNodeModal } from "./prerequisites/PrerequisiteNodeModal";
import { PrerequisiteRationaleCard } from "./prerequisites/PrerequisiteRationaleCard";

export type { PrerequisiteGapFinderProps, PrerequisiteNode, ConceptDependencyChain };

export const PrerequisiteGapFinder: React.FC<PrerequisiteGapFinderProps> = ({
  studentName = "Student",
  studentGrade = 12,
  pastSessions = [],
  quizAttempts = [],
  snapshots = [],
  mediumOfLearning,
  isEnglish,
  onDiscussWithCherry,
  onEnterClassroom
}) => {
  const isEng = isEnglish ?? (mediumOfLearning === "English");

  const {
    selectedSubject,
    setSelectedSubject,
    searchQuery,
    setSearchQuery,
    selectedChainId,
    setSelectedChainId,
    activeDiagnosticModalNode,
    setActiveDiagnosticModalNode,
    filteredChains,
    activeChain,
    totalBrokenLinks,
    totalShakyBridges,
    totalSolidRoots
  } = usePrerequisiteDiagnosis({ pastSessions, quizAttempts, snapshots });

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Hero Header with Metrics */}
      <PrerequisiteHeroHeader
        isEng={isEng}
        totalBrokenLinks={totalBrokenLinks}
        totalShakyBridges={totalShakyBridges}
        totalSolidRoots={totalSolidRoots}
      />

      {/* Subject Filter & Chain Selection Carousel */}
      <PrerequisiteChainSelector
        isEng={isEng}
        selectedSubject={selectedSubject}
        onSelectSubject={setSelectedSubject}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filteredChains={filteredChains}
        selectedChainId={selectedChainId}
        onSelectChainId={setSelectedChainId}
      />

      {/* Visual DAG Upstream Dependency Pipeline */}
      {activeChain && (
        <PrerequisiteDagPipeline
          activeChain={activeChain}
          isEng={isEng}
          onSelectNode={setActiveDiagnosticModalNode}
          onDiscussWithCherry={onDiscussWithCherry}
          onEnterClassroom={onEnterClassroom}
        />
      )}

      {/* Deep Diagnostic Modal */}
      <PrerequisiteNodeModal
        node={activeDiagnosticModalNode}
        onClose={() => setActiveDiagnosticModalNode(null)}
        isEng={isEng}
        onDiscussWithCherry={onDiscussWithCherry}
        onEnterClassroom={onEnterClassroom}
      />

      {/* Pedagogical Why-It-Works Callout */}
      <PrerequisiteRationaleCard isEng={isEng} />
    </div>
  );
};
