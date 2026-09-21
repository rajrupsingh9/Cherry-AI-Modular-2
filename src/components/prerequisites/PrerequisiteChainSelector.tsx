/**
 * PrerequisiteChainSelector.tsx
 * Subject filtering pills, search input, and interactive cards for selecting dependency chains.
 */
import React from "react";
import { Search, Link, Unlink } from "lucide-react";
import { DiagnosedChain } from "./prerequisiteTypes";

interface PrerequisiteChainSelectorProps {
  isEng: boolean;
  selectedSubject: string;
  onSelectSubject: (subj: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filteredChains: DiagnosedChain[];
  selectedChainId: string;
  onSelectChainId: (id: string) => void;
}

export const PrerequisiteChainSelector: React.FC<PrerequisiteChainSelectorProps> = ({
  isEng,
  selectedSubject,
  onSelectSubject,
  searchQuery,
  onSearchChange,
  filteredChains,
  selectedChainId,
  onSelectChainId
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        {/* Subject Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {[
            { id: "all", label: isEng ? "🌐 All Subjects" : "🌐 सभी विषय (All)" },
            { id: "Mathematics", label: isEng ? "📐 Mathematics" : "📐 गणित" },
            { id: "Physics", label: isEng ? "⚡ Physics" : "⚡ भौतिकी" },
            { id: "Chemistry", label: isEng ? "🧪 Chemistry" : "🧪 रसायन" },
            { id: "Biology", label: isEng ? "🧬 Biology" : "🧬 जीवविज्ञान" }
          ].map((subj) => (
            <button
              key={subj.id}
              type="button"
              onClick={() => onSelectSubject(subj.id)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                selectedSubject === subj.id
                  ? "bg-[#796AEF] text-white border-[#796AEF] shadow-2xs font-black ring-2 ring-indigo-200"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>{subj.label}</span>
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={isEng ? "Search topic or prerequisite..." : "टॉपिक या प्रिरिक्विज़िट खोजें..."}
            className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#796AEF] focus:border-[#796AEF] text-slate-900 font-medium placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Chain Picker Carousel / Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-700 uppercase tracking-wider font-bold block">
            {isEng ? "Select Concept Chain to Inspect:" : "जांच हेतु कॉन्सेप्ट चेन चुनें (Select Chain to Inspect):"}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {isEng ? `${filteredChains.length} chains available` : `${filteredChains.length} चेन्स उपलब्ध`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredChains.map((chain) => {
            const isSelected = selectedChainId === chain.id;

            return (
              <button
                key={chain.id}
                type="button"
                onClick={() => onSelectChainId(chain.id)}
                className={`min-h-[108px] p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? "bg-indigo-50/80 text-slate-900 border-[#796AEF] shadow-sm ring-2 ring-[#796AEF]/30"
                    : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-indigo-300 shadow-2xs"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md ${
                        isSelected
                          ? "bg-[#796AEF] text-white"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {chain.subject} • Class {chain.grade}
                    </span>

                    {chain.hasBrokenLink ? (
                      <span className="text-[9.5px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Unlink className="w-3 h-3 text-rose-600" />
                        <span>{isEng ? "Root Gap" : "रूट गैप (Broken)"}</span>
                      </span>
                    ) : (
                      <span className="text-[9.5px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Link className="w-3 h-3 text-emerald-600" />
                        <span>{isEng ? "Stable" : "स्थिर (Stable)"}</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug line-clamp-1">
                    {!isEng && chain.hindiTargetConcept ? `${chain.hindiTargetConcept}` : chain.targetConcept}
                  </h4>

                  <p className="text-[11px] font-medium text-slate-500 line-clamp-1">
                    {isEng
                      ? `Chapter: ${chain.chapterName}`
                      : `अध्याय: ${chain.hindiChapterName || chain.chapterName} (${chain.targetConcept})`}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10.5px] font-mono pt-2 border-t border-slate-100">
                  <span className="text-amber-700 font-bold flex items-center gap-1">
                    🎯 {chain.boardMarksAtRisk} {isEng ? "Board Marks at Risk" : "बोर्ड अंक दांव पर"}
                  </span>
                  <span className={isSelected ? "text-[#796AEF] font-bold" : "text-slate-400"}>
                    {chain.nodes.length} {isEng ? "Stepwise Links →" : "चरणबद्ध कड़ियाँ →"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
