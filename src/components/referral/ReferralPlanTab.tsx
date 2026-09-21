/**
 * ReferralPlanTab.tsx
 * Tab 1: 5-Level Commission Structure and Subscription Plan Commission Matrix
 */
import React from "react";
import { Sparkles, Percent, ArrowUpRight } from "lucide-react";
import { calculateTieredReferralReward } from "../../utils/referralStore";
import { ReferralPlanTabProps } from "./referralTypes";

export const ReferralPlanTab: React.FC<ReferralPlanTabProps> = ({
  dynamicTiers,
  refState,
  referrerTier,
  vipTier,
  isReferrerVip,
  subscriptionPlans,
  commissionConfig,
  effectiveUid,
  effectiveName,
  onOpenSubscriptionPlans,
}) => {
  return (
    <div className="space-y-2.5">
      {/* Intro explanation banner */}
      <div className="p-3 bg-gradient-to-r from-indigo-50 via-purple-50 to-emerald-50/50 border border-indigo-100 rounded-xl text-slate-800 text-xs flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <span className="font-bold text-indigo-950 block text-[11.5px]">
              5-Level Income Compensation Architecture
            </span>
            <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold border border-indigo-200/60">
              {referrerTier.label} ({referrerTier.level1Percent}%)
            </span>
          </div>
          <span className="text-slate-600 text-[10.5px] leading-relaxed mt-0.5 block">
            Direct referrals par{" "}
            <strong className="text-emerald-700 font-bold">
              {referrerTier.level1Percent}%
            </strong>{" "}
            aur 5th tier indirect network referrals par{" "}
            <strong className="text-purple-700 font-bold">
              {referrerTier.level5Percent}%
            </strong>{" "}
            active plan tier ke anusar milte hain.
          </span>
        </div>
      </div>

      {/* 5 Dynamic Tier Cards */}
      <div className="space-y-2">
        {dynamicTiers.map((tier) => {
          const count = refState.tierCounts[tier.level] || 0;
          const earnedFromActivities = (refState.activities || [])
            .filter((a) => a.level === tier.level && a.status === "credited")
            .reduce((acc, curr) => acc + (curr.amount || 0), 0);
          const earned =
            earnedFromActivities > 0
              ? earnedFromActivities
              : count *
                (tier.level === 1
                  ? Math.max(1, Math.round(149 * (referrerTier.level1Percent / 100)))
                  : tier.level === 5
                  ? Math.max(1, Math.round(149 * (referrerTier.level5Percent / 100)))
                  : 0);
          const isEarningLevel = (tier.percentage ?? 0) > 0 || tier.incomePerMember > 0;
          const rateTag =
            tier.rateLabel ||
            (isEarningLevel
              ? `${tier.percentage || (tier.level === 1 ? referrerTier.level1Percent : referrerTier.level5Percent)}% / student`
              : "₹0 / student");

          return (
            <div
              key={tier.level}
              className={`p-3 rounded-2xl border transition-all shadow-2xs space-y-2 ${
                isEarningLevel
                  ? tier.level === 1
                    ? "bg-emerald-50/70 border-emerald-200"
                    : "bg-purple-50/70 border-purple-200"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl text-white flex items-center justify-center font-mono font-black text-xs shadow-xs shrink-0 bg-gradient-to-tr ${tier.badgeColor}`}
                  >
                    L{tier.level}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-black text-slate-900 text-xs truncate">
                      {tier.label}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate">
                      {tier.description}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-black shrink-0 ${
                    isEarningLevel
                      ? tier.level === 1
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-purple-100 text-purple-800 border border-purple-300"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  {rateTag}
                </span>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 text-[10px]">
                <span className="text-slate-500 font-medium">
                  Active: <strong className="text-slate-800">{count} Students</strong>
                </span>
                <span className="font-black">
                  Earned:{" "}
                  <span
                    className={
                      earned > 0
                        ? tier.level === 1
                          ? "text-emerald-700 font-mono font-black text-xs"
                          : "text-purple-700 font-mono font-black text-xs"
                        : "text-slate-400 font-mono font-bold"
                    }
                  >
                    ₹{earned}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscription Plans Commission Rate Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
              <Percent className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-xs sm:text-sm">
                Plan Commission Matrix
              </h4>
              <span className="text-[10px] text-slate-500 block">
                Rewards dynamically scale by student's plan price & duration
              </span>
            </div>
          </div>

          {!isReferrerVip && (
            <button
              type="button"
              onClick={() => {
                if (onOpenSubscriptionPlans) onOpenSubscriptionPlans();
                window.dispatchEvent(new CustomEvent("cherry_open_subscription_plans"));
              }}
              className="text-[10px] font-black text-indigo-700 hover:text-indigo-900 cursor-pointer flex items-center gap-0.5"
            >
              <span>Unlock VIP</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Plan Tier Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {subscriptionPlans.map((plan) => {
            const myEarnings = calculateTieredReferralReward({
              planPriceINR: plan.priceINR,
              planDurationMonths: plan.durationMonths,
              planId: plan.id,
              planName: plan.name,
              referrerIdOrName: effectiveUid || effectiveName,
              config: commissionConfig,
            });

            const vipL1 = Math.max(1, Math.round(plan.priceINR * (vipTier.level1Percent / 100)));
            const vipL5 = Math.max(1, Math.round(plan.priceINR * (vipTier.level5Percent / 100)));

            return (
              <div
                key={plan.id}
                className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 space-y-1.5 transition-colors"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-slate-900 truncate">
                    {plan.name}
                  </span>
                  <span className="text-[11px] font-mono font-black text-indigo-700 shrink-0">
                    ₹{plan.priceINR}
                  </span>
                </div>

                {/* Level 1 & Level 5 Row */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-1 border-t border-slate-200/60">
                  <div className="bg-white rounded-lg p-1.5 border border-slate-100 text-center">
                    <span className="text-[8.5px] font-mono uppercase text-slate-400 block">
                      Level 1 (Direct)
                    </span>
                    <span className="font-mono font-black text-emerald-700 text-xs">
                      ₹{myEarnings.level1Reward}
                    </span>
                    <span className="text-[8px] text-slate-400 block">
                      ({myEarnings.level1Percent}%)
                    </span>
                  </div>

                  <div className="bg-white rounded-lg p-1.5 border border-slate-100 text-center">
                    <span className="text-[8.5px] font-mono uppercase text-slate-400 block">
                      Level 5 (Team)
                    </span>
                    <span
                      className={`font-mono font-black text-xs ${
                        myEarnings.level5Reward > 0 ? "text-purple-700" : "text-slate-400"
                      }`}
                    >
                      ₹{myEarnings.level5Reward}
                    </span>
                    <span className="text-[8px] text-slate-400 block">
                      ({myEarnings.level5Percent}%)
                    </span>
                  </div>
                </div>

                {!isReferrerVip && vipL1 > myEarnings.level1Reward && (
                  <div className="text-[9px] text-amber-800 font-medium text-center bg-amber-50 rounded-md py-0.5 border border-amber-200/60">
                    On {vipTier.label} VIP:{" "}
                    <strong className="text-amber-950 font-mono">
                      ₹{vipL1} L1 + ₹{vipL5} L5
                    </strong>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
