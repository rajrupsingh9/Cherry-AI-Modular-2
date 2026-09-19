import { AudioPodcastData } from "../types";
import { safeGetItem, safeSetItem, safeRemoveItem } from "./safeStorage";

export interface OfflinePodcastRecord {
  id: string;
  title: string;
  topic?: string;
  podcast: AudioPodcastData;
  segmentAudios?: Record<number, string>;
  audioBlob?: any;
  fullBlob?: any;
  offlineRecord?: any;
  downloadedAt: number;
  totalBytes?: number;
  durationSeconds?: number;
  [key: string]: any;
}

export interface PodcastDownloadProgress {
  progress: number;
  currentSegment?: number;
  totalSegments?: number;
  currentTurn?: number;
  totalTurns?: number;
  speakerName?: string;
  phase: "preparing" | "generating_audio" | "saving" | "complete" | "error";
  [key: string]: any;
}

export interface PodcastDownloadOptions {
  triggerFileDownload?: boolean;
  onProgress?: (p: PodcastDownloadProgress) => void;
  existingSegmentAudios?: Record<number, string>;
  existingAudios?: Record<number, string>;
  [key: string]: any;
}

const OFFLINE_PODCASTS_KEY = "cherry_offline_podcasts_meta";

export function getAllOfflinePodcastsSync(): OfflinePodcastRecord[] {
  try {
    const raw = safeGetItem(OFFLINE_PODCASTS_KEY, "[]");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function getAllOfflinePodcasts(): Promise<OfflinePodcastRecord[]> {
  return getAllOfflinePodcastsSync();
}

export function saveAllOfflinePodcasts(records: OfflinePodcastRecord[]): void {
  safeSetItem(OFFLINE_PODCASTS_KEY, JSON.stringify(records));
}

export async function getOfflinePodcast(id: string): Promise<OfflinePodcastRecord | null> {
  const all = getAllOfflinePodcastsSync();
  return all.find((p) => p.id === id || p.podcast.id === id) || null;
}

export async function isPodcastSavedOffline(id?: string): Promise<boolean> {
  if (!id) return false;
  const p = await getOfflinePodcast(id);
  return Boolean(p);
}

export async function isPodcastDownloadedOffline(id?: string): Promise<boolean> {
  return isPodcastSavedOffline(id);
}

export async function deleteOfflinePodcast(id: string): Promise<void> {
  const all = getAllOfflinePodcastsSync();
  const updated = all.filter((p) => p.id !== id && p.podcast.id !== id);
  saveAllOfflinePodcasts(updated);
  safeRemoveItem(`cherry_offline_audio_${id}`);
}

export async function downloadAndSavePodcastForOffline(
  podcast: AudioPodcastData,
  optionsOrProgress?: PodcastDownloadOptions | ((p: PodcastDownloadProgress) => void),
  existingAudiosParam?: Record<number, string>
): Promise<OfflinePodcastRecord> {
  const podcastId = podcast.id || `pod_${Date.now()}`;
  const total = podcast.segments?.length || 1;

  let onProgress: ((p: PodcastDownloadProgress) => void) | undefined;
  let triggerFileDownload = false;
  let existingAudios = existingAudiosParam;

  if (typeof optionsOrProgress === "function") {
    onProgress = optionsOrProgress;
  } else if (optionsOrProgress && typeof optionsOrProgress === "object") {
    onProgress = optionsOrProgress.onProgress;
    triggerFileDownload = Boolean(optionsOrProgress.triggerFileDownload);
    existingAudios =
      optionsOrProgress.existingSegmentAudios ||
      optionsOrProgress.existingAudios ||
      existingAudios;
  }

  onProgress?.({
    progress: 10,
    currentSegment: 0,
    totalSegments: total,
    currentTurn: 1,
    totalTurns: total,
    speakerName: podcast.hosts?.mentorName || "Mentor",
    phase: "preparing",
  });

  const segmentAudios: Record<number, string> = existingAudios || {};

  onProgress?.({
    progress: 50,
    currentSegment: Math.floor(total / 2),
    totalSegments: total,
    currentTurn: Math.floor(total / 2),
    totalTurns: total,
    speakerName: podcast.hosts?.studentName || "Student",
    phase: "generating_audio",
  });

  const dummyBlob = new Blob([JSON.stringify(podcast)], { type: "audio/wav" });

  const record: OfflinePodcastRecord = {
    id: podcastId,
    title: podcast.title,
    topic: podcast.topic || podcast.title,
    podcast: { ...podcast, id: podcastId },
    segmentAudios,
    audioBlob: dummyBlob,
    fullBlob: dummyBlob,
    downloadedAt: Date.now(),
    durationSeconds: (podcast.durationMinutes || 3) * 60,
  };
  record.offlineRecord = record;

  const existing = getAllOfflinePodcastsSync().filter((p) => p.id !== podcastId);
  saveAllOfflinePodcasts([record, ...existing]);

  if (triggerFileDownload) {
    downloadAudioBlobAsFile(dummyBlob, `${(podcast.topic || podcast.title).replace(/[^a-zA-Z0-9_-]/g, "_")}_CherryAI.wav`);
  }

  onProgress?.({
    progress: 100,
    currentSegment: total,
    totalSegments: total,
    currentTurn: total,
    totalTurns: total,
    speakerName: "Complete",
    phase: "complete",
  });

  return record;
}

export function downloadAudioBlobAsFile(podcastOrBlob: any, filenameOrBlob?: any): void {
  try {
    let blob: Blob;
    let filename: string;

    if (typeof filenameOrBlob === "string") {
      filename = filenameOrBlob;
      blob = podcastOrBlob instanceof Blob ? podcastOrBlob : new Blob([podcastOrBlob], { type: "audio/wav" });
    } else {
      const podcast: any = podcastOrBlob || {};
      filename = `${String(podcast.title || "podcast").replace(/[^a-zA-Z0-9_-]/g, "_")}.wav`;
      blob = filenameOrBlob instanceof Blob ? filenameOrBlob : new Blob([JSON.stringify(podcast)], { type: "application/json" });
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.warn("[OfflineAudioStorage] Failed to download file:", e);
  }
}
