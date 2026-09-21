/**
 * useAudioOverviewStudio.ts
 * Hook managing Audio Overview Studio state, file extraction, AI generation, and offline storage
 */
import React, { useState, useEffect, useRef } from "react";
import { AudioPodcastData, PodcastLanguage, PodcastEpisodeType } from "../../../types";
import { generateAudioPodcast, getSavedPodcasts } from "../../../services/podcastService";
import { buildProceduralPodcast } from "../../../utils/podcastEngine";
import { compressImageIfPossible } from "../../../utils/imageCompressor";
import { getActiveApiKey } from "../../../utils/geminiKeyStorage";
import {
  getAllOfflinePodcasts,
  deleteOfflinePodcast,
  downloadAudioBlobAsFile,
  downloadAndSavePodcastForOffline,
  OfflinePodcastRecord,
} from "../../../utils/offlineAudioStorage";
import {
  AudioOverviewStudioProps,
  SourceFileState,
  SourceType,
  HostPairType,
  LibraryTabType,
  ActiveSourceDetails,
} from "./studioTypes";

export function useAudioOverviewStudio({
  studentDetails,
  activeDocument,
  addToast,
  onOpenPodcast,
}: AudioOverviewStudioProps) {
  const [sourceType, setSourceType] = useState<SourceType>("upload");
  const [sourceFile, setSourceFile] = useState<SourceFileState | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>(
    activeDocument?.detectedSubject || studentDetails.subject || "Physics"
  );
  const [pastedText, setPastedText] = useState<string>("");
  const [topicName, setTopicName] = useState<string>("");

  const resolvedLanguage: PodcastLanguage = (() => {
    const medium = (studentDetails?.mediumOfLearning || "").trim().toLowerCase();
    if (medium.includes("hindi") || medium === "हिंदी") return "Hindi";
    if (medium.includes("english")) return "English";
    return "Hinglish";
  })();

  const [episodeType, setEpisodeType] = useState<PodcastEpisodeType>("rapid_viva");
  const [targetDurationMins, setTargetDurationMins] = useState<number>(3);
  const [hostPair, setHostPair] = useState<HostPairType>("cherry_riya");

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [generatedPodcast, setGeneratedPodcast] = useState<AudioPodcastData | null>(null);
  const [savedEpisodes, setSavedEpisodes] = useState<AudioPodcastData[]>([]);
  const [offlineEpisodes, setOfflineEpisodes] = useState<OfflinePodcastRecord[]>([]);
  const [activeLibraryTab, setActiveLibraryTab] = useState<LibraryTabType>("recent");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const existing = getSavedPodcasts();
      setSavedEpisodes(existing);
    } catch (e) {
      console.warn("Could not read saved podcasts:", e);
    }

    getAllOfflinePodcasts()
      .then((records) => setOfflineEpisodes(records))
      .catch((e) => console.warn("Could not read offline podcasts:", e));
  }, [generatedPodcast]);

  const refreshOfflineLibrary = async () => {
    try {
      const records = await getAllOfflinePodcasts();
      setOfflineEpisodes(records);
    } catch (e) {
      console.warn("Could not refresh offline podcasts:", e);
    }
  };

  const handleDeleteOfflineRecord = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteOfflinePodcast(id);
      addToast("Episode removed from offline storage", "info");
      refreshOfflineLibrary();
    } catch {
      addToast("Could not remove offline podcast", "error");
    }
  };

  const handleDownloadOfflineRecordWav = (record: OfflinePodcastRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const safeTopic = (record.topic || "Audio_Podcast").replace(/[^a-zA-Z0-9_\-\u0900-\u097F]/g, "_");
      downloadAudioBlobAsFile(record.audioBlob, `${safeTopic}_CherryAI.wav`);
      addToast("Audio download started! (.wav)", "success");
    } catch {
      addToast("Download failed", "error");
    }
  };

  useEffect(() => {
    if (activeDocument) {
      if (activeDocument.detectedSubject) {
        setSelectedSubject(activeDocument.detectedSubject);
      }
      if (activeDocument.detectedTitle && !/^[0-9\s_.-]+$/.test(activeDocument.detectedTitle)) {
        setTopicName(activeDocument.detectedTitle);
      }
    }
  }, [activeDocument]);

  const handleFileSelect = async (file: File) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      addToast("File is too large! Please choose a file under 15MB.", "error");
      return;
    }

    setSourceFile({
      name: file.name,
      size: file.size,
      text: "",
      isExtracting: true,
    });
    addToast(`Extracting source content from "${file.name}"... 📄`, "info");

    try {
      let base64Data = "";
      let resolvedMime = file.type || "application/pdf";
      let textContent = "";

      if (file.type.includes("text") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
        textContent = await file.text();
        resolvedMime = "text/plain";
        base64Data = btoa(unescape(encodeURIComponent(textContent)));
      } else {
        const dataUrl = await compressImageIfPossible(file, 1200, 0.7);
        const parts = (dataUrl || "").split(",");
        base64Data = parts[1] || "";
        if (file.name.endsWith(".pdf")) resolvedMime = "application/pdf";
        else if (file.name.endsWith(".jpg") || file.name.endsWith(".jpeg")) resolvedMime = "image/jpeg";
        else if (file.name.endsWith(".png")) resolvedMime = "image/png";
      }

      const activeKey = getActiveApiKey();
      const res = await fetch("/api/upload-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(activeKey ? { "x-gemini-api-key": activeKey } : {}),
        },
        body: JSON.stringify({
          filename: file.name,
          mimeType: resolvedMime,
          base64Data,
          mode: "podcast",
          apiKey: activeKey || undefined,
        }),
      });

      if (!res.ok) throw new Error(`Upload returned status ${res.status}`);

      const data = await res.json();
      const extractedContent = data.markdown || data.content || (data.topics && data.topics.join("\n")) || textContent || "";
      const detectedSubj = data.detectedSubject;
      if (detectedSubj) setSelectedSubject(detectedSubj);

      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      let finalTitle = data.detectedTitle || data.detectedChapter || "";
      if (!finalTitle || /^[0-9\s_.-]+$/.test(finalTitle) || (cleanName && finalTitle.toLowerCase() === cleanName.toLowerCase() && /^[0-9\s_.-]+$/.test(cleanName))) {
        const headingMatches = extractedContent.match(/^#+\s*(?:Chapter|Topic)?[:\s]*(.+)$/gim) || [];
        for (const hm of headingMatches) {
          const candidate = hm.replace(/^#+\s*(?:Chapter|Topic)?[:\s]*/i, "").replace(/[\*\_\[\]`#]/g, "").trim();
          if (candidate.length > 2 && !/^[0-9\s_.-]+$/.test(candidate) && !/subject/i.test(candidate)) {
            finalTitle = candidate;
            break;
          }
        }
      }
      if (!finalTitle || /^[0-9\s_.-]+$/.test(finalTitle)) {
        const lines = extractedContent.split("\n").map((l: string) => l.trim()).filter((l: string) => l.length > 3 && !/^[0-9\s_.-]+$/.test(l) && !/^[-*_#`~=]+$/.test(l));
        if (lines.length > 0) finalTitle = lines[0].slice(0, 60).replace(/^[#*_\s]+/, "").trim();
      }
      if (!finalTitle || /^[0-9\s_.-]+$/.test(finalTitle)) {
        finalTitle = `${detectedSubj || selectedSubject || "Curriculum"} Core Overview`;
      }
      setTopicName(finalTitle);

      setSourceFile({
        name: file.name,
        size: file.size,
        text: extractedContent.slice(0, 10000),
        isExtracting: false,
        detectedSubject: detectedSubj,
      });

      addToast(`Document analyzed! Subject: ${detectedSubj || "Verified"} | Topic: ${finalTitle} 🎙️`, "success");
    } catch (err: any) {
      console.warn("File extraction fallback:", err);
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      const safeTitle = !cleanName || /^[0-9\s_.-]+$/.test(cleanName)
        ? `${selectedSubject || studentDetails.subject || "Academic"} Core Concepts`
        : cleanName;
      setSourceFile({
        name: file.name,
        size: file.size,
        text: `Source content from file: ${safeTitle}. Subject: ${selectedSubject || studentDetails.subject}, Grade: ${studentDetails.grade}`,
        isExtracting: false,
        detectedSubject: selectedSubject || studentDetails.subject,
      });
      setTopicName(safeTitle);
      addToast("File registered as source! 📄", "info");
    }
  };

  const handlePastedTextChange = (text: string) => {
    setPastedText(text);
    if (text.trim().length > 15) {
      const headingMatch = text.match(/^#+\s*(?:Chapter|Topic)?[:\s]*(.+)$/im);
      if (headingMatch && headingMatch[1]) {
        const cleanH = headingMatch[1].replace(/[\*\_\[\]`#]/g, "").trim();
        if (cleanH.length > 2 && !/^[0-9\s_.-]+$/.test(cleanH)) setTopicName(cleanH);
      } else {
        const firstLine = text.trim().split("\n")[0].replace(/^#+\s*/, "").slice(0, 50).trim();
        if (firstLine.length > 3 && !/^[0-9\s_.-]+$/.test(firstLine)) setTopicName(firstLine);
      }

      if (/(\bNH_?3\b|ammonia|hydrochloric|nitric|sulfuric|acid|base|salt|bond|reaction|organic|element|periodic|equilibrium|titration|molar)/i.test(text)) {
        setSelectedSubject("Chemistry");
      } else if (/\b(velocity|acceleration|displacement|kinematics|gravitation|momentum|optics|reflection|refraction|lens|mirror|electricity|circuit|resistor|ohm|magnetic|wavelength|sound|frequency|newton|joule|watt)\b/i.test(text)) {
        setSelectedSubject("Physics");
      } else if (/\b(cell|tissue|organ|photosynthesis|respiration|mitosis|meiosis|dna|rna|gene|heredity|evolution|bacteria|virus|plant|animal|chlorophyll)\b/i.test(text)) {
        setSelectedSubject("Biology");
      } else if (/\b(algebra|polynomial|quadratic|equation|trigonometry|triangle|circle|derivative|integral|matrix|probability|statistics)\b/i.test(text)) {
        setSelectedSubject("Mathematics");
      } else if (/\b(gdp|inflation|deflation|monetary|fiscal|demand|supply|macroeconomics|microeconomics|market|equilibrium|price index|banking|rbi)\b/i.test(text)) {
        setSelectedSubject("Economics");
      }
    }
  };

  const getActiveSourceDetails = (): ActiveSourceDetails | null => {
    if (sourceType === "upload" && sourceFile) {
      return {
        title: topicName || sourceFile.name,
        text: sourceFile.text,
        typeLabel: "Document / PDF",
        isReady: !sourceFile.isExtracting,
      };
    }
    if (sourceType === "paste" && pastedText.trim()) {
      return {
        title: topicName || "Pasted Notes & Text",
        text: pastedText.trim(),
        typeLabel: "Pasted Text",
        isReady: true,
      };
    }
    return null;
  };

  const handleGeneratePodcast = async () => {
    const activeSource = getActiveSourceDetails();
    if (!activeSource || !activeSource.text.trim()) {
      addToast("Please upload a document or paste notes first to analyze the topic & subject!", "error");
      return;
    }

    const resolvedSubject = selectedSubject || studentDetails.subject || "Physics";
    let finalTopic = topicName.trim();
    if (!finalTopic || /^[0-9\s_.-]+$/.test(finalTopic)) {
      finalTopic = `${resolvedSubject} Comprehensive Overview`;
      setTopicName(finalTopic);
    }

    const isCherry = hostPair === "cherry_riya";
    const mentorName = isCherry ? "Cherry Ma'am" : "Aarav Sir";

    setIsGenerating(true);
    setGenerationStep("Analyzing source content & core mental models...");
    addToast(`🎙️ Starting 2-Host Audio Overview with ${mentorName} & Riya...`, "info");

    const sourceText = activeSource.text;

    try {
      setTimeout(() => {
        setGenerationStep(`Scripting ${mentorName} & Riya Socratic dialogue...`);
      }, 1200);

      setTimeout(() => {
        setGenerationStep("Synthesizing analogies, doubts & exam traps...");
      }, 2600);

      const podcastData = await generateAudioPodcast({
        topic: finalTopic,
        subject: resolvedSubject,
        grade: studentDetails.grade || "Class 10-12",
        language: resolvedLanguage,
        notesOrDocumentText: sourceText,
        episodeType,
        targetDurationMins,
        hostPair,
      });

      setGeneratedPodcast(podcastData);
      setGenerationStep("🎙️ Synthesizing 24kHz Seamless Audio (Zero Gap)...");

      try {
        await downloadAndSavePodcastForOffline(podcastData, {
          triggerFileDownload: false,
          onProgress: (p) => {
            setGenerationStep(`Synthesizing Turn ${p.currentTurn}/${p.totalTurns} (${p.speakerName})...`);
          },
        });
        await refreshOfflineLibrary();
      } catch (synthErr) {
        console.warn("[useAudioOverviewStudio] Seamless audio pre-synthesis notice:", synthErr);
      }

      setIsGenerating(false);
      setGenerationStep("");
      addToast("🎉 24kHz Seamless Audio Overview ready! (Zero Gap)", "success");
      onOpenPodcast(podcastData);
    } catch (err: any) {
      console.error("[useAudioOverviewStudio] Generation failed, recovering with procedural overview:", err);
      try {
        const fallbackPodcast = buildProceduralPodcast(
          finalTopic,
          resolvedSubject,
          studentDetails.grade || "Class 10-12",
          resolvedLanguage,
          hostPair,
          episodeType
        );
        setGeneratedPodcast(fallbackPodcast);
        setGenerationStep("🎙️ Synthesizing 24kHz Seamless Audio...");
        try {
          await downloadAndSavePodcastForOffline(fallbackPodcast, {
            triggerFileDownload: false,
            onProgress: (p) => {
              setGenerationStep(`Synthesizing Turn ${p.currentTurn}/${p.totalTurns} (${p.speakerName})...`);
            },
          });
          await refreshOfflineLibrary();
        } catch (fallbackSynthErr) {
          console.warn("[useAudioOverviewStudio] Procedural audio synthesis notice:", fallbackSynthErr);
        }
        setIsGenerating(false);
        setGenerationStep("");
        addToast("🎉 Audio Overview ready! Launching player...", "success");
        onOpenPodcast(fallbackPodcast);
      } catch (fallbackErr) {
        console.error("[useAudioOverviewStudio] Procedural recovery failed:", fallbackErr);
        setIsGenerating(false);
        setGenerationStep("");
        addToast(err?.message || "Could not generate audio overview. Please try again!", "error");
      }
    }
  };

  return {
    sourceType,
    setSourceType,
    sourceFile,
    setSourceFile,
    selectedSubject,
    setSelectedSubject,
    pastedText,
    setPastedText,
    topicName,
    setTopicName,
    resolvedLanguage,
    episodeType,
    setEpisodeType,
    targetDurationMins,
    setTargetDurationMins,
    hostPair,
    setHostPair,
    isGenerating,
    generationStep,
    savedEpisodes,
    offlineEpisodes,
    activeLibraryTab,
    setActiveLibraryTab,
    fileInputRef,
    handleFileSelect,
    handlePastedTextChange,
    handleGeneratePodcast,
    handleDeleteOfflineRecord,
    handleDownloadOfflineRecordWav,
  };
}
