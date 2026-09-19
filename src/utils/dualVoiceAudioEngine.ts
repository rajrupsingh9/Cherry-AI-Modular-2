import { AudioPodcastData, PodcastSegment, PodcastAudioEngineMode } from "../types";

export interface VoicePair {
  mentorVoice: SpeechSynthesisVoice | null;
  studentVoice: SpeechSynthesisVoice | null;
  mentorName: string;
  studentName: string;
  mentorPitch?: number;
  studentPitch?: number;
  [key: string]: any;
}

export interface DualVoiceAudioEngineOptions {
  onSegmentStart?: (index: number, segment: PodcastSegment) => void;
  onProgress?: (segmentElapsed: number, totalElapsed: number, progressPct: number) => void;
  onPlaybackComplete?: () => void;
  onVoicesReady?: (pair: VoicePair) => void;
  onAudioModeChange?: (mode: PodcastAudioEngineMode) => void;
  onSegmentLoading?: (index: number, isLoading: boolean) => void;
}

export class DualVoiceAudioEngine {
  private options: DualVoiceAudioEngineOptions;
  private currentPodcast: AudioPodcastData | null = null;
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private rate: number = 1.0;
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioUrlCache: Record<number, string> = {};
  private voices: SpeechSynthesisVoice[] = [];
  private progressInterval: any = null;
  private elapsedSeconds: number = 0;

  constructor(options: DualVoiceAudioEngineOptions) {
    this.options = options;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    const pair = this.resolveVoicePair(this.currentPodcast?.language);
    this.options.onVoicesReady?.(pair);
  }

  public resolveVoicePair(language?: string): VoicePair {
    const isHindi = language?.toLowerCase().includes("hin") || language?.toLowerCase().includes("hing");
    const langCode = isHindi ? "hi" : "en";

    const matches = this.voices.filter((v) => v.lang.toLowerCase().startsWith(langCode));
    const female = matches.find((v) => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("natural") || v.name.toLowerCase().includes("google")) || matches[0] || this.voices[0] || null;
    const male = matches.find((v) => v !== female && (v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("david"))) || matches[1] || this.voices[1] || null;

    return {
      mentorVoice: female,
      studentVoice: male,
      mentorName: this.currentPodcast?.hosts?.mentorName || "Tara Ma'am",
      studentName: this.currentPodcast?.hosts?.studentName || "Aarav",
    };
  }

  public loadPodcast(podcast: AudioPodcastData) {
    this.stop();
    this.currentPodcast = podcast;
    this.currentIndex = 0;
    this.elapsedSeconds = 0;
    const pair = this.resolveVoicePair(podcast.language);
    this.options.onVoicesReady?.(pair);
  }

  public loadOfflineAudios(audios?: Record<number, string>) {
    if (audios) {
      this.audioUrlCache = { ...this.audioUrlCache, ...audios };
      this.options.onAudioModeChange?.("offline_cached");
    }
  }

  public hasOfflineAudios(): boolean {
    return Object.keys(this.audioUrlCache).length > 0;
  }

  public getAudioUrlCache(): Record<number, string> {
    return this.audioUrlCache;
  }

  public prefetchAhead(_index: number, _count: number) {
    // Prefetching logic placeholder
  }

  public play() {
    if (!this.currentPodcast || !this.currentPodcast.segments.length) return;
    this.isPlaying = true;
    this.playSegment(this.currentIndex);
  }

  public pause() {
    this.isPlaying = false;
    if (this.synth) {
      this.synth.cancel();
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  public stop() {
    this.pause();
    this.currentIndex = 0;
    this.elapsedSeconds = 0;
  }

  public seekToSegment(index: number) {
    if (!this.currentPodcast) return;
    const safeIndex = Math.max(0, Math.min(index, this.currentPodcast.segments.length - 1));
    this.currentIndex = safeIndex;
    this.elapsedSeconds = 0;
    if (this.isPlaying) {
      this.playSegment(safeIndex);
    } else {
      const seg = this.currentPodcast.segments[safeIndex];
      this.options.onSegmentStart?.(safeIndex, seg);
    }
  }

  public setRate(rate: number) {
    this.rate = rate;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.synth) {
      this.synth.cancel();
    }
  }

  private playSegment(index: number) {
    if (!this.currentPodcast || index >= this.currentPodcast.segments.length) {
      this.isPlaying = false;
      this.options.onPlaybackComplete?.();
      return;
    }

    const seg = this.currentPodcast.segments[index];
    this.currentIndex = index;
    this.options.onSegmentStart?.(index, seg);

    if (!this.synth || this.isMuted) return;

    this.synth.cancel();

    const pair = this.resolveVoicePair(this.currentPodcast.language);
    const voice = seg.speaker === "mentor" ? pair.mentorVoice : pair.studentVoice;

    const utterance = new SpeechSynthesisUtterance(seg.text);
    if (voice) utterance.voice = voice;
    utterance.rate = this.rate;
    utterance.pitch = seg.speaker === "mentor" ? 1.05 : 0.95;

    let segElapsed = 0;
    if (this.progressInterval) clearInterval(this.progressInterval);
    this.progressInterval = setInterval(() => {
      segElapsed += 0.5;
      this.elapsedSeconds += 0.5;
      const totalEstimated = (this.currentPodcast?.durationMinutes || 3) * 60;
      const pct = Math.min(100, Math.round((this.elapsedSeconds / totalEstimated) * 100));
      this.options.onProgress?.(segElapsed, this.elapsedSeconds, pct);
    }, 500);

    utterance.onend = () => {
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }
      if (this.isPlaying) {
        this.seekToSegment(index + 1);
        if (index + 1 < (this.currentPodcast?.segments.length || 0)) {
          this.playSegment(index + 1);
        } else {
          this.isPlaying = false;
          this.options.onPlaybackComplete?.();
        }
      }
    };

    utterance.onerror = (e) => {
      console.warn("[DualVoiceAudioEngine] TTS error:", e);
      if (this.progressInterval) clearInterval(this.progressInterval);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }
}
