/**
 * documentPromptService.ts
 * Builds specialized Gemini AI vision & text extraction prompts and fallback report templates.
 */

export function buildDocumentAnalysisPrompt(mode?: string): string {
  const isPodcastMode = mode === "podcast" || mode === "audio_overview" || mode === "audio";
  const isPYQMode = mode === "pyq";
  const isSocraticMode = mode === "socratic";
  const isMistakeMode = mode === "mistake";
  const isDoubtMode = mode === "doubt";
  const isCheatSheetMode = mode === "cheatsheet";

  if (isPodcastMode) {
    return "You are an expert academic curriculum Vision and Text Analyzer for CBSE, ICSE, State Boards, and College curricula.\n" +
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
  }

  if (isPYQMode) {
    return "You are an expert Board Exam and PYQ Question Paper Vision Analyzer for CBSE / ICSE / State Boards.\n" +
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
  }

  if (isSocraticMode) {
    return "You are an expert Socratic AI Tutor parser for Mathematics, Physics, and Chemistry analytical and numerical problems.\n" +
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
  }

  if (isMistakeMode) {
    return "You are a deeply analytical academic mentor in Mathematics, Physics, and Chemistry for school syllabi (classes 6th to 12th).\n" +
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
           "- HIGH-FIDELITY DIAGRAM DRAWING PROTOCOL & SVG GUARDRAILS: If the solution involves any visual diagram, coordinate plot, geometric shape, optical layout, electrical circuit, cycle, flowchart, chemical skeletal model, or biological structure, represent it using a beautiful inline XML SVG vector drawing (`<svg viewBox='0 0 320 200' className='w-full max-w-[320px] h-[200px]'> ... </svg>`). Follow SVG neon chalk rules strictly.\n" +
           "Do NOT write any meta-introductions or conversational fillers. Generate clean, organized Markdown notes.";
  }

  if (isDoubtMode) {
    return "You are Cherry Ma'am's Academic Doubt Solver Assistant in Mathematics, Physics, Chemistry, Biology, and School Syllabi (classes 6th to 12th).\n" +
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
  }

  if (isCheatSheetMode) {
    return "You are an expert academic curriculum Vision OCR and visual infographic distillation assistant in Chemistry, Physics, Biology, and Mathematics.\n" +
           "The uploaded document/image represents a textbook page, lecture notes, formula chart, or handwritten study material.\n" +
           "CRITICAL VISION ANALYSIS INSTRUCTIONS:\n" +
           "1. IGNORE any camera/scanner filename or numeric index (such as '4968.jpg', 'IMG_1234', 'scan_01'). DO NOT use numbers as chapter names.\n" +
           "2. Identify the TRUE ACADEMIC SUBJECT from the visual content (Chemistry, Physics, Biology, Mathematics, History, Economics).\n" +
           "3. Extract the TRUE CHAPTER / TOPIC TITLE from the headings or visual content.\n" +
           "4. Structure the output in clean, dense Markdown with clear sections:\n" +
           "   # Chapter: [Exact Chapter Title]\n" +
           "   ## Subject: [Exact Academic Subject, e.g. Chemistry]\n" +
           "   ## Core Principle & Foundation: Crisp 2-sentence definition and molecular/physical foundation.\n" +
           "   ## Key Chemical Formulas, Equations & Governing Laws: Balance all chemical equations and use standard LaTeX ($...$ inline, $$...$$ display blocks).\n" +
           "   ## Laboratory Preparation & Apparatus Setup: Reactants, drying agents, collection method, and key chemical reactions.\n" +
           "   ## Industrial Process / Reaction Mechanisms: (e.g., Haber's Process, Ostwald's Process, Contact Process) with conditions.\n" +
           "   ## Case Studies, Experiments & Physical Observations\n" +
           "   ## High-Yield Practical Applications & Exam Traps\n" +
           "   ## Key Takeaway & Golden Rule: One concise summary line.\n" +
           "Format everything in dense, structured Markdown.";
  }

  // Default syllabus explanation mode
  return "You are an expert academic curriculum Vision and Text Extraction Assistant for CBSE, ICSE, State Boards, and College curricula.\n" +
         "Please analyze this uploaded document (PDF, Image, or text file) with the highest pedagogical fidelity and accuracy.\n\n" +
         "CRITICAL STEP 1: SUBJECT & CHAPTER DISCIPLINE IDENTIFICATION:\n" +
         "1. Determine the EXACT core academic subject discipline: 'Chemistry', 'Physics', 'Biology', 'Mathematics', 'History', 'Geography', 'Civics', 'Economics', 'Computer Science', 'English', or 'Hindi'.\n" +
         "2. Extract the specific chapter or topic title from the document headings or content (e.g. 'Chemical Reactions and Equations', 'Light - Reflection and Refraction', 'Life Processes', 'Quadratic Equations'). Never write generic placeholders like 'Topic Header Text'.\n\n" +
         "MANDATORY OUTPUT FORMAT SPECIFICATION (CRITICAL):\n" +
         "Line 1: # Chapter: <Exact Title of Chapter or Topic from Document>\n" +
         "Line 2: ## Subject: <Exact Single Subject Name: Physics | Chemistry | Biology | Mathematics | History | Geography | Civics | Economics | Computer Science | English | Hindi>\n\n" +
         "CRITICAL STEP 2: SYSTEMATIC CONTENT EXTRACTION:\n" +
         "- Do NOT summarize away key details. Extract all educational concepts, definitions, scientific laws, principles, and solved examples in sequential logical flow.\n" +
         "- Divide the extracted lecture material into sequential topics using Level 1 Heading markdown '# <Topic Title>'. Under each topic, use '## ', '### ', bold text, and bulleted lists.\n" +
         "- You MUST format all mathematical formulas, physics equations, chemical structures, or scientific symbols inside standard LaTeX notation ($...$ inline, $$...$$ display block). Balance all chemical equations.\n" +
         "- HIGH-FIDELITY DIAGRAM DRAWING PROTOCOL & SVG GUARDRAILS: If there are visual diagrams, represent them in high fidelity using inline vector SVG XML nodes (`<svg viewBox='0 0 320 200' className='w-full max-w-[320px] h-[200px]'> ... </svg>`). Follow neon chalk palette rules on dark background (#12181B) with strictly closed XML tags.\n" +
         "Extract content in the sequential order of the original notes so it can be taught thoroughly on the interactive blackboard.";
}

