/**
 * mathPrereqData.ts
 * Mathematics Prerequisite Dependency Chains (Calculus Chain Rule & Quadratic Word Problems).
 */
import { ConceptDependencyChain } from "../prerequisiteTypes";

export const MATH_PREREQUISITE_CHAINS: ConceptDependencyChain[] = [
  // Mathematics 1: Calculus Chain Rule
  {
    id: "chain-calc-chain-rule",
    targetConcept: "Composite Function Differentiation (Chain Rule)",
    hindiTargetConcept: "संयुक्त फलन अवकलन (श्रृंखला नियम / Chain Rule)",
    subject: "Mathematics",
    grade: 12,
    chapterName: "Continuity & Differentiability",
    hindiChapterName: "सांतत्य तथा अवकलनीयता",
    importance: "critical",
    boardMarksAtRisk: 8,
    summaryDiagnosis: "Errors in composite differentiation almost always stem from forgetting standard trigonometric identities and failing to decompose inner functions u = g(x).",
    hindiSummaryDiagnosis: "संयुक्त अवकलन में अधिकांश गलतियाँ आंतरिक फलन u = g(x) को ठीक से अलग न कर पाने और मानक त्रिकोणमितीय सूत्रों को भूलने के कारण होती हैं।",
    nodes: [
      {
        id: "node-c1",
        title: "Algebraic Function Composition f(g(x))",
        hindiTitle: "फलनों का संयोजन f(g(x))",
        gradeLevel: 11,
        type: "root_foundation",
        subject: "Mathematics",
        description: "Understanding domain/range and mapping an inner input into an outer operation.",
        hindiDescription: "प्रांत/परिसर को समझना और आंतरिक इनपुट को बाहरी फलन में प्रतिस्थापित करना।",
        keyFormula: "(f \\circ g)(x) = f(g(x))",
        commonTrap: "Confusing multiplication f(x) · g(x) with nesting f(g(x)).",
        hindiCommonTrap: "साधारण गुणन f(x) · g(x) और फलन संयोजन f(g(x)) में भ्रमित होना।"
      },
      {
        id: "node-c2",
        title: "Standard Derivatives Table & Power Rule",
        hindiTitle: "मानक अवकलज सारणी व घात नियम (Power Rule)",
        gradeLevel: 11,
        type: "bridge_concept",
        subject: "Mathematics",
        description: "Instant recall of basic d/dx for sin x, cos x, e^x, ln x, x^n without algebraic hesitation.",
        hindiDescription: "sin x, cos x, e^x, ln x, x^n के मानक अवकलजों को बिना किसी संकोच के तुरंत याद रखना।",
        keyFormula: "\\frac{d}{dx}[x^n] = n x^{n-1}, \\quad \\frac{d}{dx}[\\sin x] = \\cos x",
        commonTrap: "Dropping negative signs when differentiating cos x or cot x.",
        hindiCommonTrap: "cos x या cot x का अवकलन करते समय ऋणात्मक चिह्न (-) छोड़ देना।"
      },
      {
        id: "node-c3",
        title: "Multi-Tier Chain Rule & Leibniz Notation",
        hindiTitle: "बहुस्तरीय श्रृंखला नियम व लाइबनिज संकेतन",
        gradeLevel: 12,
        type: "target_mastery",
        subject: "Mathematics",
        description: "Outside-in progressive differentiation, multiplying derivative of each successive layer.",
        hindiDescription: "बाहर से अंदर की ओर चरणबद्ध अवकलन, प्रत्येक आंतरिक परत के अवकलज का गुणा करना।",
        keyFormula: "\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dv} \\cdot \\frac{dv}{dx}",
        commonTrap: "Forgetting to differentiate the innermost variable layer (e.g. d/dx[sin(5x²)] = cos(5x²) · 10x).",
        hindiCommonTrap: "सबसे भीतरी फलन का अवकलन करना भूल जाना (जैसे d/dx[sin(5x²)] में 10x से गुणा न करना)।"
      }
    ]
  },

  // Mathematics 2: Quadratic Word Problems
  {
    id: "chain-math-quad-word",
    targetConcept: "Real-World Speed, Time & Geometry Quadratic Models",
    hindiTargetConcept: "दूरी-चाल-समय व ज्यामितीय द्विघात समीकरण",
    subject: "Mathematics",
    grade: 10,
    chapterName: "Quadratic Equations",
    hindiChapterName: "द्विघात समीकरण",
    importance: "high",
    boardMarksAtRisk: 5,
    summaryDiagnosis: "Students often know the quadratic formula but stumble in translating upstream word sentences into clean algebraic equations (e.g., downstream vs upstream boat speeds).",
    hindiSummaryDiagnosis: "विद्यार्थी द्विघात सूत्र जानते हैं, परंतु भाषा वाले प्रश्नों (जैसे धारा के अनुकूल/प्रतिकूल नाव की गति) को समीकरण में बदलने में गलती करते हैं।",
    nodes: [
      {
        id: "node-q1",
        title: "Linear Equation Translation & Unit Consistency",
        hindiTitle: "शाब्दिक कथनों का बीजीय समीकरण में रूपांतरण",
        gradeLevel: 9,
        type: "root_foundation",
        subject: "Mathematics",
        description: "Converting English/Hindi statements ('takes 2 hours less', 'speed reduced by 5 km/h') into variable relations.",
        hindiDescription: "शाब्दिक कथनों (जैसे '2 घंटे कम लगते हैं', 'चाल 5 किमी/घंटा घटाई गई') को चर समीकरणों में बदलना।",
        keyFormula: "\\text{Time} = \\frac{\\text{Distance}}{\\text{Speed}}",
        commonTrap: "Adding speed to time instead of formulating time difference T₁ - T₂ = ΔT.",
        hindiCommonTrap: "समय अंतर T₁ - T₂ = ΔT बनाने के बजाय चाल को सीधे समय में जोड़ देना।"
      },
      {
        id: "node-q2",
        title: "Algebraic Factorization & Discriminant Checks",
        hindiTitle: "गुणनखंड विधि व विविक्तकर (Discriminant D)",
        gradeLevel: 10,
        type: "bridge_concept",
        subject: "Mathematics",
        description: "Splitting middle terms and testing D = b² - 4ac for real solutions.",
        hindiDescription: "मध्य पद को विभक्त करना और वास्तविक मूलों के लिए D = b² - 4ac ≥ 0 की जांच करना।",
        keyFormula: "D = b^2 - 4ac \\ge 0",
        commonTrap: "Sign flips when moving constant c across the equal sign.",
        hindiCommonTrap: "अचर पद c को बराबर के पार ले जाते समय चिह्न (+/-) की गलती करना।"
      },
      {
        id: "node-q3",
        title: "Extraneous Negative Root Elimination",
        hindiTitle: "ऋणात्मक व असंभव मूलों का निरस्तीकरण",
        gradeLevel: 10,
        type: "target_mastery",
        subject: "Mathematics",
        description: "Interpreting physical constraints (speed > 0, side length > 0) to discard impossible algebraic roots.",
        hindiDescription: "भौतिक सीमाओं (चाल > 0, भुजा की लंबाई > 0) के आधार पर असंभव ऋणात्मक मूलों को हटाना।",
        keyFormula: "x > 0 \\implies x = \\frac{-b + \\sqrt{D}}{2a}",
        commonTrap: "Keeping negative time or distance values as final answers without testing validity in real-world domain.",
        hindiCommonTrap: "वास्तविक प्रश्न की सीमाओं की जांच किए बिना ऋणात्मक समय या दूरी को उत्तर के रूप में लिख देना।"
      }
    ]
  }
];
