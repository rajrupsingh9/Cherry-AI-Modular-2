/**
 * SnapshotsGridList.tsx
 * Renders chalkboard photo slates and derivations in Grid or Carousel layout with modal inspection and deletion.
 */
import React from "react";
import { Eye, Trash2, Maximize2 } from "lucide-react";
import { BoardSnapshot } from "../accountTypes";
import { LibraryViewMode } from "./libraryTypes";

interface SnapshotsGridListProps {
  snapshots: BoardSnapshot[];
  filteredSnapshots: BoardSnapshot[];
  snapshotsViewMode: LibraryViewMode;
  snapshotScrollContainerRef: React.RefObject<HTMLDivElement | null>;
  snapshotSearchQuery: string;
  subject?: string;
  onOpenSnapshotModal: (snap: BoardSnapshot) => void;
  onDeleteSnapshot: (id: string) => void;
}

export const SnapshotsGridList: React.FC<SnapshotsGridListProps> = ({
  snapshots,
  filteredSnapshots,
  snapshotsViewMode,
  snapshotScrollContainerRef,
  snapshotSearchQuery,
  subject,
  onOpenSnapshotModal,
  onDeleteSnapshot,
}) => {
  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="border border-dashed border-[#EFF1F5] rounded-2xl p-10 bg-[#F6F7FB]/60 text-center select-none space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#796AEF] border border-[#796AEF]/30 flex items-center justify-center text-xl mx-auto shadow-2xs">
          📸
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-800">No Saved Chalkboard Slates Yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tap the Camera icon during any classroom lecture to snapshot key formulas, blackboard diagrams, and study slates directly to your portfolio.
          </p>
        </div>
      </div>
    );
  }

  if (filteredSnapshots.length === 0) {
    return (
      <div className="border border-dashed border-[#EFF1F5] rounded-2xl p-10 bg-[#F6F7FB]/60 text-center select-none space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#796AEF] border border-[#796AEF]/30 flex items-center justify-center text-xl mx-auto shadow-2xs">
          📸
        </div>
        <div className="space-y-1">
          <p className="text-sm font-black text-slate-700">No matching board slates found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {snapshotSearchQuery
              ? `No snapshot matched "${snapshotSearchQuery}". Try clearing search.`
              : "Try selecting a different subject tab."}
          </p>
        </div>
      </div>
    );
  }

  const renderSnapshotCard = (snap: BoardSnapshot, idx: number) => {
    const formattedDate = snap.timestamp?.toDate
      ? snap.timestamp.toDate().toLocaleDateString()
      : snap.timestamp
        ? new Date(snap.timestamp).toLocaleDateString()
        : "Recent";

    return (
      <div
        key={snap.id || snap.snapshotId || idx}
        className={`bg-white border border-[#EFF1F5]/90 rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group ${
          snapshotsViewMode === "carousel" ? "snap-start shrink-0 w-[88vw] sm:w-[340px]" : ""
        }`}
      >
        {snap.imgData ? (
          <div
            onClick={() => onOpenSnapshotModal(snap)}
            className="w-full h-36 bg-slate-900 relative overflow-hidden cursor-pointer group-hover:opacity-95 transition-opacity"
          >
            <img
              src={snap.imgData}
              alt={snap.topicTitle || "Chalkboard snapshot"}
              className="w-full h-full object-contain p-1.5"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold">
              <Maximize2 className="w-4 h-4" />
              <span>View Full Slide</span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => onOpenSnapshotModal(snap)}
            className="w-full h-36 bg-slate-900 flex items-center justify-center p-3 text-slate-400 text-xs font-mono cursor-pointer"
          >
            <span>📸 Chalkboard Slate</span>
          </div>
        )}

        <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <span className="text-[10.5px] font-mono font-bold uppercase text-[#796AEF] bg-[#EEF2FF] px-2 py-0.5 rounded-md border border-[#796AEF]/20">
                {snap.subject || subject || "Science"}
              </span>
              <span className="text-[10.5px] font-mono text-slate-400">
                {formattedDate}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-[#796AEF] transition-colors">
              {snap.topicTitle || "Blackboard Formulation"}
            </h4>
          </div>

          <div className="pt-2 border-t border-[#EFF1F5] flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onOpenSnapshotModal(snap)}
              className="flex-1 min-h-[44px] sm:min-h-[38px] py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-[#EEF2FF] text-slate-700 hover:text-[#796AEF] border border-[#EFF1F5]/80 hover:border-[#796AEF]/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect</span>
            </button>
            <button
              type="button"
              onClick={() => onDeleteSnapshot(snap.id)}
              className="min-h-[44px] sm:min-h-[38px] p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-[#EFF1F5]/80 hover:border-rose-200 transition-all cursor-pointer flex items-center justify-center"
              title="Delete Snapshot"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {snapshotsViewMode === "carousel" ? (
        <div
          ref={snapshotScrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none"
        >
          {filteredSnapshots.map((snap, idx) => renderSnapshotCard(snap, idx))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSnapshots.map((snap, idx) => renderSnapshotCard(snap, idx))}
        </div>
      )}
    </div>
  );
};
