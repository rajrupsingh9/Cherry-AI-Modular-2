import React from "react";
import { X, Trash2 } from "lucide-react";
import { MathRenderer } from "../MathRenderer";

export interface SnapshotInspectModalProps {
  snapshot: any | null;
  subject?: string;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const SnapshotInspectModal: React.FC<SnapshotInspectModalProps> = ({
  snapshot,
  subject = "Science",
  onClose,
  onDelete,
}) => {
  if (!snapshot) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-sm">
              📸
            </span>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">
                {snapshot.topicTitle || "Classroom Chalkboard Snapshot"}
              </h4>
              <span className="text-[11px] font-mono text-indigo-300">
                {snapshot.subject || subject}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-black/50 space-y-3">
          {snapshot.imgData ? (
            <img
              src={snapshot.imgData}
              alt={snapshot.topicTitle || "Blackboard snapshot"}
              className="max-h-[60vh] object-contain rounded-xl border border-slate-800 shadow-lg"
            />
          ) : null}
          {snapshot.description && (
            <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs text-slate-300">
              <MathRenderer text={snapshot.description} />
            </div>
          )}
        </div>
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => onDelete(snapshot.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Slide</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
