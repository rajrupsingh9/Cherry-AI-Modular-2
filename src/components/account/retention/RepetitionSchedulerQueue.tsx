/**
 * RepetitionSchedulerQueue.tsx
 * Spaced Review Queue with subject and urgency filters, mobile swipe deck/grid toggle,
 * retention meters, KaTeX formulas, and active recall action buttons.
 */
import React from "react";
import { Brain, CheckCircle, Hourglass, Sparkles } from "lucide-react";
import { renderKaTeXHtmlSafe } from "../../../utils/whiteboardPdfCompiler";
import {
  RetentionComputedItem,
  RetentionEngineData,
  UrgencyLevel,
} from "./retentionTypes";

interface RepetitionSchedulerQueueProps {
  isEnglish: boolean;
  retentionEngineData: RetentionEngineData;
  retentionViewMode: "carousel" | "list";
  setRetentionViewMode: (mode: "carousel" | "list") => void;
  retentionActiveSubject: string;
  setRetentionActiveSubject: (subject: string) => void;
  retentionFilterUrgency: UrgencyLevel;
  setRetentionFilterUrgency: (urgency: UrgencyLevel) => void;
  onOpenFlashcard: (item: RetentionComputedItem) => void;
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

export const RepetitionSchedulerQueue: React.FC<RepetitionSchedulerQueueProps> = ({
  isEnglish,
  retentionEngineData,
  retentionViewMode,
  setRetentionViewMode,
  retentionActiveSubject,
  setRetentionActiveSubject,
  retentionFilterUrgency,
  setRetentionFilterUrgency,
  onOpenFlashcard,
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
              <Hourglass className="w-3.5 h-3.5 text-[#796AEF]" />
            </span>
            <div>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                {isEnglish
                  ? `Spaced Review Queue (${retentionEngineData.items.length})`
                  : `Spaced Review Queue • दोहराव कतार (${retentionEngineData.items.length})`}
              </h4>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                {isEnglish
                  ? "Reinforce key formulas & definitions before memory fades"
                  : "विस्मृति होने से पहले मुख्य सूत्र व परिभाषाओं को सुदृढ़ करें"}
              </span>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/80 shrink-0">
            <button
              type="button"
              onClick={() => setRetentionViewMode("carousel")}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                retentionViewMode === "carousel"
                  ? "bg-[#796AEF] text-white shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Horizontal Swipe Deck"
            >
              🎴 Deck
            </button>
            <button
              type="button"
              onClick={() => setRetentionViewMode("list")}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                retentionViewMode === "list"
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
              onClick={() => setRetentionActiveSubject(subj)}
              className={`min-h-[44px] sm:min-h-[36px] px-3.5 py-2 rounded-xl text-xs sm:text-[10.5px] font-mono font-bold transition-all cursor-pointer shrink-0 border flex items-center justify-center ${
                retentionActiveSubject === subj
                  ? "bg-[#796AEF] text-white border-[#796AEF] shadow-2xs font-bold"
                  : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {subj === "all" ? (isEnglish ? "🌐 All Subjects" : "🌐 सभी विषय") : subj}
            </button>
          ))}
        </div>
      </div>

      {/* Urgency Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {[
          {
            key: "all",
            label: isEnglish ? "All Topics" : "सभी टॉपिक्स (All)",
            count: retentionEngineData.allItems.length,
          },
          {
            key: "critical",
            label: isEnglish ? "🔴 Due Today (<50%)" : "🔴 आज देय (<50%)",
            count: retentionEngineData.criticalCount,
          },
          {
            key: "warning",
            label: isEnglish ? "🟡 Review Soon (50-72%)" : "🟡 जल्द दोहराएं (50-72%)",
            count: retentionEngineData.warningCount,
          },
          {
            key: "stable",
            label: isEnglish ? "🟢 Stable (73%+)" : "🟢 स्थिर (73%+)",
            count: retentionEngineData.stableCount,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setRetentionFilterUrgency(tab.key as any)}
            className={`min-h-[44px] sm:min-h-[36px] px-3.5 py-2 rounded-xl text-xs sm:text-[10.5px] font-mono font-bold transition-all cursor-pointer shrink-0 border flex items-center justify-center ${
              retentionFilterUrgency === tab.key
                ? "bg-[#796AEF] text-white border-[#796AEF] shadow-2xs font-bold"
                : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-white"
            }`}
          >
            <span>{tab.label}</span>
            <span className="ml-1 text-[10px] opacity-90">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Repetition Queue Cards (Swipe Deck vs Grid) */}
      {retentionEngineData.items.length > 0 ? (
        <>
          {retentionViewMode === "carousel" && (
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 font-semibold px-1 pb-0.5">
              <span>
                {isEnglish
                  ? `← Swipe Repetition Cards (${retentionEngineData.items.length} topics) →`
                  : `← स्वाइप करें दोहराव कार्ड (${retentionEngineData.items.length} topics) →`}
              </span>
              <span>{isEnglish ? "Touch & Drag" : "टच व ड्रैग"}</span>
            </div>
          )}
          <div
            className={
              retentionViewMode === "carousel"
                ? "flex overflow-x-auto gap-3.5 pb-3 pt-0.5 snap-x snap-mandatory scrollbar-thin"
                : "grid grid-cols-1 md:grid-cols-2 gap-3.5"
            }
          >
            {retentionEngineData.items.map((item) => {
              const isCritical = item.urgency === "critical";
              const isStable = item.urgency === "stable";

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 transition-all flex flex-col justify-between space-y-3 relative overflow-hidden bg-white shadow-2xs hover:shadow-xs ${
                    retentionViewMode === "carousel"
                      ? "w-[85vw] sm:w-[360px] shrink-0 snap-center"
                      : ""
                  } ${
                    isCritical
                      ? "border-rose-200/90 hover:border-rose-300"
                      : isStable
                        ? "border-emerald-200/90 hover:border-emerald-300"
                        : "border-amber-200/90 hover:border-amber-300"
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

                      {/* Urgency Badge */}
                      <span
                        className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md border shrink-0 ${
                          isCritical
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : isStable
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {item.urgencyLabel}
                      </span>
                    </div>

                    <h5 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-snug">
                      {item.topicName}
                    </h5>
                  </div>

                  {/* Retention Meter & Spaced Intervals */}
                  <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/70 space-y-1.5">
                    <div className="flex items-center justify-between text-[10.5px] font-mono">
                      <span className="text-slate-500 font-bold">
                        {isEnglish ? "Estimated Retention:" : "अनुमानित याददाश्त:"}
                      </span>
                      <strong
                        className={`font-black ${isCritical ? "text-rose-600" : isStable ? "text-emerald-700" : "text-amber-600"}`}
                      >
                        {item.currentRetention}%
                      </strong>
                    </div>

                    <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isCritical
                            ? "bg-rose-500"
                            : isStable
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                        }`}
                        style={{
                          width: `${item.currentRetention}%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200/60 font-medium">
                      <span>
                        {isEnglish ? "Studied: " : "अध्ययन: "}
                        <strong className="text-slate-700">{item.lastStudiedDaysAgo}d ago</strong>
                      </span>
                      <span>
                        {isEnglish ? "Repetition: " : "दोहराव: "}
                        <strong className="text-slate-700">{item.repetitionCount}/5</strong>
                      </span>
                      <span>
                        {isEnglish ? "Next: " : "अगला: "}
                        <strong className="text-slate-700">Day {item.nextReviewDays}</strong>
                      </span>
                    </div>
                  </div>

                  {/* KaTeX Formula preview if available */}
                  {item.formulaKatex && (
                    <div className="bg-amber-50/60 text-slate-800 p-2.5 rounded-xl border border-amber-200/60 text-[11px] font-mono overflow-x-auto shadow-2xs">
                      <div className="text-[9px] font-mono text-amber-800 font-bold uppercase tracking-widest mb-0.5">
                        ⚡ {isEnglish ? "Core Formula Anchor" : "मुख्य फॉर्मूला सूत्र"}
                      </div>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: renderKaTeXHtmlSafe(item.formulaKatex),
                        }}
                      />
                    </div>
                  )}

                  {/* Key Points Checklist */}
                  <div className="space-y-1 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 text-[11px] text-slate-700">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                      📌 {isEnglish ? "Core Memory Anchors" : "मुख्य स्मृति बिंदु"}
                    </span>
                    {item.keyPoints.slice(0, 2).map((kp, kpIdx) => (
                      <div key={kpIdx} className="flex items-start gap-1.5">
                        <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{kp}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/70">
                    <button
                      type="button"
                      onClick={() => onOpenFlashcard(item)}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50/80 text-slate-700 hover:text-[#796AEF] border border-slate-200/80 hover:border-indigo-200/80 text-[11px] font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                    >
                      <Brain className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{isEnglish ? "Flashcard" : "फ्लैशकार्ड"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onDiscussWithCherry) {
                          onDiscussWithCherry({
                            topic: item.topicName,
                            subject: item.subject,
                            conceptTested: item.topicName,
                            hint: item.flashcardAnswer,
                            question: `Cherry Ma'am, please give me a quick 3-minute spaced-repetition memory booster on ${item.topicName} on the blackboard!`,
                          });
                        } else if (onEnterClassroom) {
                          onEnterClassroom();
                        }
                      }}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-[#796AEF] hover:bg-indigo-700 text-white text-[11px] font-bold tracking-wide font-mono transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      <span>{isEnglish ? "Start Revision 🚀" : "रिवीज़न शुरू 🚀"}</span>
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
            {isEnglish ? "No review topics found for this filter." : "इस फ़िल्टर के लिए कोई रिवीज़न टॉपिक नहीं मिला।"}
          </p>
          <button
            type="button"
            onClick={() => {
              setRetentionActiveSubject("all");
              setRetentionFilterUrgency("all");
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
