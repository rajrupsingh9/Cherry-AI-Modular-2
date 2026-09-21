/**
 * ReferralHeroWallet.tsx
 * High-impact gradient card showing available wallet balance, UPI withdraw button, and tier micro-metrics
 */
import React from "react";
import { Wallet, Zap, Snowflake } from "lucide-react";
import { ReferralHeroWalletProps } from "./referralTypes";

export const ReferralHeroWallet: React.FC<ReferralHeroWalletProps> = ({
  refState,
  level1Earned,
  level1Count,
  level5Earned,
  level5Count,
  totalTeamMembers,
  onOpenWithdraw,
  onToast,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-950 text-white p-4 sm:p-5 shadow-md border border-indigo-700/50">
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-3.5">
        {/* Main Wallet Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-200 font-semibold flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Available Balance
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                ₹{refState.walletBalance}
              </span>
              <span className="text-[11px] text-indigo-300 font-mono">INR</span>
            </div>
          </div>

          <button
            type="button"
            disabled={refState.isFrozen}
            onClick={() => {
              if (refState.isFrozen) {
                onToast?.("Account is frozen. Withdrawals cannot be requested.", "error");
                return;
              }
              onOpenWithdraw();
            }}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0 border ${
              refState.isFrozen
                ? "bg-slate-800/80 text-slate-400 border-slate-700 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-emerald-400/30"
            }`}
          >
            {refState.isFrozen ? (
              <>
                <Snowflake className="w-3.5 h-3.5" />
                <span>Frozen</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Withdraw UPI</span>
              </>
            )}
          </button>
        </div>

        {/* 3 Micro-Metrics Grid for Mobile */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-indigo-800/80">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 sm:p-2.5 text-center border border-white/10">
            <span className="text-[9px] font-mono uppercase text-emerald-300 block font-bold truncate">
              1st Lvl (Direct)
            </span>
            <span className="text-sm sm:text-base font-black text-white block mt-0.5">
              ₹{level1Earned}
            </span>
            <span className="text-[8.5px] text-indigo-200 block truncate">
              {level1Count} Friends
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 sm:p-2.5 text-center border border-white/10">
            <span className="text-[9px] font-mono uppercase text-purple-300 block font-bold truncate">
              5th Lvl (Indirect)
            </span>
            <span className="text-sm sm:text-base font-black text-white block mt-0.5">
              ₹{level5Earned}
            </span>
            <span className="text-[8.5px] text-indigo-200 block truncate">
              {level5Count} Scholars
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 sm:p-2.5 text-center border border-white/10">
            <span className="text-[9px] font-mono uppercase text-amber-300 block font-bold truncate">
              Total Network
            </span>
            <span className="text-sm sm:text-base font-black text-white block mt-0.5">
              {totalTeamMembers}
            </span>
            <span className="text-[8.5px] text-indigo-200 block truncate">
              5 Tiers
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
