import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Layers,
  BookOpen,
  Camera,
  Sparkles,
  Search,
  ArrowUpDown,
  Grid,
  Film,
  ChevronLeft,
  ChevronRight,
  Download,
  Star,
  Maximize2,
  Eye,
  Trash2,
  Headphones,
} from "lucide-react";
import { BoardSnapshot } from "./accountTypes";

export interface AccountBooksLibraryViewProps {
  pastSessions: any[];
  snapshots: BoardSnapshot[];
  sessionSnapshots?: any[];
  activeDocument?: any;
  sessionId?: string;
  customBoardContent?: string;
  topicBoardsContent?: Record<number, string>;
  topics?: string[];
  studentName?: string;
  grade?: string;
  board?: string;
  subject?: string;
  mediumOfLearning?: string;
  isEnglish?: boolean;
  onDiscussWithCherry?: (topic: string) => void;
  onEnterClassroom?: () => void;
  onOpenBookReader: (book: any) => void;
  onOpenSnapshotModal: (snap: BoardSnapshot) => void;
  onDeleteSnapshot: (id: string) => void;
  onTriggerBookPodcast: (book: any) => void;
  generatingPodcastBookId?: string | null;
  onExportSessionToPDF: (book: any) => void;
  getActiveLearningContext: () => any;
  activeDesktopTab?: string;
}

