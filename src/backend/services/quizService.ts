import { Type } from "@google/genai";
import { generateContentWithRetry } from "../config/gemini";
import { getOrCreateSession, sliceMarkdownToTopics } from "../state/sessionStore";

export interface GenerateQuizParams {
  subject?: string;
  grade?: string;
  examLevel?: string;
  activeTopicIndex?: number;
  topics?: string[];
  selectedTopics?: string[];
  selectedTopicIndices?: number[];
  discussedContent?: any;
  customBoardContent?: string;
  topicBoardsContent?: any;
  count?: number;
  difficulty?: string;
  timePerQuestion?: number;
  sessionId?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  conceptTested: string;
  theoryTested: string;
  calculationFormula: string;
  cognitiveCategory: string;
  difficulty: string;
}

export interface QuizResult {
  questions: QuizQuestion[];
  source: string;
  documentName: string;
}

export async function generateDynamicQuiz(params: GenerateQuizParams): Promise<QuizResult> {
  const {
    subject,
    grade,
    examLevel,
    activeTopicIndex,
    topics,
    selectedTopics,
    discussedContent,
    customBoardContent,
    count,
    difficulty,
    sessionId
  } = params;

  let contextText = "";
  let isFromDocument = false;
  let documentName = "";

  const sessionState = getOrCreateSession(sessionId);
  const sessionDoc = sessionState.activeDocument;

  if (sessionDoc && sessionDoc.markdown) {
    contextText = sessionDoc.markdown;
    isFromDocument = true;
    documentName = sessionDoc.filename;
  }

  let activeTopicText = "";
  if (topics && Array.isArray(topics) && typeof activeTopicIndex === "number") {
    activeTopicText = topics[activeTopicIndex] || "";
  }
  let blackboardText = customBoardContent || "";

  if (!activeTopicText && sessionState.activeSessionBackup) {
    const savedIndex = sessionState.activeSessionBackup.activeTopicIndex || 0;
    if (sessionState.activeDocument && sessionState.activeDocument.markdown) {
      const parsedTopicsList = sliceMarkdownToTopics(sessionState.activeDocument.markdown);
      activeTopicText = parsedTopicsList[savedIndex] || "";
    }
  }
  if (!blackboardText && sessionState.activeSessionBackup && sessionState.activeSessionBackup.whiteboardNotes) {
    blackboardText = sessionState.activeSessionBackup.whiteboardNotes;
  }

  const chosenTopicsList: string[] = Array.isArray(selectedTopics) && selectedTopics.length > 0
    ? selectedTopics
    : (activeTopicText ? [activeTopicText.split('\n')[0].replace(/#/g, '').trim()] : []);

  let accumulatedBoardNotes = "";
  if (discussedContent && discussedContent.notesMap && typeof discussedContent.notesMap === "object") {
    Object.entries(discussedContent.notesMap).forEach(([tTitle, tNotes]) => {
      if (tNotes && String(tNotes).trim()) {
        accumulatedBoardNotes += `\n[TOPIC: ${tTitle}]\n${String(tNotes).trim()}\n`;
      }
    });
  }
  if (!accumulatedBoardNotes && blackboardText) {
    accumulatedBoardNotes = blackboardText;
  }

  const formulasList: string[] = (discussedContent && Array.isArray(discussedContent.formulas))
    ? discussedContent.formulas
    : [];

  const questionCount = typeof count === "number" && count > 0 ? count : 5;
  const chosenDifficulty = (typeof difficulty === "string" && ["Easy", "Medium", "Hard"].includes(difficulty)) ? difficulty : "Medium";

  let difficultyInstruction = "";
  if (chosenDifficulty === "Easy") {
    difficultyInstruction = "The overall difficulty of all questions MUST be EASY. Focus on simple direct recall, fundamental definitions, and basic conceptual awareness with minimal or no complex calculation.";
  } else if (chosenDifficulty === "Hard") {
    difficultyInstruction = "The overall difficulty of all questions MUST be HARD. Focus on deep troubleshooting, complex calculations, multi-step logical reasoning, and advanced formula derivation.";
  } else {
    difficultyInstruction = "The overall difficulty of all questions MUST be MEDIUM. Focus on standard concept applications, multi-step solving, standard formula retention, and moderate analytical thinking.";
  }

  const isCompetition = Boolean(examLevel && (String(examLevel).includes("Competition") || String(examLevel).includes("JEE") || String(examLevel).includes("NEET") || String(examLevel).includes("Olympiad")));
  const examTargetInstruction = isCompetition
    ? "EXAM STANDARD: Competition Level (JEE Main & Advanced / NEET / Science & Math Olympiad). Questions MUST include deep multi-concept problem solving, rigorous application of formulas, critical edge cases, and competitive-grade conceptual tricks."
    : "EXAM STANDARD: School & Board Exam Level (CBSE / ICSE / State Board). Questions MUST be curriculum-grounded, testing foundational core definitions, standard NCERT formulas, direct concept checks, and clear textbook application.";

  let prompt = "";
  if (chosenTopicsList.length > 0 || accumulatedBoardNotes) {
    prompt = `You are Cherry Ma'am, a brilliant, sweet, sassy Indian Hinglish-speaking teacher who makes studying extremely fun.\n` +
             `Create a high-quality, concept-testing quiz for a student in grade ${grade || "Class 10"} studying ${subject || "General"}.\n` +
             `The quiz must be STRICTLY based on the SELECTED TOPICS previously/currently discussed on the classroom blackboard and syllabus:\n\n` +
             `--- SELECTED TOPICS IN SCOPE ---\n` +
             chosenTopicsList.map((t, i) => `${i + 1}. ${t}`).join('\n') + `\n\n` +
             (accumulatedBoardNotes ? `--- LIVE & PREVIOUSLY DISCUSSED CHALKBOARD NOTES (Formulas, Equations, Derivations) ---\n${accumulatedBoardNotes}\n\n` : "") +
             (formulasList.length > 0 ? `--- KEY FORMULAS FROM CHALKBOARD TO TEST ---\n${formulasList.join(', ')}\n\n` : "") +
             `--- END DISCUSSIONS ---\n\n` +
             `Exam Target Standard: ${examTargetInstruction}\n` +
             `Difficulty Level Constraint: ${difficultyInstruction}\n\n` +
             `Requirements:\n` +
             `1. Generate exactly ${questionCount} high-quality multiple choice questions (MCQs).\n` +
             `2. Distribute questions evenly across the selected topics (${chosenTopicsList.join(", ")}).\n` +
             `3. The question set must test concepts, theory, calculations, and formulas related to the selected blackboard topics. At least 1-2 questions must test the practical math formulas, calculations, or direct theories shown in the chalkboard notes.\n` +
             `4. Create 4 clear options for each question.\n` +
             `5. Set 'correctAnswer' to the 0-based index of the correct option.\n` +
             `6. Provide a detailed, easy-to-understand explanation for why that option is correct, written in your warm, friendly, sassy Hinglish/English style with KaTeX formatting where applicable.\n` +
             `7. For each question, categorize it under one of these four cognitive categories: "Conceptual Application", "Formula Retention", "Calculations & Solving", "Theoretical Core".\n` +
             `8. For each question, specify:\n` +
             `   - "conceptTested": The specific topic tested from the selected topics list.\n` +
             `   - "theoryTested": The key theoretical fact, definition, or rule being assessed.\n` +
             `   - "calculationFormula": The specific formula or step-by-step mathematical calculations tested, or write "Theoretical/Conceptual check - no calculation/formula needed" if it's purely conceptual.\n` +
             `   - "difficulty": Set EXACTLY to "${chosenDifficulty}".`;
  } else if (isFromDocument) {
    prompt = `You are a professional teacher creating a quiz for a student in ${grade || "Class 10"}.\n` +
             `The quiz must be STRICTLY based on the topics covered in the uploaded document or YouTube video titled "${documentName}".\n` +
             `Here are the contents of the document/video topics:\n\n` +
             `--- CONTENT START ---\n${contextText}\n--- CONTENT END ---\n\n` +
             `Exam Target Standard: ${examTargetInstruction}\n` +
             `Difficulty Level Constraint: ${difficultyInstruction}\n\n` +
             `Requirements:\n` +
             `1. Generate exactly ${questionCount} high-quality, concept-testing multiple choice questions.\n` +
             `2. The questions must assess if the student has understood the specific topics and concepts present in the provided content.\n` +
             `3. Create 4 clear options for each question.\n` +
             `4. Set 'correctAnswer' to the 0-based index of the correct option.\n` +
             `5. Provide a detailed, easy-to-understand explanation for why that option is correct.\n` +
             `6. For each question, categorize it under one of these four cognitive categories: "Conceptual Application", "Formula Retention", "Calculations & Solving", "Theoretical Core".\n` +
             `7. For each question, specify:\n` +
             `   - "conceptTested": The specific concept tested (e.g., "Ohm's Law", "Triangle Area").\n` +
             `   - "theoryTested": The key theoretical fact, definition, or rule being assessed.\n` +
             `   - "calculationFormula": The specific formula or step-by-step mathematical calculations tested, or write "Theoretical/Conceptual check - no calculation/formula needed" if it's purely conceptual.\n` +
             `   - "difficulty": Set EXACTLY to "${chosenDifficulty}".\n` +
             `8. If the document has a multi-lingual context (Hindi/Bengali/Odia/Hinglish), make the questions and explanations simple, clear, and relatable (using a friendly, accessible style, with Hinglish or English as appropriate).`;
  } else {
    prompt = `You are a professional teacher creating a quiz for a student in ${grade || "Class 10"} studying the subject "${subject || "General"}".\n` +
             `Exam Target Standard: ${examTargetInstruction}\n` +
             `Difficulty Level Constraint: ${difficultyInstruction}\n\n` +
             `Requirements:\n` +
             `1. Generate exactly ${questionCount} high-quality, concept-testing multiple choice questions appropriate for this grade and subject.\n` +
             `2. Create 4 clear options for each question.\n` +
             `3. Set 'correctAnswer' to the 0-based index of the correct option.\n` +
             `4. Provide a detailed, easy-to-understand explanation for why that option is correct.\n` +
             `5. For each question, categorize it under one of these four cognitive categories: "Conceptual Application", "Formula Retention", "Calculations & Solving", "Theoretical Core".\n` +
             `6. For each question, specify:\n` +
             `   - "conceptTested": The specific concept tested.\n` +
             `   - "theoryTested": The key theoretical fact, definition, or rule being assessed.\n` +
             `   - "calculationFormula": The specific formula or step-by-step mathematical calculations tested, or write "Theoretical/Conceptual check - no calculation/formula needed" if it's purely conceptual.\n` +
             `   - "difficulty": Set EXACTLY to "${chosenDifficulty}".`;
  }

  let questions: QuizQuestion[] = [];
  try {
    const quizResponse = await generateContentWithRetry({
      model: "gemini-3.8-flash",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.INTEGER, description: "0-based index of the correct answer option" },
              explanation: { type: Type.STRING },
              conceptTested: { type: Type.STRING, description: "Specific topic tested" },
              theoryTested: { type: Type.STRING, description: "Underlying theory, definition, rule, or core axiom tested" },
              calculationFormula: { type: Type.STRING, description: "Mathematical formula or step-by-step calculation step tested, or write 'Theoretical check' if none" },
              cognitiveCategory: { type: Type.STRING, description: "Conceptual Application, Formula Retention, Calculations & Solving, or Theoretical Core" },
              difficulty: { type: Type.STRING, description: "Easy, Medium, or Hard" }
            },
            required: ["id", "question", "options", "correctAnswer", "explanation", "conceptTested", "theoryTested", "calculationFormula", "cognitiveCategory", "difficulty"]
          }
        }
      }
    });

    const rawQuizText = quizResponse && quizResponse.text ? quizResponse.text.trim() : "[]";
    const cleanedText = rawQuizText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    questions = JSON.parse(cleanedText);
  } catch (aiErr: any) {
    console.warn("[Quiz Service] Quiz AI notice, using pedagogical fallback:", aiErr?.message || aiErr);
    const targetSubj = subject || "Science";
    questions = [
      {
        id: "q_fallback_1",
        question: `Which fundamental principle is central to understanding ${chosenTopicsList[0] || targetSubj}?`,
        options: [
          "Conservation and balance across states",
          "Linear proportionality only without constraints",
          "Static equilibrium with zero interactions",
          "Unconstrained energy creation"
        ],
        correctAnswer: 0,
        explanation: "In science and mathematics, governing principles rely on conservation laws and equilibrium constraints.",
        conceptTested: chosenTopicsList[0] || targetSubj,
        theoryTested: "Governing Conservation & Thermodynamic Axioms",
        calculationFormula: "Theoretical check",
        cognitiveCategory: "Theoretical Core",
        difficulty: chosenDifficulty
      },
      {
        id: "q_fallback_2",
        question: `In standard curriculum problems for ${chosenTopicsList[0] || targetSubj}, what is the primary consideration during unit analysis?`,
        options: [
          "All physical and chemical parameters must be in consistent SI standard units",
          "Units can be omitted if variables are large",
          "Only the final answer requires unit specification",
          "Units do not affect exponential or logarithmic terms"
        ],
        correctAnswer: 0,
        explanation: "Standard problem-solving requires dimensional homogeneity and consistent SI units throughout.",
        conceptTested: "Dimensional Analysis & Precision",
        theoryTested: "Standardized Units & Calculations",
        calculationFormula: "SI Unit Homogeneity check",
        cognitiveCategory: "Calculations & Solving",
        difficulty: chosenDifficulty
      }
    ];
  }

  return {
    questions: Array.isArray(questions) && questions.length > 0 ? questions : [],
    source: activeTopicText ? "present_topic" : isFromDocument ? "document" : "fallback",
    documentName: activeTopicText ? `Part ${(activeTopicIndex || 0) + 1}: ${activeTopicText.split('\n')[0].replace(/#/g, '').trim()}` : documentName
  };
}
