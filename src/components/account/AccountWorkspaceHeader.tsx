import React from "react";
import { BookOpen, Sparkles } from "lucide-react";

export interface AccountWorkspaceHeaderProps {
  activeDesktopTab: string;
  subject?: string;
  grade?: any;
}

export const AccountWorkspaceHeader: React.FC<AccountWorkspaceHeaderProps> = ({
  activeDesktopTab,
  subject = "Mathematics",
  grade = "Class 10",
}) => {
  if (activeDesktopTab === "stats") return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EFF1F5] pb-2.5 gap-2 shrink-0 select-none">
      <div className="flex items-center gap-2 min-w-0">
        {activeDesktopTab === "referral" ? (
          <>
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1E293B] truncate">
              Refer & Earn • 5-Level Compensation Hub
            </h3>
          </>
        ) : activeDesktopTab === "counselor" ? (
          <>
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1E293B] truncate">
              Kiara • AI Mindset & Academic Success Counselor
            </h3>
          </>
        ) : (
          <>
            <BookOpen className="w-4 h-4 text-[#796AEF] shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1E293B] truncate">
              Classroom Study Handbooks (Board-Books)
            </h3>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] bg-white text-[#796AEF] border border-[#EFF1F5] px-2.5 py-1 rounded-xl font-bold uppercase tracking-wider shadow-2xs font-sans">
          {subject} • {grade}
        </span>
      </div>
    </div>
  );
};
