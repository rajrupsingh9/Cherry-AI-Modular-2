/**
 * SprintTrackSelector.tsx
 * Horizontal responsive grid to choose exam speed pacing track (Physics, Math, Chem, Bio).
 */
import React from "react";
import { Timer, Clock } from "lucide-react";
import { ExamPacingProfile } from "./sprintTypes";
import { EXAM_PACING_DATA } from "./sprintData";

interface SprintTrackSelectorProps {
  isEng: boolean;
  selectedModuleId: string;
  handleSelectModule: (id: string) => void;
  activeProfile: ExamPacingProfile;
}

export const SprintTrackSelector: React.FC<SprintTrackSelectorProps> = ({
  isEng,
  selectedModuleId,
  handleSelectModule,
  activeProfile
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Timer className="w-4 h-4 text-[#796AEF]" />
          {isEng ? "Select Speed Pacing Track:" : "स्पीड ड्रिल ट्रैक चुनें (Select Speed Pacing Track):"}
        </span>
        <span className="text-xs font-mono text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
          {isEng
            ? `Target Pace: ${activeProfile.targetSecondsPerQuestion}s / question`
            : `लक्ष्य गति: ${activeProfile.targetSecondsPerQuestion}s / प्रश्न`}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {EXAM_PACING_DATA.map((mod, idx) => {
          const isSelected = selectedModuleId === mod.id;
          const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => handleSelectModule(mod.id)}
              className={`min-h-[112px] p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                isSelected
                  ? "bg-indigo-50/80 text-slate-900 border-[#796AEF] shadow-sm ring-2 ring-[#796AEF]/30"
                  : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-indigo-300 shadow-2xs"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9.5px] font-mono font-black px-1.5 py-0.5 rounded ${
                        isSelected ? "bg-indigo-700 text-white" : "bg-indigo-100 text-indigo-900"
                      }`}
                    >
                      Opt {optionLetter}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                        isSelected
                          ? "bg-[#796AEF] text-white"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {mod.subject}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-700 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {mod.targetSecondsPerQuestion}s {isEng ? "target" : "लक्ष्य"}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-black line-clamp-1 text-slate-900">
                  {!isEng && mod.hindiExamName ? mod.hindiExamName : mod.examName}
                </h4>
                <p className="text-[11px] line-clamp-2 leading-relaxed text-slate-500">
                  {(isEng ? mod.description : mod.hindiDescription) || mod.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10.5px] font-mono pt-2 border-t border-slate-100">
                <span className={isSelected ? "text-[#796AEF] font-bold" : "text-slate-500"}>
                  {mod.questions.length} {isEng ? "Rapid Questions" : "रैपिड प्रश्न"}
                </span>
                <span className={isSelected ? "text-[#796AEF] font-bold" : "text-slate-400 font-medium"}>
                  {isEng ? "Start →" : "प्रारंभ करें →"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
