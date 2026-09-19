import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GraduationCap, Smartphone, RefreshCw, ArrowRight, ChevronRight } from "lucide-react";
import { matchProvisionedStudent } from "../../utils/subscriptionStore";

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleSignIn: () => Promise<void>;
  studentName: string;
  studentGrade: string;
  onStudentNameChange: (name: string) => void;
  onStudentGradeChange: (grade: string) => void;
  onGuestSubmit: (e: React.FormEvent) => void;
  onMobileLoginSuccess: (studentUser: any, profileData: any, subscription: any) => void;
  addToast: (message: string, type: "info" | "success" | "error") => void;
}

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({
  isOpen,
  onClose,
  onGoogleSignIn,
  studentName,
  studentGrade,
  onStudentNameChange,
  onStudentGradeChange,
  onGuestSubmit,
  onMobileLoginSuccess,
  addToast,
}) => {
  const [showPhone, setShowPhone] = useState(false);
  const [phone, setPhone] = useState("");
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-3 overflow-y-auto no-scrollbar">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-teal-100/50 overflow-hidden relative my-auto"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-450 hover:text-slate-700 transition-colors w-8 h-8 rounded-full bg-slate-100/80 hover:bg-slate-200/80 flex items-center justify-center cursor-pointer font-bold text-xs"
          >
            ✕
          </button>

          {/* Header Banner */}
          <div className="bg-[#0a3641] px-6 py-6 text-white relative text-center">
            <div className="w-12 h-12 rounded-xl bg-[#c4f500]/10 border border-[#c4f500]/20 flex items-center justify-center mx-auto mb-3 text-[#c4f500]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold tracking-tight">Student Login & Registration</h3>
            <p className="text-teal-100/70 text-[11px] mt-1 max-w-xs mx-auto font-medium">
              Connect your profile to save stats, classroom sessions, and custom syllabi.
            </p>
          </div>

          {/* Login Modal Body */}
          <div className="p-6 space-y-5 text-left">
            {/* Fast Access via Google */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#486a73] block">
                Fast Access via Cloud Profile
              </label>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await onGoogleSignIn();
                    onClose();
                  } catch (err) {
                    console.error("Popup Error:", err);
                  }
                }}
                className="w-full bg-white hover:bg-slate-50 text-[#0a3641] border border-[#dae1dd] py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer text-xs font-bold hover:border-[#0a3641]/40"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Login with Google Account</span>
              </button>

              {/* Admin Enrolled Student Direct Mobile Verification */}
              <div className="pt-1 space-y-2">
                {!showPhone ? (
                  <button
                    type="button"
                    onClick={() => setShowPhone(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-50/80 hover:bg-indigo-100/80 text-[#796AEF] border border-indigo-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Smartphone className="w-4 h-4 text-[#796AEF]" />
                    <span>Enrolled by Admin? Login with Mobile Number</span>
                  </button>
                ) : (
                  <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-[#796AEF]" />
                        <span>Enter Registered 10-digit Mobile</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPhone(false)}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          placeholder="9876543210"
                          className="w-full pl-11 pr-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#796AEF]"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={phone.length !== 10 || isVerifyingPhone}
                        onClick={async () => {
                          setIsVerifyingPhone(true);
                          try {
                            const clean = phone.replace(/\D/g, "");
                            const matched = await matchProvisionedStudent({ phone: clean });
                            if (matched && matched.profileData && matched.subscription) {
                              const studentUser = {
                                uid: matched.subscription.id,
                                displayName: matched.profileData.name,
                                email: matched.subscription.studentEmail || `student_${clean}@cherry.ai`,
                                phoneNumber: clean,
                                isAnonymous: false,
                                photoURL: null,
                              };
                              onMobileLoginSuccess(studentUser, matched.profileData, matched.subscription);
                              onClose();
                            } else {
                              addToast(`No pre-enrolled Pro subscription found for ${clean}. Please register as guest or with Google.`, "info");
                            }
                          } catch (err) {
                            console.error("Verification error:", err);
                            addToast("Failed to verify subscription. Please try again.", "error");
                          } finally {
                            setIsVerifyingPhone(false);
                          }
                        }}
                        className="px-3.5 py-2 bg-[#796AEF] hover:bg-[#6858e0] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        {isVerifyingPhone ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <span>Verify</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Directly accesses your pre-activated Pro syllabus & AI tutor.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#dae1dd]"></div>
              <span className="flex-shrink mx-3 text-[10px] font-mono text-slate-400 font-bold uppercase">Or Guest Access / या बिना अकाउंट</span>
              <div className="flex-grow border-t border-[#dae1dd]"></div>
            </div>

            {/* Anonymous Guest Registration */}
            <form onSubmit={onGuestSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono font-bold text-[#486a73] block">
                  Student Name / आपका नाम
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => onStudentNameChange(e.target.value)}
                  placeholder="E.g., Nehal Sharma"
                  className="w-full bg-[#f7f9f6] border border-[#dae1dd] focus:border-[#0a3641] focus:ring-1 focus:ring-[#0a3641]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#0a3641] placeholder-[#486a73]/50 outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono font-bold text-[#486a73] block">
                  Your Grade Level / क्लास
                </label>
                <div className="relative">
                  <select
                    value={studentGrade}
                    onChange={(e) => onStudentGradeChange(e.target.value)}
                    className="w-full bg-[#f7f9f6] text-[#0a3641] border border-[#dae1dd] focus:border-[#0a3641] rounded-xl px-3.5 py-2.5 text-xs outline-none appearance-none cursor-pointer font-medium"
                  >
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-[9px]">
                    ▼
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0a3641] hover:bg-[#124e5d] text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer select-none"
              >
                <span>Register & Study 🎒</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="border-t border-[#dae1dd] py-3.5 bg-slate-50 text-center">
            <span className="text-[9px] font-mono font-bold text-[#486a73] flex items-center justify-center gap-1">
              🔒 Encrypted instant guest/google session setup
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
