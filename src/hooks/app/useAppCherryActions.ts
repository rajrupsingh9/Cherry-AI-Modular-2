/**
 * useAppCherryActions.ts
 * Manages action triggers for Cherry Ma'am: podcast recap, concept revision, virtual lab chalkboard, and auto-init intro.
 */
import React, { useRef, useEffect, useCallback, useState } from "react";
import { generateAudioPodcast } from "../../services/podcastService";
import { saveActiveLearningContext } from "../../utils/activeLearningStore";
import {
  buildExperimentChalkboardContent,
  buildCherryExperimentSpokenPrompt,
} from "../../components/virtual-lab/experimentWhiteboardBuilder";
import { AudioPodcastData } from "../../types";
import { buildAutoLessonPromptAndToast } from "../../utils/cherryAutoPrompts";

interface UseAppCherryActionsParams {
  state: string;
  sessionId: string | null;
  setSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  studentDetails: any;
  activeDocument: any;
  setActiveDocument: React.Dispatch<React.SetStateAction<any>>;
  customBoardContent: string;
  setCustomBoardContent: React.Dispatch<React.SetStateAction<string>>;
  topics: string[];
  activeTopicIndex: number;
  setActiveWorkspaceTab: React.Dispatch<React.SetStateAction<"board" | "document">>;
  setIsFullScreenBoard: React.Dispatch<React.SetStateAction<boolean>>;
  setShowStudentAccountHub: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentScreen: React.Dispatch<React.SetStateAction<any>>;
  setActiveAudioPodcast: React.Dispatch<React.SetStateAction<AudioPodcastData | null>>;
  setIsAudioPodcastModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  injectPromptText: (prompt: string) => void;
  connect: () => void;
  addToast: (message: string, type: "info" | "success" | "error") => void;
}

