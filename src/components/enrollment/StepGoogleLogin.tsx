/**
 * StepGoogleLogin.tsx
 * Step 1: Google account verification & direct enrolled student phone lookup
 */
import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Smartphone,
  ShieldCheck,
  Zap,
  BookOpen,
  ArrowRight,
  User,
} from "lucide-react";

interface StepGoogleLoginProps {
  isLoggingIn: boolean;
  onGoogleLogin: () => void;
  onDirectStudentLogin: (phoneOrEmail: string) => void;
}

export const StepGoogleLogin: React.FC<StepGoogleLoginProps> = ({
  isLoggingIn,
  onGoogleLogin,
  onDirectStudentLogin,
}) => {
  const [phoneLookupInput, setPhoneLookupInput] = useState("");
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [showPhoneLookup, setShowPhoneLookup] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneLookupInput.trim()) return;
    setIsCheckingPhone(true);
    await onDirectStudentLogin(phoneLookupInput.trim());
    setIsCheckingPhone(false);
  };

  return (
    <motion.div
      key="step-google-login"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-4 text-left"
    >
      {/* Hero Welcome Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[#796AEF] text-[10.5px] font-mono font-bold uppercase">
          <Sparkles className="w-3 h-3 text-[#796AEF]" />
          <span>Step 1 of 5 • Identity Verification</span>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-black font-sans tracking-tight text-slate-900 leading-tight">
            Welcome to Cherry AI Classroom 🎓
          </h2>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Verify your Google account to secure your personalized whiteboard memory, syllabus
            progress, and study statistics.
          </p>
        </div>

        {/* Primary Google Login Button */}
        <button
          type="button"
          onClick={onGoogleLogin}
          disabled={isLoggingIn}
          className="w-full py-3.5 px-4 rounded-xl bg-[#796AEF] hover:bg-[#6858e0] text-white font-bold font-sans text-xs tracking-wide uppercase transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] cursor-pointer shadow-sm flex items-center justify-center gap-2.5 disabled:opacity-50"
        >
          {isLoggingIn ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#ffffff"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#ffffff"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#ffffff"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#ffffff"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{isLoggingIn ? "Verifying Google Account..." : "Continue with Google"}</span>
        </button>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <Zap className="w-3.5 h-3.5 text-[#796AEF] shrink-0" />
            <span className="text-[11px] font-sans font-semibold text-slate-700 leading-tight">
              Live Voice Socratic Teacher
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <BookOpen className="w-3.5 h-3.5 text-[#796AEF] shrink-0" />
            <span className="text-[11px] font-sans font-semibold text-slate-700 leading-tight">
              Class 6-12 & NEET/JEE Prep
            </span>
          </div>
        </div>
      </div>

      {/* Alternative: Already Enrolled Phone Lookup Accordion */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2.5">
        <button
          type="button"
          onClick={() => setShowPhoneLookup(!showPhoneLookup)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#796AEF]" />
            <span className="text-xs font-bold text-slate-800">
              Already enrolled or have an active pass?
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#796AEF] font-bold">
            {showPhoneLookup ? "Hide" : "Find Pass"}
          </span>
        </button>

        {showPhoneLookup && (
          <form onSubmit={handlePhoneSubmit} className="space-y-2 pt-1 border-t border-slate-100">
            <p className="text-[11px] text-slate-500">
              Enter your registered 10-digit mobile number or email to immediately resume your active
              pro access:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={phoneLookupInput}
                onChange={(e) => setPhoneLookupInput(e.target.value)}
                placeholder="Mobile number or Email"
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#796AEF] text-slate-800"
              />
              <button
                type="submit"
                disabled={isCheckingPhone || !phoneLookupInput.trim()}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-mono transition-all disabled:opacity-50 cursor-pointer"
              >
                {isCheckingPhone ? "Checking..." : "Verify"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-2 text-[10.5px] font-mono text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Secured via Google Authentication & Safe UPI Gateway</span>
      </div>
    </motion.div>
  );
};
