/**
 * StudentAccountHub.tsx - Student Profile & Learning Analytics Hub
 * UTF-8 encoded
 */
import { StudentReportCardModal } from "./StudentReportCardModal";
import { ReferAndEarnHub } from "./ReferAndEarnHub";
import { InAppBookReaderModal } from "./InAppBookReaderModal";
import { GeminiApiKeyModal } from "./GeminiApiKeyModal";
import { isCustomApiKeyConfigured, getAllStoredApiKeys } from "../utils/geminiKeyStorage";
import React, { useState, useEffect, useMemo } from "react";
import {
  User,
  Award,
  Calendar,
  Clock,
  BookOpen,
  Headphones,
  Download,
  Trash2,
  Edit3,
  LogOut,
  Sparkles,
  Home,
  X,
  LayoutGrid,
  FileText,
  Share2,
  Shield,
  Bookmark,
  HardDriveDownload,
  Search,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Youtube,
  Brain,
  ChevronLeft,
  HelpCircle,
  RefreshCw,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Heart,
  Volume2,
  VolumeX,
  MessageSquare,
  Copy,
  Check,
  Zap,
  Film,
  Smartphone,
  Send,
  Flame,
  ThumbsUp,
  Video as VideoIcon,
  Camera,
  Image as ImageIcon,
  Eye,
  ZoomIn,
  Layers,
  Shuffle,
  Lightbulb,
  Printer,
  CheckCircle2,
  SlidersHorizontal,
  ArrowUpDown,
  Grid,
  List,
  ListOrdered,
  Star,
  ListTodo,
  CheckSquare,
  Square,
  Target,
  TrendingUp,
  Radio,
  Gauge,
  Activity,
  CheckCircle,
  Crosshair,
  Hourglass,
  BarChart2,
  PieChart,
  Filter,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  RotateCw,
  Key,
} from "lucide-react";
import katex from "katex";
import { generateAudioPodcast, getSavedPodcasts } from "../services/podcastService";
import { db, auth } from "../lib/firebase"; // Import database configuration
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { sanitizeSvg } from "../utils/sanitizeSvg";
import { parseAndRenderDiagramTag } from "../utils/parametricPrimitives";
import {
  escapeHTML,
  sanitizeTitleForPDF,
  compileWhiteboardToHTML,
  renderTextWithKaTeX,
  renderKaTeXHtmlSafe,
} from "../utils/whiteboardPdfCompiler";
import { getTranslations } from "../utils/i18n";
import { KiaraCounselor } from "./KiaraCounselor";
import { KiaraLiveVoiceModal } from "./KiaraLiveVoiceModal";
import { MathRenderer } from "./MathRenderer";
import { safeSetItem } from "../utils/safeStorage";
import {
  getUnifiedRevisionPayload,
  getActiveLearningContext,
  saveActiveLearningContext,
} from "../utils/activeLearningStore";
import { ConceptInfographicPoster } from "./ConceptInfographicPoster";
import { CurriculumBlindspotTracker } from "./CurriculumBlindspotTracker";
import { PrerequisiteGapFinder } from "./PrerequisiteGapFinder";
import { ExamSpeedSprintSimulator } from "./ExamSpeedSprintSimulator";
import { GitFork, Compass } from "lucide-react";
import { ConceptInfographicData } from "../types";

import {
  DIMENSION_DETAILS,
  ANALYTICS_SUITE_TABS,
  BoardSnapshot,
} from "./account/accountTypes";
import { MicroDiagnosticsView } from "./account/MicroDiagnosticsView";
import { RetentionMemoryView } from "./account/RetentionMemoryView";
import { CognitiveAgilityView } from "./account/CognitiveAgilityView";
import { MacroPerformanceView } from "./account/MacroPerformanceView";
import { AccountBooksLibraryView } from "./account/AccountBooksLibraryView";
import { downloadMindMap } from "./account/mindMapSvgUtils";
import {
  exportSessionToPDF,
  exportSnapshotToPDF,
  exportCombinedPDF,
} from "./account/pdfExportUtils";
import { StudentProfileSidebar } from "./account/StudentProfileSidebar";
import { SnapshotInspectModal } from "./account/SnapshotInspectModal";
import { useStudentAnalytics } from "./account/useStudentAnalytics";
import { PerformanceWorkspaceView } from "./account/PerformanceWorkspaceView";
import { AccountTopNavbar } from "./account/AccountTopNavbar";
import { LogoutConfirmModal } from "./account/LogoutConfirmModal";

