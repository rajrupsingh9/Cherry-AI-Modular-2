import React from "react";
import { createPortal } from "react-dom";
import {
  X,
  Award,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Clock,
  Printer,
  Sparkles,
  GraduationCap,
} from "lucide-react";

interface StudentReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  grade?: string;
  subject?: string;
}

export const StudentReportCardModal: React.FC<StudentReportCardModalProps> = ({
  isOpen,
  onClose,
  studentName = "Scholar",
  grade = "Class 10",
  subject = "Science",
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-[#0a3641] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#c4f500]/20 border border-[#c4f500]/40 text-[#c4f500] flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Academic Performance Report</h3>
              <p className="text-xs text-teal-200/80">Cherry AI Verified Learning Record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Report Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          {/* Student Profile Overview */}
          <div className="p-4 rounded-2xl bg-[#f7f9f6] border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="text-base font-black text-slate-900">{studentName}</h4>
              <p className="text-xs text-slate-500">{grade} • {subject}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Overall Accuracy
              </span>
              <span className="text-xl font-black text-[#0a3641]">88.5%</span>
            </div>
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                Sessions
              </span>
              <span className="text-lg font-black text-slate-900">14</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                Study Time
              </span>
              <span className="text-lg font-black text-teal-700">185m</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                Concepts
              </span>
              <span className="text-lg font-black text-indigo-600">32</span>
            </div>
          </div>

          {/* Unit Mastery Progress */}
          <div className="flex flex-col gap-3">
            <h5 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
              Subject Unit Mastery
            </h5>
            <div className="flex flex-col gap-2.5">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Chemical Reactions & Equations</span>
                  <span>92%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-[#0a3641] rounded-full" style={{ width: "92%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Electricity & Circuits</span>
                  <span>85%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: "85%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Light - Reflection & Refraction</span>
                  <span>78%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: "78%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 rounded-xl bg-[#0a3641] hover:bg-[#124e5d] text-[#c4f500] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
