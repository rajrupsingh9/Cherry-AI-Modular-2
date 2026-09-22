import { Type } from "@google/genai";
import { generateContentWithRetry } from "../config/gemini";

export interface BattleSyllabusParams {
  title?: string;
  subject?: string;
  grade?: string;
  chapter?: string;
  filename?: string;
  mimeType?: string;
  base64Data?: string;
  numQuestions?: number;
  timePerQuestion?: number;
  difficulty?: string;
}

export interface BattleRoomResult {
  roomTitle: string;
  detectedSubject: string;
  chapterSummary: string;
  questions: any[];
  questionCount: number;
  timePerQuestion: number;
}

export async function extractBattleSyllabus(params: BattleSyllabusParams): Promise<BattleRoomResult> {
  const {
    title,
    subject,
    grade,
    chapter,
    filename,
    mimeType,
    base64Data,
    numQuestions,
    timePerQuestion,
    difficulty
  } = params;

  const questionCount = typeof numQuestions === "number" && numQuestions > 0 ? Math.min(numQuestions, 20) : 10;
  const timeLimit = typeof timePerQuestion === "number" && timePerQuestion > 0 ? timePerQuestion : 30;
  const chosenDifficulty = typeof difficulty === "string" && ["Easy", "Medium", "Hard"].includes(difficulty) ? difficulty : "Medium";
  const targetGrade = grade || "Class 10";
  const targetSubject = subject || "Mathematics";

  console.log(`[Battle Service] Syllabus Extraction: ${title || "Battle"}, Subject: ${targetSubject}, Grade: ${targetGrade}, Qs: ${questionCount}`);

  const promptContents: any[] = [];
  const isFileProvided = Boolean(base64Data && mimeType);

  if (isFileProvided) {
    const lowerMime = (mimeType || "").toLowerCase();
    const lowerName = (filename || "").toLowerCase();
    const isText = lowerMime.startsWith("text/") || lowerName.endsWith(".txt") || lowerName.endsWith(".md") || lowerName.endsWith(".json");

    if (isText) {
      let textContent = "";
      try {
        textContent = Buffer.from(base64Data!, "base64").toString("utf-8");
      } catch (e) {
        textContent = "";
      }
      promptContents.push({
        text: `DOCUMENT SOURCE: "${filename || "Syllabus.txt"}"\n\n${textContent}`
      });
    } else {
      promptContents.push({
        inlineData: {
          mimeType: mimeType!,
          data: base64Data!,
        }
      });
    }
  }

  const syllabusBasis = isFileProvided
    ? `the attached uploaded syllabus document / notes ("${filename || "Uploaded File"}")`
    : `the topic / chapter "${chapter || title || targetSubject}" for ${targetGrade} ${targetSubject}`;

  const mainInstruction =
    `You are Cherry Ma'am, an expert curriculum mentor and quiz creator for students in ${targetGrade} studying ${targetSubject}.\n` +
    `Your task is to extract concepts and generate a competitive, engaging Multiplayer Battle Quiz based on ${syllabusBasis}.\n\n` +
    `REQUIREMENTS:\n` +
    `1. Generate exactly ${questionCount} high-yield Multiple Choice Questions (MCQs).\n` +
    `2. Every question must have 4 distinct options and one unambiguous correct answer (0-3 index).\n` +
    `3. Include clear, friendly explanations written in Cherry Ma'am's warm, supportive Hinglish/English style with KaTeX formatting for math/science equations.\n` +
    `4. Set question difficulty according to "${chosenDifficulty}". Ensure standard curriculum alignment with CBSE / ICSE / NCERT.\n` +
    `5. Provide 'conceptTested', 'theoryTested', 'calculationFormula', and 'cognitiveCategory' (e.g. "Conceptual Application", "Formula Retention", "Calculations & Solving", "Theoretical Core").\n` +
    `6. Formulate a short, crisp 2-line summary of the syllabus scope.`;

  promptContents.push({ text: mainInstruction });

  let extractedData: any = null;

  try {
    const response = await generateContentWithRetry({
      model: "gemini-3.8-flash",
      contents: promptContents,
      config: {
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roomTitle: { type: Type.STRING, description: "Suggested or polished battle room title" },
            detectedSubject: { type: Type.STRING, description: "Normalized subject name" },
            chapterSummary: { type: Type.STRING, description: "Short 2-line summary of syllabus topics covered" },
            questions: {
              type: Type.ARRAY,
              description: "Array of extracted quiz questions",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Unique question id like q_1, q_2" },
                  question: { type: Type.STRING, description: "Question statement with LaTeX math formatting if needed" },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "List of exactly 4 choices"
                  },
                  correctAnswer: { type: Type.INTEGER, description: "0-based index of correct option" },
                  explanation: { type: Type.STRING, description: "Detailed step-by-step solution and explanation" },
                  conceptTested: { type: Type.STRING, description: "Specific topic or concept tested" },
                  theoryTested: { type: Type.STRING, description: "Core rule, law, definition, or theorem" },
                  calculationFormula: { type: Type.STRING, description: "Key formula or calculation step" },
                  cognitiveCategory: { type: Type.STRING, description: "Conceptual Category" },
                  difficulty: { type: Type.STRING, description: "Easy, Medium, or Hard" },
                  timeLimit: { type: Type.INTEGER, description: "Time allowed in seconds" }
                },
                required: ["id", "question", "options", "correctAnswer", "explanation", "conceptTested", "theoryTested", "calculationFormula", "cognitiveCategory", "difficulty"]
              }
            }
          },
          required: ["roomTitle", "detectedSubject", "chapterSummary", "questions"]
        }
      }
    });

    const rawText = response && response.text ? response.text.trim() : "{}";
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    extractedData = JSON.parse(cleaned);
  } catch (parseErr: any) {
    console.warn("[Battle Service] Battle room AI parse fallback notice:", parseErr?.message || parseErr);
    const fallbackTopic = chapter || title || targetSubject;
    extractedData = {
      roomTitle: title || `${fallbackTopic} Battle Arena`,
      detectedSubject: targetSubject,
      chapterSummary: `Syllabus review covering key definitions, fundamental formulas, and analytical problem applications for ${fallbackTopic}.`,
      questions: Array.from({ length: questionCount }, (_, idx) => ({
        id: `q_${idx + 1}`,
        question: idx === 0
          ? `What is the primary governing principle or foundational definition behind ${fallbackTopic}?`
          : idx === 1
          ? `When solving standard problems in ${fallbackTopic}, which unit relationship must be consistently maintained?`
          : idx === 2
          ? `Which of the following conditions holds true under standard equilibrium or boundary states in ${fallbackTopic}?`
          : idx === 3
          ? `If the primary input variable is doubled in ${fallbackTopic}, how does the corresponding dependent quantity change?`
          : `Which analytical method provides the most reliable verification for solutions in ${fallbackTopic}?`,
        options: [
          "Conservation of fundamental state parameters and balanced relations",
          "Random unconstrained proportional variation",
          "Exclusively empirical observation without mathematical proof",
          "Arbitrary approximation ignoring boundary conditions"
        ],
        correctAnswer: 0,
        explanation: `In ${fallbackTopic}, the core formulation strictly depends on conservation principles, balanced mathematical identities, and standardized dimensional equations.`,
        conceptTested: fallbackTopic,
        theoryTested: "Core Curriculum Axioms & Fundamental Theorems",
        calculationFormula: "Dimensional Analysis & Standard Substitution",
        cognitiveCategory: idx % 2 === 0 ? "Conceptual Application" : "Calculations & Solving",
        difficulty: chosenDifficulty,
        timeLimit: timeLimit
      }))
    };
  }

  if (extractedData && Array.isArray(extractedData.questions)) {
    extractedData.questions = extractedData.questions.map((q: any, i: number) => ({
      ...q,
      id: q.id || `q_${i + 1}`,
      timeLimit: q.timeLimit || timeLimit,
      difficulty: q.difficulty || chosenDifficulty
    }));
  }

  return {
    roomTitle: extractedData?.roomTitle || title || `${targetSubject} Battle Arena`,
    detectedSubject: extractedData?.detectedSubject || targetSubject,
    chapterSummary: extractedData?.chapterSummary || "Comprehensive syllabus question pool generated by AI.",
    questions: extractedData?.questions || [],
    questionCount: extractedData?.questions?.length || 0,
    timePerQuestion: timeLimit
  };
}
