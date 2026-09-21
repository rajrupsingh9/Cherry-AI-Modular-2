/**
 * ReferralModals.tsx
 * Modals for UPI Withdrawal Request and Instant In-Classroom QR Code
 */
import React from "react";
import { Wallet, ShieldCheck, QrCode, X, Copy, Download } from "lucide-react";
import { ReferralModalsProps } from "./referralTypes";

export const ReferralModals: React.FC<ReferralModalsProps> = ({
  showWithdrawModal,
  onCloseWithdrawModal,
  withdrawAmount,
  setWithdrawAmount,
  withdrawUpi,
  setWithdrawUpi,
  walletBalance,
  minWithdrawalLimit,
  onWithdrawSubmit,
  showQrModal,
  onCloseQrModal,
  qrDataUrl,
  studentName,
  referralCode,
  copiedLink,
  onCopyLink,
  onToast,
}) => {
  return (
    <>
      {/* WITHDRAWAL MODAL - Mobile First Bottom Sheet / Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-2xl border border-slate-200 space-y-3.5 animate-fade-in text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    UPI Withdrawal Request
                  </h4>
                  <span className="text-[10px] text-emerald-700 font-mono font-bold">
                    Available: ₹{walletBalance}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseWithdrawModal}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1.5 cursor-pointer rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={onWithdrawSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase font-bold text-slate-600 block">
                  Withdrawal Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min={minWithdrawalLimit}
                  max={walletBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  placeholder={`Min ₹${minWithdrawalLimit}`}
                />

                {/* Quick Amount Chips */}
                <div className="flex gap-1.5 pt-1">
                  {[minWithdrawalLimit, 100, 200, walletBalance].map((val, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setWithdrawAmount(String(val))}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-mono font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      {val === walletBalance ? `All (₹${val})` : `₹${val}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase font-bold text-slate-600 block">
                  UPI ID (Google Pay / PhonePe / Paytm / BHIM)
                </label>
                <input
                  type="text"
                  required
                  value={withdrawUpi}
                  onChange={(e) => setWithdrawUpi(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  placeholder="e.g. yourname@oksbi or 9876543210@paytm"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[10.5px] text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant verification & payout direct to your UPI handle.</span>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={walletBalance < minWithdrawalLimit}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer active:scale-95"
                >
                  Transfer ₹{withdrawAmount || "0"}
                </button>
                <button
                  type="button"
                  onClick={onCloseWithdrawModal}
                  className="px-4 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSTANT IN-CLASSROOM REFERRAL QR CODE MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#796AEF] flex items-center justify-center font-bold text-xs">
                  <QrCode className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    Invite QR Code
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Scan with any phone camera
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseQrModal}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Frame Container */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 flex flex-col items-center justify-center space-y-3">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Referral QR Code"
                  className="w-52 h-52 rounded-xl bg-white p-2 shadow-xs border border-slate-200"
                />
              ) : (
                <div className="w-52 h-52 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-slate-900">{studentName}</span>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-[#796AEF] border border-indigo-200 font-mono text-[10px] font-black uppercase">
                    {referralCode}
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-500 font-medium">
                  Friends scan to get instant access & up to 67% referral rewards!
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={onCopyLink}
                className="py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-[#796AEF] border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (qrDataUrl) {
                    const link = document.createElement("a");
                    link.href = qrDataUrl;
                    link.download = `CherryAI_Invite_${referralCode}.png`;
                    link.click();
                    onToast?.("QR Code downloaded! 🖼️", "success");
                  }
                }}
                className="py-2.5 px-3 bg-[#796AEF] hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save QR</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
