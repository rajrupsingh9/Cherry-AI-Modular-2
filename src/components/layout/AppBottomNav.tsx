import React from "react";
import { BookOpen, GraduationCap, Sparkles, Brain, FlaskConical, User } from "lucide-react";

export interface AppBottomNavProps {
  currentScreen: any;
  setCurrentScreen: any;
  showStudentAccountHub: boolean;
  setShowStudentAccountHub: (val: boolean) => void;
  isQuizFullScreenOpen: boolean;
  setIsQuizFullScreenOpen: (val: boolean) => void;
  isFullScreenBoard: boolean;
  user: any;
  studentName?: string;
  setShowLoginModal: (val: boolean) => void;
  setShowOnboarding: (val: boolean) => void;
  addToast: (message: string, type: "info" | "success" | "error") => void;
  t: any;
}

export const AppBottomNav: React.FC<AppBottomNavProps> = ({
  currentScreen,
  setCurrentScreen,
  showStudentAccountHub,
  setShowStudentAccountHub,
  isQuizFullScreenOpen,
  setIsQuizFullScreenOpen,
  isFullScreenBoard,
  user,
  studentName,
  setShowLoginModal,
  setShowOnboarding,
  addToast,
  t,
}) => {
  if (currentScreen === "home" || currentScreen === "admin") {
    return null;
  }

  return (
    <div
      className={`w-full bg-white border-t border-[#EFF1F5] pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] px-2 flex items-center justify-between shrink-0 z-40 select-none ${
        isFullScreenBoard ? "hidden" : "landscape:hidden"
      }`}
      style={{
        boxShadow: "0 -4px 16px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* 1st Tab: Desk (Default Landing Page) */}
      <button
        id="nav-tab-desk"
        onClick={() => {
          if (!user) {
            setShowLoginModal(true);
            addToast("Please login/register to access Study Desk!", "info");
          } else if (!studentName) {
            setShowOnboarding(true);
            addToast("Please complete your profile first!", "info");
          } else {
            setCurrentScreen("syllabus");
            setShowStudentAccountHub(false);
            setIsQuizFullScreenOpen(false);
          }
        }}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-300 relative ${
          currentScreen === "syllabus" && !showStudentAccountHub && !isQuizFullScreenOpen
            ? "text-[#796AEF] scale-105"
            : "text-[#4A4E5A]/70 hover:text-[#1E293B]"
        }`}
      >
        <BookOpen
          className={`w-4.5 h-4.5 transition-all ${
            currentScreen === "syllabus" && !showStudentAccountHub && !isQuizFullScreenOpen
              ? "stroke-[2.5px] text-[#796AEF]"
              : "stroke-[2px]"
          }`}
        />
        <span className="text-[10px] sm:text-[10.5px] font-bold mt-1 tracking-tight leading-none truncate max-w-[66px]">
          {t.navSyllabus}
        </span>
        {currentScreen === "syllabus" && !showStudentAccountHub && !isQuizFullScreenOpen && (
          <span className="absolute bottom-0 w-4 h-0.5 bg-[#796AEF] rounded-full" />
        )}
      </button>

      {/* 2nd Tab: Class */}
      <button
        id="nav-tab-class"
        onClick={() => {
          if (!user) {
            setShowLoginModal(true);
            addToast("Please login/register to join the classroom!", "info");
          } else if (!studentName) {
            setShowOnboarding(true);
            addToast("Please complete your profile first!", "info");
          } else {
            setCurrentScreen("classroom");
            setShowStudentAccountHub(false);
            setIsQuizFullScreenOpen(false);
          }
        }}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-300 relative ${
          currentScreen === "classroom" && !showStudentAccountHub && !isQuizFullScreenOpen
            ? "text-[#796AEF] scale-105"
            : "text-[#4A4E5A]/70 hover:text-[#1E293B]"
        }`}
      >
        <GraduationCap
          className={`w-4.5 h-4.5 transition-all ${
            currentScreen === "classroom" && !showStudentAccountHub && !isQuizFullScreenOpen
              ? "stroke-[2.5px] text-[#796AEF]"
              : "stroke-[2px]"
          }`}
        />
        <span className="text-[10px] sm:text-[10.5px] font-bold mt-1 tracking-tight leading-none truncate max-w-[66px]">
          {t.navClassroom}
        </span>
        {currentScreen === "classroom" && !showStudentAccountHub && !isQuizFullScreenOpen && (
          <span className="absolute bottom-0 w-4 h-0.5 bg-[#796AEF] rounded-full" />
        )}
      </button>

      {/* 3rd Tab: Quiz (Central Action Button) */}
      <div className="flex-1 flex flex-col items-center justify-center -translate-y-2 relative">
        <div className="absolute -inset-1.5 bg-[#796AEF]/20 rounded-full blur-md opacity-80 animate-pulse" />
        <button
          id="nav-tab-quiz"
          onClick={() => {
            if (!user) {
              setShowLoginModal(true);
              addToast("Please login/register to play Quick Quiz!", "info");
            } else {
              setCurrentScreen("quiz");
              setShowStudentAccountHub(false);
              setIsQuizFullScreenOpen(false);
            }
          }}
          className={`relative p-2.5 bg-gradient-to-tr border rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-sm active:scale-90 ${
            currentScreen === "quiz" || isQuizFullScreenOpen
              ? "from-[#796AEF] to-[#6858e0] border-[#796AEF] text-white"
              : "from-[#796AEF] to-[#6858e0] border-[#796AEF]/40 hover:border-[#796AEF] text-white"
          }`}
          title="Start Quick Quiz"
        >
          {/* Badge of sparkle */}
          <div className="absolute -top-1 -right-1 bg-white text-[#796AEF] p-0.5 rounded-full shadow-xs border border-[#EFF1F5]">
            <Sparkles className="w-2.5 h-2.5" />
          </div>
          <Brain className="w-4.5 h-4.5 font-black text-white" />
        </button>
        <span className="text-[10px] sm:text-[10.5px] font-black mt-1 text-[#1E293B] leading-none truncate max-w-[60px]">
          {t.navBattle}
        </span>
      </div>

      {/* 4th Tab: Virtual Lab */}
      <button
        id="nav-tab-lab"
        onClick={() => {
          if (!user) {
            setShowLoginModal(true);
            addToast("Please login/register to access Virtual Lab!", "info");
          } else if (!studentName) {
            setShowOnboarding(true);
            addToast("Please complete your profile first!", "info");
          } else {
            setCurrentScreen("lab");
            setShowStudentAccountHub(false);
            setIsQuizFullScreenOpen(false);
          }
        }}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-300 relative ${
          currentScreen === "lab" && !showStudentAccountHub && !isQuizFullScreenOpen
            ? "text-[#796AEF] scale-105"
            : "text-[#4A4E5A]/70 hover:text-[#1E293B]"
        }`}
      >
        <FlaskConical
          className={`w-4.5 h-4.5 transition-all ${
            currentScreen === "lab" && !showStudentAccountHub && !isQuizFullScreenOpen
              ? "stroke-[2.5px] text-[#796AEF]"
              : "stroke-[2px]"
          }`}
        />
        <span className="text-[10px] sm:text-[10.5px] font-bold mt-1 tracking-tight leading-none truncate max-w-[66px]">
          {t.navLab}
        </span>
        {currentScreen === "lab" && !showStudentAccountHub && !isQuizFullScreenOpen && (
          <span className="absolute bottom-0 w-4 h-0.5 bg-[#796AEF] rounded-full" />
        )}
      </button>

      {/* 5th Tab: Profile */}
      <button
        id="nav-tab-profile"
        onClick={() => {
          if (!user) {
            setShowLoginModal(true);
            addToast("Please login/register to view your profile!", "info");
          } else {
            setCurrentScreen("profile");
            setShowStudentAccountHub(false);
            setIsQuizFullScreenOpen(false);
          }
        }}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-300 relative ${
          (currentScreen === "profile" || showStudentAccountHub) && !isQuizFullScreenOpen
            ? "text-[#796AEF] scale-105"
            : "text-[#4A4E5A]/70 hover:text-[#1E293B]"
        }`}
      >
        <User
          className={`w-4.5 h-4.5 transition-all ${
            (currentScreen === "profile" || showStudentAccountHub) && !isQuizFullScreenOpen
              ? "stroke-[2.5px] text-[#796AEF]"
              : "stroke-[2px]"
          }`}
        />
        <span className="text-[10px] sm:text-[10.5px] font-bold mt-1 tracking-tight leading-none truncate max-w-[66px]">
          {t.navAccount}
        </span>
        {(currentScreen === "profile" || showStudentAccountHub) && !isQuizFullScreenOpen && (
          <span className="absolute bottom-0 w-4 h-0.5 bg-[#796AEF] rounded-full" />
        )}
      </button>
    </div>
  );
};
