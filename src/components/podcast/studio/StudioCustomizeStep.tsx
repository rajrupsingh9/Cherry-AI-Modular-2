/**
 * StudioCustomizeStep.tsx
 * Step 2: Format & Depth selection, Host Voice Profiles, and Language Auto-Sync
 */
import React from "react";
import { Headphones, Radio } from "lucide-react";
import { PodcastEpisodeType, PodcastLanguage } from "../../../types";
import { HostPairType } from "./studioTypes";

interface StudioCustomizeStepProps {
  episodeType: PodcastEpisodeType;
  setEpisodeType: (type: PodcastEpisodeType) => void;
  setTargetDurationMins: (mins: number) => void;
  hostPair: HostPairType;
  setHostPair: (pair: HostPairType) => void;
  resolvedLanguage: PodcastLanguage;
  onSelectCherry: () => void;
  onSelectAarav: () => void;
}

export const StudioCustomizeStep: React.FC<StudioCustomizeStepProps> = ({
  episodeType,
  setEpisodeType,
  setTargetDurationMins,
  hostPair,
  resolvedLanguage,
  onSelectCherry,
  onSelectAarav,
}) => {
  const episodeFormats = [
    {
      id: "rapid_viva",
      label: "Rapid Viva / Quiz",
      hindiLabel: "रैपिड वाइवा",
      range: "2.5-4m",
      defaultMins: 3,
      icon: "🎯",
    },
    {
      id: "exam_booster",
      label: "Exam-Morning Audio",
      hindiLabel: "एग्ज़ाम डे बूस्टर",
      range: "3-4m",
      defaultMins: 3.5,
      icon: "🚀",
    },
    {
      id: "quick_revision",
      label: "Quick Recap",
      hindiLabel: "त्वरित रीकैप",
      range: "2.5-5m",
      defaultMins: 3.5,
      icon: "⚡",
    },
    {
      id: "exam_trap",
      label: "Exam Traps",
      hindiLabel: "परीक्षा ट्रैप्स",
      range: "2-4m",
      defaultMins: 3,
      icon: "🛡️",
    },
  ];

  return (
    <div id="studio-customize-step" className="space-y-3 pt-2 border-t border-slate-100">
      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#796AEF]" />
        <span>2. Customize Audio Conversation:</span>
      </label>

      <div className="space-y-2.5">
        {/* Episode Type Selection */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-600 tracking-wider flex items-center gap-1">
              <Radio className="w-3 h-3 text-[#796AEF]" /> Format & Depth (ऑडियो मोड)
            </span>
            <span className="text-[9px] text-[#796AEF] font-bold">
              {episodeType === "rapid_viva"
                ? "2.5 – 4 Mins"
                : episodeType === "exam_booster"
                ? "3 – 4 Mins"
                : episodeType === "quick_revision"
                ? "2.5 – 5 Mins"
                : "2 – 4 Mins"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {episodeFormats.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setEpisodeType(item.id as PodcastEpisodeType);
                  setTargetDurationMins(item.defaultMins);
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition text-left cursor-pointer flex flex-col justify-between ${
                  episodeType === item.id
                    ? "bg-[#796AEF] text-white shadow-2xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:border-indigo-200"
                }`}
                title={`${item.label} (${item.range})`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs">{item.icon}</span>
                  <span
                    className={`text-[9px] font-semibold ${
                      episodeType === item.id ? "text-indigo-100" : "text-slate-500"
                    }`}
                  >
                    {item.range}
                  </span>
                </div>
                <span className="leading-tight text-[11px] font-bold mt-1">{item.label}</span>
                <span
                  className={`text-[9px] ${
                    episodeType === item.id ? "text-indigo-100" : "text-slate-500"
                  }`}
                >
                  {item.hindiLabel}
                </span>
              </button>
            ))}
          </div>

          <p className="text-[10px] text-indigo-900/80 font-medium px-0.5 pt-0.5 flex items-center gap-1">
            {episodeType === "rapid_viva" &&
              "🎯 Rapid Viva / Quiz: Active recall questions with instant mentor feedback (2.5-4 min)"}
            {episodeType === "exam_booster" &&
              "🚀 Exam-Morning 1-Page Audio (एग्ज़ाम डे बूस्टर): 80/20 essentials, top guaranteed questions & formula checklist (3-4 min)"}
            {episodeType === "quick_revision" &&
              "⚡ Quick Recap: High-speed formula blitz & key definitions sprint (2.5-5 min)"}
            {episodeType === "exam_trap" &&
              "🛡️ Exam Traps: Forensic examiner traps, pitfall warnings & defense shield (2-4 min)"}
          </p>
        </div>
      </div>

      {/* 2-Host & Voice Profile Selection */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase text-slate-600 tracking-wider flex items-center gap-1">
            <Headphones className="w-3 h-3 text-[#796AEF]" /> Host Voice Profile (आवाज़ और मेंटर चुनें)
          </span>
          <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Real Human Voice
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Option 1: Cherry Ma'am & Riya */}
          <button
            id="studio-host-cherry-btn"
            type="button"
            onClick={onSelectCherry}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
              hostPair === "cherry_riya"
                ? "bg-indigo-50/70 border-[#796AEF] ring-2 ring-[#796AEF]/20 shadow-2xs"
                : "bg-white border-slate-200/80 hover:border-indigo-200 hover:bg-slate-50/60"
            }`}
          >
            {hostPair === "cherry_riya" && (
              <span className="absolute top-2 right-2 text-[8px] bg-[#796AEF] text-white font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Active
              </span>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white border border-indigo-200 flex items-center justify-center text-lg shadow-2xs shrink-0">
                👩‍🏫
              </div>
              <div className="min-w-0 pr-10">
                <p className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                  <span>Cherry Ma'am & Riya</span>
                </p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                  Real Human-like Voice (Aoede • Warm & Empathetic)
                </p>
              </div>
            </div>
          </button>

          {/* Option 2: Aarav Sir & Riya */}
          <button
            id="studio-host-aarav-btn"
            type="button"
            onClick={onSelectAarav}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
              hostPair === "aarav_riya"
                ? "bg-indigo-50/70 border-[#796AEF] ring-2 ring-[#796AEF]/20 shadow-2xs"
                : "bg-white border-slate-200/80 hover:border-indigo-200 hover:bg-slate-50/60"
            }`}
          >
            {hostPair === "aarav_riya" && (
              <span className="absolute top-2 right-2 text-[8px] bg-[#796AEF] text-white font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Active
              </span>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg shadow-2xs shrink-0">
                👨‍🏫
              </div>
              <div className="min-w-0 pr-10">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  Aarav Sir & Riya
                </p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                  Master Mentor (Charon • Grounded & Relatable)
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Profile Language Auto-Sync Indicator */}
      <div className="p-2 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-[11px]">
        <span className="font-semibold text-slate-600 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#796AEF]" />
          Audio Language:
        </span>
        <span className="font-bold text-[#796AEF] bg-white px-2 py-0.5 rounded-md border border-indigo-100 shadow-2xs">
          {resolvedLanguage} (Student Profile)
        </span>
      </div>
    </div>
  );
};
