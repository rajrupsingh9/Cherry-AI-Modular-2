/**
 * SprintArenaView.tsx
 * Interactive Live Speed Sprint Arena: Stopwatch, question prompt,
 * options grid, speed evaluation, and delegated shortcut deconstruction.
 */
import React from "react";
import { Clock, Zap, ArrowRight } from "lucide-react";
import { ExamPacingProfile, SpeedQuestion } from "./sprintTypes";
import { SprintTrackSelector } from "./SprintTrackSelector";
import { SprintSpeedDiagnosisCard } from "./SprintSpeedDiagnosisCard";

interface SprintArenaViewProps {
  isEng: boolean;
  selectedModuleId: string;
  handleSelectModule: (id: string) => void;
  activeProfile: ExamPacingProfile;
  activeQuestion: SpeedQuestion;
  currentQuestionIndex: number;
  elapsedSeconds: number;
  selectedOptionIndex: number | null;
  setSelectedOptionIndex: (idx: number) => void;
  isAnswerSubmitted: boolean;
  isTimerRunning: boolean;
  setIsTimerRunning: (running: boolean) => void;
  handleSubmitAnswer: () => void;
  handleNextQuestion: () => void;
  onDiscussWithCherry?: (params: {
    topic: string;
    subject: string;
    conceptTested?: string;
    hint?: string;
    question?: string;
  }) => void;
  onEnterClassroom?: () => void;
}

