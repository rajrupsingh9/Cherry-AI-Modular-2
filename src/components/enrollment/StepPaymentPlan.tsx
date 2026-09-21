/**
 * StepPaymentPlan.tsx
 * Step 3: Subscription plan selection, UPI QR payment, and UTR verification
 */
import React from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Crown,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Gift,
  RefreshCw,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { SubscriptionPlan, StudentSubscriptionRecord } from "../../utils/subscriptionStore";
import { ReferralLookupResult } from "../../utils/referralStore";

interface StepPaymentPlanProps {
  plans: SubscriptionPlan[];
  selectedPlanId: string;
  onSelectPlanId: (id: string) => void;
  selectedPlan: SubscriptionPlan;
  qrDataUrl: string;
  userUtrInput: string;
  setUserUtrInput: (val: string) => void;
  isActivatingPayment: boolean;
  onConfirmPayment: () => void;
  submittedPendingRecord: StudentSubscriptionRecord | null;
  isCheckingApproval: boolean;
  onCheckApprovalStatus: () => void;
  copiedUpi: boolean;
  onCopyUpiId: () => void;
  receiverUpiId?: string;
  onOpenUpiIntent: (app?: "gpay" | "phonepe" | "paytm") => void;
  referralCodeInput: string;
  setReferralCodeInput: (code: string) => void;
  appliedReferral: ReferralLookupResult | null;
  referralFeedback: { status: "idle" | "valid" | "invalid"; message: string };
  showReferralInput: boolean;
  setShowReferralInput: (show: boolean) => void;
  onApplyReferralCode: () => void;
}

export const StepPaymentPlan: React.FC<StepPaymentPlanProps> = ({
  plans,
  selectedPlanId,
  onSelectPlanId,
  selectedPlan,
  qrDataUrl,
  userUtrInput,
  setUserUtrInput,
  isActivatingPayment,
  onConfirmPayment,
  submittedPendingRecord,
  isCheckingApproval,
  onCheckApprovalStatus,
  copiedUpi,
  onCopyUpiId,
  receiverUpiId,
  onOpenUpiIntent,
  referralCodeInput,
  setReferralCodeInput,
  appliedReferral,
  referralFeedback,
  showReferralInput,
  setShowReferralInput,
  onApplyReferralCode,
}) => {
  const payableAmount = appliedReferral?.discountAmountINR
    ? Math.max(0, selectedPlan.priceINR - appliedReferral.discountAmountINR)
    : selectedPlan.priceINR;

  return (
    <motion.div
      key="step-payment-plan"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-4 text-left"
    >
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[#796AEF] text-[10.5px] font-mono font-bold uppercase">
            <Sparkles className="w-3 h-3 text-[#796AEF]" />
            <span>Step 3 of 5 • Subscription Plan</span>
          </div>

          <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            Flat Student Rate
          </span>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-2 gap-2">
          {plans.map((p) => {
            const isSel = p.id === selectedPlanId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPlanId(p.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isSel
                    ? "bg-indigo-50/90 border-[#796AEF] shadow-xs"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {p.popular && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-[#796AEF] text-white">
                    POPULAR
                  </span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-black text-slate-900">₹{p.priceINR}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    /{p.durationMonths ? `${p.durationMonths}mo` : "pass"}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 leading-tight mt-0.5">{p.name}</p>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">
                  {p.description || "Unlimited live classroom"}
                </p>
              </button>
            );
          })}
        </div>

        {/* Referral / Invite Code Accordion */}
        <div className="pt-1">
          {!showReferralInput ? (
            <button
              type="button"
              onClick={() => setShowReferralInput(true)}
              className="text-[11px] font-mono text-[#796AEF] font-bold flex items-center gap-1 cursor-pointer hover:underline"
            >
              <Gift className="w-3 h-3" />
              <span>Have an Invite Code or Student Discount?</span>
            </button>
          ) : (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={referralCodeInput}
                  onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                  placeholder="ENTER INVITE CODE"
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-800 uppercase focus:outline-none focus:border-[#796AEF]"
                />
                <button
                  type="button"
                  onClick={onApplyReferralCode}
                  className="px-3 py-1.5 bg-[#796AEF] text-white rounded-lg text-xs font-bold font-mono cursor-pointer hover:bg-[#6858e0]"
                >
                  Apply
                </button>
              </div>
              {referralFeedback.message && (
                <p
                  className={`text-[10.5px] font-medium leading-none ${
                    referralFeedback.status === "valid" ? "text-emerald-600" : "text-rose-500"
                  }`}
                >
                  {referralFeedback.message}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Dynamic UPI QR Code Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-800">Scan & Pay with Any UPI App</span>
            <span className="text-xs font-mono font-black text-slate-900">
              Total: ₹{payableAmount}
            </span>
          </div>

          {qrDataUrl ? (
            <div className="inline-block p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <img src={qrDataUrl} alt="UPI QR Code" className="w-44 h-44 mx-auto rounded-lg" />
            </div>
          ) : (
            <div className="w-44 h-44 mx-auto bg-slate-200 rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-500">
              Generating QR...
            </div>
          )}

          {/* Quick UPI App Deep Links */}
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => onOpenUpiIntent("gpay")}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
            >
              <span>Google Pay</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenUpiIntent("phonepe")}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
            >
              <span>PhonePe</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenUpiIntent("paytm")}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
            >
              <span>Paytm</span>
            </button>
          </div>

          {/* Copy UPI ID */}
          <button
            type="button"
            onClick={onCopyUpiId}
            className="text-[11px] font-mono text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 mx-auto cursor-pointer"
          >
            {copiedUpi ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            <span>Copy UPI ID: {receiverUpiId || "cherry.study@upi"}</span>
          </button>
        </div>

        {/* UTR Input Section */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 block">
            Enter 12-Digit UPI Ref / UTR Number:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={userUtrInput}
              onChange={(e) => setUserUtrInput(e.target.value.replace(/\D/g, "").slice(0, 12))}
              placeholder="e.g. 423456789012"
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:outline-none focus:border-[#796AEF]"
            />
            <button
              type="button"
              onClick={onConfirmPayment}
              disabled={isActivatingPayment || userUtrInput.length < 6}
              className="px-4 py-2 bg-[#796AEF] hover:bg-[#6858e0] text-white rounded-xl text-xs font-bold font-mono transition-all disabled:opacity-50 cursor-pointer"
            >
              {isActivatingPayment ? "Submitting..." : "Submit UTR"}
            </button>
          </div>
        </div>

        {/* Pending Verification Notice */}
        {submittedPendingRecord && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>Verification Pending</span>
              </div>
              <button
                type="button"
                onClick={onCheckApprovalStatus}
                disabled={isCheckingApproval}
                className="text-[10px] font-mono font-bold text-[#796AEF] flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isCheckingApproval ? "animate-spin" : ""}`} />
                <span>Check Status</span>
              </button>
            </div>
            <p className="text-[11px] text-amber-700 leading-tight">
              UTR {submittedPendingRecord.utrNumber} submitted. Once approved by Admin, Pro access
              will automatically unlock!
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
