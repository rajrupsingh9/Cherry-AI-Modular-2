/**
 * useQuizSetupTopics.ts
 * Manages topic extraction from chalkboard, subject selection & topic multi-select state
 */
import { useState, useEffect, useMemo } from "react";
import { cleanTopicHeader } from "../../utils/boardFilter";
import { ExtractedTopicItem, SUBJECT_DEFAULT_TOPICS } from "./quizTypes";

interface UseQuizSetupTopicsProps {
  subject?: string;
  topics?: string[];
  activeTopicIndex?: number;
  customBoardContent?: string;
  topicBoardsContent?: Record<number, string>;
  onToast: (text: string, type: "success" | "info" | "error") => void;
}

export function useQuizSetupTopics({
  subject = "Mathematics",
  topics = [],
  activeTopicIndex = 0,
  customBoardContent = "",
  topicBoardsContent = {},
  onToast
}: UseQuizSetupTopicsProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>(subject || "Mathematics");

  useEffect(() => {
    if (subject && subject !== selectedSubject) {
      setSelectedSubject(subject);
    }
  }, [subject]);

  const extractedTopics: ExtractedTopicItem[] = useMemo(() => {
    const isClassroomSubject = Boolean(
      subject &&
      selectedSubject &&
      (subject.trim().toLowerCase() === selectedSubject.trim().toLowerCase() ||
       (subject.trim().toLowerCase().includes("math") && selectedSubject.toLowerCase().includes("math")) ||
       (subject.trim().toLowerCase().includes("phys") && selectedSubject.toLowerCase().includes("phys")) ||
       (subject.trim().toLowerCase().includes("chem") && selectedSubject.toLowerCase().includes("chem")) ||
       (subject.trim().toLowerCase().includes("bio") && selectedSubject.toLowerCase().includes("bio")) ||
       (subject.trim().toLowerCase().includes("sci") && selectedSubject.toLowerCase().includes("sci")))
    );

    if (isClassroomSubject && topics && topics.length > 0) {
      return topics.map((t, idx) => {
        const clean = cleanTopicHeader(t, undefined, idx);
        const boardNotes = (idx === activeTopicIndex ? customBoardContent : topicBoardsContent[idx]) || topicBoardsContent[idx] || "";
        const hasNotes = Boolean(boardNotes && boardNotes.trim().length > 0);
        const formulaMatches = boardNotes.match(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^\$]+\$|[a-zA-Z]\s*=\s*[^,\n;]+)/g) || [];
        const uniqueFormulas = Array.from(new Set(formulaMatches.map(f => f.replace(/\$/g, "").trim()))).slice(0, 3);

        return {
          index: idx,
          rawTitle: t,
          title: clean || `Part ${idx + 1}: Topic`,
          hasBoardNotes: hasNotes,
          boardSnippet: boardNotes.trim(),
          formulas: uniqueFormulas,
          isCurrent: idx === activeTopicIndex
        };
      });
    }

    const normalizedKey = Object.keys(SUBJECT_DEFAULT_TOPICS).find(
      k => k.toLowerCase() === selectedSubject.toLowerCase()
    ) || "General";
    const fallbackList = SUBJECT_DEFAULT_TOPICS[normalizedKey] || SUBJECT_DEFAULT_TOPICS.General || [];
    return fallbackList.map((t, idx) => ({
      index: idx,
      rawTitle: t,
      title: t,
      hasBoardNotes: false,
      boardSnippet: "",
      formulas: [],
      isCurrent: false
    }));
  }, [topics, activeTopicIndex, customBoardContent, topicBoardsContent, selectedSubject, subject]);

  const [selectedTopicIndices, setSelectedTopicIndices] = useState<number[]>(() => {
    return extractedTopics.map(t => t.index);
  });

  useEffect(() => {
    setSelectedTopicIndices(extractedTopics.map(t => t.index));
  }, [selectedSubject, extractedTopics.length]);

  const handleToggleTopic = (idx: number) => {
    if (selectedTopicIndices.includes(idx) && selectedTopicIndices.length === 1) {
      onToast("At least 1 topic must remain selected for Quiz generation! 🎯", "info");
      return;
    }
    setSelectedTopicIndices(prev => {
      if (prev.includes(idx)) {
        return prev.filter(i => i !== idx);
      } else {
        return [...prev, idx].sort((a, b) => a - b);
      }
    });
  };

  const handleSelectAllTopics = () => {
    setSelectedTopicIndices(extractedTopics.map(t => t.index));
  };

  const handleSelectActiveTopicOnly = () => {
    const activeItem = extractedTopics.find(t => t.index === activeTopicIndex) || extractedTopics[0];
    if (activeItem) {
      setSelectedTopicIndices([activeItem.index]);
    }
  };

  const handleSelectDiscussedOnly = () => {
    const discussed = extractedTopics.filter(t => t.hasBoardNotes).map(t => t.index);
    if (discussed.length > 0) {
      setSelectedTopicIndices(discussed);
    } else {
      setSelectedTopicIndices(extractedTopics.map(t => t.index));
      onToast("No written board notes found yet, selecting all syllabus topics! 📝", "info");
    }
  };

  const selectedTopicTitles = useMemo(() => {
    return extractedTopics
      .filter(t => selectedTopicIndices.includes(t.index))
      .map(t => t.title);
  }, [extractedTopics, selectedTopicIndices]);

  const compiledDiscussedNotes = useMemo(() => {
    const notesMap: Record<number, string> = {};
    const formulasList: string[] = [];

    extractedTopics
      .filter(t => selectedTopicIndices.includes(t.index))
      .forEach(t => {
        if (t.boardSnippet) notesMap[t.index] = t.boardSnippet;
        if (t.formulas.length > 0) formulasList.push(...t.formulas);
      });

    return {
      notesMap,
      formulas: Array.from(new Set(formulasList)),
      totalDiscussedTopics: Object.keys(notesMap).length
    };
  }, [extractedTopics, selectedTopicIndices]);

  return {
    selectedSubject,
    setSelectedSubject,
    extractedTopics,
    selectedTopicIndices,
    setSelectedTopicIndices,
    handleToggleTopic,
    handleSelectAllTopics,
    handleSelectActiveTopicOnly,
    handleSelectDiscussedOnly,
    selectedTopicTitles,
    compiledDiscussedNotes
  };
}