export function buildDocumentFallbackMarkdown(
  mode: string | undefined,
  cleanName: string,
  isTextFile: boolean,
  textContent: string
): string {
  if (isTextFile && textContent && textContent.trim().length > 0) {
    return textContent;
  }

  if (mode === "socratic") {
    return `# Problem: ${cleanName}\n\n` +
           `## 📋 Given Values (दिया गया है):\n- Core numerical parameters and initial values from ${cleanName}.\n\n` +
           `## 🎯 To Find (ज्ञात करना है):\n- Target unknown variable and required mathematical proof for ${cleanName}.\n\n` +
           `## 💡 Core Concept (मूल अवधारणा):\n- Fundamental scientific laws and mathematical relations governing ${cleanName}.\n\n` +
           `## 🧭 Socratic Scaffolding Roadmap:\n` +
           `- **Step 1 Micro-Hint**: Write down the primary formula connecting given values.\n` +
           `- **Step 2 Micro-Hint**: Substitute the given quantities with standardized SI units.\n` +
           `- **Step 3 Micro-Hint**: Simplify the equation step-by-step to arrive at the boxed answer.\n\n` +
           `## 🌟 Pro-Tips & Common Pitfalls:\n- Always cross-check sign conventions and unit conversions before final calculation.`;
  }

  if (mode === "mistake") {
    return `# Student Attempt: ${cleanName}\n\n` +
           `## Identified Mistakes 🔍\n- Verify algebraic substitutions, negative sign distributions, and units.\n\n` +
           `## Correct Step-by-Step Solution 📐\n- Step 1: State the accurate governing principle and equations.\n- Step 2: Perform clean line-by-line working with full rigor.\n- Step 3: Box final validated result.`;
  }

  if (mode === "doubt") {
    return `# Doubt: ${cleanName}\n\n` +
           `## ❓ Question / Problem Statement\n- In-depth problem analysis and key doubt concepts from ${cleanName}.\n\n` +
           `## 💡 Core Concept & Formula\n- Core governing laws, reaction mechanisms, or mathematical formulas.\n\n` +
           `## 📐 Step-by-Step Blackboard Solution\n- Comprehensive explanation and structured resolution for interactive chalkboard.`;
  }

  if (mode === "cheatsheet") {
    return `# ${cleanName}\n\n` +
           `## 📌 Core Principle & Foundation\n- Fundamental scientific laws, governing axioms, and conceptual framework for ${cleanName}.\n\n` +
           `## 🔬 Formulas & Structural Formulation\n- Essential quantitative relations, LaTeX formulas, and key variable definitions.\n\n` +
           `## 📐 Case Studies & Operational Scenarios\n- 4 distinct analytical cases, reaction mechanisms, or parameter conditions.\n\n` +
           `## 🌟 Applications & Exam Pitfalls\n- High-yield practical uses, industrial impacts, and common exam traps.`;
  }

  return `# ${cleanName}\n\n` +
         `## 📌 Core Concepts & Overview\n- Comprehensive conceptual breakdown and fundamental axioms for ${cleanName}.\n\n` +
         `## 🔬 Key Laws & Governing Equations\n- Mathematical derivations, reaction equations, and scientific formulation.\n\n` +
         `## 📐 Solved Examples & Exam Applications\n- Essential exam problem variations, numerical applications, and key mnemonics.`;
}
