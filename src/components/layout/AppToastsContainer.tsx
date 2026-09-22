/**
 * AppToastsContainer.tsx
 * Floating system toast notifications container with spring animations.
 */
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { Toast } from "../../hooks/app/useAppToasts";

interface AppToastsContainerProps {
  toasts: Toast[];
  currentScreen: string;
  showBrandSplash: boolean;
  showIntroWalkthrough: boolean;
  showEnrollmentScreen: boolean;
}

export const AppToastsContainer: React.FC<AppToastsContainerProps> = ({
  toasts,
  currentScreen,
  showBrandSplash,
  showIntroWalkthrough,
  showEnrollmentScreen,
}) => {
  if (
    currentScreen === "classroom" ||
    showBrandSplash ||
    showIntroWalkthrough ||
    showEnrollmentScreen
  ) {
    return null;
  }

  return (
    <div
      id="toast-container"
      className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center space-y-2 pointer-events-none w-[calc(100%-2rem)] max-w-sm"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className={`w-full p-3 px-3.5 rounded-2xl border backdrop-blur-xl shadow-lg flex items-center space-x-3 text-xs font-sans font-semibold pointer-events-auto select-none ${
              toast.type === "success"
                ? "bg-white/95 border-emerald-200/90 text-emerald-950 shadow-emerald-500/5"
                : toast.type === "error"
                ? "bg-white/95 border-rose-200/90 text-rose-950 shadow-rose-500/5"
                : "bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-500/5"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                toast.type === "success"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : toast.type === "error"
                  ? "bg-rose-50 text-rose-600 border border-rose-100"
                  : "bg-indigo-50 text-[#796AEF] border border-indigo-100/80"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="flex-1 text-left leading-snug">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
