/**
 * AgilityTopicQueue.tsx
 * Topic speed agility queue with subject filters, quadrant pills, swipe deck/grid views, and shortcut triggers.
 */
import React from "react";
import { Gauge, Zap } from "lucide-react";
import { AgilityQuadrant, ClassifiedAgilityTopic, StaminaAnalyticsData } from "./agilityTypes";

interface AgilityTopicQueueProps {
  isEnglish: boolean;
  staminaAnalyticsData: StaminaAnalyticsData;
  staminaViewMode: "carousel" | "list";
  setStaminaViewMode: (mode: "carousel" | "list") => void;
  staminaActiveSubject: string;
  setStaminaActiveSubject: (subject: string) => void;
  staminaQuadrantFilter: "all" | AgilityQuadrant;
  setStaminaQuadrantFilter: (filter: "all" | AgilityQuadrant) => void;
  onStartDrill: (item: ClassifiedAgilityTopic) => void;
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

export const AgilityTopicQueue: React.FC<AgilityTopicQueueProps> = ({
  isEnglish,
  staminaAnalyticsData,
  staminaViewMode,
  setStaminaViewMode,
  staminaActiveSubject,
  setStaminaActiveSubject,
  staminaQuadrantFilter,
  setStaminaQuadrantFilter,
  onStartDrill,
  onDiscussWithCherry,
  onEnterClassroom,
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 text-left">
      {/* Filter Bar with Mobile Carousel/Grid Mode Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-slate-200/80">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-[#796AEF] border border-indigo-100/90 flex items-center justify-center shrink-0 shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-[#796AEF]" />
            </span>
            <div>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                {isEnglish
                  ? `Agility Queue • Topic Speed Practice (${staminaAnalyticsData.topics.length})`
                  : `Agility Queue • विषयवार गति व अभ्यास (${staminaAnalyticsData.topics.length})`}
              </h4>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                {isEnglish
                  ? "Learn shortcuts with a 45-second timer and turn hesitation into flow state"
                  : "45-सेकंड टाइमर के साथ शॉर्टकट सीखें और संकोच को फ़्लो स्टेट में बदलें"}
              </span>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/80 shrink-0">
            <button
              type="button"
              onClick={() => setStaminaViewMode("carousel")}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                staminaViewMode === "carousel"
                  ? "bg-[#796AEF] text-white shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Horizontal Swipe Deck"
            >
              🎴 Deck
            </button>
            <button
              type="button"
              onClick={() => setStaminaViewMode("list")}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                staminaViewMode === "list"
                  ? "bg-[#796AEF] text-white shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Grid List"
            >
              📋 Grid
            </button>
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            "all",
            "Mathematics",
            "Physics",
            "Chemistry",
            "Biology",
          ].map((subj) => (
            <button
              key={subj}
              type="button"
              onClick={() => setStaminaActiveSubject(subj)}
              className={`min-h-[44px] sm:min-h-[36px] px-3.5 py-2 rounded-xl text-xs sm:text-[10.5px] font-mono font-bold transition-all cursor-pointer shrink-0 border flex items-center justify-center ${
                staminaActiveSubject === subj
                  ? "bg-[#796AEF] text-white border-[#796AEF] shadow-2xs font-bold"
                  : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {subj === "all" ? (isEnglish ? "🌐 All Subjects" : "🌐 सभी विषय") : subj}
            </button>
          ))}
        </div>
      </div>

      {/* Quadrant Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {[
          {
            key: "all",
            label: isEnglish ? "All" : "सभी (All)",
            count: staminaAnalyticsData.allTopics.length,
          },
          {
            key: "flow",
            label: "⚡ Flow (Q1)",
            count: staminaAnalyticsData.flowCount,
          },
          {
            key: "overthink",
            label: "⏱️ Overthinking (Q2)",
            count: staminaAnalyticsData.overthinkCount,
          },
          {
            key: "rushing",
            label: "⚠️ Rushing (Q3)",
            count: staminaAnalyticsData.rushingCount,
          },
          {
            key: "roadblock",
            label: "🔴 Roadblocks (Q4)",
            count: staminaAnalyticsData.roadblockCount,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStaminaQuadrantFilter(tab.key as any)}
            className={`min-h-[44px] sm:min-h-[36px] px-3.5 py-2 rounded-xl text-xs sm:text-[10.5px] font-mono font-bold transition-all cursor-pointer shrink-0 border flex items-center justify-center ${
              staminaQuadrantFilter === tab.key
                ? "bg-[#796AEF] text-white border-[#796AEF] shadow-2xs font-bold"
                : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-white"
            }`}
          >
            <span>{tab.label}</span>
            <span className="ml-1 text-[10px] opacity-90">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Topics Cards Grid (Swipe Deck vs Grid) */}
      {staminaAnalyticsData.topics.length > 0 ? (
        <>
          {staminaViewMode === "carousel" && (
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 font-semibold px-1 pb-0.5">
              <span>
                {isEnglish
                  ? `← Swipe Practice Topics (${staminaAnalyticsData.topics.length} topics) →`
                  : `← स्वाइप करें अभ्यास टॉपिक्स (${staminaAnalyticsData.topics.length} topics) →`}
              </span>
              <span>{isEnglish ? "Touch & Drag" : "टच व ड्रैग"}</span>
            </div>
          )}
          <div
            className={
              staminaViewMode === "carousel"
                ? "flex overflow-x-auto gap-3.5 pb-3 pt-0.5 snap-x snap-mandatory scrollbar-thin"
                : "grid grid-cols-1 md:grid-cols-2 gap-3.5"
            }
          >
            {staminaAnalyticsData.topics.map((item) => {
              const isOverthink = item.quadrant === "overthink";
              const isRushing = item.quadrant === "rushing";
              const isRoadblock = item.quadrant === "roadblock";

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 transition-all flex flex-col justify-between space-y-3 relative overflow-hidden bg-white shadow-2xs hover:shadow-xs ${
                    staminaViewMode === "carousel"
                      ? "w-[85vw] sm:w-[360px] shrink-0 snap-center"
                      : ""
                  } ${
                    isRoadblock
                      ? "border-rose-200/90 hover:border-rose-300"
                      : isOverthink
                        ? "border-sky-200/90 hover:border-sky-300"
                        : isRushing
                          ? "border-amber-200/90 hover:border-amber-300"
                          : "border-emerald-200/90 hover:border-emerald-300"
                  }`}
                >
                  {/* Header */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/70 shrink-0">
                          {item.subject}
                        </span>
                        <span className="text-[10.5px] font-mono text-slate-500 font-bold truncate">
                          • {item.chapter}
                        </span>
                      </div>

                      {/* Quadrant Badge */}
                      <span
                        className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md border shrink-0 ${item.quadrantColor}`}
                      >
                        {item.quadrantBadge}
                      </span>
                    </div>

                    <h5 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-snug">
                      {item.topicName}
                    </h5>
                  </div>

                  {/* Speed & Accuracy Benchmarks */}
                  <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/70 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono">
                      <div className="bg-white p-2 rounded-lg border border-slate-200/70 shadow-2xs">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">
                          {isEnglish ? "Your Speed:" : "आपकी गति:"}
                        </span>
                        <span className="text-xs font-black text-slate-900">
                          {item.avgLatencySec}s
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium ml-1">
                          ({isEnglish ? "Target" : "लक्ष्य"}: {item.benchmarkSec}s)
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200/70 shadow-2xs">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">
                          {isEnglish ? "Accuracy:" : "सटीकता:"}
                        </span>
                        <span
                          className={`text-xs font-black ${item.accuracy >= 75 ? "text-emerald-700" : "text-rose-700"}`}
                        >
                          {item.accuracy}% Accuracy
                        </span>
                      </div>
                    </div>

                    <div className="text-[10.5px] font-mono text-slate-600 bg-white/80 p-2 rounded-lg border border-slate-200/60 leading-snug">
                      <strong className="text-slate-900">
                        {isEnglish ? "⚡ Speed Strategy:" : "⚡ गति रणनीति:"}
                      </strong>{" "}
                      {item.speedStrategy}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/70">
                    <button
                      type="button"
                      onClick={() => onStartDrill(item)}
                      className="min-h-[44px] px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50/80 text-slate-700 hover:text-[#796AEF] border border-slate-200/80 hover:border-indigo-200/80 text-[11px] font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                    >
                      <Gauge className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{isEnglish ? "Start Drill" : "ड्रिल शुरू"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onDiscussWithCherry) {
                          onDiscussWithCherry({
                            topic: item.topicName,
                            subject: item.subject,
                            conceptTested: item.topicName,
                            hint: item.speedStrategy,
                            question: `Cherry Ma'am, please show me the fastest intuitive shortcut and blackboard derivation for ${item.topicName} so I can solve it in under 30 seconds!`,
                          });
                        } else if (onEnterClassroom) {
                          onEnterClassroom();
                        }
                      }}
                      className="min-h-[44px] px-2.5 py-2 rounded-xl bg-[#796AEF] hover:bg-indigo-700 text-white text-[11px] font-bold tracking-wide font-mono transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5 text-white" />
                      <span>{isEnglish ? "Learn Shortcut 🚀" : "शॉर्टकट सीखें 🚀"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="p-8 text-center bg-slate-50/90 rounded-2xl border border-dashed border-slate-200/80 space-y-2">
          <p className="text-xs text-slate-500 font-medium">
            {isEnglish ? "No topics found for this quadrant." : "इस क्वाड्रेंट के लिए कोई टॉपिक नहीं मिला।"}
          </p>
          <button
            type="button"
            onClick={() => {
              setStaminaActiveSubject("all");
              setStaminaQuadrantFilter("all");
            }}
            className="text-[11px] font-mono font-bold text-[#796AEF] hover:underline cursor-pointer"
          >
            {isEnglish ? "Reset Filters" : "फ़िल्टर रीसेट करें"}
          </button>
        </div>
      )}
    </div>
  );
};
