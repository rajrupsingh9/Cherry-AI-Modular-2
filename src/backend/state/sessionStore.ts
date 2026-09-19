import { sanitizeRawBoardData } from "../../utils/boardFilter";
import { generateContentWithRetry } from "../config/gemini";

// Key document-driven syllabus store
export interface ActiveDoc {
  filename: string;
  mimeType: string;
  markdown: string;
  mode?: string;
  detectedSubject?: string;
}

export function normalizeSubjectName(rawName: string): string {
  if (!rawName) return "All Science";
  let normalizedSubject = rawName.replace(/[._#*`"]/g, "").trim();
  const lowerSubj = normalizedSubject.toLowerCase();
  if (lowerSubj.includes("math") || lowerSubj.includes("ganit")) {
    return "Mathematics";
  } else if (lowerSubj.includes("physics") || lowerSubj.includes("bhautik")) {
    return "Physics";
  } else if (lowerSubj.includes("chem") || lowerSubj.includes("rasayan")) {
    return "Chemistry";
  } else if (lowerSubj.includes("bio") || lowerSubj.includes("jeev")) {
    return "Biology";
  } else if (lowerSubj.includes("history") || lowerSubj.includes("itihas")) {
    return "History";
  } else if (lowerSubj.includes("geography") || lowerSubj.includes("bhoogol")) {
    return "Geography";
  } else if (lowerSubj.includes("civic") || lowerSubj.includes("polity") || lowerSubj.includes("political")) {
    return "Civics";
  } else if (lowerSubj.includes("econ") || lowerSubj.includes("arthashastra") || lowerSubj.includes("commerce")) {
    return "Economics";
  } else if (lowerSubj.includes("computer") || lowerSubj.includes("coding") || lowerSubj.includes("it")) {
    return "Computer Science";
  } else if (lowerSubj.includes("english") || lowerSubj.includes("angreji")) {
    return "English";
  } else if (lowerSubj.includes("hindi")) {
    return "Hindi";
  } else if (lowerSubj.includes("social science") || lowerSubj.includes("sst")) {
    return "Social Science";
  } else if (lowerSubj.includes("environmental") || lowerSubj.includes("evs")) {
    return "Environmental Science";
  }
  return normalizedSubject || "All Science";
}

export async function classifyAcademicDiscipline(markdown: string, filename?: string): Promise<string> {
  const cleanMd = (markdown || "").trim();
  const cleanName = (filename || "").trim();

  // 1. Direct High-Fidelity Gemini AI Classification (Primary & Authoritative)
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
  if (apiKey && (cleanMd.length > 25 || cleanName.length > 3)) {
    try {
      console.log(`[Subject Classifier] Running authoritative Gemini AI classifier for "${filename || "Document"}"...`);
      const snippetText = cleanMd.substring(0, 3000);
      const subjectCall = await generateContentWithRetry({
        model: "gemini-3.1-flash-lite",
        contents: {
          parts: [{
            text: `You are an expert Academic Curriculum Discipline Classifier for CBSE, ICSE, State Boards, and College Syllabi.\n` +
                  `Analyze the document title "${filename || "Notes"}" and content snippet below to determine its EXACT core academic subject.\n` +
                  `Options: 'Chemistry', 'Physics', 'Biology', 'Mathematics', 'History', 'Geography', 'Civics', 'Economics', 'Computer Science', 'English', 'Hindi'.\n\n` +
                  `Strict Domain Rules:\n` +
                  `- 'Chemistry': Chemical reactions, chemical equations, balancing reactions, atoms, molecules, acids, bases, salts, periodic table, metals, non-metals, carbon compounds, bonding, solutions, organic chemistry, electrolysis, laboratory apparatus.\n` +
                  `- 'Physics': Motion, kinematics, velocity, acceleration, displacement, force, laws of motion, gravitation, energy, work, power, light, optics, reflection, refraction, lenses, mirrors, electricity, circuits, magnetism, sound, thermodynamics, waves, units (even when containing mathematical equations and numericals!).\n` +
                  `- 'Biology': Living organisms, cells, life processes, nutrition, respiration, transportation, excretion, nervous system, reproduction, genetics, heredity, evolution, ecology, plants, animals, human physiology.\n` +
                  `- 'Mathematics': Pure mathematics, algebra, trigonometry, calculus, geometry, arithmetic, probability, statistics, polynomials, quadratic equations, matrices, sets (WITHOUT physical or chemical contexts).\n` +
                  `- 'Economics', 'History', 'Geography', 'Civics', 'Computer Science', 'English', 'Hindi' according to domain.\n\n` +
                  `Return ONLY the exact single capitalized subject name (e.g. 'Chemistry', 'Physics', 'Biology', 'Mathematics'). Do not write full sentences or punctuation.\n\n` +
                  `Content snippet:\n${snippetText || cleanName}`
          }]
        }
      });
      if (subjectCall && subjectCall.text) {
        const detected = normalizeSubjectName(subjectCall.text.trim());
        if (detected && detected !== "All Science") {
          console.log(`[Subject Classifier] Gemini AI authoritatively confirmed subject: "${detected}"`);
          return detected;
        }
      }
    } catch (err: any) {
      console.warn("[Subject Classifier] Gemini AI classifier notice, utilizing heuristic scoring fallback:", err?.message || err);
    }
  }

  // 2. Heuristic Keyword Scoring Fallback (Offline / Resilience Fallback)
  const lowerText = (markdown || "").toLowerCase();
  const lowerName = (filename || "").toLowerCase();

  // Multi-lingual keyword banks for Chemistry, Physics, Biology, Math (English & Hindi)
  const chemistryKeywords = [
    "chemistry", "chemical", "reaction", "reactions", "acid", "acids", "base", "bases", "salt", "salts",
    "metal", "metals", "non-metal", "non-metals", "carbon", "compound", "compounds", "periodic table",
    "periodic classification", "element", "elements", "atom", "atoms", "atomic", "molecule", "molecules",
    "molecular", "valency", "valence", "covalent", "ionic bond", "oxidation", "reduction", "redox", "catalyst",
    "hydrocarbon", "alkane", "alkene", "alkyne", "ester", "saponification", "displacement", "neutralization",
    "reactant", "reactants", "precipitate", "litmus", "organic chemistry", "inorganic chemistry", "bonding",
    "solution", "solute", "solvent", "molarity", "molality", "stoichiometry", "avogadro", "electrolyte", "electrolysis", "exothermic", "endothermic",
    "chemical equation", "balancing equation", "corrosion", "rancidity", "isomerism", "isomers", "functional group",
    "homologous series", "benzene", "alcohol", "aldehyde", "ketone", "carboxylic", "detergent", "titration",
    // Hindi keywords
    "रसायन", "रासायनिक", "अभिक्रिया", "समीकरण", "अम्ल", "क्षारक", "लवण", "धातु", "अधातु", "कार्बन",
    "यौगिक", "तत्व", "आवर्त सारणी", "परमाणु", "अणु", "मोल", "संयोजकता", "आबंध", "सहसंयोजी", "आयनिक", "इलेक्ट्रॉन", "प्रोटॉन",
    "ऑक्सीकरण", "अपचयन", "रेडॉक्स", "उत्प्रेरक", "हाइड्रोकार्बन", "अल्केन", "अल्कीन", "अल्काइन", "एस्टर",
    "साबुनीकरण", "विस्थापन", "द्विविस्थापन", "संयोजन", "वियोजन", "ऊष्माक्षेपी", "ऊष्माशोषी", "उदासीनीकरण",
    "संक्षारण", "विकृतगंधिता", "समजातीय श्रेणी", "क्रियात्मक समूह", "विलयन", "विलेय", "विलायक", "मोलरता"
  ];

  const physicsKeywords = [
    "physics", "kinematics", "velocity", "acceleration", "displacement", "momentum", "inertia",
    "gravitation", "gravity", "optics", "reflection", "refraction", "concave", "convex", "focal length",
    "refractive index", "prism", "human eye", "myopia", "hypermetropia", "dispersion", "electricity",
    "electric current", "potential difference", "voltage", "resistance", "resistivity", "ohm's law",
    "circuit", "ammeter", "voltmeter", "magnetic field", "electromagnet", "solenoid", "fleming",
    "electric motor", "generator", "electromagnetic induction", "ray diagram", "speed of light",
    "lens formula", "mirror formula", "joule", "watt", "work and energy", "newton's law",
    "friction", "mechanics", "electrostatics",
    // Core physical quantities & mechanics
    "force", "forces", "motion", "laws of motion", "newton", "newtons", "mass", "weight", "speed",
    "kinetic energy", "potential energy", "conservation of energy", "conservation of momentum",
    "power", "work", "pressure", "density", "pascal", "buoyancy", "archimedes", "thrust",
    "heat", "temperature", "calorimetry", "conduction", "convection", "radiation", "thermodynamics",
    "sound", "echo", "frequency", "wavelength", "amplitude", "hertz", "ultrasound", "sonar", "vibration",
    "wave", "transverse", "longitudinal", "vector", "scalar", "magnitude", "resultant",
    "torque", "rotational motion", "angular velocity", "angular momentum", "moment of inertia", "center of mass",
    "oscillation", "simple harmonic motion", "pendulum", "time period", "restoring force",
    "fluid", "viscosity", "bernoulli", "surface tension", "terminal velocity",
    "electric charge", "charge", "coulomb", "coulomb's law", "electric field", "electric potential", "capacitor", "capacitance",
    "resistor", "series parallel", "kirchhoff", "wheatstone", "potentiometer",
    "magnetic", "magnet", "lorentz force", "biot savart", "ampere's law", "faraday's law", "lenz's law",
    "alternating current", "ac circuit", "transformer", "electromagnetic waves",
    "light", "ray", "beam", "lens", "mirror", "magnification", "telescope", "microscope",
    "interference", "diffraction", "polarization", "photoelectric effect", "photon", "quantum", "de broglie",
    "nuclear physics", "radioactivity", "half life", "alpha particle", "beta particle", "gamma ray",
    "semiconductor", "diode", "transistor", "logic gate", "p-n junction", "rectifier",
    "si unit", "dimension", "dimensional formula",
    // Hindi keywords
    "भौतिक", "भौतिकी", "गति", "वेग", "त्वरण", "दूरी", "विस्थापन", "न्यूटन", "जड़त्व", "संवेग",
    "गुरुत्वाकर्षण", "कार्य", "ऊर्जा", "शक्ति", "प्रकाश", "परावर्तन", "अपवर्तन", "दर्पण", "लेंस",
    "फोकस", "प्रिज्म", "अपवर्तनांक", "नेत्र", "दृष्टि दोष", "विद्युत", "धारा", "विभवांतर", "प्रतिरोध",
    "ओम", "परिपथ", "चुंबक", "चुंबकीय", "फ्लेमिंग", "मोटर", "जनित्र", "ध्वनि", "तरंग", "आवृत्ति",
    "बल", "गति के नियम", "द्रव्यमान", "भार", "चाल", "गतिज ऊर्जा", "स्थितिज ऊर्जा", "दाब", "घनत्व"
  ];

  const biologyKeywords = [
    "biology", "life processes", "nutrition", "autotrophic", "heterotrophic", "respiration", "aerobic",
    "anaerobic", "transportation", "circulatory", "excretion", "kidney", "nephron", "control and coordination",
    "nervous system", "neuron", "synapse", "reflex arc", "endocrine", "hormone", "reproduction",
    "asexual", "sexual", "gamete", "fertilization", "dna", "heredity", "mendel", "genetics", "evolution",
    "ecosystem", "food chain", "trophic level", "ozone layer", "photosynthesis", "chlorophyll", "stomata",
    "xylem", "phloem", "mitochondria", "cell", "tissue", "organism", "botany", "zoology", "anatomy",
    // Hindi keywords
    "जीव विज्ञान", "जैव प्रक्रम", "पोषण", "श्वसन", "परिवहन", "उत्सर्जन", "नियंत्रण", "समन्वय", "तंत्रिका",
    "हार्मोन", "जनन", "प्रजनन", "डीएनए", "आनुवंशिकी", "विकास", "पर्यावरण", "पारितंत्र", "खाद्य श्रृंखला",
    "कोशिका", "माइटोकॉन्ड्रिया", "क्लोरोप्लास्ट", "प्रकाश संश्लेषण", "जाइलम", "फ्लोएम", "हृदय", "वृक्क", "नेफ्रॉन"
  ];

  const mathKeywords = [
    "mathematics", "math", "maths", "real numbers", "polynomial", "polynomials", "quadratic equation", "quadratic equations",
    "linear equations", "arithmetic progression", "triangles", "coordinate geometry", "trigonometry", "trigonometric identities",
    "circles", "surface area", "volume", "statistics", "mean median mode", "probability", "hypotenuse", "pythagoras",
    "algebra", "geometry", "calculus", "differential calculus", "integral calculus", "differentiation", "integration",
    "derivative", "derivatives", "matrix", "matrices", "determinant", "determinants", "logarithm", "mensuration",
    "number system", "rational numbers", "irrational numbers", "factorization", "permutations", "combinations",
    "binomial theorem", "complex numbers", "sequence and series", "geometric progression", "straight lines",
    "conic sections", "parabola", "ellipse", "hyperbola", "three dimensional geometry", "linear programming",
    "relations and functions", "inverse trigonometric functions", "differential equations",
    // Hindi keywords
    "गणित", "वास्तविक संख्याएं", "बहुपद", "समीकरण", "द्विघात", "समांतर श्रेढ़ी", "त्रिभुज", "निर्देशांक ज्यामिति",
    "त्रिकोणमिति", "वृत्त", "रचनाएं", "क्षेत्रफल", "आयतन", "सांख्यिकी", "प्रायिकता", "प्रमेय", "अवकलन", "समाकलन"
  ];

  const historyKeywords = [
    "history", "itihas", "itihasa", "revolution", "treaty", "napoleon", "bastille", "french revolution",
    "russian revolution", "nationalism", "mughal", "british raj", "east india company", "swaraj", "gandhi",
    "satyagraha", "rebellion", "1857", "dynasty", "empire", "renaissance", "cold war", "harappan", "indus valley",
    "vedic", "ashoka", "maurya", "gupta", "colonialism", "decolonization", "first world war", "second world war",
    // Hindi keywords
    "इतिहास", "क्रांति", "संधि", "नेपोलियन", "बास्तील", "मुगल", "ब्रिटिश", "स्वराज", "गांधी", "सत्याग्रह",
    "विद्रोह", "साम्राज्य", "हड़प्पा", "वैदिक", "मौर्य", "गुप्त", "उपनिवेशवाद", "राष्ट्रवाद"
  ];

  const geoCivicsKeywords = [
    "geography", "bhoogol", "civics", "polity", "constitution", "parliament", "judiciary", "lok sabha", "rajya sabha",
    "democracy", "fundamental rights", "directive principles", "federalism", "monsoon", "topography", "plateau",
    "drainage", "river system", "climate", "soil", "agriculture", "resources", "minerals", "vegetation",
    // Hindi keywords
    "भूगोल", "नागरिक शास्त्र", "संविधान", "संसद", "न्यायपालिका", "लोकसभा", "राज्यसभा", "लोकतंत्र", "मौलिक अधिकार",
    "मानसून", "पठार", "अपवाह", "जलवायु", "मृदा", "कृषि", "संसाधन", "खनिज", "वनस्पति"
  ];

  const economicsKeywords = [
    "economics", "arthashastra", "commerce", "accountancy", "microeconomics", "macroeconomics", "gdp", "inflation",
    "elasticity", "demand", "supply", "fiscal policy", "monetary policy", "central bank", "rbi", "banking",
    "debit", "credit", "balance sheet", "ledger", "market structure", "monopoly", "oligopoly", "opportunity cost",
    "revenue", "marginal cost", "national income", "multiplier", "cash flow", "budget", "deficit",
    // Hindi keywords
    "अर्थशास्त्र", "वाणिज्य", "लेखांकन", "जीडीपी", "मुद्रास्फीति", "मांग", "आपूर्ति", "राजकोषीय", "मौद्रिक",
    "बैलेंस शीट", "बहीखाता", "एकाधिकार", "राष्ट्रीय आय", "बजट", "घाटा"
  ];

  const csKeywords = [
    "computer science", "python", "java", "c++", "data structure", "algorithm", "binary tree", "sorting",
    "time complexity", "recursion", "oop", "database", "sql", "boolean algebra", "networking", "stack", "queue"
  ];

  const computeScore = (keywords: string[]) => {
    let score = 0;
    for (const kw of keywords) {
      if (lowerName.includes(kw)) score += 12;
      // Use boundary-safe matching
      const regex = new RegExp(`(?:^|[\\s.,;!?()\\[\\]{}\\/\\\\+\\-*="'])${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|[\\s.,;!?()\\[\\]{}\\/\\\\+\\-*="'])`, "gi");
      const matches = (lowerText.match(regex) || []).length;
      score += Math.min(matches * 2, 10);
    }
    return score;
  };

  const chemScore = computeScore(chemistryKeywords);
  const physScore = computeScore(physicsKeywords);
  const bioScore = computeScore(biologyKeywords);
  const mathScore = computeScore(mathKeywords);
  const histScore = computeScore(historyKeywords);
  const geoCivScore = computeScore(geoCivicsKeywords);
  const econScore = computeScore(economicsKeywords);
  const csScore = computeScore(csKeywords);

  console.log(`[Subject Classifier] Scores -> Chem: ${chemScore}, Phys: ${physScore}, Bio: ${bioScore}, Math: ${mathScore}, Hist: ${histScore}, Geo/Civ: ${geoCivScore}, Econ: ${econScore}, CS: ${csScore}`);

  // STEM Disambiguation: Physics notes frequently contain mathematical derivations and formulas,
  // whereas pure Mathematics textbooks almost never discuss physical quantities (force, motion, gravity, optics, electricity, etc.).
  let adjustedPhysScore = physScore;
  let adjustedMathScore = mathScore;
  if (physScore >= 6 && mathScore >= 6) {
    if (physScore >= mathScore * 0.4) {
      console.log(`[Subject Classifier] Disambiguating STEM: Physics physical quantities present (Phys: ${physScore}, Math: ${mathScore}) -> Prioritizing Physics.`);
      adjustedPhysScore = Math.max(physScore, mathScore + 10);
    }
  }

  const scores = [
    { subject: "Chemistry", score: chemScore },
    { subject: "Physics", score: adjustedPhysScore },
    { subject: "Biology", score: bioScore },
    { subject: "Mathematics", score: adjustedMathScore },
    { subject: "History", score: histScore },
    { subject: "Geography", score: geoCivScore },
    { subject: "Economics", score: econScore },
    { subject: "Computer Science", score: csScore },
  ].sort((a, b) => b.score - a.score);

  console.log(`[Subject Classifier] Final Heuristic Scores -> Chem: ${chemScore}, Phys: ${adjustedPhysScore} (raw: ${physScore}), Bio: ${bioScore}, Math: ${adjustedMathScore} (raw: ${mathScore}), Hist: ${histScore}`);

  if (scores[0].score >= 6) {
    return scores[0].subject;
  }

  if (scores[0].score > 0) {
    return scores[0].subject;
  }

  return "All Science";
}

export function sliceMarkdownToTopics(markdown: string): string[] {
  if (!markdown || !markdown.trim()) return [];

  // Filter out top-level metadata lines like # Chapter:, ## Subject:, or [DOC_TYPE: ...]
  const lines = markdown.split("\n");
  const cleanedLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      /^#+\s*(Chapter|Title|Subject)\s*:/i.test(trimmed) ||
      /^\[DOC_TYPE:[^\]]*\]/i.test(trimmed)
    ) {
      continue;
    }
    cleanedLines.push(line);
  }

  const cleanedMarkdown = cleanedLines.join("\n").trim();
  if (!cleanedMarkdown) {
    return [markdown.trim()];
  }

  // Count Level 1 headers (# ) that represent actual topics
  const level1Matches = cleanedMarkdown.match(/^#\s+[^#\n]+/gm) || [];
  const level1Count = level1Matches.length;
  // Count Level 2 headers (## ) that represent topics or subtopics
  const level2Matches = cleanedMarkdown.match(/^##\s+[^#\n]+/gm) || [];
  const level2Count = level2Matches.length;

  let rawBlocks: string[] = [];

  if (level1Count >= 2) {
    // Split cleanly on Level 1 headers (# ) so all sub-sections (##, ###), formulas, and diagrams remain intact within each topic
    const splitRegex = /(?=^#\s+[^#\n]+)/gm;
    rawBlocks = cleanedMarkdown.split(splitRegex);
  } else if (level2Count >= 2 && level1Count <= 1) {
    // If only one or zero Level 1 header, split on Level 2 headers (## )
    const splitRegex = /(?=^##\s+[^#\n]+)/gm;
    rawBlocks = cleanedMarkdown.split(splitRegex);
  } else {
    // Single topic or notes without standard markdown headings
    const paragraphs = cleanedMarkdown.split(/\n\s*\n+/);
    if (paragraphs.length >= 4) {
      // Group paragraphs into coherent slides of 2-3 paragraphs each
      const grouped: string[] = [];
      let temp = "";
      for (const p of paragraphs) {
        if (temp && (temp + "\n\n" + p).length > 600) {
          grouped.push(temp.trim());
          temp = p;
        } else {
          temp = temp ? temp + "\n\n" + p : p;
        }
      }
      if (temp.trim()) grouped.push(temp.trim());
      rawBlocks = grouped;
    } else {
      rawBlocks = [cleanedMarkdown];
    }
  }

  // Sanitize blocks: merge any stub/empty blocks (blocks with no actual content body) with the following block
  const validTopics: string[] = [];
  let pendingHeader = "";

  for (const block of rawBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Check if the block is just a header with almost no body (e.g. < 25 chars)
    const contentWithoutHeader = trimmed.replace(/^#+\s*[^\n]+\n?/, "").trim();
    if (contentWithoutHeader.length < 20 && rawBlocks.length > 1) {
      pendingHeader = pendingHeader ? pendingHeader + "\n\n" + trimmed : trimmed;
    } else {
      const combined = pendingHeader ? pendingHeader + "\n\n" + trimmed : trimmed;
      pendingHeader = "";
      validTopics.push(combined);
    }
  }

  if (pendingHeader && validTopics.length > 0) {
    validTopics[validTopics.length - 1] += "\n\n" + pendingHeader;
  } else if (pendingHeader) {
    validTopics.push(pendingHeader);
  }

  return validTopics.length > 0 ? validTopics : [markdown.trim()];
}

export function generateSourceContentBlock(topicMarkdown: string, topicIndex: number): string {
  if (!topicMarkdown || !topicMarkdown.trim()) return "";

  const lines = topicMarkdown.split("\n");
  let mainTitle = "";
  let bodyLines: string[] = [];

  for (const line of lines) {
    if (!mainTitle && line.trim().startsWith("#")) {
      mainTitle = line.trim();
    } else {
      bodyLines.push(line);
    }
  }

  if (!mainTitle) {
    mainTitle = `# TOPIC PART ${topicIndex + 1}`;
  }

  const cleanBody = bodyLines.join("\n").trim();
  const rawResult = !cleanBody ? `${mainTitle}\n\n${topicMarkdown.trim()}` : `${mainTitle}\n\n${cleanBody}`;
  return sanitizeRawBoardData(rawResult);
}

export let activeDocument: ActiveDoc | null = null;

export function setGlobalActiveDocument(doc: ActiveDoc | null) {
  activeDocument = doc;
}

// Global memory store for persistent live session state across WebSocket reconnections
export interface SessionBackup {
  history: Array<{ sender: "student" | "cherry"; text: string }>;
  teachingPhase: string;
  whiteboardNotes: string;
  activeTopicIndex?: number;
}

export let activeSessionBackup: SessionBackup = {
  history: [],
  teachingPhase: "intro",
  whiteboardNotes: "",
  activeTopicIndex: 0,
};

export function setGlobalActiveSessionBackup(backup: SessionBackup) {
  activeSessionBackup = backup;
}

export interface SessionState {
  activeDocument: ActiveDoc | null;
  activeSessionBackup: SessionBackup;
}
export const MAX_SESSIONS = 200;
export const sessions = new Map<string, SessionState>();

export function getOrCreateSession(sessionId?: string | null): SessionState {
  const sid = (sessionId && typeof sessionId === "string") ? sessionId.slice(0, 128) : "default";
  if (!sessions.has(sid)) {
    // Evict oldest session if limit exceeded (FIFO protection against unbounded memory exhaustion)
    if (sessions.size >= MAX_SESSIONS) {
      const oldestKey = sessions.keys().next().value;
      if (oldestKey && oldestKey !== "default") {
        sessions.delete(oldestKey);
      }
    }
    sessions.set(sid, {
      activeDocument: null,
      activeSessionBackup: {
        history: [],
        teachingPhase: "intro",
        whiteboardNotes: "",
        activeTopicIndex: 0,
      }
    });
  }
  return sessions.get(sid)!;
}
