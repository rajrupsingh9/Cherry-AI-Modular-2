/**
 * ReferralAlerts.tsx
 * Status alerts, account freeze banners, missed earnings warnings, and active referrer tier cards
 */
import React from "react";
import { Snowflake, ArrowRight, ArrowUpRight } from "lucide-react";
import { saveReferralState } from "../../utils/referralStore";
import { ReferralAlertsProps } from "./referralTypes";

export const ReferralAlerts: React.FC<ReferralAlertsProps> = ({
  refState,
  setRefState,
  effectiveUid,
  referrerTier,
  vipTier,
  isReferrerVip,
  onOpenSubscriptionPlans,
}) => {
  return (
    <div className="space-y-3.5">
      {/* Account Frozen Alert Banner */}
      {refState.isFrozen && (
        <div className="p-3.5 bg-cyan-950/90 border border-cyan-500/50 rounded-2xl text-white flex items-start gap-2.5 shadow-sm">
          <Snowflake className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-cyan-200">
              Referral Account Temporarily Frozen
            </h4>
            <p className="text-[11px] text-cyan-100 leading-snug">
              {refState.freezeReason ||
                "Administrative security lock. Withdrawals and referral earnings are temporarily paused."}
            </p>
          </div>
        </div>
      )}

      {/* Missed Higher Earnings Warning Banner */}
      {refState.lastMissedEarning && !refState.lastMissedEarning.isAcknowledged && (
        <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl text-amber-950 shadow-xs space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                ⚡
              </div>
              <div>
                <h4 className="text-xs font-black text-amber-900 leading-tight">
                  Higher Referral Reward Available!
                </h4>
                <p className="text-[11px] text-amber-800 leading-snug mt-0.5">
                  You earned{" "}
                  <strong className="font-bold text-emerald-800">
                    ₹{refState.lastMissedEarning.earnedINR}
                  </strong>{" "}
                  from <strong>{refState.lastMissedEarning.newStudentName}</strong> (
                  {refState.lastMissedEarning.planName || "Subscription"}), but on {vipTier.label}{" "}
                  VIP you could have earned{" "}
                  <strong className="text-purple-900">
                    ₹{refState.lastMissedEarning.vipCouldEarnINR}
                  </strong>
                  .
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (refState.lastMissedEarning) {
                  const updated = {
                    ...refState,
                    lastMissedEarning: { ...refState.lastMissedEarning, isAcknowledged: true },
                  };
                  setRefState(updated);
                  saveReferralState(updated, effectiveUid);
                }
              }}
              className="text-amber-500 hover:text-amber-700 text-xs font-bold p-1 cursor-pointer"
              title="Dismiss notification"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-200/70 text-[11px]">
            <span className="font-semibold text-amber-800">
              Left on table:{" "}
              <strong className="text-rose-600 font-mono font-black">
                +₹{refState.lastMissedEarning.missedDiffINR}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => {
                if (onOpenSubscriptionPlans) onOpenSubscriptionPlans();
                window.dispatchEvent(new CustomEvent("cherry_open_subscription_plans"));
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-[11px] font-black uppercase tracking-wider shadow-xs active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <span>Upgrade to {vipTier.label} VIP</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Referrer Active Tier Status Card & Upgrade Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs text-white ${
                isReferrerVip
                  ? "bg-gradient-to-tr from-amber-500 to-yellow-400"
                  : referrerTier.durationMonths >= 6
                  ? "bg-gradient-to-tr from-indigo-600 to-purple-600"
                  : "bg-gradient-to-tr from-slate-600 to-slate-800"
              }`}
            >
              {isReferrerVip ? "👑" : "⭐"}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black text-slate-900">{referrerTier.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-black uppercase ${
                    isReferrerVip
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  }`}
                >
                  {referrerTier.level1Percent}% L1{" "}
                  {referrerTier.level5Percent > 0 ? `+ ${referrerTier.level5Percent}% L5` : ""}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                {referrerTier.badge || referrerTier.planName}
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
              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <span>Upgrade</span>
              <ArrowUpRight className="w-3 h-3 text-indigo-600" />
            </button>
          )}
        </div>

        {/* Upgrade Prompt Banner if not VIP */}
        {!isReferrerVip && (
          <div className="p-2.5 bg-gradient-to-r from-indigo-50/90 via-purple-50/90 to-amber-50/90 rounded-xl border border-indigo-100 flex items-center justify-between gap-2">
            <span className="text-[10.5px] text-slate-700 font-medium leading-tight">
              💡 <strong className="text-indigo-950">Upgrade to {vipTier.label} VIP</strong> to unlock
              maximum <strong className="text-emerald-700 font-bold">{vipTier.level1Percent}% Level 1</strong>{" "}
              + <strong className="text-purple-700 font-bold">{vipTier.level5Percent}% Level 5</strong> (up to{" "}
              {vipTier.totalPercent}% Max Cap) network royalties!
            </span>
            <button
              type="button"
              onClick={() => {
                if (onOpenSubscriptionPlans) onOpenSubscriptionPlans();
                window.dispatchEvent(new CustomEvent("cherry_open_subscription_plans"));
              }}
              className="text-[10.5px] font-black text-indigo-700 hover:text-indigo-900 underline whitespace-nowrap cursor-pointer shrink-0"
            >
              Plans →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
