/**
 * QuizConfigTopicSelector.tsx
 * Topic cards selector with formulas preview & bulk selection filters
 */
import React from "react";
import { ListChecks, FileText, CheckSquare, Square, Layers } from "lucide-react";
import { ExtractedTopicItem } from "./quizTypes";

interface QuizConfigTopicSelectorProps {
  extractedTopics: ExtractedTopicItem[];
  selectedTopicIndices: number[];
  handleToggleTopic: (idx: number) => void;
  handleSelectAllTopics: () => void;
  handleSelectDiscussedOnly: () => void;
  handleSelectActiveTopicOnly: () => void;
}

export const QuizConfigTopicSelector: React.FC<QuizConfigTopicSelectorProps> = ({
  extractedTopics,
  selectedTopicIndices,
  handleToggleTopic,
  handleSelectAllTopics,
  handleSelectDiscussedOnly,
  handleSelectActiveTopicOnly
}) => {
  return (
    <div className="bg-[#FFFFFF] p-3.5 border border-[#EFF1F5] rounded-2xl shadow-xs space-y-3 text-left">
      {/* Header & Quick Action Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFF1F5] pb-2.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <ListChecks className="w-4 h-4 text-[#796AEF]" />
            <h5 className="text-[12px] font-black uppercase tracking-wider text-[#1E293B]">
              Previously Discussed Topics
            </h5>
          </div>
          <p className="text-[11px] text-[#4A4E5A] font-medium">
            Choose the exact chalkboard topics/derivations to include in this quiz:
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleSelectAllTopics}
            className="px-2.5 py-1 bg-[#F6F7FB] hover:bg-[#EFF1F5] text-[#4A4E5A] border border-[#E2E8F0] text-[10.5px] sm:text-[11px] font-bold rounded-lg transition-all cursor-pointer"
          >
            Select All ({extractedTopics.length})
          </button>
          {extractedTopics.some(t => t.hasBoardNotes) && (
            <button
              type="button"
              onClick={handleSelectDiscussedOnly}
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10.5px] sm:text-[11px] font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1"
            >
              <FileText className="w-2.5 h-2.5" />
              <span>Board Notes Only</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleSelectActiveTopicOnly}
            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[10.5px] sm:text-[11px] font-bold rounded-lg transition-all cursor-pointer"
          >
            Active Only
          </button>
        </div>
      </div>

      {/* Interactive Topic Cards List */}
      <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-0.5">
        {extractedTopics.map((topic) => {
          const isSelected = selectedTopicIndices.includes(topic.index);
          return (
            <div
              key={topic.index}
              onClick={() => handleToggleTopic(topic.index)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left flex flex-col gap-1.5 ${
                isSelected
                  ? "border-[#796AEF] bg-[#796AEF]/5 shadow-2xs"
                  : "border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F6F7FB] opacity-75"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="shrink-0 text-[#796AEF]">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#796AEF]" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                  <span className="text-[12px] font-bold text-[#1E293B] truncate">
                    {topic.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {topic.isCurrent && (
                    <span className="text-[9.5px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                      Live Classroom
                    </span>
                  )}
                  {topic.hasBoardNotes && (
                    <span className="text-[9.5px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                      <FileText className="w-2.5 h-2.5" />
                      <span>Notes</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Mathematical Formulas Preview Chips */}
              {topic.formulas && topic.formulas.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 pl-6">
                  <span className="text-[9.5px] font-mono text-slate-400">Formulas:</span>
                  {topic.formulas.map((f, fIdx) => (
                    <span
                      key={fIdx}
                      className="text-[9.5px] font-mono bg-[#FFFFFF] text-[#796AEF] border border-[#796AEF]/20 px-1.5 py-0.5 rounded-sm shadow-2xs font-semibold truncate max-w-[140px]"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Topics Count Indicator */}
      <div className="flex items-center justify-between pt-1 border-t border-[#EFF1F5] text-[10.5px] font-mono font-bold text-[#4A4E5A]">
        <div className="flex items-center gap-1">
          <Layers className="w-3 h-3 text-[#796AEF]" />
          <span>Active Selection:</span>
        </div>
        <span className="text-[#796AEF] bg-[#796AEF]/10 px-2 py-0.5 rounded-md">
          {selectedTopicIndices.length} of {extractedTopics.length} Topics Selected
        </span>
      </div>
    </div>
  );
};
