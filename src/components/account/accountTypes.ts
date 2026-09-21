import React from "react";
import {
  Target,
  Crosshair,
  Hourglass,
  Gauge,
  Compass,
  GitFork,
} from "lucide-react";

export const DIMENSION_DETAILS = [
  {
    name: "🎯 Concept Clarity",
    icon: "🎯",
    description:
      "Evaluates your capability to synthesize formulas and apply them to novel, non-routine application questions. True mastery means recognizing which formula to use under variable conditions.",
    recommendation:
      "Your concept clarity is currently at {score}%. Great work! Ensure you are practicing cross-concept whiteboard problem sets to build deductive flexibility.",
    benefit:
      "Equips you to tackle higher-order thinking (HOTS) board-exam questions and easily crack advanced competitive exams.",
  },
  {
    name: "📖 Theoretical Understanding",
    icon: "📖",
    description:
      "Measures recall of exact textbook definitions, scientific/mathematical constants, core classroom theorems, and textbook-grade proofs.",
    recommendation:
      "Your core theoretical core score is {score}%. Re-read slide summaries and use the direct hand-handbook PDFs to memorize formal definitions precisely.",
    benefit:
      "Allows you to write highly structured, formal answers that score 100% marks from strict board examiners.",
  },
  {
    name: "🧮 Calculation Precision",
    icon: "🧮",
    description:
      "Tracks algebraic accuracy, arithmetic transposition precision, algebraic sign changes, and step-by-step mathematical reasoning.",
    recommendation:
      "Your calculation precision is at {score}%. Silly errors are usually due to transposing terms too quickly. Write out every single algebraic step on your scratchpad.",
    benefit:
      "Completely eliminates exam-day calculation slip-ups and builds high confidence during high-pressure timed exams.",
  },
  {
    name: "⚡ Formula Recall & Recall",
    icon: "⚡",
    description:
      "Gauges rapid recall of standard formulas, units of measurement, coefficients of equations, and historical/scientific facts discussed on chalkboard.",
    recommendation:
      "Your formula recall is at {score}%. Boost this immediately by opening the Smart Revision tab and playing the AI flashcards for 5 minutes daily.",
    benefit:
      "Saves critical minutes during timed tests, leaving you with surplus time to review and polish your calculations.",
  },
  {
    name: "🔥 Socratic Stamina & Consistency",
    icon: "🔥",
    description:
      "Monitors overall active learning consistency. Derived directly from lecture classes attended, custom handbooks generated, and slide snapshots saved.",
    recommendation:
      "Your Socratic engagement is {score}%. Attend live sessions with Cherry Ma'am consistently, ask interactive questions, and save chalkboard snapshot formulations to keep this at 100%.",
    benefit:
      "Transforms studying from exhausting late-night cram sessions to steady, permanent cognitive absorption.",
  },
];

export const ANALYTICS_SUITE_TABS = [
  {
    id: "macro" as const,
    num: "1",
    label: "Macro Overview",
    subtitle: "समग्र विश्लेषण",
    subtitleEn: "Overall Analysis",
    icon: Target,
    desc: "🎯 समग्र विश्लेषण • आपकी कुल तैयारी, 5-D रडar, बोर्ड रेडीनेस व AI स्टडी टाइमटेबल",
    descEn: "🎯 Overall Analysis • Exam Readiness, 5-D Radar, Blueprint & Timetable",
  },
  {
    id: "micro" as const,
    num: "2",
    label: "Micro Overview",
    subtitle: "गलतियों का विश्लेषण",
    subtitleEn: "Error Diagnostics",
    icon: Crosshair,
    desc: "🔬 माइक्रो विश्लेषण • सिली मिस्टेक व ट्रैप्स वर्गीकरण मैट्रिक्स",
    descEn: "🔬 Micro Diagnostics • Silly Mistakes & Exam Trap Classification",
  },
  {
    id: "retention" as const,
    num: "3",
    label: "Memory Decay",
    subtitle: "स्मृति व रिवीज़न",
    subtitleEn: "Retention & Revision",
    icon: Hourglass,
    desc: "🧠 मेमोरी व रिवीज़न • एबिंगहॉस फॉरगेटिंग कर्व व स्मार्ट फ़्लैशकार्ड्स",
    descEn: "🧠 Retention & Revision • Ebbinghaus Forgetting Curve & Spaced Repetition",
  },
  {
    id: "agility" as const,
    num: "4",
    label: "Agility & Stamina",
    subtitle: "गति व स्टैमिना",
    subtitleEn: "Speed & Stamina",
    icon: Gauge,
    desc: "⚡ गति व स्टैमिना • स्पीड-एक्यूरेसी 4-क्वाड्रेंट व थकान प्रोग्रेशन",
    descEn: "⚡ Speed & Stamina • Speed vs Accuracy Matrix & Cognitive Fatigue Curve",
  },
  {
    id: "curriculum" as const,
    num: "5",
    label: "Syllabus Radar",
    subtitle: "80/20 वेटेज",
    subtitleEn: "80/20 Weightage",
    icon: Compass,
    desc: "🗺️ सिलेबस व वेटेज • 80/20 उच्च-प्राथमिकता वाले चैप्टर्स व ब्लाइंडस्पॉट्स",
    descEn: "🗺️ Syllabus & Weightage • 80/20 High-Yield Chapters & Blindspots",
  },
  {
    id: "prerequisites" as const,
    num: "6",
    label: "Prereq Graph",
    subtitle: "बुनियादी कमियाँ",
    subtitleEn: "Foundational Gaps",
    icon: GitFork,
    desc: "🔗 प्रिरिक्विज़िट ट्री • बुनियादी समझ व फाउंडेशन गैप्स ट्रैकर",
    descEn: "🔗 Prerequisite Tree • Conceptual Foundations & Root Gap Tracker",
  },
  {
    id: "sprint" as const,
    num: "7",
    label: "Speed Sprint",
    subtitle: "टाइम-पेसिंग टेस्ट",
    subtitleEn: "Time-Pacing Test",
    icon: Gauge,
    desc: "⏱️ स्पीड स्प्रिंट • परीक्षा टाइम-पेसिंग व पैनिक-फ्री टाइमर टेस्ट",
    descEn: "⏱️ Speed Sprint • Exam Time-Pacing & 7-Day Board Score Booster",
  },
];

export interface BoardSnapshot {
  id: string;
  snapshotId: string;
  userId: string;
  topicTitle: string;
  description: string;
  imgData: string; // Base64 Compressed Image
  timestamp: any;
  subject?: string;
  grade?: string;
  topicIndex?: number;
  latexEquations?: string[];
  [key: string]: any;
}


export interface StudentAccountHubProps {
  onClose: () => void;
  studentName?: string;
  grade?: any;
  subject?: string;
  board?: string;
  mediumOfLearning?: string;
  totalSessionsCount?: number;
  onRefreshProfile?: () => void;
  customBoardContent?: string;
  pastSessions?: any[];
  sessionSnapshots?: any[];
  topics?: any[];
  activeTopicIndex?: number;
  topicBoardsContent?: Record<string, string>;
  sessionId?: string | null;
  activeDocument?: any;
  onEnterClassroom?: () => void;
  onSignOut?: () => void;
  onDiscussWithCherry?: (topic: string) => void;
}
