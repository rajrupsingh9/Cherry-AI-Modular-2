/**
 * quizTypes.ts
 * Type definitions & static fallback data for QuickQuizView
 */

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  conceptTested?: string;
  theoryTested?: string;
  calculationFormula?: string;
  cognitiveCategory?: string;
  difficulty?: string;
}

export interface QuizAnswerHistoryItem {
  questionIndex: number;
  selectedOption: number; // -1 if timed out/skipped
  isCorrect: boolean;
  conceptTested: string;
  theoryTested: string;
  calculationFormula: string;
  cognitiveCategory: string;
  difficulty: string;
}

export interface QuizBlindspot {
  questionIndex: number;
  question: string;
  conceptTested: string;
  calculationFormula: string;
  explanation: string;
  missRate: string;
  correctAnswer: string;
}

export interface RankedBattleParticipant {
  uid: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  score: number;
  correctCount: number;
  currentQuestionIndex?: number;
  accuracy?: number;
  avatar?: string;
  isUser?: boolean;
}

export interface CognitiveCategoryData {
  category: string;
  total: number;
  correct: number;
  percentage: number;
}

export interface ExtractedTopicItem {
  index: number;
  rawTitle: string;
  title: string;
  hasBoardNotes: boolean;
  boardSnippet: string;
  formulas: string[];
  isCurrent: boolean;
}

export interface QuickQuizViewProps {
  subject?: string;
  grade?: string;
  state: string; // disconnected, idle, listening, speaking, etc.
  onInjectPrompt: (text: string) => void;
  onToast: (text: string, type: "success" | "info" | "error") => void;
  topics?: string[];
  activeTopicIndex?: number;
  customBoardContent?: string;
  topicBoardsContent?: Record<number, string>;
  sessionId?: string | null;
  mediumOfLearning?: string;
}

export interface QuizLeaderboardProps {
  subject: string;
  grade: string;
  onStartQuiz: () => void;
  onToast: (text: string, type: "success" | "info" | "error") => void;
  refreshTrigger?: number;
}

// Default topic pools per subject
export const SUBJECT_DEFAULT_TOPICS: Record<string, string[]> = {
  Mathematics: [
    "Linear & Quadratic Equations",
    "Trigonometry, Identities & Heights/Distances",
    "Differential & Integral Calculus",
    "Coordinate Geometry & Conic Sections",
    "Probability, Statistics & Combinatorics",
    "Matrices, Determinants & Vectors",
    "Arithmetic & Geometric Progressions (AP/GP)"
  ],
  Physics: [
    "Kinematics & Laws of Motion (Newton's Laws)",
    "Work, Energy, Power & Collisions",
    "Gravitation & Planetary Motion",
    "Current Electricity, Ohm's Law & Circuits",
    "Magnetic Effects of Current & EMI",
    "Ray Optics & Wave Optics",
    "Thermodynamics & Kinetic Theory of Gases"
  ],
  Chemistry: [
    "Chemical Bonding, Molecular Structure & Hybridization",
    "Periodic Classification & Periodic Trends",
    "Thermodynamics, Energetics & Chemical Equilibrium",
    "Organic Chemistry: Reaction Mechanisms & Hydrocarbons",
    "Solutions, Colligative Properties & Electrochemistry",
    "Atomic Structure & Quantum Numbers",
    "Coordination Compounds & Transition Metals"
  ],
  Biology: [
    "Cell: Structure, Cell Cycle & Biomolecules",
    "Genetics, Mendelian Inheritance & DNA/RNA",
    "Human Physiology (Circulation, Respiration, Excretion)",
    "Plant Physiology (Photosynthesis & Transpiration)",
    "Reproduction in Organisms & Human Health",
    "Biotechnology Principles & Environmental Ecology"
  ],
  Science: [
    "Force, Laws of Motion & Gravitation",
    "Chemical Reactions, Acids, Bases & Salts",
    "Life Processes: Nutrition, Respiration & Control",
    "Electricity, Circuits & Magnetic Effects",
    "Light: Reflection, Refraction & Optical Instruments",
    "Metals, Non-Metals & Carbon Compounds"
  ],
  General: [
    "Fundamental Quantitative Aptitude & Logic",
    "General Physics & Mechanics",
    "Everyday Chemistry & Molecular Interactions",
    "General Biology & Environmental Science",
    "Scientific Reasoning & Problem Solving"
  ]
};

