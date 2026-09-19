import { Router } from "express";
import { resolveApiKey, generateContentWithRetry } from "../config/gemini";

const router = Router();

// Endpoint to validate student-provided Gemini API Key
router.post("/api/validate-gemini-key", async (req, res) => {
  try {
    const candidateKey = resolveApiKey(req);
    if (!candidateKey || candidateKey.trim().length < 10) {
      return res.status(400).json({
        valid: false,
        error: "Kripya valid Gemini API Key provide karein."
      });
    }

    console.log(`[REST Server] Validating Gemini API Key: ${candidateKey.substring(0, 6)}...${candidateKey.substring(candidateKey.length - 4)}`);
    
    // Quick test generation using high-availability resilient model with retry/fallback
    const testResponse = await generateContentWithRetry({
      model: "gemini-3.8-flash",
      contents: {
        parts: [{ text: "Hello! Reply with 'OK'." }]
      }
    }, 3, 400, candidateKey);

    if (testResponse && testResponse.text) {
      return res.json({
        valid: true,
        message: "Gemini API Key bilkul sahi hai aur activate ho gaya hai! 🎉",
        model: "gemini-3.8-flash"
      });
    } else {
      return res.status(400).json({
        valid: false,
        error: "API key validation failed. Please check your key from Google AI Studio."
      });
    }
  } catch (err: any) {
    console.error("[REST Server] API Key validation error:", err?.message || err);
    const errMsg = err?.message || "";
    let userMsg = "Invalid API Key. Kripya check karein ki key Google AI Studio se sahi copy hua hai.";
    if (errMsg.includes("403") || errMsg.includes("401") || errMsg.includes("api_key_invalid") || errMsg.includes("API_KEY_INVALID")) {
      userMsg = "Google API Key invalid ya expired hai. Kripya naya key banakar paste karein.";
    } else if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED")) {
      userMsg = "API Key quota exhaust ho gaya hai. Thoda wait karein ya naya key use karein.";
    }
    return res.status(400).json({
      valid: false,
      error: userMsg,
      details: errMsg
    });
  }
});

// Health check endpoint
router.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

export default router;
