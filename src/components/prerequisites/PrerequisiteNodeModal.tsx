/**
 * PrerequisiteNodeModal.tsx
 * Modal overlay presenting deep diagnostic analysis, KaTeX formula, and blackboard solver trigger.
 */
import React from "react";
import { Sparkles } from "lucide-react";
import katex from "katex";
import { PrerequisiteNode } from "./prerequisiteTypes";

interface PrerequisiteNodeModalProps {
  node: PrerequisiteNode | null;
  onClose: () => void;
  isEng: boolean;
  onDiscussWithCherry?: (params: {
    topic: string;
    subject: string;
    conceptTested?: string;
    hint?: string;
    question?: string;
  }) => void;
  onEnterClassroom?: () => void;
}

export const PrerequisiteNodeModal: React.FC<PrerequisiteNodeModalProps> = ({
  node,
  onClose,
  isEng,
  onDiscussWithCherry,
  onEnterClassroom
}) => {
  if (!node) return null;

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

  const handleSolveOnChalkboard = () => {
    onClose();
    if (onDiscussWithCherry) {
      onDiscussWithCherry({
        topic: node.title,
        subject: node.subject,
        conceptTested: node.title,
        hint: (!isEng && node.hindiCommonTrap) ? node.hindiCommonTrap : node.commonTrap,
        question: `Cherry Ma'am, please explain "${node.title}" on the digital blackboard and help me overcome the trap: "${node.commonTrap}"!`
      });
    } else if (onEnterClassroom) {
      onEnterClassroom();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-slate-900 shadow-2xl space-y-4 animate-scale-up text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-md border border-indigo-200 uppercase">
            {isEng
              ? `Prerequisite Node Analysis • Class ${node.gradeLevel}`
              : `प्रिरिक्विज़िट नोड विश्लेषण • कक्षा ${node.gradeLevel}`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 font-mono text-xs cursor-pointer rounded-lg hover:bg-slate-100"
          >
            {isEng ? "✕ Close" : "✕ बंद करें"}
          </button>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-black text-slate-900">
            {!isEng && node.hindiTitle
              ? `${node.hindiTitle} (${node.title})`
              : node.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            {(isEng ? node.description : node.hindiDescription) || node.description}
          </p>
        </div>

        {node.keyFormula && (
          <div className="p-3 bg-amber-50/80 border border-amber-200/70 text-amber-900 rounded-xl font-mono text-xs text-center shadow-2xs">
            {renderFormula(node.keyFormula)}
          </div>
        )}

        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 block">
            {isEng ? "🚨 Where Students Lose Marks (Exam Trap):" : "🚨 जहाँ छात्र अंक गँवाते हैं (परीक्षा ट्रैप):"}
          </span>
          <p className="text-xs text-rose-800 leading-relaxed font-medium">
            {(isEng ? node.commonTrap : node.hindiCommonTrap) || node.commonTrap}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            {isEng ? "Cancel" : "रद्द करें"}
          </button>
          <button
            type="button"
            onClick={handleSolveOnChalkboard}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#796AEF] hover:bg-indigo-700 text-white text-xs font-black uppercase font-mono tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>{isEng ? "Solve on Blackboard 🚀" : "ब्लैकबोर्ड पर हल करें 🚀"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
