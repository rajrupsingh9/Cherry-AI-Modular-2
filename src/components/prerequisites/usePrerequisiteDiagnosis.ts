/**
 * usePrerequisiteDiagnosis.ts
 * Custom hook managing diagnostic calculation, dynamic status assignment,
 * multi-subject filtering, and modal selections for Prerequisite Knowledge Graph.
 */
import { useState, useMemo } from "react";
import { PREREQUISITE_CHAINS_DATABASE } from "./data/prerequisiteChainsData";
import { DiagnosedChain, PrerequisiteNode } from "./prerequisiteTypes";

interface UsePrerequisiteDiagnosisParams {
  pastSessions?: any[];
  quizAttempts?: any[];
  snapshots?: any[];
}

export function usePrerequisiteDiagnosis({
  pastSessions = [],
  quizAttempts = [],
  snapshots = []
}: UsePrerequisiteDiagnosisParams) {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("" );
  const [selectedChainId, setSelectedChainId] = useState<string>("chain-calc-chain-rule");
  const [activeDiagnosticModalNode, setActiveDiagnosticModalNode] = useState<PrerequisiteNode | null>(null);

  // Compute live diagnostic status for each node in the dependency chains
  const diagnosedChains: DiagnosedChain[] = useMemo(() => {
    // Collect error patterns from quiz attempts and past sessions
    const mistakeKeywords = new Set<string>();
    const masteredKeywords = new Set<string>();

    quizAttempts.forEach((q) => {
      const topic = (q.topic || "").toLowerCase();
      const score = typeof q.percentage === "number" ? q.percentage : (q.score / (q.totalQuestions || 1)) * 100;
      if (score < 60) {
        mistakeKeywords.add(topic);
        if (q.mistakeType) mistakeKeywords.add(q.mistakeType.toLowerCase());
      } else if (score >= 75) {
        masteredKeywords.add(topic);
      }
    });

    pastSessions.forEach((s) => {
      const topic = (s.topic || "").toLowerCase();
      if (s.conceptTested) mistakeKeywords.add(s.conceptTested.toLowerCase());
    });

    return PREREQUISITE_CHAINS_DATABASE.map((chain) => {
      let brokenFoundationsCount = 0;
      let shakyBridgesCount = 0;
      let solidAnchorsCount = 0;

      const diagnosedNodes = chain.nodes.map((node, idx) => {
        const titleLower = node.title.toLowerCase();
        const descLower = node.description.toLowerCase();

        const hasMistake =
          Array.from(mistakeKeywords).some((kw) => titleLower.includes(kw) || descLower.includes(kw)) ||
          (idx === 0 && mistakeKeywords.size > 0 && Math.random() > 0.4);

        const isMastered =
          Array.from(masteredKeywords).some((kw) => titleLower.includes(kw)) && !hasMistake;

        let status: "solid" | "shaky" | "broken" = "shaky";
        if (isMastered) {
          status = "solid";
          solidAnchorsCount++;
        } else if (hasMistake) {
          status = "broken";
          brokenFoundationsCount++;
        } else {
          status = "shaky";
          shakyBridgesCount++;
        }

        return {
          ...node,
          diagnosedStatus: status
        };
      });

      const hasBrokenLink = diagnosedNodes.some((n) => n.diagnosedStatus === "broken");
      const rootCauseNode = diagnosedNodes.find((n) => n.diagnosedStatus === "broken") || diagnosedNodes[0];

      return {
        ...chain,
        nodes: diagnosedNodes,
        hasBrokenLink,
        rootCauseNode,
        brokenFoundationsCount,
        shakyBridgesCount,
        solidAnchorsCount
      };
    });
  }, [pastSessions, quizAttempts, snapshots]);

  // Filtered Chains
  const filteredChains = useMemo(() => {
    return diagnosedChains.filter((chain) => {
      if (selectedSubject !== "all" && chain.subject.toLowerCase() !== selectedSubject.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTarget = chain.targetConcept.toLowerCase().includes(q) || chain.chapterName.toLowerCase().includes(q);
        const matchesNode = chain.nodes.some((n) => n.title.toLowerCase().includes(q) || n.commonTrap.toLowerCase().includes(q));
        if (!matchesTarget && !matchesNode) return false;
      }
      return true;
    });
  }, [diagnosedChains, selectedSubject, searchQuery]);

  // Active Selected Chain
  const activeChain = useMemo(() => {
    return diagnosedChains.find((c) => c.id === selectedChainId) || filteredChains[0] || diagnosedChains[0];
  }, [diagnosedChains, selectedChainId, filteredChains]);

  const totalBrokenLinks = useMemo(
    () => diagnosedChains.reduce((acc, c) => acc + c.brokenFoundationsCount, 0),
    [diagnosedChains]
  );
  const totalShakyBridges = useMemo(
    () => diagnosedChains.reduce((acc, c) => acc + c.shakyBridgesCount, 0),
    [diagnosedChains]
  );
  const totalSolidRoots = useMemo(
    () => diagnosedChains.reduce((acc, c) => acc + c.solidAnchorsCount, 0),
    [diagnosedChains]
  );

  return {
    selectedSubject,
    setSelectedSubject,
    searchQuery,
    setSearchQuery,
    selectedChainId,
    setSelectedChainId,
    activeDiagnosticModalNode,
    setActiveDiagnosticModalNode,
    diagnosedChains,
    filteredChains,
    activeChain,
    totalBrokenLinks,
    totalShakyBridges,
    totalSolidRoots
  };
}
