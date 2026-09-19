import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle2,
  Crown,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Copy,
  QrCode,
  Check,
} from "lucide-react";
import {
  getActiveSubscriptionPlans,
  getActiveUpiConfig,
  buildDynamicUpiUri,
  saveSubscriptionState,
  SubscriptionPlan,
} from "../utils/subscriptionStore";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  onToast: (msg: string, type: "success" | "error" | "info") => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  studentName = "Scholar",
  onToast,
}) => {
  const plans = getActiveSubscriptionPlans();
  const upi = getActiveUpiConfig();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(
    plans.find((p) => p.popular) || plans[0]
  );
  const [utrNumber, setUtrNumber] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const upiUri = buildDynamicUpiUri(selectedPlan.price, `SUB-${selectedPlan.id}`);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upi.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
    onToast("UPI ID copied to clipboard!", "info");
  };

  const handleActivate = () => {
    if (!utrNumber || utrNumber.trim().length < 6) {
      onToast("Please enter a valid 12-digit UPI UTR / Transaction Reference number.", "error");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + selectedPlan.durationMonths);

      saveSubscriptionState({
        isSubscribed: true,
        activePlan: selectedPlan,
        expiryDate: expiry.toISOString(),
      });

      onToast(`🎉 Pro Activated! Welcome to Cherry AI Pro, ${studentName}!`, "success");
      setIsSubmitting(false);
      onClose();
    }, 1200);
  };

  const content = (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0a3641] to-[#124e5d] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#c4f500]/20 border border-[#c4f500]/40 text-[#c4f500] flex items-center justify-center">
              <Crown className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Upgrade to Cherry AI Pro</h2>
              <p className="text-xs text-teal-200/80">Unlock 10-Year PYQs, Live Voice AI, and Unlimited Sessions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          {/* Plan Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {plans.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                  selectedPlan.id === p.id
                    ? "border-[#0a3641] bg-[#f7f9f6] shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#c4f500] text-[#0a3641] text-[9.5px] font-black uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{p.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#0a3641]">₹{p.price}</span>
                    <span className="text-xs text-slate-500">/ {p.durationMonths} mo</span>
                  </div>
                </div>
                <ul className="mt-3 flex flex-col gap-1.5 text-[11px] text-slate-600">
                  {p.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Payment Section */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                Official Merchant UPI
              </span>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-sm font-mono font-bold text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                  {upi.upiId}
                </span>
                <button
                  onClick={handleCopyUpi}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUpi ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Pay ₹{selectedPlan.price} using GPay, PhonePe, Paytm, or BHIM.
              </p>
            </div>

            <a
              href={upiUri}
              className="px-5 py-2.5 rounded-xl bg-[#0a3641] hover:bg-[#124e5d] text-[#c4f500] font-bold text-xs flex items-center gap-2 shrink-0 transition-all shadow-xs"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Pay via UPI App</span>
            </a>
          </div>

          {/* UTR Submission Form */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold text-slate-800">
              Enter 12-Digit UTR / Transaction Reference Number
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value.trim())}
                placeholder="e.g. 412356789012"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a3641]/20"
              />
              <button
                onClick={handleActivate}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold tracking-wide flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? "Verifying..." : "Verify & Activate"}</span>
              </button>
            </div>
            <span className="text-[10px] text-slate-400">
              * Instant auto-provisioning activates your account upon verification.
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(content, document.body);
  }
  return content;
};
