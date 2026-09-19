import { Type } from "@google/genai";
import { ConceptInfographicData } from "../types";

export function detectAcademicDomain(topic: string = "", subject: string = ""): string {
  const combined = `${topic} ${subject}`.toLowerCase();
  if (combined.includes("chem") || combined.includes("reaction") || combined.includes("acid") || combined.includes("atom")) {
    return "chemistry";
  }
  if (combined.includes("physic") || combined.includes("optic") || combined.includes("motion") || combined.includes("wave") || combined.includes("electric")) {
    return "physics";
  }
  if (combined.includes("math") || combined.includes("algebra") || combined.includes("trig") || combined.includes("calculus") || combined.includes("geometry")) {
    return "mathematics";
  }
  if (combined.includes("bio") || combined.includes("cell") || combined.includes("organ") || combined.includes("genetics")) {
    return "biology";
  }
  return "science";
}

export function buildStage1DistillationPrompt(params: {
  topic: string;
  subject: string;
  grade: string;
  chapter?: string;
  rawText: string;
}): string {
  return `You are a Senior Academic Content Distiller for ${params.grade} ${params.subject}.
Extract the essential core concepts, governing formulas, scientific laws, key definitions, and exam traps for topic: "${params.topic}".
Raw material:
${params.rawText}

Output clean, condensed Markdown notes emphasizing precision and clarity.`;
}

export function buildStage2SynthesisPrompt(params: {
  topic: string;
  subject: string;
  grade: string;
  chapter?: string;
  distilledContent: string;
}): string {
  return `You are an expert Educational Infographic Architect.
Synthesize the following distilled notes for topic "${params.topic}" (${params.grade} ${params.subject}) into a comprehensive structured infographic JSON payload.
Distilled Notes:
${params.distilledContent}`;
}

export const universalInfographicResponseSchema = {
  type: Type.OBJECT,
  properties: {
    mainTitle: { type: Type.STRING },
    definitionPill: { type: Type.STRING },
    header: {
      type: Type.OBJECT,
      properties: {
        subject: { type: Type.STRING },
        grade: { type: Type.STRING },
        chapter: { type: Type.STRING },
        topicTag: { type: Type.STRING },
      },
    },
    conceptSection: {
      type: Type.OBJECT,
      properties: {
        primaryFormulaLatex: { type: Type.STRING },
        corePrinciple: { type: Type.STRING },
      },
    },
    observationSection: {
      type: Type.OBJECT,
      properties: {
        formulaLatex: { type: Type.STRING },
        keyInsights: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    },
    vectorFormSection: {
      type: Type.OBJECT,
      properties: {
        generalFormulaLatex: { type: Type.STRING },
        magnitudeFormulaLatex: { type: Type.STRING },
      },
    },
    examTrapsSection: {
      type: Type.OBJECT,
      properties: {
        traps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              misconception: { type: Type.STRING },
              correctConcept: { type: Type.STRING },
              trapAlert: { type: Type.STRING },
            },
          },
        },
      },
    },
    mnemonicSection: {
      type: Type.OBJECT,
      properties: {
        acronym: { type: Type.STRING },
        explanation: { type: Type.STRING },
      },
    },
  },
  required: ["mainTitle", "definitionPill"],
};

export function adaptUniversalToLegacy(parsed: any): ConceptInfographicData {
  if (!parsed || typeof parsed !== "object") {
    return generateUniversalFallback("Core Topic", "Science", "Class 10");
  }
  return {
    ...parsed,
    mainTitle: parsed.mainTitle || parsed.title || "Visual Concept Infographic",
    definitionPill: parsed.definitionPill || parsed.coreDefinition || "Key foundational concepts and laws.",
    header: {
      subject: parsed.header?.subject || "SCIENCE",
      grade: parsed.header?.grade || "CLASS 10",
      chapter: parsed.header?.chapter || parsed.mainTitle || "Chapter 1",
      topicTag: parsed.header?.topicTag || "Core Concept",
    },
    conceptSection: parsed.conceptSection || {
      primaryFormulaLatex: parsed.formulaLatex || "E = mc^2",
      corePrinciple: "Fundamental governing principle",
    },
    observationSection: parsed.observationSection || {
      formulaLatex: "",
      keyInsights: ["High frequency board exam concept", "Focus on SI units"],
    },
    examTrapsSection: parsed.examTrapsSection || {
      traps: [
        {
          misconception: "Confusing sign conventions",
          correctConcept: "Follow standard Cartesian coordinates",
          trapAlert: "Always check negative direction",
        },
      ],
    },
    mnemonicSection: parsed.mnemonicSection || {
      acronym: "F-A-S-T",
      explanation: "Formula, Application, Steps, Trap avoidance",
    },
  };
}

export function generateUniversalFallback(
  topic: string,
  subject: string,
  grade: string,
  rawNotes: string = ""
): ConceptInfographicData {
  return {
    mainTitle: topic || "Foundational STEM Concept",
    definitionPill: `Essential laws, formulas, and step-by-step principles of ${topic} for ${grade} ${subject}.`,
    header: {
      subject: (subject || "SCIENCE").toUpperCase(),
      grade: (grade || "CLASS 10").toUpperCase(),
      chapter: topic.toUpperCase(),
      topicTag: "EXAM HIGH-YIELD",
    },
    conceptSection: {
      primaryFormulaLatex: "\\vec{F} = m \\cdot \\vec{a}",
      corePrinciple: `Governing law establishing relationships across physical states in ${topic}.`,
    },
    observationSection: {
      formulaLatex: "W = \\vec{F} \\cdot \\vec{d}",
      keyInsights: [
        "Frequently tested in Section C (3-Mark) and Section D (5-Mark) exam problems.",
        "Derivation steps require explicit statement of assumptions and initial conditions.",
      ],
    },
    vectorFormSection: {
      generalFormulaLatex: "\\vec{R} = \\vec{A} + \\vec{B}",
      magnitudeFormulaLatex: "R = \\sqrt{A^2 + B^2 + 2AB\\cos\\theta}",
    },
    examTrapsSection: {
      traps: [
        {
          misconception: "Ignoring unit conversions before calculation",
          correctConcept: "Always convert all quantities into standard SI units first",
          trapAlert: "Directly causes arithmetic score deduction",
        },
      ],
    },
    mnemonicSection: {
      acronym: "U-F-C",
      explanation: "Units first, Formula written, Calculation verified",
    },
  };
}
