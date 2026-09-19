import React from "react";
import { Award, Edit3, Key, LogOut, Radio, Sparkles } from "lucide-react";

export interface StudentProfileSidebarProps {
  activeMobileSubTab: string;
  editingProfile: boolean;
  setEditingProfile: (val: boolean) => void;
  editName: string;
  setEditName: (name: string) => void;
  editGrade: any;
  setEditGrade: (grade: any) => void;
  editBoard: string;
  setEditBoard: (board: string) => void;
  editMediumOfLearning: string;
  setEditMediumOfLearning: (medium: string) => void;
  savingProfile: boolean;
  handleUpdateProfile: (e: React.FormEvent) => void;
  studentName: string;
  grade: any;
  board: string;
  mediumOfLearning: string;
  currentUser: any;
  totalSessionsCount: number;
  allSnapshotsCount: number;
  hasCustomKey: boolean;
  keyCount: number;
  onOpenReferral: () => void;
  onOpenKiaraChat: () => void;
  onOpenKiaraVoice: () => void;
  onOpenApiKeyModal: () => void;
  onSignOut?: () => void;
  onOpenLogoutConfirm: () => void;
}

export const StudentProfileSidebar: React.FC<StudentProfileSidebarProps> = ({
  activeMobileSubTab,
  editingProfile,
  setEditingProfile,
  editName,
  setEditName,
  editGrade,
  setEditGrade,
  editBoard,
  setEditBoard,
  editMediumOfLearning,
  setEditMediumOfLearning,
  savingProfile,
  handleUpdateProfile,
  studentName,
  grade,
  board,
  mediumOfLearning,
  currentUser,
  totalSessionsCount,
  allSnapshotsCount,
  hasCustomKey,
  keyCount,
  onOpenReferral,
  onOpenKiaraChat,
  onOpenKiaraVoice,
  onOpenApiKeyModal,
  onSignOut,
  onOpenLogoutConfirm,
}) => {
  return (
          <div
            className={`${activeMobileSubTab === "profile" ? "flex flex-1 min-h-0" : "hidden md:flex"} w-full md:w-80 bg-[#F6F7FB] border-r border-[#EFF1F5] p-4 sm:p-5 pb-36 sm:pb-8 flex-col justify-between overflow-y-auto md:shrink-0 select-none`}
          >
            <div className="space-y-4">
              {/* Profile Details section - Modern Student Identity Hero Card */}
              <div className="bg-white border border-[#EFF1F5] rounded-2xl p-4 shadow-xs text-left">
                {editingProfile ? (
                  <form
                    onSubmit={handleUpdateProfile}
                    className="space-y-3 text-left"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#EFF1F5]">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] flex items-center gap-1.5 font-sans">
                        <Edit3 className="w-3.5 h-3.5 text-[#796AEF]" /> Edit Profile
                      </h4>
                      <span className="text-[10px] text-[#4A4E5A] font-sans">
                        ID Settings
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-sans text-[#4A4E5A] uppercase font-bold">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-[#F6F7FB] border border-[#EFF1F5] focus:border-[#796AEF] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#796AEF]"
                        placeholder="Your Name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-sans text-[#4A4E5A] uppercase font-bold">
                          Class / Grade
                        </label>
                        <select
                          value={editGrade}
                          onChange={(e) => setEditGrade(e.target.value)}
                          className="w-full bg-[#F6F7FB] border border-[#EFF1F5] text-[#1E293B] font-semibold rounded-xl px-2 py-1.5 text-xs focus:outline-none cursor-pointer"
                        >
                          <option value="Class 6">Class 6</option>
                          <option value="Class 7">Class 7</option>
                          <option value="Class 8">Class 8</option>
                          <option value="Class 9">Class 9</option>
                          <option value="Class 10">Class 10</option>
                          <option value="Class 11">Class 11</option>
                          <option value="Class 12">Class 12</option>
                          <option value="NEET">NEET</option>
                          <option value="JEE">JEE</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-sans text-[#4A4E5A] uppercase font-bold">
                          Board
                        </label>
                        <select
                          value={editBoard}
                          onChange={(e) => setEditBoard(e.target.value)}
                          className="w-full bg-[#F6F7FB] border border-[#EFF1F5] text-[#1E293B] font-semibold rounded-xl px-2 py-1.5 text-xs focus:outline-none cursor-pointer"
                        >
                          <option value="CBSE">CBSE</option>
                          <option value="ICSE">ICSE / ISC</option>
                          <option value="UP Board">UP Board</option>
                          <option value="MP Board">MP Board</option>
                          <option value="Rajasthan Board">RBSE</option>
                          <option value="Maharashtra Board">MSBSHSE</option>
                          <option value="Bihar Board">BSEB</option>
                          <option value="Jharkhand Board">Jharkhand Board (JAC)</option>
                          <option value="Odisha Board">Odisha Board (CHSE/BSE)</option>
                          <option value="West Bengal Board">West Bengal Board (WBBSE/WBCHSE)</option>
                          <option value="Other State Board">Other Board</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-sans text-[#4A4E5A] uppercase font-bold">
                        Medium / Language
                      </label>
                      <select
                        value={editMediumOfLearning}
                        onChange={(e) =>
                          setEditMediumOfLearning(e.target.value)
                        }
                        className="w-full bg-[#F6F7FB] border border-[#EFF1F5] text-[#1E293B] font-semibold rounded-xl px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="Hinglish">Hinglish</option>
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Bengali">Bengali (বাংলা)</option>
                        <option value="Odisha">Odisha / Odia (ଓଡ଼ିଆ)</option>
                        <option value="Marathi">Marathi (मराठी)</option>
                      </select>
                    </div>

                    <div className="flex gap-2 pt-1.5">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="flex-1 bg-[#796AEF] hover:bg-[#6858e0] text-white text-[11.5px] font-bold tracking-wider uppercase py-2 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        {savingProfile ? "Saving..." : "Save updates"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProfile(false)}
                        className="px-3 border border-[#EFF1F5] text-[#4A4E5A] hover:bg-[#F6F7FB] text-[11.5px] uppercase font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    {/* Header: Avatar, Name & Edit Button */}
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Student Avatar */}
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#796AEF] text-white flex items-center justify-center text-base sm:text-lg font-bold shadow-xs">
                            {(studentName || "S")
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <span
                            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"
                            title="Active Scholar"
                          />
                        </div>

                        {/* Name & Account Type */}
                        <div className="min-w-0">
                          <h3 className="font-bold text-[#1E293B] text-sm sm:text-base leading-tight truncate">
                            {studentName || "Cherry's Student"}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                            <span className="text-[11px] font-bold text-emerald-700 truncate">
                              {currentUser?.isAnonymous
                                ? "Guest Profile (Local)"
                                : "Verified Scholar"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => setEditingProfile(true)}
                        className="shrink-0 px-2.5 py-1.5 bg-[#F6F7FB] hover:bg-indigo-50 text-[#1E293B] hover:text-[#796AEF] border border-[#EFF1F5] hover:border-indigo-200 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold shadow-2xs group active:scale-95"
                        title="Edit Profile Particulars"
                      >
                        <Edit3 className="w-3 h-3 text-[#4A4E5A] group-hover:text-[#796AEF] transition-colors" />
                        <span>Edit</span>
                      </button>
                    </div>

                    {/* Meta Badges Grid / Tag Strip */}
                    <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                      <div className="bg-[#F6F7FB] border border-[#EFF1F5] rounded-xl p-1.5 text-center">
                        <span className="text-[11px] font-sans uppercase font-bold text-[#796AEF] block leading-tight">
                          Class
                        </span>
                        <span className="text-[12px] font-bold text-[#1E293B] block truncate mt-0.5">
                          {grade}
                        </span>
                      </div>

                      <div className="bg-[#F6F7FB] border border-[#EFF1F5] rounded-xl p-1.5 text-center">
                        <span className="text-[11px] font-sans uppercase font-bold text-[#4A4E5A] block leading-tight">
                          Board
                        </span>
                        <span className="text-[12px] font-bold text-[#1E293B] block truncate mt-0.5">
                          {board}
                        </span>
                      </div>

                      <div className="bg-[#F6F7FB] border border-[#EFF1F5] rounded-xl p-1.5 text-center">
                        <span className="text-[11px] font-sans uppercase font-bold text-[#4A4E5A] block leading-tight">
                          Medium
                        </span>
                        <span className="text-[12px] font-bold text-[#1E293B] block truncate mt-0.5">
                          {mediumOfLearning}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Milestones & Progress scorecard */}
              <div className="space-y-3 pt-1">
                <h3 className="text-[11px] uppercase font-sans font-bold tracking-wider text-[#1E293B] flex items-center gap-1.5 pb-2 border-b border-[#EFF1F5]">
                  <Award className="w-3.5 h-3.5 text-[#796AEF]" /> Academic Progress
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white border border-[#EFF1F5] rounded-2xl p-3 flex flex-col justify-between text-left shadow-xs">
                    <span className="text-[10.5px] font-sans text-[#4A4E5A] block uppercase font-semibold">
                      Classes
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-lg font-bold text-[#1E293B]">
                        {totalSessionsCount}
                      </span>
                      <span className="text-sm">📈</span>
                    </div>
                  </div>

                  <div className="bg-white border border-[#EFF1F5] rounded-2xl p-3 flex flex-col justify-between text-left shadow-xs">
                    <span className="text-[10.5px] font-sans text-[#4A4E5A] block uppercase font-semibold">
                      Slides Saved
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-lg font-bold text-[#1E293B]">
                        {allSnapshotsCount}
                      </span>
                      <span className="text-sm">📸</span>
                    </div>
                  </div>
                </div>

                {/* Active Scholar Badge - Cohesive Light Theme Card */}
                <div className="bg-white border border-[#EFF1F5] rounded-2xl p-3.5 text-left shadow-xs flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center text-sm shrink-0 shadow-2xs">
                    🏆
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E293B]">
                        Active Scholar Badge
                      </h4>
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-100/70 text-amber-800 text-[10.5px] font-bold">
                        UNLOCKED
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[#4A4E5A] font-normal mt-1 leading-relaxed">
                      Automatically unlocked for participating in live lectures and compiling direct board-books!
                    </p>
                  </div>
                </div>

                {/* Refer & Earn 5-Level Plan Card - Harmonious Modern Card */}
                <div className="bg-white border border-[#EFF1F5] rounded-2xl p-4 text-left space-y-3 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#F6F7FB] border border-[#EFF1F5] text-amber-500 flex items-center justify-center text-sm shadow-2xs">
                        🎁
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#1E293B] font-sans">
                          Refer & Earn
                        </h4>
                        <span className="text-[10.5px] font-semibold text-[#4A4E5A] uppercase tracking-wider block">
                          5-Level Income Plan
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[10.5px] font-sans font-bold">
                      Up to 30% + 10%
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#4A4E5A] leading-relaxed">
                    1st Level Direct: <strong className="text-emerald-700 font-bold">15%–30%</strong> • 5th Level Indirect: <strong className="text-[#796AEF] font-bold">up to 10%</strong> (Higher with 12M VIP!)
                  </p>
                  <button
                    type="button"
                    onClick={onOpenReferral}
                    className="w-full bg-[#796AEF] hover:bg-[#6858e0] text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                  >
                    <span>Open Refer & Earn Hub 🚀</span>
                  </button>
                </div>

                {/* Kiara AI Student Counselor Card - Clean Modern Card */}
                <div className="bg-white border border-[#EFF1F5] rounded-2xl p-4 text-left space-y-3 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200/80 text-purple-600 flex items-center justify-center text-sm shadow-2xs shrink-0">
                        👩‍🎓
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-[#1E293B] font-sans truncate">
                            Kiara AI
                          </h4>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[10.5px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Online
                          </span>
                        </div>
                        <span className="text-[10.5px] font-semibold text-[#4A4E5A] uppercase tracking-wider block">
                          Mindset & Study Counselor
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11.5px] text-[#4A4E5A] leading-relaxed">
                    Exam anxiety, revision routine, or mnemonics? Ask Kiara anytime.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={onOpenKiaraChat}
                      className="bg-[#796AEF] hover:bg-[#6858e0] text-white text-xs font-bold py-2.5 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span className="truncate">Chat (Full)</span>
                    </button>
                    <button
                      type="button"
                      onClick={onOpenKiaraVoice}
                      className="bg-white hover:bg-[#F6F7FB] text-[#1E293B] border border-[#EFF1F5] text-xs font-bold py-2.5 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                    >
                      <Radio className="w-3.5 h-3.5 text-[#796AEF] animate-pulse" />
                      <span className="truncate">Live Voice 🎙️</span>
                    </button>
                  </div>
                </div>

                {/* Personal Gemini API Key (BYOK) - Placed at the very bottom of Profile Page */}
                <div className="bg-white border border-[#EFF1F5] rounded-2xl p-4 text-left space-y-3 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-2xs shrink-0 border ${
                        hasCustomKey
                          ? "bg-emerald-50 border-emerald-200/80 text-emerald-600"
                          : "bg-indigo-50 border-indigo-200/80 text-[#796AEF]"
                      }`}>
                        <Key className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-[#1E293B] font-sans truncate">
                            Gemini API Key
                          </h4>
                          <span className={`px-1.5 py-0.5 rounded-full border text-[10.5px] font-sans font-bold ${
                            hasCustomKey
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}>
                            {hasCustomKey ? (keyCount > 1 ? `${keyCount} KEYS ACTIVE` : "CONNECTED") : "DEFAULT"}
                          </span>
                        </div>
                        <span className="text-[10.5px] font-semibold text-[#4A4E5A] uppercase tracking-wider block">
                          BYOK Multi-Key Pool
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11.5px] text-[#4A4E5A] leading-relaxed">
                    {hasCustomKey
                      ? keyCount > 1
                        ? `${keyCount} Gemini API keys configured with auto-failover protection for zero interruptions.`
                        : "Your personal Google AI Studio Key is connected for 1-on-1 AI lectures."
                      : "Connect your free Gemini API Key for zero rate limits and high-speed AI lectures."}
                  </p>
                  <button
                    type="button"
                    onClick={onOpenApiKeyModal}
                    className={`w-full text-xs font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-95 ${
                      hasCustomKey
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-[#796AEF] hover:bg-[#6858e0] text-white"
                    }`}
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>{hasCustomKey ? "Manage Key Pool 🔑" : "Connect Gemini API Key (BYOK) 🔑"}</span>
                  </button>
                </div>
              </div>

              {/* Account & Session Management Card */}
              {onSignOut && (
                <div className="bg-white border border-[#EFF1F5] rounded-2xl p-4 shadow-xs text-left space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#1E293B] font-sans truncate">
                        Account Session
                      </h4>
                      <span className="text-[11px] font-semibold text-[#4A4E5A] block truncate">
                        {currentUser?.email || (currentUser?.isAnonymous ? "Guest Scholar Session" : "Verified Student")}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11.5px] text-[#4A4E5A] leading-relaxed">
                    Switch account or sign out from this device safely. Your learning history and notes remain securely synced.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenLogoutConfirm}
                    className="w-full text-xs font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 shadow-xs active:scale-95"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Log Out of Account 🚪</span>
                  </button>
                </div>
              )}
            </div>

            <div className="text-[11px] text-[#4A4E5A] font-sans text-left pt-4 border-t border-[#EFF1F5] mt-4 leading-relaxed">
              * Classroom Handbooks are automatically formatted into optimized multi-page books using integrated LaTeX formulas.
            </div>
          </div>

  );
};
