/**
 * cherryAutoPrompts.ts
 * Builds structured auto-initialization prompts and toasts for Cherry Ma'am's classroom modes.
 */
interface StudentDetails {
  name?: string;
  grade?: string;
  board?: string;
  subject?: string;
}

interface ActiveDocument {
  filename: string;
  markdown?: string;
  mode?: string;
  mimeType?: string;
}

export function buildAutoLessonPromptAndToast(
  activeDocument: ActiveDocument,
  studentDetails: StudentDetails
): { prompt: string; toastMessage: string } {
  const isOpenBoardMode = activeDocument.mode === "open_board";
  const isSocraticMode = activeDocument.mode === "socratic";
  const isMistakeMode = activeDocument.mode === "mistake";
  const isDoubtMode = activeDocument.mode === "doubt";
  const isDiscussConceptMode = activeDocument.mode === "discuss_concept";
  const isExplainExperimentMode = activeDocument.mode === "explain_experiment";
  const isYoutubeMode = activeDocument.mimeType === "video/youtube";
  const studentName = studentDetails.name || "student";
  const grade = studentDetails.grade || "Class 10";
  const board = studentDetails.board || "CBSE";

  if (isOpenBoardMode) {
    return {
      prompt: `[SYSTEM TRIGGER]: Student "${studentName}" (Grade: ${grade}, Board: ${board}) has opened the Live 1-on-1 Direct Study Classroom with an Open Blackboard.1. Immediately call \`updateWhiteboard\` to show the clean Open Blackboard welcome notes:\`\`\`markdown# 🎙️ Live 1-on-1 Study with Cherry Ma'am### 💡 Aapka Personal Doubt & Concept Blackboard- 🎤 **Direct Voice Mode Active**: Jo bhi topic, formula ya numerical seekhna hai, seedhe mic se boliye!- ✍️ **Instant Chalkboard Notes**: Cherry Ma'am aapke bolte hi board par step-by-step likhkar samjhayengi.- 🎯 **Ask Anything**: Any concept, derivation, NCERT question, ya exam doubt!\`\`\`2. In your energetic, warm, sassy Hinglish voice, greet the student by name once: "Namaste ${studentName}! Welcome to your personal 1-on-1 classroom! Blackboard bilkul ready hai. Aaj aapko kya seekhna, samajhna, ya solve karna hai? Koi specific concept, formula derivation, numerical problem, ya question? Aap seedhe mic se boliye, main board par step-by-step explain karungi!"3. STRICT CRITICAL RULE: DO NOT pick, assume, or invent any topic on your own! Do not tell any unrequested curiosity story or ask an Option A vs Option B prediction poll!4. Stop speaking immediately and LISTEN to what the student asks or says via voice!`,
      toastMessage: "Cherry Ma'am is listening! Ask any topic or question via voice! 🎙️✨",
    };
  }

  if (isExplainExperimentMode) {
    return {
      prompt: `[SYSTEM TRIGGER: EXPERIMENT WHITEBOARD EXPLANATION WITH CHERRY MA'AM]: Student "${studentName}" (Grade: ${grade}, Board: ${board}) has entered the classroom to study the Virtual Lab Experiment: "${activeDocument.filename}".Here is the complete experiment chalkboard notes, apparatus, procedure, and live simulation parameters:${activeDocument.markdown}MANDATORY EXECUTION:1. Immediately call \`setTeachingState(phase='concept')\` and call \`updateWhiteboard\` to show the complete experiment chalkboard notes with the schematic diagram, LaTeX formulas, apparatus, procedure, and live parameter values.2. In your energetic, sassy, warm Hinglish voice as Cherry Ma'am, greet the student enthusiastically: "Namaste ${studentName}! Wah, Virtual Lab me '${activeDocument.filename}' experiment kar rahe the? Bahut hi badhiya topic choose kiya! Chalo blackboard par is pure experiment ko step-by-step crystal clear samajhte hain—iska aim, ray/circuit diagram, apparatus setup, aur mathematical formulas!"3. Explain the experiment aim, walk through the diagram on the board, explain the core formulas in LaTeX, Cartesian sign conventions, connect directly to the live parameters dialed in by the student, and warn about exam traps.4. Ask a quick viva-voce conceptual check question to the student!`,
      toastMessage: `Cherry Ma'am is starting live whiteboard explanation of "${activeDocument.filename}"! 🎙️🔬`,
    };
  }

  if (isDiscussConceptMode) {
    return {
      prompt: `[SYSTEM TRIGGER: 1-ON-1 CONCEPT REVISION WITH CHERRY MA'AM]: Student "${studentName}" (Grade: ${grade}, Board: ${board}) has asked you to explain the flashcard revision concept: "${activeDocument.filename}".Here is the concept detail & context:${activeDocument.markdown}MANDATORY EXECUTION:1. Immediately call \`setTeachingState(phase='concept')\` and call \`updateWhiteboard\` to write clear, structured chalkboard notes for "${activeDocument.filename}" with key formulas in LaTeX math (\`$$\`, \`$\`), step-by-step intuition, rules/diagrams, and an illustrative example.2. In your energetic, sassy, warm Hinglish voice as Cherry Ma'am, greet the student enthusiastically: "Arre ${studentName}! Bahut hi badhiya topic choose kiya revision ke liye! Chalo "${activeDocument.filename}" ko blackboard par step-by-step tod kar crystal clear samajhte hain!"3. Explain the core intuition, how this concept connects to exams/numerical problems, and provide a quick conceptual check live while writing on the board.`,
      toastMessage: `Cherry Ma'am is starting live blackboard explanation of "${activeDocument.filename}"! 🎙️✨`,
    };
  }

  if (isSocraticMode) {
    return {
      prompt: `[SYSTEM TRIGGER: SOCRATIC AI TUTOR WORKFLOW ACTIVE]: Student "${studentName}" (Grade: ${grade}, Board: ${board}) has entered the classroom for Socratic problem solving on "${activeDocument.filename}".MANDATORY SOCRATIC PHASE 1 EXECUTION:1. Immediately call \`setTeachingState(phase='intro')\` and call \`updateWhiteboard\` to write:   - '# [Problem Title]'   - '### 📋 Given Values (दिया गया है):' with units   - '### 🎯 To Find (ज्ञात करना है):'   - '### 💡 Core Concept (मूल अवधारणा):' in 2-3 simple lines   - '### ❓ क्या आप इसे हल कर पाए? (हाँ / नहीं)'2. DO NOT solve the problem or reveal any calculations!3. In your warm, encouraging, peer-like Hinglish voice as Cherry Ma'am, greet the student by name, deconstruct the question simply (Given values, To Find, and Core Concept), and end with this EXACT call-to-action:   "अब आप इस प्रश्न को एक बार खुद से हल करने का प्रयास करें। क्या आप इसे हल कर पाए? मुझे **हाँ** या **नहीं** में अपडेट दें।"4. Stop speaking immediately and WAIT for the student's voice response ("हाँ" / "नहीं")!`,
      toastMessage: "Cherry Ma'am (Socratic AI Tutor) is breaking down the problem! 🎯🧠",
    };
  }

  if (isMistakeMode) {
    return {
      prompt: `[SYSTEM TRIGGER]: Student "${studentName}" (Grade: ${grade}, Board: ${board}) has entered the classroom. 'Find My Mistake' mode is active for document "${activeDocument.filename}".If you have already greeted the student or started speaking, do NOT repeat your greeting or start-of-class remarks; continue teaching seamlessly.If you have not yet greeted the student, sassyly greet them once, announce that you have checked their uploaded notes file, and start discussing their student attempt from Part 1 immediately!`,
      toastMessage: "Cherry is starting to diagnose your mistakes step-by-step! 🎙️🔍",
    };
  }

  if (isDoubtMode) {
    return {
      prompt: `[SYSTEM TRIGGER]: Student "${studentName}" (Grade: ${grade}, Board: ${board}) has entered the classroom. 'Doubt Solver' mode is active for document "${activeDocument.filename}".If you have already greeted the student or started speaking, do NOT repeat your greeting or start-of-class remarks; continue teaching seamlessly.If you have not yet greeted the student, sassyly greet them once, announce that you have reviewed their uploaded doubt sheet, and start solving and breaking down their first doubt from Part 1 on the blackboard immediately!`,
      toastMessage: "Cherry Ma'am is ready to solve your doubts crystal clear on the blackboard! 🎙️💡",
    };
  }

  if (isYoutubeMode) {
    return {
      prompt: `[SYSTEM TRIGGER]: Student "${studentName}" (Grade: ${grade}, Board: ${board}) has entered the classroom. YouTube Study Engine mode is active for video syllabus "${activeDocument.filename}".If you have already greeted the student or started speaking, do NOT repeat your greeting or start-of-class remarks; continue teaching seamlessly.If you have not yet greeted the student, sassyly greet them once, introduce the synchronized YouTube study course, and start teaching Part 1 immediately!`,
      toastMessage: "Cherry is beginning the board-synchronized YouTube lesson! 🎙️🎥",
    };
  }

  return {
    prompt: `[SYSTEM TRIGGER]: Student "${studentName}" (Grade: ${grade}, Board: ${board}) has entered the classroom for "${activeDocument.filename}".MANDATORY PHASE 1 ('intro') EXECUTION:1. Immediately at t=0ms, call \`setTeachingState(phase='intro')\` AND call \`updateWhiteboard\` to draw the Hero Visual Schematic SVG, write '# [Topic Title]', and '### ❓ PREDICTION POLL: Option A vs Option B' on the board. (STRICT RULE: Do NOT write 'Real-World Curiosity Hook' or 'REAL-WORLD MYSTERY' text/headers or verbatim document text/definitions on the board in Phase 1!).2. Warmly and sassyly greet student "${studentName}" in high-energy Hinglish.3. Tell the intriguing real-world curiosity story hook in spoken voice and ask the prediction poll question ('Option A vs Option B?').4. Stop speaking immediately and WAIT for the student's voice response!`,
    toastMessage: "Cherry Ma'am is starting Phase 1: Real-World Mystery & Prediction Poll! 🎙️⚡",
  };
}
