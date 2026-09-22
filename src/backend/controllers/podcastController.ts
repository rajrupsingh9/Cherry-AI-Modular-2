import { Request, Response } from "express";
import { resolveApiKey, sendApiError } from "../config/gemini";
import { generatePodcastScript } from "../services/podcastGenerationService";
import {
  synthesizeSpeechSegment,
  stitchFullPodcastAudio,
} from "../services/speechStitcherService";

/**
 * Controller for generating a 2-host Socratic audio overview podcast script.
 */
export async function generatePodcastHandler(req: Request, res: Response) {
  try {
    const {
      topic = "Newton's Laws of Motion",
      subject = "Physics",
      grade = "Class 11",
      language = "Hinglish",
      notesOrDocumentText = "",
      episodeType = "rapid_viva",
      targetDurationMins,
      hostPair = "cherry_riya",
    } = req.body;

    const apiKey = resolveApiKey(req);
    const result = await generatePodcastScript({
      topic,
      subject,
      grade,
      language,
      notesOrDocumentText,
      episodeType,
      targetDurationMins,
      hostPair,
      apiKey,
    });

    return res.json({
      success: true,
      data: result.data,
      isProcedural: result.isProcedural,
      isFallback: result.isFallback,
      note: result.note,
    });
  } catch (err: any) {
    console.error("[Podcast Controller] Critical error in generatePodcastHandler:", err);
    return sendApiError(res, "Failed to generate audio podcast overview", err);
  }
}

/**
 * Controller for synthesizing speech for an individual dialogue turn.
 */
export async function synthesizeSpeechHandler(req: Request, res: Response) {
  const {
    text = "",
    speaker = "mentor",
    voiceName,
    language = "Hinglish",
  } = req.body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ success: false, error: "Text is required for speech synthesis" });
  }

  const apiKey = resolveApiKey(req);
  try {
    const result = await synthesizeSpeechSegment(text, speaker, voiceName, language, apiKey);
    return res.json(result);
  } catch (err: any) {
    return res.json({
      success: false,
      fallback: true,
      error: err?.message || "Speech synthesis unavailable",
    });
  }
}

/**
 * Controller for batch full-podcast audio stitching & downloading.
 */
export async function synthesizeFullPodcastHandler(req: Request, res: Response) {
  const {
    segments = [],
    hosts = {},
    language = "Hinglish",
    topic = "Audio_Podcast",
  } = req.body;

  if (!Array.isArray(segments) || segments.length === 0) {
    return res.status(400).json({ success: false, error: "Segments array is required" });
  }

  const apiKey = resolveApiKey(req);

  try {
    const { finalWavBuffer, durationSec } = await stitchFullPodcastAudio(
      segments,
      hosts,
      language,
      apiKey
    );

    const safeTopic = topic.replace(/[^a-zA-Z0-9_\-\u0900-\u097F]/g, "_");
    const filename = `${safeTopic}_CherryAI_Podcast.wav`;

    if (req.query.download === "true") {
      res.setHeader("Content-Type", "audio/wav");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Length", finalWavBuffer.length);
      return res.send(finalWavBuffer);
    }

    return res.json({
      success: true,
      audioBase64: finalWavBuffer.toString("base64"),
      mimeType: "audio/wav",
      durationSec,
      filename,
    });
  } catch (err: any) {
    console.error("[Podcast Controller] Error in synthesizeFullPodcastHandler:", err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to synthesize full podcast",
    });
  }
}
