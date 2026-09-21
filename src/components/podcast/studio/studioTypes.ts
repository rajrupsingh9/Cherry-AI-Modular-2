/**
 * studioTypes.ts
 * Types and interfaces for the Audio Overview Studio
 */
import { AudioPodcastData, PodcastLanguage, PodcastEpisodeType } from "../../../types";
import { OfflinePodcastRecord } from "../../../utils/offlineAudioStorage";

export interface AudioOverviewStudioProps {
  studentDetails: {
    name: string;
    grade: string;
    subject: string;
    board?: string;
    mediumOfLearning?: string;
  };
  activeDocument?: any;
  addToast: (msg: string, type: "success" | "error" | "info") => void;
  onOpenPodcast: (podcast: AudioPodcastData) => void;
  onClose?: () => void;
  isFullScreen?: boolean;
}

export interface SourceFileState {
  name: string;
  size: number;
  text: string;
  isExtracting: boolean;
  detectedSubject?: string;
}

export type SourceType = "upload" | "paste";
export type HostPairType = "cherry_riya" | "aarav_riya";
export type LibraryTabType = "recent" | "offline";

export interface ActiveSourceDetails {
  title: string;
  text: string;
  typeLabel: string;
  isReady: boolean;
}
