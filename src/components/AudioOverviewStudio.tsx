/**
 * AudioOverviewStudio.tsx
 * Thin Orchestrator for the NotebookLM-style 2-Host Audio Overview Studio
 */
import React from "react";
import { Headphones, Sparkles, ArrowRight, Loader2, X } from "lucide-react";
import { AudioOverviewStudioProps } from "./podcast/studio/studioTypes";
import { useAudioOverviewStudio } from "./podcast/studio/useAudioOverviewStudio";
import { StudioSourceStep } from "./podcast/studio/StudioSourceStep";
import { StudioTopicCard } from "./podcast/studio/StudioTopicCard";
import { StudioCustomizeStep } from "./podcast/studio/StudioCustomizeStep";
import { StudioLibrarySection } from "./podcast/studio/StudioLibrarySection";

export function AudioOverviewStudio({
  studentDetails,
  activeDocument,
  addToast,
  onOpenPodcast,
  onClose,
  isFullScreen = false,
}: AudioOverviewStudioProps) {
  const studio = useAudioOverviewStudio({
    studentDetails,
    activeDocument,
    addToast,
    onOpenPodcast,
  });

  return (
    <div
      id="audio-overview-studio-card"
      className={`bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xs text-left space-y-4 ${
        isFullScreen ? "p-4 sm:p-6 shadow-sm" : "p-4 sm:p-5"
      }`}
    >
      {/* Studio Header (NotebookLM Style - shown when not in full-screen wrapper) */}
      {!isFullScreen && (
        <div
          id="audio-overview-studio-header"
          className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#796AEF]">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-sans font-bold uppercase text-slate-800 tracking-wider">
                  Audio Overview Studio
                </h3>
                <span className="text-[9px] bg-indigo-50 text-[#796AEF] font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                  NotebookLM Style
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal">
                2-Host Dual-Voice Deep Dive Podcast (
                {studio.hostPair === "cherry_riya"
                  ? "Cherry Ma'am & Riya"
                  : "Aarav Sir & Riya"}
                )
              </p>
            </div>
          </div>

          {onClose && (
            <button
              id="close-audio-overview-studio-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              title="Close Audio Overview"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* STEP 1: ADD SOURCE */}
      <StudioSourceStep
        sourceType={studio.sourceType}
        setSourceType={studio.setSourceType}
        sourceFile={studio.sourceFile}
        setSourceFile={studio.setSourceFile}
        setTopicName={studio.setTopicName}
        pastedText={studio.pastedText}
        setPastedText={studio.setPastedText}
        fileInputRef={studio.fileInputRef}
        onFileSelect={studio.handleFileSelect}
        onPastedTextChange={studio.handlePastedTextChange}
      />

      {/* AUTO-GENERATED TOPIC / TITLE DISPLAY */}
      <StudioTopicCard
        sourceFile={studio.sourceFile}
        topicName={studio.topicName}
        setTopicName={studio.setTopicName}
      />

      {/* STEP 2: CUSTOMIZE AUDIO CONVERSATION */}
      <StudioCustomizeStep
        episodeType={studio.episodeType}
        setEpisodeType={studio.setEpisodeType}
        setTargetDurationMins={studio.setTargetDurationMins}
        hostPair={studio.hostPair}
        setHostPair={studio.setHostPair}
        resolvedLanguage={studio.resolvedLanguage}
        onSelectCherry={() => {
          studio.setHostPair("cherry_riya");
          addToast("Selected: Cherry Ma'am & Riya (Real Human Voice) 👩‍🏫", "info");
        }}
        onSelectAarav={() => {
          studio.setHostPair("aarav_riya");
          addToast("Selected: Aarav Sir & Riya (Mentor Voice) 👨‍🏫", "info");
        }}
      />

      {/* ACTION: GENERATE AUDIO OVERVIEW */}
      <div id="studio-generate-action" className="space-y-2 pt-1">
        <button
          type="button"
          onClick={studio.handleGeneratePodcast}
          disabled={studio.isGenerating || (studio.sourceFile?.isExtracting ?? false)}
          id="generate-audio-overview-btn"
          className="w-full py-3.5 px-4 rounded-xl bg-[#796AEF] hover:bg-[#6858e0] active:scale-[0.99] text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {studio.isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{studio.generationStep || "Generating Audio Overview..."}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Audio Overview (ऑडियो ओवरव्यू बनाएं)</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </>
          )}
        </button>

        {studio.isGenerating && (
          <p className="text-center text-[10px] text-indigo-600 font-medium animate-pulse">
            Using Google AI Studio Neural Speech Engine • 2-Host Synchronized Socratic Script
          </p>
        )}
      </div>

      {/* RECENT EPISODES & OFFLINE IN-APP LIBRARY */}
      <StudioLibrarySection
        savedEpisodes={studio.savedEpisodes}
        offlineEpisodes={studio.offlineEpisodes}
        activeLibraryTab={studio.activeLibraryTab}
        setActiveLibraryTab={studio.setActiveLibraryTab}
        onOpenPodcast={onOpenPodcast}
        onDownloadWav={studio.handleDownloadOfflineRecordWav}
        onDeleteOffline={studio.handleDeleteOfflineRecord}
      />
    </div>
  );
}

export type { AudioOverviewStudioProps };
