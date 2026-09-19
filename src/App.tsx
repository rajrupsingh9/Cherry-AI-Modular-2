import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Mic, MicOff, Power, Sparkles, ExternalLink, RefreshCw, Volume2, Info, Palette, HelpCircle, Flame, Trash2, Terminal, BookOpen, Upload, FileText, User, ArrowLeft, CheckCircle, ChevronRight, LogOut, Download, Library, Youtube, Video, Maximize2, Minimize2, Home, Gauge, Pause, Play, FlaskConical, Headphones, ShieldCheck, Smartphone, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLiveSession } from "./hooks/useLiveSession";
import { useClassroomController } from "./hooks/useClassroomController";
import { useSessionSnapshots } from "./hooks/useSessionSnapshots";
import { useStudentAuth } from "./hooks/useStudentAuth";
import { useDocumentSync } from "./hooks/useDocumentSync";
import { parseSyllabusTopics } from "./utils/topicParser";
import { compressImageIfPossible } from "./utils/imageCompressor";
import { THEME_CONFIGS, ThemeType, AudioPodcastData } from "./types";
import { MathRenderer } from "./components/MathRenderer";
import { PostLessonSessionData } from "./components/PostLessonAudioModal";
import { AppModalsContainer } from "./components/modals/AppModalsContainer";
import { ClassroomScreen } from "./components/screens/ClassroomScreen";
import { AppBottomNav } from "./components/layout/AppBottomNav";
import { AppViewRouter } from "./components/layout/AppViewRouter";
import { generateAudioPodcast } from "./services/podcastService";
import AmbientFocusAudio from "./components/AmbientFocusAudio";
import { buildExperimentChalkboardContent, buildCherryExperimentSpokenPrompt } from "./components/virtual-lab/experimentWhiteboardBuilder";
import katex from "katex";
import { getTranslations } from "./utils/i18n";
import { triggerCelebrationConfetti } from "./utils/confetti";
import { smartMergeWhiteboardNotes } from "./utils/boardFilter";
import { safeSavePastSessions, safeSetItem } from "./utils/safeStorage";
import { saveActiveLearningContext } from "./utils/activeLearningStore";
import { loadSubscriptionState, SubscriptionState, syncSubscriptionSettingsFromCloud, matchProvisionedStudent, isStudentSubscribed, clearUserSubscriptionState, getInitialSubscriptionState } from "./utils/subscriptionStore";
import { getActiveApiKey } from "./utils/geminiKeyStorage";
import { isAdminEmail, getUserRole } from "./utils/adminConfig";

// Firebase and Firestore integration
import { 
  db, 
  auth, 
  OperationType, 
  handleFirestoreError 
} from "./lib/firebase";
import { 
  User as FirebaseUser
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  serverTimestamp
} from "firebase/firestore";

interface Toast {
  id: string;
  message: string;
  type: "info" | "success" | "error";
}

/**
 * Extract YouTube Video ID from standard, mobile, shorts, or embed URLs
 */
export function extractYoutubeId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Direct 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex matching watch, shorts, live, embed, v, youtu.be, mobile URLs, query params
  const match = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }

  return null;
}

