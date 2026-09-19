import {
  PYQ8020AnalysisReport,
  PYQWeightageHeatmapReport,
  AIPredictedPaperReport,
} from "../types";

export function buildPYQ8020AnalysisPrompt(params: {
  subject: string;
  grade: string;
  board: string;
  pyqDocumentText?: string;
  chapters?: string[];
}): string {
  return `You are an expert Chief Examiner for ${params.board} ${params.grade} ${params.subject}.
Perform an authentic 10-Year Board Paper Pareto 80/20 frequency analysis.
Identify the 20% of high-yield recurring concepts that account for 80% of total exam marks.
Context:
${params.pyqDocumentText || "Standard 10-Year past board questions across syllabus."}`;
}

export function getCurated8020Report(
  subject: string = "Science",
  grade: string = "Class 10",
  board: string = "CBSE"
): PYQ8020AnalysisReport {
  return {
    subject,
    grade,
    board,
    yearsSpan: "2015 - 2025 (10-Year Verified Trends)",
    estimatedScoreCoveragePercentage: 82,
    summaryExecutiveNote: `Mastering these top repeating topics provides ~82% coverage in the upcoming ${board} examination.`,
    guaranteedTopics: [
      {
        topicName: "Ray Optics: Mirror & Lens Formula Derivations",
        chapterName: "Light - Reflection and Refraction",
        frequencyScore: 98,
        yieldTier: "guaranteed",
        repeatYears: ["2016", "2018", "2019", "2021", "2023", "2024"],
        sampleQuestions: [
          "State Snell's law of refraction and derive the relation between focal length and radius of curvature.",
          "An object is placed at 2F of a convex lens. Draw the ray diagram.",
        ],
        examinerNotes: "Step marks strictly awarded for correct ray arrows and sign convention.",
      },
      {
        topicName: "Ohm's Law & Series-Parallel Resistor Networks",
        chapterName: "Electricity",
        frequencyScore: 95,
        yieldTier: "guaranteed",
        repeatYears: ["2015", "2017", "2019", "2020", "2022", "2024"],
        sampleQuestions: [
          "Derive the formula for equivalent resistance of three resistors connected in parallel.",
          "Calculate power consumed across heating element.",
        ],
        examinerNotes: "Watch out for unit conversions from mA to A.",
      },
    ],
    highYieldTopics: [
      {
        topicName: "Balancing Chemical Equations & Redox Identification",
        chapterName: "Chemical Reactions and Equations",
        frequencyScore: 88,
        yieldTier: "high",
        repeatYears: ["2017", "2019", "2022", "2023"],
        sampleQuestions: [
          "Identify oxidizing and reducing agents in the reaction of CuO with H2.",
        ],
      },
      {
        topicName: "Human Heart Circulation & Double Circulation",
        chapterName: "Life Processes",
        frequencyScore: 85,
        yieldTier: "high",
        repeatYears: ["2018", "2020", "2022", "2024"],
        sampleQuestions: [
          "Why is double circulation necessary in human beings?",
        ],
      },
    ],
    moderateYieldTopics: [
      {
        topicName: "Magnetic Effects of Electric Current: Solenoid Field",
        chapterName: "Magnetic Effects of Electric Current",
        frequencyScore: 72,
        yieldTier: "moderate",
        repeatYears: ["2016", "2021", "2023"],
        sampleQuestions: [
          "Draw magnetic field lines around a current-carrying straight solenoid.",
        ],
      },
    ],
    topTrapsToAvoid: [
      {
        trap: "Inverting object distance u sign in mirror formula",
        prevention: "Always place object on left, keeping u strictly negative (-u).",
        commonMarksLost: 2,
      },
      {
        trap: "Missing direction arrows on light ray diagrams",
        prevention: "Every incident and refracted ray MUST have a directional arrow.",
        commonMarksLost: 1,
      },
    ],
  };
}

export function buildPYQWeightageHeatmapPrompt(params: {
  subject: string;
  grade: string;
  board: string;
  pyqDocumentText?: string;
  chapters?: string[];
}): string {
  return `You are a Board Curriculum Strategist.
Build a comprehensive Marking Weightage Heatmap and Section Distribution for ${params.board} ${params.grade} ${params.subject}.`;
}

