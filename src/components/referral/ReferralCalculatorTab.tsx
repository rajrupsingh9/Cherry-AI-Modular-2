/**
 * ReferralCalculatorTab.tsx
 * Tab 2: Interactive 5-Level Compounding Income Simulator
 */
import React from "react";
import { TrendingUp } from "lucide-react";
import { ReferralCalculatorTabProps } from "./referralTypes";

export const ReferralCalculatorTab: React.FC<ReferralCalculatorTabProps> = ({
  subscriptionPlans,
  calcSelectedPlanId,
  setCalcSelectedPlanId,
  calcDirectInvites,
  setCalcDirectInvites,
  calcDuplicationRate,
  setCalcDuplicationRate,
  referrerTier,
  vipTier,
  isReferrerVip,
  calcLevel1Earned,
  calcLevel5Members,
  calcLevel5Earned,
  calcTotalPotential,
  calcRewardBreakdown,
  calcVipTotalPotential,
  calcVipUpgradeDifference,
  onOpenSubscriptionPlans,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3.5">
      <div className="space-y-0.5">
        <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          5-Level Compounding Income Simulator
        </h3>
        <p className="text-[11px] text-slate-500">
          Check potential earnings from 1st and 5th Level network growth based on chosen plan.
        </p>
      </div>

      {/* Plan Selector for Simulator */}
      <div className="space-y-1.5 p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl">
        <div className="flex items-center justify-between text-[9.5px] font-mono font-bold uppercase tracking-wider text-indigo-900">
          <span>Select Student Plan:</span>
          <span className="text-indigo-600 lowercase font-sans font-semibold">
            rewards scale with price
          </span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 touch-pan-x overscroll-x-contain">
          {subscriptionPlans.map((p) => {
            const isSelected = p.id === calcSelectedPlanId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setCalcSelectedPlanId(p.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer active:scale-95 shrink-0 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{p.name}</span>
                <span className="ml-1 opacity-80 font-mono">₹{p.priceINR}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
        {/* Slider 1: Direct Invites */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>1st Level Direct Invites:</span>
            <span className="text-emerald-700 font-black font-mono">
              {calcDirectInvites} Friends (₹{calcLevel1Earned})
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="25"
            value={calcDirectInvites}
            onChange={(e) => setCalcDirectInvites(parseInt(e.target.value))}
            className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex gap-1.5 pt-0.5">
            {[3, 5, 10, 20].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setCalcDirectInvites(num)}
                className={`px-2 py-0.5 rounded text-[9.5px] font-bold font-mono transition-all cursor-pointer ${
                  calcDirectInvites === num
                    ? "bg-emerald-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600"
                }`}
              >
                {num} Invites
              </button>
            ))}
          </div>
        </div>

        {/* Slider 2: Duplication */}
        <div className="space-y-1.5 pt-2 border-t border-slate-200">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>Team Duplication (per student):</span>
            <span className="text-purple-700 font-black font-mono">
              {calcDuplicationRate} Invites/friend
            </span>
          </div>
          <input
            type="range"
            min="2"
            max="5"
            value={calcDuplicationRate}
            onChange={(e) => setCalcDuplicationRate(parseInt(e.target.value))}
            className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 block">
            5th Level Network reaches ~<strong>{calcLevel5Members.toLocaleString()}</strong> students
          </span>
        </div>
      </div>

      {/* Calculator Output Grid */}
      <div className="p-3 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-2xl space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-indigo-200 block">
            Estimated Potential ({referrerTier.label}):
          </span>
          <span className="text-[9px] font-mono bg-white/10 px-2 py-0.5 rounded-full text-indigo-200">
            {calcRewardBreakdown.level1Percent}% L1 / {calcRewardBreakdown.level5Percent}% L5
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
            <span className="text-[8px] font-mono text-emerald-300 uppercase font-bold block truncate">
              1st Level (Direct)
            </span>
            <span className="text-xs sm:text-sm font-black text-white mt-0.5 block truncate">
              ₹{calcLevel1Earned.toLocaleString()}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
            <span className="text-[8px] font-mono text-purple-300 uppercase font-bold block truncate">
              5th Level (Team)
            </span>
            <span className="text-xs sm:text-sm font-black text-white mt-0.5 block truncate">
              ₹{calcLevel5Earned.toLocaleString()}
            </span>
          </div>

          <div className="bg-emerald-500 text-white rounded-xl p-2 shadow-xs border border-emerald-400/40">
            <span className="text-[8px] font-mono text-emerald-100 uppercase font-bold block truncate">
              Total ₹
            </span>
            <span className="text-xs sm:text-sm font-black text-white mt-0.5 block truncate">
              ₹{calcTotalPotential.toLocaleString()}
            </span>
          </div>
        </div>

        {/* VIP Comparison Banner inside Simulator */}
        {!isReferrerVip && calcVipUpgradeDifference > 0 && (
          <div className="p-2 bg-white/10 backdrop-blur-xs border border-amber-400/40 rounded-xl flex items-center justify-between gap-2 mt-1">
            <div className="min-w-0">
              <span className="text-[9px] text-amber-300 font-mono font-bold uppercase block">
                👑 {vipTier.label} VIP Earning Potential:
              </span>
              <span className="text-[11px] font-black text-white">
                ₹{calcVipTotalPotential.toLocaleString()}{" "}
                <span className="text-emerald-300 text-[10px] font-bold font-mono">
                  (+₹{calcVipUpgradeDifference.toLocaleString()} extra)
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onOpenSubscriptionPlans) onOpenSubscriptionPlans();
                window.dispatchEvent(new CustomEvent("cherry_open_subscription_plans"));
              }}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950 font-black text-[10px] uppercase tracking-wider shadow-xs active:scale-95 cursor-pointer shrink-0"
            >
              Upgrade VIP
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
