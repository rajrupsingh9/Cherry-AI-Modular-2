import { Router } from "express";
import {
  generateQuizHandler,
  extractBattleSyllabusHandler,
  counselorChatHandler,
  generateMnemonicHandler,
  homeworkMakerHandler,
} from "../controllers/studyController";

const router = Router();

// Socratic & Adaptive Classroom Quiz Generator
router.post("/api/generate-quiz", generateQuizHandler);

// AI Syllabus Parser & Question Generator for Multiplayer Battle Arena
router.post("/api/battle-room/extract-syllabus", extractBattleSyllabusHandler);

// Kiara AI Student Mindset & Sentiment Counselor Chat
router.post("/api/counselor-chat", counselorChatHandler);

// Kiara AI Instant Mnemonic Studio
router.post("/api/generate-mnemonic", generateMnemonicHandler);

// Maestry AI Homework Maker & School Copy Assistant
router.post("/api/homework-maker", homeworkMakerHandler);

export default router;
