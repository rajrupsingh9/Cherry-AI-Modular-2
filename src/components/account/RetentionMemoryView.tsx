import React, { useState, useMemo } from "react";
import { Brain, CheckCircle, Hourglass, RotateCw, Sparkles, X, Zap } from "lucide-react";
import { renderKaTeXHtmlSafe } from "../../utils/whiteboardPdfCompiler";

export interface RetentionMemoryViewProps {
  subject: string;
  grade: string | number;
  studentName?: string;
  isEnglish?: boolean;
  onDiscussWithCherry?: (topicDetails: {
    topic: string;
    question?: string;
    answer?: string;
    hint?: string;
    conceptTested?: string;
    subject?: string;
  }) => void;
  onEnterClassroom?: () => void;
}

export const RetentionMemoryView: React.FC<RetentionMemoryViewProps> = ({
  subject,
  grade,
  studentName,
  isEnglish = false,
  onDiscussWithCherry,
  onEnterClassroom,
}) => {
  // Phase 2: Spaced Repetition & Retention States
  const [retentionFilterUrgency, setRetentionFilterUrgency] = useState<
    "all" | "critical" | "warning" | "stable"
  >("all");
  const [retentionActiveSubject, setRetentionActiveSubject] =
    useState<string>("all");
  const [retentionViewMode, setRetentionViewMode] = useState<
    "carousel" | "list"
  >("carousel");
  const [selectedRetentionFlashcard, setSelectedRetentionFlashcard] = useState<
    any | null
  >(null);
  const [activeFlashcardFlipped, setActiveFlashcardFlipped] =
    useState<boolean>(false);

  const retentionEngineData = useMemo(() => {
    // Current timestamp reference (in days)
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    // Subtopics catalog with realistic past study milestones
    const MEMORY_TRACKS: Array<{
      id: string;
      topicName: string;
      chapter: string;
      subject: string;
      initialStrength: number; // 0 - 100
      lastStudiedDaysAgo: number;
      repetitionCount: number; // 1, 2, 3, 4+
      halfLifeDays: number; // Stability S in Ebbinghaus R = e^(-t/S)
      keyPoints: string[];
      flashcardPrompt: string;
      flashcardAnswer: string;
      formulaKatex?: string;
    }> = [
      {
        id: "eb-quad",
        topicName: "Quadratic Equations: Discriminant & Nature of Roots",
        chapter: "Quadratic Equations",
        subject: "Mathematics",
        initialStrength: 90,
        lastStudiedDaysAgo: 8,
        repetitionCount: 2,
        halfLifeDays: 5.5,
        keyPoints: [
          "D > 0: Two distinct real roots",
          "D = 0: Real and equal roots (x = -b / 2a)",
          "D < 0: Complex conjugate roots",
        ],
        flashcardPrompt:
          "What is the condition for equal roots in ax² + bx + c = 0, and what are the roots?",
        flashcardAnswer:
          "Discriminant D = b² - 4ac = 0. The equal roots are given by x = -b / (2a).",
        formulaKatex: "D = b^2 - 4ac \\ge 0",
      },
      {
        id: "eb-trig",
        topicName: "Trigonometric Compound Angles & Identites",
        chapter: "Trigonometry",
        subject: "Mathematics",
        initialStrength: 85,
        lastStudiedDaysAgo: 14,
        repetitionCount: 1,
        halfLifeDays: 4.0,
        keyPoints: [
          "sin(A ± B) = sin A cos B ± cos A sin B",
          "cos(A ± B) = cos A cos B ∓ sin A sin B",
          "tan(A + B) = (tan A + tan B) / (1 - tan A tan B)",
        ],
        flashcardPrompt: "State the expansion of cos(A + B) and cos(A - B).",
        flashcardAnswer:
          "cos(A + B) = cos A cos B - sin A sin B, and cos(A - B) = cos A cos B + sin A sin B (sign flips).",
        formulaKatex: "\\cos(A \\pm B) = \\cos A \\cos B \\mp \\sin A \\sin B",
      },
      {
        id: "eb-calc",
        topicName: "Definite Integrals & Fundamental Theorem of Calculus",
        chapter: "Calculus",
        subject: "Mathematics",
        initialStrength: 95,
        lastStudiedDaysAgo: 2,
        repetitionCount: 3,
        halfLifeDays: 12.0,
        keyPoints: [
          "∫_a^b f(x) dx = F(b) - F(a)",
          "King's Property: ∫_0^a f(x)dx = ∫_0^a f(a - x)dx",
          "Odd function symmetry: ∫_-a^a f(x)dx = 0 if f(-x) = -f(x)",
        ],
        flashcardPrompt:
          "State King's Property of definite integrals for ∫_0^a f(x) dx.",
        flashcardAnswer:
          "∫_0^a f(x) dx = ∫_0^a f(a - x) dx. This is extremely useful for evaluating trigonometric fractions.",
        formulaKatex: "\\int_0^a f(x)\\,dx = \\int_0^a f(a - x)\\,dx",
      },
      {
        id: "eb-kin",
        topicName: "Projectile Motion: Time of Flight & Maximum Height",
        chapter: "Kinematics",
        subject: "Physics",
        initialStrength: 92,
        lastStudiedDaysAgo: 11,
        repetitionCount: 2,
        halfLifeDays: 6.0,
        keyPoints: [
          "Time of Flight T = (2u sin θ) / g",
          "Maximum Height H = (u² sin² θ) / (2g)",
          "Horizontal Range R = (u² sin 2θ) / g",
        ],
        flashcardPrompt:
          "What angle of projection yields the maximum horizontal range on flat ground?",
        flashcardAnswer:
          "θ = 45° yields maximum range R_max = u² / g because sin(2 * 45°) = sin(90°) = 1.",
        formulaKatex:
          "R_{max} = \\frac{u^2}{g} \\quad (\\text{at } \\theta = 45^\\circ)",
      },
      {
        id: "eb-kirch",
        topicName:
          "Current Electricity: Kirchhoff's Mesh Rules & Wheatstone Bridge",
        chapter: "Current Electricity",
        subject: "Physics",
        initialStrength: 80,
        lastStudiedDaysAgo: 18,
        repetitionCount: 1,
        halfLifeDays: 3.8,
        keyPoints: [
          "KCL (Junction Rule): Conservation of electric charge (∑ I = 0)",
          "KVL (Loop Rule): Conservation of energy (∑ ΔV = 0)",
          "Balanced Wheatstone Bridge: P / Q = R / S => Galvanometer current = 0",
        ],
        flashcardPrompt:
          "Which conservation law underpins Kirchhoff's First Law (KCL) and Second Law (KVL)?",
        flashcardAnswer:
          "KCL is based on the Law of Conservation of Charge; KVL is based on the Law of Conservation of Energy.",
        formulaKatex: "\\frac{P}{Q} = \\frac{R}{S} \\implies I_g = 0",
      },
      {
        id: "eb-optics",
        topicName: "Ray Optics: Total Internal Reflection & Snell's Law",
        chapter: "Optics",
        subject: "Physics",
        initialStrength: 88,
        lastStudiedDaysAgo: 4,
        repetitionCount: 3,
        halfLifeDays: 14.0,
        keyPoints: [
          "Snell's Law: n1 sin θ1 = n2 sin θ2",
          "Critical Angle condition: sin θ_c = n2 / n1 (where n1 > n2)",
          "TIR occurs when light travels from denser to rarer medium at angle > θ_c",
        ],
        flashcardPrompt:
          "What are the two mandatory conditions for Total Internal Reflection (TIR) to occur?",
        flashcardAnswer:
          "1. Light must travel from a denser optical medium to a rarer medium. 2. Angle of incidence must exceed the critical angle (i > c).",
        formulaKatex:
          "\\sin \\theta_c = \\frac{n_{\\text{rare}}}{n_{\\text{dense}}}",
      },
      {
        id: "eb-chem-bond",
        topicName: "Chemical Bonding: Hybridization & Molecular Orbital Theory",
        chapter: "Chemical Bonding",
        subject: "Chemistry",
        initialStrength: 84,
        lastStudiedDaysAgo: 21,
        repetitionCount: 1,
        halfLifeDays: 3.5,
        keyPoints: [
          "Bond Order = 0.5 * (N_b - N_a)",
          "Paramagnetism occurs when unpaired electrons exist in MOs (e.g. O2)",
          "Diamagnetic species have all paired electrons (e.g. N2)",
        ],
        flashcardPrompt:
          "Why is the Oxygen molecule (O2) paramagnetic according to MOT?",
        flashcardAnswer:
          "O2 has 16 electrons, resulting in 2 unpaired electrons in degenerate antibonding π*2px and π*2py orbitals.",
        formulaKatex: "\\text{Bond Order} = \\frac{N_b - N_a}{2}",
      },
      {
        id: "eb-chem-thermo",
        topicName: "Thermodynamics: Enthalpy, Entropy & Spontaneity",
        chapter: "Thermodynamics",
        subject: "Chemistry",
        initialStrength: 86,
        lastStudiedDaysAgo: 6,
        repetitionCount: 2,
        halfLifeDays: 7.0,
        keyPoints: [
          "ΔG = ΔH - TΔS",
          "ΔG < 0: Strictly spontaneous process",
          "ΔG = 0: Dynamic chemical equilibrium",
        ],
        flashcardPrompt:
          "At what temperature does a non-spontaneous endothermic reaction (ΔH > 0, ΔS > 0) become spontaneous?",
        flashcardAnswer:
          "When temperature T > (ΔH / ΔS), the -TΔS term dominates and makes ΔG negative (< 0).",
        formulaKatex:
          "\\Delta G^\\circ = \\Delta H^\\circ - T\\Delta S^\\circ < 0",
      },
      {
        id: "eb-bio-gen",
        topicName: "Genetics: Mendelian Inheritance & Chromosomal Mapping",
        chapter: "Genetics",
        subject: "Biology",
        initialStrength: 88,
        lastStudiedDaysAgo: 16,
        repetitionCount: 1,
        halfLifeDays: 4.2,
        keyPoints: [
          "Law of Segregation: Alleles separate during gamete formation",
          "Law of Independent Assortment: Dihybrid 9:3:3:1 ratio",
          "Linkage violates independent assortment (discovered by Morgan in Drosophila)",
        ],
        flashcardPrompt:
          "Why does genetic linkage deviate from Mendel's Law of Independent Assortment?",
        flashcardAnswer:
          "Linked genes sit close together on the same chromosome and tend to be inherited together without recombining.",
        formulaKatex:
          "\\text{Recombination Freq} = \\frac{\\text{Recombinant Offspring}}{\\text{Total Offspring}} \\times 100",
      },
    ];

    // Compute retention decay scores using Ebbinghaus Model: R = S0 * e^(-t / S)
    const computedItems = MEMORY_TRACKS.map((item) => {
      // Time t in days
      const t = item.lastStudiedDaysAgo;
      // Exponential decay: R = initial * exp(-t / halfLife)
      const retentionDecimal = Math.exp(-t / item.halfLifeDays);
      const currentRetentionPercent = Math.max(
        12,
        Math.min(100, Math.round(item.initialStrength * retentionDecimal)),
      );

      // Next optimal review day according to Leitner schedule (1, 3, 7, 14, 30 days)
      const reviewIntervals = [1, 3, 7, 14, 30];
      const nextReviewDays =
        reviewIntervals[
          Math.min(reviewIntervals.length - 1, item.repetitionCount)
        ];
      const daysOverdue = Math.max(0, t - nextReviewDays);

      // Urgency Classification
      let urgency: "critical" | "warning" | "stable" = "stable";
      let urgencyLabel = "Optimal Retention";
      let urgencyColor = "text-emerald-700 bg-emerald-50 border-emerald-200";

      if (currentRetentionPercent < 50 || daysOverdue >= 5) {
        urgency = "critical";
        urgencyLabel = "Immediate Revision Due";
        urgencyColor = "text-rose-700 bg-rose-50 border-rose-200";
      } else if (currentRetentionPercent < 72 || daysOverdue > 0) {
        urgency = "warning";
        urgencyLabel = "Decaying (Review Soon)";
        urgencyColor = "text-amber-700 bg-amber-50 border-amber-200";
      }

      // Memory Curve Projection Points: Day 0, Day 1, Day 3, Day 7, Day 14, Day 30
      const curveTimeline = [
        { day: 0, r: 100 },
        { day: 1, r: Math.round(100 * Math.exp(-1 / item.halfLifeDays)) },
        { day: 3, r: Math.round(100 * Math.exp(-3 / item.halfLifeDays)) },
        { day: 7, r: Math.round(100 * Math.exp(-7 / item.halfLifeDays)) },
        { day: 14, r: Math.round(100 * Math.exp(-14 / item.halfLifeDays)) },
        { day: 30, r: Math.round(100 * Math.exp(-30 / item.halfLifeDays)) },
      ];

      return {
        ...item,
        currentRetention: currentRetentionPercent,
        daysOverdue,
        nextReviewDays,
        urgency,
        urgencyLabel,
        urgencyColor,
        curveTimeline,
      };
    });

    // Filter by subject and urgency
    const filtered = computedItems.filter((item) => {
      if (
        retentionActiveSubject !== "all" &&
        item.subject.toLowerCase() !== retentionActiveSubject.toLowerCase()
      ) {
        return false;
      }
      if (
        retentionFilterUrgency !== "all" &&
        item.urgency !== retentionFilterUrgency
      ) {
        return false;
      }
      return true;
    });

    const criticalCount = computedItems.filter(
      (i) => i.urgency === "critical",
    ).length;
    const warningCount = computedItems.filter(
      (i) => i.urgency === "warning",
    ).length;
    const stableCount = computedItems.filter(
      (i) => i.urgency === "stable",
    ).length;
    const avgRetention = Math.round(
      computedItems.reduce((acc, i) => acc + i.currentRetention, 0) /
        computedItems.length,
    );

    return {
      items: filtered,
      allItems: computedItems,
      criticalCount,
      warningCount,
      stableCount,
      avgRetention,
    };
  }, [retentionFilterUrgency, retentionActiveSubject]);



  return (
                  <div className="space-y-4 sm:space-y-5 animate-fade-in text-left">
                    {/* Hero Header for Retention */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 text-slate-900 shadow-xs relative overflow-hidden space-y-4">
                      <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-50/60 rounded-full blur-3xl pointer-events-none" />

                      {/* Top Info Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 z-10 relative">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#796AEF] border border-indigo-100/90 text-[11px] font-bold shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#796AEF] animate-pulse" />
                              Spaced Repetition Engine
                            </span>
                            <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200/70">
                              Algorithm: <strong className="text-slate-800">Ebbinghaus R = e^(-t/S)</strong>
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                            {studentName
                              ? `${studentName}'s Memory Decay & Spaced Repetition Radar`
                              : "Memory Decay & Spaced Repetition Radar"}
                          </h3>
                          <p className="text-xs text-slate-600 font-sans leading-relaxed max-w-2xl">
                            Scientifically schedules chalkboard flashcard reviews at Day 1, 3, 7, 14, and 30 intervals to reset memory decay back to 100%.
                          </p>
                        </div>
                      </div>

                      {/* 4 Summary Metrics - 2x2 Grid on Mobile, 4x1 on Desktop */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 z-10 relative pt-0.5">
                        <div className="bg-slate-50/90 border border-slate-200/70 rounded-xl p-2.5 sm:p-3 text-center transition-all hover:bg-white hover:shadow-2xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            {isEnglish ? "Avg Retention" : "औसत याददाश्त • Memory"}
                          </span>
                          <span className="text-lg sm:text-xl font-black text-slate-900 font-mono block my-0.5">
                            {retentionEngineData.avgRetention}%
                          </span>
                          <span className="text-[10.5px] text-slate-600 font-medium block">
                            {isEnglish ? "Across All Topics" : "समग्र विषयों की स्थिति"}
                          </span>
                        </div>

                        <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-2.5 sm:p-3 text-center transition-all hover:bg-rose-50 hover:shadow-2xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                            {isEnglish ? "Due for Revision" : "आज रिवीज़न ज़रूरी • Due"}
                          </span>
                          <span className="text-lg sm:text-xl font-black text-rose-700 font-mono block my-0.5">
                            {retentionEngineData.criticalCount}
                          </span>
                          <span className="text-[10.5px] text-rose-700 font-semibold block">
                            {isEnglish ? "<50% (High Decay Risk)" : "<50% (भूलने का जोखिम)"}
                          </span>
                        </div>

                        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 sm:p-3 text-center transition-all hover:bg-amber-50 hover:shadow-2xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                            {isEnglish ? "Review Soon" : "जल्द दोहराएं • Soon"}
                          </span>
                          <span className="text-lg sm:text-xl font-black text-amber-800 font-mono block my-0.5">
                            {retentionEngineData.warningCount}
                          </span>
                          <span className="text-[10.5px] text-amber-800 font-semibold block">
                            {isEnglish ? "50–72% (Moderate Retention)" : "50–72% (मध्यम स्तर)"}
                          </span>
                        </div>

                        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 sm:p-3 text-center transition-all hover:bg-emerald-50 hover:shadow-2xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                            {isEnglish ? "Optimal Retention" : "पक्की याददाश्त • Optimal"}
                          </span>
                          <span className="text-lg sm:text-xl font-black text-emerald-800 font-mono block my-0.5">
                            {retentionEngineData.stableCount}
                          </span>
                          <span className="text-[10.5px] text-emerald-800 font-semibold block">
                            {isEnglish ? "73%+ (Long-Term Retained)" : "73%+ (दीर्घकालिक सुरक्षित)"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 1: INTERACTIVE EBBINGHAUS RETENTION CURVE VISUALIZER */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 gap-2">
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-[#796AEF] border border-indigo-100/90 flex items-center justify-center shrink-0 text-xs shadow-2xs">
                              📈
                            </span>
                            <span>{isEnglish ? "The Science of Spaced Repetition • Ebbinghaus Forgetting Curve" : "The Science of Spaced Repetition • विस्मृति वक्र व वैज्ञानिक दोहराव"}</span>
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {isEnglish ? "Without spaced reviews, retention drops by up to 70% in 7 days. A timely 3-minute flashcard session resets recall back to 100%." : "बिना रिवीज़न 7 दिनों में 70% तक विस्मृति हो जाती है। समय पर 3-मिनट फ्लैशकार्ड रिवीज़न से याददाश्त 100% पर रीसेट हो जाती है।"}
                          </p>
                        </div>
                        <span className="text-[10.5px] font-mono font-bold text-[#796AEF] bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/80 shrink-0 self-start sm:self-auto shadow-2xs">
                          🧠 Leitner Spacing Active
                        </span>
                      </div>

                      {/* SVG Interactive Forgetting Curve Comparison Graphic */}
                      <div className="bg-slate-50/90 border border-slate-200/70 rounded-xl p-3.5 sm:p-5 text-slate-900 relative overflow-hidden shadow-2xs">
                        <div className="flex flex-wrap items-center justify-between mb-3 text-xs font-mono gap-2">
                          <span className="text-rose-600 font-bold flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                            Single Lecture (Fast Decay)
                          </span>
                          <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                            Spaced Repetition (Reinforced Memory)
                          </span>
                        </div>

                        {/* Responsive SVG Chart */}
                        <div className="w-full h-44 sm:h-52 relative">
                          <svg
                            className="w-full h-full overflow-visible"
                            viewBox="0 0 500 160"
                            preserveAspectRatio="none"
                          >
                            {/* Grid Lines */}
                            <line
                              x1="40"
                              y1="20"
                              x2="480"
                              y2="20"
                              stroke="#E2E8F0"
                              strokeDasharray="3 3"
                              strokeWidth="0.8"
                            />
                            <line
                              x1="40"
                              y1="55"
                              x2="480"
                              y2="55"
                              stroke="#E2E8F0"
                              strokeDasharray="3 3"
                              strokeWidth="0.8"
                            />
                            <line
                              x1="40"
                              y1="90"
                              x2="480"
                              y2="90"
                              stroke="#E2E8F0"
                              strokeDasharray="3 3"
                              strokeWidth="0.8"
                            />
                            <line
                              x1="40"
                              y1="125"
                              x2="480"
                              y2="125"
                              stroke="#E2E8F0"
                              strokeDasharray="3 3"
                              strokeWidth="0.8"
                            />

                            {/* Y Axis Labels */}
                            <text
                              x="5"
                              y="24"
                              fill="#64748B"
                              fontSize="9.5"
                              fontFamily="monospace"
                            >
                              100%
                            </text>
                            <text
                              x="12"
                              y="59"
                              fill="#64748B"
                              fontSize="9.5"
                              fontFamily="monospace"
                            >
                              75%
                            </text>
                            <text
                              x="12"
                              y="94"
                              fill="#64748B"
                              fontSize="9.5"
                              fontFamily="monospace"
                            >
                              50%
                            </text>
                            <text
                              x="12"
                              y="129"
                              fill="#64748B"
                              fontSize="9.5"
                              fontFamily="monospace"
                            >
                              25%
                            </text>

                            {/* X Axis Labels */}
                            <text
                              x="40"
                              y="152"
                              fill="#64748B"
                              fontSize="9.5"
                              fontFamily="monospace"
                            >
                              Day 0
                            </text>
                            <text
                              x="110"
                              y="152"
                              fill="#64748B"
                              fontSize="9.5"
                              fontFamily="monospace"
                            >
                              Day 1
                            </text>
                            <text
                              x="190"
                              y="152"
                              fill="#64748B"
                              fontSize="9.5"
                              fontFamily="monospace"
                            >
                              Day 3
                            </text>
                            <text
                              x="270"
                              y="152"
                              fill="#64748B"
                              fontSize="9.5"
                              fontFamily="monospace"
                            >
                              Day 7
                            </text>
                            <text
                              x="360"
                              y="152"
                              fill="#64748B"
                              fontSize="9.5"
                              fontFamily="monospace"
                            >
                              Day 14
                            </text>
                            <text
                              x="450"
                              y="152"
                              fill="#64748B"
                              fontSize="9.5"
                              fontFamily="monospace"
                            >
                              Day 30
                            </text>

                            {/* Curve 1: Rapid Decay without review (Rose) */}
                            <path
                              d="M 40 20 Q 120 100 270 120 T 480 135"
                              fill="none"
                              stroke="#f43f5e"
                              strokeWidth="3"
                              strokeDasharray="4 2"
                            />

                            {/* Curve 2: Spaced Repetition (Reinforced Peaks - Emerald) */}
                            {/* Peak 1: Day 1 Review */}
                            <path
                              d="M 40 20 Q 80 50 110 65 L 110 20 Q 150 45 190 55 L 190 20 Q 230 35 270 42 L 270 20 Q 320 30 360 35 L 360 20 Q 420 25 480 28"
                              fill="none"
                              stroke="#10B981"
                              strokeWidth="3"
                            />

                            {/* Key Review Nodes with Pulsing Glow */}
                            <circle cx="110" cy="20" r="4" fill="#10B981" />
                            <circle cx="190" cy="20" r="4" fill="#10B981" />
                            <circle cx="270" cy="20" r="4" fill="#10B981" />
                            <circle cx="360" cy="20" r="4" fill="#10B981" />

                            {/* Annotations */}
                            <text
                              x="115"
                              y="14"
                              fill="#796AEF"
                              fontSize="9"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              1st Review
                            </text>
                            <text
                              x="195"
                              y="14"
                              fill="#796AEF"
                              fontSize="9"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              2nd
                            </text>
                            <text
                              x="275"
                              y="14"
                              fill="#796AEF"
                              fontSize="9"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              3rd
                            </text>
                            <text
                              x="365"
                              y="14"
                              fill="#796AEF"
                              fontSize="9"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              4th (Mastered)
                            </text>
                          </svg>
                        </div>

                        <div className="mt-3 text-[11px] text-slate-600 font-mono flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/70 pt-2.5">
                          <span className="flex items-center gap-1.5">
                            <span className="text-slate-400">💡</span> Current Retention:{" "}
                            <strong className="text-slate-900 font-bold">
                              {retentionEngineData.avgRetention}%
                            </strong>{" "}
                            Across All Subjects
                          </span>
                          <span className="text-[#796AEF] font-bold">
                            Recommended Review:{" "}
                            <strong className="underline decoration-[#796AEF]/40 underline-offset-2">
                              {retentionEngineData.criticalCount} Topics Due Today
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: TOPICS DECAY RADAR & REVISION SCHEDULER */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 text-left">
                      {/* Filter Bar with Mobile Carousel/Grid Mode Toggle */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-slate-200/80">
                        <div className="flex items-center justify-between w-full lg:w-auto">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-[#796AEF] border border-indigo-100/90 flex items-center justify-center shrink-0 shadow-2xs">
                              <Hourglass className="w-3.5 h-3.5" />
                            </span>
                            <div>
                              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900">
                                Spaced Review Queue (
                                {retentionEngineData.items.length})
                              </h4>
                              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                                Reinforce key formulas &amp; definitions before memory fades
                              </span>
                            </div>
                          </div>

                          {/* View Mode Toggle */}
                          <div className="flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/80 shrink-0">
                            <button
                              type="button"
                              onClick={() => setRetentionViewMode("carousel")}
                              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                                retentionViewMode === "carousel"
                                  ? "bg-[#796AEF] text-white shadow-2xs font-bold"
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                              title="Horizontal Swipe Deck"
                            >
                              🎴 Deck
                            </button>
                            <button
                              type="button"
                              onClick={() => setRetentionViewMode("list")}
                              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                                retentionViewMode === "list"
                                  ? "bg-[#796AEF] text-white shadow-2xs font-bold"
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                              title="Grid List"
                            >
                              📋 Grid
                            </button>
                          </div>
                        </div>

                        {/* Subject Filter Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                          {[
                            "all",
                            "Mathematics",
                            "Physics",
                            "Chemistry",
                            "Biology",
                          ].map((subj) => (
                            <button
                              key={subj}
                              type="button"
                              onClick={() => setRetentionActiveSubject(subj)}
                              className={`px-3 py-1 rounded-xl text-[10.5px] font-mono font-bold transition-all cursor-pointer shrink-0 border ${
                                retentionActiveSubject === subj
                                  ? "bg-[#796AEF] text-white border-[#796AEF] shadow-2xs font-black"
                                  : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900"
                              }`}
                            >
                              {subj === "all" ? "🌐 All Subjects" : subj}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Urgency Filter Tabs */}
                      <div className="flex flex-wrap items-center gap-2">
                        {[
                          {
                            key: "all",
                            label: "All Topics",
                            count: retentionEngineData.allItems.length,
                          },
                          {
                            key: "critical",
                            label: "🔴 Due Today (<50%)",
                            count: retentionEngineData.criticalCount,
                          },
                          {
                            key: "warning",
                            label: "🟡 Review Soon (50-72%)",
                            count: retentionEngineData.warningCount,
                          },
                          {
                            key: "stable",
                            label: "🟢 Stable (73%+)",
                            count: retentionEngineData.stableCount,
                          },
                        ].map((tab) => (
                          <button
                            key={tab.key}
                            type="button"
                            onClick={() =>
                              setRetentionFilterUrgency(tab.key as any)
                            }
                            className={`px-3 py-1 rounded-xl text-[10.5px] font-mono font-bold transition-all cursor-pointer shrink-0 border ${
                              retentionFilterUrgency === tab.key
                                ? "bg-[#796AEF] text-white border-[#796AEF] shadow-2xs font-black"
                                : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-white"
                            }`}
                          >
                            <span>{tab.label}</span>
                            <span className="ml-1 text-[10px] opacity-90">
                              ({tab.count})
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Repetition Queue Cards (Swipe Deck vs Grid) */}
                      {retentionEngineData.items.length > 0 ? (
                        <>
                          {retentionViewMode === "carousel" && (
                            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 font-semibold px-1 pb-0.5">
                              <span>
                                ← Swipe Repetition Cards ({retentionEngineData.items.length} topics) →
                              </span>
                              <span>Touch &amp; Drag</span>
                            </div>
                          )}
                          <div
                            className={
                              retentionViewMode === "carousel"
                                ? "flex overflow-x-auto gap-3.5 pb-3 pt-0.5 snap-x snap-mandatory scrollbar-thin"
                                : "grid grid-cols-1 md:grid-cols-2 gap-3.5"
                            }
                          >
                            {retentionEngineData.items.map((item) => {
                              const isCritical = item.urgency === "critical";
                              const isStable = item.urgency === "stable";

                              return (
                                <div
                                  key={item.id}
                                  className={`rounded-2xl border p-4 transition-all flex flex-col justify-between space-y-3 relative overflow-hidden bg-white shadow-2xs hover:shadow-xs ${
                                    retentionViewMode === "carousel"
                                      ? "w-[85vw] sm:w-[360px] shrink-0 snap-center"
                                      : ""
                                  } ${
                                    isCritical
                                      ? "border-rose-200/90 hover:border-rose-300"
                                      : isStable
                                        ? "border-emerald-200/90 hover:border-emerald-300"
                                        : "border-amber-200/90 hover:border-amber-300"
                                  }`}
                                >
                                  {/* Header */}
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/70 shrink-0">
                                          {item.subject}
                                        </span>
                                        <span className="text-[10.5px] font-mono text-slate-500 font-bold truncate">
                                          • {item.chapter}
                                        </span>
                                      </div>

                                      {/* Urgency Badge */}
                                      <span
                                        className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md border shrink-0 ${
                                          isCritical
                                            ? "bg-rose-50 text-rose-700 border-rose-200"
                                            : isStable
                                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                              : "bg-amber-50 text-amber-700 border-amber-200"
                                        }`}
                                      >
                                        {item.urgencyLabel}
                                      </span>
                                    </div>

                                    <h5 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-snug">
                                      {item.topicName}
                                    </h5>
                                  </div>

                                  {/* Retention Meter & Spaced Intervals */}
                                  <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/70 space-y-1.5">
                                    <div className="flex items-center justify-between text-[10.5px] font-mono">
                                      <span className="text-slate-500 font-bold">
                                        Estimated Retention:
                                      </span>
                                      <strong
                                        className={`font-black ${isCritical ? "text-rose-600" : isStable ? "text-emerald-700" : "text-amber-600"}`}
                                      >
                                        {item.currentRetention}%
                                      </strong>
                                    </div>

                                    <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${
                                          isCritical
                                            ? "bg-rose-500"
                                            : isStable
                                              ? "bg-emerald-500"
                                              : "bg-amber-500"
                                        }`}
                                        style={{
                                          width: `${item.currentRetention}%`,
                                        }}
                                      />
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200/60 font-medium">
                                      <span>
                                        Studied: <strong className="text-slate-700">{item.lastStudiedDaysAgo}d ago</strong>
                                      </span>
                                      <span>
                                        Repetition: <strong className="text-slate-700">{item.repetitionCount}/5</strong>
                                      </span>
                                      <span>
                                        Next: <strong className="text-slate-700">Day {item.nextReviewDays}</strong>
                                      </span>
                                    </div>
                                  </div>

                                  {/* KaTeX Formula preview if available */}
                                  {item.formulaKatex && (
                                    <div className="bg-amber-50/60 text-slate-800 p-2.5 rounded-xl border border-amber-200/60 text-[11px] font-mono overflow-x-auto shadow-2xs">
                                      <div className="text-[9px] font-mono text-amber-800 font-bold uppercase tracking-widest mb-0.5">
                                        ⚡ Core Formula Anchor
                                      </div>
                                      <span
                                        dangerouslySetInnerHTML={{
                                          __html: renderKaTeXHtmlSafe(
                                            item.formulaKatex,
                                          ),
                                        }}
                                      />
                                    </div>
                                  )}

                                  {/* Key Points Checklist */}
                                  <div className="space-y-1 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 text-[11px] text-slate-700">
                                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                                      📌 Core Memory Anchors
                                    </span>
                                    {item.keyPoints
                                      .slice(0, 2)
                                      .map((kp, kpIdx) => (
                                        <div
                                          key={kpIdx}
                                          className="flex items-start gap-1.5"
                                        >
                                          <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                                          <span className="leading-snug">{kp}</span>
                                        </div>
                                      ))}
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/70">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveFlashcardFlipped(false);
                                        setSelectedRetentionFlashcard(item);
                                      }}
                                      className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50/80 text-slate-700 hover:text-[#796AEF] border border-slate-200/80 hover:border-indigo-200/80 text-[11px] font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                                    >
                                      <Brain className="w-3.5 h-3.5 text-indigo-500" />
                                      <span>{isEnglish ? "Flashcard" : "फ्लैशकार्ड"}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (onDiscussWithCherry) {
                                          onDiscussWithCherry({
                                            topic: item.topicName,
                                            subject: item.subject,
                                            conceptTested: item.topicName,
                                            hint: item.flashcardAnswer,
                                            question: `Cherry Ma'am, please give me a quick 3-minute spaced-repetition memory booster on ${item.topicName} on the blackboard!`,
                                          });
                                        } else if (onEnterClassroom) {
                                          onEnterClassroom();
                                        }
                                      }}
                                      className="min-h-[44px] px-3 py-2 rounded-xl bg-[#796AEF] hover:bg-indigo-700 text-white text-[11px] font-bold tracking-wide font-mono transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                                    >
                                      <Sparkles className="w-3.5 h-3.5 text-white" />
                                      <span>{isEnglish ? "Start Revision 🚀" : "रिवीज़न शुरू 🚀"}</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="p-8 text-center bg-slate-50/90 rounded-2xl border border-dashed border-slate-200/80 space-y-2">
                          <p className="text-xs text-slate-500 font-medium">
                            No review topics found for this filter.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setRetentionActiveSubject("all");
                              setRetentionFilterUrgency("all");
                            }}
                            className="text-[11px] font-mono font-bold text-[#796AEF] hover:underline cursor-pointer"
                          >
                            Reset Filters
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Interactive Chalkboard Flashcard Modal */}
                    {selectedRetentionFlashcard && (
                      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
                        <div className="bg-white border border-slate-200/80 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden text-left text-slate-900">
                          {/* Modal Header */}
                          <div className="px-5 py-4 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0">
                            <div className="space-y-0.5 min-w-0 pr-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-indigo-50 text-[#796AEF] border border-indigo-100/90 px-2 py-0.5 rounded-md shadow-2xs">
                                  {selectedRetentionFlashcard.subject} • Flashcard
                                </span>
                                <span className="text-[10.5px] font-mono text-slate-500">
                                  Retention:{" "}
                                  <strong className="text-slate-900 font-bold">
                                    {selectedRetentionFlashcard.currentRetention}%
                                  </strong>
                                </span>
                              </div>
                              <h3 className="text-sm font-black text-slate-900 truncate">
                                {selectedRetentionFlashcard.topicName}
                              </h3>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedRetentionFlashcard(null)
                              }
                              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Flashcard Body */}
                          <div className="p-5 sm:p-6 flex flex-col items-center justify-center text-center space-y-3">
                            <div
                              onClick={() =>
                                setActiveFlashcardFlipped(
                                  !activeFlashcardFlipped,
                                )
                              }
                              className="w-full bg-slate-50/90 border border-slate-200/80 hover:border-[#796AEF]/60 rounded-2xl p-5 sm:p-6 transition-all cursor-pointer shadow-2xs space-y-3 relative group"
                            >
                              <div className="text-[10px] font-mono text-[#796AEF] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                                <RotateCw className="w-3 h-3 animate-spin-slow" />
                                <span>
                                  {activeFlashcardFlipped
                                    ? (isEnglish ? "Answer & Explanation (Tap)" : "उत्तर व व्याख्या • Answer (टैप करें)")
                                    : (isEnglish ? "Question Prompt (Tap to reveal solution)" : "प्रश्न / संकेत • Prompt (टैप करके समाधान देखें)")}
                                </span>
                              </div>

                              {!activeFlashcardFlipped ? (
                                <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed py-2">
                                  {selectedRetentionFlashcard.flashcardPrompt}
                                </p>
                              ) : (
                                <div className="space-y-3 animate-fade-in text-left py-1">
                                  <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                                    {selectedRetentionFlashcard.flashcardAnswer}
                                  </p>
                                  {selectedRetentionFlashcard.formulaKatex && (
                                    <div className="p-3 bg-white rounded-xl border border-indigo-100 text-center font-mono text-slate-900 shadow-2xs">
                                      <span
                                        dangerouslySetInnerHTML={{
                                          __html: renderKaTeXHtmlSafe(
                                            selectedRetentionFlashcard.formulaKatex,
                                          ),
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="text-[10.5px] font-mono text-slate-500 pt-1 font-medium">
                                💡 Active recall strengthens neural retention 3x faster.
                              </div>
                            </div>
                          </div>

                          {/* Modal Footer */}
                          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedRetentionFlashcard(null)
                              }
                              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                            >
                              {isEnglish ? "Close" : "बंद करें (Close)"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const card = selectedRetentionFlashcard;
                                setSelectedRetentionFlashcard(null);
                                if (onDiscussWithCherry) {
                                  onDiscussWithCherry({
                                    topic: card.topicName,
                                    subject: card.subject,
                                    conceptTested: card.topicName,
                                    hint: card.flashcardAnswer,
                                    question: `Cherry Ma'am, please explain ${card.topicName} on the chalkboard with an intuitive example so I retain it long-term.`,
                                  });
                                } else if (onEnterClassroom) {
                                  onEnterClassroom();
                                }
                              }}
                              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#796AEF] hover:bg-indigo-700 text-white text-xs font-bold font-mono tracking-wide transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-white" />
                              <span>{isEnglish ? "Ask Ma'am on Blackboard 🚀" : "मैम से ब्लैकबोर्ड पर पूछें 🚀"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

  );
};