export function useAppCherryActions({
  state,
  sessionId,
  setSessionId,
  studentDetails,
  activeDocument,
  setActiveDocument,
  customBoardContent,
  setCustomBoardContent,
  topics,
  activeTopicIndex,
  setActiveWorkspaceTab,
  setIsFullScreenBoard,
  setShowStudentAccountHub,
  setCurrentScreen,
  setActiveAudioPodcast,
  setIsAudioPodcastModalOpen,
  injectPromptText,
  connect,
  addToast,
}: UseAppCherryActionsParams) {
  const [isGeneratingLiveRecap, setIsGeneratingLiveRecap] = useState(false);

  // 1. One-click live audio podcast recap for active classroom blackboard session
  const handleTriggerLivePodcastSummary = useCallback(async () => {
    if (isGeneratingLiveRecap) return;
    setIsGeneratingLiveRecap(true);
    addToast("🎙️ Preparing 2-Minute Dual-Voice Audio Recap of this lesson...", "info");
    try {
      const currentTopic = (topics && topics[activeTopicIndex]) || studentDetails.subject || "Classroom Lecture";
      const podcastData = await generateAudioPodcast({
        topic: currentTopic,
        subject: studentDetails.subject || "Science",
        grade: studentDetails.grade || "Class 10-12",
        language: (studentDetails.mediumOfLearning as any) || "Hinglish",
        notesOrDocumentText: customBoardContent || "",
        episodeType: "quick_revision",
        targetDurationMins: 8,
      });
      setActiveAudioPodcast(podcastData);
      setIsAudioPodcastModalOpen(true);
      addToast("🎉 Quick Audio Recap ready! Enjoy listening.", "success");
    } catch (err: any) {
      console.error("[handleTriggerLivePodcastSummary] Error:", err);
      addToast("Could not generate audio recap. Please try again!", "error");
    } finally {
      setIsGeneratingLiveRecap(false);
    }
  }, [
    isGeneratingLiveRecap,
    topics,
    activeTopicIndex,
    studentDetails,
    customBoardContent,
    addToast,
    setActiveAudioPodcast,
    setIsAudioPodcastModalOpen,
  ]);

  // 2. Instant "Discuss with Cherry Ma'am" Action Trigger from Revision Hub Flashcards
  const handleDiscussConceptWithCherry = useCallback(
    (topicDetails: {
      topic: string;
      question?: string;
      answer?: string;
      hint?: string;
      conceptTested?: string;
      subject?: string;
    }) => {
      const topicName = topicDetails.topic || topicDetails.conceptTested || "Revision Concept";
      const questionText = topicDetails.question ? `\n\n### ❓ Flashcard Question:\n${topicDetails.question}` : "";
      const answerText = topicDetails.answer ? `\n\n### 💡 Key Concept / Answer Breakdown:\n${topicDetails.answer}` : "";
      const hintText = topicDetails.hint ? `\n\n### 🧠 Conceptual Clue:\n${topicDetails.hint}` : "";
      const markdownContent = `# 🍒 Live Concept Revision: ${topicName}${questionText}${answerText}${hintText}`;

      setActiveDocument({
        filename: topicName,
        mimeType: "text/markdown",
        markdown: markdownContent,
        mode: "discuss_concept",
      });

      saveActiveLearningContext({
        sourceMode: "doubt_solver",
        title: topicName,
        subject: topicDetails.subject || studentDetails.subject,
        grade: studentDetails.grade,
        board: studentDetails.board,
        mediumOfLearning: studentDetails.mediumOfLearning,
        documentMarkdown: markdownContent,
        blackboardContent: markdownContent,
        topics: [topicName],
      });

      setCustomBoardContent(
        `# 🍒 1-on-1 Concept Revision: ${topicName}\n\n### 🎯 Concept in Focus:\n${
          topicDetails.conceptTested || topicName
        }\n\n${topicDetails.question ? `**Question / Problem:**\n${topicDetails.question}\n\n` : ""}${
          topicDetails.answer ? `**Core Derivation / Explanation:**\n${topicDetails.answer}\n\n` : ""
        }---\n*Cherry Ma'am is connecting to explain this step-by-step on the blackboard...*`
      );

      setShowStudentAccountHub(false);
      setCurrentScreen("classroom");

      if (state === "idle" || state === "listening" || state === "speaking") {
        const prompt = `[SYSTEM TRIGGER: 1-ON-1 CONCEPT REVISION WITH CHERRY MA'AM]: Student "${
          studentDetails.name || "student"
        }" (Grade: ${studentDetails.grade}, Board: ${
          studentDetails.board
        }) has asked you to explain the flashcard revision concept: "${topicName}".\nHere is the concept detail & context:${markdownContent}\nMANDATORY EXECUTION:\n1. Immediately call \`setTeachingState(phase='concept')\` and call \`updateWhiteboard\` to write clear, structured chalkboard notes for "${topicName}" with key formulas in LaTeX math (\`$$\`, \`$\`), step-by-step intuition, rules/diagrams, and an illustrative example.\n2. In your energetic, sassy, warm Hinglish voice as Cherry Ma'am, greet the student enthusiastically: "Arre ${
          studentDetails.name || "beta"
        }! Bahut hi badhiya topic choose kiya revision ke liye! Chalo "${topicName}" ko blackboard par step-by-step tod kar crystal clear samajhte hain!"\n3. Explain the core intuition, how this concept connects to exams/numerical problems, and provide a quick conceptual check live while writing on the board.`;
        injectPromptText(prompt);
        addToast(`Cherry Ma'am is explaining "${topicName}" on the blackboard! 🎙️✨`, "success");
      } else {
        addToast(`Opening classroom to discuss "${topicName}" with Cherry Ma'am! 🎙️✨`, "info");
      }
    },
    [
      state,
      studentDetails,
      injectPromptText,
      addToast,
      setActiveDocument,
      setCustomBoardContent,
      setShowStudentAccountHub,
      setCurrentScreen,
    ]
  );

  // 3. Instant "Ask Cherry Ma'am to Explain on Whiteboard" Action Trigger from STEM Virtual Lab Studio
  const handleExplainExperimentOnWhiteboard = useCallback(
    (topicTitle: string, experimentDetails?: any) => {
      const expPayload = experimentDetails || { title: topicTitle };
      const currentParams = expPayload.currentParams || {};
      const observations = expPayload.observations || [];

      const chalkboardMarkdown = buildExperimentChalkboardContent(expPayload, currentParams, observations);

      setActiveDocument({
        filename: expPayload.title || topicTitle,
        mimeType: "text/markdown",
        markdown: chalkboardMarkdown,
        mode: "explain_experiment",
      });

      saveActiveLearningContext({
        sourceMode: "virtual_lab",
        title: expPayload.title || topicTitle,
        subject: expPayload.subject || studentDetails.subject,
        grade: studentDetails.grade,
        board: studentDetails.board,
        mediumOfLearning: studentDetails.mediumOfLearning,
        documentMarkdown: chalkboardMarkdown,
        blackboardContent: chalkboardMarkdown,
        topics: [expPayload.title || topicTitle],
      });

      setCustomBoardContent(chalkboardMarkdown);
      setShowStudentAccountHub(false);
      setCurrentScreen("classroom");

      const prompt = buildCherryExperimentSpokenPrompt(
        expPayload,
        currentParams,
        observations,
        studentDetails.name || "student",
        studentDetails.grade,
        studentDetails.board
      );

      if (state === "idle" || state === "listening" || state === "speaking") {
        injectPromptText(prompt);
        addToast(`Cherry Ma'am is explaining "${expPayload.title || topicTitle}" on the whiteboard! 🎙️🔬`, "success");
      } else {
        addToast(`Whiteboard ready! Connecting with Cherry Ma'am for "${expPayload.title || topicTitle}"... 🎙️🔬`, "info");
        if (state === "disconnected") {
          if (!sessionId) {
            const fallbackSessionId = "session_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
            setSessionId(fallbackSessionId);
          }
          connect();
        }
      }
    },
    [
      state,
      sessionId,
      studentDetails,
      connect,
      injectPromptText,
      addToast,
      setActiveDocument,
      setCustomBoardContent,
      setShowStudentAccountHub,
      setCurrentScreen,
      setSessionId,
    ]
  );

  // 4. Automatically start teaching the continuous document when class connects
  const lastStateRef = useRef<string>("disconnected");
  useEffect(() => {
    if (state === "idle" && lastStateRef.current === "connecting" && activeDocument) {
      const { prompt, toastMessage } = buildAutoLessonPromptAndToast(activeDocument, studentDetails);
      injectPromptText(prompt);
      addToast(toastMessage, "success");
    }
    lastStateRef.current = state;
  }, [state, activeDocument, injectPromptText, addToast, studentDetails]);

  // 5. Syllabus workspace tab trigger
  const handleOpenSyllabus = useCallback(() => {
    setActiveWorkspaceTab("document");
    setIsFullScreenBoard(false);
    addToast("Opening Syllabus Doc view...", "info");
    setTimeout(() => {
      document.getElementById("file-syllabus-upload")?.click();
    }, 200);
  }, [setActiveWorkspaceTab, setIsFullScreenBoard, addToast]);

  return {
    isGeneratingLiveRecap,
    handleTriggerLivePodcastSummary,
    handleDiscussConceptWithCherry,
    handleExplainExperimentOnWhiteboard,
    handleOpenSyllabus,
  };
}
