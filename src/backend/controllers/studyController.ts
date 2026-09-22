import { Request, Response } from "express";
import { sendApiError } from "../config/gemini";
import { generateDynamicQuiz } from "../services/quizService";
import { extractBattleSyllabus } from "../services/battleRoomService";
import { handleCounselorChat } from "../services/counselorService";
import {
  generateMnemonic,
  generateHomeworkSolution,
} from "../services/studyToolsService";

/**
 * Controller for generating dynamic classroom quizzes based on blackboard notes or syllabus.
 */
export async function generateQuizHandler(req: Request, res: Response) {
  try {
    const result = await generateDynamicQuiz(req.body);
    return res.json({
      success: true,
      questions: result.questions,
      source: result.source,
      documentName: result.documentName,
    });
  } catch (err: any) {
    console.error("[Study Controller] Error in generateQuizHandler:", err);
    return sendApiError(res, "Failed to generate dynamic quiz", err);
  }
}

/**
 * Controller for extracting syllabus and generating questions for the multiplayer battle arena.
 */
export async function extractBattleSyllabusHandler(req: Request, res: Response) {
  try {
    const result = await extractBattleSyllabus(req.body);
    return res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error("[Study Controller] Error in extractBattleSyllabusHandler:", err);
    return sendApiError(res, "Failed to extract syllabus and generate battle questions", err);
  }
}

/**
 * Controller for Kiara AI empathetic student counselor chat with real-time sentiment analysis.
 */
export async function counselorChatHandler(req: Request, res: Response) {
  try {
    const { userMessage } = req.body;
    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ error: "userMessage is required" });
    }

    const { reply, sentiment } = await handleCounselorChat(req.body);
    return res.json({ success: true, reply, sentiment });
  } catch (err: any) {
    console.error("[Study Controller] Error in counselorChatHandler:", err);
    return sendApiError(res, "Counselor service error", err);
  }
}

/**
 * Controller for Kiara AI Instant Mnemonic Studio.
 */
export async function generateMnemonicHandler(req: Request, res: Response) {
  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const result = await generateMnemonic(req.body);
    return res.json({ success: true, ...result });
  } catch (err: any) {
    console.error("[Study Controller] Error in generateMnemonicHandler:", err);
    return sendApiError(res, "Failed to generate mnemonic", err);
  }
}

/**
 * Controller for Maestry AI Homework Maker.
 */
export async function homeworkMakerHandler(req: Request, res: Response) {
  try {
    const { userMessage, imageBase64 } = req.body;
    if (!userMessage && !imageBase64) {
      return res.status(400).json({ error: "userMessage or imageBase64 is required" });
    }

    const reply = await generateHomeworkSolution(req.body);
    return res.json({ success: true, reply });
  } catch (err: any) {
    console.error("[Study Controller] Error in homeworkMakerHandler:", err);
    return sendApiError(res, "Homework Maker service error", err);
  }
}
