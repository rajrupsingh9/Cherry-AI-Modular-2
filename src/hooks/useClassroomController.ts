import { useState, useRef, useEffect, useCallback, useMemo, type Dispatch, type SetStateAction, type FormEvent } from "react";
import { ThemeType } from "../types";
import { useLiveSession } from "./useLiveSession";
import { smartMergeWhiteboardNotes } from "../utils/boardFilter";
import { saveActiveLearningContext } from "../utils/activeLearningStore";
import { triggerCelebrationConfetti } from "../utils/confetti";
import { isBoardContentComplete } from "../utils/blackboardSnapshotEngine";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { safeSavePastSessions } from "../utils/safeStorage";

export interface UseClassroomControllerProps {
  // Session & Student Identity
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  user: any;
  studentDetails: {
    name?: string;
    grade?: string;
    board?: string;
    mediumOfLearning?: string;
    subject?: string;
    [key: string]: any;
  };
  setStudentDetails: Dispatch<SetStateAction<any>>;

  // Blackboard & Topic Content
  customBoardContent: string;
  setCustomBoardContent: Dispatch<SetStateAction<string>>;
  topicBoardsContent: Record<number, string>;
  setTopicBoardsContent: Dispatch<SetStateAction<Record<number, string>>>;
  activeTopicIndex: number;
  setActiveTopicIndex: Dispatch<SetStateAction<number>>;
  topics: string[];
  activeDocument: any;
  setActiveDocument: Dispatch<SetStateAction<any>>;

  // UI Flow & Screen States
  currentScreen: any;
  setCurrentScreen: any;
  showBrandSplash: boolean;
  showIntroWalkthrough: boolean;
  showEnrollmentScreen: boolean;
  setUploadedButWaitingWakeup: (val: boolean) => void;

  // Modals & Extras
  setPostLessonSession: (data: any) => void;
  setShowPostLessonModal: (show: boolean) => void;
  setPastSessions: Dispatch<SetStateAction<any[]>>;

  // Feedback Callbacks
  addToast: (message: string, type: "info" | "success" | "error") => void;
  handleThemeChange: (theme: ThemeType) => void;
  autoCaptureSnapshot: (topicIndex: number, boardContent: string, isManual?: boolean) => Promise<void>;
}

