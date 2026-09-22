import { Router } from "express";
import {
  generatePodcastHandler,
  synthesizeSpeechHandler,
  synthesizeFullPodcastHandler,
} from "../controllers/podcastController";

const router = Router();

// 2-Host Educational Audio Overview Generator
router.post("/api/generate-podcast", generatePodcastHandler);

// Single-turn speech synthesis (Live Actor -> Gemini TTS -> Neural Audio)
router.post("/api/synthesize-speech", synthesizeSpeechHandler);

// Batch full-podcast audio stitcher & offline downloader (.wav)
router.post("/api/synthesize-full-podcast", synthesizeFullPodcastHandler);

export default router;
