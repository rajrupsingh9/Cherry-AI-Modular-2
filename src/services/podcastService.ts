import { AudioPodcastData } from "../types";
import { safeGetItem, safeSetItem } from "../utils/safeStorage";
import { buildProceduralPodcast } from "../utils/podcastEngine";

const SAVED_PODCASTS_KEY = "cherry_saved_podcasts";

export function getSavedPodcasts(): AudioPodcastData[] {
  try {
    const raw = safeGetItem(SAVED_PODCASTS_KEY, "[]");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function savePodcastLocally(podcast: AudioPodcastData): void {
  const existing = getSavedPodcasts();
  const filtered = existing.filter((p) => p.id !== podcast.id);
  safeSetItem(SAVED_PODCASTS_KEY, JSON.stringify([podcast, ...filtered]));
}

export async function generateAudioPodcast(params: {
  topic: string;
  subject: string;
  grade: string;
  language: string;
  notesOrDocumentText?: string;
  episodeType?: string;
  targetDurationMins?: number;
  hostPair?: string;
}): Promise<AudioPodcastData> {
  try {
    const res = await fetch("/api/generate-podcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        savePodcastLocally(data.data);
        return data.data;
      }
    }
  } catch (err) {
    console.warn("[PodcastService] Network request failed, using procedural generation:", err);
  }

  // Fallback to high-quality procedural podcast
  const procedural = buildProceduralPodcast(
    params.topic,
    params.subject,
    params.grade,
    params.language,
    params.hostPair,
    params.episodeType,
    params.targetDurationMins,
    params.notesOrDocumentText
  );

  savePodcastLocally(procedural);
  return procedural;
}
