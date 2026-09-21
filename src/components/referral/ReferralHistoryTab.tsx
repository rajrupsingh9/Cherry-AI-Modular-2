/**
 * ReferralHistoryTab.tsx
 * Tab 3: Referral activity logs and UPI withdrawal history ledger
 */
import React from "react";
import { Sparkles, Wallet } from "lucide-react";
import { ReferralHistoryTabProps } from "./referralTypes";

export const ReferralHistoryTab: React.FC<ReferralHistoryTabProps> = ({ refState }) => {
  return (
    <div className="space-y-3">
      {/* Referral Activities */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2.5">
        <h4 className="text-xs font-black uppercase font-mono tracking-wider text-slate-900 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Referral Activity
        </h4>

        {refState.activities.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            No referral activity recorded yet.
          </p>
        ) : (
          <div className="space-y-1.5">
            {refState.activities.map((act) => (
              <div
                key={act.id}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 ${
                      act.level === 1
                        ? "bg-emerald-600"
                        : act.level === 5
                        ? "bg-purple-600"
                        : "bg-slate-400"
                    }`}
                  >
                    L{act.level}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 block truncate text-[11px]">
                      {act.name}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono block truncate">
                      Level {act.level} • {act.date}
                      {act.planName ? ` • ${act.planName}` : ""}
                      {act.appliedPercent ? ` (${act.appliedPercent}%)` : ""}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-black text-xs block ${
                      act.amount > 0 ? "text-emerald-600 font-mono" : "text-slate-400 font-mono"
                    }`}
                  >
                    {act.amount > 0 ? `+₹${act.amount}` : "₹0"}
                  </span>
                  <span className="text-[8.5px] text-emerald-700 font-mono uppercase font-bold">
                    {act.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdrawal Logs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2.5">
        <h4 className="text-xs font-black uppercase font-mono tracking-wider text-slate-900 flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-indigo-600" />
          UPI Withdrawal History
        </h4>

        {refState.withdrawals.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            No withdrawals requested yet.
          </p>
        ) : (
          <div className="space-y-2">
            {refState.withdrawals.map((w) => {
              const isPending = w.status === "pending" || w.status === "processing";
              const isPaid = w.status === "successful";
              const isRejected = w.status === "rejected";

              return (
                <div
                  key={w.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    isPending
                      ? "bg-amber-50/50 border-amber-200"
                      : isPaid
                      ? "bg-slate-50 border-slate-200/80"
                      : "bg-rose-50/40 border-rose-200"
                  }`}
                >
                  <div className="min-w-0 pr-2 space-y-0.5">
                    <span className="font-bold text-slate-900 block text-[11px] truncate font-mono">
                      {w.upiId}
                    </span>
                    <div className="text-[9px] text-slate-400 font-mono block">
                      {w.referenceId} • {w.date}
                    </div>
                    {isPaid && w.utrNumber && (
                      <div className="text-[9.5px] text-emerald-700 font-mono font-medium">
                        UTR: {w.utrNumber}
                      </div>
                    )}
                    {isRejected && (
                      <div className="text-[9.5px] text-rose-600 font-medium">
                        Refunded: {w.rejectionReason || "Verification failed"}
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-black text-xs font-mono block ${
                        isRejected ? "text-slate-400 line-through" : "text-rose-600"
                      }`}
                    >
                      -₹{w.amount}
                    </span>
                    {isPending && (
                      <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-bold font-mono inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                        Under Review
                      </span>
                    )}
                    {isPaid && (
                      <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold font-mono">
                        Paid ✓
                      </span>
                    )}
                    {isRejected && (
                      <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-bold font-mono">
                        Refunded ↩
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
