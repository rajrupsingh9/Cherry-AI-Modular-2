import { Request, Response } from "express";
import { resolveApiKey, generateContentWithRetry, sendApiError } from "../config/gemini";
import {
  getOrCreateSession,
  normalizeSubjectName,
  classifyAcademicDiscipline,
  setGlobalActiveDocument,
  setGlobalActiveSessionBackup,
} from "../state/sessionStore";
import {
  buildDocumentAnalysisPrompt,
  buildDocumentFallbackMarkdown,
} from "../services/documentPromptService";

/**
 * Handles document upload, Gemini AI multimodal vision extraction, subject/chapter resolution, and session state persistence.
 */
export async function uploadDocumentHandler(req: Request, res: Response) {
  const { filename, mimeType, base64Data, mode, sessionId } = req.body;
  if (!base64Data || !mimeType || !filename) {
    return res.status(400).json({ error: "Missing filename, mimeType, or base64Data in body." });
  }

  try {
    console.log(`[REST Server] Processing uploaded file: ${filename} (${mimeType}), mode: ${mode || "explain"}, size: ~${Math.round(base64Data.length / 1024)} KB`);

    let isTextFile = false;
    let textContent = "";
    const lowerName = filename.toLowerCase();
    const lowerMime = mimeType.toLowerCase();

    if (
      lowerMime.startsWith("text/") ||
      lowerMime === "application/json" ||
      lowerMime === "application/javascript" ||
      lowerMime === "application/xml" ||
      lowerName.endsWith(".txt") ||
      lowerName.endsWith(".md") ||
      lowerName.endsWith(".markdown") ||
      lowerName.endsWith(".json") ||
      lowerName.endsWith(".csv") ||
      lowerName.endsWith(".html") ||
      lowerName.endsWith(".xml") ||
      lowerName.endsWith(".js") ||
      lowerName.endsWith(".ts") ||
      lowerName.endsWith(".tsx") ||
      lowerName.endsWith(".jsx")
    ) {
      isTextFile = true;
      try {
        textContent = Buffer.from(base64Data, "base64").toString("utf-8");
      } catch (errDec) {
        console.error("[REST Server] Failed to decode base64 text file content:", errDec);
        isTextFile = false;
      }
    }

    const payloadParts: any[] = [];
    if (isTextFile) {
      console.log(`[REST Server] Identified as text file. Sending parsed string buffer: ${textContent.length} characters.`);
      payloadParts.push({
        text: `The syllabus/document filename is: "${filename}". Here are the contents:\n\n${textContent}`
      });
    } else {
      payloadParts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      });
    }

    const isPodcastMode = mode === "podcast" || mode === "audio_overview" || mode === "audio";
    const isPYQMode = mode === "pyq";
    const isSocraticMode = mode === "socratic";
    const isMistakeMode = mode === "mistake";
    const isDoubtMode = mode === "doubt";
    const isCheatSheetMode = mode === "cheatsheet";

    const textPrompt = buildDocumentAnalysisPrompt(mode);
    const extractionPayloadParts = [
      ...payloadParts,
      { text: textPrompt }
    ];

    let markdown = "";
    try {
      console.log(`[REST Server] Actively extracting syllabus content for: "${filename}"`);

      const apiKey = resolveApiKey(req);
      const extractionResponse = await generateContentWithRetry({
        model: "gemini-3.1-flash-lite",
        contents: { parts: extractionPayloadParts },
      }, 3, 1000, apiKey);

      markdown = extractionResponse && extractionResponse.text ? extractionResponse.text : "";
    } catch (aiErr: any) {
      console.warn(`[REST Server] Notice during AI document extraction for "${filename}": ${aiErr?.message || aiErr}. Utilizing high-yield pedagogical fallback synthesis.`);
      const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/^[0-9a-fA-F_-]{10,}/, "").replace(/_/g, " ").trim() || "Academic Lecture Notes";
      markdown = buildDocumentFallbackMarkdown(mode, cleanName, isTextFile, textContent);
    }

    let detectedTitle = "";
    let detectedChapter = "";
    let detectedSubjectFromDoc = "";
    if (markdown) {
      const chapterMatch = markdown.match(/^#+\s*Chapter:\s*(.+)$/im) ||
                           markdown.match(/^#+\s*Topic:\s*(.+)$/im) ||
                           markdown.match(/^Chapter:\s*(.+)$/im) ||
                           markdown.match(/^Title:\s*(.+)$/im) ||
                           markdown.match(/^#+\s*(.+)$/m);
      if (chapterMatch && chapterMatch[1]) {
        const rawH = chapterMatch[1].replace(/[\*\_\[\]`#]/g, "").trim();
        if (rawH.length > 2 && !rawH.toLowerCase().startsWith("file_") && !rawH.toLowerCase().startsWith("slide_") && !/^[0-9\s_.-]+$/.test(rawH) && !rawH.toLowerCase().includes("topic header text")) {
          detectedTitle = rawH;
          detectedChapter = rawH;
        }
      }

      if (!detectedTitle || /^[0-9\s_.-]+$/.test(detectedTitle)) {
        const allHeadings = markdown.match(/^#+\s*(.+)$/gm) || [];
        for (const h of allHeadings) {
          const cleanH = h.replace(/^#+\s*/, "").replace(/[\*\_\[\]`#]/g, "").trim();
          const candidate = cleanH.replace(/^Chapter:\s*/i, "").replace(/^Topic:\s*/i, "").replace(/^Title:\s*/i, "").trim();
          if (
            candidate.length > 2 &&
            !/^Subject:/i.test(candidate) &&
            !/^[0-9\s_.-]+$/.test(candidate) &&
            !candidate.toLowerCase().startsWith("file_") &&
            !candidate.toLowerCase().startsWith("slide_") &&
            !candidate.toLowerCase().includes("topic header text")
          ) {
            detectedTitle = candidate;
            detectedChapter = candidate;
            break;
          }
        }
      }

      const subjectMatch = markdown.match(/^#+\s*Subject:\s*([A-Za-z\s]+)$/im) ||
                           markdown.match(/\[DOC_TYPE:[^\]]*\|\s*SUBJECT:\s*([A-Za-z\s]+)[^\]]*\]/i);
      if (subjectMatch && subjectMatch[1]) {
        const parsedSubj = normalizeSubjectName(subjectMatch[1].trim());
        if (parsedSubj && parsedSubj !== "All Science") {
          detectedSubjectFromDoc = parsedSubj;
        }
      }
    }

    let normalizedSubject = detectedSubjectFromDoc || await classifyAcademicDiscipline(markdown, filename);

    if (normalizedSubject === "All Science" || !normalizedSubject) {
      if (markdown.match(/(\bNH_?3\b|ammonia|haber process|hydrochloric acid|nitric acid|sulfuric acid|periodic table|chemical reaction|titration|covalent bond|ionic bond|molar mass|vapour density)/i)) {
        normalizedSubject = "Chemistry";
      }
    }

    const isPhysicsContent = /\b(physics|velocity|acceleration|displacement|kinematics|gravitation|gravity|momentum|inertia|optics|reflection|refraction|focal length|prism|lens|mirror|convex|concave|myopia|hypermetropia|electricity|electric current|potential difference|voltage|resistance|resistivity|ohm's law|ohms law|circuit|resistor|ammeter|voltmeter|magnetic field|electromagnet|solenoid|fleming|electric motor|generator|electromagnetic induction|ray diagram|speed of light|lens formula|mirror formula|joule|watt|newton|newton's law|newtons law|laws of motion|friction|mechanics|electrostatics|coulomb|kinetic energy|potential energy|thermodynamics|sound|echo|frequency|wavelength|amplitude|hertz|simple harmonic|pendulum|torque|rotational motion|viscosity|surface tension|bernoulli|photoelectric|semiconductor|logic gate|bhautik|bhautiki)\b/i.test(markdown) ||
      /\b(भौतिक|गति|वेग|त्वरण|विस्थापन|न्यूटन|जड़त्व|संवेग|गुरुत्वाकर्षण|कार्य|ऊर्जा|शक्ति|प्रकाश|परावर्तन|अपवर्तन|दर्पण|लेंस|प्रिज्म|विद्युत|धारा|विभवांतर|प्रतिरोध|ओम|परिपथ|चुंबक|चुंबकीय|ध्वनि|तरंग|बल|द्रव्यमान)\b/.test(markdown);

    if (isPhysicsContent && (normalizedSubject === "Mathematics" || normalizedSubject === "All Science")) {
      console.log(`[REST Server] Subject corrected from "${normalizedSubject}" to "Physics" due to physical laws and concepts.`);
      normalizedSubject = "Physics";
    }

    if (!detectedTitle || /^[0-9\s_.-]+$/.test(detectedTitle)) {
      const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/^[0-9a-fA-F_-]{10,}/, "").replace(/_/g, " ").trim();
      if (cleanName && cleanName.length > 2 && !/^(image|img|scan|doc|document|photo|file|\d+)$/i.test(cleanName) && !/^[0-9\s_.-]+$/.test(cleanName)) {
        detectedTitle = cleanName;
        detectedChapter = cleanName;
      } else {
        detectedTitle = `${normalizedSubject} Comprehensive Overview`;
        detectedChapter = detectedTitle;
      }
    }

    console.log(`[REST Server] Subject detected for "${filename}": "${normalizedSubject}", Title: "${detectedTitle}"`);

    // PYQ Question Paper Validation Guardrail
    let isQuestionPaper = true;
    let validationReason = "";
    let detectedDocType = isPYQMode ? "question_paper" : "study_material";

    if (isPYQMode && markdown) {
      const docTypeMatch = markdown.match(/\[DOC_TYPE:\s*([A-Z_]+)(?:\s*\|\s*REASON:\s*([^\]]+))?(?:\s*\|\s*SUBJECT:\s*([^\]]+))?\]/i);
      if (docTypeMatch) {
        const typeStr = docTypeMatch[1].toUpperCase();
        if (typeStr.includes("NON_QUESTION_PAPER") || typeStr.includes("IRRELEVANT") || typeStr.includes("NOTES")) {
          isQuestionPaper = false;
          detectedDocType = typeStr.toLowerCase();
          validationReason = docTypeMatch[2] ? docTypeMatch[2].trim() : "Document me questions, numerical problems ya exam sections nahi mile.";
        }
      } else {
        const hasQuestions = /(Q\d+|Question\s*\d+|Section\s+[A-E]|Marks|Find\s+the|Calculate|Prove\s+that|प्रश्न\s*\d+|अंक|खण्ड)/i.test(markdown);
        if (!hasQuestions && markdown.length > 50) {
          isQuestionPaper = false;
          detectedDocType = "notes_or_text";
          validationReason = "Is document me distinct questions ya exam marking patterns nahi mile.";
        }
      }
    }

    // Save to the active document state
    const sessionState = getOrCreateSession(sessionId);
    sessionState.activeDocument = {
      filename,
      mimeType,
      markdown,
      mode: isPodcastMode ? "podcast" : isSocraticMode ? "socratic" : isMistakeMode ? "mistake" : isDoubtMode ? "doubt" : isCheatSheetMode ? "cheatsheet" : isPYQMode ? "pyq" : "explain",
      detectedSubject: normalizedSubject,
    };

    sessionState.activeSessionBackup = {
      history: [],
      teachingPhase: "intro",
      whiteboardNotes: "",
      activeTopicIndex: 0,
    };

    if (!sessionId || sessionId === "default") {
      setGlobalActiveDocument(sessionState.activeDocument);
      setGlobalActiveSessionBackup(sessionState.activeSessionBackup);
    }

    console.log(`[REST Server] Document parsed successfully. Character length: ${markdown.length}, isQuestionPaper: ${isQuestionPaper}`);

    return res.json({
      success: true,
      filename,
      detectedTitle,
      detectedChapter: detectedChapter || detectedTitle,
      mimeType,
      markdown,
      mode: sessionState.activeDocument.mode,
      detectedSubject: normalizedSubject,
      isQuestionPaper,
      validationReason,
      detectedDocType,
    });
  } catch (err: any) {
    console.error("[REST Server] Error parsing document with Gemini:", err);
    return sendApiError(res, "Error occurred while processing the document", err);
  }
}

