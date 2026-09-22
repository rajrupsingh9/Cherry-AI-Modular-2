import { generateContentWithRetry } from "../config/gemini";
import { getOrCreateSession, normalizeSubjectName, classifyAcademicDiscipline } from "../state/sessionStore";
import {
  buildStage1DistillationPrompt,
  buildStage2SynthesisPrompt,
  universalInfographicResponseSchema,
  adaptUniversalToLegacy,
  generateUniversalFallback,
} from "../../utils/distillationEngine";

export interface InfographicParams {
  topicTitle?: string;
  topic?: string;
  subject?: string;
  grade?: string;
  chapter?: string;
  board?: string;
  topics?: string[];
  boardContent?: string;
  blackboardContent?: string;
  sessionTranscript?: string;
  sessionId?: string;
}

export async function generateConceptInfographic(params: InfographicParams) {
  const {
    topicTitle,
    topic,
    subject,
    grade,
    chapter,
    topics,
    boardContent,
    blackboardContent,
    sessionTranscript,
    sessionId
  } = params;

  const combinedBoard = boardContent || blackboardContent || "";

  let rawTopic = (topicTitle || topic || "").replace(/#/g, "").trim();
  const isRawFileId = /^[0-9\s_.-]+$/.test(rawTopic) ||
                      /^(FILE_|IMG_|DOC_|SLIDE_|SCAN_|DSC_|PHOTO_)?[0-9a-fA-F_-]{3,}/i.test(rawTopic) ||
                      rawTopic.toLowerCase().includes("file_00000000") ||
                      rawTopic.toLowerCase().includes("hand-handbook") ||
                      rawTopic.toLowerCase().includes("visual_cheat_sheet") ||
                      rawTopic.toLowerCase().includes("sample") ||
                      rawTopic.toLowerCase().includes(".png") ||
                      rawTopic.toLowerCase().includes(".pdf") ||
                      rawTopic.toLowerCase().includes(".jpg") ||
                      rawTopic.toLowerCase().includes(".jpeg");

  let cleanTopic = isRawFileId ? "" : rawTopic;

  const sessionState = getOrCreateSession(sessionId);
  const docSourceText = (sessionState?.activeDocument?.markdown || "").trim();
  const activeDocSubject = sessionState?.activeDocument?.detectedSubject || "";

  if (isRawFileId || !cleanTopic || cleanTopic.toLowerCase().includes("chapter") || cleanTopic.toLowerCase().includes("notes") || cleanTopic.toLowerCase().includes("document")) {
    if (Array.isArray(topics) && topics.length > 0) {
      const validTopic = topics.find((t: string) => t && !t.startsWith("FILE_") && !/^[0-9\s_.-]+$/.test(t) && t.trim().length > 2);
      if (validTopic) cleanTopic = validTopic.replace(/^[#\d\.\s-]+/, "").trim();
    }

    const textToSearchForTitle = combinedBoard || docSourceText;
    if (textToSearchForTitle) {
      const headerMatch = textToSearchForTitle.match(/^#+\s*Chapter:\s*(.+)$/im) ||
                          textToSearchForTitle.match(/^#+\s*Topic:\s*(.+)$/im) ||
                          textToSearchForTitle.match(/^#+\s*(.+)$/m) ||
                          textToSearchForTitle.match(/Chapter:\s*(.+)$/im) ||
                          textToSearchForTitle.match(/Topic:\s*(.+)$/im) ||
                          textToSearchForTitle.match(/Concept:\s*(.+)$/im);
      if (headerMatch && headerMatch[1]) {
        const rawH = headerMatch[1].replace(/[\*\_\[\]`#]/g, "").trim();
        if (rawH.length > 2 && !rawH.toLowerCase().startsWith("file_") && !rawH.toLowerCase().startsWith("slide_") && !/^[0-9\s_.-]+$/.test(rawH)) {
          cleanTopic = rawH;
        }
      }
    }
  }

  cleanTopic = cleanTopic
    .replace(/\.(png|jpg|jpeg|pdf|webp)$/i, "")
    .replace(/^FILE_[0-9A-F_]+/i, "")
    .replace(/_/g, " ")
    .replace(/^[#\d\.\s-]+/, "")
    .trim();

  let targetSubject = subject ? normalizeSubjectName(subject) : (activeDocSubject ? normalizeSubjectName(activeDocSubject) : "Science");

  const fullTextForInference = `${cleanTopic} ${(Array.isArray(topics) ? topics.join(" ") : "")} ${combinedBoard} ${sessionTranscript || ""} ${docSourceText.slice(0, 3000)}`.toLowerCase();

  if (fullTextForInference.match(/ammonia|haber|nh3|hydrochloric|nitric|sulfuric|acid|base|salt|bond|reaction|organic|element|periodic|chemical|equilibrium|solution|electrochem|compound|hybridization|carbon|metal|atom|redox|titration|precipitation|catalyst|oxidation|reduction|mole|molarity|alkali|alkaline|halogen|valency|isomerism|hydrocarbon|ester|aldehyde|ketone|polymer|le chatelier|enthalpy|exothermic|endothermic|covalent|ionic/)) {
    targetSubject = "Chemistry";
  } else if (targetSubject === "Science" || targetSubject === "All Science" || targetSubject === "General" || !subject) {
    if (combinedBoard && combinedBoard.length > 20) {
      targetSubject = await classifyAcademicDiscipline(combinedBoard, cleanTopic);
    } else if (docSourceText && docSourceText.length > 20) {
      targetSubject = await classifyAcademicDiscipline(docSourceText, cleanTopic);
    } else {
      targetSubject = await classifyAcademicDiscipline(cleanTopic, cleanTopic);
    }
  }

  if (!cleanTopic || /^[0-9\s_.-]+$/.test(cleanTopic)) {
    cleanTopic = targetSubject === "Chemistry" ? "Study of Compounds: Ammonia & Chemical Reactions" : "Core Academic Concepts";
  }

  const targetTopic = cleanTopic;
  const targetGrade = grade || "Class 10";
  let targetChapter = chapter || targetTopic;
  if (/^(FILE_|IMG_|DOC_)?[0-9a-fA-F_-]{10,}/i.test(targetChapter) || targetChapter.includes(".png") || targetChapter.includes(".pdf")) {
    targetChapter = targetTopic;
  }

  const subtopics: string[] = (Array.isArray(topics) && topics.length > 0)
    ? topics.map((t: string) => t.replace(/#/g, "").trim()).filter((t: string) => t && !t.startsWith("FILE_"))
    : [targetTopic];

  if (subtopics.length === 0) {
    subtopics.push(targetTopic);
  }

  let data: any = null;

  try {
    const compiledRawMaterial = [
      docSourceText ? `=== UPLOADED DOCUMENT / SYLLABUS SOURCE ===\n${docSourceText}` : "",
      combinedBoard ? `=== CHALKBOARD NOTES ===\n${combinedBoard}` : "",
      sessionTranscript ? `=== LECTURE TRANSCRIPT ===\n${sessionTranscript}` : "",
      subtopics.length > 0 ? `=== SUBTOPICS ===\n${subtopics.join(", ")}` : ""
    ].filter(Boolean).join("\n\n");

    const stage1Prompt = buildStage1DistillationPrompt({
      topic: targetTopic,
      subject: targetSubject,
      grade: targetGrade,
      chapter: targetChapter,
      rawText: compiledRawMaterial || `${targetTopic} foundational study notes for ${targetGrade} ${targetSubject}.`,
    });

    console.log(`[Infographic Service] Stage 1 Distillation starting for "${targetTopic}" (${targetSubject})...`);
    let distilledNotes = "";
    try {
      const stage1Response = await generateContentWithRetry({
        model: "gemini-3.8-flash",
        contents: { parts: [{ text: stage1Prompt }] },
      });
      distilledNotes = stage1Response && stage1Response.text ? stage1Response.text.trim() : "";
    } catch (stage1Err: any) {
      console.warn("[Infographic Service] Stage 1 fast filter bypassed:", stage1Err?.message);
      distilledNotes = combinedBoard || sessionTranscript || `${targetTopic} core concepts in ${targetSubject}`;
    }

    if (!distilledNotes || distilledNotes.length < 20) {
      distilledNotes = combinedBoard || sessionTranscript || `${targetTopic} foundational study notes for ${targetGrade} ${targetSubject}.`;
    }

    const stage2Prompt = buildStage2SynthesisPrompt({
      topic: targetTopic,
      subject: targetSubject,
      grade: targetGrade,
      chapter: targetChapter,
      distilledContent: distilledNotes,
    });

    console.log(`[Infographic Service] Stage 2 Universal Synthesis starting for "${targetTopic}"...`);
    const stage2Response = await generateContentWithRetry({
      model: "gemini-3.8-flash",
      contents: { parts: [{ text: stage2Prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: universalInfographicResponseSchema,
      },
    });

    const jsonText = stage2Response && stage2Response.text ? stage2Response.text.trim() : "{}";
    const parsedUniversal = JSON.parse(jsonText);
    data = adaptUniversalToLegacy(parsedUniversal);
  } catch (aiError: any) {
    console.warn("[Infographic Service] AI Universal Infographic fallback active:", aiError?.message);
    const fallbackUniversal = generateUniversalFallback(
      targetTopic,
      targetSubject,
      targetGrade,
      combinedBoard || sessionTranscript || ""
    );
    data = adaptUniversalToLegacy(fallbackUniversal);
  }

  if (data && typeof data === "object") {
    if (!data.header) {
      data.header = {
        subject: (targetSubject || "SCIENCE").toUpperCase(),
        grade: (targetGrade || "CLASS 10").toUpperCase(),
        chapter: (targetChapter || targetTopic).toUpperCase(),
        topicTag: targetTopic.toUpperCase(),
      };
    }
    if (!data.mainTitle) {
      data.mainTitle = targetTopic.toUpperCase();
    }
  }

  return data;
}
