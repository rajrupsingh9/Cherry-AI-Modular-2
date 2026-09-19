import React, { useState } from "react";
import {
  BookOpen,
  Sparkles,
  Flame,
  Award,
  Play,
  FileText,
  Radio,
  Zap,
  ChevronRight,
  BarChart3,
  Calendar,
  Layers,
  GraduationCap,
  FlaskConical,
  Swords,
  Search,
  User,
  Clock,
} from "lucide-react";
import { AudioPodcastData } from "../types";

export interface SyllabusDeskModernProps {
  onStartSession?: (topic: string, options?: any) => void;
  onOpenInfographic?: (topic: string, rawText?: string, options?: any) => void;
  onOpenPYQ8020Modal?: (subject: string, grade: string, board: string) => void;
  onOpenWeightageHeatmapModal?: (subject: string, grade: string, board: string) => void;
  onOpenPredictedPaperModal?: (subject: string, grade: string, board: string) => void;
  studentDetails?: {
    name: string;
    grade: string;
    subject: string;
    board?: string;
    mediumOfLearning?: string;
  };
  setStudentDetails?: React.Dispatch<React.SetStateAction<any>>;
  currentSubject?: string;
  setCurrentSubject?: (subj: string) => void;
  onToast?: (msg: string, type?: "success" | "error" | "info") => void;
  onOpenLearnerProfile?: () => void;
  onOpenVirtualLab?: () => void;
  onOpenPeerBattle?: () => void;
  pastSessions?: any[];
  handleLoadPastSession?: (sess: any) => void;
  onOpenAudioPodcast?: (podcast: AudioPodcastData) => void;
  [key: string]: any;
}

const SUBJECT_CHAPTERS: Record<string, Array<{ name: string; highYield?: boolean; pyqCount?: number }>> = {
  Physics: [
    { name: "Light - Reflection and Refraction", highYield: true, pyqCount: 18 },
    { name: "Electricity & Circuits", highYield: true, pyqCount: 22 },
    { name: "Magnetic Effects of Electric Current", highYield: false, pyqCount: 14 },
    { name: "The Human Eye and Colourful World", highYield: false, pyqCount: 10 },
  ],
  Chemistry: [
    { name: "Chemical Reactions and Equations", highYield: true, pyqCount: 24 },
    { name: "Acids, Bases and Salts", highYield: true, pyqCount: 19 },
    { name: "Metals and Non-metals", highYield: false, pyqCount: 15 },
    { name: "Carbon and its Compounds", highYield: true, pyqCount: 25 },
  ],
  Mathematics: [
    { name: "Real Numbers & Fundamental Theorem", highYield: false, pyqCount: 12 },
    { name: "Polynomials & Quadratic Equations", highYield: true, pyqCount: 21 },
    { name: "Introduction to Trigonometry", highYield: true, pyqCount: 26 },
    { name: "Triangles & Coordinate Geometry", highYield: true, pyqCount: 20 },
  ],
  Biology: [
    { name: "Life Processes: Nutrition & Respiration", highYield: true, pyqCount: 28 },
    { name: "Control and Coordination", highYield: false, pyqCount: 16 },
    { name: "How do Organisms Reproduce?", highYield: true, pyqCount: 22 },
    { name: "Heredity and Evolution", highYield: false, pyqCount: 11 },
  ],
};