interface StudentAccountHubProps {
  onClose: () => void;
  studentName: string;
  grade: string;
  subject: string;
  board?: string;
  mediumOfLearning?: string;
  totalSessionsCount?: number;
  onRefreshProfile?: () => void;
  onSignOut?: () => void;
  customBoardContent?: string;
  pastSessions?: any[];
  sessionSnapshots?: any[];
  topics?: string[];
  activeTopicIndex?: number;
  topicBoardsContent?: Record<number, string>;
  sessionId?: string | null;
  activeDocument?: any;
  onEnterClassroom?: () => void;
  onDiscussWithCherry?: (topicDetails: {
    topic: string;
    question?: string;
    answer?: string;
    hint?: string;
    conceptTested?: string;
    subject?: string;
  }) => void;
}

// Modularized PDF & Whiteboard compilation helpers located in ../utils/whiteboardPdfCompiler


export const StudentAccountHub: React.FC<StudentAccountHubProps> = ({
  onClose,
  studentName,
  grade,
  subject,
  board = "CBSE",
  mediumOfLearning = "Hinglish",
  totalSessionsCount = 0,
  onRefreshProfile,
  customBoardContent = "",
  pastSessions = [],
  sessionSnapshots = [],
  topics = [],
  activeTopicIndex = 0,
  topicBoardsContent = {},
  sessionId = null,
  activeDocument = null,
  onEnterClassroom,
  onDiscussWithCherry,
  onSignOut,
}) => {
  const t = getTranslations(mediumOfLearning);
  const isEnglish = (mediumOfLearning || "").trim().toLowerCase() === "english";

  // Compact single-line labels for mobile header tabs (Option 1)
  const mobileKiaraLabel = useMemo(
    () =>
      t.kiaraTab
        .replace(/ (Counselor|काउंसलर|কাউন্সেলর|କାଉନସିଲର୍|समुपदेशक)/i, "")
        .trim(),
    [t.kiaraTab],
  );
  const mobileAnalyticsLabel = useMemo(
    () =>
      t.performanceTab
        .replace(/(Performance|परफॉर्मेंस|পারফরম্যান্স|ପ୍ରଦର୍ଶନ|कामगिरी) /i, "")
        .trim(),
    [t.performanceTab],
  );
  const mobileBooksLabel = useMemo(
    () =>
      t.booksTab
        .replace(/(Study|स्टडी|স্টাডি|ପାଠ୍ୟ|अभ्यास) /i, "")
        .trim(),
    [t.booksTab],
  );
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [snapshots, setSnapshots] = useState<BoardSnapshot[]>([]);
  const [activeDesktopTab, setActiveDesktopTab] = useState<
    "books" | "stats" | "counselor" | "referral"
  >("stats");
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [isKiaraVoiceModalOpen, setIsKiaraVoiceModalOpen] =
    useState<boolean>(false);
  const [isKiaraFullScreenOpen, setIsKiaraFullScreenOpen] =
    useState<boolean>(false);
  const [kiaraVoiceInitialTopic, setKiaraVoiceInitialTopic] =
    useState<string>("");

  // Phase 1: Micro-Diagnostics & Mistake Matrix States
  const [performanceWorkspaceTab, setPerformanceWorkspaceTab] = useState<
    | "macro"
    | "micro"
    | "retention"
    | "agility"
    | "curriculum"
    | "prerequisites"
    | "sprint"
  >("macro");

  // Navigation & Viewport Refs
  const statsScrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Modal & Inspection States
  const [selectedBookForReader, setSelectedBookForReader] = useState<any | null>(null);
  const [isReportCardModalOpen, setIsReportCardModalOpen] = useState<boolean>(false);
  const [selectedSnapshotForModal, setSelectedSnapshotForModal] = useState<BoardSnapshot | null>(null);
  const [loadingSnapshots, setLoadingSnapshots] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Record<string, boolean>>({});

  // Unified unique snapshot collection memo
  const allSnapshots = useMemo(() => {
    const combined: BoardSnapshot[] = [];
    const pushIfUnique = (s: any) => {
      if (!s) return;
      const existingIdx = combined.findIndex(
        (existing) =>
          existing.id === s.id ||
          (existing.timestamp &&
            s.timestamp &&
            existing.timestamp === s.timestamp),
      );
      if (existingIdx === -1) {
        combined.push(s);
      }
    };
    (snapshots || []).forEach(pushIfUnique);
    (sessionSnapshots || []).forEach(pushIfUnique);
    return combined;
  }, [snapshots, sessionSnapshots]);

  const [activeTab, setActiveTab] = useState<"activity" | "gallery">(
    "activity",
  );
  const [activeMobileSubTab, setActiveMobileSubTab] = useState<
    "profile" | "books" | "stats" | "counselor" | "referral"
  >("stats");
  const [editingProfile, setEditingProfile] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [hasCustomKey, setHasCustomKey] = useState(() => isCustomApiKeyConfigured());
  const [keyCount, setKeyCount] = useState(() => getAllStoredApiKeys().length);

  useEffect(() => {
    setHasCustomKey(isCustomApiKeyConfigured());
    setKeyCount(getAllStoredApiKeys().length);
  }, [showApiKeyModal]);

  // States for student editable metrics
  const [editName, setEditName] = useState(studentName);
  const [editGrade, setEditGrade] = useState(grade);
  const [editBoard, setEditBoard] = useState(board);
  const [editMediumOfLearning, setEditMediumOfLearning] =
    useState(mediumOfLearning);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    setEditName(studentName);
    setEditGrade(grade);
    setEditBoard(board);
    setEditMediumOfLearning(mediumOfLearning);
  }, [studentName, grade, board, mediumOfLearning]);

  const currentUser =
    auth.currentUser ||
    (() => {
      const cached = localStorage.getItem("local_active_user");
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (_) {}
      }
      return {
        uid: "local_guest_student",
        displayName: "Student",
        isAnonymous: true,
      };
    })();

  // Retrieve blackboard snapshots from Firebase & local fallback keys
  const fetchSnapshots = async () => {
    const uid = currentUser?.uid || "local_guest_student";
    setLoadingSnapshots(true);
    try {
      if (uid === "local_guest_student" || uid.startsWith("local_")) {
        throw new Error("Local guest user bypassed database fetch");
      }
      const snapRef = collection(db, "studentProfiles", uid, "boardSnapshots");
      const q = query(snapRef, orderBy("timestamp", "desc"), limit(40));
      const snapshotDocs = await getDocs(q);
      const parsed = snapshotDocs.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          snapshotId: d.snapshotId || docSnap.id,
          userId: d.userId,
          topicTitle: d.topicTitle || "Classroom Board Snapshot",
          description:
            d.description || "Interactive calculation whiteboard screenshot.",
          imgData: d.imgData,
          subject: d.subject,
          grade: d.grade,
          topicIndex: d.topicIndex,
          timestamp: d.timestamp,
        } as BoardSnapshot;
      });
      setSnapshots(parsed);
      safeSetItem(`snapshots_${uid}`, JSON.stringify(parsed));
    } catch (e) {
      const cachedStr =
        localStorage.getItem(`snapshots_${uid}`) ||
        localStorage.getItem("snapshots_local_guest_student") ||
        localStorage.getItem("snapshots_guest") ||
        localStorage.getItem("all_board_snapshots");
      if (cachedStr) {
        try {
          setSnapshots(JSON.parse(cachedStr));
        } catch (_) {}
      }
    } finally {
      setLoadingSnapshots(false);
    }
  };

  // Real-time snapshots and quiz attempts listeners
  useEffect(() => {
    const uid = currentUser?.uid || "local_guest_student";
    const isGuest = uid === "local_guest_student" || uid.startsWith("local_");
    if (isGuest) {
      // Local Guest fallbacks - load across all storage keys
      const cachedSnapsStr =
        localStorage.getItem(`snapshots_${uid}`) ||
        localStorage.getItem("snapshots_local_guest_student") ||
        localStorage.getItem("snapshots_guest") ||
        localStorage.getItem("all_board_snapshots");
      if (cachedSnapsStr) {
        try {
          setSnapshots(JSON.parse(cachedSnapsStr));
        } catch (_) {}
      }
      const cachedQuizzes = localStorage.getItem(
        `guest_quiz_attempts_${subject}`,
      );
      if (cachedQuizzes) {
        try {
          setQuizAttempts(JSON.parse(cachedQuizzes));
        } catch (_) {}
      }
      return;
    }

    // 1. Real-time board snapshots listener
    const snapRef = collection(db, "studentProfiles", uid, "boardSnapshots");
    const qSnaps = query(snapRef, orderBy("timestamp", "desc"), limit(40));
    const unsubSnaps = onSnapshot(
      qSnaps,
      (snapshotDocs) => {
        const parsed = snapshotDocs.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            snapshotId: d.snapshotId || docSnap.id,
            userId: d.userId,
            topicTitle: d.topicTitle || "Classroom Board Snapshot",
            description:
              d.description || "Interactive calculation whiteboard screenshot.",
            imgData: d.imgData,
            subject: d.subject,
            grade: d.grade,
            topicIndex: d.topicIndex,
            timestamp: d.timestamp,
          } as BoardSnapshot;
        });
        setSnapshots(parsed);
        safeSetItem(`snapshots_${uid}`, JSON.stringify(parsed));
      },
      (error) => {
        console.warn(
          "Realtime board snapshots listener failed, using local cache:",
          error,
        );
        const cachedSnapsStr =
          localStorage.getItem(`snapshots_${uid}`) ||
          localStorage.getItem("snapshots_local_guest_student") ||
          localStorage.getItem("all_board_snapshots");
        if (cachedSnapsStr) {
          try {
            setSnapshots(JSON.parse(cachedSnapsStr));
          } catch (_) {}
        }
      },
    );

    // 2. Real-time quiz attempts listener
    const attemptsRef = collection(db, "studentProfiles", uid, "quizAttempts");
    const qQuizzes = query(
      attemptsRef,
      orderBy("timestamp", "desc"),
      limit(50),
    );
    const unsubQuizzes = onSnapshot(
      qQuizzes,
      (snapshotDocs) => {
        const parsed = snapshotDocs.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            attemptId: docSnap.id,
            timestamp: d.timestamp,
            score: d.score,
            total: d.total,
            accuracy: d.accuracy,
            source: d.source,
            docName: d.docName,
            subject: d.subject,
            grade: d.grade,
            history: d.history || [],
          };
        });
        setQuizAttempts(parsed);
        safeSetItem(`quizAttempts_${uid}`, JSON.stringify(parsed));
      },
      (error) => {
        console.warn("Realtime quiz attempts listener failed:", error);
      },
    );

    return () => {
      unsubSnaps();
      unsubQuizzes();
    };
  }, [currentUser?.uid, subject]);

  // Compute dashboard statistics in real-time
  const { dashboardStats, lowestMetric, reportCardData } = useStudentAnalytics({
    quizAttempts,
    subject,
    pastSessions,
    snapshots,
    masteredCards,
    studentName,
    grade,
    board,
    mediumOfLearning,
    totalSessionsCount,
    allBooksLength: pastSessions?.length || 0,
    allSnapshotsLength: allSnapshots.length,
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSavingProfile(true);
    try {
      const profileData = {
        name: editName,
        grade: editGrade,
        subject: subject || "Mathematics", // dynamic per session/mode, retained for backward compatibility
        board: editBoard,
        mediumOfLearning: editMediumOfLearning,
      };
      safeSetItem(
        `studentProfile_${currentUser.uid}`,
        JSON.stringify(profileData),
      );

      if (
        currentUser.uid !== "local_guest_student" &&
        !currentUser.uid.startsWith("local_")
      ) {
        const profileRef = doc(db, "studentProfiles", currentUser.uid);
        await updateDoc(profileRef, {
          ...profileData,
          updatedAt: serverTimestamp(),
        });
      }
      setEditingProfile(false);
      if (onRefreshProfile) onRefreshProfile();
    } catch (err) {
      console.warn(
        "Failed saving student updates to Firestore, saved locally:",
        err,
      );
      setEditingProfile(false);
      if (onRefreshProfile) onRefreshProfile();
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteSnapshot = async (id: string) => {
    const uid = currentUser?.uid || "local_guest_student";
    if (!confirm("Are you sure you want to delete this board snapshot?"))
      return;
    try {
      // Delete from all local storage caches
      const cleanKey = (k: string) => {
        const cachedStr = localStorage.getItem(k);
        if (cachedStr) {
          try {
            const localSnaps = JSON.parse(cachedStr);
            const filtered = localSnaps.filter(
              (s: any) => s.id !== id && s.snapshotId !== id,
            );
            safeSetItem(k, JSON.stringify(filtered));
          } catch (_) {}
        }
      };

      cleanKey(`snapshots_${uid}`);
      cleanKey("snapshots_local_guest_student");
      cleanKey("all_board_snapshots");

      setSnapshots((prev) =>
        prev.filter((s) => s.id !== id && s.snapshotId !== id),
      );

      if (uid !== "local_guest_student" && !uid.startsWith("local_")) {
        await deleteDoc(doc(db, "studentProfiles", uid, "boardSnapshots", id));
      }
    } catch (e) {
      console.warn(
        "Failed deleting snapshot from Firestore, deleted locally:",
        e,
      );
    }
  };

  const handleDownloadImage = (snapshot: BoardSnapshot) => {
    try {
      const link = document.createElement("a");
      link.href = snapshot.imgData;
      link.download = `${snapshot.topicTitle.replace(/[^a-zA-Z0-9]/g, "_")}_board.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed downloading snapshot image file:", err);
    }
  };

  const formatDate = (ts: any) => {
    if (!ts) return "Just now";
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Saved Topic";
    }
  };

  const [generatingPodcastBookId, setGeneratingPodcastBookId] = useState<string | null>(null);

  const handleTriggerBookPodcast = async (book: any) => {
    if (!book) return;
    const bookId = book.sessionId || book.id || `book_${book.index || 0}`;
    if (generatingPodcastBookId === bookId) return;

    const bookTitle =
      book.activeDocumentName ||
      book.title ||
      (book.topics && book.topics[0]) ||
      "Classroom Lesson";
    const bookSubject = book.inferredSubject || book.subject || subject || "Science";
    const bookGrade = book.grade || grade || "Class 10-12";
    const bookContent =
      book.customBoardContent ||
      book.documentMarkdown ||
      (book.topicBoardsContent && Object.values(book.topicBoardsContent).join("\n\n")) ||
      "";

    // 1. Check if we have a saved cached podcast for this topic
    const saved = getSavedPodcasts();
    const existing = saved.find(
      (p) => p.topic.toLowerCase().trim() === bookTitle.toLowerCase().trim()
    );

    if (existing) {
      window.dispatchEvent(
        new CustomEvent("cherry_open_audio_podcast", { detail: existing })
      );
      return;
    }

    // 2. Generate new 2-minute audio overview
    setGeneratingPodcastBookId(bookId);

    try {
      const podcastData = await generateAudioPodcast({
        topic: bookTitle,
        subject: bookSubject,
        grade: bookGrade,
        language: (mediumOfLearning?.toLowerCase().includes("hindi")
          ? "Hindi"
          : mediumOfLearning?.toLowerCase().includes("english")
          ? "English"
          : "Hinglish") as any,
        notesOrDocumentText: bookContent,
        episodeType: "quick_revision",
        targetDurationMins: 8,
      });

      window.dispatchEvent(
        new CustomEvent("cherry_open_audio_podcast", { detail: podcastData })
      );
    } catch (err: any) {
      console.error("[StudentAccountHub] Failed to generate podcast:", err);
    } finally {
      setGeneratingPodcastBookId(null);
    }
  };

  const handleExportSessionToPDF = (sess: any) => {
    exportSessionToPDF({
      sess,
      sessionId,
      topics,
      topicBoardsContent,
      customBoardContent,
      subject,
      grade,
      board,
      studentName,
    });
  };

  const handleExportToPDF = (
    sessionTitle: string,
    latexContent: string,
    timestampStr: string,
  ) => {
    exportSnapshotToPDF({
      sessionTitle,
      latexContent,
      timestampStr,
      subject,
      topics,
      grade,
      board,
      studentName,
    });
  };

  const handleExportCombinedPDF = () => {
    exportCombinedPDF({
      allSnapshots,
      subject,
      grade,
      board,
      studentName,
      pastSessions,
      topics,
      topicBoardsContent,
      customBoardContent,
      sessionId,
    });
  };

  return (
    <div className="absolute inset-0 bg-white flex flex-col z-30 overflow-hidden">
      <div className="bg-white w-full h-full flex flex-col overflow-hidden relative">
        <AccountTopNavbar
          grade={grade}
          onClose={onClose}
          activeMobileSubTab={activeMobileSubTab}
          setActiveMobileSubTab={setActiveMobileSubTab}
          activeDesktopTab={activeDesktopTab}
          setActiveDesktopTab={setActiveDesktopTab}
          isKiaraFullScreenOpen={isKiaraFullScreenOpen}
          setIsKiaraFullScreenOpen={setIsKiaraFullScreenOpen}
          t={t}
          mobileKiaraLabel={mobileKiaraLabel}
          mobileAnalyticsLabel={mobileAnalyticsLabel}
          mobileBooksLabel={mobileBooksLabel}
        />

        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden bg-[#F6F7FB]">
          {/* Left Sidebar: Student Profile Parameter Controls & Milestones */}
          <StudentProfileSidebar
            activeMobileSubTab={activeMobileSubTab}
            editingProfile={editingProfile}
            setEditingProfile={setEditingProfile}
            editName={editName}
            setEditName={setEditName}
            editGrade={editGrade}
            setEditGrade={setEditGrade}
            editBoard={editBoard}
            setEditBoard={setEditBoard}
            editMediumOfLearning={editMediumOfLearning}
            setEditMediumOfLearning={setEditMediumOfLearning}
            savingProfile={savingProfile}
            handleUpdateProfile={handleUpdateProfile}
            studentName={studentName}
            grade={grade}
            board={board}
            mediumOfLearning={mediumOfLearning}
            currentUser={currentUser}
            totalSessionsCount={totalSessionsCount}
            allSnapshotsCount={allSnapshots.length}
            hasCustomKey={hasCustomKey}
            keyCount={keyCount}
            onOpenReferral={() => {
              setActiveMobileSubTab("referral");
              setActiveDesktopTab("referral");
              setIsKiaraFullScreenOpen(false);
            }}
            onOpenKiaraChat={() => {
              setIsKiaraFullScreenOpen(true);
              setActiveMobileSubTab("counselor");
              setActiveDesktopTab("counselor");
            }}
            onOpenKiaraVoice={() => {
              setIsKiaraVoiceModalOpen(true);
            }}
            onOpenApiKeyModal={() => setShowApiKeyModal(true)}
            onSignOut={onSignOut}
            onOpenLogoutConfirm={() => setShowLogoutConfirm(true)}
          />

          {/* Right Column: Unified Board-Book Hub (Main Arena) */}
          <div
            className={`${activeMobileSubTab === "books" || activeMobileSubTab === "stats" || activeMobileSubTab === "counselor" || activeMobileSubTab === "referral" ? "flex" : "hidden md:flex"} flex-1 p-3.5 sm:p-5 pb-36 sm:pb-10 flex-col space-y-4 overflow-y-auto text-left min-h-0 bg-[#F6F7FB]`}

            ref={statsScrollContainerRef}
          >
            {/* Premium Header - Unified Performance Hub */}
            {activeDesktopTab !== "stats" && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EFF1F5] pb-2.5 gap-2 shrink-0 select-none">
                <div className="flex items-center gap-2 min-w-0">
                  {activeDesktopTab === "referral" ? (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1E293B] truncate">
                        Refer & Earn • 5-Level Compensation Hub
                      </h3>
                    </>
                  ) : activeDesktopTab === "counselor" ? (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1E293B] truncate">
                        Kiara • AI Mindset & Academic Success Counselor
                      </h3>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 text-[#796AEF] shrink-0" />
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1E293B] truncate">
                        Classroom Study Handbooks (Board-Books)
                      </h3>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] bg-white text-[#796AEF] border border-[#EFF1F5] px-2.5 py-1 rounded-xl font-bold uppercase tracking-wider shadow-2xs font-sans">
                    {subject} • {grade}
                  </span>
                </div>
              </div>
            )}

            {activeDesktopTab === "referral" ||
            activeMobileSubTab === "referral" ? (
              <div className="flex-1 p-2 sm:p-4 text-left min-h-[600px]">
                <ReferAndEarnHub
                  studentName={studentName}
                  userUid={currentUser?.uid}
                  onOpenSubscriptionPlans={() => {
                    window.dispatchEvent(new CustomEvent("cherry_open_subscription_plans"));
                  }}
                  onClose={() => {
                    setActiveMobileSubTab("profile");
                    setActiveDesktopTab("stats");
                  }}
                />
              </div>
            ) : activeDesktopTab === "counselor" ||
            activeMobileSubTab === "counselor" ||
            isKiaraFullScreenOpen ? (
              <div className="flex-1 min-h-[620px] text-left">
                <KiaraCounselor
                  studentName={studentName}
                  grade={grade}
                  subject={subject}
                  board={board}
                  mediumOfLearning={mediumOfLearning}
                  analytics={{
                    conceptClarity: dashboardStats.conceptClarity,
                    theoreticalCore: dashboardStats.theoreticalCore,
                    calculationPrecision: dashboardStats.calculationPrecision,
                    formulaRecall: dashboardStats.formulaRecall,
                    socraticStamina: dashboardStats.socraticStamina,
                    strengths: dashboardStats.strengths,
                    growths: dashboardStats.growths,
                    totalQuizzes: quizAttempts?.length || 0,
                    classesCompleted: pastSessions?.length || 0,
                    snapshotsSaved: snapshots?.length || 0,
                    lowestMetric: lowestMetric,
                  }}
                  onNavigateToClassroom={onEnterClassroom}
                  onStartVoiceCall={(topic?: string) => {
                    setKiaraVoiceInitialTopic(topic || "");
                    setIsKiaraVoiceModalOpen(true);
                  }}
                  onClose={() => {
                    setActiveDesktopTab("stats");
                    setActiveMobileSubTab("profile");
                    setIsKiaraFullScreenOpen(false);
                  }}
                />
              </div>
            ) : activeDesktopTab === "stats" ? (
              <PerformanceWorkspaceView
                performanceWorkspaceTab={performanceWorkspaceTab}
                setPerformanceWorkspaceTab={setPerformanceWorkspaceTab}
                isEnglish={isEnglish}
                dashboardStats={dashboardStats}
                subject={subject}
                grade={grade}
                board={board}
                studentName={studentName}
                t={t}
                pastSessions={pastSessions}
                snapshots={snapshots}
                quizAttempts={quizAttempts}
                masteredCards={masteredCards}
                mediumOfLearning={mediumOfLearning}
                onEnterClassroom={onEnterClassroom}
                onDiscussWithCherry={onDiscussWithCherry}
                onOpenReportCard={() => setIsReportCardModalOpen(true)}
                onOpenKiaraVoice={() => setIsKiaraVoiceModalOpen(true)}
              />
            ) : (
              <AccountBooksLibraryView
                pastSessions={pastSessions}
                snapshots={snapshots}
                sessionSnapshots={sessionSnapshots}
                activeDocument={activeDocument}
                sessionId={sessionId}
                customBoardContent={customBoardContent}
                topicBoardsContent={topicBoardsContent}
                topics={topics}
                studentName={studentName}
                grade={grade}
                board={board}
                subject={subject}
                mediumOfLearning={mediumOfLearning}
                isEnglish={isEnglish}
                onDiscussWithCherry={onDiscussWithCherry}
                onEnterClassroom={onEnterClassroom}
                onOpenBookReader={(book) => setSelectedBookForReader(book)}
                onOpenSnapshotModal={(snap) => setSelectedSnapshotForModal(snap)}
                onDeleteSnapshot={(id) => handleDeleteSnapshot(id)}
                onTriggerBookPodcast={(book) => handleTriggerBookPodcast(book)}
                generatingPodcastBookId={generatingPodcastBookId}
                onExportSessionToPDF={(book) => handleExportSessionToPDF(book)}
                getActiveLearningContext={getActiveLearningContext}
                activeDesktopTab={activeDesktopTab}
              />
            )}
          </div>
        </div>
      </div>

      {/* Book Reader Modal */}
      {selectedBookForReader && (
        <InAppBookReaderModal
          isOpen={!!selectedBookForReader}
          book={selectedBookForReader}
          onClose={() => setSelectedBookForReader(null)}
          onDiscussWithCherry={onDiscussWithCherry}
        />
      )}

      {/* Kiara Voice Modal */}
      {isKiaraVoiceModalOpen && (
        <KiaraLiveVoiceModal
          isOpen={isKiaraVoiceModalOpen}
          onClose={() => {
            setIsKiaraVoiceModalOpen(false);
            setKiaraVoiceInitialTopic("");
          }}
          studentName={studentName}
          grade={grade}
          board={board}
          subject={subject}
          lowestMetric={lowestMetric}
          performanceData={{
            conceptClarity: dashboardStats.conceptClarity,
            theoreticalCore: dashboardStats.theoreticalCore,
            calculationPrecision: dashboardStats.calculationPrecision,
            formulaRecall: dashboardStats.formulaRecall,
            socraticStamina: dashboardStats.socraticStamina,
            strengths: dashboardStats.strengths,
            growths: dashboardStats.growths,
            totalQuizzes: quizAttempts?.length || 0,
            classesCompleted: pastSessions?.length || 0,
            snapshotsSaved: snapshots?.length || 0,
            lowestMetric: lowestMetric,
          }}
          initialDiscussionTopic={kiaraVoiceInitialTopic}
          autoStart={Boolean(kiaraVoiceInitialTopic)}
          onDiscussWithCherry={onDiscussWithCherry}
        />
      )}

      {/* Report Card Modal */}
      {isReportCardModalOpen && (
        <StudentReportCardModal
          isOpen={isReportCardModalOpen}
          onClose={() => setIsReportCardModalOpen(false)}
          studentName={studentName}
          grade={grade}
          subject={subject}
        />
      )}

      {/* Snapshot Inspect Modal */}
      <SnapshotInspectModal
        snapshot={selectedSnapshotForModal}
        subject={subject}
        onClose={() => setSelectedSnapshotForModal(null)}
        onDelete={(id) => handleDeleteSnapshot(id)}
      />

      {/* 1-Tap Gemini API Key BYOK Modal */}
      <GeminiApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => {
          setShowApiKeyModal(false);
          setHasCustomKey(isCustomApiKeyConfigured());
        }}
      />

      {/* Safe Log Out Confirmation Dialog (Modular) */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        currentUserEmail={currentUser?.email}
        studentName={studentName}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirmSignOut={() => {
          if (onSignOut) {
            onSignOut();
          }
        }}
      />
    </div>
  );
};