// Sample robust question pool for various subjects
export const QUIZ_POOL: Record<string, QuizQuestion[]> = {
  Mathematics: [
    {
      id: "m1",
      question: "If a triangle has sides 6cm, 8cm, and 10cm, what is its area?",
      options: ["48 cm²", "24 cm²", "14 cm²", "30 cm²"],
      correctAnswer: 1,
      explanation: "This is a right-angled triangle (6² + 8² = 10²). The area is ½ × base × height = ½ × 6 × 8 = 24 cm².",
      conceptTested: "Right-angled triangle area",
      cognitiveCategory: "Calculations & Solving",
      difficulty: "Medium"
    },
    {
      id: "m2",
      question: "Solve for x: log₂ (x + 3) = 4",
      options: ["x = 13", "x = 5", "x = 1", "x = 11"],
      correctAnswer: 0,
      explanation: "Converting to exponential form: x + 3 = 2⁴ => x + 3 = 16 => x = 13.",
      conceptTested: "Logarithmic calculations",
      cognitiveCategory: "Conceptual Application",
      difficulty: "Hard"
    },
    {
      id: "m3",
      question: "What is the slope of the line perpendicular to y = -3x + 5?",
      options: ["3", "-3", "1/3", "-1/3"],
      correctAnswer: 2,
      explanation: "The slope of a perpendicular line is the negative reciprocal of the original slope. Perpendicular slope = -1 / (-3) = 1/3.",
      conceptTested: "Perpendicular line slopes",
      cognitiveCategory: "Theoretical Core",
      difficulty: "Medium"
    }
  ],
  Science: [
    {
      id: "s1",
      question: "Which cell organelle is known as the powerhouse of the cell?",
      options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
      correctAnswer: 2,
      explanation: "Mitochondria are called powerhouses because they produce ATP, the energy currency of the cell, through cellular respiration.",
      conceptTested: "Cellular organelles",
      cognitiveCategory: "Theoretical Core",
      difficulty: "Easy"
    },
    {
      id: "s2",
      question: "What is the acceleration due to gravity on Earth's surface (approximate)?",
      options: ["9.8 m/s²", "1.6 m/s²", "24.7 m/s²", "11.2 m/s²"],
      correctAnswer: 0,
      explanation: "The acceleration due to gravity on Earth is approximately 9.8 m/s², representing the gravitational pull on objects.",
      conceptTested: "Gravitational constant",
      cognitiveCategory: "Formula Retention",
      difficulty: "Easy"
    },
    {
      id: "s3",
      question: "If an electric circuit has a voltage of 12V and resistance of 4 Ohms, what is the current?",
      options: ["48 Amps", "3 Amps", "8 Amps", "16 Amps"],
      correctAnswer: 1,
      explanation: "According to Ohm's Law (V = IR), Current (I) = V / R = 12V / 4Ω = 3 Amps.",
      conceptTested: "Ohm's Law application",
      cognitiveCategory: "Calculations & Solving",
      difficulty: "Medium"
    }
  ],
  General: [
    {
      id: "g1",
      question: "Which planet in our solar system is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correctAnswer: 1,
      explanation: "Mars is called the Red Planet because of the iron oxide (rust) on its surface, giving it a reddish appearance.",
      conceptTested: "Solar system astronomy",
      cognitiveCategory: "Theoretical Core",
      difficulty: "Easy"
    },
    {
      id: "g2",
      question: "Who is known as the father of modern theoretical physics?",
      options: ["Isaac Newton", "Albert Einstein", "Galileo Galilei", "Nikola Tesla"],
      correctAnswer: 1,
      explanation: "Albert Einstein is widely regarded as the father of modern physics, especially for his theory of relativity.",
      conceptTested: "Modern physics history",
      cognitiveCategory: "Theoretical Core",
      difficulty: "Easy"
    },
    {
      id: "g3",
      question: "What is the primary gas that makes up Earth's atmosphere?",
      options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"],
      correctAnswer: 1,
      explanation: "Nitrogen is the most abundant gas in our atmosphere, making up about 78% of it, followed by Oxygen at 21%.",
      conceptTested: "Earth's atmosphere",
      cognitiveCategory: "Theoretical Core",
      difficulty: "Easy"
    }
  ]
};