export const SyllabusDeskModern: React.FC<SyllabusDeskModernProps> = ({
  onStartSession,
  onOpenInfographic,
  onOpenPYQ8020Modal,
  onOpenWeightageHeatmapModal,
  onOpenPredictedPaperModal,
  studentDetails,
  setStudentDetails,
  currentSubject,
  setCurrentSubject,
  onToast,
  onOpenLearnerProfile,
  onOpenVirtualLab,
  onOpenPeerBattle,
  pastSessions,
  handleLoadPastSession,
  onOpenAudioPodcast,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const subjects = ["Physics", "Chemistry", "Mathematics", "Biology"];

  const effectiveSubject = currentSubject || studentDetails?.subject || "Physics";
  const chapters = SUBJECT_CHAPTERS[effectiveSubject] || SUBJECT_CHAPTERS["Physics"];

  const filteredChapters = chapters.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 w-full h-full min-h-0 overflow-y-auto bg-[#F6F7FB] px-4 py-5 sm:p-7 flex flex-col gap-6">
      {/* Top Welcome Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0a3641] to-[#124e5d] text-[#c4f500] flex items-center justify-center shadow-xs font-bold text-lg">
            {studentDetails.name ? studentDetails.name.charAt(0).toUpperCase() : "S"}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Namaste, {studentDetails.name || "Scholar"}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {studentDetails.grade || "Class 10"} • {studentDetails.board || "CBSE Board"} • Ready to excel today
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenLearnerProfile}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
          >
            <User className="w-4 h-4 text-slate-600" />
            <span>Profile & Pass</span>
          </button>
          <button
            onClick={onOpenVirtualLab}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0a3641] hover:bg-[#124e5d] text-[#c4f500] text-xs font-bold transition-all shadow-xs"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Virtual Lab</span>
          </button>
          <button
            onClick={onOpenPeerBattle}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#796AEF] hover:bg-[#6858e0] text-white text-xs font-bold transition-all shadow-xs"
          >
            <Swords className="w-4 h-4" />
            <span>1v1 Battle</span>
          </button>
        </div>
      </div>

      {/* Quick Access Exam Power Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div
          onClick={() =>
            onOpenPYQ8020Modal(
              effectiveSubject,
              studentDetails.grade || "Class 10",
              studentDetails.board || "CBSE"
            )
          }
          className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 hover:border-amber-400 cursor-pointer transition-all shadow-xs flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                10-Year PYQ 80/20 Radar
              </h3>
              <p className="text-[11px] text-slate-500">Guaranteed repeat questions</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </div>

        <div
          onClick={() =>
            onOpenWeightageHeatmapModal(
              effectiveSubject,
              studentDetails.grade || "Class 10",
              studentDetails.board || "CBSE"
            )
          }
          className="bg-white rounded-2xl p-4 sm:p-5 border border-indigo-200/80 hover:border-indigo-400 cursor-pointer transition-all shadow-xs flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Weightage Heatmap
              </h3>
              <p className="text-[11px] text-slate-500">Section-wise marks breakdown</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </div>

        <div
          onClick={() =>
            onOpenPredictedPaperModal(
              effectiveSubject,
              studentDetails.grade || "Class 10",
              studentDetails.board || "CBSE"
            )
          }
          className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200/80 hover:border-emerald-400 cursor-pointer transition-all shadow-xs flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                2026 Predicted Paper
              </h3>
              <p className="text-[11px] text-slate-500">Official format mock test</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Subject Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200/80 overflow-x-auto">
          {subjects.map((subj) => (
            <button
              key={subj}
              onClick={() => {
                setCurrentSubject(subj);
                setStudentDetails((prev: any) => ({ ...prev, subject: subj }));
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                effectiveSubject.toLowerCase() === subj.toLowerCase()
                  ? "bg-[#0a3641] text-[#c4f500] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chapters or topics..."
            className="w-full sm:w-64 pl-9 pr-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0a3641]/20"
          />
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredChapters.map((ch, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4 hover:shadow-sm transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Unit {idx + 1}
                </span>
                {ch.highYield && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200/60 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-500" /> High-Yield
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">{ch.name}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {ch.pyqCount} past board questions identified
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
              <button
                onClick={() => onStartSession(ch.name)}
                className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#0a3641] hover:bg-[#124e5d] text-[#c4f500] text-xs font-bold transition-all shadow-2xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Class</span>
              </button>
              <button
                onClick={() => onOpenInfographic(ch.name)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all"
                title="View Visual Formula Infographic"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Infographic</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Past Sessions Archive */}
      {pastSessions && pastSessions.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" /> Recent Whiteboard Sessions
            </h3>
            <span className="text-xs text-slate-400">{pastSessions.length} sessions saved</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {pastSessions.slice(0, 6).map((sess, i) => (
              <div
                key={i}
                onClick={() => handleLoadPastSession(sess)}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 cursor-pointer transition-all flex flex-col justify-between gap-2"
              >
                <span className="text-xs font-bold text-slate-800 truncate">
                  {sess.activeDocumentName || sess.topicTitle || "Study Session"}
                </span>
                <span className="text-[10px] text-slate-400">
                  {sess.timestamp ? new Date(sess.timestamp).toLocaleDateString() : "Saved session"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
