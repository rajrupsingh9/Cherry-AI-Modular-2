/**
 * StepLaunchApp.tsx
 * Step 5: Final celebration screen with student profile card and Classroom launch CTA
 */
import React, { useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { triggerCelebrationConfetti } from "../../utils/confetti";

interface StepLaunchAppProps {
  name: string;
  grade: string;
  board: string;
  mediumOfLearning: string;
  selectedAvatar: string;
  onLaunchApp: () => void;
}

export const StepLaunchApp: React.FC<StepLaunchAppProps> = ({
  name,
  grade,
  board,
  mediumOfLearning,
  selectedAvatar,
  onLaunchApp,
}) => {
  useEffect(() => {
    triggerCelebrationConfetti();
  }, []);

  return (
    <motion.div
      key="step-launch-app"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 text-center my-auto py-4"
    >
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4 max-w-sm mx-auto">
        {/* Confetti Emoji */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl mx-auto shadow-xs">
          {selectedAvatar || "🧑‍🎓"}
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10.5px] font-mono font-bold uppercase">
            <CheckCircle2 className="w-3 h-3" />
            <span>Ready for Live Classroom</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Welcome aboard, {name || "Student"}! 🎓
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Your personalized study profile is configured and synced with Cherry Ma'am's chalkboard
            memory.
          </p>
        </div>

        {/* Profile Card Breakdown */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Class / Target:</span>
            <span className="font-bold text-slate-800">{grade}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Curriculum:</span>
            <span className="font-bold text-slate-800">{board}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Medium:</span>
            <span className="font-bold text-slate-800">{mediumOfLearning}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-1">
            <span className="text-slate-500">Pass Status:</span>
            <span className="font-mono font-bold text-emerald-600">Active Pro ⚡</span>
          </div>
        </div>

        {/* Launch Button */}
        <button
          type="button"
          onClick={onLaunchApp}
          className="w-full py-3.5 px-4 rounded-xl bg-[#796AEF] hover:bg-[#6858e0] text-white font-bold font-sans text-xs tracking-wide uppercase transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] cursor-pointer shadow-sm flex items-center justify-center gap-2"
        >
          <span>Enter Live Classroom</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
