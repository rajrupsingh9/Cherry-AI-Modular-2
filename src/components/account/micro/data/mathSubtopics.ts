/**
 * mathSubtopics.ts
 * Mathematics granular sub-topic diagnostic catalog items.
 */
import { SubtopicCatalogItem } from "../microTypes";

export const MATH_SUBTOPICS: SubtopicCatalogItem[] = [
  {
    id: "math-quad-1",
    name: "Quadratic Formula & Discriminant Analysis",
    chapter: "Quadratic Equations",
    subject: "Mathematics",
    defaultMastery: 58,
    benchmarkLatencySec: 55,
    dominantMistake: "calculation",
    keyFormulas: [
      "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
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
      "\\sin^2\\theta + \\cos^2\\theta = 1",
      "1 + \\tan^2\\theta = \\sec^2\\theta",
      "1 + \\cot^2\\theta = \\csc^2\\theta",
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
    defaultMastery: 46,
    benchmarkLatencySec: 70,
    dominantMistake: "conceptual",
    keyFormulas: [
      "\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)",
      "\\frac{d}{dx}[\\sin(x^2)] = 2x\\cos(x^2)",
    ],
    prescriptionHint:
      "Differentiate the outer shell first, then multiply by the internal function derivative.",
    typicalQuestion:
      "Differentiate y = (3x^2 - 5)^4 with respect to x.",
    explanation:
      "Outer derivative gives 4(3x^2 - 5)^3; inner derivative gives 6x. Final answer: 24x(3x^2 - 5)^3.",
  },
  {
    id: "math-geom-1",
    name: "Coordinate Geometry: Distance & Section Formula",
    chapter: "Coordinate Geometry",
    subject: "Mathematics",
    defaultMastery: 68,
    benchmarkLatencySec: 45,
    dominantMistake: "calculation",
    keyFormulas: [
      "d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}",
      "P = \\left(\\frac{mx_2 + nx_1}{m+n}, \\frac{my_2 + ny_1}{m+n}\\right)",
    ],
    prescriptionHint:
      "Label coordinates (x1, y1) and (x2, y2) explicitly before substituting into ratio m:n.",
    typicalQuestion:
      "Find coordinates of the point dividing line segment joining (1, -2) and (4, 7) internally in ratio 1:2.",
    explanation:
      "P_x = (1*4 + 2*1)/3 = 6/3 = 2; P_y = (1*7 + 2*(-2))/3 = 3/3 = 1. Coordinate is (2, 1).",
  },
  {
    id: "math-prob-1",
    name: "Conditional Probability & Bayes' Theorem",
    chapter: "Probability & Statistics",
    subject: "Mathematics",
    defaultMastery: 42,
    benchmarkLatencySec: 80,
    dominantMistake: "conceptual",
    keyFormulas: [
      "P(A|B) = \\frac{P(A \\cap B)}{P(B)}",
      "P(E_i|A) = \\frac{P(E_i)P(A|E_i)}{\\sum P(E_k)P(A|E_k)}",
    ],
    prescriptionHint:
      "Distinguish prior probability P(E1) from given evidence event A.",
    typicalQuestion:
      "Bag A has 3 red and 4 black balls; Bag B has 5 red and 6 black balls. One ball is drawn and found to be red. Find probability it came from Bag A.",
    explanation:
      "Use Bayes Theorem with prior 1/2 for each bag and likelihoods 3/7 vs 5/11.",
  },
];
