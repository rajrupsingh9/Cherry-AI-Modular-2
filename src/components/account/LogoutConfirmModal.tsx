import React from "react";
import { LogOut } from "lucide-react";

export interface LogoutConfirmModalProps {
  isOpen: boolean;
  currentUserEmail?: string | null;
  studentName?: string;
  onClose: () => void;
  onConfirmSignOut: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  currentUserEmail,
  studentName,
  onClose,
  onConfirmSignOut,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 text-left space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 text-base leading-snug">Log Out of Account?</h3>
            <p className="text-xs text-slate-500 truncate">{currentUserEmail || studentName || "Active Student"}</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Kya aap Cherry AI se log out karna chahte hain? Aapka learning progress, quiz scores aur classroom notes safely saved rahenge.
        </p>

        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirmSignOut();
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Confirm Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
