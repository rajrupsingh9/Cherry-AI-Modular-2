/**
 * SprintBoosterDayDetail.tsx
 * Active booster day detail card: Key focus topics, 15-min budget breakdown,
 * 10-second golden trick, diagnostic trap, and live chalkboard practice action.
 */
import React from "react";
import { Check, Sparkles, Target, Clock, Zap, ShieldAlert } from "lucide-react";
import { SevenDayBoosterDay } from "./sprintTypes";

interface SprintBoosterDayDetailProps {
  isEng: boolean;
  activeBoosterDay: SevenDayBoosterDay;
  completedBoosterDays: number[];
  toggleBoosterDayComplete: (dayNum: number) => void;
  onDiscussWithCherry?: (params: {
    topic: string;
    subject: string;
    conceptTested?: string;
    hint?: string;
    question?: string;
  }) => void;
  onEnterClassroom?: () => void;
}

export const SprintBoosterDayDetail: React.FC<SprintBoosterDayDetailProps> = ({
  isEng,
  activeBoosterDay,
  completedBoosterDays,
  toggleBoosterDayComplete,
  onDiscussWithCherry,
  onEnterClassroom
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6 text-left">
      {/* Active Day Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded-md">
              Day {activeBoosterDay.dayNumber} of 7 • {activeBoosterDay.subject}
            </span>
            <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md">
              🎯 +{activeBoosterDay.targetMarks} {isEng ? "Board Marks Target" : "बोर्ड अंक वृद्धि"}
            </span>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
              ⏱️ {isEng ? `Daily Time: ${activeBoosterDay.minutesBudget} mins` : `दैनिक समय: ${activeBoosterDay.minutesBudget} मिनट`}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-900">
            {isEng ? activeBoosterDay.title : `${activeBoosterDay.hindiTitle} (${activeBoosterDay.title})`}
          </h3>
        </div>

        {/* Complete & Practice Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => toggleBoosterDayComplete(activeBoosterDay.dayNumber)}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              completedBoosterDays.includes(activeBoosterDay.dayNumber)
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
            }`}
          >
            <Check className="w-4 h-4" />
            <span>
              {completedBoosterDays.includes(activeBoosterDay.dayNumber)
                ? isEng
                  ? "Day Completed ✓"
                  : "दिन पूर्ण चिह्नित ✓"
                : isEng
                ? "Mark as Done"
                : "पूर्ण चिह्नित करें"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onDiscussWithCherry) {
                onDiscussWithCherry({
                  topic: activeBoosterDay.title,
                  subject: activeBoosterDay.subject,
                  conceptTested: activeBoosterDay.title,
                  hint:
                    !isEng && activeBoosterDay.hindiHighYieldTrick
                      ? activeBoosterDay.hindiHighYieldTrick
                      : activeBoosterDay.highYieldTrick,
                  question: activeBoosterDay.classroomPrompt
                });
              } else if (onEnterClassroom) {
                onEnterClassroom();
              }
            }}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-[#796AEF] hover:bg-indigo-700 text-white text-xs font-black uppercase font-mono tracking-wider transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>
              {isEng
                ? `Sprint Day ${activeBoosterDay.dayNumber} with Cherry 🚀`
                : `मैम के साथ डे ${activeBoosterDay.dayNumber} स्प्रिंट करें 🚀`}
            </span>
          </button>
        </div>
      </div>

      {/* High-Yield Topics & Micro-Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Key Focus Sub-Topics */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-[#796AEF]" />
            {isEng ? "Today's High-Yield Core Focus:" : "आज के मुख्य उच्च-भार वाले विषय (Core Focus):"}
          </span>
          <ul className="space-y-2 text-xs text-slate-700 font-medium">
            {activeBoosterDay.keyTopics.map((topic, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-100 text-[#796AEF] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900">
                    {!isEng && activeBoosterDay.hindiKeyTopics?.[idx]
                      ? activeBoosterDay.hindiKeyTopics[idx]
                      : topic}
                  </span>
                  {!isEng && activeBoosterDay.hindiKeyTopics?.[idx] && (
                    <p className="text-[10.5px] text-slate-500 font-mono">{topic}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: 15-Minute Daily Schedule */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            {isEng ? "15-Minute Time Budget Breakdown:" : "15 मिनट का सटीक टाइम-बजट (15-Min Breakdown):"}
          </span>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
              <span className="font-bold text-slate-800">
                {isEng ? "1. Rapid Formula & Law Recall" : "1. सूत्र व नियम त्वरित स्मरण (Recall)"}
              </span>
              <span className="font-mono text-amber-700 font-bold">{isEng ? "5 mins" : "5 मिनट"}</span>
            </div>
            <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
              <span className="font-bold text-slate-800">
                {isEng ? "2. 3 Rapid Board Questions Practice" : "2. 3 रैपिड बोर्ड प्रश्नों का अभ्यास"}
              </span>
              <span className="font-mono text-[#796AEF] font-bold">{isEng ? "6 mins" : "6 मिनट"}</span>
            </div>
            <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
              <span className="font-bold text-slate-800">
                {isEng ? "3. Chalkboard Doubt Clearing with Cherry" : "3. चेरी मैम के साथ संशय निवारण"}
              </span>
              <span className="font-mono text-emerald-700 font-bold">{isEng ? "4 mins" : "4 मिनट"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 10-Second Golden Trick Callout */}
      <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-300/80 rounded-2xl space-y-1.5 text-left">
        <span className="text-xs font-mono font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-700" />
          {isEng
            ? `⚡ Day ${activeBoosterDay.dayNumber} 10-Second Golden Trick (Exam-Winning Shortcut):`
            : `⚡ डे ${activeBoosterDay.dayNumber} की 10-सेकंड गोल्डन ट्रिक (Exam-Winning Shortcut):`}
        </span>
        <p className="text-xs sm:text-sm text-amber-950 font-bold leading-relaxed">
          {!isEng && activeBoosterDay.hindiHighYieldTrick
            ? activeBoosterDay.hindiHighYieldTrick
            : activeBoosterDay.highYieldTrick}
        </p>
        {!isEng && activeBoosterDay.hindiHighYieldTrick && (
          <p className="text-[11px] text-amber-900 font-medium font-sans">EN: {activeBoosterDay.highYieldTrick}</p>
        )}
      </div>

      {/* Common Diagnostic Trap */}
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1.5 text-left">
        <span className="text-xs font-mono font-black uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-rose-700" />
          {isEng
            ? "🚨 Common Board Exam Trap (Where 80% lose marks):"
            : "🚨 सामान्य बोर्ड परीक्षा ट्रैप (Where 80% lose marks):"}
        </span>
        <p className="text-xs sm:text-sm text-rose-900 font-medium leading-relaxed">
          {!isEng && activeBoosterDay.hindiDiagnosticTrap
            ? activeBoosterDay.hindiDiagnosticTrap
            : activeBoosterDay.diagnosticTrap}
        </p>
        {!isEng && activeBoosterDay.hindiDiagnosticTrap && (
          <p className="text-[11px] text-rose-800 font-medium font-sans">EN: {activeBoosterDay.diagnosticTrap}</p>
        )}
      </div>

      {/* Daily Practice Challenge Box */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2 text-left">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#796AEF]" />
          {isEng
            ? `Day ${activeBoosterDay.dayNumber} Rapid Drill Challenge:`
            : `डे ${activeBoosterDay.dayNumber} का रैपिड ड्रिल चैलेंज:`}
        </span>
        <p className="text-xs sm:text-sm text-slate-800 font-bold leading-relaxed">
          {activeBoosterDay.drillQuestion}
        </p>
      </div>
    </div>
  );
};
