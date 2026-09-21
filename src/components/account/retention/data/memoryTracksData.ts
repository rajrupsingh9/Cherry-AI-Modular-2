/**
 * memoryTracksData.ts
 * Spaced repetition memory tracks with study milestones, key points, flashcards, and KaTeX anchors.
 */
import { MemoryTrackItem } from "../retentionTypes";

export const MEMORY_TRACKS: MemoryTrackItem[] = [
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
