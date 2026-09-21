/**
 * ExecutiveStudentSnapshot.tsx
 * 1-Glance Executive Overview showing Board Readiness gauge, Top Strength, and Priority Area.
 */
import React from "react";

interface ExecutiveStudentSnapshotProps {
  dashboardStats: any;
  isEnglish: boolean;
}

export const ExecutiveStudentSnapshot: React.FC<ExecutiveStudentSnapshotProps> = ({
  dashboardStats,
  isEnglish
}) => {
  const examReadinessScore = Math.min(
    100,
    Math.max(
      10,
      Math.round(
        dashboardStats.conceptClarity * 0.25 +
          dashboardStats.theoreticalCore * 0.2 +
          dashboardStats.calculationPrecision * 0.25 +
          dashboardStats.formulaRecall * 0.15 +
          dashboardStats.socraticStamina * 0.15
      )
    )
  );

  const topStrength = [
    { name: "Concept Clarity", score: dashboardStats.conceptClarity, icon: "🎯" },
    { name: "Theoretical Core", score: dashboardStats.theoreticalCore, icon: "📖" },
    { name: "Calculations", score: dashboardStats.calculationPrecision, icon: "🧮" },
    { name: "Formula Recall", score: dashboardStats.formulaRecall, icon: "⚡" },
    { name: "Socratic Stamina", score: dashboardStats.socraticStamina, icon: "🔥" },
  ].sort((a, b) => b.score - a.score)[0];

  const priorityFocus = [
    { 
      name: "Concept Clarity", 
      score: dashboardStats.conceptClarity, 
      icon: "🎯", 
      tip: isEnglish ? "Strengthen core concepts with blackboard practice" : "Whiteboard practice से कॉन्सेप्ट मजबूत करें" 
    },
    { 
      name: "Theoretical Core", 
      score: dashboardStats.theoreticalCore, 
      icon: "📖", 
      tip: isEnglish ? "Revise handbook definitions and textbook proofs" : "हैंडबुक डेफिनिशन्स व नोट्स दोहराएं" 
    },
    { 
      name: "Calculations", 
      score: dashboardStats.calculationPrecision, 
      icon: "🧮", 
      tip: isEnglish ? "Verify step-by-step signs, units & arithmetic" : "स्टेप-बाय-स्टेप साइन व यूनिट्स चेक करें" 
    },
    { 
      name: "Formula Recall", 
      score: dashboardStats.formulaRecall, 
      icon: "⚡", 
      tip: isEnglish ? "Do 5-minute daily flashcard spaced repetition" : "स्मार्ट फ़्लैशकार्ड्स से रोज़ 5 मिनट रिवीज़न करें" 
    },
    { 
      name: "Socratic Stamina", 
      score: dashboardStats.socraticStamina, 
      icon: "🔥", 
      tip: isEnglish ? "Attend live lectures & take interactive quizzes" : "लाइव लेक्चर्स व क्विज़ में नियमित भाग लें" 
    },
  ].sort((a, b) => a.score - b.score)[0];

  return (
    <div className="bg-white border border-[#EFF1F5] rounded-2xl p-4 sm:p-5 shadow-xs text-left space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#EFF1F5]">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-indigo-50 text-[#796AEF] border border-indigo-200/60 text-sm">
            📊
          </span>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#1E293B] uppercase tracking-wider font-sans">
              {isEnglish ? "Quick Academic Health Check • Executive Summary" : "Quick Academic Health Check • तैयारी का संक्षिप्त सारांश"}
            </h4>
            <p className="text-[11px] text-[#4A4E5A] font-sans">
              {isEnglish ? "Overall exam readiness status and high-priority focus for today" : "आपकी समग्र तैयारी की स्थिति और आज का सबसे महत्वपूर्ण फ़ोकस"}
            </p>
          </div>
        </div>
      </div>

      {/* 3 Quick Snapshot Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Readiness */}
        <div className="bg-gradient-to-br from-indigo-50/80 to-slate-50 border border-indigo-100 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-indigo-700">
              🎯 Board Readiness
            </span>
            <span className="text-xs font-bold text-[#796AEF]">
              {examReadinessScore}%
            </span>
          </div>
          <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-indigo-100">
            <div
              className="h-full bg-[#796AEF] rounded-full transition-all duration-500"
              style={{ width: `${examReadinessScore}%` }}
            />
          </div>
          <p className="text-[10.5px] text-slate-600 font-medium">
            {examReadinessScore >= 80 
              ? (isEnglish ? "Excellent Pacing • High-Score Track" : "उत्कृष्ट गति • टॉप स्कोर की ओर") 
              : (isEnglish ? "In Progress • Consistent Practice Required" : "प्रगतिशील • निरंतर अभ्यास आवश्यक")}
          </p>
        </div>

        {/* Card 2: Top Strength */}
        <div className="bg-gradient-to-br from-emerald-50/80 to-slate-50 border border-emerald-100 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700">
              {isEnglish ? "🌟 Top Strength" : "🌟 मुख्य ताकत"}
            </span>
            <span className="text-xs font-bold text-emerald-800">
              {topStrength.score}%
            </span>
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-sm">{topStrength.icon}</span>
            <span className="text-xs font-bold text-slate-800 truncate">
              {topStrength.name}
            </span>
          </div>
          <p className="text-[10.5px] text-emerald-800/80 font-medium">
            {isEnglish ? "Strong mastery • High scoring reliability" : "मजबूत पकड़ • परीक्षा में भरोसेमंद अंक"}
          </p>
        </div>

        {/* Card 3: Priority Focus */}
        <div className="bg-gradient-to-br from-amber-50/80 to-slate-50 border border-amber-100 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-800">
              {isEnglish ? "⚠️ Priority Area" : "⚠️ प्राथमिक सुधार"}
            </span>
            <span className="text-xs font-bold text-amber-900">
              {priorityFocus.score}%
            </span>
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-sm">{priorityFocus.icon}</span>
            <span className="text-xs font-bold text-slate-800 truncate">
              {priorityFocus.name}
            </span>
          </div>
          <p className="text-[10.5px] text-amber-900/80 font-medium truncate" title={priorityFocus.tip}>
            {priorityFocus.tip}
          </p>
        </div>
      </div>
    </div>
  );
};
