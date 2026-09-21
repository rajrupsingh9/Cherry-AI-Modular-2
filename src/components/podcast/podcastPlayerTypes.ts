/**
 * podcastPlayerTypes.ts
 * Types and interfaces for the Audio Podcast Player Modal and sub-components
 */
import type { ComponentType } from "react";
import {
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  BookOpen,
  Radio,
} from "lucide-react";
import { AudioPodcastData, PodcastSegment } from "../../types";

export interface AudioPodcastPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  podcast: AudioPodcastData | null;
  onSpeakSegment?: (segment: PodcastSegment, rate: number) => void;
  onStopAudio?: () => void;
  isAudioPlaying?: boolean;
}

export type PodcastPlayerTab = "player" | "transcript" | "takeaways";

export interface IntentBadgeConfig {
  label: string;
  bg: string;
  icon: ComponentType<{ className?: string }>;
}

export function getIntentBadge(intent?: string): IntentBadgeConfig {
  switch (intent) {
    case "doubt":
      return {
        label: "Doubt & Intuition",
        bg: "bg-amber-100 text-amber-800 border-amber-200",
        icon: HelpCircle,
      };
    case "exam_trap":
      return {
        label: "Exam Trap Alert",
        bg: "bg-rose-100 text-rose-800 border-rose-200",
        icon: AlertTriangle,
      };
    case "concept":
      return {
        label: "Deep Concept",
        bg: "bg-indigo-100 text-[#796AEF] border-indigo-200",
        icon: Lightbulb,
      };
    case "analogy":
      return {
        label: "Real Life Analogy",
        bg: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: Sparkles,
      };
    case "summary":
      return {
        label: "Key Takeaway",
        bg: "bg-purple-100 text-purple-800 border-purple-200",
        icon: BookOpen,
      };
    default:
      return {
        label: "Dialogue",
        bg: "bg-slate-100 text-slate-700 border-slate-200",
        icon: Radio,
      };
  }
}
