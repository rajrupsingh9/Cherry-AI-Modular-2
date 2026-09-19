import { AudioPodcastData, PodcastSegment } from "../types";

export function buildPodcastPrompt(params: {
  topic: string;
  subject: string;
  grade: string;
  language: string;
  notesOrDocumentText?: string;
  episodeType: string;
  targetDurationMins: number;
  hostPair: string;
}): string {
  return `You are creating an engaging educational audio podcast episode for ${params.grade} students studying ${params.subject}.
Topic: "${params.topic}"
Language: ${params.language}
Episode Type: ${params.episodeType}
Host Style: ${params.hostPair}
Duration Target: ${params.targetDurationMins} minutes.
Context / Notes:
${params.notesOrDocumentText || "Core subject concepts, exam traps, and real-world examples."}

Generate a conversational dialogue between the mentor/teacher and an enthusiastic student or co-host.
Return pure JSON matching:
{
  "title": "Title of Podcast",
  "topic": "${params.topic}",
  "subject": "${params.subject}",
  "grade": "${params.grade}",
  "language": "${params.language}",
  "episodeType": "${params.episodeType}",
  "durationMinutes": ${params.targetDurationMins},
  "hosts": { "mentorName": "Tara Ma'am", "studentName": "Aarav" },
  "segments": [
    { "speaker": "mentor", "speakerName": "Tara Ma'am", "text": "Welcome learners..." },
    { "speaker": "student", "speakerName": "Aarav", "text": "Ma'am I had a quick question..." }
  ]
}`;
}

export function buildProceduralPodcast(
  topic: string = "Core Academic Concept",
  subject: string = "Science",
  grade: string = "Class 10",
  language: string = "Hinglish",
  hostPair: string = "tara_aarav",
  episodeType: string = "deep_dive",
  targetDurationMins: number = 3,
  notesOrDocumentText: string = ""
): AudioPodcastData {
  const isHinglish = language.toLowerCase().includes("hing") || language.toLowerCase().includes("hin");
  const mentorName = "Tara Ma'am";
  const studentName = "Aarav";

  const segments: PodcastSegment[] = isHinglish
    ? [
        {
          speaker: "mentor",
          speakerName: mentorName,
          text: `Namaste Aarav aur sabhi dosto! Aaj hum deep dive karne wale hain "${topic}" par. Yeh ${subject} ka bohot hi scoring aur foundational topic hai.`,
        },
        {
          speaker: "student",
          speakerName: studentName,
          text: `Namaste Tara Ma'am! Main toh is chapter ke derivations aur concepts ko lekar thoda confused rehta hoon. Aaj isko simple tareeqe se samajhte hain!`,
        },
        {
          speaker: "mentor",
          speakerName: mentorName,
          text: `Bilkul Aarav. Sabse pehle core definition yaad rakho: har theoretical law ka direct physical meaning hota hai. Formula ko ratna nahi hai, bas variables ka relation observe karo.`,
        },
        {
          speaker: "student",
          speakerName: studentName,
          text: `Achha! Aur exams me board examiners kis baat par marks deduct karte hain? Koi common trap hai kya?`,
        },
        {
          speaker: "mentor",
          speakerName: mentorName,
          text: `Haan! Sabse common exam trap hai negative sign convention bhool jana ya units convert na karna. Agar unit SI standard me nahi rakhi, toh direct number cut ho jate hain.`,
        },
        {
          speaker: "student",
          speakerName: studentName,
          text: `Yeh tip main note kar leta hoon! Ab bilkul clear hai. Thanks a lot Ma'am!`,
        },
        {
          speaker: "mentor",
          speakerName: mentorName,
          text: `Shabash Aarav! Agli class me hum iske live experiments board par solve karenge. Tab tak practice karte raho!`,
        },
      ]
    : [
        {
          speaker: "mentor",
          speakerName: mentorName,
          text: `Hello and welcome back learners! Today, we are exploring "${topic}" in ${grade} ${subject}.`,
        },
        {
          speaker: "student",
          speakerName: studentName,
          text: `Hello Tara Ma'am! I'm really looking forward to understanding the key principles and formulas today.`,
        },
        {
          speaker: "mentor",
          speakerName: mentorName,
          text: `Great! The fundamental takeaway is to understand how the governing equation behaves under boundary conditions.`,
        },
        {
          speaker: "student",
          speakerName: studentName,
          text: `What is the most frequent mistake students make in board examinations for this topic?`,
        },
        {
          speaker: "mentor",
          speakerName: mentorName,
          text: `Missing SI unit conversions and forgetting directional vector arrows on diagrams. Always double check your steps!`,
        },
        {
          speaker: "student",
          speakerName: studentName,
          text: `Understood Ma'am! Thank you for this crystal-clear overview.`,
        },
        {
          speaker: "mentor",
          speakerName: mentorName,
          text: `You're very welcome Aarav. Keep practicing, and see you in the next session!`,
        },
      ];

  return {
    id: `pod_${Date.now()}`,
    title: `${topic} - Audio Masterclass`,
    topic,
    subject,
    grade,
    language: language as any,
    episodeType: episodeType as any,
    durationMinutes: targetDurationMins,
    hosts: { mentorName, studentName },
    segments,
    createdAt: Date.now(),
  };
}
