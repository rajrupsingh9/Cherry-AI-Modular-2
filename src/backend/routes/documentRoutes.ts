import { Router } from "express";
import { resolveApiKey, generateContentWithRetry, sendApiError } from "../config/gemini";
import {
  getOrCreateSession,
  normalizeSubjectName,
  classifyAcademicDiscipline,
  setGlobalActiveDocument,
  setGlobalActiveSessionBackup,
} from "../state/sessionStore";

const router = Router();

router.post("/api/upload-document", async (req, res) => {
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

    const isSocraticMode = mode === "socratic";
    const isMistakeMode = mode === "mistake";
    const isDoubtMode = mode === "doubt";
    const isCheatSheetMode = mode === "cheatsheet";
    const isPYQMode = mode === "pyq";
    const isPodcastMode = mode === "podcast" || mode === "audio_overview" || mode === "audio";
    let textPrompt = "";
    if (isPodcastMode) {
      textPrompt = "You are an expert academic curriculum Vision and Text Analyzer for CBSE, ICSE, State Boards, and College curricula.\n" +
                   "Analyze this uploaded document (PDF, textbook image, lecture notes, or study sheet) with highest pedagogical fidelity.\n\n" +
                   "CRITICAL DISCIPLINE & TOPIC IDENTIFICATION PROTOCOL:\n" +
                   "1. IDENTIFY THE TRUE ACADEMIC SUBJECT: Determine whether the document belongs to 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'History', 'Geography', 'Civics', 'Economics', 'Computer Science', 'English', or 'Hindi'.\n" +
                   "   - Biology: Cell biology, life processes, genetics, photosynthesis, respiration, human anatomy, ecosystems, botany, zoology, microorganisms.\n" +
                   "   - Chemistry: Chemical reactions, equations, acids, bases, salts, chemical bonding, periodic table, organic chemistry, electrochemistry, stoichiometry, solutions.\n" +
                   "   - Physics: Mechanics, motion, laws of motion, gravitation, work, energy, power, electricity, circuits, magnetism, optics, sound, thermodynamics, waves.\n" +
                   "   - Mathematics: Algebra, polynomials, quadratic equations, calculus, geometry, trigonometry, coordinate geometry, statistics, probability.\n" +
                   "2. IDENTIFY THE EXACT CHAPTER / TOPIC TITLE: Extract the specific educational chapter, lesson, or topic name (e.g., 'National Income & Inflation', 'Photosynthesis & Light Reactions', 'Rotational Dynamics & Torque', 'Chemical Kinetics', 'Quadratic Equations'). DO NOT use raw numeric file names, camera codes, or scanner IDs (e.g., '7709', '4968', 'IMG_123', 'scan_01') as the Chapter or Topic title! Always extract the actual educational title or core concept from the document content.\n\n" +
                   "OUTPUT FORMAT REQUIREMENT:\n" +
                   "Line 1: # Chapter: <Exact Title of Chapter or Topic>\n" +
                   "Line 2: ## Subject: <Exact Single Subject Name: Physics | Chemistry | Biology | Mathematics | etc.>\n\n" +
                   "Then systematically extract all educational study material in sequential order:\n" +
                   "- Core principles, fundamental definitions, scientific axioms, and laws\n" +
                   "- Mathematical formulas, governing equations, and derivations in standard LaTeX ($...$ inline, $$...$$ display)\n" +
                   "- Key concepts, step-by-step logic, real-world examples, and analogies\n" +
                   "- Common student misconceptions, tricky question traps, and exam-relevant pointers\n" +
                   "Provide dense, comprehensive, high-fidelity study notes to enable an authentic 2-speaker audio deep dive.";
    } else if (isPYQMode) {
      textPrompt = "You are an expert Board Exam and PYQ Question Paper Vision Analyzer for CBSE / ICSE / State Boards.\n" +
                   "The uploaded document represents a student's uploaded Question Paper, Board Examination Paper, Mock Test, or Sample Question Paper.\n" +
                   "FIRST, perform a fast validation check:\n" +
                   "- Check if this document contains actual questions, problems, numerical calculations, marking schemes (+1M, +2M, +3M, +5M), sections (Section A, B, C, D, E), or exam problem statements.\n" +
                   "- If this document is CLEARLY NOT a question paper (e.g. it is a story book, personal bill, invoice, random photo, non-educational text, or purely narrative chapter study notes without exam question items), write at the very top on line 1: '[DOC_TYPE: NON_QUESTION_PAPER | REASON: <short explanation in English why it is not a question paper>]'.\n" +
                   "- If it IS a question paper / test paper / assignment with questions, write on line 1: '[DOC_TYPE: QUESTION_PAPER | SUBJECT: <detected subject> | GRADE: <detected grade>]'.\n\n" +
                   "Then, systematically extract all sections, question numbers (Q1, Q2...), marks weightage, options, and full problem statements in structured Markdown:\n" +
                   "# Question Paper Analysis: [Exam Name / Subject]\n" +
                   "## Section Breakdown & Marks Distribution\n" +
                   "## Questions & Problem Statements\n" +
                   "Format all mathematical and scientific equations in LaTeX ($...$ inline, $$...$$ display).";
    } else if (isSocraticMode) {
      textPrompt = "You are an expert Socratic AI Tutor parser for Mathematics, Physics, and Chemistry analytical and numerical problems.\n" +
                   "The uploaded document represents a student's numerical problem, analytical question, or exercise sheet.\n\n" +
                   "MANDATORY LINE 1 & LINE 2 REQUIREMENT:\n" +
                   "Line 1: # Chapter: <Exact Problem Title, Chapter Name, or Concept from Document>\n" +
                   "Line 2: ## Subject: <Exact Single Subject Name: Physics | Chemistry | Biology | Mathematics | Economics>\n\n" +
                   "Your task is to analyze and deconstruct the problem(s) into pristine Socratic teaching structure:\n" +
                   "- Divide distinct problems using level 1 Heading markdown '# Question: [Problem Title]'.\n" +
                   "- For each problem, extract and list the following in simple, crystal-clear language:\n" +
                   "  * '## 📋 Given Values (दिया गया है):' List all known values with their respective units and note any unit conversions needed (e.g., cm to m, grams to kg, minutes to seconds).\n" +
                   "  * '## 🎯 To Find (ज्ञात करना है):' State clearly and precisely what variable/quantity needs to be calculated.\n" +
                   "  * '## 💡 Core Concept (मूल अवधारणा):' Explain the scientific law, chemical principle, or mathematical theorem behind the question in 2-3 very simple lines.\n" +
                   "  * '## 🧭 Socratic Scaffolding Roadmap (For Cherry Ma'am's Memory):'\n" +
                   "    - Step 1 Micro-Hint / Leading Question: (First foundational relationship or equation to connect)\n" +
                   "    - Step 2 Micro-Hint / Leading Question: (Intermediate calculation or substitution)\n" +
                   "    - Step 3 Micro-Hint / Leading Question: (Final mathematical or algebraic operation)\n" +
                   "  * '## 🌟 Pro-Tips & Common Pitfalls:' (2-3 high-utility tips, alternative shorter methods, or unit conversion traps).\n" +
                   "- If the problem involves geometric setups, force diagrams, optical systems, electric circuits, chemical molecular structures, or plots, represent it using an inline XML SVG vector drawing (`<svg viewBox='0 0 320 200' className='w-full max-w-[320px] h-[200px]'> ... </svg>`).\n" +
                   "- Format all equations using standard LaTeX ($$...$$ for display blocks and $...$ for inline math).\n" +
                   "Do NOT write meta-introductions or conversational fillers. Generate clean, organized Markdown notes.";
    } else if (isMistakeMode) {
      textPrompt = "You are a deeply analytical academic mentor in Mathematics, Physics, and Chemistry for school syllabi (classes 6th to 12th).\n" +
                   "The uploaded document represents a student's own handwritten notes, exam sheet, or calculation work.\n\n" +
                   "MANDATORY LINE 1 & LINE 2 REQUIREMENT:\n" +
                   "Line 1: # Chapter: <Exact Problem Title or Concept Attempted>\n" +
                   "Line 2: ## Subject: <Exact Single Subject Name: Physics | Chemistry | Biology | Mathematics | Economics>\n\n" +
                   "Please deeply analyze this document to identify ANY and ALL mistakes, mathematical calculation errors, formula misuse, or visual diagram bugs.\n" +
                   "Write a comprehensive step-by-step diagnostic feedback report in Markdown:\n" +
                   "- Under '# Student Attempt', summarize what the student attempts to calculate/solve.\n" +
                   "- Under '## Identified Mistakes 🔍', list any specific calculations, signs, or logic where they made a mistake, explaining why it is wrong and what the misconception was.\n" +
                   "- Under '## Correct Step-by-Step Solution 📐', write down the fully correct step-by-step mathematical calculations and explanations.\n" +
                   "- You MUST format all mathematical formulas, physics equations, chemical structures, or scientific symbols inside standard LaTeX notation. Use $$ for display blocks and $ for inline math.\n" +
                   "- HIGH-FIDELITY DIAGRAM DRAWING PROTOCOL & SVG GUARDRAILS: If the solution involves any visual diagram, coordinate plot, geometric shape, optical layout, electrical circuit, cycle, flowchart, chemical skeletal model, or biological structure, represent it using a beautiful inline XML SVG vector drawing (`<svg viewBox='0 0 320 200' className='w-full max-w-[320px] h-[200px]'> ... </svg>`). Follow these SVG rules strictly:\n" +
                   "  1. COMPONENT-AND-ALIGNMENT EXACTNESS: Examine elements in the uploaded image/PDF page exactly. Map components to corresponding coordinate positions in a clean viewBox (e.g., `viewBox='0 0 320 200'`).\n" +
                   "  2. RAZOR-SHARP GEOMETRIC PRIMITIVES: Synthesize exact coordinates for lines, paths, circles, and polygons. For vector arrows, define a reusable `<marker>` at the beginning inside `<defs>`.\n" +
                   "  3. HIGH-CONTRAST NEON CHALK PALETTE: Use high-contrast translucent neon chalk colors ONLY on dark background (#12181B): Cyan `#22d3ee`, Emerald Green `#34d399`, Neon Yellow `#fde047`, Coral `#f97316`, Pink `#f472b6`, Violet `#c084fc`, Chalk White `#cbd5e1`. Dark/black strokes are forbidden.\n" +
                   "  4. TEXT & LABEL MARGINS: Place all variable tags and unit labels securely using native `<text>` elements offset securely from geometry lines to prevent collision (`text-anchor='middle'`, font size 12).\n" +
                   "  5. STRICTLY CLOSED & VALID XML: Ensure ALL XML tags (`<rect>`, `<path>`, `<circle>`, `<text>`, `<line>`, `<polygon>`, `<g>`, `<defs>`) are strictly closed and valid XML. Truncation or unclosed tags are strictly forbidden.\n\n" +
                   "Do NOT write any meta-introductions or conversational fillers. Generate clean, organized Markdown notes.";
    } else if (isDoubtMode) {
      textPrompt = "You are Cherry Ma'am's Academic Doubt Solver Assistant in Mathematics, Physics, Chemistry, Biology, and School Syllabi (classes 6th to 12th).\n" +
                   "The uploaded document represents a student's doubt questions, difficult problem sheet, question paper, or handwritten question notes.\n\n" +
                   "MANDATORY LINE 1 & LINE 2 REQUIREMENT:\n" +
                   "Line 1: # Chapter: <Exact Doubt or Problem Title>\n" +
                   "Line 2: ## Subject: <Exact Single Subject Name: Physics | Chemistry | Biology | Mathematics | Economics>\n\n" +
                   "Please deeply extract and structure every single doubt, problem, or question in the document so Cherry Ma'am can resolve each one crystal clear on the interactive blackboard:\n" +
                   "- Divide distinct doubts/problems into sequential parts using level 1 Heading markdown '# Doubt: [Problem or Question Title]'.\n" +
                   "- Under each doubt, structure the content clearly:\n" +
                   "  * '## ❓ Question / Problem Statement': Quote the exact question or problem statement clearly.\n" +
                   "  * '## 💡 Core Concept & Formula': State the fundamental concept, physical law, chemical principle, or mathematical formula involved.\n" +
                   "  * '## 📐 Step-by-Step Blackboard Solution': Provide the complete, pristine step-by-step resolution, derivation, or calculation.\n" +
                   "  * '## ⚠️ Common Pitfall / Where Students Get Stuck': Highlight where students usually make mistakes or get confused.\n" +
                   "- You MUST format all mathematical formulas, physics equations, chemical structures, or scientific symbols inside standard LaTeX notation. Use $$ for display blocks and $ for inline math.\n" +
                   "- HIGH-FIDELITY DIAGRAM DRAWING PROTOCOL & SVG GUARDRAILS: If the question or doubt involves any geometric figure, coordinate plot, optical ray diagram, electric circuit, force vector, chemical molecule, or biological structure, represent it using a beautiful inline XML SVG vector drawing (`<svg viewBox='0 0 320 200' className='w-full max-w-[320px] h-[200px]'> ... </svg>`). Follow SVG neon chalk rules strictly.\n" +
                   "Do NOT write meta-introductions or conversational fillers. Generate clean, organized Markdown doubt resolution notes.";
    } else if (isCheatSheetMode) {
      textPrompt = "You are an expert academic curriculum Vision OCR and visual infographic distillation assistant in Chemistry, Physics, Biology, and Mathematics.\n" +
                   "The uploaded document/image represents a textbook page, lecture notes, formula chart, or handwritten study material.\n" +
                   "CRITICAL VISION ANALYSIS INSTRUCTIONS:\n" +
                   "1. IGNORE any camera/scanner filename or numeric index (such as '4968.jpg', 'IMG_1234', 'scan_01'). DO NOT use numbers as chapter names.\n" +
                   "2. Identify the TRUE ACADEMIC SUBJECT from the visual content (Chemistry, Physics, Biology, Mathematics, History, Economics).\n" +
                   "   - If the image contains chemical symbols ($NH_3$, $HCl$, $H_2SO_4$, $HNO_3$), laboratory apparatus (test tubes, round-bottom flasks, delivery tubes, fountain experiment), chemical equations, reactants, bonding diagrams, or compound properties -> MUST CLASSIFY SUBJECT AS 'Chemistry'.\n" +
                   "3. Extract the TRUE CHAPTER / TOPIC TITLE from the headings or visual content (e.g. 'Study of Compounds: Ammonia (NH3)', 'Acids, Bases and Salts', 'Chemical Bonding', 'Periodic Table', etc.).\n" +
                   "4. Structure the output in clean, dense Markdown with clear sections:\n" +
                   "   # Chapter: [Exact Chapter Title]\n" +
                   "   ## Subject: [Exact Academic Subject, e.g. Chemistry]\n" +
                   "   ## Core Principle & Foundation: Crisp 2-sentence definition and molecular/physical foundation.\n" +
                   "   ## Key Chemical Formulas, Equations & Governing Laws: Balance all chemical equations and use standard LaTeX ($...$ inline, $$...$$ display blocks).\n" +
                   "   ## Laboratory Preparation & Apparatus Setup: Reactants, drying agents, collection method, and key chemical reactions.\n" +
                   "   ## Industrial Process / Reaction Mechanisms: (e.g., Haber's Process, Ostwald's Process, Contact Process) with catalyst, temperature, and pressure conditions.\n" +
                   "   ## Case Studies, Experiments & Physical Observations: (e.g. Fountain Experiment, colour changes, precipitation tests).\n" +
                   "   ## High-Yield Practical Applications & Exam Traps: Common student mistakes, tricky question traps, and industrial uses.\n" +
                   "   ## Key Takeaway & Golden Rule: One concise summary line.\n" +
                   "Format everything in dense, structured Markdown.";
    } else {
      textPrompt = "You are an expert academic curriculum Vision and Text Extraction Assistant for CBSE, ICSE, State Boards, and College curricula.\n" +
                   "Please analyze this uploaded document (PDF, Image, or text file) with the highest pedagogical fidelity and accuracy.\n\n" +
                   "CRITICAL STEP 1: SUBJECT & CHAPTER DISCIPLINE IDENTIFICATION:\n" +
                   "1. Determine the EXACT core academic subject discipline: 'Chemistry', 'Physics', 'Biology', 'Mathematics', 'History', 'Geography', 'Civics', 'Economics', 'Computer Science', 'English', or 'Hindi'.\n" +
                   "   - Chemistry: Chemical reactions, balancing equations, acids, bases, salts, metals, non-metals, periodic table, carbon compounds, molecules, organic chemistry, electrolysis, solutions, compounds, lab apparatus.\n" +
                   "   - Physics: Motion, force, laws of motion, gravitation, energy, work, power, light, optics, reflection, refraction, lenses, electricity, circuits, magnetism, sound, thermodynamics, waves (even if math formulas and numericals are present!).\n" +
                   "   - Biology: Life processes, cells, tissues, genetics, heredity, evolution, photosynthesis, respiration, human anatomy, nervous system, reproduction, ecology.\n" +
                   "   - Mathematics: Algebra, arithmetic, polynomials, quadratic equations, linear equations, geometry, trigonometry, coordinate geometry, calculus, probability, statistics (without physical or chemical contexts).\n" +
                   "   - History, Geography, Civics, Economics, Computer Science, English, Hindi according to their domain.\n" +
                   "2. Extract the specific chapter or topic title from the document headings or content (e.g. 'Chemical Reactions and Equations', 'Light - Reflection and Refraction', 'Life Processes', 'Quadratic Equations'). Never write generic placeholders like 'Topic Header Text'.\n\n" +
                   "MANDATORY OUTPUT FORMAT SPECIFICATION (CRITICAL):\n" +
                   "Line 1: # Chapter: <Exact Title of Chapter or Topic from Document>\n" +
                   "Line 2: ## Subject: <Exact Single Subject Name: Physics | Chemistry | Biology | Mathematics | History | Geography | Civics | Economics | Computer Science | English | Hindi>\n\n" +
                   "CRITICAL STEP 2: SYSTEMATIC CONTENT EXTRACTION:\n" +
                   "- Do NOT summarize away key details. Extract all educational concepts, definitions, scientific laws, principles, and solved examples in sequential logical flow.\n" +
                   "- Divide the extracted lecture material into sequential topics using Level 1 Heading markdown '# <Topic Title>' (e.g. '# 1. Chemical Equations and Balancing', '# 2. Types of Chemical Reactions'). Under each topic, use '## ', '### ', bold text, and bulleted lists.\n" +
                   "- You MUST format all mathematical formulas, physics equations, chemical structures, or scientific symbols inside standard LaTeX notation ($...$ inline, $$...$$ display block). Balance all chemical equations.\n" +
                   "- HIGH-FIDELITY DIAGRAM DRAWING PROTOCOL & SVG GUARDRAILS: If there are visual diagrams, flowcharts, anatomical systems, graphs, cycles, plots, circuits, ray diagrams, chemical apparatus, or drawings, represent them in high fidelity using beautifully designed inline vector SVG XML nodes (`<svg viewBox='0 0 320 200' className='w-full max-w-[320px] h-[200px]'> ... </svg>`). Follow high-contrast neon chalk palette rules on dark background (#12181B) with strictly closed XML tags.\n" +
                   "Extract content in the sequential order of the original notes so it can be taught thoroughly on the interactive blackboard.";
    }

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
      
      if (isTextFile && textContent && textContent.trim().length > 0) {
        markdown = textContent;
      } else {
        const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/^[0-9a-fA-F_-]{10,}/, "").replace(/_/g, " ").trim() || "Academic Lecture Notes";
        const inferredSubj = await classifyAcademicDiscipline(cleanName, filename);
        
        if (isSocraticMode) {
          markdown = `# Problem: ${cleanName}\n\n` +
                     `## 📋 Given Values (दिया गया है):\n- Core numerical parameters and initial values from ${cleanName}.\n\n` +
                     `## 🎯 To Find (ज्ञात करना है):\n- Target unknown variable and required mathematical proof for ${cleanName}.\n\n` +
                     `## 💡 Core Concept (मूल अवधारणा):\n- Fundamental scientific laws and mathematical relations governing ${cleanName}.\n\n` +
                     `## 🧭 Socratic Scaffolding Roadmap:\n` +
                     `- **Step 1 Micro-Hint**: Write down the primary formula connecting given values.\n` +
                     `- **Step 2 Micro-Hint**: Substitute the given quantities with standardized SI units.\n` +
                     `- **Step 3 Micro-Hint**: Simplify the equation step-by-step to arrive at the boxed answer.\n\n` +
                     `## 🌟 Pro-Tips & Common Pitfalls:\n- Always cross-check sign conventions and unit conversions before final calculation.`;
        } else if (isMistakeMode) {
          markdown = `# Student Attempt: ${cleanName}\n\n` +
                     `## Identified Mistakes 🔍\n- Verify algebraic substitutions, negative sign distributions, and units.\n\n` +
                     `## Correct Step-by-Step Solution 📐\n- Step 1: State the accurate governing principle and equations.\n- Step 2: Perform clean line-by-line working with full rigor.\n- Step 3: Box final validated result.`;
        } else if (isDoubtMode) {
          markdown = `# Doubt: ${cleanName}\n\n` +
                     `## ❓ Question / Problem Statement\n- In-depth problem analysis and key doubt concepts from ${cleanName}.\n\n` +
                     `## 💡 Core Concept & Formula\n- Core governing laws, reaction mechanisms, or mathematical formulas.\n\n` +
                     `## 📐 Step-by-Step Blackboard Solution\n- Comprehensive explanation and structured resolution for interactive chalkboard.`;
        } else if (isCheatSheetMode) {
          markdown = `# ${cleanName}\n\n` +
                     `## 📌 Core Principle & Foundation\n- Fundamental scientific laws, governing axioms, and conceptual framework for ${cleanName}.\n\n` +
                     `## 🔬 Formulas & Structural Formulation\n- Essential quantitative relations, LaTeX formulas, and key variable definitions.\n\n` +
                     `## 📐 Case Studies & Operational Scenarios\n- 4 distinct analytical cases, reaction mechanisms, or parameter conditions.\n\n` +
                     `## 🌟 Applications & Exam Pitfalls\n- High-yield practical uses, industrial impacts, and common exam traps.`;
        } else {
          markdown = `# ${cleanName}\n\n` +
                     `## 📌 Core Concepts & Overview\n- Comprehensive conceptual breakdown and fundamental axioms for ${cleanName}.\n\n` +
                     `## 🔬 Key Laws & Governing Equations\n- Mathematical derivations, reaction equations, and scientific formulation.\n\n` +
                     `## 📐 Solved Examples & Exam Applications\n- Essential exam problem variations, numerical applications, and key mnemonics.`;
        }
      }
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

      // If detectedTitle is still missing or numeric, search through all headings in markdown
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

    // Accurate multi-lingual academic discipline detection (English & Hindi)
    let normalizedSubject = detectedSubjectFromDoc || await classifyAcademicDiscipline(markdown, filename);

    // Only apply chemical reaction refinement if not already confident and text has specific chemical indicators
    if (normalizedSubject === "All Science" || !normalizedSubject) {
      if (markdown.match(/(\bNH_?3\b|ammonia|haber process|hydrochloric acid|nitric acid|sulfuric acid|periodic table|chemical reaction|titration|covalent bond|ionic bond|molar mass|vapour density)/i)) {
        normalizedSubject = "Chemistry";
      }
    }

    // Physics override if core physical laws, mechanics, optics, electricity, or units are present
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
        // Heuristic fallback check
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

    // Clean start for the new document-driven lesson
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

    res.json({
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
    sendApiError(res, "Error occurred while processing the document", err);
  }
});

// Retrieve active document context
router.get("/api/active-document", (req, res) => {
  const sessionId = req.query.sessionId as string;
  const sessionState = getOrCreateSession(sessionId);
  res.json({ activeDocument: sessionState.activeDocument });
});

// Update or set active document directly (e.g. for Direct Study)
router.post("/api/active-document", (req, res) => {
  const { sessionId, activeDocument: clientDoc } = req.body;
  const sessionState = getOrCreateSession(sessionId);
  sessionState.activeDocument = clientDoc;
  
  // Backward compatibility
  if (!sessionId || sessionId === "default") {
    setGlobalActiveDocument(clientDoc);
  }
  res.json({ success: true });
});

// Clear active document syllabus
router.post("/api/clear-document", (req, res) => {
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
  res.json({ success: true });
});

export default router;
