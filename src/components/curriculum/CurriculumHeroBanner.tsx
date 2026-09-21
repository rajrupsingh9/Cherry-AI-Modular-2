/**
 * CurriculumHeroBanner.tsx
 * Displays the high-level syllabus coverage radar and 4-metric bento grid.
 */
import React from "react";
import { Compass, Target, Award, AlertTriangle, CheckCircle2 } from "lucide-react";
import { BoardType, ComputedCurriculum } from "./curriculumTypes";

interface CurriculumHeroBannerProps {
  selectedBoard: BoardType;
  selectedGrade: number;
  computedCurriculum: ComputedCurriculum;
  isEng: boolean;
}

export const CurriculumHeroBanner: React.FC<CurriculumHeroBannerProps> = ({
  selectedBoard,
  selectedGrade,
  computedCurriculum,
  isEng
}) => {
  return (
    <div className="bg-white border border-[#EFF1F5] rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-slate-900 shadow-xs relative overflow-hidden space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs bg-indigo-50 text-[#796AEF] font-bold px-3 py-1 rounded-full border border-indigo-200/80 flex items-center gap-1.5 shadow-2xs">
            <Compass className="w-3.5 h-3.5 text-[#796AEF]" />
            {isEng ? "Syllabus Radar" : "Syllabus Radar • पाठ्यक्रम रडार"}
          </span>
          <span className="text-[11px] font-mono text-slate-500 bg-[#F6F7FB] px-2.5 py-1 rounded-md border border-[#EFF1F5]">
            {selectedBoard} • {selectedGrade === 0 ? "All Classes" : `Class ${selectedGrade}`} Blueprint
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
          Syllabus Coverage, Marks Lock & Blindspots
        </h3>
        <p className="text-xs text-slate-500 font-sans mt-0.5 leading-relaxed">
          {isEng
            ? "Track untouched theorems, formulas, and chapters to maximize your board exam score."
            : "बोर्ड परीक्षा में 100% स्कोर के लिए अनछुए प्रमेय, सूत्र और चैप्टर्स ट्रैक करें।"}
        </p>
      </div>

      {/* 4 Metric Bento Cards - Grid 2x2 on Mobile, 4x1 on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
        {/* Syllabus Done */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-left space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
              Syllabus Done
            </span>
            <Target className="w-3.5 h-3.5 text-[#796AEF]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#796AEF] font-mono leading-none">
            {computedCurriculum.overallSyllabusPercent}%
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">
            {isEng ? "Overall Coverage" : "पाठ्यक्रम पूर्ण"}
          </span>
        </div>

        {/* Board Marks */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-left space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700">
              Board Marks
            </span>
            <Award className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-800 font-mono leading-none">
            {computedCurriculum.lockedCurriculumMarks}{" "}
            <span className="text-xs font-normal text-emerald-600">
              / {computedCurriculum.totalCurriculumMarks}
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 font-medium block">
            {isEng ? "Marks Locked" : "सुरक्षित अंक (Locked)"}
          </span>
        </div>

        {/* Blindspots */}
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3 text-left space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-rose-700">
              Blindspots
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700 font-mono leading-none">
            {computedCurriculum.blindspotCount}
          </div>
          <span className="text-[10px] text-rose-600 font-medium block">
            {isEng ? "Untouched Topics" : "छूटे विषय (Un-Touched)"}
          </span>
        </div>

        {/* Mastered */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-left space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-800">
              Mastered
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-800 font-mono leading-none">
            {computedCurriculum.masteredCount}
          </div>
          <span className="text-[10px] text-amber-700 font-medium block">
            {isEng ? "Exam Ready" : "पक्का तैयार (Exam Ready)"}
          </span>
        </div>
      </div>
    </div>
  );
};
