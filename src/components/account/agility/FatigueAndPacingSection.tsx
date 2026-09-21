/**
 * FatigueAndPacingSection.tsx
 * Session Stamina & Cognitive Fatigue curve paired with Predictive Board Exam Score Target Projector.
 */
import React from "react";
import { Activity, Lightbulb, Sparkles, Target } from "lucide-react";
import { StaminaAnalyticsData } from "./agilityTypes";

interface FatigueAndPacingSectionProps {
  isEnglish: boolean;
  subject: string;
  staminaAnalyticsData: StaminaAnalyticsData;
  onDiscussWithCherry?: (topicDetails: {
    topic: string;
    question?: string;
    answer?: string;
    hint?: string;
    conceptTested?: string;
    subject?: string;
  }) => void;
  onEnterClassroom?: () => void;
}

export const FatigueAndPacingSection: React.FC<FatigueAndPacingSectionProps> = ({
  isEnglish,
  subject,
  staminaAnalyticsData,
  onDiscussWithCherry,
  onEnterClassroom,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 text-left">
      {/* Sub-Card 1: Mental Fatigue Degradation Curve (2 Cols) */}
      <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 gap-2">
          <div>
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-[#796AEF] border border-indigo-100/90 flex items-center justify-center shrink-0 text-xs shadow-2xs">
                <Activity className="w-3.5 h-3.5 text-[#796AEF]" />
              </span>
              <span>
                {isEnglish
                  ? "Session Stamina & Fatigue • Cognitive Curve"
                  : "Session Stamina & Fatigue • अध्ययन सहनशक्ति व मानसिक थकान वक्र"}
              </span>
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">
              {isEnglish
                ? "Progression of concentration & precision across a 45-minute study session"
                : "45-मिनट अभ्यास सत्र में आपकी एकाग्रता व सटीकता में आने वाले बदलाव"}
            </span>
          </div>
          <span className="text-[10.5px] font-mono font-bold text-[#796AEF] bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/80 shrink-0 self-start sm:self-auto shadow-2xs">
            {isEnglish ? "🧠 Peak Focus: 25 Minutes" : "🧠 सर्वश्रेष्ठ एकाग्रता: 25 मिनट"}
          </span>
        </div>

        {/* Fatigue Timeline Cards - Horizontal Swipe Rail on Mobile */}
        <div className="flex items-center justify-between sm:hidden text-[11px] font-mono text-slate-500 font-semibold pb-0.5">
          <span>{isEnglish ? "← Swipe 45-Min Timeline →" : "← स्वाइप करें 45-मिनट टाइमलाइन →"}</span>
          <span>{isEnglish ? "4 Phases" : "4 चरण"}</span>
        </div>
        <div className="flex sm:grid sm:grid-cols-2 overflow-x-auto sm:overflow-visible gap-3 pt-0.5 pb-2 sm:pb-0 snap-x snap-mandatory scrollbar-thin">
          {staminaAnalyticsData.sessionFatigueCurve.map((phase, pIdx) => {
            const isZoneOfGenius = pIdx === 1;
            const isDip = pIdx === 3;

            return (
              <div
                key={pIdx}
                className={`p-3.5 rounded-xl border space-y-2 w-[76vw] sm:w-auto shrink-0 sm:shrink snap-center transition-all ${
                  isZoneOfGenius
                    ? "bg-emerald-50/70 border-emerald-300/90 shadow-2xs"
                    : isDip
                      ? "bg-rose-50/70 border-rose-300/90 shadow-2xs"
                      : "bg-slate-50/90 border-slate-200/70"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-slate-900 font-bold">
                    {phase.phase}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      isZoneOfGenius
                        ? "bg-emerald-200/80 text-emerald-900 border border-emerald-300/70"
                        : isDip
                          ? "bg-rose-200/80 text-rose-900 border border-rose-300/70"
                          : "bg-slate-200/80 text-slate-800 border border-slate-300/70"
                    }`}
                  >
                    {phase.status}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] font-mono text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>{isEnglish ? "Accuracy:" : "सटीकता (Accuracy):"}</span>
                    <strong
                      className={
                        phase.accuracy >= 80
                          ? "text-emerald-700 font-bold"
                          : "text-rose-700 font-bold"
                      }
                    >
                      {phase.accuracy}%
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{isEnglish ? "Average Latency:" : "औसत गति (Latency):"}</span>
                    <strong className="text-slate-800">
                      {phase.latencySec}s {isEnglish ? "/ question" : "/ प्रश्न"}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{isEnglish ? "Cognitive Load:" : "मानसिक भार (Load):"}</span>
                    <strong className="text-slate-800">
                      {phase.cognitiveLoad}%
                    </strong>
                  </div>
                </div>

                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isZoneOfGenius
                        ? "bg-emerald-500"
                        : isDip
                          ? "bg-rose-500"
                          : "bg-indigo-500"
                    }`}
                    style={{ width: `${phase.accuracy}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 flex items-start gap-2.5 text-[11.5px] text-amber-900">
          <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>{isEnglish ? "Cherry Ma'am's Advice:" : "परामर्श (Cherry Ma'am's Advice):"}</strong>{" "}
            {isEnglish
              ? "Take a quick 3-minute break after 25 minutes of continuous problem solving. This resets your working memory and prevents late-session silly mistakes."
              : "लगातार 25 मिनट प्रश्न हल करने के बाद 3 मिनट का संक्षेप विश्राम लें। इससे वर्किंग मेमोरी रीसेट होती है और 40वें मिनट में होने वाली गलतियों से बचाव होता है।"}
          </p>
        </div>
      </div>

      {/* Sub-Card 2: Predictive Board Exam Target Projector (1 Col) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 flex flex-col justify-between">
        <div className="space-y-1 pb-3 border-b border-slate-200/80">
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-[#796AEF] border border-indigo-100/90 flex items-center justify-center shrink-0 text-xs shadow-2xs">
              <Target className="w-3.5 h-3.5 text-[#796AEF]" />
            </span>
            <span>
              {isEnglish
                ? "Exam Target Projector • Score Forecast"
                : "Exam Target Projector • परीक्षा स्कोर अनुमान"}
            </span>
          </h4>
          <span className="text-[11px] text-slate-500 font-medium">
            {isEnglish
              ? "Projection based on current speed and precision metrics"
              : "वर्तमान गति व सटीकता के आधार पर प्रक्षेपण"}
          </span>
        </div>

        {/* Projected Big Score Dial */}
        <div className="bg-slate-50/90 p-4 sm:p-5 rounded-xl text-center text-slate-900 border border-slate-200/70 space-y-1.5 shadow-2xs">
          <span className="text-[10px] uppercase tracking-widest text-[#796AEF] font-bold block">
            {isEnglish
              ? "Projected Exam Score • Projected Mastery"
              : "अनुमानित परीक्षा स्कोर • Projected Mastery"}
          </span>
          <div className="text-3xl sm:text-4xl font-black text-[#796AEF] font-mono tracking-tight">
            {staminaAnalyticsData.projectedRawScore}%
          </div>
          <span className="text-[11px] font-mono text-slate-600 block">
            {isEnglish ? "Confidence Interval: " : "विश्वास दायरा: "}
            <strong className="text-slate-900 font-bold">
              {staminaAnalyticsData.projectedRawScore - staminaAnalyticsData.confidenceMargin}% –{" "}
              {staminaAnalyticsData.projectedRawScore + staminaAnalyticsData.confidenceMargin}%
            </strong>
          </span>
        </div>

        {/* Time Allocation Breakdown */}
        <div className="space-y-2 text-[11px] font-mono">
          <span className="text-slate-600 font-bold uppercase tracking-wider text-[10px] block">
            {isEnglish
              ? "Optimal 3-Hour Board Paper Time Allocation:"
              : "3-घंटे के बोर्ड पेपर का आदर्श समय विभाजन:"}
          </span>
          <div className="space-y-1 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/70">
            <div className="flex items-center justify-between text-slate-700">
              <span>{isEnglish ? "Section A (MCQ / Quick):" : "खण्ड अ (MCQ / त्वरित प्रश्न):"}</span>
              <strong className="text-slate-900">{isEnglish ? "35 mins (1.5m / Q)" : "35 मिनट (1.5m / Q)"}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span>{isEnglish ? "Section B (Short Answer):" : "खण्ड ब (लघु उत्तरीय प्रश्न):"}</span>
              <strong className="text-slate-900">{isEnglish ? "55 mins (3.5m / Q)" : "55 मिनट (3.5m / Q)"}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span>{isEnglish ? "Section C (Long Derivations):" : "खण्ड स (दीर्घ उत्तरीय प्रश्न):"}</span>
              <strong className="text-slate-900">{isEnglish ? "60 mins (7.5m / Q)" : "60 मिनट (7.5m / Q)"}</strong>
            </div>
            <div className="flex items-center justify-between text-emerald-800 font-bold border-t border-slate-200/70 pt-1">
              <span>{isEnglish ? "Review & Buffer (Safety Reserve):" : "पुनरीक्षण व जांच (Buffer Reserve):"}</span>
              <strong>{isEnglish ? "30 mins (Buffer Safety)" : "30 मिनट (स्वर्णिम सुरक्षा)"}</strong>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onDiscussWithCherry) {
              onDiscussWithCherry({
                topic: "Exam Time Management & Speed-Accuracy Optimization",
                subject: subject || "Mathematics",
                conceptTested: "Exam Pacing Strategy",
                hint: "Learn 3-pass exam scanning: solve easy flow questions first, then overthink items, leaving roadblocks for last.",
                question:
                  "Cherry Ma'am, how should I manage my time and pacing during the final board exam to avoid silly mistakes and rushing?",
              });
            } else if (onEnterClassroom) {
              onEnterClassroom();
            }
          }}
          className="min-h-[44px] w-full py-2.5 px-3 rounded-xl bg-[#796AEF] hover:bg-indigo-700 text-white text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{isEnglish ? "Discuss Exam Strategy with Cherry 🚀" : "परीक्षा रणनीति मैम से समझें 🚀"}</span>
        </button>
      </div>
    </div>
  );
};
