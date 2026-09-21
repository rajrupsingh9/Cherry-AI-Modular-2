/**
 * StudioTopicCard.tsx
 * Display and editable input for auto-generated episode topic/title
 */
import React from "react";
import { Sparkles } from "lucide-react";
import { SourceFileState } from "./studioTypes";

interface StudioTopicCardProps {
  sourceFile: SourceFileState | null;
  topicName: string;
  setTopicName: (name: string) => void;
}

export const StudioTopicCard: React.FC<StudioTopicCardProps> = ({
  sourceFile,
  topicName,
  setTopicName,
}) => {
  return (
    <div
      id="studio-topic-card"
      className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/90 space-y-1.5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#796AEF]" />
          <span>Audio Overview Topic / Title:</span>
        </span>
        <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Auto-Generated from Content
        </span>
      </div>

      {sourceFile?.isExtracting ? (
        <div className="flex items-center gap-2 py-2 px-3 text-xs text-[#796AEF] font-medium bg-indigo-50/60 rounded-lg border border-indigo-100">
          <Sparkles className="w-3.5 h-3.5 animate-spin shrink-0" />
          <span className="animate-pulse">
            Analyzing content & automatically generating topic title...
          </span>
        </div>
      ) : topicName ? (
        <div className="relative">
          <input
            id="studio-topic-title-input"
            type="text"
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
            placeholder="Topic title auto-generated from content..."
            className="w-full text-xs sm:text-sm font-bold text-slate-900 bg-white border border-slate-200 focus:border-[#796AEF] focus:ring-2 focus:ring-indigo-100 rounded-lg px-3 py-2 outline-none transition shadow-2xs"
            title="Auto-generated topic name (editable)"
          />
        </div>
      ) : (
        <div className="text-xs text-slate-400 italic py-2 px-3 bg-white border border-slate-200/60 rounded-lg flex items-center justify-between">
          <span>Upload document or paste notes to auto-generate topic title...</span>
          <span className="text-[10px] text-slate-400 not-italic font-normal">
            Waiting for content
          </span>
        </div>
      )}
    </div>
  );
};
