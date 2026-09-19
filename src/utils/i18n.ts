/**
 * Multilingual & Hinglish Internationalization (i18n) Engine
 */

export interface Translations {
  [key: string]: string;
}

const baseEnglish: Translations = {
  startClass: "Start Class",
  connecting: "Connecting...",
  navSyllabus: "Syllabus",
  navClassroom: "Classroom",
  navBattle: "Battle",
  navLab: "Lab",
  navAccount: "Account",
  walkthrough1Title: "1-on-1 Socratic AI Teacher",
  walkthrough1Subtitle: "Interactive live voice chalkboard learning tailored to your pace",
  walkthrough2Title: "Interactive STEM Virtual Lab",
  walkthrough2Subtitle: "Simulate physics, chemistry, and biology experiments in real-time",
  walkthrough3Title: "10-Year PYQ Exam Radar",
  walkthrough3Subtitle: "80/20 frequency analysis, weightage heatmaps, and predicted papers",
  phaseIntro: "Introduction",
  phaseConcept: "Concept",
  phaseExample: "Example",
  phaseDoubt: "Doubt Solving",
  phaseTransition: "Next Topic",
  quickDoubt: "Quick Doubt",
  askDoubtTitle: "Ask a Doubt",
  askDoubtSubtitle: "Speak or type your question for instant explanation",
  closeBtn: "Close",
  doubtSentTitle: "Doubt Sent!",
  doubtSentSubtitle: "Cherry Ma'am is synthesizing your answer on the chalkboard",
  quickSuggestions: "Quick Questions",
  doubtPlaceholder: "Type your doubt here...",
  sendBtn: "Send",
  pressEnterToSend: "Press Enter to Send",
  nonInterruptingVoice: "Voice synthesis active",
  createProfileTitle: "Create Your Student Profile",
  enrollmentSubtitle: "Set up your personalized academic journey",
  studentNameLabel: "Student Name",
  pickAvatar: "Pick Avatar",
  namePlaceholder: "Enter your full name",
  targetClassLabel: "Class / Grade",
  eduBoardLabel: "Board",
  languageLabel: "Learning Language",
  trustBadge: "Secured by Google Auth & Official UPI 2.0 Integration",
  enterNamePrompt: "Please enter your valid name.",
};

const baseHinglish: Translations = {
  ...baseEnglish,
  startClass: "Class Shuru Karein",
  connecting: "Connect Ho Raha Hai...",
  navSyllabus: "Syllabus",
  navClassroom: "Classroom",
  navBattle: "Battle",
  navLab: "Lab",
  navAccount: "Profile",
  walkthrough1Title: "1-on-1 Socratic AI Teacher",
  walkthrough1Subtitle: "Live voice aur interactive board ke saath padhein",
  walkthrough2Title: "Interactive STEM Virtual Lab",
  walkthrough2Subtitle: "Physics aur chemistry simulations live explore karein",
  walkthrough3Title: "10-Year PYQ Exam Radar",
  walkthrough3Subtitle: "80/20 high-frequency topics aur predicted papers",
  phaseIntro: "Shuruat",
  phaseConcept: "Concept Notes",
  phaseExample: "Example & Traps",
  phaseDoubt: "Doubt Session",
  phaseTransition: "Agla Topic",
  quickDoubt: "Doubt Poochein",
  askDoubtTitle: "Doubt Poochein",
  askDoubtSubtitle: "Cherry Ma'am se live clear karein",
  closeBtn: "Band Karein",
  doubtSentTitle: "Doubt Bhej Diya!",
  doubtSentSubtitle: "Cherry Ma'am board par explain kar rahi hain",
  quickSuggestions: "Suggestions",
  doubtPlaceholder: "Apna doubt yahan likhein...",
  sendBtn: "Bhejein",
  pressEnterToSend: "Enter dabayein bhejne ke liye",
  nonInterruptingVoice: "Voice live hai",
  createProfileTitle: "Student Profile Banayein",
  enrollmentSubtitle: "Apni study details set karein",
  studentNameLabel: "Aapka Naam",
  pickAvatar: "Avatar Chunein",
  namePlaceholder: "Apna pura naam likhein",
  targetClassLabel: "Class / Grade",
  eduBoardLabel: "Board",
  languageLabel: "Bhasha",
  trustBadge: "Google Auth aur Safe UPI ke dwara surakshit",
  enterNamePrompt: "Kripya apna sahi naam darj karein.",
};

export function getTranslations(lang: string = "Hinglish"): Record<string, string> {
  const isHinglish = !lang || lang.toLowerCase().includes("hing") || lang.toLowerCase().includes("hin");
  const base = isHinglish ? baseHinglish : baseEnglish;

  // Wrap in a Proxy so missing keys don't return undefined and crash UI
  return new Proxy(base, {
    get(target, prop: string) {
      if (prop in target) {
        return target[prop];
      }
      // Return humanized string representation of key as fallback
      return String(prop)
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
    },
  });
}
