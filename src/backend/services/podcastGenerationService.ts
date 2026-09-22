import { generateContentWithRetry } from "../config/gemini";
import { classifyAcademicDiscipline } from "../state/sessionStore";
import {
  buildPodcastPrompt,
  buildProceduralPodcast,
} from "../../utils/podcastEngine";

export interface PodcastGenerationParams {
  topic?: string;
  subject?: string;
  grade?: string;
  language?: string;
  notesOrDocumentText?: string;
  episodeType?: string;
  targetDurationMins?: number;
  hostPair?: string;
  apiKey?: string;
}

export interface PodcastGenerationResult {
  data: any;
  isProcedural?: boolean;
  isFallback?: boolean;
  note?: string;
}

/**
 * Resolves pedagogical subject and chapter from notes or topic strings.
 */
export async function resolvePodcastSubjectAndTopic(
  topic?: string,
  subject?: string,
  notesOrDocumentText?: string
): Promise<{ resolvedSubject: string; resolvedTopic: string }> {
  let resolvedSubject = subject || "Physics";
  let resolvedTopic = topic || "Academic Deep Dive";

  if (notesOrDocumentText && notesOrDocumentText.trim().length > 30) {
    const detectedFromNotes = await classifyAcademicDiscipline(notesOrDocumentText, topic);
    if (detectedFromNotes && detectedFromNotes !== "All Science") {
      console.log(`[Podcast Service] Subject resolved from document notes: "${detectedFromNotes}" (client: "${subject}")`);
      resolvedSubject = detectedFromNotes;
    }

    if (!topic || topic === "Newton's Laws of Motion" || topic.includes("Core Concept") || topic === "Academic Deep Dive") {
      const titleMatch = notesOrDocumentText.match(/^#+\s*Chapter:\s*(.+)$/im) ||
                         notesOrDocumentText.match(/^#+\s*Topic:\s*(.+)$/im) ||
                         notesOrDocumentText.match(/^Chapter:\s*(.+)$/im) ||
                         notesOrDocumentText.match(/^Title:\s*(.+)$/im) ||
                         notesOrDocumentText.match(/^#+\s*(.+)$/m);
      if (titleMatch && titleMatch[1]) {
        const rawT = titleMatch[1].replace(/[\*\_\[\]`#]/g, "").trim();
        if (rawT.length > 2 && !rawT.toLowerCase().includes("topic header text") && !/^\d+$/.test(rawT)) {
          resolvedTopic = rawT;
          console.log(`[Podcast Service] Topic resolved from document header: "${resolvedTopic}"`);
        }
      }
    }
  } else if (topic && topic.trim().length > 3) {
    const detectedFromTopic = await classifyAcademicDiscipline(topic, topic);
    if (detectedFromTopic && detectedFromTopic !== "All Science") {
      if (subject === "Mathematics" || subject === "Physics" || !subject || subject === "General Science") {
        console.log(`[Podcast Service] Subject corrected from "${subject}" to "${detectedFromTopic}" based on topic.`);
        resolvedSubject = detectedFromTopic;
      }
    }
  }

  return { resolvedSubject, resolvedTopic };
}

/**
 * Generates an engaging 2-speaker educational audio overview script using Gemini AI or procedural fallback.
 */
export async function generatePodcastScript(params: PodcastGenerationParams): Promise<PodcastGenerationResult> {
  const {
    topic = "Newton's Laws of Motion",
    subject = "Physics",
    grade = "Class 11",
    language = "Hinglish",
    notesOrDocumentText = "",
    episodeType = "rapid_viva",
    targetDurationMins,
    hostPair = "cherry_riya",
    apiKey,
  } = params;

  const resolvedTargetMins = Number(targetDurationMins) || (
    episodeType === "exam_booster" ? 3.5 :
    episodeType === "quick_revision" ? 4 :
    episodeType === "exam_trap" ? 3 :
    3
  );

  const { resolvedSubject, resolvedTopic } = await resolvePodcastSubjectAndTopic(topic, subject, notesOrDocumentText);

  console.log(`[Podcast Service] Generating 2-Host Podcast for "${resolvedTopic}" [Mode: ${episodeType}] in ${language} (Subject: ${resolvedSubject}, Host: ${hostPair}, Key present: ${!!apiKey})`);

  if (!apiKey) {
    console.warn("[Podcast Service] No GEMINI_API_KEY available, returning procedural multilingual podcast");
    const proceduralData = buildProceduralPodcast(
      resolvedTopic,
      resolvedSubject,
      grade,
      language,
      hostPair,
      episodeType,
      resolvedTargetMins,
      notesOrDocumentText
    );
    return { data: proceduralData, isProcedural: true };
  }

  const prompt = buildPodcastPrompt({
    topic: resolvedTopic,
    subject: resolvedSubject,
    grade,
    language,
    notesOrDocumentText,
    episodeType,
    targetDurationMins: resolvedTargetMins,
    hostPair,
  });

  try {
    console.log(`[Podcast Service] Generating script with Gemini AI (gemini-3.8-flash, target: ${resolvedTargetMins}m)...`);
    const response = await Promise.race([
      generateContentWithRetry(
        {
          model: "gemini-3.8-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            temperature: 0.7,
            maxOutputTokens: 6000,
            responseMimeType: "application/json",
          },
        },
        4,
        500,
        apiKey
      ),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Podcast AI generation timeout (120s)")), 120000)
      ),
    ]);

    const rawText = response.text ? response.text.trim() : "";
    let cleanedJson = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const firstBrace = cleanedJson.indexOf("{");
    const lastBrace = cleanedJson.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanedJson = cleanedJson.substring(firstBrace, lastBrace + 1);
    }
    const parsedData = JSON.parse(cleanedJson);

    if (!parsedData.segments || !Array.isArray(parsedData.segments) || parsedData.segments.length === 0) {
      throw new Error("Invalid podcast response schema: missing segments");
    }

    if (!parsedData.episodeType) {
      parsedData.episodeType = episodeType;
    }

    console.log(`[Podcast Service] Successfully generated ${parsedData.segments.length}-segment podcast for "${resolvedTopic}" [Mode: ${episodeType}] in ${language}`);
    return { data: parsedData };
  } catch (aiErr: any) {
    console.warn("[Podcast Service] Gemini podcast generation failed, using procedural podcast fallback:", aiErr?.message);
    const proceduralData = buildProceduralPodcast(
      resolvedTopic,
      resolvedSubject,
      grade,
      language,
      hostPair,
      episodeType,
      resolvedTargetMins,
      notesOrDocumentText
    );
    return { data: proceduralData, isFallback: true, note: aiErr?.message };
  }
}