export function useClassroomController({
  sessionId,
  setSessionId,
  user,
  studentDetails,
  setStudentDetails,
  customBoardContent,
  setCustomBoardContent,
  topicBoardsContent,
  setTopicBoardsContent,
  activeTopicIndex,
  setActiveTopicIndex,
  topics,
  activeDocument,
  setActiveDocument,
  currentScreen,
  setCurrentScreen,
  showBrandSplash,
  showIntroWalkthrough,
  showEnrollmentScreen,
  setUploadedButWaitingWakeup,
  setPostLessonSession,
  setShowPostLessonModal,
  setPastSessions,
  addToast,
  handleThemeChange,
  autoCaptureSnapshot,
}: UseClassroomControllerProps) {
  // Dialogue History state
  const [dialogueHistory, setDialogueHistory] = useState<Array<{ id: string; sender: "user" | "cherry"; text: string }>>([]);
  const [typedInput, setTypedInput] = useState("");

  const onNextTopicRef = useRef<() => void>(undefined);
  const onClassCompleteRef = useRef<() => void>(undefined);

  // Hook live session handlers
  const {
    state,
    isPaused,
    pauseTeaching,
    resumeTeaching,
    togglePauseTeaching,
    userVolume,
    cherryVolume,
    userTranscript,
    cherryTranscript,
    connect,
    disconnect,
    injectPromptText,
    speechSpeed,
    setSpeechSpeed,
    teachingPhase,
    micStream,
    playbackStream,
  } = useLiveSession({
    onThemeChange: handleThemeChange,
    onToast: addToast,
    onNextTopic: () => onNextTopicRef.current?.(),
    onClassComplete: () => {
      onClassCompleteRef.current?.();
      triggerCelebrationConfetti();
    },
    onTeachingPhaseChange: (phase) => {
      const phaseLabels: Record<string, string> = {
        intro: "Intro (Prichey) 🎒",
        concept: "Concept (Chalk Notes) 🖊️",
        example: "Deep Dive (Explanations) 🔍",
        doubt: "Doubts Solving (Sawal-Jawab) ❓",
        transition: "Transition Sequence 🚀",
        complete: "Class Graduation 🎉🎓",
      };
      if (phase.toLowerCase() === "complete") {
        triggerCelebrationConfetti();
      }
      addToast(`Cherry Ma'am moved to: ${phaseLabels[phase] || phase}`, "info");

      // Keep Universal Active Learning Context synchronized
      saveActiveLearningContext({
        sourceMode: activeDocument
          ? activeDocument.mimeType === "video/youtube"
            ? "explainer_youtube"
            : "explainer_doc"
          : "live_blackboard",
        title: activeDocument?.filename || `Classroom: ${studentDetails.subject || "Lesson"}`,
        subject: studentDetails.subject,
        grade: studentDetails.grade,
        board: studentDetails.board,
        mediumOfLearning: studentDetails.mediumOfLearning,
        blackboardContent: customBoardContent,
        documentMarkdown: activeDocument?.markdown || "",
        topics: topics,
        sessionId: sessionId || undefined,
      });
    },
    onUpdateWhiteboard: (content, append) => {
      setCustomBoardContent((prev) => {
        const merged = smartMergeWhiteboardNotes(prev, content, append);
        setTopicBoardsContent((tb) => ({
          ...tb,
          [activeTopicIndex]: merged,
        }));

        // Auto-save blackboard context in background
        saveActiveLearningContext({
          sourceMode: activeDocument
            ? activeDocument.mimeType === "video/youtube"
              ? "explainer_youtube"
              : "explainer_doc"
            : "live_blackboard",
          title: activeDocument?.filename || `Classroom: ${studentDetails.subject || "Lesson"}`,
          subject: studentDetails.subject,
          grade: studentDetails.grade,
          board: studentDetails.board,
          mediumOfLearning: studentDetails.mediumOfLearning,
          blackboardContent: merged,
          documentMarkdown: activeDocument?.markdown || "",
          topics: topics,
          sessionId: sessionId || undefined,
        });

        return merged;
      });
    },
    studentName: studentDetails.name,
    grade: studentDetails.grade,
    board: studentDetails.board,
    mediumOfLearning: studentDetails.mediumOfLearning,
    subject: studentDetails.subject,
    activeTopicIndex: activeTopicIndex,
    sessionId: sessionId,
  });

  // Automatic snapshot trigger when teaching phase reaches conclusion/transition of a topic
  useEffect(() => {
    if (customBoardContent && isBoardContentComplete(customBoardContent) && teachingPhase) {
      if (["transition", "graduation", "completed", "quiz"].includes(teachingPhase)) {
        autoCaptureSnapshot(activeTopicIndex, customBoardContent);
      }
    }
  }, [teachingPhase, activeTopicIndex, customBoardContent, autoCaptureSnapshot]);

  // Slide player transitions and Cherry notifications (seamless, in-place, no disconnects!)
  const handleNextTopic = useCallback(() => {
    if (customBoardContent && isBoardContentComplete(customBoardContent)) {
      autoCaptureSnapshot(activeTopicIndex, customBoardContent);
    }
    setActiveTopicIndex((prev) => {
      const nextIndex = prev + 1 < topics.length ? prev + 1 : prev;
      if (nextIndex !== prev) {
        addToast(`Syllabus screen updated to topic: Part ${nextIndex + 1}! 📖`, "info");
        setTopicBoardsContent((tb) => ({ ...tb, [prev]: customBoardContent }));
        setCustomBoardContent(topicBoardsContent[nextIndex] || "");
      }
      return nextIndex;
    });
  }, [topics, addToast, activeTopicIndex, customBoardContent, autoCaptureSnapshot, topicBoardsContent]);

  const handlePrevTopic = useCallback(() => {
    if (customBoardContent && isBoardContentComplete(customBoardContent)) {
      autoCaptureSnapshot(activeTopicIndex, customBoardContent);
    }
    setActiveTopicIndex((prev) => {
      const prevIndex = prev > 0 ? prev - 1 : prev;
      if (prevIndex !== prev) {
        addToast(`Syllabus screen updated to topic: Part ${prevIndex + 1}! 📖`, "info");
        setTopicBoardsContent((tb) => ({ ...tb, [prev]: customBoardContent }));
        setCustomBoardContent(topicBoardsContent[prevIndex] || "");
      }
      return prevIndex;
    });
  }, [addToast, activeTopicIndex, customBoardContent, autoCaptureSnapshot, topicBoardsContent]);

  const handleSyncBoardContent = useCallback((idx: number, content: string) => {
    setTopicBoardsContent((prev) => {
      if (prev[idx] === content) return prev;
      return {
        ...prev,
        [idx]: content,
      };
    });
  }, [setTopicBoardsContent]);

  // Synchronize customBoardContent specifically for Phase 1 ('intro') so the blackboard immediately displays the topic heading when empty
  useEffect(() => {
    if (currentScreen !== "classroom" || showBrandSplash || showIntroWalkthrough || showEnrollmentScreen) return;
    if (activeDocument?.mode === "open_board" || activeDocument?.mode === "discuss_concept" || activeDocument?.mode === "explain_experiment") return;
    const currentPhase = (teachingPhase || "intro").toLowerCase();
    const isIntroPhase = currentPhase === "intro";

    if (isIntroPhase && (!customBoardContent || customBoardContent.trim() === "")) {
      const activeTopicText = (topics && topics.length > activeTopicIndex && topics[activeTopicIndex])
        ? topics[activeTopicIndex]
        : "";
      const topicHeaderLine = activeTopicText.split("\n")[0] || "";
      const rawFallback = activeDocument?.filename
        ? activeDocument.filename.replace(/\.[^/.]+$/, "")
        : (activeDocument?.detectedSubject || studentDetails.subject || "Classroom Lesson");
      const isRawFallbackId = /^\d{8,}$/.test(rawFallback.trim()) || (rawFallback.trim().length > 20 && /^[0-9a-fA-F\-]+$/.test(rawFallback.trim()));
      const safeFallbackTitle = isRawFallbackId ? (activeDocument?.detectedSubject || studentDetails.subject || "Classroom Lesson") : rawFallback;

      const rawHeaderClean = topicHeaderLine
        .replace(/[#*_~`]/g, "")
        .replace(/\.(md|markdown|txt|pdf|docx|jpg|jpeg|png|webp|gif)$/i, "")
        .replace(/^["']|["']$/g, "")
        .replace(/[\_]/g, " ")
        .trim();
      const isRawHeaderId = /^\d{8,}$/.test(rawHeaderClean) || (rawHeaderClean.length > 20 && /^[0-9a-fA-F\-]+$/.test(rawHeaderClean));
      const safeTopicTitle = (!isRawHeaderId && rawHeaderClean) ? rawHeaderClean : `Topic Part ${activeTopicIndex + 1}`;
      const cleanHeader = `# ${safeTopicTitle}`;

      if (activeTopicText.trim() || activeDocument?.filename) {
        const phase1BoardContent = cleanHeader;
        console.log(`[Phase 1 Sync Hook] Initializing Phase 1 blackboard notes for Part ${activeTopicIndex + 1}.`);
        setCustomBoardContent(phase1BoardContent);
      }
    }
  }, [teachingPhase, activeTopicIndex, topics, customBoardContent, studentDetails.subject, activeDocument, currentScreen, showBrandSplash, showIntroWalkthrough, showEnrollmentScreen, setCustomBoardContent]);

  // Synchronize customBoardContent with topics when transitioning to concept/example/doubt phases so the board displays slide contents immediately if empty
  useEffect(() => {
    if (currentScreen !== "classroom" || showBrandSplash || showIntroWalkthrough || showEnrollmentScreen) return;
    if (activeDocument?.mode === "open_board" || activeDocument?.mode === "discuss_concept" || activeDocument?.mode === "explain_experiment") return;
    const currentPhase = (teachingPhase || "intro").toLowerCase();
    const isConceptOrLater = currentPhase === "concept" || currentPhase === "example" || currentPhase === "doubt" || currentPhase === "transition";

    if (isConceptOrLater && topics && topics.length > 0 && activeTopicIndex < topics.length) {
      const activeTopicText = topics[activeTopicIndex] || "";
      if (activeTopicText.trim() !== "") {
        const isHeaderOnly = customBoardContent.trim().startsWith("#") && !customBoardContent.includes("\n") && customBoardContent.length < 90;
        const isPollOnly = customBoardContent.includes("PREDICTION POLL") && !customBoardContent.includes("### 📌");
        const isCurrentlyEmpty = !customBoardContent || customBoardContent.trim() === "" || isHeaderOnly || isPollOnly;

        if (isCurrentlyEmpty) {
          console.log(`[Concept Sync Hook] Displaying Part ${activeTopicIndex + 1} contents on the blackboard.`);
          setCustomBoardContent(activeTopicText);
        }
      }
    }
  }, [teachingPhase, activeTopicIndex, topics, customBoardContent, activeDocument, currentScreen, showBrandSplash, showIntroWalkthrough, showEnrollmentScreen, setCustomBoardContent]);

  useEffect(() => {
    onNextTopicRef.current = handleNextTopic;
  }, [handleNextTopic]);

  // Keyboard shortcut listener: Space or P to Pause/Resume live session
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || "").toLowerCase();
      const isInput = activeTag === "input" || activeTag === "textarea" || (document.activeElement as HTMLElement)?.isContentEditable;
      if (isInput) return;

      if (currentScreen === "classroom" && state !== "disconnected") {
        if (e.code === "Space" || e.key === "p" || e.key === "P") {
          e.preventDefault();
          togglePauseTeaching();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentScreen, state, togglePauseTeaching]);

  // Automatically start teaching continuous document when class connects
  const lastStateRef = useRef<string>("disconnected");
  useEffect(() => {
    if (state === "idle" && lastStateRef.current === "connecting" && activeDocument) {
      const isOpenBoardMode = activeDocument.mode === "open_board";
      const isSocraticMode = activeDocument.mode === "socratic";
      const isMistakeMode = activeDocument.mode === "mistake";
      const isDoubtMode = activeDocument.mode === "doubt";
      const isDiscussConceptMode = activeDocument.mode === "discuss_concept";
      const isExplainExperimentMode = activeDocument.mode === "explain_experiment";
      const isYoutubeMode = activeDocument.mimeType === "video/youtube";

      let prompt = "";
      let toastMessage = "";

      if (isOpenBoardMode) {
        prompt = `[SYSTEM TRIGGER]: Student "${studentDetails.name || "student"}" (Grade: ${studentDetails.grade}, Board: ${studentDetails.board}) has opened the Live 1-on-1 Direct Study Classroom with an Open Blackboard.
1. Immediately call \`updateWhiteboard\` to show the clean Open Blackboard welcome notes:
\`\`\`markdown
# 🎙️ Live 1-on-1 Study with Cherry Ma'am
### 💡 Aapka Personal Doubt & Concept Blackboard
- 🎤 **Direct Voice Mode Active**: Jo bhi topic, formula ya numerical seekhna hai, seedhe mic se boliye!
- ✍️ **Instant Chalkboard Notes**: Cherry Ma'am aapke bolte hi board par step-by-step likhkar samjhayengi.
- 🎯 **Ask Anything**: Any concept, derivation, NCERT question, ya exam doubt!
\`\`\`
2. In your energetic, warm, sassy Hinglish voice, greet the student by name once: "Namaste ${studentDetails.name || "beta"}! Welcome to your personal 1-on-1 classroom! Blackboard bilkul ready hai. Aaj aapko kya seekhna, samajhna, ya solve karna hai? Koi specific concept, formula derivation, numerical problem, ya question? Aap seedhe mic se boliye, main board par step-by-step explain karungi!"
3. STRICT CRITICAL RULE: DO NOT pick, assume, or invent any topic on your own! Do not tell any unrequested curiosity story or ask an Option A vs Option B prediction poll!
4. Stop speaking immediately and LISTEN to what the student asks or says via voice!`;
        toastMessage = "Cherry Ma'am is listening! Ask any topic or question via voice! 🎙️✨";
      } else if (isExplainExperimentMode) {
        prompt = `[SYSTEM TRIGGER: EXPERIMENT WHITEBOARD EXPLANATION WITH CHERRY MA'AM]: Student "${studentDetails.name || "student"}" (Grade: ${studentDetails.grade}, Board: ${studentDetails.board}) has entered the classroom to study the Virtual Lab Experiment: "${activeDocument.filename}".
Here is the complete experiment chalkboard notes, apparatus, procedure, and live simulation parameters:
${activeDocument.markdown}

MANDATORY EXECUTION:
1. Immediately call \`setTeachingState(phase='concept')\` and call \`updateWhiteboard\` to show the complete experiment chalkboard notes with the schematic diagram, LaTeX formulas, apparatus, procedure, and live parameter values.
2. In your energetic, sassy, warm Hinglish voice as Cherry Ma'am, greet the student enthusiastically: "Namaste ${studentDetails.name || "beta"}! Wah, Virtual Lab me '${activeDocument.filename}' experiment kar rahe the? Bahut hi badhiya topic choose kiya! Chalo blackboard par is pure experiment ko step-by-step crystal clear samajhte hain—iska aim, ray/circuit diagram, apparatus setup, aur mathematical formulas!"
3. Explain the experiment aim, walk through the diagram on the board, explain the core formulas in LaTeX, Cartesian sign conventions, connect directly to the live parameters dialed in by the student, and warn about exam traps.
4. Ask a quick viva-voce conceptual check question to the student!`;
        toastMessage = `Cherry Ma'am is starting live whiteboard explanation of "${activeDocument.filename}"! 🎙️🔬`;
      } else if (isDiscussConceptMode) {
        prompt = `[SYSTEM TRIGGER: 1-ON-1 CONCEPT REVISION WITH CHERRY MA'AM]: Student "${studentDetails.name || "student"}" (Grade: ${studentDetails.grade}, Board: ${studentDetails.board}) has asked you to explain the flashcard revision concept: "${activeDocument.filename}".
Here is the concept detail & context:
${activeDocument.markdown}

MANDATORY EXECUTION:
1. Immediately call \`setTeachingState(phase='concept')\` and call \`updateWhiteboard\` to write clear, structured chalkboard notes for "${activeDocument.filename}" with key formulas in LaTeX math (\`$$\`, \`$\`), step-by-step intuition, rules/diagrams, and an illustrative example.
2. In your energetic, sassy, warm Hinglish voice as Cherry Ma'am, greet the student enthusiastically: "Arre ${studentDetails.name || "beta"}! Bahut hi badhiya topic choose kiya revision ke liye! Chalo "${activeDocument.filename}" ko blackboard par step-by-step tod kar crystal clear samajhte hain!"
3. Explain the core intuition, how this concept connects to exams/numerical problems, and provide a quick conceptual check live while writing on the board.`;
        toastMessage = `Cherry Ma'am is starting live blackboard explanation of "${activeDocument.filename}"! 🎙️✨`;
      } else if (isSocraticMode) {
        prompt = `[SYSTEM TRIGGER: SOCRATIC AI TUTOR WORKFLOW ACTIVE]: Student "${studentDetails.name || "student"}" (Grade: ${studentDetails.grade}, Board: ${studentDetails.board}) has entered the classroom for Socratic problem solving on "${activeDocument.filename}".
MANDATORY SOCRATIC PHASE 1 EXECUTION:
1. Immediately call \`setTeachingState(phase='intro')\` and call \`updateWhiteboard\` to write:
   - '# [Problem Title]'
   - '### 📋 Given Values (दिया गया है):' with units
   - '### 🎯 To Find (ज्ञात करना है):'
   - '### 💡 Core Concept (मूल अवधारणा):' in 2-3 simple lines
   - '### ❓ क्या आप इसे हल कर पाए? (हाँ / नहीं)'
2. DO NOT solve the problem or reveal any calculations!
3. In your warm, encouraging, peer-like Hinglish voice as Cherry Ma'am, greet the student by name, deconstruct the question simply (Given values, To Find, and Core Concept), and end with this EXACT call-to-action:
   "अब आप इस प्रश्न को एक बार खुद से हल करने का प्रयास करें। क्या आप इसे हल कर पाए? मुझे **हाँ** या **नहीं** में अपडेट दें।"
4. Stop speaking immediately and WAIT for the student's voice response ("हाँ" / "नहीं")!`;
        toastMessage = "Cherry Ma'am (Socratic AI Tutor) is breaking down the problem! 🎯🧠";
      } else if (isMistakeMode) {
        prompt = `[SYSTEM TRIGGER]: Student "${studentDetails.name || "student"}" (Grade: ${studentDetails.grade}, Board: ${studentDetails.board}) has entered the classroom. 'Find My Mistake' mode is active for document "${activeDocument.filename}".
If you have already greeted the student or started speaking, do NOT repeat your greeting or start-of-class remarks; continue teaching seamlessly.
If you have not yet greeted the student, sassyly greet them once, announce that you have checked their uploaded notes file, and start discussing their student attempt from Part 1 immediately!`;
        toastMessage = "Cherry is starting to diagnose your mistakes step-by-step! 🎙️🔍";
      } else if (isDoubtMode) {
        prompt = `[SYSTEM TRIGGER]: Student "${studentDetails.name || "student"}" (Grade: ${studentDetails.grade}, Board: ${studentDetails.board}) has entered the classroom. 'Doubt Solver' mode is active for document "${activeDocument.filename}".
If you have already greeted the student or started speaking, do NOT repeat your greeting or start-of-class remarks; continue teaching seamlessly.
If you have not yet greeted the student, sassyly greet them once, announce that you have reviewed their uploaded doubt sheet, and start solving and breaking down their first doubt from Part 1 on the blackboard immediately!`;
        toastMessage = "Cherry Ma'am is ready to solve your doubts crystal clear on the blackboard! 🎙️💡";
      } else if (isYoutubeMode) {
        prompt = `[SYSTEM TRIGGER]: Student "${studentDetails.name || "student"}" (Grade: ${studentDetails.grade}, Board: ${studentDetails.board}) has entered the classroom. YouTube Study Engine mode is active for video syllabus "${activeDocument.filename}".
If you have already greeted the student or started speaking, do NOT repeat your greeting or start-of-class remarks; continue teaching seamlessly.
If you have not yet greeted the student, sassyly greet them once, introduce the synchronized YouTube study course, and start teaching Part 1 immediately!`;
        toastMessage = "Cherry is beginning the board-synchronized YouTube lesson! 🎙️🎥";
      } else {
        prompt = `[SYSTEM TRIGGER]: Student "${studentDetails.name || "student"}" (Grade: ${studentDetails.grade}, Board: ${studentDetails.board}) has entered the classroom for "${activeDocument.filename}".
MANDATORY PHASE 1 ('intro') EXECUTION:
1. Immediately at t=0ms, call \`setTeachingState(phase='intro')\` AND call \`updateWhiteboard\` to draw the Hero Visual Schematic SVG, write '# [Topic Title]', and '### ❓ PREDICTION POLL: Option A vs Option B' on the board. (STRICT RULE: Do NOT write 'Real-World Curiosity Hook' or 'REAL-WORLD MYSTERY' text/headers or verbatim document text/definitions on the board in Phase 1!).
2. Warmly and sassyly greet student "${studentDetails.name || "beta"}" in high-energy Hinglish.
3. Tell the intriguing real-world curiosity story hook in spoken voice and ask the prediction poll question ('Option A vs Option B?').
4. Stop speaking immediately and WAIT for the student's voice response!`;
        toastMessage = "Cherry Ma'am is starting Phase 1: Real-World Mystery & Prediction Poll! 🎙️⚡";
      }

      injectPromptText(prompt);
      addToast(toastMessage, "success");
    }
    lastStateRef.current = state;
  }, [state, activeDocument, injectPromptText, addToast, studentDetails]);

  // Sync state to automatically exit uploaded waiting screen when state is active
  useEffect(() => {
    if (state !== "disconnected") {
      setUploadedButWaitingWakeup(false);
    }
  }, [state, setUploadedButWaitingWakeup]);

  // Client-side VAD Silence Detection Effect for Phase 4 (Doubt / Q&A)
  const hasTriggeredSilenceProbeRef = useRef(false);
  useEffect(() => {
    if (teachingPhase !== "doubt" || state !== "listening") {
      hasTriggeredSilenceProbeRef.current = false;
      return;
    }

    if (userVolume > 0.08) {
      hasTriggeredSilenceProbeRef.current = false;
      return;
    }

    if (hasTriggeredSilenceProbeRef.current) return;

    const timer = setTimeout(() => {
      if (
        teachingPhase === "doubt" &&
        state === "listening" &&
        !hasTriggeredSilenceProbeRef.current &&
        userVolume < 0.08
      ) {
        hasTriggeredSilenceProbeRef.current = true;
        console.log("[Client VAD] 7s Silence detected in Doubt phase. Triggering gentle probe prompt.");
        injectPromptText("[SYSTEM_EVENT: STUDENT_SILENT_7_SEC]");
      }
    }, 7000);

    return () => clearTimeout(timer);
  }, [teachingPhase, state, userVolume, injectPromptText]);

  // ASR Live Dialogue Sync Logic
  useEffect(() => {
    if (cherryTranscript.text && cherryTranscript.text.trim() && cherryTranscript.id) {
      setDialogueHistory((prev) => {
        const index = prev.findIndex((item) => item.id === cherryTranscript.id);
        if (index !== -1) {
          const next = [...prev];
          next[index] = { ...next[index], text: cherryTranscript.text };
          return next;
        } else {
          return [
            ...prev,
            { id: cherryTranscript.id!, sender: "cherry", text: cherryTranscript.text },
          ];
        }
      });
    }
  }, [cherryTranscript.text, cherryTranscript.id]);

  // Gracefully end, compile, and archive the active session
  const handleEndAndArchiveSession = useCallback(async (targetSessionId: string | null = sessionId) => {
    if (!targetSessionId) return;

    const currentUser = auth.currentUser || user;
    if (!currentUser) return;

    if (state !== "disconnected") {
      disconnect();
    }

    const sanitizedTopicBoards: Record<string, string> = {};
    if (topicBoardsContent) {
      Object.entries(topicBoardsContent).forEach(([k, v]) => {
        sanitizedTopicBoards[String(k)] = v as string;
      });
    }

    setPastSessions((prevSessions) => {
      const updated = prevSessions.map((sess) => {
        if (sess.sessionId === targetSessionId) {
          return {
            ...sess,
            customBoardContent: customBoardContent,
            topicBoardsContent: sanitizedTopicBoards,
            topics: topics,
            subject: studentDetails.subject || sess.subject,
            updatedAt: new Date().toISOString(),
          };
        }
        return sess;
      });
      safeSavePastSessions(currentUser.uid, updated);
      return updated;
    });

    if (currentUser.uid !== "local_guest_student" && !currentUser.uid.startsWith("local_")) {
      const sessionRef = doc(db, "classSessions", targetSessionId);
      try {
        await updateDoc(sessionRef, {
          customBoardContent: customBoardContent,
          topicBoardsContent: sanitizedTopicBoards,
          topics: topics,
          updatedAt: serverTimestamp(),
        });
      } catch (dbErr) {
        console.warn("Immediate cloud blackboard sync failed on archiving:", dbErr);
      }
    }

    if (customBoardContent && customBoardContent.trim().length > 15) {
      setPostLessonSession({
        topic: (topics && topics[activeTopicIndex]) || studentDetails.subject || "Classroom Lecture",
        subject: studentDetails.subject || "Science",
        grade: studentDetails.grade || "Class 10-12",
        customBoardContent: customBoardContent,
        sessionId: targetSessionId,
      });
      setShowPostLessonModal(true);
    }

    setSessionId(null);
    setDialogueHistory([]);
    setCustomBoardContent("");
    setTopicBoardsContent({});

    addToast("Lesson notes automatically compiled and saved to 'Archived Classroom Lecture Books'! 📁🎓", "success");
    setCurrentScreen("syllabus");
  }, [sessionId, user, state, disconnect, customBoardContent, topicBoardsContent, topics, studentDetails, setPastSessions, setPostLessonSession, setShowPostLessonModal, setSessionId, setCustomBoardContent, setTopicBoardsContent, addToast, setCurrentScreen]);

  // Disconnect & Auto-Archive session if student navigates away from the Classroom screen
  useEffect(() => {
    if (currentScreen !== "classroom" && sessionId) {
      handleEndAndArchiveSession(sessionId);
    } else if (currentScreen !== "classroom" && state !== "disconnected") {
      disconnect();
    }
  }, [currentScreen, sessionId, state, disconnect, handleEndAndArchiveSession]);

  const handlePowerToggle = () => {
    if (state === "disconnected") {
      setUploadedButWaitingWakeup(false);
      if (!sessionId) {
        const fallbackSessionId = "session_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        setSessionId(fallbackSessionId);
      }
      connect();
    } else {
      if (sessionId) {
        handleEndAndArchiveSession(sessionId);
      } else {
        disconnect();
        addToast("Cherry Ma'am is heading to the staff room. Talk later! 📚☕", "info");
      }
    }
  };

  const handleClassComplete = useCallback(() => {
    triggerCelebrationConfetti();
    if (sessionId) {
      handleEndAndArchiveSession(sessionId);
    } else {
      disconnect();
    }
    addToast("Congratulations! Class is complete. Cherry is heading to the staff room! 🎓🎉☕", "success");
  }, [sessionId, handleEndAndArchiveSession, disconnect, addToast]);

  useEffect(() => {
    onClassCompleteRef.current = handleClassComplete;
  }, [handleClassComplete]);

  // Subtitle / status text
  const getSubTitleText = () => {
    switch (state) {
      case "disconnected":
        return "Class is at recess. Wake up Cherry Ma'am to start studying! 🤓🎒";
      case "connecting":
        return "Cherry Ma'am is preparing today's sassy lesson slides... Brief moment... ☕📝";
      case "idle":
        return "Ask anything—Maths, Physics formulas, or poetic classics! 📐✨";
      case "listening":
        return "Tell me your query... I'm listening like an incredibly smart friend! 🧠👂";
      case "speaking":
        return "Listen closely, I'm delivering some effortless intellect! 🎙️🌟";
      case "error":
        return "Oops student, class network dropped. Let's hit reconnect... 💔🔌";
      default:
        return "Connected and ready to learn.";
    }
  };

  const handleSendPromptText = (e: FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;

    const safeMsgId = "student_typed_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

    setDialogueHistory((prev) => [
      ...prev,
      {
        id: safeMsgId,
        sender: "user",
        text: typedInput,
      },
    ]);

    injectPromptText(typedInput);
    addToast(`Prompt sent to Cherry Ma'am!`, "success");
    setTypedInput("");
  };

  const studentAskedForWritingOrDrawing = useMemo(() => {
    const keywords = [
      "write", "draw", "sketch", "diagram", "plot", "graph", "formula", "equation", "solve",
      "calculate", "show me", "explain on board", "table", "chart", "figure", "visualize", "illustrate", "derive",
      "likh", "likho", "likhiye", "bana", "banao", "banaye", "draw karo", "solve karo", "dikhao", "dikhaye", "diagram banao", "graph banao", "figure banao", "board pe",
    ];

    if (userTranscript?.text) {
      const lower = userTranscript.text.toLowerCase();
      if (keywords.some((kw) => lower.includes(kw))) {
        return true;
      }
    }

    const userMessages = dialogueHistory.filter((item) => item.sender === "user");
    if (userMessages.length > 0) {
      const lastMsg = userMessages[userMessages.length - 1].text.toLowerCase();
      if (keywords.some((kw) => lastMsg.includes(kw))) {
        return true;
      }
    }

    return false;
  }, [dialogueHistory, userTranscript?.text]);

  const latestSpeechText = cherryTranscript.text || (dialogueHistory.filter((item) => item.sender === "cherry").slice(-1)[0]?.text || "");

  const handleSelectPrompt = (promptText: string) => {
    const isLive = state !== "disconnected" && state !== "connecting" && state !== "error";
    if (isLive) {
      injectPromptText(promptText);
      addToast(`Sending query: "${promptText}"`, "info");
    } else {
      addToast(`To ask Cherry Ma'am, read aloud: "${promptText}" or connect the live session first!`, "info");
    }
  };

  return {
    // Live Session State & Audio Streams
    state,
    isPaused,
    pauseTeaching,
    resumeTeaching,
    togglePauseTeaching,
    userVolume,
    cherryVolume,
    userTranscript,
    cherryTranscript,
    connect,
    disconnect,
    injectPromptText,
    speechSpeed,
    setSpeechSpeed,
    teachingPhase,
    micStream,
    playbackStream,

    // Dialogue & Typing
    dialogueHistory,
    setDialogueHistory,
    typedInput,
    setTypedInput,
    handleSendPromptText,
    latestSpeechText,
    studentAskedForWritingOrDrawing,

    // Navigation & Board Controls
    handleNextTopic,
    handlePrevTopic,
    handleSyncBoardContent,
    handlePowerToggle,
    handleClassComplete,
    handleEndAndArchiveSession,
    handleSelectPrompt,
    getSubTitleText,
  };
}