/**
 * Retrieves the currently active document for the requested session.
 */
export function getActiveDocumentHandler(req: Request, res: Response) {
  const sessionId = req.query.sessionId as string;
  const sessionState = getOrCreateSession(sessionId);
  return res.json({ activeDocument: sessionState.activeDocument });
}

/**
 * Explicitly sets or replaces the active document in session storage.
 */
export function setActiveDocumentHandler(req: Request, res: Response) {
  const { sessionId, activeDocument: clientDoc } = req.body;
  const sessionState = getOrCreateSession(sessionId);
  sessionState.activeDocument = clientDoc;

  if (!sessionId || sessionId === "default") {
    setGlobalActiveDocument(clientDoc);
  }
  return res.json({ success: true });
}

/**
 * Clears the active document and resets the teaching session backup.
 */
export function clearDocumentHandler(req: Request, res: Response) {
  const { sessionId } = req.body;
  const sessionState = getOrCreateSession(sessionId);
  sessionState.activeDocument = null;
  sessionState.activeSessionBackup = {
    history: [],
    teachingPhase: "intro",
    whiteboardNotes: "",
    activeTopicIndex: 0,
  };

  if (!sessionId || sessionId === "default") {
    setGlobalActiveDocument(null);
    setGlobalActiveSessionBackup({
      history: [],
      teachingPhase: "intro",
      whiteboardNotes: "",
      activeTopicIndex: 0,
    });
  }
  return res.json({ success: true });
}
