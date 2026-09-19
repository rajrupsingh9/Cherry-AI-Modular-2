import { Router } from "express";
import { Type } from "@google/genai";
import { generateContentWithRetry, sendApiError } from "../config/gemini";
import { getOrCreateSession, sliceMarkdownToTopics } from "../state/sessionStore";

const router = Router();

function cleanHomeworkReply(text: string): string {
  if (!text) return text;
  
  const lines = text.split("\n");
  let inWorkingSection = false;
  
  const cleanedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed.includes("Step-by-Step") || trimmed.includes("Answer:") || trimmed.includes("Given Data")) {
      inWorkingSection = true;
    } else if (trimmed.includes("Final Answer:") || trimmed.includes("Tip for Notebook:")) {
      inWorkingSection = false;
    }
    
    // Strip leading step numbers like "1. ", "2) ", "Step 1: " from solution/working lines
    if (inWorkingSection || /^\s*(?:\d+[\.\)]|Step\s*\d+\:?)\s+(?!Question|Answer|Tip|Subject)/i.test(line)) {
      return line.replace(/^\s*(?:\d+[\.\)]|Step\s*\d+\:?)\s+(?!Question|Answer|Tip|Subject)/i, "");
    }
    
    return line;
  });
  
  return cleanedLines.join("\n");
}

