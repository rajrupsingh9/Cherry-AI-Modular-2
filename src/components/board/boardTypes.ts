/**
 * boardTypes.ts
 * Type definitions & static collections for ClassroomBoard
 */
import React from "react";

export interface ClassroomBoardProps {
  latestSpeech: string;
  state: string;
  primaryColor: string;
  accentColor: string;
  onClearBoard?: () => void;
  onSelectPrompt?: (promptText: string) => void;
  overrideBlank?: boolean;
  activeDocumentText?: string;
  hasActiveDocument?: boolean;
  studentAskedForWritingOrDrawing?: boolean;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
  cherryVolume?: number;
  onOpenSyllabus?: () => void;
  onWakeUp?: () => void;
  teachingPhase?: string;
  customBoardContent?: string;
  onSaveSnapshot?: () => void;
  topics?: string[];
  activeTopicIndex?: number;
  topicBoardsContent?: Record<number, string>;
  onSyncBoardContent?: (topicIndex: number, content: string) => void;
  detectedSubject?: string;
  onCanvasRef?: (canvas: HTMLCanvasElement | null) => void;
  lessonTitle?: string;
  isPaused?: boolean;
  onTogglePause?: () => void;
  pauseTeaching?: () => void;
  resumeTeaching?: () => void;
  speechSpeed?: number;
  mediumOfLearning?: string;
}

export interface ChalkboardTopicBlockProps {
  idx: number;
  isCurrent: boolean;
  topicText: string;
  detectedSubject?: string;
  blockContent: string;
  accentColor: string;
  teachingPhase: string;
  lessonTitle?: string;
  customBoardContent?: string;
  state: string;
  cherryVolume: number;
  latestSpeech?: string;
  isPaused: boolean;
  speechSpeed?: number;
  activeBlockRef?: React.Ref<HTMLDivElement> | null;
  isLightBg?: boolean;
}

export interface AutoSavedDraft {
  id: string;
  timestamp: string;
  topicTitle: string;
  blobUrl: string;
  filename: string;
}

export interface MotivationalThought {
  thoughtHi: string;
  thoughtEn: string;
  author: string;
  tag: string;
  icon: string;
}

export const DAILY_MOTIVATIONAL_THOUGHTS: MotivationalThought[] = [
  {
    thoughtHi: "सफलता का कोई रहस्य नहीं है, यह तैयारी, कठिन परिश्रम और असफलता से सीखने का परिणाम है।",
    thoughtEn: "Success is no secret. It is the result of preparation, hard work, and learning from failure.",
    author: "Dr. A.P.J. Abdul Kalam",
    tag: "Hard Work & Dedication",
    icon: "🌟"
  },
  {
    thoughtHi: "उठो, जागो और तब तक मत रुको जब तक लक्ष्य की प्राप्ति न हो जाए।",
    thoughtEn: "Arise, awake, and stop not till the goal is reached.",
    author: "Swami Vivekananda",
    tag: "Focus & Determination",
    icon: "🚩"
  },
  {
    thoughtHi: "ज्ञान ही आपकी सबसे बड़ी शक्ति है। हर रोज़ 1% बेहतर बनने की कोशिश करें!",
    thoughtEn: "Knowledge is your greatest power. Strive to be 1% better every single day!",
    author: "Dr. B.R. Ambedkar",
    tag: "Power of Knowledge",
    icon: "📘"
  },
  {
    thoughtHi: "सपने वो नहीं जो हम सोते हुए देखते हैं, सपने वो हैं जो हमें सोने नहीं देते।",
    thoughtEn: "Dreams are not what you see in sleep, dreams are things which do not let you sleep.",
    author: "Dr. A.P.J. Abdul Kalam",
    tag: "Big Dreams",
    icon: "🚀"
  },
  {
    thoughtHi: "शिक्षा सबसे शक्तिशाली हथियार है जिससे आप दुनिया को बदल सकते हैं।",
    thoughtEn: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela",
    tag: "Transformational Education",
    icon: "🌍"
  },
  {
    thoughtHi: "सफलता का सफर छोटा नहीं होता, लेकिन हर एक अध्याय आपको आपकी मंज़िल के करीब लाता है।",
    thoughtEn: "The journey of success is built step-by-step. Every chapter brings you closer to your goal.",
    author: "Albert Einstein",
    tag: "Continuous Progress",
    icon: "🔬"
  },
  {
    thoughtHi: "जो छात्र प्रश्न पूछता है वह 5 मिनट के लिए मूर्ख रहता है, लेकिन जो नहीं पूछता वह जीवन भर मूर्ख रहता है।",
    thoughtEn: "The student who asks a question is a fool for 5 minutes, but he who does not ask remains a fool forever.",
    author: "Chinese Proverb",
    tag: "Curiosity & Learning",
    icon: "💡"
  }
];

export function getDetectedSubject(text: string) {
  if (!text) return { name: "Classroom Introduction", icon: "🎒", theme: "text-[#796AEF] border-[#796AEF]/20 bg-[#796AEF]/10" };
  const norm = text.toLowerCase();
  if (norm.match(/\\frac|\\sum|\\prod|\\int|equation|quadratic|theorem|trigonometr|algebra|math|matrix|calculus|derive|coefficient|proof/)) {
    return { name: "Mathematics", icon: "📐", theme: "text-[#796AEF] border-[#796AEF]/20 bg-[#796AEF]/10" };
  }
  if (norm.match(/physics|gravity|mass|velocity|acceleration|quantum|photon|relativity|energy|force|newton|joule|einstein|thermodynamic|numerical/)) {
    return { name: "Physics", icon: "⚛️", theme: "text-[#796AEF] border-[#796AEF]/20 bg-[#796AEF]/10" };
  }
  if (norm.match(/biology|botany|zoology|cell|mitochondria|photosynthesis|dna|neuron|organism|organelle|plant|animal|chloroplast|genetics|evolution|anatomy/)) {
    return { name: "Biology (Botany + Zoology)", icon: "🌿", theme: "text-[#796AEF] border-[#796AEF]/20 bg-[#796AEF]/10" };
  }
  if (norm.match(/chemistry|molecule|atom|bond|reaction|covalent|periodic|element|carbon|acid|base|h_2|h2o|co2|catalyst|molecular/)) {
    return { name: "Sci / Chemistry", icon: "🧬", theme: "text-[#796AEF] border-[#796AEF]/20 bg-[#796AEF]/10" };
  }
  if (norm.match(/poetry|poem|literature|classic|shakespeare|sonnet|epic|rhyme|strophe|verse|metaphor|playwright/)) {
    return { name: "Literature & Art", icon: "📖", theme: "text-[#796AEF] border-[#796AEF]/20 bg-[#796AEF]/10" };
  }
  return { name: "Cherry's Class Lecture", icon: "📚", theme: "text-[#796AEF] border-[#796AEF]/20 bg-[#796AEF]/10" };
}
