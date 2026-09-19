import React from "react";
import { Home, LayoutGrid, Sparkles, BookOpen, User } from "lucide-react";

export interface AccountTopNavbarProps {
  grade?: any;
  onClose: () => void;
  activeMobileSubTab: string;
  setActiveMobileSubTab: (tab: any) => void;
  activeDesktopTab: string;
  setActiveDesktopTab: (tab: any) => void;
  isKiaraFullScreenOpen: boolean;
  setIsKiaraFullScreenOpen: (open: boolean) => void;
  t: any;
  mobileKiaraLabel: string;
  mobileAnalyticsLabel: string;
  mobileBooksLabel: string;
}

export const AccountTopNavbar: React.FC<AccountTopNavbarProps> = ({
  grade,
  onClose,
  activeMobileSubTab,
  setActiveMobileSubTab,
  activeDesktopTab,
  setActiveDesktopTab,
  isKiaraFullScreenOpen,
  setIsKiaraFullScreenOpen,
  t,
  mobileKiaraLabel,
  mobileAnalyticsLabel,
  mobileBooksLabel,
}) => {
  return (
    <>
        <div className="w-full h-[52px] min-h-[52px] max-h-[52px] px-3.5 sm:px-5 flex items-center justify-between border-b border-slate-200/80 bg-white shrink-0 shadow-2xs z-20">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/90 text-[#796AEF] flex items-center justify-center shadow-xs shrink-0">
              <User className="w-4 h-4 text-[#796AEF]" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="text-xs sm:text-sm font-sans font-extrabold uppercase tracking-wide text-slate-900 truncate">
                Student Hub
              </h3>
              <span className="text-[9.5px] font-mono font-bold bg-indigo-50 text-[#796AEF] px-1.5 py-0.5 rounded-full border border-indigo-100/80 shrink-0">
                {grade || "Class 10"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 rounded-full cursor-pointer active:scale-95 transition-all text-[11px] font-bold shadow-2xs shrink-0"
            title="Back to Study Desk"
          >
            <Home className="w-3.5 h-3.5 text-[#796AEF]" />
            <span className="hidden xs:inline text-[10.5px]">Desk</span>
          </button>
        </div>

        {/* Unified Tab bar Selector */}
        <div className="border-b border-[#EFF1F5] bg-white shrink-0 select-none shadow-2xs">
          {/* Mobile view tabs - Option 1: Compact Clean Labels & Single Line */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => {
                setActiveMobileSubTab("profile");
                setIsKiaraFullScreenOpen(false);
              }}
              className={`flex-1 py-2 px-1 text-[11px] sm:text-[11.5px] font-bold uppercase tracking-tight text-center border-b-2 transition-all whitespace-nowrap overflow-hidden flex items-center justify-center gap-1 ${
                activeMobileSubTab === "profile"
                  ? "border-[#796AEF] text-[#796AEF] bg-indigo-50/40 font-bold"
                  : "border-transparent text-[#4A4E5A] hover:text-[#1E293B]"
              }`}
            >
              <span>👤</span>
              <span className="truncate">{t.profileTab}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsKiaraFullScreenOpen(true);
                setActiveMobileSubTab("counselor");
                setActiveDesktopTab("counselor");
              }}
              className={`flex-1 py-2 px-1 text-[11px] sm:text-[11.5px] font-bold uppercase tracking-tight text-center border-b-2 transition-all whitespace-nowrap overflow-hidden flex items-center justify-center gap-1 ${
                activeMobileSubTab === "counselor" || isKiaraFullScreenOpen
                  ? "border-[#796AEF] text-[#796AEF] bg-indigo-50/40 font-bold"
                  : "border-transparent text-[#4A4E5A] hover:text-[#1E293B]"
              }`}
            >
              <span>👩‍🎓</span>
              <span className="truncate">{mobileKiaraLabel}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMobileSubTab("stats");
                setActiveDesktopTab("stats");
                setIsKiaraFullScreenOpen(false);
              }}
              className={`flex-1 py-2 px-1 text-[11px] sm:text-[11.5px] font-bold uppercase tracking-tight text-center border-b-2 transition-all whitespace-nowrap overflow-hidden flex items-center justify-center gap-1 ${
                activeMobileSubTab === "stats"
                  ? "border-[#796AEF] text-[#796AEF] bg-indigo-50/40 font-bold"
                  : "border-transparent text-[#4A4E5A] hover:text-[#1E293B]"
              }`}
            >
              <span>📊</span>
              <span className="truncate">{mobileAnalyticsLabel}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMobileSubTab("books");
                setActiveDesktopTab("books");
                setIsKiaraFullScreenOpen(false);
              }}
              className={`flex-1 py-2 px-1 text-[11px] sm:text-[11.5px] font-bold uppercase tracking-tight text-center border-b-2 transition-all whitespace-nowrap overflow-hidden flex items-center justify-center gap-1 ${
                activeMobileSubTab === "books"
                  ? "border-[#796AEF] text-[#796AEF] bg-indigo-50/40 font-bold"
                  : "border-transparent text-[#4A4E5A] hover:text-[#1E293B]"
              }`}
            >
              <span>📚</span>
              <span className="truncate">{mobileBooksLabel}</span>
            </button>
          </div>

          {/* Desktop view tabs */}
          <div className="hidden md:flex justify-end px-6 py-2.5 gap-3 bg-[#F6F7FB] border-b border-[#EFF1F5]">
            <div className="text-xs font-sans font-bold text-[#4A4E5A] flex items-center mr-auto">
              🎯 Classroom Hub Workspaces:
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveMobileSubTab("stats");
                setActiveDesktopTab("stats");
                setIsKiaraFullScreenOpen(false);
              }}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeDesktopTab === "stats" && activeMobileSubTab !== "profile"
                  ? "bg-[#796AEF] text-white shadow-xs font-bold"
                  : "text-[#4A4E5A] hover:text-[#1E293B] bg-white hover:bg-[#F6F7FB] border border-[#EFF1F5]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>📊 {t.performanceTab}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsKiaraFullScreenOpen(true);
                setActiveMobileSubTab("counselor");
                setActiveDesktopTab("counselor");
              }}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                (activeDesktopTab === "counselor" || isKiaraFullScreenOpen) &&
                activeMobileSubTab !== "profile"
                  ? "bg-[#796AEF] text-white shadow-xs font-bold"
                  : "text-[#1E293B] hover:text-[#796AEF] bg-white hover:bg-[#F6F7FB] border border-[#EFF1F5]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>👩‍🎓 {t.kiaraTab}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMobileSubTab("books");
                setActiveDesktopTab("books");
                setIsKiaraFullScreenOpen(false);
              }}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeDesktopTab === "books" && activeMobileSubTab !== "profile"
                  ? "bg-[#796AEF] text-white shadow-xs font-bold"
                  : "text-[#4A4E5A] hover:text-[#1E293B] bg-white hover:bg-[#F6F7FB] border border-[#EFF1F5]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>📚 {t.booksTab}</span>
            </button>
          </div>
        </div>
    </>
  );
};
