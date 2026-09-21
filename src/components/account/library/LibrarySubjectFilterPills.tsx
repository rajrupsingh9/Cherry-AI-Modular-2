/**
 * LibrarySubjectFilterPills.tsx
 * Horizontal scrollable row of subject pills, starred filter, and clear filter button.
 */
import React from "react";
import { Star } from "lucide-react";
import { BookHubTab } from "./libraryTypes";

interface LibrarySubjectFilterPillsProps {
  bookHubActiveTab: BookHubTab;
  selectedBookSubjectFilter: string;
  setSelectedBookSubjectFilter: (filter: string) => void;
  selectedSnapshotSubjectFilter: string;
  setSelectedSnapshotSubjectFilter: (filter: string) => void;
  bookSubjectCounts: Record<string, number>;
  snapshotSubjectCounts: Record<string, number>;
  starredBookIds: Record<string, boolean>;
  allBooksLength: number;
  subject?: string;
  hasActiveFilter: boolean;
  onResetFilters: () => void;
}

export const LibrarySubjectFilterPills: React.FC<LibrarySubjectFilterPillsProps> = ({
  bookHubActiveTab,
  selectedBookSubjectFilter,
  setSelectedBookSubjectFilter,
  selectedSnapshotSubjectFilter,
  setSelectedSnapshotSubjectFilter,
  bookSubjectCounts,
  snapshotSubjectCounts,
  starredBookIds,
  allBooksLength,
  subject,
  hasActiveFilter,
  onResetFilters,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-[#EFF1F5] pt-2">
      {bookHubActiveTab === "books" ? (
        <>
          <button
            type="button"
            onClick={() => setSelectedBookSubjectFilter("all")}
            className={`min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-xl font-mono text-[11.5px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
              selectedBookSubjectFilter === "all"
                ? "bg-[#796AEF] text-white border-[#796AEF] shadow-xs font-black"
                : "bg-[#F6F7FB] hover:bg-zinc-100 text-zinc-600 border-[#EFF1F5]"
            }`}
          >
            <span>📚</span>
            <span>All Books</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                selectedBookSubjectFilter === "all"
                  ? "bg-white/20 text-white font-bold"
                  : "bg-zinc-200/60 text-zinc-600"
              }`}
            >
              {allBooksLength}
            </span>
          </button>

          {/* Starred Books Pill */}
          <button
            type="button"
            onClick={() =>
              setSelectedBookSubjectFilter(
                selectedBookSubjectFilter === "starred" ? "all" : "starred",
              )
            }
            className={`min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-xl font-mono text-[11.5px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
              selectedBookSubjectFilter === "starred"
                ? "bg-amber-500 text-white border-amber-500 shadow-xs font-black"
                : "bg-[#F6F7FB] hover:bg-zinc-100 text-zinc-600 border-[#EFF1F5]"
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                selectedBookSubjectFilter === "starred"
                  ? "fill-white text-white"
                  : "text-amber-500"
              }`}
            />
            <span>Starred</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                selectedBookSubjectFilter === "starred"
                  ? "bg-white/20 text-white"
                  : "bg-zinc-200/60 text-zinc-600"
              }`}
            >
              {Object.values(starredBookIds).filter(Boolean).length}
            </span>
          </button>

          {[
            { key: "Mathematics", label: "Math", icon: "📐", count: bookSubjectCounts.Mathematics || 0 },
            { key: "Physics", label: "Physics", icon: "⚡", count: bookSubjectCounts.Physics || 0 },
            { key: "Chemistry", label: "Chemistry", icon: "🧪", count: bookSubjectCounts.Chemistry || 0 },
            { key: "Biology", label: "Biology", icon: "🌱", count: bookSubjectCounts.Biology || 0 },
            { key: "Science", label: "Science", icon: "🔬", count: bookSubjectCounts.Science || 0 },
          ]
            .filter(
              (s) =>
                s.count > 0 ||
                s.key.toLowerCase() === (subject || "").toLowerCase(),
            )
            .map((subj) => {
              const isSelected =
                selectedBookSubjectFilter.toLowerCase() === subj.key.toLowerCase();
              return (
                <button
                  key={subj.key}
                  type="button"
                  onClick={() => setSelectedBookSubjectFilter(subj.key)}
                  className={`min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-xl font-mono text-[11.5px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                    isSelected
                      ? "bg-[#796AEF] text-white border-[#796AEF] shadow-xs font-black"
                      : "bg-[#F6F7FB] hover:bg-zinc-100 text-zinc-600 border-[#EFF1F5]"
                  }`}
                >
                  <span>{subj.icon}</span>
                  <span>{subj.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                      isSelected
                        ? "bg-white/20 text-white font-bold"
                        : "bg-zinc-200/60 text-zinc-600"
                    }`}
                  >
                    {subj.count}
                  </span>
                </button>
              );
            })}
        </>
      ) : (
        <>
          {[
            { key: "all", label: "All Slates", icon: "📸", count: snapshotSubjectCounts.all || 0 },
            { key: "Mathematics", label: "Math", icon: "📐", count: snapshotSubjectCounts.Mathematics || 0 },
            { key: "Physics", label: "Physics", icon: "⚡", count: snapshotSubjectCounts.Physics || 0 },
            { key: "Chemistry", label: "Chemistry", icon: "🧪", count: snapshotSubjectCounts.Chemistry || 0 },
            { key: "Biology", label: "Biology", icon: "🌱", count: snapshotSubjectCounts.Biology || 0 },
            { key: "Science", label: "Science", icon: "🔬", count: snapshotSubjectCounts.Science || 0 },
            { key: "General", label: "General", icon: "📖", count: snapshotSubjectCounts.General || 0 },
          ]
            .filter(
              (tab) =>
                tab.key === "all" ||
                tab.count > 0 ||
                tab.key.toLowerCase() === (subject || "").toLowerCase(),
            )
            .map((tab) => {
              const isSelected =
                selectedSnapshotSubjectFilter.toLowerCase() === tab.key.toLowerCase();
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedSnapshotSubjectFilter(tab.key)}
                  className={`min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-xl font-mono text-[11.5px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                    isSelected
                      ? "bg-[#796AEF] text-white border-[#796AEF] shadow-xs font-black"
                      : "bg-[#F6F7FB] hover:bg-zinc-100 text-zinc-600 border-[#EFF1F5]"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                      isSelected
                        ? "bg-white/20 text-white font-bold"
                        : "bg-zinc-200/60 text-zinc-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
        </>
      )}

      {/* Reset Filters Quick Button */}
      {hasActiveFilter && (
        <button
          type="button"
          onClick={onResetFilters}
          className="min-h-[44px] sm:min-h-[36px] px-2.5 py-1.5 rounded-xl font-mono text-[11px] text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all shrink-0 cursor-pointer ml-auto flex items-center justify-center"
        >
          ✕ Clear Filters
        </button>
      )}
    </div>
  );
};
