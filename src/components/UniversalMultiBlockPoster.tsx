import React from "react";
import {
  Layers,
  FlaskConical,
  AlertTriangle,
  Factory,
  Globe2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface UniversalMultiBlockPosterProps {
  occurrenceCardData?: any;
  formsCardData?: any;
  labPrepSectionData?: any;
  manufactureSectionData?: any;
  examTrapsData?: any;
  renderTextWithKatex?: (text: string) => React.ReactNode;
  renderKatex?: (latex: string, displayMode?: boolean) => any;
}

export const UniversalMultiBlockPoster: React.FC<UniversalMultiBlockPosterProps> = ({
  occurrenceCardData,
  formsCardData,
  labPrepSectionData,
  manufactureSectionData,
  examTrapsData,
  renderTextWithKatex = (text) => text,
  renderKatex = (latex, _displayMode) => latex,
}) => {
  return (
    <div className="flex flex-col gap-5 w-full my-4">
      {/* 2-Column Grid for Occurrence and Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Occurrence Card */}
        {occurrenceCardData && (
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col gap-2">
            <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider">
              <Globe2 className="w-4 h-4 text-teal-600" />
              <span>{occurrenceCardData.title || "Occurrence in Nature"}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {renderTextWithKatex(occurrenceCardData.description || "")}
            </p>
            {occurrenceCardData.points && (
              <ul className="flex flex-col gap-1 mt-1 text-[11px] text-slate-500">
                {occurrenceCardData.points.map((pt: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                    <span>{renderTextWithKatex(pt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Forms / Allotropes Card */}
        {formsCardData && (
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col gap-2">
            <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs uppercase tracking-wider">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>{formsCardData.title || "Physical Forms & States"}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {renderTextWithKatex(formsCardData.description || "")}
            </p>
            {formsCardData.items && (
              <div className="grid grid-cols-2 gap-2 mt-1">
                {formsCardData.items.map((item: any, i: number) => (
                  <div key={i} className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px]">
                    <span className="font-bold text-slate-800 block">{item.name || item}</span>
                    {item.details && <span className="text-slate-500">{item.details}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lab Preparation & Industrial Manufacture */}
      {(labPrepSectionData || manufactureSectionData) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {labPrepSectionData && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col gap-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                <FlaskConical className="w-4 h-4 text-emerald-600" />
                <span>{labPrepSectionData.title || "Laboratory Preparation"}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {renderTextWithKatex(labPrepSectionData.reaction || labPrepSectionData.description || "")}
              </p>
              {labPrepSectionData.formulaLatex && (
                <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-center my-1">
                  {renderKatex(labPrepSectionData.formulaLatex, true)}
                </div>
              )}
            </div>
          )}

          {manufactureSectionData && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col gap-2">
              <div className="flex items-center gap-2 text-purple-800 font-bold text-xs uppercase tracking-wider">
                <Factory className="w-4 h-4 text-purple-600" />
                <span>{manufactureSectionData.title || "Industrial Manufacture"}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {renderTextWithKatex(manufactureSectionData.processName || manufactureSectionData.description || "")}
              </p>
              {manufactureSectionData.formulaLatex && (
                <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-200/60 text-center my-1">
                  {renderKatex(manufactureSectionData.formulaLatex, true)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Exam Traps Alert Block */}
      {examTrapsData && (
        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex flex-col gap-2 shadow-2xs">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{examTrapsData.title || "Board Examination Pitfalls & Traps"}</span>
          </div>
          {examTrapsData.traps ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {examTrapsData.traps.map((trap: any, i: number) => (
                <div key={i} className="p-2.5 rounded-xl bg-white border border-rose-200/60 text-xs">
                  <span className="font-bold text-rose-700 block mb-0.5">
                    {trap.misconception || trap.title}
                  </span>
                  <span className="text-slate-600">{trap.correctConcept || trap.description}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-rose-900 leading-relaxed">
              {renderTextWithKatex(examTrapsData.description || "")}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