router.post("/api/generate-quiz", async (req, res) => {
  const { 
    subject, 
    grade, 
    examLevel,
    activeTopicIndex, 
    topics, 
    selectedTopics,
    selectedTopicIndices,
    discussedContent,
    customBoardContent, 
    topicBoardsContent, 
    count, 
    difficulty, 
    timePerQuestion,
    sessionId 
  } = req.body;
  
  try {
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

    // Determine currently discussed topic and board contents
    let activeTopicText = "";
    if (topics && Array.isArray(topics) && typeof activeTopicIndex === "number") {
      activeTopicText = topics[activeTopicIndex] || "";
    }
    let blackboardText = customBoardContent || "";

    // If both are empty, check if sessionState has them saved to ensure we always base on the currently discussed blackboard state
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

    // 1. Process Multi-Selected Topics & Discussed Content from Phase 1
    const chosenTopicsList: string[] = Array.isArray(selectedTopics) && selectedTopics.length > 0 
      ? selectedTopics 
      : (activeTopicText ? [activeTopicText.split('\n')[0].replace(/#/g, '').trim()] : []);

    // 2. Aggregate topic-wise blackboard chalkboard notes if provided
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

    // Extract formulas in context
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

    console.log(`[REST Server] Generating dynamic quiz questions (${chosenDifficulty} level). Source: ${activeTopicText ? "Present Slide Topic" : isFromDocument ? "Active Document" : "Subject Fallback"}`);

    let questions = [];
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
      console.warn("[REST Server] Quiz AI notice:", aiErr?.message || aiErr);
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

    res.json({
      success: true,
      questions: Array.isArray(questions) && questions.length > 0 ? questions : [],
      source: activeTopicText ? "present_topic" : isFromDocument ? "document" : "fallback",
      documentName: activeTopicText ? `Part ${activeTopicIndex + 1}: ${activeTopicText.split('\n')[0].replace(/#/g, '').trim()}` : documentName
    });

  } catch (err: any) {
    console.error("[REST Server] Error in quiz endpoint:", err);
    sendApiError(res, "Failed to generate dynamic quiz", err);
  }
});

// AI Syllabus Parser & Question Generator for Multiplayer Battle Arena
router.post("/api/battle-room/extract-syllabus", async (req, res) => {
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
  } = req.body;

  try {
    const questionCount = typeof numQuestions === "number" && numQuestions > 0 ? Math.min(numQuestions, 20) : 10;
    const timeLimit = typeof timePerQuestion === "number" && timePerQuestion > 0 ? timePerQuestion : 30;
    const chosenDifficulty = typeof difficulty === "string" && ["Easy", "Medium", "Hard"].includes(difficulty) ? difficulty : "Medium";
    const targetGrade = grade || "Class 10";
    const targetSubject = subject || "Mathematics";

    console.log(`[REST Server] Battle Room Syllabus Extraction: ${title || "Battle"}, Subject: ${targetSubject}, Grade: ${targetGrade}, Qs: ${questionCount}`);

    let promptContents: any[] = [];
    let isFileProvided = Boolean(base64Data && mimeType);

    if (isFileProvided) {
      const lowerMime = (mimeType || "").toLowerCase();
      const lowerName = (filename || "").toLowerCase();
      let isText = lowerMime.startsWith("text/") || lowerName.endsWith(".txt") || lowerName.endsWith(".md") || lowerName.endsWith(".json");
      
      if (isText) {
        let textContent = "";
        try {
          textContent = Buffer.from(base64Data, "base64").toString("utf-8");
        } catch (e) {
          textContent = "";
        }
        promptContents.push({
          text: `DOCUMENT SOURCE: "${filename || "Syllabus.txt"}"\n\n${textContent}`
        });
      } else {
        promptContents.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
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
              detectedSubject: { type: Type.STRING, description: "Normalized subject name (e.g. Mathematics, Science, Physics, Chemistry, Biology)" },
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
                    correctAnswer: { type: Type.INTEGER, description: "0-based index of the correct option (0, 1, 2, or 3)" },
                    explanation: { type: Type.STRING, description: "Detailed step-by-step solution and explanation" },
                    conceptTested: { type: Type.STRING, description: "Specific topic or concept tested" },
                    theoryTested: { type: Type.STRING, description: "Core rule, law, definition, or theorem" },
                    calculationFormula: { type: Type.STRING, description: "Key formula or calculation step, or 'Theoretical check'" },
                    cognitiveCategory: { type: Type.STRING, description: "Conceptual Application, Formula Retention, Calculations & Solving, or Theoretical Core" },
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
      console.warn("[REST Server] Battle room AI parse fallback notice:", parseErr?.message || parseErr);
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

    res.json({
      success: true,
      roomTitle: extractedData.roomTitle || title || `${targetSubject} Battle Arena`,
      detectedSubject: extractedData.detectedSubject || targetSubject,
      chapterSummary: extractedData.chapterSummary || "Comprehensive syllabus question pool generated by AI.",
      questions: extractedData.questions || [],
      questionCount: extractedData.questions?.length || 0,
      timePerQuestion: timeLimit
    });

  } catch (err: any) {
    console.error("[REST Server] Error in battle-room extract-syllabus endpoint:", err);
    sendApiError(res, "Failed to extract syllabus and generate battle questions", err);
  }
});

router.post("/api/counselor-chat", async (req, res) => {
  try {
    const { 
      userMessage, 
      studentName, 
      grade, 
      subject, 
      board, 
      mediumOfLearning, 
      performanceData, 
      chatHistory 
    } = req.body;

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ error: "userMessage is required" });
    }

    const perfSummary = performanceData ? 
      `STUDENT REAL-TIME PERFORMANCE ANALYTICS & HUB METRICS:
- Concept Clarity: ${performanceData.conceptClarity ?? 75}%
- Theoretical Core: ${performanceData.theoreticalCore ?? 70}%
- Calculation Precision: ${performanceData.calculationPrecision ?? 60}%
- Formula Recall: ${performanceData.formulaRecall ?? 65}%
- Socratic Stamina / Classroom Engagement: ${performanceData.socraticStamina ?? 80}%
- Total Quizzes Attempted: ${performanceData.totalQuizzes ?? 0}
- Live Classes Completed: ${performanceData.classesCompleted ?? 0}
- Saved Board Snapshots: ${performanceData.snapshotsSaved ?? 0}
- Key Strengths: ${(performanceData.strengths || []).map((s: any) => s.concept || s).join(", ") || "Active engagement"}
- Growth Focus Areas: ${(performanceData.growths || []).map((g: any) => `${g.concept || g}${g.explanation ? ` (${g.explanation})` : ''}`).join("; ") || "Calculation precision"}`
      : "No detailed performance analytics available yet.";

    const systemPrompt = `You are Kiara 👩‍🎓, an AI Student Counselor & Mindset Coach in Maestry AI.
You are a young, modern, energetic, empathetic, and psychologically intelligent female counselor guiding Indian students.
Your mission is to help students overcome study obstacles, exam phobia, anxiety, time management issues, subject-wise study strategies, creating custom timetables, and memory mnemonics.

Student Profile:
- Name: ${studentName || "Student"}
- Grade Level: ${grade || "Class 10"}
- Target Subject: ${subject || "Mathematics"}
- Board: ${board || "CBSE"}
- Medium of Learning: ${mediumOfLearning || "Hinglish"}

${perfSummary}

Communication Rules:
1. Warm, Empathetic & Energetic Hinglish/English Tone: Talk like a caring, smart elder sister / mentor ("Hey ${studentName || "Friend"}! Don't worry, hum milkar solution nikalenge! 🌸", "Chalo ek mst mnemonic trick batati hoon! ✨").
2. Reference Their Real Performance Metrics: If their Calculation Precision or Formula Recall is low, address it specifically in your advice!
3. Psychological & Mindset Focus: Acknowledge stress, fear of failure, and exam anxiety gently before providing actionable study solutions.
4. Structuring: Use bold points, bullet lists, short readable paragraphs, and warm emojis. Keep advice actionable and encouraging!
5. 🧠 REAL-TIME SENTIMENT & FRUSTRATION DETECTION PROTOCOL:
Detect if the student shows signs of:
- "anxious": Exam fear, panic, blanking out, fear of bad marks, trembling, overwhelm.
- "frustrated": Stuck on numericals, irritation, repeated mistakes, crying or angry expressions.
- "fatigued": Exhaustion, sleepy, burnout, unable to concentrate.
- "motivated": Driven, energetic, ready to conquer goals.
- "calm": Balanced, normal question.
If anxiety, frustration, or fatigue is detected:
- Prioritize emotional grounding and normalization first ("It's okay, deep breath lo...").
- Suggest taking a 2-minute break or doing a simple 4-7-8 breathing exercise.
At the VERY END of your reply, append this exact metadata block on its own line:
<<<SENTIMENT_DATA:{"mood":"anxious"|"frustrated"|"fatigued"|"motivated"|"calm","stressLevel":"low"|"moderate"|"high","frustrationLevel":"low"|"moderate"|"high","moodLabel":"Exam Anxiety Detected 😰"|"Frustration Detected 😤"|"Mental Fatigue Detected 🥱"|"Calm & In Flow 😌"|"High Motivation 🚀","requiresBreathing":true|false,"actionTip":"Short 1-sentence calming takeaway"}>>>`;

    const contents: any[] = [];
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      chatHistory.forEach((item: any) => {
        if (item.role && item.text) {
          contents.push({
            role: item.role === "user" ? "user" : "model",
            parts: [{ text: item.text }]
          });
        }
      });
    }

    contents.push({
      role: "user",
      parts: [{ text: userMessage }]
    });

    console.log(`[REST Server] Processing Kiara Counselor chat for ${studentName || "Student"} (${grade}, ${subject})`);

    const aiRes = await generateContentWithRetry({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    let reply = aiRes?.text ? aiRes.text.trim() : "Aww, Kiara couldn't generate a response right now. Please ask again! 🌸";
    let sentiment: any = null;

    // Extract SENTIMENT_DATA block if returned by model
    const sentimentMatch = reply.match(/<<<SENTIMENT_DATA:([\s\S]*?)>>>/);
    if (sentimentMatch && sentimentMatch[1]) {
      try {
        sentiment = JSON.parse(sentimentMatch[1].trim());
        reply = reply.replace(/<<<SENTIMENT_DATA:[\s\S]*?>>>/, "").trim();
      } catch (parseErr) {
        console.warn("[REST Server] Failed to parse sentiment JSON:", parseErr);
      }
    }

    // Heuristic sentiment detection fallback if not parsed
    if (!sentiment) {
      const lower = (userMessage || "").toLowerCase();
      const isAnxious = /darr|anxiety|panic|tension|stress|scared|fear|phobia|blank|fail|dar lag/i.test(lower);
      const isFrustrated = /frustrat|gussa|irritat|nahi ho raha|nahi ban raha|dimag kharab|galat ho raha|stuck|fasi hu/i.test(lower);
      const isFatigued = /thak gaya|thak gayi|sleepy|neend|tired|burnout|exhaust|bore/i.test(lower);
      const isMotivated = /topper|score|target|motivation|phod|crack|confident|ready/i.test(lower);

      if (isAnxious) {
        sentiment = {
          mood: "anxious",
          stressLevel: "high",
          frustrationLevel: "moderate",
          moodLabel: "Exam Anxiety Detected 😰",
          requiresBreathing: true,
          actionTip: "Take a slow 4-7-8 breath. You are bigger than this exam!"
        };
      } else if (isFrustrated) {
        sentiment = {
          mood: "frustrated",
          stressLevel: "high",
          frustrationLevel: "high",
          moodLabel: "Study Frustration Detected 😤",
          requiresBreathing: true,
          actionTip: "Take a 2-minute water break. A fresh mind solves problems 3x faster!"
        };
      } else if (isFatigued) {
        sentiment = {
          mood: "fatigued",
          stressLevel: "moderate",
          frustrationLevel: "low",
          moodLabel: "Mental Fatigue Detected 🥱",
          requiresBreathing: false,
          actionTip: "Rest your eyes for 5 minutes. Sleep consolidates learning!"
        };
      } else if (isMotivated) {
        sentiment = {
          mood: "motivated",
          stressLevel: "low",
          frustrationLevel: "low",
          moodLabel: "High Motivation 🚀",
          requiresBreathing: false,
          actionTip: "Channel this energy into a 25-minute Pomodoro focus sprint!"
        };
      } else {
        sentiment = {
          mood: "calm",
          stressLevel: "low",
          frustrationLevel: "low",
          moodLabel: "Calm & In Flow 😌",
          requiresBreathing: false,
          actionTip: "Stay consistent with active recall and formula revision!"
        };
      }
    }

    res.json({ success: true, reply, sentiment });
  } catch (err: any) {
    console.error("[REST Server] Error in Kiara counselor chat endpoint:", err);
    sendApiError(res, "Counselor service error", err);
  }
});

// 💡 Kiara AI Instant Mnemonic Studio Endpoint
router.post("/api/generate-mnemonic", async (req, res) => {
  try {
    const {
      topic,
      subject = "General",
      grade = "Class 10",
      board = "CBSE",
      style = "all",
      studentName = "Student",
    } = req.body;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const cleanTopic = topic.trim();
    console.log(`[REST Server] Generating mnemonic for: "${cleanTopic}" (${subject}, ${grade})`);

    const systemPrompt = `You are Kiara, the ultra-smart, creative memory coach and AI counselor for Indian students (${grade}, ${board}).
Your specialty is inventing unforgettably funny, catchy, and scientifically accurate mnemonics, rhymes, acronyms, and Hinglish visual memory tricks.

TASK:
Create 2 to 3 creative, high-retention mnemonics for the topic: "${cleanTopic}" (${subject}).
Focus on exam memory traps: formulas, sequences, sign conventions, reaction series, or definitions that students frequently forget.

REQUIREMENTS:
1. Provide a mix of styles:
   - "bollywood": Hilarious Bollywood dialogue or Desi relatable funny rhyme.
   - "acronym": Clean memorable word chain where every letter stands for a key term (like SOH-CAH-TOA or VIBGYOR).
   - "visual_story": Bizarre, exaggerated mental imagery picture (Mind Palace technique).
2. Ensure mathematical/scientific accuracy.
3. Keep the tone warm, sisterly, encouraging, and witty.
4. Output MUST be valid strictly parseable JSON only matching this schema without markdown codeblocks:
{
  "mnemonics": [
    {
      "id": "mnem-1",
      "title": "Short Catchy Name",
      "topic": "${cleanTopic}",
      "subject": "${subject}",
      "style": "bollywood" | "acronym" | "visual_story",
      "trickPhrase": "The memorable catchphrase, rhyme, or acronym in bold Hinglish/English",
      "explanation": "Clear step-by-step mapping: What each word or letter stands for",
      "formulaOrRule": "The exact scientific or mathematical formula/rule",
      "visualCue": "Vivid 1-sentence mental image that locks it in memory",
      "funScore": 95,
      "audioScript": "Conversational 2-sentence script for voice reading explaining the trick"
    }
  ]
}`;

    const userPrompt = `Generate memory mnemonics for: "${cleanTopic}" in subject ${subject}. Preferred style: ${style}.`;

    const aiRes = await generateContentWithRetry({
      model: "gemini-3.8-flash",
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
        responseMimeType: "application/json",
      },
    });

    let mnemonics: any[] = [];
    if (aiRes?.text) {
      try {
        const parsed = JSON.parse(aiRes.text.trim());
        if (Array.isArray(parsed.mnemonics) && parsed.mnemonics.length > 0) {
          mnemonics = parsed.mnemonics;
        } else if (Array.isArray(parsed)) {
          mnemonics = parsed;
        }
      } catch (parseErr) {
        console.warn("[REST Server] Failed to parse mnemonic JSON, extracting array:", parseErr);
        const match = aiRes.text.match(/\[[\s\S]*\]/);
        if (match) {
          try {
            mnemonics = JSON.parse(match[0]);
          } catch (e) {}
        }
      }
    }

    if (!mnemonics || mnemonics.length === 0) {
      mnemonics = [
        {
          id: `mnem-fallback-${Date.now()}-1`,
          title: `${cleanTopic} • Core Memory Anchor`,
          topic: cleanTopic,
          subject,
          style: "bollywood",
          trickPhrase: `💡 "Samajhdaar Dost Hamesha Formula Yaad Rakhte Hain" ➔ ${cleanTopic} Mastery!`,
          explanation: `Every keyword connects sequentially to the steps of ${cleanTopic}. Break the derivation into 3 visual checkpoints.`,
          formulaOrRule: `Concept: ${cleanTopic} for ${grade} (${board})`,
          visualCue: `Picture a brightly glowing neon blackboard with ${cleanTopic} highlighted in golden chalk.`,
          funScore: 92,
          audioScript: `Kiara here! For ${cleanTopic}, remember that memory works through associations. Link each term to a familiar picture!`
        }
      ];
    }

    res.json({ success: true, topic: cleanTopic, mnemonics });
  } catch (err: any) {
    console.error("[REST Server] Error generating mnemonic:", err);
    res.json({
      success: true,
      topic: req.body?.topic || "Formula",
      mnemonics: [
        {
          id: `mnem-err-${Date.now()}`,
          title: `${req.body?.topic || "Concept"} Quick Mnemonic`,
          topic: req.body?.topic || "Formula",
          subject: req.body?.subject || "Science",
          style: "acronym",
          trickPhrase: `⚡ Focus On: Input ➔ Process ➔ Solution`,
          explanation: `Break ${req.body?.topic || "the formula"} down into given data, formula substitution, and units with sign convention.`,
          formulaOrRule: `Key Equation: Practice 3 numerical variations`,
          visualCue: `Visualize the formula written on your palm during exam day!`,
          funScore: 90,
          audioScript: `Here is Kiara's quick trick for ${req.body?.topic || "this topic"}! Review the sign convention and units first!`
        }
      ]
    });
  }
});

router.post("/api/homework-maker", async (req, res) => {
  try {
    const {
      userMessage,
      imageBase64,
      mimeType,
      studentName,
      grade,
      board,
      mediumOfLearning,
      homeworkFormat,
      chatHistory
    } = req.body;

    if (!userMessage && !imageBase64) {
      return res.status(400).json({ error: "userMessage or imageBase64 is required" });
    }

    const studentGradeStr = grade || "Class 10";
    const studentBoardStr = board || "CBSE";
    const studentMediumStr = mediumOfLearning || "Hinglish";
    const nameStr = studentName || "Student";

    const systemPrompt = `You are Maestry Home Work Maker 📝, an expert AI Homework Assistant and School Copy Solution Generator built specifically for Indian school students.

STUDENT PROFILE & CONSTRAINTS:
- Student Name: ${nameStr}
- Grade/Class: ${studentGradeStr}
- Education Board: ${studentBoardStr}
- Medium/Language: ${studentMediumStr}

CRITICAL RULES FOR ACCURACY & FORMAT:

1. **AUTO-DETECT SUBJECT**:
   - Automatically analyze the uploaded question or image to detect the subject (e.g. Mathematics, Physics, Chemistry, Biology, English, Hindi, Social Science, Science, Computer Science, Environmental Studies/EVS, etc.).
   - Do NOT ask the user to pick a subject.
   - You MAY optionally include "Subject: [Detected Subject Name]" as a clean plain header line at the start. NEVER wrap Subject in asterisks (write "Subject: Computer Science", NOT "* Subject **:" or "* Subject * * :").

2. **STRICT GRADE-LEVEL ACCURACY**:
   - You MUST adapt the depth, complexity, steps, and vocabulary STRICTLY to ${studentGradeStr} standard!
   - NEVER generate Class 11/12 advanced calculus, university level variables, or high-school complexity for a lower grade student (e.g. if ${studentGradeStr} is Class 5/6/7, write simple age-appropriate arithmetic/algebra, basic 2-3 step reasoning, standard elementary textbook methods).
   - If ${studentGradeStr} is Class 9/10/11/12, follow the official ${studentBoardStr} marking scheme and standard curriculum for that class.

3. **DYNAMIC ADAPTIVE RESPONSE STRUCTURE (CRITICAL - NO BLOAT FOR SIMPLE QUESTIONS)**:
   - User Selected Preference Tag: "${homeworkFormat || "auto"}"

   - **MANDATORY SPACING & FORMAT RULES**:
     * NEVER wrap section headers or entire answer sentences in stray asterisks (e.g. write "Digital design refers to...", NOT "* Digital design refers to... * *").
     * Write clean section headers: "📌 Question:", "📝 Answer:", "💡 Tip for Notebook:".
     * Bold ONLY 1-3 specific key technical terms in the text if helpful. Do NOT bold or italicize entire long paragraphs!
     * You MUST ALWAYS put an EMPTY LINE (\n\n) between Question and Answer, and between Answer and Tip for Notebook.
     * NEVER join Question and Answer on the same line or adjacent lines!
     * NEVER add spaces before punctuation (write "digital design.", NOT "digital design .").

   - **ADAPTIVE FORMATTING BASED ON QUESTION TYPE**:
     Analyze the question (or uploaded image) and choose the appropriate layout. DO NOT force a heavy 6-part template on simple definitions or short questions!

     a) **SIMPLE DEFINITION / ONE-LINER / 1-MARK QUESTION (e.g. "Define digital design", "What is X?")**:
        Structure with clear double newlines:

📌 **Question**:
[Exact question text]

📝 **Answer**:
[1-2 sentence core definition in bold]
- **Key Examples / Features**: [2 short bullet points max]

💡 **Tip for Notebook**:
[1-line advice on key words/phrases to underline in notebook]

     b) **MCQ / MULTIPLE CHOICE QUESTION**:
📌 **Question**:
[Question text]

📝 **Answer**:
**Correct Option: (A) [Option Text]**
[1-2 line explanation]

💡 **Tip for Notebook**:
[Key point to remember]

     c) **FILL IN THE BLANKS / MATCH THE FOLLOWING / ONE-WORD**:
        - For Fill in Blanks: Give the complete sentence with answer **<u>bolded and underlined</u>**.
        - For Match Following: Present a neat 2-column table with Column A mapped directly to Column B.
        - For One-Word: State the exact direct word/phrase in bold + 1 short sentence explanation.

     d) **SHORT ANSWER TYPE (2-3 MARKS)**:
📌 **Question**:
[Question text]

📝 **Answer**:
[1-line brief intro definition]
- [Point 1]
- [Point 2]
- [Point 3]

💡 **Tip for Notebook**:
[1-line tip on key phrases to underline]

     e) **NUMERICAL / MATH / MULTI-STEP / LONG 5-MARK QUESTION**:
📌 **Question**: [Brief summary]

📐 **Given Data & Formula**: [Genvs, formulas]

✍️ **Step-by-Step Solution**:
[Write clean line-by-line calculation/proof directly WITHOUT step numbers like 1., 2., 3., 4. or Step 1:, Step 2:. Use natural transition connectors like "Since...", "Given that...", "From Equation (1) and (2)...", "Therefore,".]

✅ **Final Answer**: $$\\boxed{\\text{Result}}$$

💡 **Tip for Notebook**: [1-line tip on key words to underline]

4. **STRICT NO STEP-NUMBERING RULE FOR SCHOOL NOTEBOOKS**:
   - NEVER prefix solution lines, calculation steps, or geometry proof statements with numbers like "1.", "2.", "3.", "4.", "1)", "2)", "Step 1:", "Step 2:", etc.
   - When students copy solutions into their school notebook, math steps and proofs are written sequentially without step numbers.
   - Write every line of working on its own line using standard school copy style (e.g. "Given that line m || l and transversal t intersects them:", "angle 1 = angle 2 --- (Equation 1) [Corresponding Angles]", "From Equation (1) and Equation (2):", "Therefore, angle 2 = angle 3.").
   - The student must be able to copy the solution directly into their notebook without any modification or erasing of step numbers!

5. **MATH & DIAGRAMS**:
   - Format all equations using clean LaTeX (e.g., $...$ for inline or $$\\boxed{...}$$ for final answer).
   - CRITICAL RULE FOR FINAL ANSWERS: Keep descriptive words OUTSIDE the $$\\boxed{...}$$ formula box! Put ONLY short numbers/symbols inside \\boxed{} (e.g., **Position of image**: $$\\boxed{v = +0.78\\text{ m}}$$ (or $0.78\\text{ m}$ behind mirror)). NEVER put long text sentences inside \\boxed{} or \\text{} inside LaTeX block equations, so math stays perfectly horizontal!
   - If a diagram is helpful (ray diagram, circuit, geometric figure, flowchart, plant cell), generate a clean inline SVG in \`\`\`xml or \`\`\`svg code block on a clean WHITE background (background fill='#ffffff', dark lines stroke='#1e293b', text fill='#0f172a', colored rays stroke='#0284c7', '#dc2626', '#16a34a').`;

    const contents: any[] = [];
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      chatHistory.forEach((item: any) => {
        if (item.role && item.text) {
          contents.push({
            role: item.role === "user" ? "user" : "model",
            parts: [{ text: item.text }]
          });
        }
      });
    }

    const currentParts: any[] = [];
    if (imageBase64) {
      currentParts.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType || "image/jpeg"
        }
      });
    }

    const formatInstruction = homeworkFormat ? ` [Requested Format: ${homeworkFormat}]` : "";
    currentParts.push({
      text: (userMessage || "Please solve the question in the attached homework image.") + formatInstruction
    });

    contents.push({
      role: "user",
      parts: currentParts
    });

    console.log(`[REST Server] Processing Homework Maker request for ${nameStr} (${studentGradeStr}, ${studentBoardStr})`);

    const aiRes = await generateContentWithRetry({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.5,
      }
    });

    const rawReply = aiRes?.text ? aiRes.text.trim() : "Homework Maker could not generate a response right now. Please try again! 📝";
    const reply = cleanHomeworkReply(rawReply);

    res.json({ 
      success: true, 
      reply
    });
  } catch (err: any) {
    console.error("[REST Server] Error in Homework Maker endpoint:", err);
    sendApiError(res, "Homework Maker service error", err);
  }
});

export default router;
