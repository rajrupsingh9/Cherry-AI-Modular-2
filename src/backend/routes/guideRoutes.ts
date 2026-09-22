import { Router } from "express";
import {
  problemGuideHandler,
  parseYouTubeHandler,
  generateRevisionDeckHandler,
  generateConceptInfographicHandler,
  generateSimulationHandler,
} from "../controllers/guideController";

const router = Router();

// Socratic Problem Guide Chat Endpoint
router.post("/api/problem-guide", problemGuideHandler);

// YouTube Video Lecture Syllabus & Blackboard Notes Parser
router.post("/api/parse-youtube", parseYouTubeHandler);

// Smart Revision Deck (Flashcards & Mind Map) Generator
router.post("/api/generate-revision-deck", generateRevisionDeckHandler);

// 1-Page Concept Visual Infographic Poster / Cheat Sheet
router.post("/api/generate-concept-infographic", generateConceptInfographicHandler);

// STEM Virtual Lab Interactive Simulation Generator
router.post("/api/generate-simulation", generateSimulationHandler);

export default router;
