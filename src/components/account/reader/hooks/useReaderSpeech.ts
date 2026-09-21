/**
 * useReaderSpeech.ts
 * Sub-hook for managing Text-to-Speech audio narration and 2-Host podcast generation.
 */
import { useState, useEffect, useRef } from "react";
import { ChapterItem } from "../readerTypes";
import { cleanMarkdownForSpeech } from "../utils/readerChapterUtils";
import {
  generateAudioPodcast,
  getSavedPodcasts,
} from "../../../../services/podcastService";

interface UseReaderSpeechParams {
  book: any;
  currentChapter: ChapterItem;
  activeChapterIndex: number;
}

export const useReaderSpeech = ({
  book,
  currentChapter,
  activeChapterIndex,
}: UseReaderSpeechParams) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState<boolean>(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stopSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
  };

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }
    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    stopSpeech();
    const cleanText = cleanMarkdownForSpeech(
      `Chapter ${activeChapterIndex + 1}: ${currentChapter.title}. \n\n ${currentChapter.content}`,
    );
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find(
        (v) =>
          (v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("natural") ||
            v.name.toLowerCase().includes("google") ||
            v.name.toLowerCase().includes("samantha") ||
            v.name.toLowerCase().includes("karen")) &&
          v.lang.startsWith("en"),
      ) || voices.find((v) => v.lang.startsWith("en"));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleCycleSpeechRate = () => {
    const nextRate = speechRate === 1.0 ? 1.25 : speechRate === 1.25 ? 1.5 : 1.0;
    setSpeechRate(nextRate);
    if (isSpeaking) {
      stopSpeech();
      setTimeout(handleToggleSpeech, 100);
    }
  };

  const handleTriggerBookPodcast = async () => {
    if (isGeneratingPodcast || !book) return;
    const topicTitle =
      book.processedTitle || currentChapter?.title || "Classroom Lecture";
    const subjectName = book.inferredSubject || book.subject || "Science";
    const gradeName = book.grade || "Class 10-12";
    const contentText =
      currentChapter?.content || book.customBoardContent || "";

    stopSpeech();

    const saved = getSavedPodcasts();
    const existing = saved.find(
      (p) => p.topic.toLowerCase().trim() === topicTitle.toLowerCase().trim(),
    );
    if (existing) {
      window.dispatchEvent(
        new CustomEvent("cherry_open_audio_podcast", { detail: existing }),
      );
      return;
    }

    setIsGeneratingPodcast(true);
    try {
      const podcastData = await generateAudioPodcast({
        topic: topicTitle,
        subject: subjectName,
        grade: gradeName,
        language: "Hinglish",
        notesOrDocumentText: contentText,
        episodeType: "quick_revision",
        targetDurationMins: 8,
      });
      window.dispatchEvent(
        new CustomEvent("cherry_open_audio_podcast", { detail: podcastData }),
      );
    } catch (err: any) {
      console.error("[useReaderSpeech] Failed to generate podcast:", err);
    } finally {
      setIsGeneratingPodcast(false);
    }
  };

  return {
    isSpeaking,
    isPaused,
    speechRate,
    isGeneratingPodcast,
    stopSpeech,
    handleToggleSpeech,
    handleCycleSpeechRate,
    handleTriggerBookPodcast,
  };
};
