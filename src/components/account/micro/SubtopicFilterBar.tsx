/**
 * SubtopicFilterBar.tsx
 * Filter bar with Deck/Grid toggles, search input, subject selector pills, and mastery tabs.
 */
import React from "react";
import { Target, Search, X } from "lucide-react";
import { MicroDiagnosticsData } from "./microTypes";

interface SubtopicFilterBarProps {
  microDiagnosticsData: MicroDiagnosticsData;
  microViewMode: "carousel" | "list";
  setMicroViewMode: (mode: "carousel" | "list") => void;
  microSearchQuery: string;
  setMicroSearchQuery: (query: string) => void;
  microSubjectFilter: string;
  setMicroSubjectFilter: (subject: string) => void;
  microMasteryFilter: "all" | "gaps" | "practicing" | "mastered";
  setMicroMasteryFilter: (filter: "all" | "gaps" | "practicing" | "mastered") => void;
}

export const SubtopicFilterBar: React.FC<SubtopicFilterBarProps> = ({
  microDiagnosticsData,
  microViewMode,
  setMicroViewMode,
  microSearchQuery,
  setMicroSearchQuery,
  microSubjectFilter,
  setMicroSubjectFilter,
  microMasteryFilter,
  setMicroMasteryFilter,
}) => {
  return (
    <div className="space-y-3.5">
      {/* Filter Bar with Mobile Carousel/Grid Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-[#796AEF] border border-indigo-100/90 flex items-center justify-center shrink-0 shadow-2xs">
              <Target className="w-3.5 h-3.5 text-[#796AEF]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                  Sub-Topic Competency
                </h4>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/70">
                  {microDiagnosticsData.subtopics.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Diagnostic breakdown with targeted practice drills
              </p>
            </div>
          </div>

          {/* View Mode Toggle for Sub-Topics */}
          <div className="flex items-center bg-slate-100/80 p-0.5 rounded-xl border border-slate-200/80 shrink-0">
            <button
              type="button"
              onClick={() => setMicroViewMode("carousel")}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                microViewMode === "carousel"
                  ? "bg-white text-slate-900 border border-slate-200/80 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Horizontal Swipe Deck"
            >
              Deck
            </button>
            <button
              type="button"
              onClick={() => setMicroViewMode("list")}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                microViewMode === "list"
                  ? "bg-white text-slate-900 border border-slate-200/80 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Grid List"
            >
              Grid
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search topic or chapter..."
            value={microSearchQuery}
            onChange={(e) => setMicroSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50/80 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#796AEF] focus:border-[#796AEF] font-medium transition-all"
          />
          {microSearchQuery && (
            <button
              type="button"
              onClick={() => setMicroSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Subject & Mastery Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
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
              onClick={() => setMicroSubjectFilter(subj)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer shrink-0 border ${
                microSubjectFilter === subj
                  ? "bg-[#796AEF] text-white border-[#796AEF] shadow-2xs"
                  : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {subj === "all" ? "All Subjects" : subj}
            </button>
          ))}
        </div>

        {/* Mastery Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            {
              key: "all",
              label: "All Status",
              count: microDiagnosticsData.allSubtopics.length,
            },
            {
              key: "critical",
              label: "Critical (<60%)",
              count: microDiagnosticsData.criticalGapsCount,
            },
            {
              key: "practicing",
              label: "In Progress (60-84%)",
              count: microDiagnosticsData.practicingCount,
            },
            {
              key: "mastered",
              label: "Mastered (85%+)",
              count: microDiagnosticsData.masteredCount,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() =>
                setMicroMasteryFilter(tab.key as any)
              }
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                microMasteryFilter === tab.key
                  ? "bg-[#796AEF] text-white border-[#796AEF] shadow-2xs"
                  : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-white"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                microMasteryFilter === tab.key
                  ? "bg-white/20 text-white"
                  : "bg-slate-200/80 text-slate-700"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
