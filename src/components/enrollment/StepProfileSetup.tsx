/**
 * StepProfileSetup.tsx
 * Step 2: Student academic profile configuration (Name, Grade, Board, Language, Avatar)
 */
import React from "react";
import { motion } from "motion/react";
import {
  GraduationCap,
  BookOpen,
  Globe,
  User,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import {
  AVATAR_OPTIONS,
  GRADE_OPTIONS,
  BOARD_OPTIONS,
  MEDIUM_OPTIONS,
} from "./enrollmentTypes";

interface StepProfileSetupProps {
  name: string;
  setName: (name: string) => void;
  grade: string;
  setGrade: (grade: string) => void;
  board: string;
  setBoard: (board: string) => void;
  mediumOfLearning: string;
  setMediumOfLearning: (medium: string) => void;
  selectedAvatar: string;
  setSelectedAvatar: (avatar: string) => void;
  profileError: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export const StepProfileSetup: React.FC<StepProfileSetupProps> = ({
  name,
  setName,
  grade,
  setGrade,
  board,
  setBoard,
  mediumOfLearning,
  setMediumOfLearning,
  selectedAvatar,
  setSelectedAvatar,
  profileError,
  onSubmit,
}) => {
  return (
    <motion.div
      key="step-profile-setup"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-4 text-left"
    >
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs space-y-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[#796AEF] text-[10.5px] font-mono font-bold uppercase">
          <Sparkles className="w-3 h-3 text-[#796AEF]" />
          <span>Step 2 of 5 • Academic Profile</span>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Avatar & Full Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#796AEF]" />
              <span>Full Name & Avatar</span>
            </label>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-50 border border-slate-200 rounded-xl">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedAvatar(emoji)}
                    className={`w-7 h-7 text-sm rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      selectedAvatar === emoji
                        ? "bg-[#796AEF] text-white shadow-xs scale-105"
                        : "hover:bg-slate-200"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#796AEF] font-bold text-slate-800"
              />
            </div>

            {profileError && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{profileError}</span>
              </p>
            )}
          </div>

          {/* Target Grade / Exam */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-[#796AEF]" />
              <span>Target Class / Exam</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {GRADE_OPTIONS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGrade(g.id)}
                  className={`py-2 px-2 rounded-xl text-center border transition-all cursor-pointer ${
                    grade === g.id
                      ? "bg-[#796AEF] text-white border-[#796AEF] shadow-xs font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
                  }`}
                >
                  <span className="text-xs block leading-tight">{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Education Board */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#796AEF]" />
              <span>Syllabus & Education Board</span>
            </label>
            <select
              value={board}
              onChange={(e) => setBoard(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#796AEF] font-medium text-slate-800 cursor-pointer"
            >
              {BOARD_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Medium of Learning */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#796AEF]" />
              <span>Explanation Language</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {MEDIUM_OPTIONS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMediumOfLearning(m.id)}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    mediumOfLearning === m.id
                      ? "bg-indigo-50/90 border-[#796AEF] text-indigo-950 font-bold shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-base">{m.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-none truncate">{m.label}</p>
                    <p className="text-[10px] text-slate-500 truncate leading-none mt-0.5 font-normal">
                      {m.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Profile CTA */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-[#796AEF] hover:bg-[#6858e0] text-white font-bold font-sans text-xs tracking-wide uppercase transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] cursor-pointer shadow-sm flex items-center justify-center gap-2"
          >
            <span>Save Profile & Choose Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </motion.div>
  );
};
