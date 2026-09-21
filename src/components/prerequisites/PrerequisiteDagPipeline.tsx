/**
 * PrerequisiteDagPipeline.tsx
 * Visual Directed Acyclic Graph (DAG) Pipeline displaying multi-year root cause nodes,
 * KaTeX formula rendering, common traps, and digital chalkboard launch triggers.
 */
import React from "react";
import { GitFork, Sparkles, AlertTriangle, CheckCircle2, CircleDashed, ShieldAlert } from "lucide-react";
import katex from "katex";
import { DiagnosedChain, PrerequisiteNode } from "./prerequisiteTypes";

interface PrerequisiteDagPipelineProps {
  activeChain: DiagnosedChain;
  isEng: boolean;
  onSelectNode: (node: PrerequisiteNode) => void;
  onDiscussWithCherry?: (params: {
    topic: string;
    subject: string;
    conceptTested?: string;
    hint?: string;
    question?: string;
  }) => void;
  onEnterClassroom?: () => void;
}

export const PrerequisiteDagPipeline: React.FC<PrerequisiteDagPipelineProps> = ({
  activeChain,
  isEng,
  onSelectNode,
  onDiscussWithCherry,
  onEnterClassroom
}) => {
  // Helper to render math formulas safely
  const renderFormula = (formula?: string) => {
    if (!formula) return null;
    try {
      return (
        <span
          dangerouslySetInnerHTML={{
            __html: katex.renderToString(formula, { displayMode: false, throwOnError: false })
          }}
        />
      );
    } catch {
      return <span>{formula}</span>;
    }
  };

  const handleLaunchRootRepair = () => {
    const rootNode = activeChain.rootCauseNode;
    if (onDiscussWithCherry) {
      onDiscussWithCherry({
        topic: rootNode.title,
        subject: activeChain.subject,
        conceptTested: rootNode.title,
        hint: (!isEng && rootNode.hindiCommonTrap) ? rootNode.hindiCommonTrap : rootNode.commonTrap,
        question: `Cherry Ma'am, let's fix my prerequisite foundation gap in "${rootNode.title}" (Class ${rootNode.gradeLevel}) so I can master "${activeChain.targetConcept}" on the chalkboard!`
      });
    } else if (onEnterClassroom) {
      onEnterClassroom();
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6 text-left">
      {/* Header for Active Chain */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 rounded-md">
              {activeChain.subject} • Class {activeChain.grade}
            </span>
            <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-md">
              {isEng ? `Chapter: ${activeChain.chapterName}` : `अध्याय: ${activeChain.hindiChapterName || activeChain.chapterName}`}
            </span>
            <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
              🚨 {activeChain.boardMarksAtRisk} {isEng ? "Board Exam Marks" : "बोर्ड परीक्षा अंक"}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            {isEng
              ? `Target Concept: ${activeChain.targetConcept}`
              : `लक्ष्य विषय (Target Concept): ${activeChain.hindiTargetConcept ? `${activeChain.hindiTargetConcept} (${activeChain.targetConcept})` : activeChain.targetConcept}`}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            {(isEng ? activeChain.summaryDiagnosis : activeChain.hindiSummaryDiagnosis) || activeChain.summaryDiagnosis}
          </p>
        </div>

        {/* Quick Repair Sprint Button */}
        <button
          type="button"
          onClick={handleLaunchRootRepair}
          className="min-h-[44px] w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#796AEF] hover:bg-indigo-700 text-white text-xs font-black uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs shrink-0 cursor-pointer active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>{isEng ? "Fix Prerequisite Gap on Chalkboard 🚀" : "ब्लैकबोर्ड पर बुनियादी कमी दूर करें 🚀"}</span>
        </button>
      </div>

      {/* Interactive Visual DAG Pipeline: Tier 1 -> Tier 2 -> Tier 3 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-600">
          <span className="font-bold flex items-center gap-1.5 text-slate-900">
            <GitFork className="w-4 h-4 text-[#796AEF]" />
            {isEng ? "Upstream Dependency Pipeline (Multi-Year Root Cause):" : "चरणबद्ध प्रिरिक्विज़िट निर्भरता (Upstream Dependency Pipeline):"}
          </span>
          <span className="text-[10px] text-slate-400">
            {isEng ? "Tap any card to view detailed formula & exam trap" : "विस्तृत ट्रैप व सूत्र देखने हेतु किसी भी कार्ड पर टैप करें"}
          </span>
        </div>

        <div className="flex lg:grid lg:grid-cols-3 overflow-x-auto lg:overflow-visible gap-4 relative pb-2 lg:pb-0 snap-x snap-mandatory scrollbar-thin">
          {activeChain.nodes.map((node, index) => {
            const isRoot = node.type === "root_foundation";
            const isBridge = node.type === "bridge_concept";
            const isBroken = node.diagnosedStatus === "broken";
            const isSolid = node.diagnosedStatus === "solid";

            return (
              <div
                key={node.id}
                onClick={() => onSelectNode(node)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3.5 relative group w-[85vw] lg:w-auto shrink-0 lg:shrink snap-center ${
                  isBroken
                    ? "bg-rose-50/40 border-rose-300 hover:border-rose-500 shadow-2xs hover:shadow-xs"
                    : isSolid
                    ? "bg-emerald-50/30 border-emerald-300 hover:border-emerald-500 shadow-2xs"
                    : "bg-amber-50/30 border-amber-300 hover:border-amber-500 shadow-2xs"
                }`}
              >
                {/* Step Node Index Pill */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9.5px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#796AEF] text-white flex items-center gap-1 shadow-2xs">
                    <span>{isEng ? `Step ${index + 1}:` : `चरण ${index + 1}:`}</span>
                    <span className="text-indigo-100">
                      {isRoot
                        ? (isEng ? `Foundation (Class ${node.gradeLevel})` : `नींव (Class ${node.gradeLevel})`)
                        : isBridge
                        ? (isEng ? `Bridge (Class ${node.gradeLevel})` : `सेतु (Class ${node.gradeLevel})`)
                        : (isEng ? "Target Mastery" : "लक्ष्य दक्षता")}
                    </span>
                  </span>

                  {/* Status Tag */}
                  <span
                    className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      isBroken
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : isSolid
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {isBroken ? (
                      <>
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>{isEng ? "Broken Link" : "टूटी कड़ी (Broken)"}</span>
                      </>
                    ) : isSolid ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{isEng ? "Solid Root" : "मजबूत (Solid)"}</span>
                      </>
                    ) : (
                      <>
                        <CircleDashed className="w-3 h-3 text-amber-600" />
                        <span>{isEng ? "Shaky Bridge" : "कमजोर (Shaky)"}</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Node Title & Description */}
                <div className="space-y-1.5">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug group-hover:text-[#796AEF] transition-colors">
                    {!isEng && node.hindiTitle ? `${node.hindiTitle}` : node.title}
                  </h4>
                  {!isEng && node.hindiTitle && (
                    <p className="text-[10px] text-slate-400 font-mono">
                      {node.title}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    {(isEng ? node.description : node.hindiDescription) || node.description}
                  </p>
                </div>

                {/* Key Formula Box */}
                {node.keyFormula && (
                  <div className="p-2.5 bg-amber-50/70 text-amber-900 border border-amber-200/60 rounded-xl font-mono text-[11px] text-center overflow-x-auto shadow-2xs">
                    {renderFormula(node.keyFormula)}
                  </div>
                )}

                {/* Diagnostic Common Trap Callout */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    {isEng ? "Common Student Trap:" : "छात्रों की आम भूल (Common Trap):"}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    {(isEng ? node.commonTrap : node.hindiCommonTrap) || node.commonTrap}
                  </p>
                </div>

                {/* Node Interactive Launch Action */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDiscussWithCherry) {
                      onDiscussWithCherry({
                        topic: node.title,
                        subject: activeChain.subject,
                        conceptTested: node.title,
                        hint: (!isEng && node.hindiCommonTrap) ? node.hindiCommonTrap : node.commonTrap,
                        question: `Cherry Ma'am, please explain the fundamental concept and common traps of "${node.title}" (Class ${node.gradeLevel}) on the digital chalkboard!`
                      });
                    } else if (onEnterClassroom) {
                      onEnterClassroom();
                    }
                  }}
                  className="min-h-[44px] w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 border border-indigo-200 cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isEng ? `Practice Step ${index + 1} with Cherry` : `मैम के साथ चरण ${index + 1} का अभ्यास करें`}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