export default function App() {
  const [theme, setTheme] = useState<ThemeType>(() => {
    try {
      const saved = localStorage.getItem("preferred_classroom_theme");
      if (saved && saved in THEME_CONFIGS) {
        return saved as ThemeType;
      }
    } catch (_) {}
    return "cherry";
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Trigger floating notifications
  const addToast = useCallback((message: string, type: "info" | "success" | "error") => {
    const id = Math.random().toString(36).substring(3);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);
  const [showTips, setShowTips] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"board" | "document">("board");
  const [isFullScreenBoard, setIsFullScreenBoard] = useState(false);
  
  // Custom screen state routing: home state -> syllabus configuration -> immersive classroom whiteboard -> interactive quiz -> virtual lab -> student profile -> admin dashboard
  const [currentScreen, setCurrentScreen] = useState<"home" | "syllabus" | "classroom" | "quiz" | "lab" | "profile" | "admin">("home");
  const [showBrandSplash, setShowBrandSplash] = useState(true);
  const [showIntroWalkthrough, setShowIntroWalkthrough] = useState(false);
  const [showEnrollmentScreen, setShowEnrollmentScreen] = useState(false);
  const [showPostLoginMicModal, setShowPostLoginMicModal] = useState(false);

  // Subscription & Pro Access state
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>(loadSubscriptionState());
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Hook 1: Student Auth & Profile Management
  const {
    user,
    setUser,
    authLoading,
    isAdmin,
    setIsAdmin,
    adminViewMode,
    setAdminViewMode,
    studentDetails,
    setStudentDetails,
    pastSessions,
    setPastSessions,
    sessionsLoading,
    loadPastSessions,
    showStudentAccountHub,
    setShowStudentAccountHub,
    showOnboarding,
    setShowOnboarding,
    showLoginModal,
    setShowLoginModal,
    isLearnerProfileModalOpen,
    setIsLearnerProfileModalOpen,
    handleOnboardingSubmit,
    handleGoogleSignIn,
    handleSignOut,
    handleRefreshProfile,
    handleGuestSubmit,
    handleMobileLoginSuccess,
    handleDeletePastSession,
  } = useStudentAuth({
    addToast,
    setCurrentScreen,
    setShowBrandSplash,
    setShowIntroWalkthrough,
    setShowEnrollmentScreen,
    showEnrollmentScreen,
    subscriptionState,
    setSubscriptionState,
    onClearSessionState: () => {
      setSessionId(null);
      setDialogueHistory([]);
      setSessionSnapshots([]);
    },
  });

  const t = useMemo(() => getTranslations(studentDetails.mediumOfLearning), [studentDetails.mediumOfLearning]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Hook 2: Document Sync & Upload Management
  const {
    activeDocument,
    setActiveDocument,
    uploadMode,
    setUploadMode,
    isUploading,
    setIsUploading,
    uploadedButWaitingWakeup,
    setUploadedButWaitingWakeup,
    activeTopicIndex,
    setActiveTopicIndex,
    customBoardContent,
    setCustomBoardContent,
    topicBoardsContent,
    setTopicBoardsContent,
    handleFileUpload,
    handleClearDocument,
  } = useDocumentSync({
    user,
    studentDetails,
    setStudentDetails,
    sessionId,
    setSessionId,
    disconnect: () => disconnect(),
    setDialogueHistory: (history: any[]) => setDialogueHistory(history),
    setCurrentScreen,
    loadPastSessions,
    setPastSessions,
    addToast,
    setUser,
  });

  // YouTube Course Explanation states
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isYoutubeLoading, setIsYoutubeLoading] = useState(false);
  const [isYtPlayerExpanded, setIsYtPlayerExpanded] = useState(true);
  const [showMobileYtPlayer, setShowMobileYtPlayer] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"mic" | "topics" | "doubt" | "quiz">("quiz");
  const [isQuizFullScreenOpen, setIsQuizFullScreenOpen] = useState(false);
  const [showPwaInstallModal, setShowPwaInstallModal] = useState(false);

  // 2-Host Dual-Voice Multilingual Audio Podcast modal state (Phase 3 & 4)
  const [activeAudioPodcast, setActiveAudioPodcast] = useState<AudioPodcastData | null>(null);
  const [isAudioPodcastModalOpen, setIsAudioPodcastModalOpen] = useState(false);
  const [postLessonSession, setPostLessonSession] = useState<PostLessonSessionData | null>(null);
  const [showPostLessonModal, setShowPostLessonModal] = useState(false);
  const [isGeneratingLiveRecap, setIsGeneratingLiveRecap] = useState(false);

  // One-click live audio podcast recap for active classroom blackboard session
  const handleTriggerLivePodcastSummary = async () => {
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
  };

  // Global listener to open dual-voice audio podcast from any screen
  useEffect(() => {
    const handleOpenPodcastEvent = (e: any) => {
      if (e.detail) {
        setActiveAudioPodcast(e.detail);
        setIsAudioPodcastModalOpen(true);
      }
    };
    window.addEventListener("cherry_open_audio_podcast", handleOpenPodcastEvent);
    return () => {
      window.removeEventListener("cherry_open_audio_podcast", handleOpenPodcastEvent);
    };
  }, []);

  // Real-time synchronization for Student Subscription & Pro Access (Admin ↔ Student)
  useEffect(() => {
    // Initial sync of subscription settings and dynamic plans from cloud
    syncSubscriptionSettingsFromCloud().catch(() => {});

    const handleSubscriptionUpdated = (e: any) => {
      const newState: SubscriptionState = e?.detail || loadSubscriptionState();
      setSubscriptionState(newState);
      if (newState.isPro) {
        addToast("🎉 Pro Access Verified! Premium Socratic features are now active.", "success");
      }
    };
    window.addEventListener("cherry_subscription_updated", handleSubscriptionUpdated);
    return () => {
      window.removeEventListener("cherry_subscription_updated", handleSubscriptionUpdated);
    };
  }, []);

  // Automatically trigger the PWA "Install App" popup on landing if not in standalone mode
  useEffect(() => {
    try {
      const isStandalone = 
        window.matchMedia("(display-mode: standalone)").matches || 
        (window.navigator as any).standalone === true;

      // Check if user previously dismissed in this session
      const dismissedThisSession = sessionStorage.getItem("pwa_install_dismissed_session");

      if (!isStandalone && !dismissedThisSession) {
        const timer = setTimeout(() => {
          setShowPwaInstallModal(true);
        }, 1200); // 1.2s gentle delay after page load for smooth entry
        return () => clearTimeout(timer);
      }
    } catch (_) {
      // Fallback
    }
  }, []);

  // Phase 4: Capture referral invite code (?ref=CODE) from incoming share links
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.location.search) {
        const urlParams = new URLSearchParams(window.location.search);
        const refParam = urlParams.get("ref");
        if (refParam && refParam.trim()) {
          const cleanRef = refParam.trim().toUpperCase();
          localStorage.setItem("cherry_pending_ref_code", cleanRef);
        }
      }
    } catch (_) {}
  }, []);

  // Post-Login Microphone Permission Handlers (Deferred strictly until student is authenticated)
  const handleAllowPostLoginMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop tracks immediately so browser mic indicator doesn't linger until class connects
      stream.getTracks().forEach((track) => track.stop());
      sessionStorage.setItem("cherry_mic_prompt_handled", "true");
      setShowPostLoginMicModal(false);
      addToast("Microphone enabled! Aap Cherry Ma'am se bolkar doubts pooch sakte hain 🎙️✨", "success");
    } catch (err: any) {
      console.warn("[PostLoginMic] Permission request denied or dismissed:", err);
      sessionStorage.setItem("cherry_mic_prompt_handled", "true");
      setShowPostLoginMicModal(false);
      addToast("Speaker-Only Mode active. Aap text se bhi doubts pooch sakte hain 🔊💬", "info");
    }
  };

  const handleDismissPostLoginMic = () => {
    sessionStorage.setItem("cherry_mic_prompt_handled", "true");
    setShowPostLoginMicModal(false);
  };

  // Trigger microphone setup modal only after student is logged in and past splash/intro/enrollment
  useEffect(() => {
    if (
      user &&
      !isAdmin &&
      !showBrandSplash &&
      !showIntroWalkthrough &&
      !showEnrollmentScreen &&
      sessionStorage.getItem("cherry_mic_prompt_handled") !== "true"
    ) {
      const timer = setTimeout(() => {
        setShowPostLoginMicModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, isAdmin, showBrandSplash, showIntroWalkthrough, showEnrollmentScreen]);

  // Parse markdown content into distinct sequential slides or topics with metadata stripping
  const topics = useMemo(() => {
    return parseSyllabusTopics(activeDocument?.markdown);
  }, [activeDocument?.markdown]);

  // Whiteboard snapshots management and automatic capture
  const {
    sessionSnapshots,
    setSessionSnapshots,
    autoCaptureSnapshot,
    handleManualSaveSnapshot,
  } = useSessionSnapshots({
    auth,
    user,
    studentDetails,
    theme,
    topics,
    activeTopicIndex,
    customBoardContent,
    sessionId,
    currentScreen,
    showBrandSplash,
    showIntroWalkthrough,
    showEnrollmentScreen,
    addToast,
  });

  // Global event listener for Pro subscription plans navigation
  useEffect(() => {
    const handleOpenPlans = () => {
      setShowEnrollmentScreen(true);
      setShowStudentAccountHub(false);
    };

    window.addEventListener("cherry_open_subscription_plans", handleOpenPlans);
    return () => {
      window.removeEventListener("cherry_open_subscription_plans", handleOpenPlans);
    };
  }, []);

  // Subtitle history and autoscroll ASR components
  const [dialogueHistory, setDialogueHistory] = useState<Array<{ id: string; sender: "user" | "cherry"; text: string }>>([]);
  const [typedInput, setTypedInput] = useState("");
  const subtitlesScrollRef = useRef<HTMLDivElement | null>(null);
  const portraitTranscriptScrollRef = useRef<HTMLDivElement | null>(null);

  // Listen for Gemini API Key automatic failovers and 60s cooldown recoveries
  useEffect(() => {
    const handleKeyRotated = (e: any) => {
      const detail = e?.detail;
      if (detail && detail.success && detail.nextKeyLabel) {
        if (detail.isPreemptive) {
          addToast(
            `⚡ Predictive Handover: Soft-switched to ${detail.nextKeyLabel} to prevent quota interruption! 🛡️`,
            "info"
          );
        } else {
          addToast(
            `⚡ Rate limit hit. Auto-switched to ${detail.nextKeyLabel}! 🔑`,
            "info"
          );
        }
      } else if (detail && !detail.success) {
        addToast(
          "All configured Gemini API keys reached quota limit. Please add another backup key or wait for 60s cooldown.",
          "error"
        );
      }
    };

    const handleKeyRecovered = (e: any) => {
      const detail = e?.detail;
      if (detail && Array.isArray(detail.recoveredLabels) && detail.recoveredLabels.length > 0) {
        addToast(
          `🟢 60s Cooldown Complete: ${detail.recoveredLabels.join(", ")} is back on Standby! ✨`,
          "success"
        );
      }
    };

    window.addEventListener("gemini-key-rotated", handleKeyRotated);
    window.addEventListener("gemini-key-recovered", handleKeyRecovered);
    return () => {
      window.removeEventListener("gemini-key-rotated", handleKeyRotated);
      window.removeEventListener("gemini-key-recovered", handleKeyRecovered);
    };
  }, [addToast]);

  // Persist Dialogue History messages to Firestore subcollection
  const syncedMessagesRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const currentUser = auth.currentUser || user;
    if (!sessionId || !currentUser) return;
    
    // Only attempt Firestore sync for real users
    if (currentUser.uid === "local_guest_student" || currentUser.uid.startsWith("local_")) return;
    
    dialogueHistory.forEach((msg) => {
      const cacheKey = `${msg.id}_${msg.text}`;
      if (!syncedMessagesRef.current.has(cacheKey)) {
        syncedMessagesRef.current.add(cacheKey);
        
        const msgRef = doc(db, "classSessions", sessionId, "dialogueMessages", msg.id);
        setDoc(msgRef, {
          messageId: msg.id,
          sessionId: sessionId,
          sender: msg.sender,
          text: msg.text,
          timestamp: serverTimestamp()
        }).catch((err) => {
          console.warn("Dialogue message sync failure:", err);
        });
      }
    });
  }, [dialogueHistory, sessionId, user]);

  // Whiteboard drawings debounced save to cloud and local cache (highly resilient for both guest and normal users)
  useEffect(() => {
    const currentUser = auth.currentUser || user;
    if (!sessionId || !currentUser) return;
    
    const timeout = setTimeout(async () => {
      // 1. Convert numeric keys in topicBoardsContent to strings for safe Firestore/JSON storage
      const sanitizedTopicBoards: Record<string, string> = {};
      if (topicBoardsContent) {
        Object.entries(topicBoardsContent).forEach(([k, v]) => {
          sanitizedTopicBoards[String(k)] = v as string;
        });
      }

      // 2. Real-time update the current session in the pastSessions state and localStorage cache
      setPastSessions((prevSessions) => {
        const updated = prevSessions.map((sess) => {
          if (sess.sessionId === sessionId) {
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

      // 3. For authenticated cloud users, also persist to Firestore
      if (currentUser.uid !== "local_guest_student" && !currentUser.uid.startsWith("local_")) {
        const sessionRef = doc(db, "classSessions", sessionId);
        try {
          await updateDoc(sessionRef, {
            customBoardContent: customBoardContent,
            topicBoardsContent: sanitizedTopicBoards,
            topics: topics,
            updatedAt: serverTimestamp()
          });
        } catch (dbErr) {
          console.warn("Cloud blackboard sync failed:", dbErr);
        }
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [customBoardContent, topicBoardsContent, topics, studentDetails.subject, sessionId, user]);

  const handleLoadPastSession = async (sess: any) => {
    try {
      setSessionId(sess.sessionId);
      
      setStudentDetails((prev) => ({
        ...prev,
        grade: sess.grade || prev.grade,
        subject: sess.subject || prev.subject
      }));
      setCustomBoardContent(sess.customBoardContent || "");
      
      // Restore topic-wise blackboard contents if present
      if (sess.topicBoardsContent) {
        const restoredBoards: Record<number, string> = {};
        Object.entries(sess.topicBoardsContent).forEach(([k, v]) => {
          restoredBoards[Number(k)] = v as string;
        });
        setTopicBoardsContent(restoredBoards);
      } else {
        setTopicBoardsContent({});
      }
      
      const messagesRef = collection(db, "classSessions", sess.sessionId, "dialogueMessages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));
      const querySnap = await getDocs(q);
      const dialogueLogs = querySnap.docs.map(docSnap => {
        const item = docSnap.data();
        return {
          id: item.messageId,
          sender: item.sender as "user" | "cherry",
          text: item.text
        };
      });
      setDialogueHistory(dialogueLogs);
      
      if (sess.activeDocumentName) {
        addToast(`Loading syllabus file: "${sess.activeDocumentName}" from cloud session...`, "info");
        fetch("/api/active-document")
          .then((res) => {
            if (!res.ok) throw new Error("Network error");
            return res.text();
          })
          .then((text) => {
            if (text.trim().startsWith("{")) {
              return JSON.parse(text);
            }
            throw new Error("Invalid json format");
          })
          .then((data) => {
            if (data && data.activeDocument && data.activeDocument.filename === sess.activeDocumentName) {
              setActiveDocument(data.activeDocument);
            } else {
              setActiveDocument({
                 filename: sess.activeDocumentName,
                 mimeType: "text/markdown",
                 markdown: `# ${sess.subject} Study Session\nWelcome back to your saved classroom board! Here you can resume explaining equations or diagnostics with Cherry Ma'am.\n`
              });
            }
          })
          .catch(() => {
             setActiveDocument({
                filename: sess.activeDocumentName,
                mimeType: "text/markdown",
                markdown: `# ${sess.subject} Study Session\nWelcome back to your saved classroom board! Here you can resume explaining equations or diagnostics with Cherry Ma'am.\n`
             });
          });
      } else {
        setActiveDocument(null);
      }
      
      setCurrentScreen("classroom");
      addToast(`Restored cloud session successfully! ☁️🖊️`, "success");
    } catch (error: any) {
      addToast(`Could not restore cloud session: ${error.message}`, "error");
    }
  };

  const handleThemeChange = useCallback((newTheme: ThemeType) => {
    const sanitized = (newTheme || "").toString().toLowerCase() as ThemeType;
    let appliedTheme: ThemeType = "cherry";
    if (THEME_CONFIGS[sanitized]) {
      appliedTheme = sanitized;
    }
    setTheme(appliedTheme);
    try {
      localStorage.setItem("preferred_classroom_theme", appliedTheme);
    } catch (_) {}
    const themeNames: Record<ThemeType, string> = {
      cherry: "Teal Forest Cherry 🍒",
      matrix: "Digital Matrix Code 📟",
      cyber: "Neon Cyberpunk ⚡",
      sunset: "Twilight Sunset 🌅",
      slate: "Modern Graphite Slate 📓",
      ivory: "Premium Ice White 🥼"
    };
    addToast(`Blackboard theme changed to: ${themeNames[appliedTheme]}`, "success");
  }, [addToast]);

  // Orchestrate live classroom session, VAD, topic navigation, and blackboard synchronization via modular hook
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
    handleNextTopic,
    handlePrevTopic,
    handleSyncBoardContent,
    handleEndAndArchiveSession,
    handlePowerToggle,
    handleClassComplete,
    getSubTitleText,
    studentAskedForWritingOrDrawing,
    latestSpeechText,
    handleSelectPrompt,
    handleSendPromptText,
  } = useClassroomController({
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
  });

  const activeColors = THEME_CONFIGS[theme] || THEME_CONFIGS.cherry;

  // Keyboard shortcut listener: Space or P to Pause/Resume live session
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting keystrokes when the student is typing into input/textarea
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

  // Instant "Discuss with Cherry Ma'am" Action Trigger from Revision Hub Flashcards
  const handleDiscussConceptWithCherry = useCallback((topicDetails: {
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

    // Set active document in discuss_concept mode
    setActiveDocument({
      filename: topicName,
      mimeType: "text/markdown",
      markdown: markdownContent,
      mode: "discuss_concept"
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
      topics: [topicName]
    });

    // Prepare custom chalkboard notes immediately
    setCustomBoardContent(`# 🍒 1-on-1 Concept Revision: ${topicName}\n\n### 🎯 Concept in Focus:\n${topicDetails.conceptTested || topicName}\n\n${topicDetails.question ? `**Question / Problem:**\n${topicDetails.question}\n\n` : ""}${topicDetails.answer ? `**Core Derivation / Explanation:**\n${topicDetails.answer}\n\n` : ""}---\n*Cherry Ma'am is connecting to explain this step-by-step on the blackboard...*`);

    // Switch to classroom and close hubs
    setShowStudentAccountHub(false);
    setCurrentScreen("classroom");

    // If live session is already active, trigger prompt immediately
    if (state === "idle" || state === "listening" || state === "speaking") {
      const prompt = `[SYSTEM TRIGGER: 1-ON-1 CONCEPT REVISION WITH CHERRY MA'AM]: Student "${studentDetails.name || "student"}" (Grade: ${studentDetails.grade}, Board: ${studentDetails.board}) has asked you to explain the flashcard revision concept: "${topicName}".
Here is the concept detail & context:
${markdownContent}

MANDATORY EXECUTION:
1. Immediately call \`setTeachingState(phase='concept')\` and call \`updateWhiteboard\` to write clear, structured chalkboard notes for "${topicName}" with key formulas in LaTeX math (\`$$\`, \`$\`), step-by-step intuition, rules/diagrams, and an illustrative example.
2. In your energetic, sassy, warm Hinglish voice as Cherry Ma'am, greet the student enthusiastically: "Arre ${studentDetails.name || "beta"}! Bahut hi badhiya topic choose kiya revision ke liye! Chalo "${topicName}" ko blackboard par step-by-step tod kar crystal clear samajhte hain!"
3. Explain the core intuition, how this concept connects to exams/numerical problems, and provide a quick conceptual check live while writing on the board.`;
      injectPromptText(prompt);
      addToast(`Cherry Ma'am is explaining "${topicName}" on the blackboard! 🎙️✨`, "success");
    } else {
      addToast(`Opening classroom to discuss "${topicName}" with Cherry Ma'am! 🎙️✨`, "info");
    }
  }, [state, studentDetails, injectPromptText, addToast, setActiveDocument, setCustomBoardContent, setShowStudentAccountHub, setCurrentScreen]);

  // Instant "Ask Cherry Ma'am to Explain on Whiteboard" Action Trigger from STEM Virtual Lab Studio
  const handleExplainExperimentOnWhiteboard = useCallback((topicTitle: string, experimentDetails?: any) => {
    const expPayload = experimentDetails || { title: topicTitle };
    const currentParams = expPayload.currentParams || {};
    const observations = expPayload.observations || [];

    // Generate comprehensive chalkboard notes with authentic SVG schematic diagram
    const chalkboardMarkdown = buildExperimentChalkboardContent(expPayload, currentParams, observations);

    // Set active document in explain_experiment mode
    setActiveDocument({
      filename: expPayload.title || topicTitle,
      mimeType: "text/markdown",
      markdown: chalkboardMarkdown,
      mode: "explain_experiment"
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
      topics: [expPayload.title || topicTitle]
    });

    // Populate the chalkboard immediately with diagram, formulas, apparatus, procedure, and live parameters!
    setCustomBoardContent(chalkboardMarkdown);

    // Switch to classroom screen immediately
    setShowStudentAccountHub(false);
    setCurrentScreen("classroom");

    // Build Cherry Ma'am's spoken prompt with complete context
    const prompt = buildCherryExperimentSpokenPrompt(
      expPayload,
      currentParams,
      observations,
      studentDetails.name || "student",
      studentDetails.grade,
      studentDetails.board
    );

    // If live audio session is active, inject prompt immediately and notify
    if (state === "idle" || state === "listening" || state === "speaking") {
      injectPromptText(prompt);
      addToast(`Cherry Ma'am is explaining "${expPayload.title || topicTitle}" on the whiteboard! 🎙️🔬`, "success");
    } else {
      addToast(`Whiteboard ready! Connecting with Cherry Ma'am for "${expPayload.title || topicTitle}"... 🎙️🔬`, "info");
      // If disconnected, automatically initiate live connection so Cherry speaks
      if (state === "disconnected") {
        if (!sessionId) {
          const fallbackSessionId = "session_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
          setSessionId(fallbackSessionId);
        }
        connect();
      }
    }
  }, [state, sessionId, studentDetails, connect, injectPromptText, addToast, setActiveDocument, setCustomBoardContent, setShowStudentAccountHub, setCurrentScreen]);

  // Automatically start teaching the continuous document when class connects
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
      
      // Fire trigger prompt immediately upon connection without delay
      injectPromptText(prompt);
      addToast(toastMessage, "success");
    }
    lastStateRef.current = state;
  }, [state, activeDocument, injectPromptText, addToast]);

  // Sync state to automatically exit the uploaded waiting screen as soon as state is active
  useEffect(() => {
    if (state !== "disconnected") {
      setUploadedButWaitingWakeup(false);
    }
  }, [state]);

  // (Classroom VAD silence detection, ASR synchronization, archiving, power toggle, and sub-title helpers are now managed by useClassroomController)


  const handleOpenSyllabus = () => {
    setActiveWorkspaceTab("document");
    setIsFullScreenBoard(false);
    addToast("Opening Syllabus Doc view...", "info");
    // Soft delay to wait for React tab transitions
    setTimeout(() => {
      document.getElementById("file-syllabus-upload")?.click();
    }, 200);
  };

  // (Dialogue, prompt selection, and speech helpers are now managed by useClassroomController)


  return (
    <div
      className="min-h-screen bg-[#071312] text-[#0a3641] flex flex-col items-center justify-center font-sans relative select-none p-0 md:p-6 transition-all duration-1000 overflow-hidden"
    >
      {/* Background decoration for the desktop study room / desk view */}
      <div className="absolute inset-0 bg-[radial-gradient(#152d29_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none opacity-40 z-0" />
      
      {/* Dynamic Floating Desktop Backlights */}
      <div className="hidden md:block absolute top-10 left-10 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.08] pointer-events-none z-0"
        style={{ background: `radial-gradient(circle, ${activeColors.primary} 0%, transparent 85%)` }} />
      <div className="hidden md:block absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.08] pointer-events-none z-0"
        style={{ background: `radial-gradient(circle, ${activeColors.accent} 0%, transparent 85%)` }} />

      {/* Modern High-Fidelity Mobile Device Frame Mockup */}
      <div 
        id="studyverse-mobile-frame"
        className="relative w-full h-[100dvh] md:h-[860px] md:w-[410px] md:max-w-md bg-[#04110e] md:rounded-[44px] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_0_12px_#1c2825,0_0_0_13px_#121b19,0_0_30px_5px_rgba(196,245,0,0.12)] flex flex-col overflow-hidden z-10 border border-teal-500/10 transition-all duration-500"
      >
        {/* The App Main Viewport wrapper */}
        <div className="flex-1 flex flex-col relative overflow-hidden min-h-0 bg-[#f4f7f5] text-[#0a3641]">
          {/* Admin Student-Preview Quick Return Sticky Banner */}
          {isAdmin && adminViewMode === "student" && currentScreen !== "admin" && (
            <div className="w-full bg-[#796AEF] text-white px-3 py-1.5 flex items-center justify-between text-xs z-30 shrink-0 shadow-xs select-none">
              <div className="flex items-center gap-1.5 truncate pr-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[10.5px] font-bold tracking-tight truncate">
                  Admin Preview: Student Mode
                </span>
              </div>
              <button
                onClick={() => {
                  setAdminViewMode("admin");
                  setCurrentScreen("admin");
                }}
                className="px-2.5 py-1 bg-white text-[#796AEF] font-bold rounded-lg hover:bg-indigo-50 active:scale-95 transition-all text-[10px] flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Return to Admin</span>
              </button>
            </div>
          )}

          {/* Inner ambient gradients of the active study theme */}
          <div className={`absolute inset-0 bg-gradient-to-b ${activeColors.bgGradient} transition-all duration-1000 z-0`} />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40 mix-blend-overlay z-0" />
          <div className="absolute top-1/4 left-1/4 w-[120%] h-[50%] rounded-full blur-[80px] opacity-[0.06] pointer-events-none transition-all duration-1000 z-0"
            style={{ background: `radial-gradient(circle, ${activeColors.primary} 0%, transparent 80%)` }} />

          {/* Scrolling active viewport box */}
          <div className="flex-1 flex flex-col min-h-0 relative z-10 overflow-y-auto overflow-x-hidden scroll-smooth">
            {/* =========================================
                MODULAR APP VIEW ROUTER (Phase 3: View Switcher Extraction)
                ========================================= */}
            <AppViewRouter
              currentScreen={currentScreen}
              setCurrentScreen={setCurrentScreen}
              showStudentAccountHub={showStudentAccountHub}
              setShowStudentAccountHub={setShowStudentAccountHub}
              showBrandSplash={showBrandSplash}
              setShowBrandSplash={setShowBrandSplash}
              showIntroWalkthrough={showIntroWalkthrough}
              setShowIntroWalkthrough={setShowIntroWalkthrough}
              showEnrollmentScreen={showEnrollmentScreen}
              setShowEnrollmentScreen={setShowEnrollmentScreen}
              studentDetails={studentDetails}
              setStudentDetails={setStudentDetails}
              user={user}
              setUser={setUser}
              subscriptionState={subscriptionState}
              setSubscriptionState={setSubscriptionState}
              addToast={addToast}
              setIsAdmin={setIsAdmin}
              setAdminViewMode={setAdminViewMode}
              setShowOnboarding={setShowOnboarding}
              setShowLoginModal={setShowLoginModal}
              setShowPwaInstallModal={setShowPwaInstallModal}
              handleSignOut={handleSignOut}
              db={db}
              auth={auth}
              triggerCelebrationConfetti={triggerCelebrationConfetti}
              activeDocument={activeDocument}
              setActiveDocument={setActiveDocument}
              uploadMode={uploadMode}
              setUploadMode={setUploadMode}
              youtubeUrl={youtubeUrl}
              setYoutubeUrl={setYoutubeUrl}
              isYoutubeLoading={isYoutubeLoading}
              setIsYoutubeLoading={setIsYoutubeLoading}
              isUploading={isUploading}
              handleFileUpload={handleFileUpload}
              setSessionId={setSessionId}
              setDialogueHistory={setDialogueHistory}
              setCustomBoardContent={setCustomBoardContent}
              setTopicBoardsContent={setTopicBoardsContent}
              pastSessions={pastSessions}
              setPastSessions={setPastSessions}
              loadPastSessions={loadPastSessions}
              disconnect={disconnect}
              setUploadedButWaitingWakeup={setUploadedButWaitingWakeup}
              setActiveTopicIndex={setActiveTopicIndex}
              extractYoutubeId={extractYoutubeId}
              handleLoadPastSession={handleLoadPastSession}
              onOpenAudioPodcast={(podcast: AudioPodcastData) => {
                setActiveAudioPodcast(podcast);
                setIsAudioPodcastModalOpen(true);
              }}
              classroomSlot={
                <ClassroomScreen
                  isFullScreenBoard={isFullScreenBoard}
                  setIsFullScreenBoard={setIsFullScreenBoard}
                  currentScreen={currentScreen}
                  studentSubject={studentDetails.subject}
                  studentGrade={studentDetails.grade}
                  studentMedium={studentDetails.mediumOfLearning}
                  state={state}
                  handlePowerToggle={handlePowerToggle}
                  isPaused={isPaused}
                  togglePauseTeaching={togglePauseTeaching}
                  t={t}
                  theme={theme}
                  handleThemeChange={handleThemeChange}
                  THEME_CONFIGS={THEME_CONFIGS}
                  speechSpeed={speechSpeed}
                  setSpeechSpeed={setSpeechSpeed}
                  activeColors={activeColors}
                  activeDocument={activeDocument}
                  showMobileYtPlayer={showMobileYtPlayer}
                  setShowMobileYtPlayer={setShowMobileYtPlayer}
                  addToast={addToast}
                  uploadedButWaitingWakeup={uploadedButWaitingWakeup}
                  latestSpeechText={latestSpeechText}
                  setDialogueHistory={setDialogueHistory}
                  setCustomBoardContent={setCustomBoardContent}
                  setTopicBoardsContent={setTopicBoardsContent}
                  handleSelectPrompt={handleSelectPrompt}
                  studentAskedForWritingOrDrawing={studentAskedForWritingOrDrawing}
                  cherryVolume={cherryVolume}
                  handleOpenSyllabus={handleOpenSyllabus}
                  teachingPhase={teachingPhase}
                  customBoardContent={customBoardContent}
                  handleManualSaveSnapshot={handleManualSaveSnapshot}
                  topics={topics}
                  activeTopicIndex={activeTopicIndex}
                  topicBoardsContent={topicBoardsContent}
                  handleSyncBoardContent={handleSyncBoardContent}
                  pauseTeaching={pauseTeaching}
                  resumeTeaching={resumeTeaching}
                  showCaptions={showCaptions}
                  dialogueHistory={dialogueHistory}
                  injectPromptText={injectPromptText}
                />
              }
              state={state}
              injectPromptText={injectPromptText}
              topics={topics}
              activeTopicIndex={activeTopicIndex}
              customBoardContent={customBoardContent}
              topicBoardsContent={topicBoardsContent}
              sessionId={sessionId}
              handleExplainExperimentOnWhiteboard={handleExplainExperimentOnWhiteboard}
              sessionSnapshots={sessionSnapshots}
              handleDiscussConceptWithCherry={handleDiscussConceptWithCherry}
            />

          </div> {/* Closing scrolling active viewport box */}

          {/* =========================================
              5-TAB MOBILE NATIVE BOTTOM TAB BAR
              1st: Desk, 2nd: Class, 3rd: Quiz, 4th: Virtual Lab, 5th: Profile
              (Hidden on Home Splash Screen for 100% immersive full-screen native mobile experience)
              ========================================= */}
          <AppBottomNav
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            showStudentAccountHub={showStudentAccountHub}
            setShowStudentAccountHub={setShowStudentAccountHub}
            isQuizFullScreenOpen={isQuizFullScreenOpen}
            setIsQuizFullScreenOpen={setIsQuizFullScreenOpen}
            isFullScreenBoard={isFullScreenBoard}
            user={user}
            studentName={studentDetails.name}
            setShowLoginModal={setShowLoginModal}
            setShowOnboarding={setShowOnboarding}
            addToast={addToast}
            t={t}
          />

        </div> {/* Closing The App Main Viewport wrapper */}
      </div> {/* Closing Modern High-Fidelity Mobile Device Frame Mockup */}

      {/* APPLICATION MODALS CONTAINER (Phase 3: Unified Modals & Overlays Architecture) */}
      <AppModalsContainer
        isLearnerProfileModalOpen={isLearnerProfileModalOpen}
        onCloseLearnerProfileModal={() => {
          setIsLearnerProfileModalOpen(false);
          setSubscriptionState(loadSubscriptionState());
        }}
        showSubscriptionModal={showSubscriptionModal}
        onCloseSubscriptionModal={() => {
          setShowSubscriptionModal(false);
          setSubscriptionState(loadSubscriptionState());
        }}
        studentName={studentDetails.name || (user?.displayName || "Student")}
        showPwaInstallModal={showPwaInstallModal}
        onClosePwaInstallModal={() => {
          setShowPwaInstallModal(false);
          try {
            sessionStorage.setItem("pwa_install_dismissed_session", "true");
          } catch (_) {}
        }}
        onPwaInstalledSuccess={() => {
          addToast("🎉 Cherry AI Web App installed successfully to your Home Screen!", "success");
        }}
        isAudioPodcastModalOpen={isAudioPodcastModalOpen}
        onCloseAudioPodcastModal={() => setIsAudioPodcastModalOpen(false)}
        activeAudioPodcast={activeAudioPodcast}
        showPostLessonModal={showPostLessonModal}
        onClosePostLessonModal={() => setShowPostLessonModal(false)}
        postLessonSession={postLessonSession}
        mediumOfLearning={studentDetails.mediumOfLearning}
        onGoToRevisionHub={() => {
          setCurrentScreen("syllabus");
          setShowStudentAccountHub(true);
        }}
        showPostLoginMicModal={showPostLoginMicModal && !showBrandSplash && !showIntroWalkthrough && !showEnrollmentScreen && !isAdmin}
        onAllowPostLoginMic={handleAllowPostLoginMic}
        onDismissPostLoginMic={handleDismissPostLoginMic}
        addToast={addToast}
        onSignOut={handleSignOut}

        // Quick Quiz Full Screen Modal
        isQuizFullScreenOpen={isQuizFullScreenOpen}
        onCloseQuizFullScreen={() => setIsQuizFullScreenOpen(false)}
        studentSubject={studentDetails.subject}
        studentGrade={studentDetails.grade}
        state={state}
        onInjectPrompt={injectPromptText}
        topics={topics}
        activeTopicIndex={activeTopicIndex}
        customBoardContent={customBoardContent}
        topicBoardsContent={topicBoardsContent}
        sessionId={sessionId}

        // Help & Tips Drawer
        showTips={showTips}
        onCloseTips={() => setShowTips(false)}

        // Student Account Hub
        showStudentAccountHub={showStudentAccountHub}
        onCloseStudentAccountHub={() => setShowStudentAccountHub(false)}
        studentBoard={studentDetails.board}
        totalSessionsCount={pastSessions.length}
        pastSessions={pastSessions}
        sessionSnapshots={sessionSnapshots}
        activeDocument={activeDocument}
        onDiscussWithCherry={handleDiscussConceptWithCherry}
        onEnterClassroomFromHub={() => {
          setCurrentScreen("classroom");
          setShowStudentAccountHub(false);
        }}
        onRefreshProfile={handleRefreshProfile}

        // Student Onboarding
        showOnboarding={showOnboarding}
        onOnboardingSubmit={handleOnboardingSubmit}

        // Student Login Modal
        showLoginModal={showLoginModal}
        onCloseLoginModal={() => setShowLoginModal(false)}
        onGoogleSignIn={handleGoogleSignIn}
        onStudentNameChange={(name) => setStudentDetails((prev: any) => ({ ...prev, name }))}
        onStudentGradeChange={(grade) => setStudentDetails((prev: any) => ({ ...prev, grade }))}
        onGuestSubmit={handleGuestSubmit}
        onMobileLoginSuccess={handleMobileLoginSuccess}
      />

      {/* ABSOLUTE FLOATING SYSTEM TOAST notifications */}
      {currentScreen !== "classroom" && !showBrandSplash && !showIntroWalkthrough && !showEnrollmentScreen && (
        <div id="toast-container" className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center space-y-2 pointer-events-none w-[calc(100%-2rem)] max-w-sm">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -16, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className={`w-full p-3 px-3.5 rounded-2xl border backdrop-blur-xl shadow-lg flex items-center space-x-3 text-xs font-sans font-semibold pointer-events-auto select-none ${
                  toast.type === "success" 
                    ? "bg-white/95 border-emerald-200/90 text-emerald-950 shadow-emerald-500/5"
                    : toast.type === "error"
                    ? "bg-white/95 border-rose-200/90 text-rose-950 shadow-rose-500/5"
                    : "bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-500/5"
                }`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                  toast.type === "success"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : toast.type === "error"
                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                    : "bg-indigo-50 text-[#796AEF] border border-indigo-100/80"
                }`}>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="flex-1 text-left leading-snug">{toast.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}
