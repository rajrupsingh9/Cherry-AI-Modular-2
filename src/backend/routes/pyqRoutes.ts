import { Router } from "express";
import { generateContentWithRetry, sendApiError } from "../config/gemini";
import { getOrCreateSession } from "../state/sessionStore";
import { 
  buildPYQ8020AnalysisPrompt, 
  getCurated8020Report,
  buildPYQWeightageHeatmapPrompt,
  getCuratedWeightageHeatmapReport,
  buildAIPredictedPaperPrompt,
  getCuratedPredictedPaperReport
} from "../../utils/pyqAnalysisEngine";

const router = Router();

// =========================================================================
// 🎯 10-Year Board Exam PYQ 80/20 Frequency & Pareto Analysis API (Phase 1)
// =========================================================================
router.post("/api/pyq-analyze-8020", async (req, res) => {
  try {
    const { 
      subject = "Mathematics", 
      grade = "Class 10th", 
      board = "CBSE", 
      pyqDocumentText = "", 
      chapters = [],
      sessionId
    } = req.body;

    console.log(`[REST Server] Received 10-Year PYQ 80/20 Analysis request for ${grade} ${subject} (${board})`);

    // Check if session has active document if pyqDocumentText wasn't passed directly
    let docContext = pyqDocumentText;
    if (!docContext && sessionId) {
      const sess = getOrCreateSession(sessionId);
      if (sess?.activeDocument?.markdown) {
        docContext = sess.activeDocument.markdown;
      }
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    if (!apiKey) {
      console.warn("[REST Server] GEMINI_API_KEY not found, using curated fallback 80/20 report");
      const fallbackReport = getCurated8020Report(subject, grade, board);
      return res.json({ success: true, data: fallbackReport, isFallback: true });
    }

    try {
      const prompt = buildPYQ8020AnalysisPrompt({
        subject,
        grade,
        board,
        pyqDocumentText: docContext,
        chapters
      });

      const response = await generateContentWithRetry({
        model: "gemini-3.8-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      });

      const rawText = response.text ? response.text.trim() : "";
      const cleanedJson = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsedData = JSON.parse(cleanedJson);

      // Verify essential properties exist
      if (!parsedData.guaranteedTopics || !Array.isArray(parsedData.guaranteedTopics) || parsedData.guaranteedTopics.length === 0) {
        throw new Error("AI output missing guaranteedTopics array");
      }

      console.log(`[REST Server] Successfully generated AI 10-Year PYQ 80/20 Report with ${parsedData.guaranteedTopics.length} guaranteed topics`);
      return res.json({ success: true, data: parsedData });
    } catch (aiErr: any) {
      console.warn("[REST Server] Gemini 80/20 generation failed or returned invalid JSON. Using curated domain report:", aiErr?.message);
      const curatedReport = getCurated8020Report(subject, grade, board);
      return res.json({ success: true, data: curatedReport, isFallback: true });
    }
  } catch (err: any) {
    console.error("[REST Server] Critical error in /api/pyq-analyze-8020:", err);
    sendApiError(res, "Failed to analyze 10-Year PYQ", err);
  }
});

// =========================================================================
// 🗺️ 10-Year Marking Weightage Heatmap & Section Distribution API (Phase 2)
// =========================================================================
router.post("/api/pyq-marking-heatmap", async (req, res) => {
  try {
    const { 
      subject = "Mathematics", 
      grade = "Class 10th", 
      board = "CBSE", 
      pyqDocumentText = "", 
      chapters = [],
      sessionId
    } = req.body;

    console.log(`[REST Server] Received Marking Weightage Heatmap request for ${grade} ${subject} (${board})`);

    let docContext = pyqDocumentText;
    if (!docContext && sessionId) {
      const sess = getOrCreateSession(sessionId);
      if (sess?.activeDocument?.markdown) {
        docContext = sess.activeDocument.markdown;
      }
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    if (!apiKey) {
      console.warn("[REST Server] GEMINI_API_KEY not found, using curated fallback Heatmap report");
      const fallbackReport = getCuratedWeightageHeatmapReport(subject, grade, board);
      return res.json({ success: true, data: fallbackReport, isFallback: true });
    }

    try {
      const prompt = buildPYQWeightageHeatmapPrompt({
        subject,
        grade,
        board,
        pyqDocumentText: docContext,
        chapters
      });

      const response = await generateContentWithRetry({
        model: "gemini-3.8-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      });

      const rawText = response.text ? response.text.trim() : "";
      const cleanedJson = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsedData = JSON.parse(cleanedJson);

      // Verify essential properties exist
      if (!parsedData.chapterBreakdowns || !Array.isArray(parsedData.chapterBreakdowns) || parsedData.chapterBreakdowns.length === 0) {
        throw new Error("AI output missing chapterBreakdowns array");
      }

      console.log(`[REST Server] Successfully generated AI Weightage Heatmap with ${parsedData.chapterBreakdowns.length} chapters`);
      return res.json({ success: true, data: parsedData });
    } catch (aiErr: any) {
      console.warn("[REST Server] Gemini Heatmap generation failed or returned invalid JSON. Using curated domain report:", aiErr?.message);
      const curatedReport = getCuratedWeightageHeatmapReport(subject, grade, board);
      return res.json({ success: true, data: curatedReport, isFallback: true });
    }
  } catch (err: any) {
    console.error("[REST Server] Critical error in /api/pyq-marking-heatmap:", err);
    sendApiError(res, "Failed to generate Weightage Heatmap", err);
  }
});

// =========================================================================
// 🎲 2026 Board Examination AI Predicted Paper & Marking Scheme API (Phase 3)
// =========================================================================
router.post("/api/pyq-predicted-paper", async (req, res) => {
  try {
    const { 
      subject = "Mathematics", 
      grade = "Class 10th", 
      board = "CBSE", 
      pyqDocumentText = "", 
      chapters = [],
      sessionId
    } = req.body;

    console.log(`[REST Server] Received AI Predicted Exam Paper 2026 request for ${grade} ${subject} (${board})`);

    let docContext = pyqDocumentText;
    if (!docContext && sessionId) {
      const sess = getOrCreateSession(sessionId);
      if (sess?.activeDocument?.markdown) {
        docContext = sess.activeDocument.markdown;
      }
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    if (!apiKey) {
      console.warn("[REST Server] GEMINI_API_KEY not found, using curated fallback Predicted Paper");
      const fallbackPaper = getCuratedPredictedPaperReport(subject, grade, board);
      return res.json({ success: true, data: fallbackPaper, isFallback: true });
    }

    try {
      const prompt = buildAIPredictedPaperPrompt({
        subject,
        grade,
        board,
        pyqDocumentText: docContext,
        chapters
      });

      const response = await generateContentWithRetry({
        model: "gemini-3.8-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          temperature: 0.25,
          responseMimeType: "application/json"
        }
      });

      const rawText = response.text ? response.text.trim() : "";
      const cleanedJson = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsedData = JSON.parse(cleanedJson);

      // Verify essential properties exist
      if (!parsedData.questions || !Array.isArray(parsedData.questions) || parsedData.questions.length === 0) {
        throw new Error("AI output missing questions array");
      }

      console.log(`[REST Server] Successfully synthesized AI Predicted Paper 2026 with ${parsedData.questions.length} questions`);
      return res.json({ success: true, data: parsedData });
    } catch (aiErr: any) {
      console.warn("[REST Server] Gemini Predicted Paper generation failed or returned invalid JSON. Using curated report:", aiErr?.message);
      const curatedPaper = getCuratedPredictedPaperReport(subject, grade, board);
      return res.json({ success: true, data: curatedPaper, isFallback: true });
    }
  } catch (err: any) {
    console.error("[REST Server] Critical error in /api/pyq-predicted-paper:", err);
    sendApiError(res, "Failed to generate Predicted Exam Paper", err);
  }
});

export default router;
