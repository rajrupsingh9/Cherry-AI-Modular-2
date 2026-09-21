/**
 * CurriculumFiltersBar.tsx
 * Search bar, board picker, grade switcher, subject pills, and status filters.
 */
import React from "react";
import { Search } from "lucide-react";
import { BoardType, StatusFilterType, ComputedCurriculum } from "./curriculumTypes";

interface CurriculumFiltersBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedBoard: BoardType;
  setSelectedBoard: (board: BoardType) => void;
  selectedGrade: number;
  setSelectedGrade: (grade: number) => void;
  selectedSubject: string;
  setSelectedSubject: (subj: string) => void;
  selectedStatusFilter: StatusFilterType;
  setSelectedStatusFilter: (status: StatusFilterType) => void;
  computedCurriculum: ComputedCurriculum;
  isEng: boolean;
}

const BOARDS: BoardType[] = ["CBSE", "ICSE", "State Board", "NEET", "JEE"];

export const CurriculumFiltersBar: React.FC<CurriculumFiltersBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedBoard,
  setSelectedBoard,
  selectedGrade,
  setSelectedGrade,
  selectedSubject,
  setSelectedSubject,
  selectedStatusFilter,
  setSelectedStatusFilter,
  computedCurriculum,
  isEng
}) => {
  const gradeOptions = [
    { label: isEng ? "Class 10" : "Class 10 (कक्षा 10)", grade: 10 },
    { label: isEng ? "Class 11" : "Class 11 (कक्षा 11)", grade: 11 },
    { label: isEng ? "Class 12" : "Class 12 (कक्षा 12)", grade: 12 },
    { label: isEng ? "All Classes" : "All (सभी)", grade: 0 }
  ];

  const subjectOptions = [
    { id: "all", label: "🌐 All Subjects" },
    { id: "Mathematics", label: isEng ? "📐 Mathematics" : "📐 गणित (Maths)" },
    { id: "Physics", label: isEng ? "⚡ Physics" : "⚡ भौतिकी (Physics)" },
    { id: "Chemistry", label: isEng ? "🧪 Chemistry" : "🧪 रसायन (Chemistry)" },
    { id: "Biology", label: isEng ? "🧬 Biology" : "🧬 जीव विज्ञान (Bio)" }
  ];

  const statusTabs = [
    { key: "all" as const, label: isEng ? "All" : "All • सभी", count: computedCurriculum.totalSubtopicsCount },
    { key: "blindspot" as const, label: isEng ? "Blindspots" : "Blindspots • छूटे हुए", count: computedCurriculum.blindspotCount },
    { key: "review" as const, label: isEng ? "In-Progress" : "In-Progress • प्रगति पर", count: computedCurriculum.inProgressCount },
    { key: "mastered" as const, label: isEng ? "Mastered" : "Mastered • सिद्ध", count: computedCurriculum.masteredCount }
  ];

  return (
    <div className="bg-white border border-[#EFF1F5] rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-xs space-y-3.5 text-left">
      {/* Search Box */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            isEng
              ? "Search topics, theorems, or formulas..."
              : "विषय, प्रमेय या फ़ॉर्मूला खोजें (Search topics, formulas)..."
          }
          className="w-full min-h-[42px] pl-10 pr-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#796AEF]/30 focus:border-[#796AEF] text-slate-900 font-medium placeholder:text-slate-400"
        />
      </div>

      {/* Board and Grade selectors */}
      <div className="space-y-2">
        {/* Board Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10.5px] font-bold text-slate-400 shrink-0 uppercase tracking-wider mr-1">
            Board:
          </span>
          {BOARDS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setSelectedBoard(b)}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                selectedBoard === b
                  ? "bg-[#796AEF] text-white border-[#796AEF] shadow-2xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Grade Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10.5px] font-bold text-slate-400 shrink-0 uppercase tracking-wider mr-1">
            Class:
          </span>
          {gradeOptions.map((g) => (
            <button
              key={g.grade}
              type="button"
              onClick={() => setSelectedGrade(g.grade)}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                selectedGrade === g.grade
                  ? "bg-[#796AEF] text-white border-[#796AEF] shadow-2xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
        {subjectOptions.map((subj) => (
          <button
            key={subj.id}
            type="button"
            onClick={() => setSelectedSubject(subj.id)}
            className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border flex items-center justify-center ${
              selectedSubject === subj.id
                ? "bg-[#796AEF] text-white border-[#796AEF] shadow-2xs"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {subj.label}
          </button>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSelectedStatusFilter(tab.key)}
            className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap border ${
              selectedStatusFilter === tab.key
                ? "bg-[#1E293B] text-white border-[#1E293B] shadow-2xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span>{tab.label}</span>
            <span className="ml-1.5 opacity-80 font-mono">({tab.count})</span>
          </button>
        ))}
      </div>
    </div>
  );
};
