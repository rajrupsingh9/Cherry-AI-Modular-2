/**
 * ReferralShareBar.tsx
 * Multi-channel share bar with WhatsApp, Telegram, QR code modal trigger, and copyable links
 */
import React from "react";
import { Share2, Copy, Check, QrCode } from "lucide-react";
import { ReferralShareBarProps } from "./referralTypes";

export const ReferralShareBar: React.FC<ReferralShareBarProps> = ({
  referralCode,
  referralLink,
  copiedCode,
  copiedLink,
  referrerTier,
  onCopyCode,
  onShareWhatsApp,
  onShareTelegram,
  onNativeShare,
  onOpenQrModal,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-3">
      {/* WhatsApp Hero Button */}
      <button
        type="button"
        onClick={onShareWhatsApp}
        className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
      >
        <span className="text-base">📲</span>
        <span>Share on WhatsApp & Invite Friends</span>
      </button>

      {/* Telegram & Instant QR Code Action Strip */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onShareTelegram}
          className="py-2.5 px-3 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <span>✈️</span>
          <span>Telegram</span>
        </button>
        <button
          type="button"
          onClick={onOpenQrModal}
          className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 active:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <QrCode className="w-3.5 h-3.5 text-indigo-400" />
          <span>Show QR Code</span>
        </button>
      </div>

      {/* Code & Link Side by Side on Mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Referral Code Box */}
        <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl">
          <div className="min-w-0 pr-2">
            <span className="text-[8.5px] font-mono font-bold uppercase text-slate-400 block">
              Your Referral Code
            </span>
            <span className="text-xs font-mono font-black text-indigo-700 tracking-wider block truncate">
              {referralCode}
            </span>
          </div>
          <button
            type="button"
            onClick={onCopyCode}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 ${
              copiedCode
                ? "bg-emerald-600 text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:text-indigo-600"
            }`}
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Link Copy Box */}
        <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl">
          <div className="min-w-0 pr-2">
            <span className="text-[8.5px] font-mono font-bold uppercase text-slate-400 block">
              Direct Invite Link
            </span>
            <span className="text-[11px] font-mono text-slate-600 truncate block">
              {referralLink}
            </span>
          </div>
          <button
            type="button"
            onClick={onNativeShare}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 ${
              copiedLink
                ? "bg-emerald-600 text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:text-indigo-600"
            }`}
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3 Step Quick Explainer Ribbon */}
      <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
        <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-100">
          <span className="text-xs block">1️⃣</span>
          <span className="text-[9px] font-bold text-slate-700 block leading-tight mt-0.5">
            Share Link
          </span>
          <span className="text-[8px] text-slate-400 block">with Friends</span>
        </div>
        <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-100">
          <span className="text-xs block">2️⃣</span>
          <span className="text-[9px] font-bold text-slate-700 block leading-tight mt-0.5">
            Friend Joins
          </span>
          <span className="text-[8px] text-slate-400 block">Level 1 Direct</span>
        </div>
        <div className="bg-emerald-50/80 p-2 rounded-xl border border-emerald-100">
          <span className="text-xs block">3️⃣</span>
          <span className="text-[9px] font-black text-emerald-700 block leading-tight mt-0.5">
            Get {referrerTier.level1Percent}% + {referrerTier.level5Percent}%
          </span>
          <span className="text-[8px] text-emerald-600 block">L1 & L5 Payout</span>
        </div>
      </div>
    </div>
  );
};
