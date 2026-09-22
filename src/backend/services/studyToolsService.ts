import { generateContentWithRetry } from "../config/gemini";

export interface MnemonicParams {
  topic: string;
  subject?: string;
  grade?: string;
  board?: string;
  style?: string;
  studentName?: string;
}

export interface HomeworkParams {
  userMessage?: string;
  imageBase64?: string;
  mimeType?: string;
  studentName?: string;
  grade?: string;
  board?: string;
  mediumOfLearning?: string;
  homeworkFormat?: string;
  chatHistory?: Array<{ role: string; text: string }>;
}

/**
 * Strips step numbers from solution lines for school notebook format compliance.
 */
export function cleanHomeworkReply(text: string): string {
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

    if (inWorkingSection || /^\s*(?:\d+[\.\)]|Step\s*\d+\:?)\s+(?!Question|Answer|Tip|Subject)/i.test(line)) {
      return line.replace(/^\s*(?:\d+[\.\)]|Step\s*\d+\:?)\s+(?!Question|Answer|Tip|Subject)/i, "");
    }

    return line;
  });

  return cleanedLines.join("\n");
}

/**
 * Generates high-retention Bollywood, Acronym, and Visual memory tricks.
 */
export async function generateMnemonic(params: MnemonicParams) {
  const {
    topic,
    subject = "General",
    grade = "Class 10",
    board = "CBSE",
    style = "all",
  } = params;

  const cleanTopic = topic.trim();
  console.log(`[Study Tools Service] Generating mnemonic for: "${cleanTopic}" (${subject}, ${grade})`);

  const systemPrompt = `You are Kiara, the ultra-smart, creative memory coach and AI counselor for Indian students (${grade}, ${board}).
Your specialty is inventing unforgettably funny, catchy, and scientifically accurate mnemonics, rhymes, acronyms, and Hinglish visual memory tricks.

TASK:
Create 2 to 3 creative, high-retention mnemonics for the topic: "${cleanTopic}" (${subject}).
Focus on exam memory traps: formulas, sequences, sign conventions, reaction series, or definitions that students frequently forget.

REQUIREMENTS:
1. Provide a mix of styles:
   - "bollywood": Hilarious Bollywood dialogue or Desi relatable funny rhyme.
   - "acronym": Clean memorable word chain where every letter stands for a key term.
   - "visual_story": Bizarre, exaggerated mental imagery picture.
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
      "explanation": "Clear step-by-step mapping",
      "formulaOrRule": "The exact scientific or mathematical formula/rule",
      "visualCue": "Vivid 1-sentence mental image",
      "funScore": 95,
      "audioScript": "Conversational 2-sentence script for voice reading"
    }
  ]
}`;

  const userPrompt = `Generate memory mnemonics for: "${cleanTopic}" in subject ${subject}. Preferred style: ${style}.`;

  try {
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

    return { topic: cleanTopic, mnemonics };
  } catch (err: any) {
    return {
      topic: cleanTopic,
      mnemonics: [
        {
          id: `mnem-err-${Date.now()}`,
          title: `${cleanTopic} Quick Mnemonic`,
          topic: cleanTopic,
          subject,
          style: "acronym",
          trickPhrase: `⚡ Focus On: Input ➔ Process ➔ Solution`,
          explanation: `Break ${cleanTopic} down into given data, formula substitution, and units with sign convention.`,
          formulaOrRule: `Key Equation: Practice 3 numerical variations`,
          visualCue: `Visualize the formula written on your palm during exam day!`,
          funScore: 90,
          audioScript: `Here is Kiara's quick trick for ${cleanTopic}! Review the sign convention and units first!`
        }
      ]
    };
  }
}

/**
 * Solves homework queries and student notebook questions with adaptive formatting and KaTeX rendering.
 */
export async function generateHomeworkSolution(params: HomeworkParams): Promise<string> {
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
  } = params;

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
1. AUTO-DETECT SUBJECT: Automatically analyze the uploaded question or image to detect the subject.
2. STRICT GRADE-LEVEL ACCURACY: You MUST adapt depth, steps, and vocabulary STRICTLY to ${studentGradeStr} standard!
3. DYNAMIC ADAPTIVE RESPONSE STRUCTURE:
   - Selected Preference: "${homeworkFormat || "auto"}"
   - Use clean section headers: "📌 **Question**:", "📝 **Answer**:", "💡 **Tip for Notebook**:".
   - Put empty lines between sections.
4. STRICT NO STEP-NUMBERING RULE: NEVER prefix solution lines with "1.", "2.", "Step 1:", etc. Write naturally for notebook copy.
5. Format equations using clean LaTeX ($...$ inline or $$\\boxed{...}$$ for final answer).`;

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

  console.log(`[Study Tools Service] Processing Homework Maker request for ${nameStr} (${studentGradeStr}, ${studentBoardStr})`);

  const aiRes = await generateContentWithRetry({
    model: "gemini-3.8-flash",
    contents,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.5,
    }
  });

  const rawReply = aiRes?.text ? aiRes.text.trim() : "Homework Maker could not generate a response right now. Please try again! 📝";
  return cleanHomeworkReply(rawReply);
}
