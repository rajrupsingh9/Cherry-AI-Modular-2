import { useState, useCallback } from "react";
import { generateAudioPodcast, getSavedPodcasts } from "../../services/podcastService";

export interface UsePodcastPlayerTriggerProps {
  subject?: string;
  grade?: any;
  mediumOfLearning?: string;
}

export function usePodcastPlayerTrigger({
  subject = "Science",
  grade = "Class 10-12",
  mediumOfLearning = "Hinglish",
}: UsePodcastPlayerTriggerProps = {}) {
  const [generatingPodcastBookId, setGeneratingPodcastBookId] = useState<string | null>(null);

  const handleTriggerBookPodcast = useCallback(
    async (book: any) => {
      if (!book) return;
      const bookId = book.sessionId || book.id || `book_${book.index || 0}`;
      if (generatingPodcastBookId === bookId) return;

      const bookTitle =
        book.activeDocumentName ||
        book.title ||
        (book.topics && book.topics[0]) ||
        "Classroom Lesson";
      const bookSubject = book.inferredSubject || book.subject || subject || "Science";
      const bookGrade = book.grade || grade || "Class 10-12";
      const bookContent =
        book.customBoardContent ||
        book.documentMarkdown ||
        (book.topicBoardsContent && Object.values(book.topicBoardsContent).join("\n\n")) ||
        "";

      // 1. Check if we have a saved cached podcast for this topic
      const saved = getSavedPodcasts();
      const existing = saved.find(
        (p) => p.topic.toLowerCase().trim() === bookTitle.toLowerCase().trim()
      );

      if (existing) {
        window.dispatchEvent(
          new CustomEvent("cherry_open_audio_podcast", { detail: existing })
        );
        return;
      }

      // 2. Generate new 2-minute audio overview
      setGeneratingPodcastBookId(bookId);

      try {
        const podcastData = await generateAudioPodcast({
          topic: bookTitle,
          subject: bookSubject,
          grade: bookGrade,
          language: (mediumOfLearning?.toLowerCase().includes("hindi")
            ? "Hindi"
            : mediumOfLearning?.toLowerCase().includes("english")
            ? "English"
            : "Hinglish") as any,
          notesOrDocumentText: bookContent,
          episodeType: "quick_revision",
          targetDurationMins: 8,
        });

        window.dispatchEvent(
          new CustomEvent("cherry_open_audio_podcast", { detail: podcastData })
        );
      } catch (err: any) {
        console.error("[StudentAccountHub] Failed to generate podcast:", err);
      } finally {
        setGeneratingPodcastBookId(null);
      }
    },
    [generatingPodcastBookId, subject, grade, mediumOfLearning],
  );

  return {
    generatingPodcastBookId,
    handleTriggerBookPodcast,
  };
}
