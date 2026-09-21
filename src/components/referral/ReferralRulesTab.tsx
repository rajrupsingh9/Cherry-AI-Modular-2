/**
 * ReferralRulesTab.tsx
 * Tab 4: 5-Level Referral rules, terms, and frequently asked questions
 */
import React from "react";
import { ReferralRulesTabProps } from "./referralTypes";

export const ReferralRulesTab: React.FC<ReferralRulesTabProps> = ({
  activePlanTiers,
  vipTier,
  commissionConfig,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-2.5 text-xs text-slate-700 leading-relaxed">
      <h4 className="font-black text-xs uppercase font-mono tracking-wider text-slate-900 pb-1 border-b border-slate-100">
        Rules & FAQ
      </h4>

      <div className="space-y-2 text-[11px]">
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <strong className="text-slate-900 block font-bold mb-0.5">
            1. Plan-Wise Percentage Earning (1st Level Direct):
          </strong>
          <p className="text-slate-600">
            Aapke invite code se join hone wale student jo plan chunte hain, uske price ka{" "}
            {activePlanTiers[0]?.level1Percent}% se {vipTier.level1Percent}% commission turant aapke
            wallet me credit hota hai. Commission rate aapke active plan tier par depend karta hai.
          </p>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <strong className="text-slate-900 block font-bold mb-0.5">
            2. 2nd, 3rd, 4th Levels (Network Bridge):
          </strong>
          <p className="text-slate-600">
            Ye intermediary tiers hain jo aapki team ko 5th tier tak expand karte hain bina kisi extra
            condition ke.
          </p>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <strong className="text-slate-900 block font-bold mb-0.5">
            3. 5th Level (Team Indirect Royalty up to {vipTier.level5Percent}%):
          </strong>
          <p className="text-slate-600">
            Jab 4th level ke students aage referral karte hain, toh team growth par aapko{" "}
            {activePlanTiers[0]?.level5Percent}% se {vipTier.level5Percent}% indirect royalty income
            milti hai.
          </p>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <strong className="text-slate-900 block font-bold mb-0.5">
            4. Why Upgrade to {vipTier.label} VIP Plan?
          </strong>
          <p className="text-slate-600">
            {vipTier.label} plan lene par aapko maximum {vipTier.level1Percent}% Direct Level 1 +{" "}
            {vipTier.level5Percent}% Indirect Level 5 commission (total {vipTier.totalPercent}% cap)
            unlock hota hai, jisse aapki har referral par maximum network income generate hoti hai.
          </p>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <strong className="text-slate-900 block font-bold mb-0.5">
            5. Instant UPI Withdrawal:
          </strong>
          <p className="text-slate-600">
            Minimum ₹{commissionConfig.minWithdrawalLimit || 50} balance hone par kisi bhi UPI ID
            (Google Pay, PhonePe, Paytm, BHIM) par 1-click me withdraw request kar sakte hain.
          </p>
        </div>
      </div>
    </div>
  );
};
