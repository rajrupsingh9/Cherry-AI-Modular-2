/**
 * agilityTopicsData.ts
 * Dataset of cognitive agility topics with latency, accuracy, and speed strategies.
 */
import { AgilityTopicItem, FatiguePhaseItem } from "../agilityTypes";

export const AGILITY_TOPICS: AgilityTopicItem[] = [
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

export const SESSION_FATIGUE_CURVE: FatiguePhaseItem[] = [
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
