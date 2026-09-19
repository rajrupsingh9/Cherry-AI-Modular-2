import React, { useState, useMemo } from "react";
import { Activity, CheckCircle, Gauge, Lightbulb, Sparkles, Target, Zap, X } from "lucide-react";

export interface CognitiveAgilityViewProps {
  subject: string;
  grade: string | number;
  studentName?: string;
  isEnglish?: boolean;
  t?: any;
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

export const CognitiveAgilityView: React.FC<CognitiveAgilityViewProps> = ({
  subject,
  grade,
  studentName,
  isEnglish = false,
  t = (k: string) => k,
  onDiscussWithCherry,
  onEnterClassroom,
}) => {
  // Phase 3: Cognitive Agility & Stamina States
  const [staminaQuadrantFilter, setStaminaQuadrantFilter] = useState<
    "all" | "flow" | "overthink" | "rushing" | "roadblock"
  >("all");
  const [staminaActiveSubject, setStaminaActiveSubject] =
    useState<string>("all");
  const [selectedAgilityDrillTopic, setSelectedAgilityDrillTopic] = useState<
    any | null
  >(null);
  const [staminaViewMode, setStaminaViewMode] = useState<"carousel" | "list">(
    "carousel",
  );
  const [activeSprintSeconds, setActiveSprintSeconds] = useState<number>(60);
  const [isSprintRunning, setIsSprintRunning] = useState<boolean>(false);
  const [sprintStepIndex, setSprintStepIndex] = useState<number>(0);
  const [sprintScore, setSprintScore] = useState<number>(0);

  const staminaAnalyticsData = useMemo(() => {
    // Topics catalog with accuracy and average latency metrics
    const AGILITY_TOPICS: Array<{
      id: string;
      topicName: string;
      chapter: string;
      subject: string;
      accuracy: number; // 0 - 100%
      avgLatencySec: number; // seconds
      benchmarkSec: number;
      dominantSlip: string;
      speedStrategy: string;
      rapidFireQuestion: string;
      rapidFireOptions: string[];
      correctOptionIndex: number;
      explanation: string;
    }> = [
      {
        id: "ag-calc-chain",
        topicName: "Calculus: Chain Rule & Multi-Layer Differentiation",
        chapter: "Calculus",
        subject: "Mathematics",
        accuracy: 92,
        avgLatencySec: 32,
        benchmarkSec: 45,
        dominantSlip: "None (High Automaticity)",
        speedStrategy:
          "Outer-to-inner peeling method without rewriting auxiliary variables.",
        rapidFireQuestion: "Differentiate y = (3x² - 5)⁴ with respect to x.",
        rapidFireOptions: [
          "24x(3x² - 5)³",
          "12x(3x² - 5)³",
          "4(3x² - 5)³",
          "24(3x² - 5)³",
        ],
        correctOptionIndex: 0,
        explanation:
          "dy/dx = 4(3x² - 5)³ * d/dx(3x² - 5) = 4(3x² - 5)³ * 6x = 24x(3x² - 5)³.",
      },
      {
        id: "ag-quad-roots",
        topicName: "Quadratic Equations: Sum & Product of Roots (Vieta's)",
        chapter: "Algebra",
        subject: "Mathematics",
        accuracy: 88,
        avgLatencySec: 28,
        benchmarkSec: 40,
        dominantSlip: "Occasional sign reversal in -b/a",
        speedStrategy:
          "Instant Vieta inspection: sum = -b/a, product = c/a directly from standard form.",
        rapidFireQuestion:
          "For 2x² - 8x + 6 = 0, what is the sum and product of the roots (α + β, αβ)?",
        rapidFireOptions: [
          "Sum = 4, Product = 3",
          "Sum = -4, Product = 3",
          "Sum = 4, Product = -3",
          "Sum = 8, Product = 6",
        ],
        correctOptionIndex: 0,
        explanation: "Sum = -(-8)/2 = 4. Product = 6/2 = 3.",
      },
      {
        id: "ag-int-parts",
        topicName: "Integration by Parts & ILATE Hierarchy",
        chapter: "Calculus",
        subject: "Mathematics",
        accuracy: 84,
        avgLatencySec: 68,
        benchmarkSec: 50,
        dominantSlip: "Over-writing intermediate algebra steps",
        speedStrategy:
          "Use tabular DI (Derivative-Integral) method for polynomial-exponential products.",
        rapidFireQuestion: "Evaluate ∫ x · e^(2x) dx.",
        rapidFireOptions: [
          "(x/2 - 1/4) e^(2x) + C",
          "(x/2 + 1/4) e^(2x) + C",
          "x e^(2x) - 2 e^(2x) + C",
          "(x - 1/2) e^(2x) + C",
        ],
        correctOptionIndex: 0,
        explanation:
          "Using tabular integration: D: x -> 1 -> 0, I: e^(2x) -> 1/2 e^(2x) -> 1/4 e^(2x). Result = 1/2 x e^(2x) - 1/4 e^(2x) + C.",
      },
      {
        id: "ag-trig-sub",
        topicName: "Trigonometric Transformations & Product-to-Sum",
        chapter: "Trigonometry",
        subject: "Mathematics",
        accuracy: 86,
        avgLatencySec: 62,
        benchmarkSec: 45,
        dominantSlip: "Hesitation between 2sinAcosB formulas",
        speedStrategy:
          "Recall 2sinAcosB = sin(A+B) + sin(A-B) as alternating sum.",
        rapidFireQuestion: "Express 2 sin(4θ) cos(2θ) as a sum of sines.",
        rapidFireOptions: [
          "sin(6θ) + sin(2θ)",
          "sin(6θ) - sin(2θ)",
          "cos(6θ) + cos(2θ)",
          "2 sin(6θ)",
        ],
        correctOptionIndex: 0,
        explanation:
          "2 sin A cos B = sin(A+B) + sin(A-B). Here A=4θ, B=2θ => sin(6θ) + sin(2θ).",
      },
      {
        id: "ag-kin-proj",
        topicName: "Projectile Motion: Maximum Range & Complementary Angles",
        chapter: "Kinematics",
        subject: "Physics",
        accuracy: 45,
        avgLatencySec: 22,
        benchmarkSec: 45,
        dominantSlip:
          "Impulsive rushing without reading flat vs inclined plane",
        speedStrategy:
          "Enforce 5-second problem diagramming before selecting formula.",
        rapidFireQuestion:
          "For projection angles θ and (90° - θ) at the same initial speed u, what is the ratio of horizontal ranges R1 : R2?",
        rapidFireOptions: ["1 : 1", "tan θ : 1", "sin θ : cos θ", "1 : 2"],
        correctOptionIndex: 0,
        explanation:
          "Horizontal range R = u² sin(2θ)/g. Since sin(2(90°-θ)) = sin(180°-2θ) = sin(2θ), the ranges are identical (1:1).",
      },
      {
        id: "ag-elec-coulomb",
        topicName: "Electrostatics: Coulomb's Law & Vector Superposition",
        chapter: "Electrostatics",
        subject: "Physics",
        accuracy: 52,
        avgLatencySec: 26,
        benchmarkSec: 50,
        dominantSlip: "Misplacing attraction/repulsion arrow directions",
        speedStrategy:
          "Draw explicit force vectors with charge signs at the test charge.",
        rapidFireQuestion:
          "If the distance between two point charges is halved and both charges are doubled, the electrostatic force becomes:",
        rapidFireOptions: ["16 times", "4 times", "8 times", "2 times"],
        correctOptionIndex: 0,
        explanation:
          "F = k q1 q2 / r². If q1, q2 double and r becomes r/2, F' = k(2)(2)/(1/2)² = 4 / (1/4) = 16 F.",
      },
      {
        id: "ag-optics-lens",
        topicName: "Ray Optics: Lens Maker's Formula & Thin Lens Combination",
        chapter: "Optics",
        subject: "Physics",
        accuracy: 42,
        avgLatencySec: 74,
        benchmarkSec: 50,
        dominantSlip: "Sign convention ambiguity in concave/convex radii",
        speedStrategy:
          "First-principles Cartesian sign convention drill on digital chalkboard.",
        rapidFireQuestion:
          "An equiconvex lens of focal length f is cut into two equal halves along the principal axis. The focal length of each half is:",
        rapidFireOptions: ["f", "2f", "f / 2", "4f"],
        correctOptionIndex: 0,
        explanation:
          "Cutting along the principal axis retains the same radius of curvature and refractive index, so focal length remains f.",
      },
      {
        id: "ag-chem-thermo",
        topicName: "Thermodynamics: Hess's Law & Enthalpy of Formation",
        chapter: "Thermodynamics",
        subject: "Chemistry",
        accuracy: 48,
        avgLatencySec: 78,
        benchmarkSec: 55,
        dominantSlip: "Reversing reaction stoichiometry signs incorrectly",
        speedStrategy:
          "Box target equation elements and multiply row-by-row systematically.",
        rapidFireQuestion:
          "For the reaction N2(g) + 3H2(g) -> 2NH3(g), what is the relation between ΔH and ΔU?",
        rapidFireOptions: [
          "ΔH = ΔU - 2RT",
          "ΔH = ΔU + 2RT",
          "ΔH = ΔU - RT",
          "ΔH = ΔU + RT",
        ],
        correctOptionIndex: 0,
        explanation:
          "Δn_g = 2 - (1 + 3) = -2. Using ΔH = ΔU + Δn_g RT => ΔH = ΔU - 2RT.",
      },
      {
        id: "ag-chem-rate",
        topicName: "Chemical Kinetics: Arrhenius Equation & Activation Energy",
        chapter: "Chemical Kinetics",
        subject: "Chemistry",
        accuracy: 90,
        avgLatencySec: 36,
        benchmarkSec: 45,
        dominantSlip: "Minor unit mismatch (J vs kJ)",
        speedStrategy:
          "Inspect slope m = -Ea / (2.303 R) from log k vs 1/T graphs directly.",
        rapidFireQuestion:
          "If a reaction's rate doubles when temperature increases from 300 K to 310 K, the temperature coefficient is:",
        rapidFireOptions: ["2", "1.5", "3", "0.5"],
        correctOptionIndex: 0,
        explanation:
          "Temperature coefficient μ = Rate at (T+10) / Rate at T = 2.",
      },
    ];

    // Compute Speed-Accuracy Quadrant Classification
    // Quadrants:
    // 1. Flow State (High Accuracy >= 75%, Fast Latency <= 45s) -> Emerald
    // 2. Overthink / Deep Thinker (High Accuracy >= 75%, Slow Latency > 45s) -> Sky/Blue
    // 3. Impulsive Rushing (Low Accuracy < 75%, Fast Latency <= 45s) -> Amber
    // 4. Cognitive Roadblock (Low Accuracy < 75%, Slow Latency > 45s) -> Rose
    const classifiedTopics = AGILITY_TOPICS.map((item) => {
      const isHighAcc = item.accuracy >= 75;
      const isFast = item.avgLatencySec <= 45;

      let quadrant: "flow" | "overthink" | "rushing" | "roadblock" = "flow";
      let quadrantTitle = "Flow State (Automaticity)";
      let quadrantBadge = "⚡ Optimal Mastery";
      let quadrantColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
      let prescription =
        "Maintain high-speed automaticity with weekly spaced recall.";

      if (isHighAcc && !isFast) {
        quadrant = "overthink";
        quadrantTitle = "Over-Calculation / Deep Deliberation";
        quadrantBadge = "⏱️ Slow but Accurate";
        quadrantColor = "text-sky-700 bg-sky-50 border-sky-200";
        prescription =
          "Learn algebraic shortcuts and tabular methods to save 30+ seconds per problem.";
      } else if (!isHighAcc && isFast) {
        quadrant = "rushing";
        quadrantTitle = "Impulsive Rushing / Panic Trap";
        quadrantBadge = "⚠️ Rushed Mistakes";
        quadrantColor = "text-amber-700 bg-amber-50 border-amber-200";
        prescription =
          "Enforce 5-second diagram verification before selecting an answer choice.";
      } else if (!isHighAcc && !isFast) {
        quadrant = "roadblock";
        quadrantTitle = "Cognitive Roadblock / Concept Gap";
        quadrantBadge = "🔴 Critical Bottleneck";
        quadrantColor = "text-rose-700 bg-rose-50 border-rose-200";
        prescription =
          "First-principles derivation with Cherry Ma'am on chalkboard to rebuild foundation.";
      }

      return {
        ...item,
        quadrant,
        quadrantTitle,
        quadrantBadge,
        quadrantColor,
        prescription,
      };
    });

    // Filter by subject and quadrant
    const filteredTopics = classifiedTopics.filter((t) => {
      if (
        staminaActiveSubject !== "all" &&
        t.subject.toLowerCase() !== staminaActiveSubject.toLowerCase()
      ) {
        return false;
      }
      if (
        staminaQuadrantFilter !== "all" &&
        t.quadrant !== staminaQuadrantFilter
      ) {
        return false;
      }
      return true;
    });

    const flowCount = classifiedTopics.filter(
      (t) => t.quadrant === "flow",
    ).length;
    const overthinkCount = classifiedTopics.filter(
      (t) => t.quadrant === "overthink",
    ).length;
    const rushingCount = classifiedTopics.filter(
      (t) => t.quadrant === "rushing",
    ).length;
    const roadblockCount = classifiedTopics.filter(
      (t) => t.quadrant === "roadblock",
    ).length;

    // Socratic Session Fatigue Degradation Timeline
    const sessionFatigueCurve = [
      {
        phase: "Warm-Up (0–10m)",
        accuracy: 88,
        latencySec: 36,
        cognitiveLoad: 42,
        status: "Calibrated",
      },
      {
        phase: "Peak Flow (10–25m)",
        accuracy: 94,
        latencySec: 29,
        cognitiveLoad: 28,
        status: "Zone of Genius",
      },
      {
        phase: "Cognitive Friction (25–40m)",
        accuracy: 79,
        latencySec: 46,
        cognitiveLoad: 68,
        status: "Early Fatigue",
      },
      {
        phase: "Exhaustion Dip (40m+)",
        accuracy: 63,
        latencySec: 64,
        cognitiveLoad: 89,
        status: "Socratic Dip",
      },
    ];

    // Predictive Exam Readiness Forecast
    const projectedRawScore = Math.min(
      96,
      Math.max(
        68,
        Math.round(
          (flowCount * 96 +
            overthinkCount * 88 +
            rushingCount * 65 +
            roadblockCount * 45) /
            Math.max(1, classifiedTopics.length),
        ),
      ),
    );
    const confidenceMargin = 4;
    const agilityScore = Math.round(
      ((flowCount * 1.0 +
        overthinkCount * 0.75 +
        rushingCount * 0.5 +
        roadblockCount * 0.3) /
        classifiedTopics.length) *
        100,
    );

    return {
      topics: filteredTopics,
      allTopics: classifiedTopics,
      flowCount,
      overthinkCount,
      rushingCount,
      roadblockCount,
      sessionFatigueCurve,
      projectedRawScore,
      confidenceMargin,
      agilityScore,
      optimalFocusMinutes: 25,
    };
  }, [staminaQuadrantFilter, staminaActiveSubject]);



  return (
                  <div className="space-y-4 sm:space-y-5 animate-fade-in text-left">
                    {/* Hero Header for Agility & Stamina */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 text-slate-900 shadow-xs relative overflow-hidden space-y-4">
                      <div className="absolute -top-10 -right-10 w-52 h-52 bg-indigo-50/60 rounded-full blur-3xl pointer-events-none" />

                      {/* Top Info Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 z-10 relative">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#796AEF] border border-indigo-100/90 text-[11px] font-bold shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#796AEF] animate-pulse" />
                              Speed-Accuracy &amp; Stamina Engine
                            </span>
                            <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200/70">
                              Cognitive Benchmark: <strong className="text-slate-800">&lt;45s Latency</strong>
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                            {studentName
                              ? `${studentName}'s Socratic Agility, Fatigue Curve & Exam Readiness`
                              : "Socratic Agility, Fatigue Curve & Exam Readiness"}
                          </h3>
                          <p className="text-xs text-slate-600 font-sans leading-relaxed max-w-2xl">
                            Surgically correlates response latency against conceptual precision to eliminate test anxiety, over-calculation, and cognitive fatigue.
                          </p>
                        </div>
                      </div>

                      {/* 4 Summary Metrics - 2x2 Grid on Mobile, 4x1 on Desktop */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 z-10 relative pt-0.5">
                        <div className="bg-slate-50/90 border border-slate-200/70 rounded-xl p-2.5 sm:p-3 text-center transition-all hover:bg-white hover:shadow-2xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            {isEnglish ? "Mental Agility • Speed" : "मानसिक गति • Agility"}
                          </span>
                          <span className="text-lg sm:text-xl font-black text-slate-900 font-mono block my-0.5">
                            {staminaAnalyticsData.agilityScore}/100
                          </span>
                          <span className="text-[10.5px] text-slate-600 font-medium block">
                            {isEnglish ? "Thought & Solution Speed" : "विचार व हल गति"}
                          </span>
                        </div>

                        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 sm:p-3 text-center transition-all hover:bg-emerald-50 hover:shadow-2xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                            {isEnglish ? "Flow State • Flow (Q1)" : "फ़्लो स्टेट • Flow (Q1)"}
                          </span>
                          <span className="text-lg sm:text-xl font-black text-emerald-800 font-mono block my-0.5">
                            {staminaAnalyticsData.flowCount}
                          </span>
                          <span className="text-[10.5px] text-emerald-800 font-semibold block">
                            {isEnglish ? "<45s & >75% Accuracy" : "<45s व >75% सटीकता"}
                          </span>
                        </div>

                        <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-2.5 sm:p-3 text-center transition-all hover:bg-sky-50 hover:shadow-2xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">
                            {isEnglish ? "Overthinking • Overthink (Q2)" : "अति-विचार • Overthink (Q2)"}
                          </span>
                          <span className="text-lg sm:text-xl font-black text-sky-800 font-mono block my-0.5">
                            {staminaAnalyticsData.overthinkCount}
                          </span>
                          <span className="text-[10.5px] text-sky-800 font-semibold block">
                            {isEnglish ? "Slow but Correct" : "धीमा पर सही हल"}
                          </span>
                        </div>

                        <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-2.5 sm:p-3 text-center transition-all hover:bg-indigo-50 hover:shadow-2xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#796AEF] block">
                            {isEnglish ? "Projected Score • Target" : "अनुमानित स्कोर • Projected"}
                          </span>
                          <span className="text-lg sm:text-xl font-black text-[#796AEF] font-mono block my-0.5">
                            {staminaAnalyticsData.projectedRawScore}%
                          </span>
                          <span className="text-[10.5px] text-[#796AEF] font-semibold block">
                            {isEnglish
                              ? `±${staminaAnalyticsData.confidenceMargin}% Exam Margin`
                              : `±${staminaAnalyticsData.confidenceMargin}% परीक्षा दायरा`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 1: THE 4-QUADRANT SPEED VS ACCURACY COGNITIVE MATRIX */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 gap-2">
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-[#796AEF] border border-indigo-100/90 flex items-center justify-center shrink-0 text-xs shadow-2xs">
                              <Gauge className="w-3.5 h-3.5 text-[#796AEF]" />
                            </span>
                            <span>
                              {isEnglish
                                ? "Speed vs Accuracy Matrix • 4-Quadrant Diagnostics"
                                : "Speed vs Accuracy Matrix • गति व सटीकता 4-क्वाड्रेंट"}
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {isEnglish
                              ? "High accuracy paired with disciplined speed is essential for board and competitive exams. Identify where you hesitate or rush."
                              : "बोर्ड व प्रतियोगी परीक्षाओं में उच्च सटीकता के साथ उचित गति अनिवार्य है। पहचानें कि आप कहाँ संकोच करते हैं या जल्दबाज़ी।"}
                          </p>
                        </div>
                        <span className="text-[10.5px] font-mono font-bold text-[#796AEF] bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/80 shrink-0 self-start sm:self-auto shadow-2xs">
                          {isEnglish ? "🎯 Target: 45s per Question" : "🎯 मानक: 45s प्रति प्रश्न"}
                        </span>
                      </div>

                      {/* Visual 4-Quadrant Layout - Horizontal Swipe Deck on Mobile */}
                      <div className="flex items-center justify-between md:hidden text-[11px] font-mono text-slate-500 font-semibold px-1 pb-1">
                        <span>{isEnglish ? "← Swipe 4 Quadrants →" : "← स्वाइप करें 4 क्वाड्रेंट →"}</span>
                        <span>{isEnglish ? "Tap to Filter" : "टैप करके फ़िल्टर करें"}</span>
                      </div>
                      <div className="flex md:grid md:grid-cols-2 overflow-x-auto md:overflow-visible gap-3.5 pt-1 pb-2 md:pb-0 snap-x snap-mandatory scrollbar-thin">
                        {/* Quadrant 1: Flow State */}
                        <div
                          onClick={() =>
                            setStaminaQuadrantFilter(
                              staminaQuadrantFilter === "flow" ? "all" : "flow",
                            )
                          }
                          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between w-[85vw] sm:w-[360px] md:w-auto shrink-0 md:shrink snap-center shadow-2xs min-h-[145px] ${
                            staminaQuadrantFilter === "flow"
                              ? "bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-400/40 shadow-sm"
                              : "bg-gradient-to-br from-emerald-50/30 via-white to-white hover:bg-emerald-50/60 border-emerald-200/80"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono text-xs font-black">
                                  Q1
                                </span>
                                <div>
                                  <h5 className="text-xs font-black text-emerald-950 tracking-tight">
                                    {isEnglish ? "Flow State (Effortless & Confident)" : "Flow State (फ़्लो स्टेट • स्वतः स्फूर्त)"}
                                  </h5>
                                  <span className="text-[10.5px] font-mono text-emerald-800">
                                    {isEnglish ? "Fast (<45s) • High Accuracy (>75%)" : "तेज़ (<45s) • उच्च सटीकता (>75%)"}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {staminaAnalyticsData.flowCount} Topics
                              </span>
                            </div>
                            <p className="text-[11.5px] text-zinc-600 leading-relaxed">
                              {isEnglish
                                ? "Concepts recalled effortlessly with zero hesitation. Solved naturally even under exam-room pressure."
                                : "कॉन्सेप्ट्स बिना किसी हिचकिचाहट के याद हैं। परीक्षा के दबाव में भी सहजता से हल होते हैं।"}
                            </p>
                          </div>
                          <div className="mt-3 pt-2.5 border-t border-emerald-200/60 flex items-center justify-between text-[10.5px] font-mono font-bold text-emerald-800">
                            <span>
                              {isEnglish ? "✅ Strategy: Maintain with weekly spaced revision" : "✅ रणनीति: साप्ताहिक रिवीज़न से अभ्यास बनाए रखें"}
                            </span>
                            <span>
                              {staminaQuadrantFilter === "flow"
                                ? (isEnglish ? "Active Filter" : "सक्रिय फ़िल्टर")
                                : (isEnglish ? "Filter →" : "फ़िल्टर करें →")}
                            </span>
                          </div>
                        </div>

                        {/* Quadrant 2: Overthink / Deep Thinker */}
                        <div
                          onClick={() =>
                            setStaminaQuadrantFilter(
                              staminaQuadrantFilter === "overthink"
                                ? "all"
                                : "overthink",
                            )
                          }
                          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between w-[85vw] sm:w-[360px] md:w-auto shrink-0 md:shrink snap-center shadow-2xs min-h-[145px] ${
                            staminaQuadrantFilter === "overthink"
                              ? "bg-sky-50/90 border-sky-500 ring-2 ring-sky-400/40 shadow-sm"
                              : "bg-gradient-to-br from-sky-50/30 via-white to-white hover:bg-sky-50/60 border-sky-200/80"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="p-1 rounded-lg bg-sky-100 text-sky-800 font-mono text-xs font-black">
                                  Q2
                                </span>
                                <div>
                                  <h5 className="text-xs font-black text-sky-950 tracking-tight">
                                    {isEnglish ? "Over-Calculation (Hesitation & Overthinking)" : "Over-Calculation (अति-विचार व संकोच)"}
                                  </h5>
                                  <span className="text-[10.5px] font-mono text-sky-800">
                                    {isEnglish ? "Slow (>45s) • High Accuracy (>75%)" : "धीमा (>45s) • उच्च सटीकता (>75%)"}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                                {staminaAnalyticsData.overthinkCount} Topics
                              </span>
                            </div>
                            <p className="text-[11.5px] text-zinc-600 leading-relaxed">
                              {isEnglish
                                ? "Concept is clear, but writing unnecessarily long derivation steps risks running out of time in the exam."
                                : "सिद्धांत आता है, लेकिन अनावश्यक लंबे स्टेप्स लिखने के कारण परीक्षा में समय समाप्त होने का जोखिम रहता है।"}
                            </p>
                          </div>
                          <div className="mt-3 pt-2.5 border-t border-sky-200/60 flex items-center justify-between text-[10.5px] font-mono font-bold text-sky-800">
                            <span>
                              {isEnglish ? "⚡ Solution: Practice shortcuts & direct formula recall" : "⚡ समाधान: शॉर्टकट ट्रिक्स व डायरेक्ट फॉर्मूला अभ्यास"}
                            </span>
                            <span>
                              {staminaQuadrantFilter === "overthink"
                                ? (isEnglish ? "Active Filter" : "सक्रिय फ़िल्टर")
                                : (isEnglish ? "Filter →" : "फ़िल्टर करें →")}
                            </span>
                          </div>
                        </div>

                        {/* Quadrant 3: Impulsive Rushing */}
                        <div
                          onClick={() =>
                            setStaminaQuadrantFilter(
                              staminaQuadrantFilter === "rushing"
                                ? "all"
                                : "rushing",
                            )
                          }
                          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between w-[85vw] sm:w-[360px] md:w-auto shrink-0 md:shrink snap-center shadow-2xs min-h-[145px] ${
                            staminaQuadrantFilter === "rushing"
                              ? "bg-amber-50/90 border-amber-500 ring-2 ring-amber-400/40 shadow-sm"
                              : "bg-gradient-to-br from-amber-50/30 via-white to-white hover:bg-amber-50/60 border-amber-200/80"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="p-1 rounded-lg bg-amber-100 text-amber-800 font-mono text-xs font-black">
                                  Q3
                                </span>
                                <div>
                                  <h5 className="text-xs font-black text-amber-950 tracking-tight">
                                    {isEnglish ? "Impulsive Rushing (Silly Mistakes under Speed)" : "Impulsive Rushing (जल्दबाज़ी में सिली मिस्टेक)"}
                                  </h5>
                                  <span className="text-[10.5px] font-mono text-amber-800">
                                    {isEnglish ? "Fast (<45s) • Low Accuracy (<75%)" : "तेज़ (<45s) • कम सटीकता (<75%)"}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                {staminaAnalyticsData.rushingCount} Topics
                              </span>
                            </div>
                            <p className="text-[11.5px] text-zinc-600 leading-relaxed">
                              {isEnglish
                                ? "Picking wrong options in excitement without reading the full question or checking units and signs."
                                : "प्रश्न को पूरा पढ़े बिना या मात्रक/चिह्न की जांच किए बिना अति-उत्साह में गलत विकल्प चुन लेना।"}
                            </p>
                          </div>
                          <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex items-center justify-between text-[10.5px] font-mono font-bold text-amber-800">
                            <span>
                              {isEnglish ? "🛑 Solution: 5-second pause & re-check rule" : "🛑 समाधान: 5-सेकंड ठहराव और प्रश्न री-चेक नियम"}
                            </span>
                            <span>
                              {staminaQuadrantFilter === "rushing"
                                ? (isEnglish ? "Active Filter" : "सक्रिय फ़िल्टर")
                                : (isEnglish ? "Filter →" : "फ़िल्टर करें →")}
                            </span>
                          </div>
                        </div>

                        {/* Quadrant 4: Cognitive Roadblock */}
                        <div
                          onClick={() =>
                            setStaminaQuadrantFilter(
                              staminaQuadrantFilter === "roadblock"
                                ? "all"
                                : "roadblock",
                            )
                          }
                          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between w-[85vw] sm:w-[360px] md:w-auto shrink-0 md:shrink snap-center shadow-2xs min-h-[145px] ${
                            staminaQuadrantFilter === "roadblock"
                              ? "bg-rose-50/90 border-rose-500 ring-2 ring-rose-400/40 shadow-sm"
                              : "bg-gradient-to-br from-rose-50/30 via-white to-white hover:bg-rose-50/60 border-rose-200/80"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="p-1 rounded-lg bg-rose-100 text-rose-800 font-mono text-xs font-black">
                                  Q4
                                </span>
                                <div>
                                  <h5 className="text-xs font-black text-rose-950 tracking-tight">
                                    {isEnglish ? "Cognitive Roadblock (Fundamental Gap)" : "Cognitive Roadblock (गंभीर रुकावट)"}
                                  </h5>
                                  <span className="text-[10.5px] font-mono text-rose-800">
                                    {isEnglish ? "Slow (>45s) • Low Accuracy (<75%)" : "धीमा (>45s) • कम सटीकता (<75%)"}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                                {staminaAnalyticsData.roadblockCount} Topics
                              </span>
                            </div>
                            <p className="text-[11.5px] text-zinc-600 leading-relaxed">
                              {isEnglish
                                ? "Core theory is unclear, leading to high hesitation, confusion, and wrong derivations."
                                : "बुनियादी कॉन्सेप्ट स्पष्ट नहीं है जिससे प्रश्न शुरू करने में भी अत्यधिक समय व गलत उत्तर आते हैं।"}
                            </p>
                          </div>
                          <div className="mt-3 pt-2.5 border-t border-rose-200/60 flex items-center justify-between text-[10.5px] font-mono font-bold text-rose-800">
                            <span>
                              {isEnglish ? "💡 Solution: Master core theory with Cherry on blackboard" : "💡 समाधान: मैम के साथ ब्लैकबोर्ड पर मूल कॉन्सेप्ट समझें"}
                            </span>
                            <span>
                              {staminaQuadrantFilter === "roadblock"
                                ? (isEnglish ? "Active Filter" : "सक्रिय फ़िल्टर")
                                : (isEnglish ? "Filter →" : "फ़िल्टर करें →")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: SOCRATIC SESSION FATIGUE & EXAM PACING FORECAST */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 text-left">
                      {/* Sub-Card 1: Mental Fatigue Degradation Curve (2 Cols) */}
                      <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 gap-2">
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-[#796AEF] border border-indigo-100/90 flex items-center justify-center shrink-0 text-xs shadow-2xs">
                                <Activity className="w-3.5 h-3.5 text-[#796AEF]" />
                              </span>
                              <span>
                                {isEnglish
                                  ? "Session Stamina & Fatigue • Cognitive Curve"
                                  : "Session Stamina & Fatigue • अध्ययन सहनशक्ति व मानसिक थकान वक्र"}
                              </span>
                            </h4>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {isEnglish
                                ? "Progression of concentration & precision across a 45-minute study session"
                                : "45-मिनट अभ्यास सत्र में आपकी एकाग्रता व सटीकता में आने वाले बदलाव"}
                            </span>
                          </div>
                          <span className="text-[10.5px] font-mono font-bold text-[#796AEF] bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/80 shrink-0 self-start sm:self-auto shadow-2xs">
                            {isEnglish ? "🧠 Peak Focus: 25 Minutes" : "🧠 सर्वश्रेष्ठ एकाग्रता: 25 मिनट"}
                          </span>
                        </div>

                        {/* Fatigue Timeline Cards - Horizontal Swipe Rail on Mobile */}
                        <div className="flex items-center justify-between sm:hidden text-[11px] font-mono text-slate-500 font-semibold pb-0.5">
                          <span>{isEnglish ? "← Swipe 45-Min Timeline →" : "← स्वाइप करें 45-मिनट टाइमलाइन →"}</span>
                          <span>{isEnglish ? "4 Phases" : "4 चरण"}</span>
                        </div>
                        <div className="flex sm:grid sm:grid-cols-2 overflow-x-auto sm:overflow-visible gap-3 pt-0.5 pb-2 sm:pb-0 snap-x snap-mandatory scrollbar-thin">
                          {staminaAnalyticsData.sessionFatigueCurve.map(
                            (phase, pIdx) => {
                              const isZoneOfGenius = pIdx === 1;
                              const isDip = pIdx === 3;

                              return (
                                <div
                                  key={pIdx}
                                  className={`p-3.5 rounded-xl border space-y-2 w-[76vw] sm:w-auto shrink-0 sm:shrink snap-center transition-all ${
                                    isZoneOfGenius
                                      ? "bg-emerald-50/70 border-emerald-300/90 shadow-2xs"
                                      : isDip
                                        ? "bg-rose-50/70 border-rose-300/90 shadow-2xs"
                                        : "bg-slate-50/90 border-slate-200/70"
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-xs font-black">
                                    <span className="text-slate-900 font-bold">
                                      {phase.phase}
                                    </span>
                                    <span
                                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                                        isZoneOfGenius
                                          ? "bg-emerald-200/80 text-emerald-900 border border-emerald-300/70"
                                          : isDip
                                            ? "bg-rose-200/80 text-rose-900 border border-rose-300/70"
                                            : "bg-slate-200/80 text-slate-800 border border-slate-300/70"
                                      }`}
                                    >
                                      {phase.status}
                                    </span>
                                  </div>

                                  <div className="space-y-1 text-[11px] font-mono text-slate-600">
                                    <div className="flex items-center justify-between">
                                      <span>{isEnglish ? "Accuracy:" : "सटीकता (Accuracy):"}</span>
                                      <strong
                                        className={
                                          phase.accuracy >= 80
                                            ? "text-emerald-700 font-bold"
                                            : "text-rose-700 font-bold"
                                        }
                                      >
                                        {phase.accuracy}%
                                      </strong>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span>{isEnglish ? "Average Latency:" : "औसत गति (Latency):"}</span>
                                      <strong className="text-slate-800">
                                        {phase.latencySec}s {isEnglish ? "/ question" : "/ प्रश्न"}
                                      </strong>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span>{isEnglish ? "Cognitive Load:" : "मानसिक भार (Load):"}</span>
                                      <strong className="text-slate-800">
                                        {phase.cognitiveLoad}%
                                      </strong>
                                    </div>
                                  </div>

                                  <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${
                                        isZoneOfGenius
                                          ? "bg-emerald-500"
                                          : isDip
                                            ? "bg-rose-500"
                                            : "bg-indigo-500"
                                      }`}
                                      style={{ width: `${phase.accuracy}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>

                        <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 flex items-start gap-2.5 text-[11.5px] text-amber-900">
                          <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <p className="leading-relaxed">
                            <strong>{isEnglish ? "Cherry Ma'am's Advice:" : "परामर्श (Cherry Ma'am's Advice):"}</strong>{" "}
                            {isEnglish
                              ? "Take a quick 3-minute break after 25 minutes of continuous problem solving. This resets your working memory and prevents late-session silly mistakes."
                              : "लगातार 25 मिनट प्रश्न हल करने के बाद 3 मिनट का संक्षेप विश्राम लें। इससे वर्किंग मेमोरी रीसेट होती है और 40वें मिनट में होने वाली गलतियों से बचाव होता है।"}
                          </p>
                        </div>
                      </div>

                      {/* Sub-Card 2: Predictive Board Exam Target Projector (1 Col) */}
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 flex flex-col justify-between">
                        <div className="space-y-1 pb-3 border-b border-slate-200/80">
                          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-[#796AEF] border border-indigo-100/90 flex items-center justify-center shrink-0 text-xs shadow-2xs">
                              <Target className="w-3.5 h-3.5 text-[#796AEF]" />
                            </span>
                            <span>
                              {isEnglish
                                ? "Exam Target Projector • Score Forecast"
                                : "Exam Target Projector • परीक्षा स्कोर अनुमान"}
                            </span>
                          </h4>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {isEnglish
                              ? "Projection based on current speed and precision metrics"
                              : "वर्तमान गति व सटीकता के आधार पर प्रक्षेपण"}
                          </span>
                        </div>

                        {/* Projected Big Score Dial */}
                        <div className="bg-slate-50/90 p-4 sm:p-5 rounded-xl text-center text-slate-900 border border-slate-200/70 space-y-1.5 shadow-2xs">
                          <span className="text-[10px] uppercase tracking-widest text-[#796AEF] font-bold block">
                            {isEnglish
                              ? "Projected Exam Score • Projected Mastery"
                              : "अनुमानित परीक्षा स्कोर • Projected Mastery"}
                          </span>
                          <div className="text-3xl sm:text-4xl font-black text-[#796AEF] font-mono tracking-tight">
                            {staminaAnalyticsData.projectedRawScore}%
                          </div>
                          <span className="text-[11px] font-mono text-slate-600 block">
                            {isEnglish ? "Confidence Interval: " : "विश्वास दायरा: "}
                            <strong className="text-slate-900 font-bold">
                              {staminaAnalyticsData.projectedRawScore -
                                staminaAnalyticsData.confidenceMargin}
                              % –{" "}
                              {staminaAnalyticsData.projectedRawScore +
                                staminaAnalyticsData.confidenceMargin}
                              %
                            </strong>
                          </span>
                        </div>

                        {/* Time Allocation Breakdown */}
                        <div className="space-y-2 text-[11px] font-mono">
                          <span className="text-slate-600 font-bold uppercase tracking-wider text-[10px] block">
                            {isEnglish
                              ? "Optimal 3-Hour Board Paper Time Allocation:"
                              : "3-घंटे के बोर्ड पेपर का आदर्श समय विभाजन:"}
                          </span>
                          <div className="space-y-1 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/70">
                            <div className="flex items-center justify-between text-slate-700">
                              <span>{isEnglish ? "Section A (MCQ / Quick):" : "खण्ड अ (MCQ / त्वरित प्रश्न):"}</span>
                              <strong className="text-slate-900">{isEnglish ? "35 mins (1.5m / Q)" : "35 मिनट (1.5m / Q)"}</strong>
                            </div>
                            <div className="flex items-center justify-between text-slate-700">
                              <span>{isEnglish ? "Section B (Short Answer):" : "खण्ड ब (लघु उत्तरीय प्रश्न):"}</span>
                              <strong className="text-slate-900">{isEnglish ? "55 mins (3.5m / Q)" : "55 मिनट (3.5m / Q)"}</strong>
                            </div>
                            <div className="flex items-center justify-between text-slate-700">
                              <span>{isEnglish ? "Section C (Long Derivations):" : "खण्ड स (दीर्घ उत्तरीय प्रश्न):"}</span>
                              <strong className="text-slate-900">{isEnglish ? "60 mins (7.5m / Q)" : "60 मिनट (7.5m / Q)"}</strong>
                            </div>
                            <div className="flex items-center justify-between text-emerald-800 font-bold border-t border-slate-200/70 pt-1">
                              <span>{isEnglish ? "Review & Buffer (Safety Reserve):" : "पुनरीक्षण व जांच (Buffer Reserve):"}</span>
                              <strong>{isEnglish ? "30 mins (Buffer Safety)" : "30 मिनट (स्वर्णिम सुरक्षा)"}</strong>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (onDiscussWithCherry) {
                              onDiscussWithCherry({
                                topic:
                                  "Exam Time Management & Speed-Accuracy Optimization",
                                subject: subject || "Mathematics",
                                conceptTested: "Exam Pacing Strategy",
                                hint: "Learn 3-pass exam scanning: solve easy flow questions first, then overthink items, leaving roadblocks for last.",
                                question:
                                  "Cherry Ma'am, how should I manage my time and pacing during the final board exam to avoid silly mistakes and rushing?",
                              });
                            } else if (onEnterClassroom) {
                              onEnterClassroom();
                            }
                          }}
                          className="min-h-[44px] w-full py-2.5 px-3 rounded-xl bg-[#796AEF] hover:bg-indigo-700 text-white text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer active:scale-95"
                        >
                          <Sparkles className="w-3.5 h-3.5 shrink-0" />
                          <span>{isEnglish ? "Discuss Exam Strategy with Cherry 🚀" : "परीक्षा रणनीति मैम से समझें 🚀"}</span>
                        </button>
                      </div>
                    </div>

                    {/* SECTION 3: TOPICS AGILITY QUEUE & RAPID-FIRE SPEED DRILL SIMULATOR */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 text-left">
                      {/* Filter Bar with Mobile Carousel/Grid Mode Toggle */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-slate-200/80">
                        <div className="flex items-center justify-between w-full lg:w-auto">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-[#796AEF] border border-indigo-100/90 flex items-center justify-center shrink-0 shadow-2xs">
                              <Zap className="w-3.5 h-3.5 text-[#796AEF]" />
                            </span>
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                                {isEnglish
                                  ? `Agility Queue • Topic Speed Practice (${staminaAnalyticsData.topics.length})`
                                  : `Agility Queue • विषयवार गति व अभ्यास (${staminaAnalyticsData.topics.length})`}
                              </h4>
                              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                                {isEnglish
                                  ? "Learn shortcuts with a 45-second timer and turn hesitation into flow state"
                                  : "45-सेकंड टाइमर के साथ शॉर्टकट सीखें और संकोच को फ़्लो स्टेट में बदलें"}
                              </span>
                            </div>
                          </div>

                          {/* View Mode Toggle */}
                          <div className="flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/80 shrink-0">
                            <button
                              type="button"
                              onClick={() => setStaminaViewMode("carousel")}
                              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                                staminaViewMode === "carousel"
                                  ? "bg-[#796AEF] text-white shadow-2xs font-bold"
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                              title="Horizontal Swipe Deck"
                            >
                              🎴 Deck
                            </button>
                            <button
                              type="button"
                              onClick={() => setStaminaViewMode("list")}
                              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                                staminaViewMode === "list"
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
                              onClick={() => setStaminaActiveSubject(subj)}
                              className={`min-h-[44px] sm:min-h-[36px] px-3.5 py-2 rounded-xl text-xs sm:text-[10.5px] font-mono font-bold transition-all cursor-pointer shrink-0 border flex items-center justify-center ${
                                staminaActiveSubject === subj
                                  ? "bg-[#796AEF] text-white border-[#796AEF] shadow-2xs font-bold"
                                  : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900"
                              }`}
                            >
                              {subj === "all" ? (isEnglish ? "🌐 All Subjects" : "🌐 सभी विषय") : subj}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quadrant Filter Tabs */}
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        {[
                          {
                            key: "all",
                            label: isEnglish ? "All" : "सभी (All)",
                            count: staminaAnalyticsData.allTopics.length,
                          },
                          {
                            key: "flow",
                            label: "⚡ Flow (Q1)",
                            count: staminaAnalyticsData.flowCount,
                          },
                          {
                            key: "overthink",
                            label: "⏱️ Overthinking (Q2)",
                            count: staminaAnalyticsData.overthinkCount,
                          },
                          {
                            key: "rushing",
                            label: "⚠️ Rushing (Q3)",
                            count: staminaAnalyticsData.rushingCount,
                          },
                          {
                            key: "roadblock",
                            label: "🔴 Roadblocks (Q4)",
                            count: staminaAnalyticsData.roadblockCount,
                          },
                        ].map((tab) => (
                          <button
                            key={tab.key}
                            type="button"
                            onClick={() =>
                              setStaminaQuadrantFilter(tab.key as any)
                            }
                            className={`min-h-[44px] sm:min-h-[36px] px-3.5 py-2 rounded-xl text-xs sm:text-[10.5px] font-mono font-bold transition-all cursor-pointer shrink-0 border flex items-center justify-center ${
                              staminaQuadrantFilter === tab.key
                                ? "bg-[#796AEF] text-white border-[#796AEF] shadow-2xs font-bold"
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

                      {/* Topics Cards Grid (Swipe Deck vs Grid) */}
                      {staminaAnalyticsData.topics.length > 0 ? (
                        <>
                          {staminaViewMode === "carousel" && (
                            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 font-semibold px-1 pb-0.5">
                              <span>
                                {isEnglish
                                  ? `← Swipe Practice Topics (${staminaAnalyticsData.topics.length} topics) →`
                                  : `← स्वाइप करें अभ्यास टॉपिक्स (${staminaAnalyticsData.topics.length} topics) →`}
                              </span>
                              <span>{isEnglish ? "Touch & Drag" : "टच व ड्रैग"}</span>
                            </div>
                          )}
                          <div
                            className={
                              staminaViewMode === "carousel"
                                ? "flex overflow-x-auto gap-3.5 pb-3 pt-0.5 snap-x snap-mandatory scrollbar-thin"
                                : "grid grid-cols-1 md:grid-cols-2 gap-3.5"
                            }
                          >
                            {staminaAnalyticsData.topics.map((item) => {
                              const isOverthink = item.quadrant === "overthink";
                              const isRushing = item.quadrant === "rushing";
                              const isRoadblock = item.quadrant === "roadblock";

                              return (
                                <div
                                  key={item.id}
                                  className={`rounded-2xl border p-4 transition-all flex flex-col justify-between space-y-3 relative overflow-hidden bg-white shadow-2xs hover:shadow-xs ${
                                    staminaViewMode === "carousel"
                                      ? "w-[85vw] sm:w-[360px] shrink-0 snap-center"
                                      : ""
                                  } ${
                                    isRoadblock
                                      ? "border-rose-200/90 hover:border-rose-300"
                                      : isOverthink
                                        ? "border-sky-200/90 hover:border-sky-300"
                                        : isRushing
                                          ? "border-amber-200/90 hover:border-amber-300"
                                          : "border-emerald-200/90 hover:border-emerald-300"
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

                                      {/* Quadrant Badge */}
                                      <span
                                        className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md border shrink-0 ${item.quadrantColor}`}
                                      >
                                        {item.quadrantBadge}
                                      </span>
                                    </div>

                                    <h5 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-snug">
                                      {item.topicName}
                                    </h5>
                                  </div>

                                  {/* Speed & Accuracy Benchmarks */}
                                  <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/70 space-y-2">
                                    <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono">
                                      <div className="bg-white p-2 rounded-lg border border-slate-200/70 shadow-2xs">
                                        <span className="text-slate-500 block text-[10px] uppercase font-bold">
                                          {isEnglish ? "Your Speed:" : "आपकी गति:"}
                                        </span>
                                        <span className="text-xs font-black text-slate-900">
                                          {item.avgLatencySec}s
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-medium ml-1">
                                          ({isEnglish ? "Target" : "लक्ष्य"}: {item.benchmarkSec}s)
                                        </span>
                                      </div>
                                      <div className="bg-white p-2 rounded-lg border border-slate-200/70 shadow-2xs">
                                        <span className="text-slate-500 block text-[10px] uppercase font-bold">
                                          {isEnglish ? "Accuracy:" : "सटीकता:"}
                                        </span>
                                        <span
                                          className={`text-xs font-black ${item.accuracy >= 75 ? "text-emerald-700" : "text-rose-700"}`}
                                        >
                                          {item.accuracy}% Accuracy
                                        </span>
                                      </div>
                                    </div>

                                    <div className="text-[10.5px] font-mono text-slate-600 bg-white/80 p-2 rounded-lg border border-slate-200/60 leading-snug">
                                      <strong className="text-slate-900">
                                        {isEnglish ? "⚡ Speed Strategy:" : "⚡ गति रणनीति:"}
                                      </strong>{" "}
                                      {item.speedStrategy}
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/70">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedAgilityDrillTopic(item);
                                        setActiveSprintSeconds(45);
                                        setIsSprintRunning(false);
                                        setSprintStepIndex(0);
                                        setSprintScore(0);
                                      }}
                                      className="min-h-[44px] px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50/80 text-slate-700 hover:text-[#796AEF] border border-slate-200/80 hover:border-indigo-200/80 text-[11px] font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                                    >
                                      <Gauge className="w-3.5 h-3.5 text-indigo-500" />
                                      <span>{isEnglish ? "Start Drill" : "ड्रिल शुरू"}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (onDiscussWithCherry) {
                                          onDiscussWithCherry({
                                            topic: item.topicName,
                                            subject: item.subject,
                                            conceptTested: item.topicName,
                                            hint: item.speedStrategy,
                                            question: `Cherry Ma'am, please show me the fastest intuitive shortcut and blackboard derivation for ${item.topicName} so I can solve it in under 30 seconds!`,
                                          });
                                        } else if (onEnterClassroom) {
                                          onEnterClassroom();
                                        }
                                      }}
                                      className="min-h-[44px] px-2.5 py-2 rounded-xl bg-[#796AEF] hover:bg-indigo-700 text-white text-[11px] font-bold tracking-wide font-mono transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                                    >
                                      <Zap className="w-3.5 h-3.5 text-white" />
                                      <span>{isEnglish ? "Learn Shortcut 🚀" : "शॉर्टकट सीखें 🚀"}</span>
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
                            {isEnglish ? "No topics found for this quadrant." : "इस क्वाड्रेंट के लिए कोई टॉपिक नहीं मिला।"}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setStaminaActiveSubject("all");
                              setStaminaQuadrantFilter("all");
                            }}
                            className="text-[11px] font-mono font-bold text-[#796AEF] hover:underline cursor-pointer"
                          >
                            {isEnglish ? "Reset Filters" : "फ़िल्टर रीसेट करें"}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Interactive Rapid-Fire Speed Drill Modal */}
                    {selectedAgilityDrillTopic && (
                      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
                        <div className="bg-white border border-slate-200/80 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden text-left text-slate-900">
                          {/* Modal Header */}
                          <div className="px-5 py-4 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0">
                            <div className="space-y-0.5 min-w-0 pr-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-50 text-[#796AEF] px-2 py-0.5 rounded-md border border-indigo-100/90 shadow-2xs">
                                  {selectedAgilityDrillTopic.subject} • {isEnglish ? "45s Speed Drill" : "45s स्पीड ड्रिल"}
                                </span>
                                <span className="text-[10.5px] font-mono text-emerald-800 font-bold">
                                  {isEnglish ? "Benchmark: " : "आदर्श समय: "}
                                  <strong>
                                    {selectedAgilityDrillTopic.benchmarkSec}s
                                  </strong>
                                </span>
                              </div>
                              <h3 className="text-sm font-bold text-slate-900 truncate">
                                {selectedAgilityDrillTopic.topicName}
                              </h3>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedAgilityDrillTopic(null)}
                              className="min-h-[44px] min-w-[44px] sm:min-h-[38px] sm:min-w-[38px] flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                              title={isEnglish ? "Close" : "बंद करें"}
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Speed Drill Body */}
                          <div className="p-4 sm:p-6 space-y-4">
                            {/* Question Card */}
                            <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
                              <div className="flex items-center justify-between text-xs font-mono text-[#796AEF]">
                                <span className="font-bold flex items-center gap-1.5">
                                  <Zap className="w-3.5 h-3.5 text-[#796AEF]" />{" "}
                                  {isEnglish ? "Rapid-Fire Question:" : "रैपिड-फ़ायर प्रश्न (Rapid Question):"}
                                </span>
                                <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  {isEnglish ? "Target: <30s" : "लक्ष्य: <30s"}
                                </span>
                              </div>

                              <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                                {selectedAgilityDrillTopic.rapidFireQuestion}
                              </p>

                              {/* Options Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                                {selectedAgilityDrillTopic.rapidFireOptions.map(
                                  (opt: string, optIdx: number) => {
                                    const isCorrect =
                                      optIdx ===
                                      selectedAgilityDrillTopic.correctOptionIndex;
                                    return (
                                      <button
                                        key={optIdx}
                                        type="button"
                                        onClick={() => {
                                          setSprintScore(isCorrect ? 100 : 0);
                                          setSprintStepIndex(1);
                                        }}
                                        className={`min-h-[44px] p-3 rounded-xl border text-xs font-mono font-bold text-left transition-all cursor-pointer ${
                                          sprintStepIndex > 0
                                            ? isCorrect
                                              ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-black shadow-2xs"
                                              : "bg-rose-50 border-rose-200 text-rose-700 opacity-60"
                                            : "bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800 hover:border-[#796AEF]"
                                        }`}
                                      >
                                        <span className="text-[#796AEF] mr-2">
                                          {String.fromCharCode(65 + optIdx)}.
                                        </span>
                                        <span>{opt}</span>
                                      </button>
                                    );
                                  },
                                )}
                              </div>
                            </div>

                            {/* Solution & Speed Strategy Reveal if answered */}
                            {sprintStepIndex > 0 && (
                              <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 space-y-2 animate-fade-in text-[11.5px] font-mono shadow-2xs">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-emerald-800 font-bold flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />{" "}
                                    {isEnglish ? "Correct Answer: Option " : "सही उत्तर: विकल्प "}
                                    {String.fromCharCode(
                                      65 +
                                        selectedAgilityDrillTopic.correctOptionIndex,
                                    )}
                                  </span>
                                  <span className="text-[#796AEF] font-bold">
                                    {isEnglish ? "Shortcut Verified ✓" : "शॉर्टकट सत्यापित ✓"}
                                  </span>
                                </div>
                                <p className="text-slate-700 text-xs font-sans leading-relaxed">
                                  {selectedAgilityDrillTopic.explanation}
                                </p>
                                <div className="text-[11px] text-slate-700 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/80 mt-1">
                                  💡 <strong>{isEnglish ? "Blackboard Shortcut (Trick):" : "ब्लैकबोर्ड शॉर्टकट (Shortcut Trick):"}</strong>{" "}
                                  {selectedAgilityDrillTopic.speedStrategy}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Modal Footer */}
                          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedAgilityDrillTopic(null)}
                              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                            >
                              {isEnglish ? "Close" : "बंद करें (Close)"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const drill = selectedAgilityDrillTopic;
                                setSelectedAgilityDrillTopic(null);
                                if (onDiscussWithCherry) {
                                  onDiscussWithCherry({
                                    topic: drill.topicName,
                                    subject: drill.subject,
                                    conceptTested: drill.topicName,
                                    hint: drill.explanation,
                                    question: `Cherry Ma'am, let's do a fast 3-question speed sprint on ${drill.topicName} on the digital blackboard!`,
                                  });
                                } else if (onEnterClassroom) {
                                  onEnterClassroom();
                                }
                              }}
                              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#796AEF] hover:bg-indigo-700 text-white text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-white shrink-0" />
                              <span>{isEnglish ? "Speed Sprint with Cherry 🚀" : "मैम के साथ स्पीड स्प्रिंट करें 🚀"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
  );
};
