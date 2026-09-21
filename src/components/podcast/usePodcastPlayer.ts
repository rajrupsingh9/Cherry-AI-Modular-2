/**
 * usePodcastPlayer.ts
 * Hook managing DualVoiceAudioEngine, offline persistence, playback state, and actions
 */
import { useState, useEffect, useRef } from "react";
import { AudioPodcastData, PodcastSegment, PodcastAudioEngineMode } from "../../types";
import { DualVoiceAudioEngine, VoicePair } from "../../utils/dualVoiceAudioEngine";
import {
  isPodcastSavedOffline,
  getOfflinePodcast,
  deleteOfflinePodcast,
  downloadAndSavePodcastForOffline,
  PodcastDownloadProgress,
  OfflinePodcastRecord,
} from "../../utils/offlineAudioStorage";
import { PodcastPlayerTab } from "./podcastPlayerTypes";

interface UsePodcastPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  podcast: AudioPodcastData | null;
  onSpeakSegment?: (segment: PodcastSegment, rate: number) => void;
  onStopAudio?: () => void;
  externalAudioPlaying?: boolean;
}

export function usePodcastPlayer({
  isOpen,
  onClose,
  podcast,
  onSpeakSegment,
  onStopAudio,
  externalAudioPlaying,
}: UsePodcastPlayerProps) {
  const [activeTab, setActiveTab] = useState<PodcastPlayerTab>("player");
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [voicePair, setVoicePair] = useState<VoicePair | null>(null);
  const [isPreviewingVoices, setIsPreviewingVoices] = useState<boolean>(false);
  const [audioMode, setAudioMode] = useState<PodcastAudioEngineMode>("ai_studio");
  const [isSegmentLoading, setIsSegmentLoading] = useState<boolean>(false);

  // Offline & Direct Audio Download state
  const [isSavedOffline, setIsSavedOffline] = useState<boolean>(false);
  const [isDownloadingAudio, setIsDownloadingAudio] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<PodcastDownloadProgress | null>(null);
  const [offlineRecord, setOfflineRecord] = useState<OfflinePodcastRecord | null>(null);
  const [downloadStatusNote, setDownloadStatusNote] = useState<string | null>(null);

  const [segmentElapsed, setSegmentElapsed] = useState<number>(0);
  const transcriptScrollRef = useRef<HTMLDivElement | null>(null);
  const audioEngineRef = useRef<DualVoiceAudioEngine | null>(null);

  useEffect(() => {
    const engine = new DualVoiceAudioEngine({
      onSegmentStart: (idx, _seg) => {
        setCurrentSegmentIndex(idx);
        setSegmentElapsed(0);
        setIsSegmentLoading(false);
      },
      onProgress: (segElapsed, _totalElapsed, _progressPct) => {
        setSegmentElapsed(segElapsed);
      },
      onPlaybackComplete: () => {
        setIsPlaying(false);
        setIsSegmentLoading(false);
        if (onStopAudio) onStopAudio();
      },
      onVoicesReady: (pair) => setVoicePair(pair),
      onAudioModeChange: (mode) => setAudioMode(mode),
      onSegmentLoading: (_idx, isLoading) => setIsSegmentLoading(isLoading),
    });

    audioEngineRef.current = engine;
    const initialVoices = engine.resolveVoicePair(podcast?.language || "Hinglish");
    setVoicePair(initialVoices);

    return () => {
      engine.stop();
    };
  }, []);

  useEffect(() => {
    if (externalAudioPlaying !== undefined) {
      setIsPlaying(externalAudioPlaying);
      if (!externalAudioPlaying && audioEngineRef.current) {
        audioEngineRef.current.pause();
      }
    }
  }, [externalAudioPlaying]);

  useEffect(() => {
    if (isOpen && podcast) {
      setCurrentSegmentIndex(0);
      setSegmentElapsed(0);
      setIsPlaying(false);
      setActiveTab("player");
      setDownloadProgress(null);
      setDownloadStatusNote(null);

      isPodcastSavedOffline(podcast.id)
        .then((saved) => {
          setIsSavedOffline(saved);
          if (saved) {
            getOfflinePodcast(podcast.id).then((rec) => {
              if (rec) {
                setOfflineRecord(rec);
                if (rec.segmentAudios && audioEngineRef.current) {
                  audioEngineRef.current.loadOfflineAudios(rec.segmentAudios);
                }
              }
            });
          }
        })
        .catch(() => setIsSavedOffline(false));

      if (audioEngineRef.current) {
        audioEngineRef.current.loadPodcast(podcast);
        const resolved = audioEngineRef.current.resolveVoicePair(podcast.language);
        setVoicePair(resolved);
        audioEngineRef.current.prefetchAhead(-1, 2);
      }
    } else if (!isOpen && audioEngineRef.current) {
      audioEngineRef.current.stop();
      setIsPlaying(false);
    }
  }, [isOpen, podcast?.id]);

  const currentSegment: PodcastSegment | undefined =
    podcast?.segments && podcast.segments[currentSegmentIndex];
  const totalSegments = podcast?.segments?.length || 0;

  const currentSegmentDuration = currentSegment
    ? Math.max(3, Math.round((Math.max(4, Math.round((currentSegment.text.trim().split(/\s+/).length / 140) * 60)) / playbackSpeed)))
    : 8;

  useEffect(() => {
    if (activeTab === "transcript" && transcriptScrollRef.current) {
      const activeEl = transcriptScrollRef.current.querySelector(
        `[data-segment-idx="${currentSegmentIndex}"]`
      );
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [currentSegmentIndex, activeTab]);

  const handleTogglePlay = async () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (audioEngineRef.current) audioEngineRef.current.pause();
      if (onStopAudio) onStopAudio();
    } else {
      if (!isSavedOffline && (!audioEngineRef.current || !audioEngineRef.current.hasOfflineAudios())) {
        setIsDownloadingAudio(true);
        setDownloadStatusNote("🎙️ Preparing 24kHz Seamless Audio (Zero Gap)...");
        try {
          if (podcast) {
            const { offlineRecord: rec } = await downloadAndSavePodcastForOffline(podcast, {
              triggerFileDownload: false,
              onProgress: (p) => setDownloadProgress(p),
            });
            setIsSavedOffline(true);
            setOfflineRecord(rec);
            if (rec.segmentAudios && audioEngineRef.current) {
              audioEngineRef.current.loadOfflineAudios(rec.segmentAudios);
            }
            setIsDownloadingAudio(false);
            setDownloadProgress(null);
            setDownloadStatusNote("✓ 24kHz Seamless Audio Ready!");
          }
        } catch (err) {
          console.warn("[usePodcastPlayer] Seamless prep notice:", err);
          setIsDownloadingAudio(false);
          setDownloadProgress(null);
        }
      }

      setIsPlaying(true);
      if (audioEngineRef.current) audioEngineRef.current.play();
      if (onSpeakSegment && currentSegment && !isMuted) {
        onSpeakSegment(currentSegment, playbackSpeed);
      }
    }
  };

  const handleNextSegment = () => {
    if (currentSegmentIndex < totalSegments - 1) {
      const nextIdx = currentSegmentIndex + 1;
      setCurrentSegmentIndex(nextIdx);
      setSegmentElapsed(0);
      if (audioEngineRef.current) audioEngineRef.current.seekToSegment(nextIdx);
    }
  };

  const handlePrevSegment = () => {
    const prevIdx = Math.max(0, currentSegmentIndex - 1);
    setCurrentSegmentIndex(prevIdx);
    setSegmentElapsed(0);
    if (audioEngineRef.current) audioEngineRef.current.seekToSegment(prevIdx);
  };

  const handleRewind10 = () => {
    const targetIdx = Math.max(0, currentSegmentIndex - 1);
    setCurrentSegmentIndex(targetIdx);
    setSegmentElapsed(0);
    if (audioEngineRef.current) audioEngineRef.current.seekToSegment(targetIdx);
  };

  const handleForward10 = () => {
    const targetIdx = Math.min(totalSegments - 1, currentSegmentIndex + 1);
    setCurrentSegmentIndex(targetIdx);
    setSegmentElapsed(0);
    if (audioEngineRef.current) audioEngineRef.current.seekToSegment(targetIdx);
  };

  const cycleSpeed = () => {
    const speeds = [0.9, 1.0, 1.25, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (audioEngineRef.current) audioEngineRef.current.setRate(nextSpeed);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioEngineRef.current) audioEngineRef.current.setMuted(nextMuted);
  };

  const handleSelectSegment = async (idx: number) => {
    setCurrentSegmentIndex(idx);
    setSegmentElapsed(0);
    if (!isSavedOffline && (!audioEngineRef.current || !audioEngineRef.current.hasOfflineAudios())) {
      setIsDownloadingAudio(true);
      setDownloadStatusNote("🎙️ Preparing 24kHz Seamless Audio...");
      try {
        if (podcast) {
          const { offlineRecord: rec } = await downloadAndSavePodcastForOffline(podcast, {
            triggerFileDownload: false,
            onProgress: (p) => setDownloadProgress(p),
          });
          setIsSavedOffline(true);
          setOfflineRecord(rec);
          if (rec.segmentAudios && audioEngineRef.current) {
            audioEngineRef.current.loadOfflineAudios(rec.segmentAudios);
          }
        }
      } catch (err) {
        console.warn("[usePodcastPlayer] Prep error:", err);
      } finally {
        setIsDownloadingAudio(false);
        setDownloadProgress(null);
      }
    }
    setIsPlaying(true);
    if (audioEngineRef.current) audioEngineRef.current.seekToSegment(idx);
  };

  const handleCloseModal = () => {
    if (audioEngineRef.current) audioEngineRef.current.stop();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPreviewingVoices(false);
    if (onStopAudio) onStopAudio();
    onClose();
  };

  const handleCopyTranscript = () => {
    if (!podcast) return;
    const fullText = podcast.segments.map((s) => `${s.speakerName}: "${s.text}"`).join("\n\n");
    navigator.clipboard.writeText(fullText);
    setCopiedId("full");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadTakeawaysAndTranscript = () => {
    if (!podcast) return;
    let md = `# 🎙️ Audio Podcast Summary: ${podcast.title}\n`;
    if (podcast.hindiTitle) md += `### ${podcast.hindiTitle}\n\n`;
    md += `**Subject:** ${podcast.subject} | **Grade:** ${podcast.grade} | **Language:** ${podcast.language}\n`;
    md += `**Hosts:** ${podcast.hosts.mentor.name} (${podcast.hosts.mentor.role}) & ${podcast.hosts.student.name} (${podcast.hosts.student.role})\n`;
    md += `**Generated:** ${new Date().toLocaleDateString()} via Cherry AI Classroom\n\n`;
    md += `---\n\n## 📖 Executive Overview\n\n${podcast.overview}\n\n`;
    md += `## 🎯 High-Yield Key Takeaways\n\n`;
    podcast.keyTakeaways.forEach((t, i) => {
      md += `${i + 1}. ${t}\n`;
    });
    md += `\n---\n\n## 📝 Full Audio Conversation Transcript\n\n`;
    podcast.segments.forEach((s) => {
      md += `**${s.speakerName}** (${s.intent || "discussion"}):\n> "${s.text}"\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(podcast.topic || "Audio_Summary").replace(/[^a-zA-Z0-9_-]/g, "_")}_Key_Takeaways.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAudioWav = async () => {
    if (!podcast || isDownloadingAudio) return;
    setIsDownloadingAudio(true);
    setDownloadStatusNote("Preparing Real Human Voice .wav audio...");
    try {
      const existingAudios = audioEngineRef.current ? audioEngineRef.current.getAudioUrlCache() : undefined;
      await downloadAndSavePodcastForOffline(podcast, {
        existingSegmentAudios: existingAudios,
        triggerFileDownload: true,
        onProgress: (p) => setDownloadProgress(p),
      });
      setIsSavedOffline(true);
      setDownloadStatusNote("✓ Audio downloaded to device & saved offline!");
      setTimeout(() => setDownloadStatusNote(null), 4000);
    } catch (err) {
      console.error("[usePodcastPlayer] Download error:", err);
      setDownloadStatusNote("Download error. Please try again.");
      setTimeout(() => setDownloadStatusNote(null), 4000);
    } finally {
      setIsDownloadingAudio(false);
      setDownloadProgress(null);
    }
  };

  const handleSaveOffline = async () => {
    if (!podcast || isDownloadingAudio) return;
    setIsDownloadingAudio(true);
    setDownloadStatusNote("Saving podcast audio to local device storage...");
    try {
      const existingAudios = audioEngineRef.current ? audioEngineRef.current.getAudioUrlCache() : undefined;
      const { offlineRecord: savedRecord } = await downloadAndSavePodcastForOffline(podcast, {
        existingSegmentAudios: existingAudios,
        triggerFileDownload: false,
        onProgress: (p) => setDownloadProgress(p),
      });
      setIsSavedOffline(true);
      setOfflineRecord(savedRecord);
      if (audioEngineRef.current && savedRecord.segmentAudios) {
        audioEngineRef.current.loadOfflineAudios(savedRecord.segmentAudios);
      }
      setDownloadStatusNote("✓ Saved for Offline Play! (बिना इंटरनेट सुन सकते हैं)");
      setTimeout(() => setDownloadStatusNote(null), 4000);
    } catch (err) {
      console.error("[usePodcastPlayer] Save offline error:", err);
      setDownloadStatusNote("Could not save offline. Please check storage.");
      setTimeout(() => setDownloadStatusNote(null), 4000);
    } finally {
      setIsDownloadingAudio(false);
      setDownloadProgress(null);
    }
  };

  const handleDeleteOffline = async () => {
    if (!podcast) return;
    try {
      await deleteOfflinePodcast(podcast.id);
      setIsSavedOffline(false);
      setOfflineRecord(null);
      setDownloadStatusNote("Removed from offline storage.");
      setTimeout(() => setDownloadStatusNote(null), 2500);
    } catch (err) {
      console.error("[usePodcastPlayer] Delete offline error:", err);
    }
  };

  const progressPercent =
    totalSegments > 0
      ? Math.min(100, Math.round(((currentSegmentIndex + segmentElapsed / currentSegmentDuration) / totalSegments) * 100))
      : 0;

  return {
    activeTab,
    setActiveTab,
    currentSegmentIndex,
    isPlaying,
    playbackSpeed,
    isMuted,
    copiedId,
    voicePair,
    audioMode,
    isSegmentLoading,
    isSavedOffline,
    isDownloadingAudio,
    downloadProgress,
    offlineRecord,
    downloadStatusNote,
    currentSegment,
    totalSegments,
    progressPercent,
    transcriptScrollRef,
    handleTogglePlay,
    handleNextSegment,
    handlePrevSegment,
    handleRewind10,
    handleForward10,
    cycleSpeed,
    handleToggleMute,
    handleSelectSegment,
    handleCloseModal,
    handleCopyTranscript,
    handleDownloadTakeawaysAndTranscript,
    handleDownloadAudioWav,
    handleSaveOffline,
    handleDeleteOffline,
  };
}
