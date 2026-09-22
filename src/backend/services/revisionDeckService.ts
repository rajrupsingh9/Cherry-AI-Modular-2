import { Type } from "@google/genai";
import { generateContentWithRetry } from "../config/gemini";

export interface RevisionDeckParams {
  sessionTitle?: string;
  subject?: string;
  topics?: string[];
  blackboardContent?: string;
  documentMarkdown?: string;
  sourceMode?: string;
}

export async function generateRevisionDeck(params: RevisionDeckParams) {
  const { sessionTitle, subject, topics, blackboardContent, documentMarkdown, sourceMode } = params;
  console.log(`[Revision Deck Service] Generating smart exam revision deck for "${sessionTitle || "Class Session"}" (${subject || "General"}, Source: ${sourceMode || "unspecified"})`);

  const prompt = `You are Cherry Ma'am's elite edtech academic assistant. Your task is to generate a comprehensive, highly structured, exam-oriented Revision Deck consisting of Smart Flashcards and an Interactive Mind Map.

Input Source & Materials:
- Session / Topic Title: ${sessionTitle || "Class Session"}
- Subject: ${subject || "General Science"}
- Primary Learning Mode: ${sourceMode || "live_blackboard"}
${documentMarkdown ? `- Extracted Document / Curriculum Notes:\n"""\n${documentMarkdown.slice(0, 7000)}\n"""\n` : ""}
${blackboardContent ? `- Classroom Blackboard & Chalkboard Notes:\n"""\n${blackboardContent.slice(0, 5000)}\n"""\n` : ""}
${topics && Array.isArray(topics) && topics.length > 0 ? `- Subtopics Discussed:\n${topics.map((t: string, idx: number) => `  ${idx + 1}. ${t}`).join("\n")}\n` : ""}

CRITICAL REVISION DIRECTIVES:
1. Strict Content Grounding: Base ALL flashcards and mind map branches directly on the extracted document and blackboard lecture materials provided above.
2. Smart Flashcards (Generate exactly 6-8 high-yield cards):
   - 'question': Clear, high-impact conceptual or numerical question with LaTeX ($...$).
   - 'hint': Concise Socratic hint.
   - 'answer': Step-by-step explanation with proper LaTeX math ($...$).
   - 'conceptTested': Specific concept name being tested.
   - 'difficulty': "Easy", "Medium", or "Hard".
3. Exam-Oriented Mind Map (Generate 4-6 categorical theme branches):
   Structure into:
   - 📌 Core Definitions & Fundamental Laws (Foundations)
   - 📐 Governing Mathematical Equations, Units & Dimensional Formulas (LaTeX $$...$$)
   - ⚠️ Common Student Mistakes, Traps & Exceptions (Trap Points)
   - 💡 High-Yield Exam Applications, PYQ Patterns & Memory Mnemonics`;

  let data: any = null;
  try {
    const revisionResponse = await generateContentWithRetry({
      model: "gemini-3.8-flash",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  conceptTested: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                },
                required: ["id", "question", "answer", "conceptTested"],
              }
            },
            mindMap: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                nodes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      topicName: { type: Type.STRING },
                      keyConcepts: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      keyFormula: { type: Type.STRING },
                      subNodes: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      }
                    },
                    required: ["topicName", "keyConcepts", "keyFormula", "subNodes"]
                  }
                }
              },
              required: ["title", "nodes"]
            }
          },
          required: ["flashcards", "mindMap"]
        }
      }
    });

    const jsonText = revisionResponse && revisionResponse.text ? revisionResponse.text.trim() : "{}";
    data = JSON.parse(jsonText);
  } catch (aiError: any) {
    const targetTitle = sessionTitle || "Key Academic Concepts";
    const targetSubject = subject || "Science";
    const subtopics: string[] = (Array.isArray(topics) && topics.length > 0)
      ? topics.map((t: string) => t.replace(/#/g, "").trim())
      : [targetTitle];

    const fullText = `${documentMarkdown || ""} ${blackboardContent || ""}`;
    const formulaRegex = /\$\$([\s\S]*?)\$\$|\$([^\$]+)\$/g;
    const extractedFormulas: string[] = [];
    if (fullText) {
      let match;
      while ((match = formulaRegex.exec(fullText)) !== null) {
        const formula = (match[1] || match[2] || "").trim();
        if (formula.length > 2 && !extractedFormulas.includes(formula)) {
          extractedFormulas.push(formula);
        }
      }
    }

    const defaultFlashcards = [
      {
        id: "card-1",
        question: `What is the fundamental principle and physical definition of ${targetTitle}?`,
        hint: `Recall the core definitions from the syllabus notes.`,
        answer: `In ${targetSubject}, ${targetTitle} describes the core relationship governing physical systems and observable properties. Make sure to define initial state, boundary conditions, and reference frames.`,
        conceptTested: `${targetTitle} Fundamentals`,
        difficulty: "Easy"
      },
      {
        id: "card-2",
        question: `What is the primary governing mathematical formula for ${subtopics[0] || targetTitle}?`,
        hint: `Think of the main equation derived in the lesson materials.`,
        answer: extractedFormulas.length > 0
          ? `The core equation is given by: $$${extractedFormulas[0]}$$ where each symbol denotes standard physical quantities in SI units.`
          : `The foundational relation connects the dependent variable directly with independent parameters under standard reference conditions.`,
        conceptTested: `Mathematical Formulation`,
        difficulty: "Medium"
      },
      {
        id: "card-3",
        question: `How do boundary conditions, vector directions, or sign conventions influence ${targetTitle}?`,
        hint: `Consider coordinate frames (+/-) and relative orientations.`,
        answer: `Sign conventions must be established with respect to a fixed origin or observer frame. Inverting reference axis reverses relative sign of vector components.`,
        conceptTested: `Coordinate Frame & Sign Convention`,
        difficulty: "Medium"
      }
    ];

    const defaultNodes = [
      {
        topicName: "📌 Core Principles & Definitions",
        keyConcepts: [
          `Fundamental definition and core postulates of ${targetTitle}`,
          `Key physical properties and observational characteristics`
        ],
        keyFormula: extractedFormulas[0] ? `$$${extractedFormulas[0]}$$` : "",
        subNodes: [
          `Establishes the conceptual baseline for ${targetTitle}.`,
          `Essential for direct theoretical questions.`
        ]
      },
      {
        topicName: "📐 Key Equations & Derivations",
        keyConcepts: [
          `Governing differential and algebraic equations`,
          `SI Units, dimensional consistency`
        ],
        keyFormula: extractedFormulas[0] ? `$$${extractedFormulas[0]}$$` : "",
        subNodes: [
          `Derivation steps commonly tested in exams.`,
          `Always verify dimensional homogeneity before substitution.`
        ]
      }
    ];

    data = {
      flashcards: defaultFlashcards,
      mindMap: {
        title: `${targetTitle} - Master Revision Map`,
        nodes: defaultNodes
      }
    };
  }

  if (data && typeof data === "object") {
    if (!data.mindMap && data.mindmap) data.mindMap = data.mindmap;
    if (!data.flashcards && data.flashCards) data.flashcards = data.flashCards;
    if (!Array.isArray(data.flashcards)) data.flashcards = [];
    if (!data.mindMap || typeof data.mindMap !== "object") {
      data.mindMap = {
        title: sessionTitle ? `${sessionTitle} Concepts` : "Classroom Conceptual Overview",
        nodes: []
      };
    }
    if (!Array.isArray(data.mindMap.nodes)) data.mindMap.nodes = [];

    data.mindMap.nodes = data.mindMap.nodes.map((node: any) => ({
      topicName: node.topicName || node.topic || node.name || "Topic Node",
      keyConcepts: Array.isArray(node.keyConcepts) ? node.keyConcepts :
                   Array.isArray(node.coreConcepts) ? node.coreConcepts :
                   Array.isArray(node.concepts) ? node.concepts : [],
      keyFormula: node.keyFormula || node.formula || node.rule || "",
      subNodes: Array.isArray(node.subNodes) ? node.subNodes :
                Array.isArray(node.quickTakeaways) ? node.quickTakeaways :
                Array.isArray(node.takeaways) ? node.takeaways : [],
    }));
  }

  return data;
}
