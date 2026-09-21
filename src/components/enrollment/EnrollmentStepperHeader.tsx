/**
 * EnrollmentStepperHeader.tsx
 * Top navigation bar with step counter, step badges, and back button
 */
import React from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { OnboardingStep, STEPS_NAV } from "./enrollmentTypes";

interface EnrollmentStepperHeaderProps {
  currentStep: OnboardingStep;
  onBack: () => void;
  onSkipToDesk?: () => void;
}

export const EnrollmentStepperHeader: React.FC<EnrollmentStepperHeaderProps> = ({
  currentStep,
  onBack,
  onSkipToDesk,
}) => {
  const activeStepIdx = STEPS_NAV.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full shrink-0">
      {/* Top bar */}
      <header className="py-2.5 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-3.5 -mx-4 -mt-3 mb-2 shadow-2xs">
        <div className="flex items-center gap-2.5">
          {activeStepIdx > 0 && currentStep !== "launch_app" ? (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer active:scale-95"
              title="Go to previous step"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-base font-bold shadow-2xs">
              🍒
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs font-black tracking-tight text-slate-900 uppercase font-mono leading-none">
                Cherry AI Classroom
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-indigo-50 text-[#796AEF] border border-indigo-100">
                PRO ONBOARDING
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500 font-medium leading-none mt-0.5">
              Step {activeStepIdx + 1} of 5: {STEPS_NAV[activeStepIdx]?.label}
            </p>
          </div>
        </div>

        {onSkipToDesk && currentStep !== "launch_app" && (
          <button
            onClick={onSkipToDesk}
            className="text-[10px] font-mono font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            Skip to Desk
          </button>
        )}
      </header>

      {/* Stepper Progress Bar */}
      <div className="flex items-center justify-between gap-1 px-1 py-1.5 mb-3 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
        {STEPS_NAV.map((step, idx) => {
          const isDone = idx < activeStepIdx;
          const isCurrent = idx === activeStepIdx;

          return (
            <div
              key={step.id}
              className={`flex-1 flex flex-col items-center gap-1 py-1 px-0.5 rounded-lg transition-all text-center ${
                isCurrent
                  ? "bg-indigo-50/80 text-[#796AEF] font-bold"
                  : isDone
                  ? "text-slate-700"
                  : "text-slate-400 opacity-60"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-black ${
                  isCurrent
                    ? "bg-[#796AEF] text-white shadow-xs"
                    : isDone
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {isDone ? "✓" : idx + 1}
              </div>
              <span className="text-[9.5px] font-sans truncate max-w-full leading-none">
                {step.short}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