export const AccountBooksLibraryView: React.FC<AccountBooksLibraryViewProps> = ({
  pastSessions = [],
  snapshots = [],
  sessionSnapshots = [],
  activeDocument,
  sessionId,
  customBoardContent,
  topicBoardsContent,
  topics,
  studentName = "Scholar",
  grade = "Class 10",
  board = "CBSE",
  subject = "Mathematics",
  mediumOfLearning = "Hinglish",
  isEnglish = true,
  onOpenBookReader,
  onOpenSnapshotModal,
  onDeleteSnapshot,
  onTriggerBookPodcast,
  generatingPodcastBookId,
  onExportSessionToPDF,
  getActiveLearningContext,
  activeDesktopTab = "books",
}) => {
  // Books & Slates Active View Mode ("books" vs "slates")
  const [bookHubActiveTab, setBookHubActiveTab] = useState<"books" | "slates">("books");
  const [archiveSearchQuery, setArchiveSearchQuery] = useState("");
  const [snapshotSearchQuery, setSnapshotSearchQuery] = useState("");
  const [selectedBookSubjectFilter, setSelectedBookSubjectFilter] = useState<string>("all");
  const [selectedSnapshotSubjectFilter, setSelectedSnapshotSubjectFilter] = useState<string>("all");
  const [booksViewMode, setBooksViewMode] = useState<"grid" | "carousel">("grid");
  const [snapshotsViewMode, setSnapshotsViewMode] = useState<"grid" | "carousel">("grid");
  const [bookSortOrder, setBookSortOrder] = useState<"newest" | "oldest" | "title" | "topics">("newest");
  const booksScrollContainerRef = useRef<HTMLDivElement>(null);
  const snapshotScrollContainerRef = useRef<HTMLDivElement>(null);
  const bookSearchInputRef = useRef<HTMLInputElement>(null);

  const [currentBookHorizontalIndex, setCurrentBookHorizontalIndex] = useState(0);
  const [currentSnapshotHorizontalIndex, setCurrentSnapshotHorizontalIndex] = useState(0);

  // Starred / Favorite Books (Persisted)
  const [starredBookIds, setStarredBookIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved =
        typeof window !== "undefined"
          ? localStorage.getItem("cherry_starred_books")
          : null;
      return saved ? JSON.parse(saved) : {};
    } catch (_) {
      return {};
    }
  });

  const toggleStarBook = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setStarredBookIds((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("cherry_starred_books", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  // Keyboard shortcut listener for quick library search (Press "/" or "Ctrl+K")
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        activeDesktopTab === "books" &&
        (e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k"))
      ) {
        if (
          document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "TEXTAREA"
        ) {
          return;
        }
        e.preventDefault();
        bookSearchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeDesktopTab]);

  const handleBooksHorizontalScroll = (direction: "prev" | "next") => {
    if (!booksScrollContainerRef.current) return;
    const container = booksScrollContainerRef.current;
    const itemWidth = container.clientWidth;
    const newScrollLeft =
      direction === "next"
        ? container.scrollLeft + itemWidth
        : container.scrollLeft - itemWidth;
    container.scrollTo({ left: newScrollLeft, behavior: "smooth" });
  };

  const handleSnapshotHorizontalScroll = (direction: "prev" | "next") => {
    if (!snapshotScrollContainerRef.current) return;
    const container = snapshotScrollContainerRef.current;
    const itemWidth = container.clientWidth;
    const newScrollLeft =
      direction === "next"
        ? container.scrollLeft + itemWidth
        : container.scrollLeft - itemWidth;
    container.scrollTo({ left: newScrollLeft, behavior: "smooth" });
  };

  // Helper to infer subject for chapter books
  const inferBookSubject = (sess: any): string => {
    if (sess.subject && typeof sess.subject === "string" && sess.subject.trim()) {
      const s = sess.subject.trim();
      if (s.toLowerCase().includes("math")) return "Mathematics";
      if (s.toLowerCase().includes("phys")) return "Physics";
      if (s.toLowerCase().includes("chem")) return "Chemistry";
      if (s.toLowerCase().includes("bio")) return "Biology";
      if (s.toLowerCase().includes("sci")) return "Science";
      return s;
    }
    const text = `${sess.activeDocumentName || ""} ${sess.title || ""} ${sess.documentMarkdown || ""}`.toLowerCase();
    if (
      text.match(
        /ammonia|haber|nh3|hydrochloric|nitric|sulfuric|acid|base|salt|bond|reaction|organic|element|periodic|chemical|equilibrium|solution|electrochem|compound|hybridization|carbon|metal|atom|redox|titration|precipitation|catalyst|oxidation|reduction|mole|molarity|alkali|alkaline|halogen|valency|isomerism|hydrocarbon|ester|aldehyde|ketone|polymer|le chatelier|exothermic|endothermic|solubility|odour|gas/,
      )
    ) {
      return "Chemistry";
    }
    if (
      text.match(
        /trigonometr|algebra|calculus|derivative|integral|differential|geometry|matrix|determinant|quadratic|arithmetic|probability|polynomial|height|distance|triangle|circle|vector|parabola|hyperbola|ellipse|coordinate|logarithm|permutation|combination|binomial|limit|continuity/,
      )
    ) {
      return "Mathematics";
    }
    if (
      text.match(
        /cell|plant|photosynthe|genetic|dna|rna|circulation|respiration|organism|biotech|ecolog|human|tissue|reproduction|heart|blood|neuron|brain|kidney|digestion|endocrine|hormone|chromosome|mitosis|meiosis|ecosystem|bacteria|virus|fungi|enzyme|chlorophyll|stomata/,
      )
    ) {
      return "Biology";
    }
    if (
      text.match(
        /kinematic|motion|gravity|force|newton|momentum|energy|work|power|ohm|current|optics|lens|mirror|thermodynamic|magnetic|electromagnet|wave|frequency|wavelength|friction|light|circuit|volt|ampere|refraction|reflection|capacit|resistor|inductor|photoelectric|nuclear|doppler|torque|rotational|fluids|pressure|buoyancy|snell/,
      )
    ) {
      return "Physics";
    }
    return subject || "Science";
  };

  // Processed list of past sessions + Active Learning Context
  const allBooks = useMemo(() => {
    const activeCtx = getActiveLearningContext();
    const existingSessionIds = new Set(
      pastSessions.map((s) => s.sessionId).filter(Boolean),
    );
    const existingDocNames = new Set(
      pastSessions.map((s) => s.activeDocumentName).filter(Boolean),
    );

    let synthesizedActiveBooks: any[] = [];
    if (
      activeDocument &&
      (activeDocument.markdown || activeDocument.filename)
    ) {
      const docName = activeDocument.filename || "Active Study Document";
      if (
        !existingDocNames.has(docName) &&
        (!sessionId || !existingSessionIds.has(sessionId))
      ) {
        synthesizedActiveBooks.push({
          sessionId: sessionId || "active_live_session",
          isLiveActive: true,
          activeDocumentName: docName,
          activeDocumentMarkdown: activeDocument.markdown || "",
          documentMarkdown: activeDocument.markdown || "",
          sourceMode:
            activeDocument.mimeType === "video/youtube"
              ? "explainer_youtube"
              : "explainer_doc",
          subject: activeDocument.detectedSubject || subject,
          grade: grade,
          board: board,
          customBoardContent: customBoardContent || "",
          topicBoardsContent: topicBoardsContent,
          topics: topics && topics.length > 0 ? topics : [docName],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } else if (
      activeCtx &&
      (activeCtx.documentMarkdown || activeCtx.blackboardContent) &&
      activeCtx.sessionId &&
      !existingSessionIds.has(activeCtx.sessionId)
    ) {
      synthesizedActiveBooks.push({
        sessionId: activeCtx.sessionId,
        isLiveActive: true,
        activeDocumentName: activeCtx.title || "Active Learning Session",
        activeDocumentMarkdown: activeCtx.documentMarkdown || "",
        documentMarkdown: activeCtx.documentMarkdown || "",
        sourceMode: activeCtx.sourceMode || "live_blackboard",
        subject: activeCtx.subject || subject,
        grade: activeCtx.grade || grade,
        board: activeCtx.board || board,
        customBoardContent:
          activeCtx.blackboardContent || customBoardContent || "",
        topicBoardsContent: topicBoardsContent,
        topics:
          activeCtx.topics && activeCtx.topics.length > 0
            ? activeCtx.topics
            : topics || [],
        createdAt: activeCtx.lastUpdated || new Date().toISOString(),
        updatedAt: activeCtx.lastUpdated || new Date().toISOString(),
      });
    }

    const combinedList = [...synthesizedActiveBooks, ...pastSessions];

    return combinedList.map((sess, index) => {
      const originalTitle =
        sess.activeDocumentName ||
        sess.title ||
        `Class Lecture Hand-Handbook #${combinedList.length - index}`;
      const creationDate = sess.createdAt || sess.updatedAt;
      let dateString = sess.isLiveActive
        ? "🟢 Active Now (Live Context)"
        : "Recently Synced";
      if (creationDate && !sess.isLiveActive) {
        try {
          const date = creationDate.toDate
            ? creationDate.toDate()
            : new Date(
                creationDate.seconds
                  ? creationDate.seconds * 1000
                  : creationDate,
              );
          const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
          ];
          const dayVal = String(date.getDate()).padStart(2, "0");
          const monthVal = months[date.getMonth()];
          const yearVal = date.getFullYear();
          let hours = date.getHours();
          const minutes = String(date.getMinutes()).padStart(2, "0");
          const ampm = hours >= 12 ? "PM" : "AM";
          hours = hours % 12;
          hours = hours ? hours : 12;
          const timeVal = `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
          dateString = `${dayVal} ${monthVal} ${yearVal}, ${timeVal}`;
        } catch (e) {
          dateString = "Recently Synced";
        }
      }

      const resolvedSourceMode =
        sess.sourceMode ||
        (sess.mimeType === "video/youtube" ||
        (sess.activeDocumentName && sess.activeDocumentName.includes("YouTube"))
          ? "explainer_youtube"
          : sess.documentMarkdown || sess.activeDocumentMarkdown
            ? "explainer_doc"
            : "live_blackboard");

      return {
        ...sess,
        processedTitle: originalTitle,
        formattedDateTime: dateString,
        index: combinedList.length - index,
        inferredSubject: inferBookSubject(sess),
        sourceMode: resolvedSourceMode,
        documentMarkdown:
          sess.documentMarkdown || sess.activeDocumentMarkdown || "",
        activeDocumentMarkdown:
          sess.activeDocumentMarkdown || sess.documentMarkdown || "",
      };
    });
  }, [
    pastSessions,
    subject,
    activeDocument,
    sessionId,
    customBoardContent,
    topicBoardsContent,
    topics,
    grade,
    board,
    getActiveLearningContext,
  ]);

  // Dynamic Subject Counts for Books Filter Tabs
  const bookSubjectCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allBooks.length,
      starred: 0,
      Mathematics: 0,
      Physics: 0,
      Chemistry: 0,
      Biology: 0,
      Science: 0,
    };
    allBooks.forEach((b) => {
      const subj = b.inferredSubject;
      counts[subj] = (counts[subj] || 0) + 1;
      const bKey = b.sessionId || b.id || `book_${b.index}`;
      if (starredBookIds[bKey]) {
        counts.starred = (counts.starred || 0) + 1;
      }
    });
    return counts;
  }, [allBooks, starredBookIds]);

  const filteredBooks = useMemo(() => {
    let result = [...allBooks];
    // 1. Subject filter
    if (selectedBookSubjectFilter === "starred") {
      result = result.filter(
        (b) => !!starredBookIds[b.sessionId || b.id || `book_${b.index}`],
      );
    } else if (selectedBookSubjectFilter !== "all") {
      result = result.filter(
        (b) =>
          b.inferredSubject.toLowerCase() ===
          selectedBookSubjectFilter.toLowerCase(),
      );
    }
    // 2. Search query filter
    if (archiveSearchQuery.trim()) {
      const q = archiveSearchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          (b.processedTitle && b.processedTitle.toLowerCase().includes(q)) ||
          (b.inferredSubject && b.inferredSubject.toLowerCase().includes(q)) ||
          (b.formattedDateTime &&
            b.formattedDateTime.toLowerCase().includes(q)) ||
          (Array.isArray(b.topics) &&
            b.topics.some((t: string) => t.toLowerCase().includes(q))),
      );
    }
    // 3. Sort Order
    if (bookSortOrder === "oldest") {
      result = [...result].reverse();
    } else if (bookSortOrder === "title") {
      result = [...result].sort((a, b) =>
        (a.processedTitle || "").localeCompare(b.processedTitle || ""),
      );
    } else if (bookSortOrder === "topics") {
      result = [...result].sort(
        (a, b) => (b.topics?.length || 1) - (a.topics?.length || 1),
      );
    }
    return result;
  }, [
    allBooks,
    selectedBookSubjectFilter,
    archiveSearchQuery,
    bookSortOrder,
    starredBookIds,
  ]);

  // Helper to infer or normalize subject for snapshots
  const inferSnapshotSubject = (snap: any): string => {
    if (
      snap.subject &&
      typeof snap.subject === "string" &&
      snap.subject.trim()
    ) {
      const s = snap.subject.trim();
      if (s.toLowerCase().includes("math")) return "Mathematics";
      if (s.toLowerCase().includes("phys")) return "Physics";
      if (s.toLowerCase().includes("chem")) return "Chemistry";
      if (s.toLowerCase().includes("bio")) return "Biology";
      if (s.toLowerCase().includes("sci")) return "Science";
      return s;
    }
    const text =
      `${snap.topicTitle || ""} ${snap.description || ""}`.toLowerCase();
    if (
      text.match(
        /ammonia|haber|nh3|hydrochloric|nitric|sulfuric|acid|base|salt|bond|reaction|organic|element|periodic|chemical|equilibrium|solution|electrochem|compound|hybridization|carbon|metal|atom|redox|titration|precipitation|catalyst|oxidation|reduction|mole|molarity|alkali|alkaline|halogen|valency|isomerism|hydrocarbon|ester|aldehyde|ketone|polymer|le chatelier|exothermic|endothermic|solubility|odour/,
      )
    ) {
      return "Chemistry";
    }
    if (
      text.match(
        /trigonometr|algebra|calculus|derivative|integral|differential|geometry|matrix|determinant|quadratic|arithmetic|probability|polynomial|height|distance|triangle|circle|vector|parabola|hyperbola|ellipse|coordinate|logarithm|permutation|combination|binomial|limit|continuity/,
      )
    ) {
      return "Mathematics";
    }
    if (
      text.match(
        /cell|plant|photosynthe|genetic|dna|rna|circulation|respiration|organism|biotech|ecolog|human|tissue|reproduction|heart|blood|neuron|brain|kidney|digestion|endocrine|hormone|chromosome|mitosis|meiosis|ecosystem|bacteria|virus|fungi|enzyme|chlorophyll|stomata/,
      )
    ) {
      return "Biology";
    }
    if (
      text.match(
        /kinematic|motion|gravity|force|newton|momentum|energy|work|power|ohm|current|optics|lens|mirror|thermodynamic|magnetic|electromagnet|wave|frequency|wavelength|friction|light|circuit|volt|ampere|refraction|reflection|capacit|resistor|inductor|photoelectric|nuclear|doppler|torque|rotational|fluids|pressure|buoyancy|snell/,
      )
    ) {
      return "Physics";
    }
    return subject || "Science";
  };

  // Combine Firestore snapshots and session snapshots
  const allSnapshots = useMemo(() => {
    const combined: BoardSnapshot[] = [];
    const pushIfUnique = (s: any) => {
      if (!s || !s.imgData) return;
      const sub = inferSnapshotSubject(s);
      const existingIdx = combined.findIndex(
        (fb) =>
          fb.snapshotId === s.snapshotId ||
          (typeof s.topicIndex === "number" &&
            typeof fb.topicIndex === "number" &&
            fb.topicIndex === s.topicIndex &&
            fb.subject?.toLowerCase() === sub.toLowerCase()) ||
          (fb.topicTitle?.trim().toLowerCase() ===
            (s.topicTitle || "").trim().toLowerCase() &&
            fb.subject?.toLowerCase() === sub.toLowerCase()),
      );

      const normalized: BoardSnapshot = {
        id:
          s.id ||
          `snap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        snapshotId: s.snapshotId || s.id || `snap_${Date.now()}`,
        userId: s.userId || "",
        topicTitle: s.topicTitle || "Classroom Board Snapshot",
        description:
          s.description || "Interactive calculation whiteboard screenshot.",
        imgData: s.imgData,
        subject: sub,
        grade: s.grade || grade || "Class 10",
        topicIndex: typeof s.topicIndex === "number" ? s.topicIndex : undefined,
        timestamp: s.timestamp,
      };

      if (existingIdx >= 0) {
        combined[existingIdx] = normalized;
      } else {
        combined.push(normalized);
      }
    };

    snapshots.forEach(pushIfUnique);
    if (sessionSnapshots && sessionSnapshots.length > 0) {
      sessionSnapshots.forEach(pushIfUnique);
    }
    return combined;
  }, [snapshots, sessionSnapshots, subject, grade]);

  // Dynamic Subject Counts for Filter Tabs
  const snapshotSubjectCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allSnapshots.length,
      Mathematics: 0,
      Physics: 0,
      Chemistry: 0,
      Biology: 0,
      Science: 0,
      General: 0,
    };
    allSnapshots.forEach((snap) => {
      const subj = inferSnapshotSubject(snap);
      counts[subj] = (counts[subj] || 0) + 1;
    });
    return counts;
  }, [allSnapshots]);

  const filteredSnapshots = useMemo(() => {
    let result = allSnapshots;
    if (selectedSnapshotSubjectFilter !== "all") {
      result = result.filter(
        (s) =>
          inferSnapshotSubject(s).toLowerCase() ===
          selectedSnapshotSubjectFilter.toLowerCase(),
      );
    }
    if (snapshotSearchQuery.trim()) {
      const q = snapshotSearchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          (s.topicTitle && s.topicTitle.toLowerCase().includes(q)) ||
          (s.description && s.description.toLowerCase().includes(q)) ||
          (s.subject && s.subject.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [allSnapshots, selectedSnapshotSubjectFilter, snapshotSearchQuery]);

  // Markdown Batch Export
  const handleBatchExportSnapshotsMarkdown = () => {
    const list = snapshots && snapshots.length > 0 ? snapshots : [];
    if (list.length === 0) return;

    let md = `# 📸 Blackboard Derivations & Chalkboard Slates Album\n\n`;
    md += `*Student: ${studentName || "Scholar"} | Grade: ${grade || "Class 10"} | Board: ${board || "CBSE"} | Subject: ${subject || "Mathematics"}*\n`;
    md += `*Generated via Cherry AI Socratic Classroom on ${new Date().toLocaleDateString()}*\n\n`;
    md += `---\n\n`;

    list.forEach((snap, idx) => {
      md += `## Slide ${idx + 1}: ${snap.topicTitle || "Lecture Derivation"}\n`;
      md += `**Subject**: ${snap.subject || subject || "Science"} | **Timestamp**: ${new Date(snap.timestamp).toLocaleString()}\n\n`;
      if (snap.description) {
        md += `> ${snap.description}\n\n`;
      }
      if (
        snap.latexEquations &&
        Array.isArray(snap.latexEquations) &&
        snap.latexEquations.length > 0
      ) {
        md += `### Key Mathematical Formulas:\n`;
        snap.latexEquations.forEach((eq: string) => {
          md += `$$\n${eq}\n$$\n\n`;
        });
      }
      if (snap.imgData) {
        md += `![Blackboard Snapshot](${snap.imgData})\n\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Chalkboard_Slates_Album_${(subject || "All").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper for Subject Book Themes
  const getSubjectBookTheme = (subj: string) => {
    const s = (subj || "").toLowerCase();
    if (s.includes("math")) {
      return {
        name: "Mathematics",
        icon: "📐",
        accentPillBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      };
    }
    if (s.includes("phys")) {
      return {
        name: "Physics",
        icon: "⚡",
        accentPillBg: "bg-sky-500/20 text-sky-300 border-sky-500/40",
      };
    }
    if (s.includes("chem")) {
      return {
        name: "Chemistry",
        icon: "🧪",
        accentPillBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      };
    }
    if (s.includes("bio")) {
      return {
        name: "Biology",
        icon: "🌱",
        accentPillBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      };
    }
    return {
      name: "Science",
      icon: "🔬",
      accentPillBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    };
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* UNIFIED HERO HEADER, SEGMENTED SWITCHER & CONSOLIDATED TOOLBAR */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 rounded-2xl text-white shadow-xl border border-indigo-500/20 relative overflow-hidden flex flex-col gap-5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Bar inside Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400/25 to-teal-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center text-2xl font-bold shrink-0 shadow-inner">
              📖
            </div>
            <div className="text-left min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg md:text-xl font-black tracking-tight text-white truncate">
                  {studentName ? `${studentName}'s Books & Smart Handbooks` : "Classroom Books & Smart Handbooks"}
                </h3>
                <span className="text-[10.5px] font-mono font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full shadow-xs">
                  Live Sync
                </span>
              </div>
              <p className="text-[11.5px] sm:text-xs text-slate-300 font-medium truncate mt-0.5">
                Multi-page chalkboard lecture books, step-by-step derivations & AI flashcard decks.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 relative z-10 shrink-0 self-start sm:self-auto">
            <span className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider bg-black/40 text-indigo-200 px-3.5 py-1.5 rounded-xl border border-indigo-400/25 backdrop-blur-md shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {grade || "Class 10"} • {board || "CBSE"} • {mediumOfLearning || "Hinglish"}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider bg-black/40 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-400/25 backdrop-blur-md shadow-inner">
              <Layers className="w-3 h-3 text-emerald-400" />
              <span>
                {Object.keys(bookSubjectCounts).filter(
                  (k) => k !== "all" && bookSubjectCounts[k] > 0,
                ).length || 1}{" "}
                Subjects
              </span>
            </span>
          </div>
        </div>

        {/* UNIFIED 2-WAY VIEW SWITCHER (Clean, fully readable & non-truncated) */}
        <div className="bg-black/40 p-2.5 rounded-2xl border border-indigo-500/25 relative z-10 space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5 w-full">
            {/* Button 1: Chapter Books */}
            <button
              type="button"
              onClick={() => setBookHubActiveTab("books")}
              className={`p-3 sm:p-3.5 rounded-xl transition-all flex flex-col justify-between text-left cursor-pointer border min-h-[44px] ${
                bookHubActiveTab === "books"
                  ? "bg-white text-slate-900 border-white shadow-lg ring-2 ring-emerald-400/40"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-indigo-200"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    bookHubActiveTab === "books"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-white/10 text-emerald-400"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-black ${
                    bookHubActiveTab === "books"
                      ? "bg-[#EEF2FF] text-[#796AEF] border border-[#796AEF]/30"
                      : "bg-white/15 text-white"
                  }`}
                >
                  {allBooks.length} {allBooks.length === 1 ? "Book" : "Books"}
                </span>
              </div>

              <div className="w-full">
                <div
                  className={`text-xs sm:text-sm font-black tracking-tight leading-tight ${
                    bookHubActiveTab === "books"
                      ? "text-slate-900"
                      : "text-white"
                  }`}
                >
                  Chapter Books
                </div>
                <div
                  className={`text-[11px] sm:text-[12px] leading-snug mt-1 ${
                    bookHubActiveTab === "books"
                      ? "text-slate-600 font-medium"
                      : "text-indigo-200/80"
                  }`}
                >
                  Lecture Notes & AI Decks
                </div>
              </div>
            </button>

            {/* Button 2: Board Slates */}
            <button
              type="button"
              onClick={() => setBookHubActiveTab("slates")}
              className={`p-3 sm:p-3.5 rounded-xl transition-all flex flex-col justify-between text-left cursor-pointer border min-h-[44px] ${
                bookHubActiveTab === "slates"
                  ? "bg-white text-slate-900 border-white shadow-lg ring-2 ring-indigo-400/40"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-indigo-200"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    bookHubActiveTab === "slates"
                      ? "bg-indigo-50 text-indigo-700"
                      : "bg-white/10 text-indigo-400"
                  }`}
                >
                  <Camera className="w-4 h-4" />
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-black ${
                    bookHubActiveTab === "slates"
                      ? "bg-[#EEF2FF] text-[#796AEF] border border-[#796AEF]/30"
                      : "bg-white/15 text-white"
                  }`}
                >
                  {allSnapshots.length} {allSnapshots.length === 1 ? "Slate" : "Slates"}
                </span>
              </div>

              <div className="w-full">
                <div
                  className={`text-xs sm:text-sm font-black tracking-tight leading-tight ${
                    bookHubActiveTab === "slates"
                      ? "text-slate-900"
                      : "text-white"
                  }`}
                >
                  Board Slates
                </div>
                <div
                  className={`text-[11px] sm:text-[12px] leading-snug mt-1 ${
                    bookHubActiveTab === "slates"
                      ? "text-slate-600 font-medium"
                      : "text-indigo-200/80"
                  }`}
                >
                  Chalkboard Photo Slides
                </div>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between text-[11.5px] font-mono text-indigo-200/90 px-1 pt-0.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                {bookHubActiveTab === "books"
                  ? "Active: Chapter Books — Complete interactive lecture handbooks"
                  : "Active: Board Slates — High-resolution chalkboard photos & formula captures"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* UNIFIED FLOATING SEARCH & FILTER TOOLBAR */}
      <div className="bg-white border border-[#EFF1F5]/80 rounded-2xl p-3 shadow-xs space-y-3">
        {/* Top Row: Search Input + View Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />
            <input
              ref={bookSearchInputRef}
              type="text"
              value={
                bookHubActiveTab === "books"
                  ? archiveSearchQuery
                  : snapshotSearchQuery
              }
              onChange={(e) => {
                if (bookHubActiveTab === "books") {
                  setArchiveSearchQuery(e.target.value);
                  setCurrentBookHorizontalIndex(0);
                } else {
                  setSnapshotSearchQuery(e.target.value);
                  setCurrentSnapshotHorizontalIndex(0);
                }
              }}
              placeholder={
                bookHubActiveTab === "books"
                  ? "Search chapter books, topics, or formulas... (Press / to search)"
                  : "Search blackboard slides by topic, formula, or concept... (Press / to search)"
              }
              className="w-full pl-10 pr-20 py-2.5 bg-[#F6F7FB] hover:bg-zinc-100/80 focus:bg-white border border-[#EFF1F5] focus:border-[#796AEF] text-slate-800 placeholder:text-slate-400 rounded-xl text-xs font-mono transition-all focus:outline-none focus:ring-1 focus:ring-[#796AEF] min-h-[44px]"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {(
                bookHubActiveTab === "books"
                  ? archiveSearchQuery
                  : snapshotSearchQuery
              ) ? (
                <button
                  type="button"
                  onClick={() => {
                    if (bookHubActiveTab === "books") {
                      setArchiveSearchQuery("");
                      setCurrentBookHorizontalIndex(0);
                    } else {
                      setSnapshotSearchQuery("");
                      setCurrentSnapshotHorizontalIndex(0);
                    }
                  }}
                  className="min-h-[44px] min-w-[44px] sm:min-h-[30px] sm:min-w-[30px] flex items-center justify-center p-1 rounded-md text-slate-400 hover:text-slate-700 text-xs transition-colors cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              ) : (
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-zinc-200/60 border border-zinc-300 rounded-md">
                  /
                </kbd>
              )}
            </div>
          </div>

          {/* Controls Dock: Sort + View Mode + Stepper + Export */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-between md:justify-end">
            {bookHubActiveTab === "books" ? (
              <>
                {/* Sort Dropdown */}
                <div className="flex items-center gap-1 bg-[#F6F7FB] px-2.5 py-1.5 rounded-xl border border-[#EFF1F5] text-xs font-mono min-h-[44px] sm:min-h-[36px]">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 stroke-[2.5]" />
                  <select
                    value={bookSortOrder}
                    onChange={(e) =>
                      setBookSortOrder(e.target.value as any)
                    }
                    className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">By Title</option>
                    <option value="topics">Most Topics</option>
                  </select>
                </div>

                {/* View Switcher: Grid vs Carousel */}
                <div className="inline-flex p-1 bg-zinc-100 rounded-xl border border-[#EFF1F5]/80">
                  <button
                    type="button"
                    onClick={() => setBooksViewMode("grid")}
                    className={`min-h-[44px] sm:min-h-[34px] px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      booksViewMode === "grid"
                        ? "bg-white text-slate-900 shadow-xs font-black border border-[#EFF1F5]/60"
                        : "text-zinc-600 hover:text-slate-900"
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Grid</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBooksViewMode("carousel")}
                    className={`min-h-[44px] sm:min-h-[34px] px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      booksViewMode === "carousel"
                        ? "bg-white text-slate-900 shadow-xs font-black border border-[#EFF1F5]/60"
                        : "text-zinc-600 hover:text-slate-900"
                    }`}
                    title="Carousel View"
                  >
                    <Film className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Carousel</span>
                  </button>
                </div>

                {/* Stepper for Books Carousel */}
                {booksViewMode === "carousel" && filteredBooks.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-[#F6F7FB] px-2.5 py-1 rounded-xl border border-[#EFF1F5] min-h-[44px] sm:min-h-[36px]">
                    <span className="text-[11px] font-mono font-black text-slate-900">
                      {Math.min(
                        currentBookHorizontalIndex + 1,
                        filteredBooks.length,
                      )}
                      /{filteredBooks.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleBooksHorizontalScroll("prev")}
                      disabled={currentBookHorizontalIndex === 0}
                      className="min-h-[44px] min-w-[44px] sm:min-h-[28px] sm:min-w-[28px] flex items-center justify-center p-1 rounded-lg hover:bg-zinc-200 text-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBooksHorizontalScroll("next")}
                      disabled={
                        currentBookHorizontalIndex >= filteredBooks.length - 1
                      }
                      className="min-h-[44px] min-w-[44px] sm:min-h-[28px] sm:min-w-[28px] flex items-center justify-center p-1 rounded-lg hover:bg-zinc-200 text-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Export Album Button for Slates */}
                <button
                  type="button"
                  onClick={handleBatchExportSnapshotsMarkdown}
                  className="min-h-[44px] sm:min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF2FF] hover:bg-indigo-100 border border-[#796AEF]/30 text-[#1E293B] text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs"
                  title="Export all blackboard derivations into a consolidated Markdown revision album"
                >
                  <Download className="w-3.5 h-3.5 text-[#796AEF]" />
                  <span>Export Album</span>
                </button>

                {/* View Switcher: Grid vs Carousel */}
                <div className="inline-flex p-1 bg-zinc-100 rounded-xl border border-[#EFF1F5]/80">
                  <button
                    type="button"
                    onClick={() => setSnapshotsViewMode("grid")}
                    className={`min-h-[44px] sm:min-h-[34px] px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      snapshotsViewMode === "grid"
                        ? "bg-white text-slate-900 shadow-xs font-black border border-[#EFF1F5]/60"
                        : "text-zinc-600 hover:text-slate-900"
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Grid</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSnapshotsViewMode("carousel")}
                    className={`min-h-[44px] sm:min-h-[34px] px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      snapshotsViewMode === "carousel"
                        ? "bg-white text-slate-900 shadow-xs font-black border border-[#EFF1F5]/60"
                        : "text-zinc-600 hover:text-slate-900"
                    }`}
                    title="Carousel View"
                  >
                    <Film className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Carousel</span>
                  </button>
                </div>

                {/* Stepper for Slates Carousel */}
                {snapshotsViewMode === "carousel" && filteredSnapshots.length > 1 && (
                  <div className="flex items-center gap-1.5 bg-[#F6F7FB] px-2.5 py-1 rounded-xl border border-[#EFF1F5] min-h-[44px] sm:min-h-[36px]">
                    <span className="text-[11px] font-mono font-black text-slate-900">
                      {currentSnapshotHorizontalIndex + 1}/{filteredSnapshots.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSnapshotHorizontalScroll("prev")}
                      disabled={currentSnapshotHorizontalIndex === 0}
                      className="min-h-[44px] min-w-[44px] sm:min-h-[28px] sm:min-w-[28px] flex items-center justify-center p-1 rounded-lg hover:bg-zinc-200 text-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSnapshotHorizontalScroll("next")}
                      disabled={
                        currentSnapshotHorizontalIndex >= filteredSnapshots.length - 1
                      }
                      className="min-h-[44px] min-w-[44px] sm:min-h-[28px] sm:min-w-[28px] flex items-center justify-center p-1 rounded-lg hover:bg-zinc-200 text-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom Row: Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-[#EFF1F5] pt-2">
          {bookHubActiveTab === "books" ? (
            <>
              <button
                type="button"
                onClick={() => setSelectedBookSubjectFilter("all")}
                className={`min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-xl font-mono text-[11.5px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                  selectedBookSubjectFilter === "all"
                    ? "bg-[#796AEF] text-white border-[#796AEF] shadow-xs font-black"
                    : "bg-[#F6F7FB] hover:bg-zinc-100 text-zinc-600 border-[#EFF1F5]"
                }`}
              >
                <span>📚</span>
                <span>All Books</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                    selectedBookSubjectFilter === "all"
                      ? "bg-white/20 text-white font-bold"
                      : "bg-zinc-200/60 text-zinc-600"
                  }`}
                >
                  {allBooks.length}
                </span>
              </button>

              {/* Starred Books Pill */}
              <button
                type="button"
                onClick={() =>
                  setSelectedBookSubjectFilter(
                    selectedBookSubjectFilter === "starred" ? "all" : "starred",
                  )
                }
                className={`min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-xl font-mono text-[11.5px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                  selectedBookSubjectFilter === "starred"
                    ? "bg-amber-500 text-white border-amber-500 shadow-xs font-black"
                    : "bg-[#F6F7FB] hover:bg-zinc-100 text-zinc-600 border-[#EFF1F5]"
                }`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    selectedBookSubjectFilter === "starred"
                      ? "fill-white text-white"
                      : "text-amber-500"
                  }`}
                />
                <span>Starred</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                    selectedBookSubjectFilter === "starred"
                      ? "bg-white/20 text-white"
                      : "bg-zinc-200/60 text-zinc-600"
                  }`}
                >
                  {Object.values(starredBookIds).filter(Boolean).length}
                </span>
              </button>

              {[
                { key: "Mathematics", label: "Math", icon: "📐", count: bookSubjectCounts.Mathematics || 0 },
                { key: "Physics", label: "Physics", icon: "⚡", count: bookSubjectCounts.Physics || 0 },
                { key: "Chemistry", label: "Chemistry", icon: "🧪", count: bookSubjectCounts.Chemistry || 0 },
                { key: "Biology", label: "Biology", icon: "🌱", count: bookSubjectCounts.Biology || 0 },
                { key: "Science", label: "Science", icon: "🔬", count: bookSubjectCounts.Science || 0 },
              ]
                .filter(
                  (s) =>
                    s.count > 0 ||
                    s.key.toLowerCase() === (subject || "").toLowerCase(),
                )
                .map((subj) => {
                  const isSelected =
                    selectedBookSubjectFilter.toLowerCase() === subj.key.toLowerCase();
                  return (
                    <button
                      key={subj.key}
                      type="button"
                      onClick={() => setSelectedBookSubjectFilter(subj.key)}
                      className={`min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-xl font-mono text-[11.5px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                        isSelected
                          ? "bg-[#796AEF] text-white border-[#796AEF] shadow-xs font-black"
                          : "bg-[#F6F7FB] hover:bg-zinc-100 text-zinc-600 border-[#EFF1F5]"
                      }`}
                    >
                      <span>{subj.icon}</span>
                      <span>{subj.label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                          isSelected
                            ? "bg-white/20 text-white font-bold"
                            : "bg-zinc-200/60 text-zinc-600"
                        }`}
                      >
                        {subj.count}
                      </span>
                    </button>
                  );
                })}
            </>
          ) : (
            <>
              {[
                { key: "all", label: "All Slates", icon: "📸", count: snapshotSubjectCounts.all || 0 },
                { key: "Mathematics", label: "Math", icon: "📐", count: snapshotSubjectCounts.Mathematics || 0 },
                { key: "Physics", label: "Physics", icon: "⚡", count: snapshotSubjectCounts.Physics || 0 },
                { key: "Chemistry", label: "Chemistry", icon: "🧪", count: snapshotSubjectCounts.Chemistry || 0 },
                { key: "Biology", label: "Biology", icon: "🌱", count: snapshotSubjectCounts.Biology || 0 },
                { key: "Science", label: "Science", icon: "🔬", count: snapshotSubjectCounts.Science || 0 },
                { key: "General", label: "General", icon: "📖", count: snapshotSubjectCounts.General || 0 },
              ]
                .filter(
                  (tab) =>
                    tab.key === "all" ||
                    tab.count > 0 ||
                    tab.key.toLowerCase() === (subject || "").toLowerCase(),
                )
                .map((tab) => {
                  const isSelected =
                    selectedSnapshotSubjectFilter.toLowerCase() === tab.key.toLowerCase();
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setSelectedSnapshotSubjectFilter(tab.key)}
                      className={`min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-xl font-mono text-[11.5px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                        isSelected
                          ? "bg-[#796AEF] text-white border-[#796AEF] shadow-xs font-black"
                          : "bg-[#F6F7FB] hover:bg-zinc-100 text-zinc-600 border-[#EFF1F5]"
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                          isSelected
                            ? "bg-white/20 text-white font-bold"
                            : "bg-zinc-200/60 text-zinc-600"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
            </>
          )}

          {/* Reset Filters Quick Button */}
          {((bookHubActiveTab === "books" &&
            (selectedBookSubjectFilter !== "all" || archiveSearchQuery)) ||
            (bookHubActiveTab === "slates" &&
              (selectedSnapshotSubjectFilter !== "all" || snapshotSearchQuery))) && (
            <button
              type="button"
              onClick={() => {
                if (bookHubActiveTab === "books") {
                  setSelectedBookSubjectFilter("all");
                  setArchiveSearchQuery("");
                } else {
                  setSelectedSnapshotSubjectFilter("all");
                  setSnapshotSearchQuery("");
                }
              }}
              className="min-h-[44px] sm:min-h-[36px] px-2.5 py-1.5 rounded-xl font-mono text-[11px] text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all shrink-0 cursor-pointer ml-auto flex items-center justify-center"
            >
              ✕ Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE VIEWPORT - CHAPTER BOOKS & BOARD SLATES */}
      {bookHubActiveTab === "books" ? (
        <div className="space-y-4 animate-fade-in pb-12">
          {allBooks && allBooks.length > 0 ? (
            filteredBooks.length === 0 ? (
              <div className="border border-dashed border-[#EFF1F5] rounded-2xl p-10 bg-[#F6F7FB]/60 text-center select-none space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#796AEF] border border-[#796AEF]/30 flex items-center justify-center text-xl mx-auto shadow-2xs">
                  📚
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-700">
                    No matching lecture books found
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {archiveSearchQuery
                      ? `No chapter books matched "${archiveSearchQuery}". Try clearing search or selecting a different subject filter.`
                      : "Try selecting a different subject tab to explore available board books."}
                  </p>
                </div>
                {(archiveSearchQuery || selectedBookSubjectFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setArchiveSearchQuery("");
                      setSelectedBookSubjectFilter("all");
                    }}
                    className="mt-2 min-h-[44px] sm:min-h-[38px] px-4 py-2 bg-[#796AEF] hover:bg-[#6857e8] text-white rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shadow-xs inline-flex items-center justify-center"
                  >
                    Reset All Filters & Show All Books
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBooks.map((book: any, idx: number) => {
                  const isStarred = !!starredBookIds[book.sessionId];
                  const theme = getSubjectBookTheme(book.inferredSubject || book.subject || subject);
                  const chaptersCount = book.topics?.length || 1;
                  const bookTitle = book.activeDocumentName || book.title || "Lecture Handbook";
                  return (
                    <div
                      key={book.sessionId || idx}
                      className="bg-white border border-[#EFF1F5]/90 rounded-2xl p-4.5 hover:shadow-md transition-all flex flex-col justify-between group relative space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-[#EEF2FF] border border-[#796AEF]/20 flex items-center justify-center text-base shrink-0">
                            {theme.icon || "📘"}
                          </span>
                          <div className="min-w-0">
                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#796AEF] bg-[#EEF2FF] px-2 py-0.5 rounded-md border border-[#796AEF]/20 inline-block truncate max-w-[140px]">
                              {theme.name || book.subject || subject}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                              {chaptersCount} {chaptersCount === 1 ? "Chapter" : "Chapters"}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => toggleStarBook(book.sessionId, e)}
                          className={`min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] flex items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isStarred
                              ? "text-amber-500 bg-amber-50"
                              : "text-slate-300 hover:text-slate-500 hover:bg-[#F6F7FB]"
                          }`}
                          title={isStarred ? "Unstar book" : "Star book"}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              isStarred ? "fill-amber-400 text-amber-500" : ""
                            }`}
                          />
                        </button>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#796AEF] transition-colors">
                          {bookTitle}
                        </h4>
                      </div>
                      <div className="pt-2 border-t border-[#EFF1F5] flex items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenBookReader(book)}
                          className="flex-1 min-h-[44px] sm:min-h-[38px] py-2 px-2.5 rounded-xl bg-[#796AEF] hover:bg-[#6857e8] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read Book</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onTriggerBookPodcast(book)}
                          disabled={generatingPodcastBookId === (book.sessionId || book.id || `book_${book.index || 0}`)}
                          className="min-h-[44px] sm:min-h-[38px] py-2 px-2.5 rounded-xl border border-[#796AEF]/30 bg-[#EEF2FF] text-[#796AEF] hover:bg-[#796AEF] hover:text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                          title="Listen to 2-Host Audio Podcast Recap"
                        >
                          {generatingPodcastBookId === (book.sessionId || book.id || `book_${book.index || 0}`) ? (
                            <Sparkles className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Headphones className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline">Podcast</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onExportSessionToPDF(book)}
                          className="min-h-[44px] sm:min-h-[38px] p-2.5 rounded-xl border border-[#EFF1F5] text-slate-600 hover:text-[#796AEF] hover:border-[#796AEF]/30 hover:bg-[#EEF2FF] transition-all cursor-pointer flex items-center justify-center"
                          title="Export as PDF Book"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="border border-dashed border-[#EFF1F5] rounded-2xl p-10 bg-[#F6F7FB]/60 text-center select-none space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#796AEF] border border-[#796AEF]/30 flex items-center justify-center text-xl mx-auto shadow-2xs">
                📖
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  No Lecture Books Yet
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  As you attend classes or review chalkboard topics with Cherry Ma'am, comprehensive study books are automatically compiled here.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in pb-12">
          {snapshots && snapshots.length > 0 ? (
            filteredSnapshots.length === 0 ? (
              <div className="border border-dashed border-[#EFF1F5] rounded-2xl p-10 bg-[#F6F7FB]/60 text-center select-none space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#796AEF] border border-[#796AEF]/30 flex items-center justify-center text-xl mx-auto shadow-2xs">
                  📸
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-700">
                    No matching board slates found
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {snapshotSearchQuery
                      ? `No snapshot matched "${snapshotSearchQuery}". Try clearing search.`
                      : "Try selecting a different subject tab."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSnapshots.map((snap: BoardSnapshot, idx: number) => (
                  <div
                    key={snap.id || snap.snapshotId || idx}
                    className="bg-white border border-[#EFF1F5]/90 rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    {snap.imgData ? (
                      <div
                        onClick={() => onOpenSnapshotModal(snap)}
                        className="w-full h-36 bg-slate-900 relative overflow-hidden cursor-pointer group-hover:opacity-95 transition-opacity"
                      >
                        <img
                          src={snap.imgData}
                          alt={snap.topicTitle || "Chalkboard snapshot"}
                          className="w-full h-full object-contain p-1.5"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold">
                          <Maximize2 className="w-4 h-4" />
                          <span>View Full Slide</span>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => onOpenSnapshotModal(snap)}
                        className="w-full h-36 bg-slate-900 flex items-center justify-center p-3 text-slate-400 text-xs font-mono cursor-pointer"
                      >
                        <span>📸 Chalkboard Slate</span>
                      </div>
                    )}
                    <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                          <span className="text-[10.5px] font-mono font-bold uppercase text-[#796AEF] bg-[#EEF2FF] px-2 py-0.5 rounded-md border border-[#796AEF]/20">
                            {snap.subject || subject || "Science"}
                          </span>
                          <span className="text-[10.5px] font-mono text-slate-400">
                            {snap.timestamp?.toDate
                              ? snap.timestamp.toDate().toLocaleDateString()
                              : "Recent"}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-[#796AEF] transition-colors">
                          {snap.topicTitle || "Blackboard Formulation"}
                        </h4>
                      </div>
                      <div className="pt-2 border-t border-[#EFF1F5] flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenSnapshotModal(snap)}
                          className="flex-1 min-h-[44px] sm:min-h-[38px] py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-[#EEF2FF] text-slate-700 hover:text-[#796AEF] border border-[#EFF1F5]/80 hover:border-[#796AEF]/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSnapshot(snap.id)}
                          className="min-h-[44px] sm:min-h-[38px] p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-[#EFF1F5]/80 hover:border-rose-200 transition-all cursor-pointer flex items-center justify-center"
                          title="Delete Snapshot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="border border-dashed border-[#EFF1F5] rounded-2xl p-10 bg-[#F6F7FB]/60 text-center select-none space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#796AEF] border border-[#796AEF]/30 flex items-center justify-center text-xl mx-auto shadow-2xs">
                📸
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  No Saved Chalkboard Slates Yet
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Tap the Camera icon during any classroom lecture to snapshot key formulas, blackboard diagrams, and study slates directly to your portfolio.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
