/**
 * CognitiveQuadrantMatrix.tsx
 * 4-Quadrant Speed vs Accuracy Matrix (Flow State, Overthinking, Impulsive Rushing, Cognitive Roadblock).
 */
import React from "react";
import { Gauge } from "lucide-react";
import { AgilityQuadrant, StaminaAnalyticsData } from "./agilityTypes";

interface CognitiveQuadrantMatrixProps {
  isEnglish: boolean;
  staminaAnalyticsData: StaminaAnalyticsData;
  staminaQuadrantFilter: "all" | AgilityQuadrant;
  setStaminaQuadrantFilter: (filter: "all" | AgilityQuadrant) => void;
}

export const CognitiveQuadrantMatrix: React.FC<CognitiveQuadrantMatrixProps> = ({
  isEnglish,
  staminaAnalyticsData,
  staminaQuadrantFilter,
  setStaminaQuadrantFilter,
}) => {
  const toggleFilter = (q: AgilityQuadrant) => {
    setStaminaQuadrantFilter(staminaQuadrantFilter === q ? "all" : q);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 gap-2">
        <div>
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-[#796AEF] border border-indigo-100/90 flex items-center justify-center shrink-0 text-xs shadow-2xs">
              <Gauge className="w-3.5 h-3.5 text-[#796AEF]" />
            </span>
            <span>
              {isEnglish
                ? "Speed vs Accuracy Matrix • 4-Quadrant Diagnostics"
                : "Speed vs Accuracy Matrix • गति व सटीकता 4-क्वाड्रेंट"}
            </span>
          </h4>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            {isEnglish
              ? "High accuracy paired with disciplined speed is essential for board and competitive exams. Identify where you hesitate or rush."
              : "बोर्ड व प्रतियोगी परीक्षाओं में उच्च सटीकता के साथ उचित गति अनिवार्य है। पहचानें कि आप कहाँ संकोच करते हैं या जल्दबाज़ी।"}
          </p>
        </div>
        <span className="text-[10.5px] font-mono font-bold text-[#796AEF] bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/80 shrink-0 self-start sm:self-auto shadow-2xs">
          {isEnglish ? "🎯 Target: 45s per Question" : "🎯 मानक: 45s प्रति प्रश्न"}
        </span>
      </div>

      {/* Visual 4-Quadrant Layout - Horizontal Swipe Deck on Mobile */}
      <div className="flex items-center justify-between md:hidden text-[11px] font-mono text-slate-500 font-semibold px-1 pb-1">
        <span>{isEnglish ? "← Swipe 4 Quadrants →" : "← स्वाइप करें 4 क्वाड्रेंट →"}</span>
        <span>{isEnglish ? "Tap to Filter" : "टैप करके फ़िल्टर करें"}</span>
      </div>
      <div className="flex md:grid md:grid-cols-2 overflow-x-auto md:overflow-visible gap-3.5 pt-1 pb-2 md:pb-0 snap-x snap-mandatory scrollbar-thin">
        {/* Quadrant 1: Flow State */}
        <div
          onClick={() => toggleFilter("flow")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between w-[85vw] sm:w-[360px] md:w-auto shrink-0 md:shrink snap-center shadow-2xs min-h-[145px] ${
            staminaQuadrantFilter === "flow"
              ? "bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-400/40 shadow-sm"
              : "bg-gradient-to-br from-emerald-50/30 via-white to-white hover:bg-emerald-50/60 border-emerald-200/80"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono text-xs font-black">
                  Q1
                </span>
                <div>
                  <h5 className="text-xs font-black text-emerald-950 tracking-tight">
                    {isEnglish ? "Flow State (Effortless & Confident)" : "Flow State (फ़्लो स्टेट • स्वतः स्फूर्त)"}
                  </h5>
                  <span className="text-[10.5px] font-mono text-emerald-800">
                    {isEnglish ? "Fast (<45s) • High Accuracy (>75%)" : "तेज़ (<45s) • उच्च सटीकता (>75%)"}
                  </span>
                </div>
              </div>
              <span className="text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {staminaAnalyticsData.flowCount} Topics
              </span>
            </div>
            <p className="text-[11.5px] text-zinc-600 leading-relaxed">
              {isEnglish
                ? "Concepts recalled effortlessly with zero hesitation. Solved naturally even under exam-room pressure."
                : "कॉन्सेप्ट्स बिना किसी हिचकिचाहट के याद हैं। परीक्षा के दबाव में भी सहजता से हल होते हैं।"}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-emerald-200/60 flex items-center justify-between text-[10.5px] font-mono font-bold text-emerald-800">
            <span>
              {isEnglish ? "✅ Strategy: Maintain with weekly spaced revision" : "✅ रणनीति: साप्ताहिक रिवीज़न से अभ्यास बनाए रखें"}
            </span>
            <span>
              {staminaQuadrantFilter === "flow"
                ? (isEnglish ? "Active Filter" : "सक्रिय फ़िल्टर")
                : (isEnglish ? "Filter →" : "फ़िल्टर करें →")}
            </span>
          </div>
        </div>

        {/* Quadrant 2: Overthink / Deep Thinker */}
        <div
          onClick={() => toggleFilter("overthink")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between w-[85vw] sm:w-[360px] md:w-auto shrink-0 md:shrink snap-center shadow-2xs min-h-[145px] ${
            staminaQuadrantFilter === "overthink"
              ? "bg-sky-50/90 border-sky-500 ring-2 ring-sky-400/40 shadow-sm"
              : "bg-gradient-to-br from-sky-50/30 via-white to-white hover:bg-sky-50/60 border-sky-200/80"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-sky-100 text-sky-800 font-mono text-xs font-black">
                  Q2
                </span>
                <div>
                  <h5 className="text-xs font-black text-sky-950 tracking-tight">
                    {isEnglish ? "Over-Calculation (Hesitation & Overthinking)" : "Over-Calculation (अति-विचार व संकोच)"}
                  </h5>
                  <span className="text-[10.5px] font-mono text-sky-800">
                    {isEnglish ? "Slow (>45s) • High Accuracy (>75%)" : "धीमा (>45s) • उच्च सटीकता (>75%)"}
                  </span>
                </div>
              </div>
              <span className="text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                {staminaAnalyticsData.overthinkCount} Topics
              </span>
            </div>
            <p className="text-[11.5px] text-zinc-600 leading-relaxed">
              {isEnglish
                ? "Concept is clear, but writing unnecessarily long derivation steps risks running out of time in the exam."
                : "सिद्धांत आता है, लेकिन अनावश्यक लंबे स्टेप्स लिखने के कारण परीक्षा में समय समाप्त होने का जोखिम रहता है।"}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-sky-200/60 flex items-center justify-between text-[10.5px] font-mono font-bold text-sky-800">
            <span>
              {isEnglish ? "⚡ Solution: Practice shortcuts & direct formula recall" : "⚡ समाधान: शॉर्टकट ट्रिक्स व डायरेक्ट फॉर्मूला अभ्यास"}
            </span>
            <span>
              {staminaQuadrantFilter === "overthink"
                ? (isEnglish ? "Active Filter" : "सक्रिय फ़िल्टर")
                : (isEnglish ? "Filter →" : "फ़िल्टर करें →")}
            </span>
          </div>
        </div>

        {/* Quadrant 3: Impulsive Rushing */}
        <div
          onClick={() => toggleFilter("rushing")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between w-[85vw] sm:w-[360px] md:w-auto shrink-0 md:shrink snap-center shadow-2xs min-h-[145px] ${
            staminaQuadrantFilter === "rushing"
              ? "bg-amber-50/90 border-amber-500 ring-2 ring-amber-400/40 shadow-sm"
              : "bg-gradient-to-br from-amber-50/30 via-white to-white hover:bg-amber-50/60 border-amber-200/80"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-100 text-amber-800 font-mono text-xs font-black">
                  Q3
                </span>
                <div>
                  <h5 className="text-xs font-black text-amber-950 tracking-tight">
                    {isEnglish ? "Impulsive Rushing (Silly Mistakes under Speed)" : "Impulsive Rushing (जल्दबाज़ी में सिली मिस्टेक)"}
                  </h5>
                  <span className="text-[10.5px] font-mono text-amber-800">
                    {isEnglish ? "Fast (<45s) • Low Accuracy (<75%)" : "तेज़ (<45s) • कम सटीकता (<75%)"}
                  </span>
                </div>
              </div>
              <span className="text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                {staminaAnalyticsData.rushingCount} Topics
              </span>
            </div>
            <p className="text-[11.5px] text-zinc-600 leading-relaxed">
              {isEnglish
                ? "Picking wrong options in excitement without reading the full question or checking units and signs."
                : "प्रश्न को पूरा पढ़े बिना या मात्रक/चिह्न की जांच किए बिना अति-उत्साह में गलत विकल्प चुन लेना।"}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex items-center justify-between text-[10.5px] font-mono font-bold text-amber-800">
            <span>
              {isEnglish ? "🛑 Solution: 5-second pause & re-check rule" : "🛑 समाधान: 5-सेकंड ठहराव और प्रश्न री-चेक नियम"}
            </span>
            <span>
              {staminaQuadrantFilter === "rushing"
                ? (isEnglish ? "Active Filter" : "सक्रिय फ़िल्टर")
                : (isEnglish ? "Filter →" : "फ़िल्टर करें →")}
            </span>
          </div>
        </div>

        {/* Quadrant 4: Cognitive Roadblock */}
        <div
          onClick={() => toggleFilter("roadblock")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between w-[85vw] sm:w-[360px] md:w-auto shrink-0 md:shrink snap-center shadow-2xs min-h-[145px] ${
            staminaQuadrantFilter === "roadblock"
              ? "bg-rose-50/90 border-rose-500 ring-2 ring-rose-400/40 shadow-sm"
              : "bg-gradient-to-br from-rose-50/30 via-white to-white hover:bg-rose-50/60 border-rose-200/80"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-rose-100 text-rose-800 font-mono text-xs font-black">
                  Q4
                </span>
                <div>
                  <h5 className="text-xs font-black text-rose-950 tracking-tight">
                    {isEnglish ? "Cognitive Roadblock (Fundamental Gap)" : "Cognitive Roadblock (गंभीर रुकावट)"}
                  </h5>
                  <span className="text-[10.5px] font-mono text-rose-800">
                    {isEnglish ? "Slow (>45s) • Low Accuracy (<75%)" : "धीमा (>45s) • कम सटीकता (<75%)"}
                  </span>
                </div>
              </div>
              <span className="text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                {staminaAnalyticsData.roadblockCount} Topics
              </span>
            </div>
            <p className="text-[11.5px] text-zinc-600 leading-relaxed">
              {isEnglish
                ? "Core theory is unclear, leading to high hesitation, confusion, and wrong derivations."
                : "बुनियादी कॉन्सेप्ट स्पष्ट नहीं है जिससे प्रश्न शुरू करने में भी अत्यधिक समय व गलत उत्तर आते हैं।"}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-rose-200/60 flex items-center justify-between text-[10.5px] font-mono font-bold text-rose-800">
            <span>
              {isEnglish ? "💡 Solution: Master core theory with Cherry on blackboard" : "💡 समाधान: मैम के साथ ब्लैकबोर्ड पर मूल कॉन्सेप्ट समझें"}
            </span>
            <span>
              {staminaQuadrantFilter === "roadblock"
                ? (isEnglish ? "Active Filter" : "सक्रिय फ़िल्टर")
                : (isEnglish ? "Filter →" : "फ़िल्टर करें →")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
