import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AudioPodcastData } from "../types";
import { generateAudioPodcast } from "../services/podcastService";
import { PostLessonSessionData } from "../components/PostLessonAudioModal";

export interface LiveSessionUiContextType {
  // YouTube player states
  youtubeUrl: string;
  setYoutubeUrl: (url: string) => void;
  isYoutubeLoading: boolean;
  setIsYoutubeLoading: (val: boolean) => void;
  isYtPlayerExpanded: boolean;
  setIsYtPlayerExpanded: (val: boolean) => void;
  showMobileYtPlayer: boolean;
  setShowMobileYtPlayer: (val: boolean) => void;
  // Mobile study tabs & quick quiz
  activeMobileTab: "mic" | "topics" | "doubt" | "quiz";
  setActiveMobileTab: (tab: "mic" | "topics" | "doubt" | "quiz") => void;
  isQuizFullScreenOpen: boolean;
  setIsQuizFullScreenOpen: (val: boolean) => void;
  // Dual-voice podcast states
  activeAudioPodcast: AudioPodcastData | null;
  setActiveAudioPodcast: (podcast: AudioPodcastData | null) => void;
  isAudioPodcastModalOpen: boolean;
  setIsAudioPodcastModalOpen: (val: boolean) => void;
  postLessonSession: PostLessonSessionData | null;
  setPostLessonSession: (sess: PostLessonSessionData | null) => void;
  showPostLessonModal: boolean;
  setShowPostLessonModal: (val: boolean) => void;
  isGeneratingLiveRecap: boolean;
  // Actions
  triggerLivePodcastSummary: (params: {
    topic: string;
    subject: string;
    grade: string;
    mediumOfLearning: string;
    notesOrDocumentText: string;
  }) => Promise<void>;
}

const LiveSessionUiContext = createContext<LiveSessionUiContextType | undefined>(undefined);

export interface LiveSessionUiProviderProps {
  children: React.ReactNode;
  addToast?: (message: string, type?: "info" | "success" | "error" | "warning") => void;
}

export const LiveSessionUiProvider: React.FC<LiveSessionUiProviderProps> = ({ children, addToast }) => {
  // YouTube states
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isYoutubeLoading, setIsYoutubeLoading] = useState(false);
  const [isYtPlayerExpanded, setIsYtPlayerExpanded] = useState(true);
  const [showMobileYtPlayer, setShowMobileYtPlayer] = useState(false);

  // Mobile drawer / quiz tabs
  const [activeMobileTab, setActiveMobileTab] = useState<"mic" | "topics" | "doubt" | "quiz">("quiz");
  const [isQuizFullScreenOpen, setIsQuizFullScreenOpen] = useState(false);

  // Audio podcast states
  const [activeAudioPodcast, setActiveAudioPodcast] = useState<AudioPodcastData | null>(null);
  const [isAudioPodcastModalOpen, setIsAudioPodcastModalOpen] = useState(false);
  const [postLessonSession, setPostLessonSession] = useState<PostLessonSessionData | null>(null);
  const [showPostLessonModal, setShowPostLessonModal] = useState(false);
  const [isGeneratingLiveRecap, setIsGeneratingLiveRecap] = useState(false);

  // Global listener to open dual-voice audio podcast from anywhere in the app
  useEffect(() => {
    const handleOpenPodcastEvent = (e: any) => {
      if (e.detail) {
        setActiveAudioPodcast(e.detail);
        setIsAudioPodcastModalOpen(true);
      }
    };
    window.addEventListener("cherry_open_audio_podcast", handleOpenPodcastEvent);
    return () => {
      window.removeEventListener("cherry_open_audio_podcast", handleOpenPodcastEvent);
    };
  }, []);

  const triggerLivePodcastSummary = useCallback(
    async ({
      topic,
      subject,
      grade,
      mediumOfLearning,
      notesOrDocumentText,
    }: {
      topic: string;
      subject: string;
      grade: string;
      mediumOfLearning: string;
      notesOrDocumentText: string;
    }) => {
      if (isGeneratingLiveRecap) return;
      setIsGeneratingLiveRecap(true);
      if (addToast) {
        addToast("🎙️ Preparing 2-Minute Dual-Voice Audio Recap of this lesson...", "info");
      }

      try {
        const podcastData = await generateAudioPodcast({
          topic: topic || "Classroom Lecture",
          subject: subject || "Science",
          grade: grade || "Class 10-12",
          language: (mediumOfLearning as any) || "Hinglish",
          notesOrDocumentText: notesOrDocumentText || "",
          episodeType: "quick_revision",
          targetDurationMins: 8,
        });

        setActiveAudioPodcast(podcastData);
        setIsAudioPodcastModalOpen(true);
        if (addToast) {
          addToast("🎉 Quick Audio Recap ready! Enjoy listening.", "success");
        }
      } catch (err: any) {
        console.error("[triggerLivePodcastSummary] Error:", err);
        if (addToast) {
          addToast("Could not generate audio recap. Please try again!", "error");
        }
      } finally {
        setIsGeneratingLiveRecap(false);
      }
    },
    [isGeneratingLiveRecap, addToast]
  );

  const value = useMemo(
    () => ({
      youtubeUrl,
      setYoutubeUrl,
      isYoutubeLoading,
      setIsYoutubeLoading,
      isYtPlayerExpanded,
      setIsYtPlayerExpanded,
      showMobileYtPlayer,
      setShowMobileYtPlayer,
      activeMobileTab,
      setActiveMobileTab,
      isQuizFullScreenOpen,
      setIsQuizFullScreenOpen,
      activeAudioPodcast,
      setActiveAudioPodcast,
      isAudioPodcastModalOpen,
      setIsAudioPodcastModalOpen,
      postLessonSession,
      setPostLessonSession,
      showPostLessonModal,
      setShowPostLessonModal,
      isGeneratingLiveRecap,
      triggerLivePodcastSummary,
    }),
    [
      youtubeUrl,
      isYoutubeLoading,
      isYtPlayerExpanded,
      showMobileYtPlayer,
      activeMobileTab,
      isQuizFullScreenOpen,
      activeAudioPodcast,
      isAudioPodcastModalOpen,
      postLessonSession,
      showPostLessonModal,
      isGeneratingLiveRecap,
      triggerLivePodcastSummary,
    ]
  );

  return <LiveSessionUiContext.Provider value={value}>{children}</LiveSessionUiContext.Provider>;
};

export const useLiveSessionUi = () => {
  const context = useContext(LiveSessionUiContext);
  if (!context) {
    throw new Error("useLiveSessionUi must be used within a LiveSessionUiProvider");
  }
  return context;
};