export function getCuratedWeightageHeatmapReport(
  subject: string = "Science",
  grade: string = "Class 10",
  board: string = "CBSE"
): PYQWeightageHeatmapReport {
  return {
    subject,
    grade,
    board,
    totalExamMarks: 80,
    analyzedYearsSpan: "2015 - 2025",
    executiveHeatmapSummary: `Focus primary revision on Tier-1 units (Chemical Substances & Natural Phenomena) which deliver over 52% of total weightage.`,
    chapterBreakdowns: [
      {
        chapterName: "Chemical Substances - Nature & Behaviour",
        totalMarks: 25,
        percentageWeightage: 31,
        weightageTier: "tier1_critical",
        dominantQuestionTypes: ["MCQs", "Short Answer", "Long Answer"],
        keyHighScoringConcepts: ["Acids, Bases & Salts", "Carbon Compounds", "Metals & Non-metals"],
      },
      {
        chapterName: "World of Living (Biology)",
        totalMarks: 25,
        percentageWeightage: 31,
        weightageTier: "tier1_critical",
        dominantQuestionTypes: ["Case Study", "Diagrams", "Short Answer"],
        keyHighScoringConcepts: ["Life Processes", "Control & Coordination", "Reproduction"],
      },
      {
        chapterName: "Natural Phenomena (Optics)",
        totalMarks: 12,
        percentageWeightage: 15,
        weightageTier: "tier2_important",
        dominantQuestionTypes: ["Ray Diagrams", "Numerical Problems"],
        keyHighScoringConcepts: ["Refraction", "Lens Formula", "Human Eye"],
      },
      {
        chapterName: "Effects of Current (Electricity & Magnetism)",
        totalMarks: 13,
        percentageWeightage: 16,
        weightageTier: "tier2_important",
        dominantQuestionTypes: ["Circuit Numericals", "Magnetic Field Maps"],
        keyHighScoringConcepts: ["Ohm's Law", "Joule's Law", "Solenoid"],
      },
      {
        chapterName: "Natural Resources",
        totalMarks: 5,
        percentageWeightage: 7,
        weightageTier: "tier3_foundational",
        dominantQuestionTypes: ["1-Mark MCQs", "Reasoning"],
        keyHighScoringConcepts: ["Our Environment", "Trophic Levels"],
      },
    ],
    sectionWiseDistribution: {
      sectionA_1Mark: {
        totalMarks: 20,
        questionCount: 20,
        targetTimeMinutes: 30,
        description: "Multiple Choice Questions & Assertion-Reasoning",
      },
      sectionB_2Mark: {
        totalMarks: 12,
        questionCount: 6,
        targetTimeMinutes: 25,
        description: "Very Short Answer (30-50 words)",
      },
      sectionC_3Mark: {
        totalMarks: 21,
        questionCount: 7,
        targetTimeMinutes: 45,
        description: "Short Answer (50-80 words)",
      },
      sectionD_5Mark: {
        totalMarks: 15,
        questionCount: 3,
        targetTimeMinutes: 40,
        description: "Long Answer & Detailed Derivations",
      },
      sectionE_4Mark_CaseStudy: {
        totalMarks: 12,
        questionCount: 3,
        targetTimeMinutes: 30,
        description: "Source-based / Case-based Integrated Assessment Units",
      },
    },
    smartExamDayTimeStrategy: {
      bufferReserveMins: 10,
      readingTimeStrategy: "Spend first 15 mins scanning Section D & E to identify highest confidence options.",
      revisionChecklist: [
        "Verify all numerical solutions have appropriate SI units.",
        "Check arrows on ray diagrams and circuits.",
        "Ensure all questions in sub-parts of Case Studies are numbered correctly.",
      ],
    },
  };
}

export function buildAIPredictedPaperPrompt(params: {
  subject: string;
  grade: string;
  board: string;
  pyqDocumentText?: string;
  chapters?: string[];
}): string {
  return `You are a Senior Paper Setter for ${params.board} ${params.grade} ${params.subject}.
Predict the official 2026 Examination Question Paper structure with questions, marks, and solution guidelines.`;
}

