import { Request, Response } from "express";
import { sendApiError } from "../config/gemini";
import { handleProblemGuideRequest } from "../services/problemGuideService";
import { parseYouTubeLecture } from "../services/youtubeTranscriptService";
import { generateRevisionDeck } from "../services/revisionDeckService";
import { generateConceptInfographic } from "../services/infographicService";
import { generateSimulationSpec } from "../services/simulationService";

/**
 * Controller for Socratic Problem Guide step-by-step guidance.
 */
export async function problemGuideHandler(req: Request, res: Response) {
  try {
    const { userMessage, imageBase64 } = req.body;
    if (!userMessage && !imageBase64) {
      return res.status(400).json({ error: "userMessage or imageBase64 is required" });
    }

    const reply = await handleProblemGuideRequest(req.body);
    return res.json({ success: true, reply });
  } catch (err: any) {
    console.error("[Guide Controller] Error in problemGuideHandler:", err);
    return sendApiError(res, "Problem Guide service error", err);
  }
}

/**
 * Controller for parsing YouTube educational lectures and building synchronized chalkboard notes.
 */
export async function parseYouTubeHandler(req: Request, res: Response) {
  const { youtubeUrl } = req.body;
  if (!youtubeUrl) {
    return res.status(400).json({ error: "Missing youtubeUrl in body." });
  }

  try {
    const result = await parseYouTubeLecture(req.body);
    return res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error("[Guide Controller] Error in parseYouTubeHandler:", err);
    return sendApiError(res, "Failed to generate study syllabus", err);
  }
}

/**
 * Controller for generating smart revision flashcards and categorical mind maps.
 */
export async function generateRevisionDeckHandler(req: Request, res: Response) {
  try {
    const data = await generateRevisionDeck(req.body);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error("[Guide Controller] Error in generateRevisionDeckHandler:", err);
    return sendApiError(res, "Failed to generate revision deck", err);
  }
}

/**
 * Controller for 1-Page Concept Visual Infographic Cheat Sheets.
 */
export async function generateConceptInfographicHandler(req: Request, res: Response) {
  try {
    const data = await generateConceptInfographic(req.body);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error("[Guide Controller] Error in generateConceptInfographicHandler:", err);
    return sendApiError(res, "Failed to generate concept infographic", err);
  }
}

/**
 * Controller for STEM Interactive Physics & Chemistry Virtual Lab Simulations.
 */
export async function generateSimulationHandler(req: Request, res: Response) {
  try {
    const {
      topic = "Double Slit Interference",
      grade = "Class 12",
      subject = "physics",
    } = req.body;

    const result = await generateSimulationSpec(topic, grade, subject);
    return res.json({ success: true, ...result });
  } catch (err: any) {
    console.error("[Guide Controller] Error in generateSimulationHandler:", err);
    return sendApiError(res, "Failed to generate AI simulation", err);
  }
}
