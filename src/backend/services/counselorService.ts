import { generateContentWithRetry } from "../config/gemini";

export interface CounselorChatParams {
  userMessage: string;
  studentName?: string;
  grade?: string;
  subject?: string;
  board?: string;
  mediumOfLearning?: string;
  performanceData?: any;
  chatHistory?: Array<{ role: string; text: string }>;
}

export interface CounselorResult {
  reply: string;
  sentiment: any;
}

export async function handleCounselorChat(params: CounselorChatParams): Promise<CounselorResult> {
  const {
    userMessage,
    studentName,
    grade,
    subject,
    board,
    mediumOfLearning,
    performanceData,
    chatHistory
  } = params;

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

  console.log(`[Counselor Service] Processing Kiara Counselor chat for ${studentName || "Student"} (${grade}, ${subject})`);

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

  const sentimentMatch = reply.match(/<<<SENTIMENT_DATA:([\s\S]*?)>>>/);
  if (sentimentMatch && sentimentMatch[1]) {
    try {
      sentiment = JSON.parse(sentimentMatch[1].trim());
      reply = reply.replace(/<<<SENTIMENT_DATA:[\s\S]*?>>>/, "").trim();
    } catch (parseErr) {
      console.warn("[Counselor Service] Failed to parse sentiment JSON:", parseErr);
    }
  }

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

  return { reply, sentiment };
}
