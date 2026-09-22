import { Router } from "express";
import {
  uploadDocumentHandler,
  getActiveDocumentHandler,
  setActiveDocumentHandler,
  clearDocumentHandler,
} from "../controllers/documentController";

const router = Router();

// Multi-modal Vision syllabus & document upload extraction endpoint
router.post("/api/upload-document", uploadDocumentHandler);

// Retrieve active document context for live classroom/voice session
router.get("/api/active-document", getActiveDocumentHandler);

// Update or set active document directly (e.g. for Direct Study)
router.post("/api/active-document", setActiveDocumentHandler);

// Clear active document syllabus
router.post("/api/clear-document", clearDocumentHandler);

export default router;