export const SprintArenaView: React.FC<SprintArenaViewProps> = ({
  isEng,
  selectedModuleId,
  handleSelectModule,
  activeProfile,
  activeQuestion,
  currentQuestionIndex,
  elapsedSeconds,
  selectedOptionIndex,
  setSelectedOptionIndex,
  isAnswerSubmitted,
  isTimerRunning,
  setIsTimerRunning,
  handleSubmitAnswer,
  handleNextQuestion,
  onDiscussWithCherry,
  onEnterClassroom
}) => {
  return (
    <div className="space-y-6 text-left">
      {/* Module Selector Strip */}
      <SprintTrackSelector
        isEng={isEng}
        selectedModuleId={selectedModuleId}
        handleSelectModule={handleSelectModule}
        activeProfile={activeProfile}
      />

      {/* Interactive Live Speed Sprint Arena Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
        {/* Arena Header: Progress & Active Stopwatch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded-md">
                {isEng
                  ? `Question ${currentQuestionIndex + 1} of ${activeProfile.questions.length}`
                  : `प्रश्न ${currentQuestionIndex + 1} / ${activeProfile.questions.length}`}
              </span>
              <span className="text-[10.5px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                {isEng ? `Topic: ${activeQuestion.topic}` : `विषय: ${activeQuestion.hindiTopic || activeQuestion.topic}`}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              {!isEng && activeProfile.hindiExamName ? activeProfile.hindiExamName : activeProfile.examName} •{" "}
              {isEng ? "Time-Pacing Simulation" : "टाइम-पेसिंग सिमुलेशन"}
            </h3>
          </div>

          {/* Interactive Stopwatch Gauge */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-mono font-black text-sm sm:text-base transition-all ${
                elapsedSeconds > activeQuestion.idealSeconds
                  ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse"
                  : elapsedSeconds > activeQuestion.idealSeconds * 0.75
                  ? "bg-amber-50 border-amber-300 text-amber-700"
                  : "bg-indigo-50 border-indigo-200 text-indigo-900"
              }`}
            >
              <Clock
                className={`w-4 h-4 ${
                  elapsedSeconds > activeQuestion.idealSeconds
                    ? "text-rose-600 animate-spin"
                    : "text-[#796AEF]"
                }`}
              />
              <span>{elapsedSeconds}s</span>
              <span className="text-[11px] opacity-70 font-normal">
                / {activeQuestion.idealSeconds}s {isEng ? "target" : "लक्ष्य"}
              </span>
            </div>

            {isAnswerSubmitted && currentQuestionIndex < activeProfile.questions.length - 1 && (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#796AEF] hover:bg-indigo-700 text-white text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <span>{isEng ? "Next Question" : "अगला प्रश्न"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Question Statement Box */}
        <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-[#796AEF] font-bold">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#796AEF]" />
              <span>{isEng ? "EXAM SIMULATION PROMPT" : "बोर्ड परीक्षा सिमुलेशन (EXAM SIMULATION PROMPT)"}</span>
            </span>
            <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {isEng ? `Target Pace: ${activeQuestion.idealSeconds}s` : `आदर्श समय: ${activeQuestion.idealSeconds} सेकंड`}
            </span>
          </div>

          <p className="text-xs sm:text-sm md:text-base font-bold leading-relaxed text-slate-900">
            {!isEng && activeQuestion.hindiQuestionText ? activeQuestion.hindiQuestionText : activeQuestion.questionText}
          </p>

          {!isEng && activeQuestion.hindiQuestionText && activeQuestion.questionText !== activeQuestion.hindiQuestionText && (
            <p className="text-[11.5px] font-medium text-slate-500 font-sans italic">
              EN: {activeQuestion.questionText}
            </p>
          )}

          {activeQuestion.formulaOrContext && (
            <div className="p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl font-mono text-xs text-amber-900 shadow-2xs">
              {activeQuestion.formulaOrContext}
            </div>
          )}
        </div>

        {/* MCQ Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeQuestion.options.map((opt, idx) => {
            const isSelected = selectedOptionIndex === idx;
            const isCorrect = idx === activeQuestion.correctIndex;

            let buttonClass =
              "p-3.5 sm:p-4 rounded-2xl border text-left font-medium text-xs sm:text-sm transition-all cursor-pointer flex items-start gap-3 min-h-[48px] ";

            if (isAnswerSubmitted) {
              if (isCorrect) {
                buttonClass += "bg-emerald-50 border-emerald-400 text-emerald-950 ring-1 ring-emerald-500 font-bold shadow-xs";
              } else if (isSelected && !isCorrect) {
                buttonClass += "bg-rose-50 border-rose-400 text-rose-950 font-bold";
              } else {
                buttonClass += "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
              }
            } else {
              if (isSelected) {
                buttonClass += "bg-indigo-50 border-[#796AEF] text-indigo-950 ring-2 ring-[#796AEF] shadow-xs font-bold";
              } else {
                buttonClass += "bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:border-indigo-300";
              }
            }

            return (
              <button
                key={opt.label}
                type="button"
                disabled={isAnswerSubmitted}
                onClick={() => {
                  setSelectedOptionIndex(idx);
                  if (!isTimerRunning) setIsTimerRunning(true);
                }}
                className={buttonClass}
              >
                <span
                  className={`w-6 h-6 rounded-lg font-mono text-xs font-black flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-[#796AEF] text-white" : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {opt.label}
                </span>
                <span className="flex-1 leading-snug">
                  {!isEng && opt.hindiText ? opt.hindiText : opt.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Button: Lock In Speed Decision */}
        {!isAnswerSubmitted && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={selectedOptionIndex === null}
              onClick={handleSubmitAnswer}
              className={`min-h-[44px] w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                selectedOptionIndex !== null
                  ? "bg-[#796AEF] hover:bg-indigo-700 text-white active:scale-95"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Zap className="w-4 h-4 text-white" />
              <span>{isEng ? "Lock In Answer & Clock Time" : "उत्तर लॉक करें व समय दर्ज करें (Lock & Clock Time)"}</span>
            </button>
          </div>
        )}

        {/* Post-Submission Speed Diagnosis & Shortcut Deconstruction */}
        {isAnswerSubmitted && (
          <SprintSpeedDiagnosisCard
            isEng={isEng}
            activeQuestion={activeQuestion}
            activeProfile={activeProfile}
            selectedOptionIndex={selectedOptionIndex}
            elapsedSeconds={elapsedSeconds}
            onDiscussWithCherry={onDiscussWithCherry}
            onEnterClassroom={onEnterClassroom}
          />
        )}
      </div>
    </div>
  );
};