export function getCuratedPredictedPaperReport(
  subject: string = "Science",
  grade: string = "Class 10",
  board: string = "CBSE"
): AIPredictedPaperReport {
  return {
    paperCode: "CHERRY-PRED-2026",
    subject,
    grade,
    board,
    academicYear: "2025-2026",
    totalMarks: 80,
    totalTimeMinutes: 180,
    generalInstructions: [
      "This question paper consists of 39 questions in 5 sections.",
      "All questions are compulsory. Internal choices are provided in some questions.",
      "Section A consists of 20 objective questions carrying 1 mark each.",
      "Section B consists of 6 Very Short questions carrying 2 marks each.",
      "Section C consists of 7 Short Answer questions carrying 3 marks each.",
      "Section D consists of 3 Long Answer questions carrying 5 marks each.",
      "Section E consists of 3 source-based/case-based units of assessment of 4 marks each.",
    ],
    highProbabilityScoreTips: [
      "Highlight final answers in rectangular boxes for fast evaluation.",
      "Write balanced chemical equations with state symbols (s, l, g, aq).",
      "Draw neat labeled diagrams using pencil and ruler.",
    ],
    sectionsSummary: {
      sectionA: { questionCount: 20, totalMarks: 20 },
      sectionB: { questionCount: 6, totalMarks: 12 },
      sectionC: { questionCount: 7, totalMarks: 21 },
      sectionD: { questionCount: 3, totalMarks: 15 },
      sectionE: { questionCount: 3, totalMarks: 12 },
    },
    questions: [
      {
        id: "q1",
        questionNumber: 1,
        section: "A",
        marks: 1,
        questionText: "When dilute hydrochloric acid is added to iron filings, which gas is produced?",
        chapterName: "Chemical Reactions and Equations",
        likelihoodScore: 94,
        solutionSteps: ["Hydrogen gas and iron(II) chloride are produced. Equation: Fe + 2HCl -> FeCl2 + H2"],
      },
      {
        id: "q21",
        questionNumber: 21,
        section: "B",
        marks: 2,
        questionText: "State two differences between arteries and veins.",
        chapterName: "Life Processes",
        likelihoodScore: 92,
        solutionSteps: [
          "1. Arteries carry oxygenated blood away from heart (thick walls); veins carry deoxygenated blood to heart (thin walls).",
          "2. Veins have valves to prevent backflow; arteries do not have valves.",
        ],
      },
      {
        id: "q27",
        questionNumber: 27,
        section: "C",
        marks: 3,
        questionText: "An object is placed at a distance of 10 cm in front of a concave mirror of focal length 15 cm. Find the nature, position, and magnification of the image formed.",
        chapterName: "Light - Reflection and Refraction",
        likelihoodScore: 96,
        solutionSteps: [
          "Using mirror formula: 1/f = 1/v + 1/u",
          "u = -10 cm, f = -15 cm => 1/v = -1/15 - (-1/10) = 1/30 => v = +30 cm (Virtual & Erect behind mirror)",
          "Magnification m = -v/u = -30/(-10) = +3 (Magnified 3 times)",
        ],
        examinerTrapWarning: "Remember concave mirror focal length is always negative in Cartesian sign convention.",
      },
      {
        id: "q34",
        questionNumber: 34,
        section: "D",
        marks: 5,
        questionText: "Derive the mathematical expression for Ohm's Law and explain the experimental verification with a circuit diagram.",
        chapterName: "Electricity",
        likelihoodScore: 98,
        solutionSteps: [
          "State statement: V proportional to I at constant temperature (V = IR).",
          "Draw circuit with battery, ammeter in series, voltmeter in parallel, rheostat, key.",
          "Plot V-I linear graph with slope equal to resistance R.",
        ],
      },
      {
        id: "q37",
        questionNumber: 37,
        section: "E",
        marks: 4,
        questionText: "Case Study: Modern periodic classification and trends across periods and groups.",
        chapterName: "Classification of Elements",
        likelihoodScore: 89,
        solutionSteps: [
          "(a) Atomic radius decreases across a period due to increased effective nuclear charge.",
          "(b) Electronegativity increases across a period and decreases down a group.",
        ],
      },
    ],
  };
}
