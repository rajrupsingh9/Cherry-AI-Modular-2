/**
 * QuizCognitiveBreakdown.tsx
 * Cognitive Diagnosis: Categories breakdown, Conceptual Strengths, Growth Areas & Sync Status
 */
import React from "react";
import { BarChart2, Shield, AlertCircle, Sparkles } from "lucide-react";
import { CognitiveCategoryData } from "./quizTypes";
import { auth } from "../../lib/firebase";

interface QuizCognitiveBreakdownProps {
  microCategoryData: CognitiveCategoryData[];
  conceptualStrengths: Array<{ concept: string; category: string }>;
  conceptualGrowthAreas: Array<{ concept: string; category: string; explanation?: string }>;
  isSavingToDb: boolean;
  dbStatus: "idle" | "saved" | "failed";
}

export const QuizCognitiveBreakdown: React.FC<QuizCognitiveBreakdownProps> = ({
  microCategoryData,
  conceptualStrengths,
  conceptualGrowthAreas,
  isSavingToDb,
  dbStatus
}) => {
  return (
    <div className="space-y-4">
      {/* 1. COGNITIVE CATEGORY PERFORMANCE GRID */}
      {microCategoryData.length > 0 && (
        <div className="bg-[#FFFFFF] border border-[#EFF1F5] p-3.5 rounded-2xl shadow-xs space-y-3 text-left">
          <div className="flex items-center gap-1.5 border-b border-[#EFF1F5] pb-2">
            <BarChart2 className="w-4 h-4 text-[#796AEF]" />
            <h6 className="text-[12px] font-sans font-black uppercase tracking-wider text-[#1E293B]">
              Cognitive Diagnosis Breakdown
            </h6>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {microCategoryData.map((data, idx) => {
              const labelMap: Record<string, string> = {
                "Conceptual Application": "Conceptual Mastery",
                "Formula Retention": "Formula Recall",
                "Calculations & Solving": "Numerical Accuracy",
                "Theoretical Core": "Theory & Definitions"
              };
              const displayLabel = labelMap[data.category] || data.category;

              return (
                <div key={idx} className="bg-[#F6F7FB] p-2.5 rounded-xl border border-[#EFF1F5] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#1E293B]">{displayLabel}</span>
                    <span className="font-mono font-black text-[#796AEF]">
                      {data.correct}/{data.total} ({data.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        data.percentage >= 80
                          ? "bg-emerald-500"
                          : data.percentage >= 50
                          ? "bg-[#796AEF]"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. CONCEPTUAL STRENGTHS & GROWTH AREAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        {/* Conceptual Strengths */}
        <div className="bg-[#FFFFFF] border border-emerald-200/80 p-3 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-800 border-b border-emerald-50 pb-1">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-black uppercase tracking-wider">Concept Strengths</span>
          </div>
          {conceptualStrengths.length > 0 ? (
            <ul className="space-y-1.5">
              {conceptualStrengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1 text-[11px] font-medium text-[#4A4E5A] leading-tight">
                  <span className="text-emerald-500 text-[10px] mt-0.5">•</span>
                  <div>
                    <strong className="text-[#1E293B]">{item.concept}</strong>
                    <span className="text-[10px] font-mono text-slate-400 block">Category: {item.category}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[10.5px] text-slate-400 font-medium italic">
              No correct answers logged. Let's do a fast revision with Cherry Ma'am!
            </p>
          )}
        </div>

        {/* Syllabus Review Required */}
        <div className="bg-[#FFFFFF] border border-amber-200/80 p-3 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-amber-800 border-b border-amber-50 pb-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-black uppercase tracking-wider">Syllabus Review Required</span>
          </div>
          {conceptualGrowthAreas.length > 0 ? (
            <ul className="space-y-1.5">
              {conceptualGrowthAreas.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1 text-[11px] font-medium text-[#4A4E5A] leading-tight">
                  <span className="text-amber-500 text-[10px] mt-0.5">•</span>
                  <div>
                    <strong className="text-[#1E293B]">{item.concept}</strong>
                    <span className="text-[10px] font-mono text-slate-400 block">Category: {item.category}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-2 text-emerald-600 text-center space-y-1">
              <Sparkles className="w-5 h-5 text-emerald-500 fill-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase">No growth areas! Full Marks Mastery!</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Persistence Status Bar Indicator */}
      <div className="flex items-center justify-center gap-1.5 py-1.5 bg-[#F6F7FB] border border-[#EFF1F5] rounded-xl">
        <span className={`w-1.5 h-1.5 rounded-full ${dbStatus === "saved" ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
        <span className="text-[10.5px] font-mono text-[#4A4E5A] font-bold uppercase tracking-wider">
          {isSavingToDb 
            ? "Writing Analysis to cloud db..." 
            : dbStatus === "saved" 
            ? (auth.currentUser ? "✓ Automatically Synced with Firestore Classroom Profile" : "✓ Saved to Local guest history successfully")
            : dbStatus === "failed"
            ? "⚠ Sync failed, saved to offline guest cache"
            : "Syncing analysis stats..."}
        </span>
      </div>
    </div>
  );
};
