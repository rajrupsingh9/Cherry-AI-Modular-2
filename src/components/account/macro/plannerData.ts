/**
 * plannerData.ts
 * Default 7-day personalized study and revision syllabus tasks data.
 */

export interface PlannerTask {
  id: string;
  label: string;
}

export interface PlannerDay {
  day: string;
  title: string;
  icon: string;
  theme: string;
  focus: string;
  tasks: PlannerTask[];
}

export function getStudyDaysPlan(subject: string): PlannerDay[] {
  return [
    {
      day: "Monday",
      title: "Core Theory & Definitions",
      icon: "📖",
      theme: "Theoretical Foundations",
      focus: "Deep definition memorization & theorem statements",
      tasks: [
        {
          id: "mon-1",
          label: `Review 5 key theorems for ${subject || "Mathematics"} from Chapter Books`,
        },
        {
          id: "mon-2",
          label: "Practice 1 foundational conceptual derivation",
        },
        {
          id: "mon-3",
          label: "Take 1 quick 5-question baseline quiz",
        },
      ],
    },
    {
      day: "Tuesday",
      title: "Formula & Identity Sprint",
      icon: "⚡",
      theme: "Formula Recall Acceleration",
      focus: "Instant flashcard recall without looking at answer keys",
      tasks: [
        {
          id: "tue-1",
          label: "Run through 15 flashcards in Speed Mode",
        },
        {
          id: "tue-2",
          label: "Derive key identity equations on scratchpad",
        },
        {
          id: "tue-3",
          label: "Bookmark tricky formulas into personal notebook",
        },
      ],
    },
    {
      day: "Wednesday",
      title: "Numerical & Precision Drills",
      icon: "🧮",
      theme: "Calculation Accuracy",
      focus: "Step-by-step arithmetic without sign or rounding errors",
      tasks: [
        {
          id: "wed-1",
          label: "Solve 3 multi-step calculation problems",
        },
        {
          id: "wed-2",
          label: "Verify unit conversions and final decimal precision",
        },
        {
          id: "wed-3",
          label: "Check working steps against blackboard notes",
        },
      ],
    },
    {
      day: "Thursday",
      title: "Blindspot & Error Eradication",
      icon: "🔍",
      theme: "Targeted Weak-Zone Remediation",
      focus: "Re-attempt previously missed questions until 100% clear",
      tasks: [
        {
          id: "thu-1",
          label: "Re-take 1 quiz with previous mistakes",
        },
        {
          id: "thu-2",
          label: "Ask Cherry Ma'am during live lecture for doubts",
        },
        {
          id: "thu-3",
          label: "Summarize 1 tricky concept in own words",
        },
      ],
    },
    {
      day: "Friday",
      title: "Socratic Speed & Rapid Fire",
      icon: "🔥",
      theme: "Cognitive Agility & Pace",
      focus: "Solve questions under 60-second exam countdown pressure",
      tasks: [
        {
          id: "fri-1",
          label: "Complete 1 Speed Sprint test in under 5 minutes",
        },
        {
          id: "fri-2",
          label: "Eliminate wrong MCQ options using mental shortcuts",
        },
        {
          id: "fri-3",
          label: "Log timing benchmarks on Agility radar",
        },
      ],
    },
    {
      day: "Saturday",
      title: "Comprehensive Mock Sitting",
      icon: "🎯",
      theme: "Full Syllabus Integration",
      focus: "Simulated board exam condition with mixed chapter questions",
      tasks: [
        {
          id: "sat-1",
          label: "Take complete 15-question mixed chapter exam",
        },
        {
          id: "sat-2",
          label: "Analyze Cognitive Radar shifts post-test",
        },
        {
          id: "sat-3",
          label: "Export/Print updated Performance Report Card",
        },
      ],
    },
    {
      day: "Sunday",
      title: "Consolidation & Strategy Reset",
      icon: "🧘",
      theme: "Reflection & Next Week Planning",
      focus: "Relax, review overall progress, and sync with Kiara AI counselor",
      tasks: [
        {
          id: "sun-1",
          label: "Review weekly accuracy gains and earned badges",
        },
        {
          id: "sun-2",
          label: "Discuss study mindset & exam pacing with Kiara AI",
        },
        {
          id: "sun-3",
          label: "Prepare chapter goals for the upcoming week",
        },
      ],
    },
  ];
}
