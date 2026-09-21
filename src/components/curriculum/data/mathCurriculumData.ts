/**
 * mathCurriculumData.ts
 * Official board curriculum standards for Class 10 & 12 Mathematics.
 */
import { ChapterCurriculum } from "../curriculumTypes";

export const MATH_CURRICULUM: ChapterCurriculum[] = [
  {
    id: "math-quad",
    chapterNumber: 4,
    title: "Quadratic Equations & Roots",
    hindiTitle: "द्विघात समीकरण एवं मूल",
    subject: "Mathematics",
    grade: 10,
    boardWeightageMarks: 6,
    tier: "high",
    subtopics: [
      {
        id: "math-quad-1",
        title: "Standard Form & Nature of Roots (Discriminant D)",
        hindiTitle: "मानक रूप व मूलों की प्रकृति (विविक्तकर D)",
        weightagePercent: 40,
        keyFormula: "D = b^2 - 4ac",
        difficulty: "easy",
        examType: "1-Mark MCQ & 2-Mark Short Answer",
        coreTakeaway: "D > 0: Real & distinct roots; D = 0: Equal roots; D < 0: Imaginary conjugate roots.",
        hindiCoreTakeaway: "D > 0: वास्तविक व भिन्न मूल; D = 0: समान मूल; D < 0: काल्पनिक मूल।"
      },
      {
        id: "math-quad-2",
        title: "Solving by Factorization & Quadratic Formula",
        hindiTitle: "गुणनखंडन एवं श्रीधराचार्य सूत्र द्वारा हल",
        weightagePercent: 35,
        keyFormula: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
        difficulty: "medium",
        examType: "3-Mark Problem Solving",
        coreTakeaway: "Apply Sridharacharya quadratic formula accurately with double sign checks.",
        hindiCoreTakeaway: "द्विघाती सूत्र लगाते समय चिह्नों (+/-) की दोबारा जांच अवश्य करें।"
      },
      {
        id: "math-quad-3",
        title: "Real-Life Word Problems (Speed, Time, Area)",
        hindiTitle: "व्यावहारिक शाब्दिक प्रश्न (चाल, समय, क्षेत्रफल)",
        weightagePercent: 25,
        difficulty: "hard",
        examType: "5-Mark Long Application Case Study",
        coreTakeaway: "Translating word statements into quadratic algebra and rejecting negative extraneous roots.",
        hindiCoreTakeaway: "कथन को समीकरण में बदलें तथा अमान्य ऋणात्मक मान को हटाएं।"
      }
    ]
  },
  {
    id: "math-trig",
    chapterNumber: 8,
    title: "Introduction to Trigonometry & Identities",
    hindiTitle: "त्रिकोणमिति का परिचय एवं सर्वसमिकाएँ",
    subject: "Mathematics",
    grade: 10,
    boardWeightageMarks: 10,
    tier: "critical",
    subtopics: [
      {
        id: "math-trig-1",
        title: "Trigonometric Ratios & Specific Angles (0°, 30°, 45°, 60°, 90°)",
        hindiTitle: "त्रिकोणमितीय अनुपात एवं विशिष्ट कोण सारणी",
        weightagePercent: 30,
        keyFormula: "\\sin 30^\\circ = \\frac{1}{2}, \\; \\tan 45^\\circ = 1",
        difficulty: "easy",
        examType: "2-Mark Direct Evaluation",
        coreTakeaway: "Memorize the standard ratio table and exact reciprocal transformations.",
        hindiCoreTakeaway: "विशिष्ट कोणों के सटीक मान व व्युत्क्रम संबंधों (sin/csc, cos/sec) को याद रखें।"
      },
      {
        id: "math-trig-2",
        title: "Fundamental Pythagorean Identities & Proofs",
        hindiTitle: "मूलभूत पाइथागोरस सर्वसमिकाएँ एवं सिद्ध करना",
        weightagePercent: 45,
        keyFormula: "\\sin^2 \\theta + \\cos^2 \\theta = 1, \\; 1 + \\tan^2 \\theta = \\sec^2 \\theta",
        difficulty: "hard",
        examType: "5-Mark Step-by-Step Proof",
        coreTakeaway: "Conversions to sin/cos and algebraic rationalization are the core proof techniques.",
        hindiCoreTakeaway: "सभी पदों को sin व cos में बदलना और परिमेयकरण करना सबसे असरदार सिद्ध विधि है।"
      },
      {
        id: "math-trig-3",
        title: "Heights and Distances (Angles of Elevation & Depression)",
        hindiTitle: "ऊंचाई एवं दूरी (उन्नयन व अवनमन कोण)",
        weightagePercent: 25,
        keyFormula: "\\tan \\theta = \\frac{\\text{Opposite (Height)}}{\\text{Adjacent (Distance)}}",
        difficulty: "medium",
        examType: "4-Mark Case-Based Diagram Problem",
        coreTakeaway: "Draw clean geometry triangles and apply tan θ for two-level angle problems.",
        hindiCoreTakeaway: "स्पष्ट समकोण त्रिभुज बनाएं और ऊंचाई-दूरी के लिए tan θ का सटीक उपयोग करें।"
      }
    ]
  },
  {
    id: "math-calc",
    chapterNumber: 5,
    title: "Continuity, Differentiability & Derivatives",
    hindiTitle: "सांतत्य, अवकलनीयता एवं अवकलज",
    subject: "Mathematics",
    grade: 12,
    boardWeightageMarks: 12,
    tier: "critical",
    subtopics: [
      {
        id: "math-calc-1",
        title: "Continuity Tests & Left/Right Hand Limits",
        hindiTitle: "सांतत्य परीक्षण एवं वाम/दक्षिण सीमा",
        weightagePercent: 30,
        keyFormula: "\\lim_{x \\to a^-} f(x) = \\lim_{x \\to a^+} f(x) = f(a)",
        difficulty: "medium",
        examType: "3-Mark Limit Evaluation",
        coreTakeaway: "A function must be defined and both directional limits must coincide.",
        hindiCoreTakeaway: "फ़लन का परिभाषित होना और दोनों दिशाओं की सीमाओं (LHL = RHL = f(a)) का समान होना अनिवार्य है।"
      },
      {
        id: "math-calc-2",
        title: "Chain Rule, Product & Quotient Derivatives",
        hindiTitle: "श्रृंखला नियम, गुणन एवं भागफल अवकलन",
        weightagePercent: 40,
        keyFormula: "\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)",
        difficulty: "medium",
        examType: "4-Mark Differentiation",
        coreTakeaway: "Systematic outside-in differentiation without dropping intermediate differential terms.",
        hindiCoreTakeaway: "बाहर से अंदर की ओर चरणबद्ध अवकलन करें, किसी मध्यवर्ती पद को न छोड़ें।"
      },
      {
        id: "math-calc-3",
        title: "Logarithmic & Parametric Differentiation",
        hindiTitle: "लघुगणकीय एवं प्राचलिक अवकलन",
        weightagePercent: 30,
        keyFormula: "\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt}",
        difficulty: "hard",
        examType: "5-Mark Derivation",
        coreTakeaway: "Taking natural log on both sides simplifies complex exponents and variable powers.",
        hindiCoreTakeaway: "दोनों पक्षों का लॉग (ln) लेने से घातांक सरल गुणन में बदल जाते हैं।"
      }
    ]
  }
];
