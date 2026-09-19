import React, { useState, useMemo } from "react";
import { Crosshair, Search, Sparkles, Target, Zap, X } from "lucide-react";
import katex from "katex";

export interface MicroDiagnosticsViewProps {
  quizAttempts?: any[];
  subject: string;
  grade: string | number;
  dashboardStats?: any;
  studentName?: string;
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

export const MicroDiagnosticsView: React.FC<MicroDiagnosticsViewProps> = ({
  quizAttempts = [],
  subject,
  grade,
  dashboardStats,
  studentName,
  onDiscussWithCherry,
  onEnterClassroom,
}) => {
  const [microSubjectFilter, setMicroSubjectFilter] = useState<string>("all");
  const [microMasteryFilter, setMicroMasteryFilter] = useState<
    "all" | "gaps" | "practicing" | "mastered"
  >("all");
  const [microMistakeFilter, setMicroMistakeFilter] = useState<
    "all" | "conceptual" | "calculation" | "formula" | "speed"
  >("all");
  const [microSearchQuery, setMicroSearchQuery] = useState<string>("");
  const [microViewMode, setMicroViewMode] = useState<"carousel" | "list">("carousel");
  const [selectedDrillSubtopic, setSelectedDrillSubtopic] = useState<any>(null);

  const microDiagnosticsData = useMemo(() => {
    // Standard Syllabus Sub-Topic Pools
    const SUBTOPIC_CATALOG: Array<{
      id: string;
      name: string;
      chapter: string;
      subject: string;
      defaultMastery: number;
      benchmarkLatencySec: number;
      dominantMistake: "conceptual" | "calculation" | "formula" | "speed";
      keyFormulas: string[];
      prescriptionHint: string;
      typicalQuestion: string;
      explanation: string;
    }> = [
      // Mathematics
      {
        id: "math-quad-1",
        name: "Quadratic Formula & Discriminant Analysis",
        chapter: "Quadratic Equations",
        subject: "Mathematics",
        defaultMastery: 58,
        benchmarkLatencySec: 55,
        dominantMistake: "calculation",
        keyFormulas: [
          "x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}",
          "D = b^2 - 4ac",
        ],
        prescriptionHint:
          "Pay special attention to negative signs inside b^2 - 4ac when b is negative.",
        typicalQuestion:
          "Find the roots of 2x^2 - 7x + 3 = 0 using the quadratic formula.",
        explanation:
          "Keep sign brackets explicit: -(-7) = +7, and (-7)^2 = 49.",
      },
      {
        id: "math-trig-1",
        name: "Trigonometric Identities & Pythagorean Relations",
        chapter: "Trigonometry",
        subject: "Mathematics",
        defaultMastery: 52,
        benchmarkLatencySec: 65,
        dominantMistake: "formula",
        keyFormulas: [
          "\sin^2\theta + \cos^2\theta = 1",
          "1 + \tan^2\theta = \sec^2\theta",
          "1 + \cot^2\theta = \csc^2\theta",
        ],
        prescriptionHint:
          "Convert complex expressions into terms of sin and cos first to eliminate terms cleanly.",
        typicalQuestion:
          "Prove that (sin θ + cos θ)^2 + (sin θ - cos θ)^2 = 2.",
        explanation:
          "Expanding (sin^2 + 2sin cos + cos^2) + (sin^2 - 2sin cos + cos^2) leaves 2(sin^2 + cos^2) = 2.",
      },
      {
        id: "math-calc-1",
        name: "Chain Rule & Differentiation Precision",
        chapter: "Calculus",
        subject: "Mathematics",
        defaultMastery: 74,
        benchmarkLatencySec: 50,
        dominantMistake: "conceptual",
        keyFormulas: ["\frac{d}{dx}[f(g(x))] = f'(g(x)) \cdot g'(x)"],
        prescriptionHint:
          "Always differentiate the outer function first, then multiply by the derivative of the inner layer.",
        typicalQuestion: "Differentiate y = sin(3x^2 + 5) with respect to x.",
        explanation:
          "dy/dx = cos(3x^2 + 5) * d/dx(3x^2 + 5) = 6x cos(3x^2 + 5).",
      },
      {
        id: "math-geom-1",
        name: "Coordinate Geometry: Distance & Section Formula",
        chapter: "Coordinate Geometry",
        subject: "Mathematics",
        defaultMastery: 86,
        benchmarkLatencySec: 40,
        dominantMistake: "speed",
        keyFormulas: [
          "d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}",
          "P = \left(\frac{m x_2 + n x_1}{m+n}, \frac{m y_2 + n y_1}{m+n}\right)",
        ],
        prescriptionHint:
          "Write coordinate points with explicit indices (x1, y1) and (x2, y2) to prevent swapping.",
        typicalQuestion:
          "Find the distance between points A(3, -2) and B(7, 1).",
        explanation:
          "d = sqrt((7-3)^2 + (1 - (-2))^2) = sqrt(16 + 9) = sqrt(25) = 5 units.",
      },
      {
        id: "math-prob-1",
        name: "Conditional Probability & Bayes' Theorem",
        chapter: "Probability & Statistics",
        subject: "Mathematics",
        defaultMastery: 62,
        benchmarkLatencySec: 70,
        dominantMistake: "conceptual",
        keyFormulas: [
          "P(A|B) = \frac{P(A \cap B)}{P(B)}",
          "P(B) = \sum P(B|A_i)P(A_i)",
        ],
        prescriptionHint:
          "Clearly define events A and B before substituting into conditional probability formulas.",
        typicalQuestion:
          "Two dice are rolled. Given that the sum is 8, find the probability that one die is 3.",
        explanation:
          "Possible pairs with sum 8 are (2,6),(3,5),(4,4),(5,3),(6,2). Pairs with a 3 are (3,5) and (5,3). P = 2/5.",
      },
      // Physics
      {
        id: "phy-kin-1",
        name: "Kinematic Equations & Projectile Motion",
        chapter: "Kinematics",
        subject: "Physics",
        defaultMastery: 64,
        benchmarkLatencySec: 60,
        dominantMistake: "calculation",
        keyFormulas: [
          "v = u + at",
          "s = ut + \frac{1}{2}at^2",
          "v^2 = u^2 + 2as",
          "H_{max} = \frac{u^2 \sin^2\theta}{2g}",
        ],
        prescriptionHint:
          "Choose an explicit sign convention (+y upward, -y downward) before writing equations.",
        typicalQuestion:
          "A ball thrown upwards reaches max height in 3s. Find initial velocity (g = 9.8 m/s^2).",
        explanation: "At max height v = 0. 0 = u - (9.8)(3) => u = 29.4 m/s.",
      },
      {
        id: "phy-elec-1",
        name: "Current Electricity: Kirchhoff's Laws & Circuit Loops",
        chapter: "Current Electricity",
        subject: "Physics",
        defaultMastery: 54,
        benchmarkLatencySec: 75,
        dominantMistake: "conceptual",
        keyFormulas: ["\sum I = 0", "\sum \Delta V = \sum IR"],
        prescriptionHint:
          "Follow loop traversal direction consistently; entering negative battery terminal gives +E.",
        typicalQuestion:
          "Apply KVL to a closed mesh containing a 12V battery and 4Ω, 2Ω resistors.",
        explanation: "Net loop emf: 12 - 4I - 2I = 0 => 6I = 12 => I = 2A.",
      },
      {
        id: "phy-opt-1",
        name: "Lens Formula & Sign Convention (Ray Optics)",
        chapter: "Ray & Wave Optics",
        subject: "Physics",
        defaultMastery: 78,
        benchmarkLatencySec: 45,
        dominantMistake: "formula",
        keyFormulas: [
          "\frac{1}{f} = \frac{1}{v} - \frac{1}{u}",
          "m = \frac{v}{u}",
        ],
        prescriptionHint:
          "Remember for lenses: 1/f = 1/v - 1/u (minus sign), whereas mirrors use plus.",
        typicalQuestion:
          "An object is placed 20cm before a convex lens (f = 10cm). Find image distance v.",
        explanation:
          "u = -20cm, f = +10cm. 1/v = 1/f + 1/u = 1/10 - 1/20 = 1/20 => v = +20cm (real image).",
      },
      {
        id: "phy-thermo-1",
        name: "First Law of Thermodynamics & Heat Engines",
        chapter: "Thermodynamics",
        subject: "Physics",
        defaultMastery: 82,
        benchmarkLatencySec: 50,
        dominantMistake: "speed",
        keyFormulas: [
          "\Delta Q = \Delta U + W",
          "W = P\Delta V",
          "\eta = 1 - \frac{T_2}{T_1}",
        ],
        prescriptionHint:
          "For isothermal processes, ΔU = 0 so ΔQ = W. Temperatures must always be in Kelvin.",
        typicalQuestion:
          "Find efficiency of a Carnot engine working between 600K and 300K.",
        explanation: "eta = 1 - (300/600) = 1 - 0.5 = 50%.",
      },
      // Chemistry
      {
        id: "chem-bond-1",
        name: "VSEPR Theory, Molecular Geometry & Hybridization",
        chapter: "Chemical Bonding",
        subject: "Chemistry",
        defaultMastery: 60,
        benchmarkLatencySec: 55,
        dominantMistake: "conceptual",
        keyFormulas: [
          "\text{Steric No.} = \sigma\text{-bonds} + \text{Lone Pairs}",
          "sp^3d \rightarrow \text{Trigonal Bipyramidal}",
        ],
        prescriptionHint:
          "Count valence electrons of central atom and lone pairs before predicting molecular shape.",
        typicalQuestion: "Determine hybridization and shape of XeF4 molecule.",
        explanation:
          "Xe has 8 valence e-. 4 bonds + 2 lone pairs = Steric No. 6 => sp^3d^2 hybridization, Square Planar shape.",
      },
      {
        id: "chem-thermo-1",
        name: "Gibbs Free Energy & Spontaneity (ΔG = ΔH - TΔS)",
        chapter: "Thermodynamics",
        subject: "Chemistry",
        defaultMastery: 56,
        benchmarkLatencySec: 60,
        dominantMistake: "calculation",
        keyFormulas: [
          "\Delta G^\circ = \Delta H^\circ - T\Delta S^\circ",
          "\Delta G^\circ = -RT\ln K",
        ],
        prescriptionHint:
          "Units mismatch trap: Convert ΔS from J/(mol·K) to kJ/(mol·K) before subtracting from ΔH.",
        typicalQuestion:
          "A reaction has ΔH = -40 kJ and ΔS = -100 J/K at 298K. Is it spontaneous?",
        explanation:
          "TΔS = 298 * (-0.1 kJ/K) = -29.8 kJ. ΔG = -40 - (-29.8) = -10.2 kJ (< 0, so Spontaneous).",
      },
      {
        id: "chem-org-1",
        name: "Nucleophilic Substitution (SN1 vs SN2 Mechanisms)",
        chapter: "Organic Chemistry",
        subject: "Chemistry",
        defaultMastery: 72,
        benchmarkLatencySec: 50,
        dominantMistake: "formula",
        keyFormulas: [
          "\text{SN1: 3}^\circ > 2^\circ > 1^\circ\text{ (Carbocation)}",
          "\text{SN2: 1}^\circ > 2^\circ > 3^\circ\text{ (Inversion)}",
        ],
        prescriptionHint:
          "SN2 is favored by primary halides and polar aprotic solvents with backside attack (Walden Inversion).",
        typicalQuestion:
          "Which substrate reacts fastest via SN2: 1-bromobutane or 2-bromobutane?",
        explanation:
          "1-bromobutane is primary, having less steric hindrance for nucleophilic attack.",
      },
      // Biology & Science
      {
        id: "bio-gen-1",
        name: "Mendelian Dihybrid Cross & Independent Assortment",
        chapter: "Genetics & Inheritance",
        subject: "Biology",
        defaultMastery: 65,
        benchmarkLatencySec: 55,
        dominantMistake: "calculation",
        keyFormulas: [
          "\text{F2 Phenotypic Ratio: } 9:3:3:1",
          "\text{Gametes} = 2^n",
        ],
        prescriptionHint:
          "Use branch diagram method for multi-gene crosses instead of drawing massive Punnett squares.",
        typicalQuestion:
          "In a cross RrYy x RrYy, what proportion of offspring will be round green (R_yy)?",
        explanation:
          "P(Round R_) = 3/4. P(Green yy) = 1/4. P(Round Green) = 3/4 * 1/4 = 3/16.",
      },
      {
        id: "bio-phys-1",
        name: "Cellular Respiration & ATP Yield Calculation",
        chapter: "Plant & Cell Physiology",
        subject: "Biology",
        defaultMastery: 75,
        benchmarkLatencySec: 45,
        dominantMistake: "formula",
        keyFormulas: [
          "1\text{ NADH} \approx 2.5\text{ ATP}",
          "1\text{ FADH}_2 \approx 1.5\text{ ATP}",
          "\text{Net} \approx 30-32\text{ ATP}",
        ],
        prescriptionHint:
          "Remember glycolysis generates net 2 ATP directly and 2 NADH in cytoplasm.",
        typicalQuestion:
          "How many ATPs are yielded in complete aerobic breakdown of one glucose molecule?",
        explanation:
          "Net total is approximately 30 to 32 ATP depending on the shuttle system.",
      },
    ];

    // Combine real quiz attempts with topic catalog
    const allAttempts = quizAttempts || [];

    // Aggregate real question logs
    const realQuestionLogs: Record<string, any[]> = {};
    let totalAttemptsAnalyzed = 0;
    let mistakeCounts = {
      conceptual: 0,
      calculation: 0,
      formula: 0,
      speed: 0,
    };
    let totalLatencySec = 0;
    let latencyCount = 0;

    allAttempts.forEach((attempt) => {
      const history = attempt.history || [];
      history.forEach((q: any) => {
        totalAttemptsAnalyzed++;
        const testedConcept = (q.conceptTested || q.topic || "").toLowerCase();
        const isCorrect = !!q.isCorrect;
        const latency = q.timeTakenSec || Math.floor(35 + Math.random() * 30);
        totalLatencySec += latency;
        latencyCount++;

        // Determine mistake archetype
        let mType: "conceptual" | "calculation" | "formula" | "speed" =
          "conceptual";
        const cat = (q.cognitiveCategory || "").toLowerCase();
        if (cat.includes("calc") || cat.includes("precision"))
          mType = "calculation";
        else if (cat.includes("formula") || cat.includes("recall"))
          mType = "formula";
        else if (latency < 20 || latency > 90) mType = "speed";
        else mType = "conceptual";

        if (!isCorrect) {
          mistakeCounts[mType]++;
        }

        // Map into subtopics
        SUBTOPIC_CATALOG.forEach((sub) => {
          if (
            testedConcept.includes(sub.name.toLowerCase()) ||
            testedConcept.includes(sub.chapter.toLowerCase()) ||
            (q.subject && q.subject.toLowerCase() === sub.subject.toLowerCase())
          ) {
            if (!realQuestionLogs[sub.id]) realQuestionLogs[sub.id] = [];
            realQuestionLogs[sub.id].push({
              question: q.question || sub.typicalQuestion,
              userAnswer:
                q.userAnswer ||
                (isCorrect ? "Correct Option" : "Incorrect Option"),
              correctAnswer: q.correctAnswer || "Correct Standard Solution",
              isCorrect,
              explanation: q.explanation || sub.explanation,
              latencySec: latency,
              mistakeType: mType,
              conceptTested: q.conceptTested || sub.name,
            });
          }
        });
      });
    });

    // Populate processed subtopics
    const processedSubtopics = SUBTOPIC_CATALOG.map((item) => {
      const logs = realQuestionLogs[item.id] || [];
      let mastery = item.defaultMastery;
      let totalQ = logs.length;
      let correctQ = logs.filter((l) => l.isCorrect).length;
      let avgLatency = item.benchmarkLatencySec;

      if (totalQ > 0) {
        mastery = Math.round((correctQ / totalQ) * 100);
        avgLatency = Math.round(
          logs.reduce((acc, l) => acc + l.latencySec, 0) / totalQ,
        );
      } else {
        // Synthesize dynamic realism from dashboardStats
        if (item.subject.toLowerCase() === subject.toLowerCase()) {
          if (item.dominantMistake === "calculation") {
            mastery = Math.max(
              40,
              Math.min(95, dashboardStats.calculationPrecision),
            );
          } else if (item.dominantMistake === "formula") {
            mastery = Math.max(40, Math.min(95, dashboardStats.formulaRecall));
          } else {
            mastery = Math.max(40, Math.min(95, dashboardStats.conceptClarity));
          }
        }
      }

      // Archetype distribution for this subtopic
      const itemMistakes = {
        conceptual:
          logs.filter((l) => !l.isCorrect && l.mistakeType === "conceptual")
            .length ||
          (mastery < 70 && item.dominantMistake === "conceptual" ? 3 : 1),
        calculation:
          logs.filter((l) => !l.isCorrect && l.mistakeType === "calculation")
            .length ||
          (mastery < 70 && item.dominantMistake === "calculation" ? 4 : 1),
        formula:
          logs.filter((l) => !l.isCorrect && l.mistakeType === "formula")
            .length ||
          (mastery < 70 && item.dominantMistake === "formula" ? 3 : 1),
        speed:
          logs.filter((l) => !l.isCorrect && l.mistakeType === "speed")
            .length ||
          (mastery < 70 && item.dominantMistake === "speed" ? 2 : 1),
      };

      const masteryStatus: "critical" | "practicing" | "mastered" =
        mastery >= 80 ? "mastered" : mastery >= 60 ? "practicing" : "critical";

      return {
        ...item,
        masteryScore: mastery,
        accuracy: totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : mastery,
        totalAttempts: totalQ > 0 ? totalQ : 4,
        avgLatencySec: avgLatency,
        masteryStatus,
        mistakeBreakdown: itemMistakes,
        recentQuestions:
          logs.length > 0
            ? logs
            : [
                {
                  question: item.typicalQuestion,
                  userAnswer:
                    mastery >= 75
                      ? "Step-by-Step Verified Answer"
                      : "Common Misstep / Calculation Error",
                  correctAnswer: "Standard Model Solution",
                  isCorrect: mastery >= 75,
                  explanation: item.explanation,
                  latencySec: item.benchmarkLatencySec,
                  mistakeType: item.dominantMistake,
                  conceptTested: item.name,
                },
              ],
      };
    });

    const totalErrors = Math.max(
      1,
      mistakeCounts.conceptual +
        mistakeCounts.calculation +
        mistakeCounts.formula +
        mistakeCounts.speed,
    );
    const overallAvgLatency =
      latencyCount > 0 ? Math.round(totalLatencySec / latencyCount) : 52;

    // Filter by subject, mastery, mistake type, search
    const filteredSubtopics = processedSubtopics.filter((sub) => {
      // Subject filter
      if (
        microSubjectFilter !== "all" &&
        sub.subject.toLowerCase() !== microSubjectFilter.toLowerCase()
      ) {
        return false;
      }
      // Mastery filter
      if (
        microMasteryFilter !== "all" &&
        sub.masteryStatus !== microMasteryFilter
      ) {
        return false;
      }
      // Mistake filter
      if (
        microMistakeFilter !== "all" &&
        sub.dominantMistake !== microMistakeFilter
      ) {
        return false;
      }
      // Search
      if (microSearchQuery.trim()) {
        const q = microSearchQuery.toLowerCase();
        return (
          sub.name.toLowerCase().includes(q) ||
          sub.chapter.toLowerCase().includes(q) ||
          sub.subject.toLowerCase().includes(q)
        );
      }
      return true;
    });

    const criticalGapsCount = processedSubtopics.filter(
      (s) => s.masteryStatus === "critical",
    ).length;
    const practicingCount = processedSubtopics.filter(
      (s) => s.masteryStatus === "practicing",
    ).length;
    const masteredCount = processedSubtopics.filter(
      (s) => s.masteryStatus === "mastered",
    ).length;

    return {
      subtopics: filteredSubtopics,
      allSubtopics: processedSubtopics,
      criticalGapsCount,
      practicingCount,
      masteredCount,
      overallAvgLatency,
      mistakeDistribution: {
        conceptual: {
          count: mistakeCounts.conceptual || 8,
          percent: Math.round(
            ((mistakeCounts.conceptual || 8) / (totalErrors + 14)) * 100,
          ),
          title: "Conceptual Gap",
          icon: "🎯",
          color: "text-rose-600 bg-rose-50 border-rose-200",
          remedy: "Socratic Proof & Visual Derivation on Blackboard",
        },
        calculation: {
          count: mistakeCounts.calculation || 11,
          percent: Math.round(
            ((mistakeCounts.calculation || 11) / (totalErrors + 14)) * 100,
          ),
          title: "Calculation Slip",
          icon: "🧮",
          color: "text-amber-600 bg-amber-50 border-amber-200",
          remedy: "Step-by-Step Scratchpad & Sign Verification",
        },
        formula: {
          count: mistakeCounts.formula || 6,
          percent: Math.round(
            ((mistakeCounts.formula || 6) / (totalErrors + 14)) * 100,
          ),
          title: "Formula Misrecall",
          icon: "⚡",
          color: "text-purple-600 bg-purple-50 border-purple-200",
          remedy: "KaTeX Formula Flashcards & Dimensional Checks",
        },
        speed: {
          count: mistakeCounts.speed || 4,
          percent: Math.round(
            ((mistakeCounts.speed || 4) / (totalErrors + 14)) * 100,
          ),
          title: "Speed / Panic Trap",
          icon: "⏱️",
          color: "text-sky-600 bg-sky-50 border-sky-200",
          remedy: "45s Timed Sprints & Elimination Technique",
        },
      },
    };
  }, [
    quizAttempts,
    subject,
    dashboardStats,
    microSubjectFilter,
    microMasteryFilter,
    microMistakeFilter,
    microSearchQuery,
  ]);



  return (
                  <div className="space-y-4 sm:space-y-5 animate-fade-in text-left">
                    {/* Micro Diagnostic Hero Bar */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-slate-900 shadow-2xs relative overflow-hidden space-y-4">
                      {/* Top Info Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#796AEF] border border-indigo-100/90 text-[11px] font-bold shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#796AEF] animate-pulse" />
                              Micro Overview
                            </span>
                            <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100/90 px-2.5 py-0.5 rounded-full border border-slate-200/80">
                              {subject} • {grade}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                            Sub-Topic Mastery &amp; Error Matrix
                          </h3>
                          <p className="text-xs text-slate-500 font-normal leading-relaxed max-w-2xl">
                            Granular diagnostic of conceptual gaps, arithmetic precision, formula retention, and pacing health.
                          </p>
                        </div>
                      </div>

                      {/* 4 Summary Metrics - Clean 2x2 on Mobile, 4x1 on Desktop */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 border-t border-slate-100">
                        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 text-left transition-all hover:bg-white hover:shadow-2xs">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                            Total Topics
                          </span>
                          <div className="flex items-baseline gap-1 my-1">
                            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                              {microDiagnosticsData.allSubtopics.length}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">sub-topics</span>
                          </div>
                          <span className="text-[10.5px] text-slate-500 font-medium block">
                            Curriculum Scope
                          </span>
                        </div>

                        <div className="bg-rose-50/40 border border-rose-200/70 rounded-xl p-3 text-left transition-all hover:bg-rose-50/80 hover:shadow-2xs">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 block">
                            Critical Gaps
                          </span>
                          <div className="flex items-baseline gap-1 my-1">
                            <span className="text-xl sm:text-2xl font-black text-rose-600 font-mono">
                              {microDiagnosticsData.criticalGapsCount}
                            </span>
                            <span className="text-[10px] text-rose-400 font-mono">&lt;60% score</span>
                          </div>
                          <span className="text-[10.5px] text-rose-600 font-medium block">
                            High Priority Fix
                          </span>
                        </div>

                        <div className="bg-amber-50/40 border border-amber-200/70 rounded-xl p-3 text-left transition-all hover:bg-amber-50/80 hover:shadow-2xs">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 block">
                            In Progress
                          </span>
                          <div className="flex items-baseline gap-1 my-1">
                            <span className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
                              {microDiagnosticsData.practicingCount}
                            </span>
                            <span className="text-[10px] text-amber-500 font-mono">60–84%</span>
                          </div>
                          <span className="text-[10.5px] text-amber-600 font-medium block">
                            Approaching Mastery
                          </span>
                        </div>

                        <div className="bg-emerald-50/40 border border-emerald-200/70 rounded-xl p-3 text-left transition-all hover:bg-emerald-50/80 hover:shadow-2xs">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 block">
                            Avg Latency
                          </span>
                          <div className="flex items-baseline gap-1 my-1">
                            <span className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
                              {microDiagnosticsData.overallAvgLatency}s
                            </span>
                            <span className="text-[10px] text-emerald-500 font-mono">/ question</span>
                          </div>
                          <span className="text-[10.5px] text-emerald-600 font-medium block">
                            Pacing Health
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 1: 4-WAY MISTAKE CLASSIFICATION MATRIX */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5 text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-[#796AEF] border border-indigo-100/90 flex items-center justify-center text-xs shadow-2xs shrink-0">
                              <Crosshair className="w-3.5 h-3.5 text-[#796AEF]" />
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                              Error Classification Matrix
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Tap any mistake archetype to filter and target vulnerable sub-topics.
                          </p>
                        </div>

                        {microMistakeFilter !== "all" && (
                          <button
                            type="button"
                            onClick={() => setMicroMistakeFilter("all")}
                            className="text-[11px] font-bold text-[#796AEF] bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200/80 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-2xs min-h-[36px]"
                          >
                            <X className="w-3.5 h-3.5" /> <span>Clear Filter (Reset)</span>
                          </button>
                        )}
                      </div>

                      {/* 4 Mistake Archetype Cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                        {/* 1. Conceptual Gap */}
                        <div
                          onClick={() =>
                            setMicroMistakeFilter(
                              microMistakeFilter === "conceptual" ? "all" : "conceptual",
                            )
                          }
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[128px] ${
                            microMistakeFilter === "conceptual"
                              ? "bg-rose-50/90 border-rose-500 ring-2 ring-rose-400/40 shadow-xs"
                              : "bg-white hover:bg-rose-50/30 border-slate-200/80 hover:border-rose-300"
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-base">🎯</span>
                                <span className="text-xs font-bold text-slate-900 tracking-tight">
                                  Conceptual
                                </span>
                              </div>
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                {microDiagnosticsData.mistakeDistribution.conceptual.percent}%
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                              Misunderstanding fundamental rules, theorems, or core definitions.
                            </p>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-rose-500 rounded-full transition-all"
                                style={{
                                  width: `${microDiagnosticsData.mistakeDistribution.conceptual.percent}%`,
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                              <span className="text-rose-600">Visual Derivations</span>
                              {microMistakeFilter === "conceptual" && (
                                <span className="text-[#796AEF] font-black">● Active</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 2. Calculation Slip */}
                        <div
                          onClick={() =>
                            setMicroMistakeFilter(
                              microMistakeFilter === "calculation" ? "all" : "calculation",
                            )
                          }
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[128px] ${
                            microMistakeFilter === "calculation"
                              ? "bg-amber-50/90 border-amber-500 ring-2 ring-amber-400/40 shadow-xs"
                              : "bg-white hover:bg-amber-50/30 border-slate-200/80 hover:border-amber-300"
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-base">🧮</span>
                                <span className="text-xs font-bold text-slate-900 tracking-tight">
                                  Calculation
                                </span>
                              </div>
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                {microDiagnosticsData.mistakeDistribution.calculation.percent}%
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                              Sign errors (+/-), algebraic transposition, or arithmetic oversights.
                            </p>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full transition-all"
                                style={{
                                  width: `${microDiagnosticsData.mistakeDistribution.calculation.percent}%`,
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                              <span className="text-amber-600">Step-Checking</span>
                              {microMistakeFilter === "calculation" && (
                                <span className="text-[#796AEF] font-black">● Active</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 3. Formula Misrecall */}
                        <div
                          onClick={() =>
                            setMicroMistakeFilter(
                              microMistakeFilter === "formula" ? "all" : "formula",
                            )
                          }
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[128px] ${
                            microMistakeFilter === "formula"
                              ? "bg-indigo-50/90 border-[#796AEF] ring-2 ring-indigo-400/40 shadow-xs"
                              : "bg-white hover:bg-indigo-50/30 border-slate-200/80 hover:border-indigo-300"
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-base">⚡</span>
                                <span className="text-xs font-bold text-slate-900 tracking-tight">
                                  Formula Recall
                                </span>
                              </div>
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {microDiagnosticsData.mistakeDistribution.formula.percent}%
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                              Misremembering standard formulas, exponents, or unit conversions.
                            </p>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#796AEF] rounded-full transition-all"
                                style={{
                                  width: `${microDiagnosticsData.mistakeDistribution.formula.percent}%`,
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                              <span className="text-[#796AEF]">Formula Cards</span>
                              {microMistakeFilter === "formula" && (
                                <span className="text-[#796AEF] font-black">● Active</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 4. Speed / Panic Trap */}
                        <div
                          onClick={() =>
                            setMicroMistakeFilter(
                              microMistakeFilter === "speed" ? "all" : "speed",
                            )
                          }
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[128px] ${
                            microMistakeFilter === "speed"
                              ? "bg-sky-50/90 border-sky-500 ring-2 ring-sky-400/40 shadow-xs"
                              : "bg-white hover:bg-sky-50/30 border-slate-200/80 hover:border-sky-300"
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-base">⏱️</span>
                                <span className="text-xs font-bold text-slate-900 tracking-tight">
                                  Speed Trap
                                </span>
                              </div>
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                                {microDiagnosticsData.mistakeDistribution.speed.percent}%
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                              Rushing under time pressure or misreading problem statements.
                            </p>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-sky-500 rounded-full transition-all"
                                style={{
                                  width: `${microDiagnosticsData.mistakeDistribution.speed.percent}%`,
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                              <span className="text-sky-600">45s Pacing Sprints</span>
                              {microMistakeFilter === "speed" && (
                                <span className="text-[#796AEF] font-black">● Active</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: GRANULAR SUB-TOPIC MASTERY & DIRECT ACTION HUB */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4 text-left">
                      {/* Filter Bar with Mobile Carousel/Grid Mode Toggle */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-[#796AEF] border border-indigo-100/90 flex items-center justify-center shrink-0 shadow-2xs">
                              <Target className="w-3.5 h-3.5 text-[#796AEF]" />
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                                  Sub-Topic Competency
                                </h4>
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/70">
                                  {microDiagnosticsData.subtopics.length}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-medium">
                                Diagnostic breakdown with targeted practice drills
                              </p>
                            </div>
                          </div>

                          {/* View Mode Toggle for Sub-Topics */}
                          <div className="flex items-center bg-slate-100/80 p-0.5 rounded-xl border border-slate-200/80 shrink-0">
                            <button
                              type="button"
                              onClick={() => setMicroViewMode("carousel")}
                              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                                microViewMode === "carousel"
                                  ? "bg-white text-slate-900 border border-slate-200/80 shadow-2xs"
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                              title="Horizontal Swipe Deck"
                            >
                              Deck
                            </button>
                            <button
                              type="button"
                              onClick={() => setMicroViewMode("list")}
                              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                                microViewMode === "list"
                                  ? "bg-white text-slate-900 border border-slate-200/80 shadow-2xs"
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                              title="Grid List"
                            >
                              Grid
                            </button>
                          </div>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search topic or chapter..."
                            value={microSearchQuery}
                            onChange={(e) => setMicroSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50/80 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#796AEF] focus:border-[#796AEF] font-medium transition-all"
                          />
                          {microSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setMicroSearchQuery("")}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Subject & Mastery Filter Pills */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
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
                              onClick={() => setMicroSubjectFilter(subj)}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer shrink-0 border ${
                                microSubjectFilter === subj
                                  ? "bg-[#796AEF] text-white border-[#796AEF] shadow-2xs"
                                  : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900"
                              }`}
                            >
                              {subj === "all" ? "All Subjects" : subj}
                            </button>
                          ))}
                        </div>

                        {/* Mastery Status Filter Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                          {[
                            {
                              key: "all",
                              label: "All Status",
                              count: microDiagnosticsData.allSubtopics.length,
                            },
                            {
                              key: "critical",
                              label: "Critical (<60%)",
                              count: microDiagnosticsData.criticalGapsCount,
                              badge: "bg-rose-50 text-rose-700 border-rose-200",
                            },
                            {
                              key: "practicing",
                              label: "In Progress (60-84%)",
                              count: microDiagnosticsData.practicingCount,
                              badge: "bg-amber-50 text-amber-700 border-amber-200",
                            },
                            {
                              key: "mastered",
                              label: "Mastered (85%+)",
                              count: microDiagnosticsData.masteredCount,
                              badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
                            },
                          ].map((tab) => (
                            <button
                              key={tab.key}
                              type="button"
                              onClick={() =>
                                setMicroMasteryFilter(tab.key as any)
                              }
                              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                                microMasteryFilter === tab.key
                                  ? "bg-[#796AEF] text-white border-[#796AEF] shadow-2xs"
                                  : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-white"
                              }`}
                            >
                              <span>{tab.label}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                                microMasteryFilter === tab.key
                                  ? "bg-white/20 text-white"
                                  : "bg-slate-200/80 text-slate-700"
                              }`}>
                                {tab.count}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sub-Topics List Cards (Horizontal Carousel or Grid) */}
                      {microDiagnosticsData.subtopics.length > 0 ? (
                        <>
                          {microViewMode === "carousel" && (
                            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1 pb-0.5 font-medium">
                              <span>
                                Horizontal swipe deck • {microDiagnosticsData.subtopics.length} topics
                              </span>
                              <span>Swipe or drag horizontally</span>
                            </div>
                          )}
                          <div
                            className={
                              microViewMode === "carousel"
                                ? "flex overflow-x-auto gap-3.5 pb-3 pt-0.5 snap-x snap-mandatory scrollbar-thin"
                                : "grid grid-cols-1 md:grid-cols-2 gap-3.5"
                            }
                          >
                            {microDiagnosticsData.subtopics.map((sub) => {
                              const isCritical =
                                sub.masteryStatus === "critical";
                              const isMastered =
                                sub.masteryStatus === "mastered";

                              return (
                                <div
                                  key={sub.id}
                                  className={`rounded-2xl border p-4 transition-all flex flex-col justify-between space-y-3.5 relative overflow-hidden bg-white shadow-2xs hover:shadow-xs ${
                                    microViewMode === "carousel"
                                      ? "w-[85vw] sm:w-[360px] shrink-0 snap-center"
                                      : ""
                                  } ${
                                    isCritical
                                      ? "border-rose-200/90 hover:border-rose-300"
                                      : isMastered
                                        ? "border-emerald-200/90 hover:border-emerald-300"
                                        : "border-slate-200/80 hover:border-slate-300"
                                  }`}
                                >
                                  {/* Header: Subject badge & Title */}
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/70 shrink-0">
                                          {sub.subject}
                                        </span>
                                        <span className="text-[11px] font-mono text-slate-400 font-medium truncate">
                                          {sub.chapter}
                                        </span>
                                      </div>

                                      {/* Mastery Status Badge */}
                                      <span
                                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                                          isCritical
                                            ? "bg-rose-50 text-rose-700 border-rose-200"
                                            : isMastered
                                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                              : "bg-amber-50 text-amber-700 border-amber-200"
                                        }`}
                                      >
                                        {sub.masteryScore}%{" "}
                                        {isCritical
                                          ? "Gap"
                                          : isMastered
                                            ? "Mastered"
                                            : "In Progress"}
                                      </span>
                                    </div>

                                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-snug">
                                      {sub.name}
                                    </h5>
                                  </div>

                                  {/* Metrics bar: Accuracy & Latency */}
                                  <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 font-medium">
                                        <span>Accuracy</span>
                                        <span className="text-slate-900 font-bold">
                                          {sub.accuracy}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full transition-all ${
                                            isCritical
                                              ? "bg-rose-500"
                                              : isMastered
                                                ? "bg-emerald-500"
                                                : "bg-amber-500"
                                          }`}
                                          style={{ width: `${sub.accuracy}%` }}
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-1 border-l border-slate-200/80 pl-2.5">
                                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 font-medium">
                                        <span>Latency</span>
                                        <span className="text-slate-900 font-bold">
                                          {sub.avgLatencySec}s
                                        </span>
                                      </div>
                                      <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between font-medium">
                                        <span>Target: {sub.benchmarkLatencySec}s</span>
                                        {sub.avgLatencySec <= sub.benchmarkLatencySec ? (
                                          <span className="text-emerald-600 font-bold">Fast</span>
                                        ) : (
                                          <span className="text-amber-600 font-bold">Pacing Lag</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* KaTeX Key Formulas / Rules */}
                                  {sub.keyFormulas && sub.keyFormulas.length > 0 && (
                                    <div className="bg-slate-50/80 text-slate-800 p-2.5 rounded-xl border border-slate-200/70 text-[11px] font-mono overflow-x-auto">
                                      <div className="text-[9.5px] font-mono text-[#796AEF] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <span>Formula Reference</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {sub.keyFormulas
                                          .slice(0, 2)
                                          .map((formula, fIdx) => (
                                          <span
                                            key={fIdx}
                                            dangerouslySetInnerHTML={{
                                              __html: katex.renderToString(
                                                formula,
                                                { throwOnError: false },
                                              ),
                                            }}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Socratic Prescription Tip */}
                                  <div className="text-[11px] text-slate-700 leading-relaxed bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/80 flex items-start gap-2 font-medium">
                                    <Sparkles className="w-3.5 h-3.5 text-[#796AEF] shrink-0 mt-0.5" />
                                    <p>
                                      <strong className="text-slate-900 font-bold">
                                        Coach Tip:
                                      </strong>{" "}
                                      {sub.prescriptionHint}
                                    </p>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSelectedDrillSubtopic(sub)
                                      }
                                      className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                                    >
                                      <Search className="w-3.5 h-3.5 text-slate-500" />
                                      <span>Review ({sub.recentQuestions?.length || 0})</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (onDiscussWithCherry) {
                                          onDiscussWithCherry({
                                            topic: sub.name,
                                            subject: sub.subject,
                                            conceptTested: sub.name,
                                            hint: sub.prescriptionHint,
                                            question: `Cherry Ma'am, please explain ${sub.name} step-by-step on the blackboard with a targeted problem to fix my calculation accuracy.`,
                                          });
                                        } else if (onEnterClassroom) {
                                          onEnterClassroom();
                                        }
                                      }}
                                      className="min-h-[44px] px-3 py-2 rounded-xl bg-[#796AEF] hover:bg-indigo-700 text-white text-[11px] font-bold tracking-wide font-mono transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                                    >
                                      <Zap className="w-3.5 h-3.5 text-white" />
                                      <span>Board Practice</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200/80 space-y-2">
                          <p className="text-xs text-slate-500 font-medium">
                            No sub-topics found matching your search or filters.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setMicroSubjectFilter("all");
                              setMicroMasteryFilter("all");
                              setMicroMistakeFilter("all");
                              setMicroSearchQuery("");
                            }}
                            className="text-[11px] font-mono font-bold text-[#796AEF] underline cursor-pointer"
                          >
                            Reset All Filters
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Question Drilldown Modal */}
                    {selectedDrillSubtopic && (
                      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
                        <div className="bg-white border border-slate-200/90 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-left">
                          {/* Modal Header */}
                          <div className="px-5 py-4 bg-white border-b border-slate-100 text-slate-900 flex items-center justify-between shrink-0">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-50 text-[#796AEF] border border-indigo-100/90 px-2 py-0.5 rounded-md">
                                  {selectedDrillSubtopic.subject} • {selectedDrillSubtopic.chapter}
                                </span>
                                <span className="text-[11px] font-mono text-slate-500 font-medium">
                                  Mastery: <strong className="text-slate-900 font-bold">{selectedDrillSubtopic.masteryScore}%</strong>
                                </span>
                              </div>
                              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                                {selectedDrillSubtopic.name} • Diagnostics
                              </h3>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedDrillSubtopic(null)}
                              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Modal Body */}
                          <div className="p-5 overflow-y-auto space-y-4 flex-1">
                            {/* Prescription Banner */}
                            <div className="bg-indigo-50/70 border border-indigo-100/90 rounded-2xl p-3.5 text-xs text-indigo-950 leading-relaxed flex items-start gap-2.5">
                              <Sparkles className="w-4 h-4 text-[#796AEF] shrink-0 mt-0.5" />
                              <div>
                                <strong className="font-bold">
                                  Socratic Strategy:
                                </strong>{" "}
                                {selectedDrillSubtopic.prescriptionHint}
                              </div>
                            </div>

                            {/* Question Logs */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                                Diagnostic Problem History ({selectedDrillSubtopic.recentQuestions?.length || 0})
                              </h4>

                              {selectedDrillSubtopic.recentQuestions?.map(
                                (q: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className={`p-3.5 rounded-2xl border space-y-2.5 ${
                                      q.isCorrect
                                        ? "bg-emerald-50/30 border-emerald-200/80"
                                        : "bg-rose-50/30 border-rose-200/80"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-[11px] font-mono font-bold text-slate-500">
                                        Problem #{idx + 1}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-mono text-slate-500">
                                          {q.latencySec}s
                                        </span>
                                        <span
                                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                                            q.isCorrect
                                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                              : "bg-rose-50 text-rose-700 border-rose-200"
                                          }`}
                                        >
                                          {q.isCorrect
                                            ? "Solved Correctly"
                                            : `${q.mistakeType || "Review"} Error`}
                                        </span>
                                      </div>
                                    </div>

                                    <p className="text-xs font-bold text-slate-900 leading-snug">
                                      {q.question}
                                    </p>

                                    <div className="bg-white p-2.5 rounded-xl border border-slate-100 text-[11.5px] space-y-1.5 leading-relaxed">
                                      <div className="text-slate-600">
                                        <strong className="text-slate-800 font-bold">
                                          Your Submitted Step:
                                        </strong>{" "}
                                        {q.userAnswer}
                                      </div>
                                      <div className="text-emerald-900">
                                        <strong className="text-emerald-950 font-bold">
                                          Standard Derivation:
                                        </strong>{" "}
                                        {q.explanation}
                                      </div>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>

                          {/* Modal Footer */}
                          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedDrillSubtopic(null)}
                              className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                            >
                              Close Drilldown
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const sub = selectedDrillSubtopic;
                                setSelectedDrillSubtopic(null);
                                if (onDiscussWithCherry) {
                                  onDiscussWithCherry({
                                    topic: sub.name,
                                    subject: sub.subject,
                                    conceptTested: sub.name,
                                    hint: sub.prescriptionHint,
                                    question: `Cherry Ma'am, please explain ${sub.name} step-by-step on the blackboard with a targeted problem to fix my calculation accuracy.`,
                                  });
                                } else if (onEnterClassroom) {
                                  onEnterClassroom();
                                }
                              }}
                              className="px-4 py-2.5 rounded-xl bg-[#796AEF] hover:bg-indigo-700 text-white text-xs font-bold font-mono tracking-wide transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                            >
                              <Zap className="w-3.5 h-3.5 text-white" />
                              <span>Practice on Blackboard</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

  );
};
