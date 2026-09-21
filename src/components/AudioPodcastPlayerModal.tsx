/**
 * AudioPodcastPlayerModal.tsx
 * Thin Orchestrator for the Socratic 2-Host Audio Overview & Podcast Player Modal
 */
import React from "react";
import { motion } from "motion/react";
import { Radio, BookOpen, Sparkles } from "lucide-react";
import { AudioPodcastPlayerModalProps } from "./podcast/podcastPlayerTypes";
import { usePodcastPlayer } from "./podcast/usePodcastPlayer";
import { PodcastHeaderBar } from "./podcast/PodcastHeaderBar";
import { PodcastHostsStage } from "./podcast/PodcastHostsStage";
import { PodcastControlsDeck } from "./podcast/PodcastControlsDeck";
import { PodcastOfflineHub } from "./podcast/PodcastOfflineHub";
import { PodcastTranscriptTab } from "./podcast/PodcastTranscriptTab";
import { PodcastTakeawaysTab } from "./podcast/PodcastTakeawaysTab";

export default function AudioPodcastPlayerModal({
  isOpen,
  onClose,
  podcast,
  onSpeakSegment,
  onStopAudio,
  isAudioPlaying: externalAudioPlaying,
}: AudioPodcastPlayerModalProps) {
  const player = usePodcastPlayer({
    isOpen,
    onClose,
    podcast,
    onSpeakSegment,
    onStopAudio,
    externalAudioPlaying,
  });

  if (!isOpen || !podcast) return null;

  const isMentorSpeaking = player.currentSegment?.speaker === "mentor";
  const isStudentSpeaking = player.currentSegment?.speaker === "student";

  return (
    <div
      id="audio-podcast-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <motion.div
        id="audio-podcast-player-card"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="w-full max-w-md sm:max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col max-h-[92vh] overflow-hidden my-auto"
      >
        {/* TOP APP-STYLE HEADER BAR */}
        <PodcastHeaderBar
          podcast={podcast}
          isSavedOffline={player.isSavedOffline}
          isDownloadingAudio={player.isDownloadingAudio}
          copiedId={player.copiedId}
          onDownloadAudioWav={player.handleDownloadAudioWav}
          onDownloadTakeaways={player.handleDownloadTakeawaysAndTranscript}
          onCopyTranscript={player.handleCopyTranscript}
          onCloseModal={player.handleCloseModal}
        />

        {/* SUB-NAV TABS */}
        <div
          id="podcast-nav-tabs"
          className="px-4 py-2 bg-white border-b border-slate-100 flex items-center justify-between gap-1 text-[11px] font-bold"
        >
          <button
            id="podcast-tab-player"
            type="button"
            onClick={() => player.setActiveTab("player")}
            className={`flex-1 py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              player.activeTab === "player"
                ? "bg-indigo-50 text-[#796AEF] border border-indigo-100/70"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>2-Host Studio</span>
          </button>
          <button
            id="podcast-tab-transcript"
            type="button"
            onClick={() => player.setActiveTab("transcript")}
            className={`flex-1 py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              player.activeTab === "transcript"
                ? "bg-indigo-50 text-[#796AEF] border border-indigo-100/70"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Transcript ({player.totalSegments})</span>
          </button>
          <button
            id="podcast-tab-takeaways"
            type="button"
            onClick={() => player.setActiveTab("takeaways")}
            className={`flex-1 py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              player.activeTab === "takeaways"
                ? "bg-indigo-50 text-[#796AEF] border border-indigo-100/70"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Key Takeaways</span>
          </button>
        </div>

        {/* MAIN BODY BASED ON ACTIVE TAB */}
        <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
          {player.activeTab === "player" && (
            <div id="podcast-player-tab-content" className="flex flex-col gap-4">
              <PodcastHostsStage
                podcast={podcast}
                currentSegmentIndex={player.currentSegmentIndex}
                totalSegments={player.totalSegments}
                isMentorSpeaking={isMentorSpeaking}
                isStudentSpeaking={isStudentSpeaking}
                isPlaying={player.isPlaying}
              />

              <PodcastControlsDeck
                currentSegment={player.currentSegment}
                currentSegmentIndex={player.currentSegmentIndex}
                totalSegments={player.totalSegments}
                isMentorSpeaking={isMentorSpeaking}
                isPlaying={player.isPlaying}
                isSegmentLoading={player.isSegmentLoading}
                progressPercent={player.progressPercent}
                playbackSpeed={player.playbackSpeed}
                isMuted={player.isMuted}
                onCycleSpeed={player.cycleSpeed}
                onRewind10={player.handleRewind10}
                onPrevSegment={player.handlePrevSegment}
                onTogglePlay={player.handleTogglePlay}
                onNextSegment={player.handleNextSegment}
                onForward10={player.handleForward10}
                onToggleMute={player.handleToggleMute}
              />

              <PodcastOfflineHub
                isDownloadingAudio={player.isDownloadingAudio}
                downloadProgress={player.downloadProgress}
                downloadStatusNote={player.downloadStatusNote}
                isSavedOffline={player.isSavedOffline}
                onDownloadAudioWav={player.handleDownloadAudioWav}
                onSaveOffline={player.handleSaveOffline}
                onDeleteOffline={player.handleDeleteOffline}
              />
            </div>
          )}

          {player.activeTab === "transcript" && (
            <PodcastTranscriptTab
              podcast={podcast}
              currentSegmentIndex={player.currentSegmentIndex}
              isPlaying={player.isPlaying}
              transcriptScrollRef={player.transcriptScrollRef}
              onSelectSegment={player.handleSelectSegment}
              onCopyTranscript={player.handleCopyTranscript}
            />
          )}

          {player.activeTab === "takeaways" && (
            <PodcastTakeawaysTab
              podcast={podcast}
              onDownloadTakeaways={player.handleDownloadTakeawaysAndTranscript}
            />
          )}
        </div>

        {/* BOTTOM QUICK FOOTER */}
        <div
          id="podcast-modal-bottom-bar"
          className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500"
        >
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#796AEF]" />
            <span>Cherry AI NotebookLM Studio</span>
          </div>
          <span className="font-mono font-medium">
            ~{Math.round(podcast.durationEstimateSec / 60)} min episode
          </span>
        </div>
      </motion.div>
    </div>
  );
}
