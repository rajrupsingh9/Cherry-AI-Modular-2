/**
 * useReferralHub.ts
 * Custom hook encapsulating referral state, wallet balance, tiers, dynamic sharing, and withdrawal submission
 */
import React, { useState, useEffect, useMemo } from "react";
import QRCode from "qrcode";
import {
  ReferralAccountState,
  loadReferralState,
  getReferralCommissionConfig,
  getDynamicTierConfig,
  ReferralCommissionConfig,
  syncCommissionConfigFromCloud,
  getReferrerActivePlanTier,
  PLAN_REFERRAL_TIERS,
  PlanReferralTier,
  getPlanReferralTiers,
} from "../../utils/referralStore";
import {
  getActiveSubscriptionPlans,
  SubscriptionPlan,
} from "../../utils/subscriptionStore";
import { ReferralTab } from "./referralTypes";
import {
  computeReferralLevelStats,
  resolveEffectiveUser,
} from "./referralCalculations";
import {
  shareViaWhatsApp,
  shareViaTelegram,
  shareNativelyOrFallback,
  submitReferralWithdrawal,
} from "./referralShareActions";
import { useReferralCalculator } from "./useReferralCalculator";

interface UseReferralHubProps {
  studentName?: string;
  userUid?: string;
  onToast?: (message: string, type?: "success" | "info" | "error") => void;
}

export function useReferralHub({
  studentName = "Student",
  userUid = "",
  onToast,
}: UseReferralHubProps) {
  const { effectiveUid, effectiveName } = useMemo(
    () => resolveEffectiveUser(studentName, userUid),
    [studentName, userUid]
  );

  const [refState, setRefState] = useState<ReferralAccountState>(() =>
    loadReferralState(effectiveName, effectiveUid)
  );
  const [commissionConfig, setCommissionConfig] = useState<ReferralCommissionConfig>(() =>
    getReferralCommissionConfig()
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>(
    String(commissionConfig.minWithdrawalLimit || 50)
  );
  const [withdrawUpi, setWithdrawUpi] = useState<string>("");
  const [activeTab, setActiveTab] = useState<ReferralTab>("plan");

  // Real-time synchronization with Admin referral actions
  useEffect(() => {
    const handleReferralsUpdated = () => {
      const updatedAccount = loadReferralState(effectiveName, effectiveUid);
      setRefState((prev) => {
        const newlyPaid = updatedAccount.withdrawals.find(
          (fw) =>
            fw.status === "successful" &&
            prev.withdrawals.some((pw) => pw.id === fw.id && pw.status !== "successful")
        );
        if (newlyPaid && onToast) {
          onToast(
            `🎉 Payout Approved! ₹${newlyPaid.amount} transferred to ${newlyPaid.upiId} (UTR: ${newlyPaid.utrNumber || "Verified"}).`,
            "success"
          );
        }
        if (updatedAccount.walletBalance > prev.walletBalance && !newlyPaid && onToast) {
          const diff = updatedAccount.walletBalance - prev.walletBalance;
          onToast(`💰 Wallet Credited! +₹${diff} added to your referral balance.`, "success");
        }
        return updatedAccount;
      });
    };

    window.addEventListener("cherry_referrals_updated", handleReferralsUpdated);
    return () => {
      window.removeEventListener("cherry_referrals_updated", handleReferralsUpdated);
    };
  }, [effectiveName, effectiveUid, onToast]);

  // Sync with dynamic commission config updates
  useEffect(() => {
    syncCommissionConfigFromCloud().then((res) => {
      if (res?.config) {
        setCommissionConfig(res.config);
        setWithdrawAmount(String(res.config.minWithdrawalLimit || 50));
      }
    });

    const handleConfigUpdate = () => {
      const latest = getReferralCommissionConfig();
      setCommissionConfig(latest);
      setWithdrawAmount(String(latest.minWithdrawalLimit || 50));
    };
    window.addEventListener("cherry_commission_config_updated", handleConfigUpdate);
    window.addEventListener("cherry_referral_commission_updated", handleConfigUpdate);
    return () => {
      window.removeEventListener("cherry_commission_config_updated", handleConfigUpdate);
      window.removeEventListener("cherry_referral_commission_updated", handleConfigUpdate);
    };
  }, []);

  const referrerTier: PlanReferralTier = useMemo(() => {
    return getReferrerActivePlanTier(effectiveUid || effectiveName, commissionConfig);
  }, [effectiveUid, effectiveName, commissionConfig]);

  const activePlanTiers: PlanReferralTier[] = useMemo(() => {
    return getPlanReferralTiers(commissionConfig);
  }, [commissionConfig]);

  const vipTier: PlanReferralTier = useMemo(() => {
    return (
      activePlanTiers.find((t) => t.isMaxVip) ||
      activePlanTiers.find((t) => t.durationMonths >= 12) ||
      activePlanTiers[activePlanTiers.length - 1] ||
      PLAN_REFERRAL_TIERS[3]
    );
  }, [activePlanTiers]);

  const isReferrerVip = Boolean(
    referrerTier.isMaxVip ||
    referrerTier.durationMonths >= (vipTier.durationMonths || 12)
  );

  const dynamicTiers = useMemo(() => {
    return getDynamicTierConfig(commissionConfig, referrerTier);
  }, [commissionConfig, referrerTier]);

  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(() => {
    try {
      return getActiveSubscriptionPlans();
    } catch (_) {
      return [];
    }
  });

  useEffect(() => {
    const handlePlansUpdate = () => {
      try {
        setSubscriptionPlans(getActiveSubscriptionPlans());
      } catch (_) {}
    };
    window.addEventListener("cherry_plans_updated", handlePlansUpdate);
    return () => {
      window.removeEventListener("cherry_plans_updated", handlePlansUpdate);
    };
  }, []);

  const referralLink = `${window.location.origin}?ref=${refState.referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(refState.referralCode);
    setCopiedCode(true);
    onToast?.("Referral Code copied to clipboard! 📋", "success");
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    onToast?.("Referral Link copied to clipboard! 🔗", "success");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  useEffect(() => {
    if (showQrModal && referralLink) {
      QRCode.toDataURL(referralLink, {
        width: 280,
        margin: 1,
        color: { dark: "#0f172a", light: "#ffffff" },
      })
        .then(setQrDataUrl)
        .catch((err) => console.warn("[QR] code generation warn:", err));
    }
  }, [showQrModal, referralLink]);

  const handleShareWhatsApp = () => {
    shareViaWhatsApp(refState.referralCode, referralLink);
    onToast?.("Opening WhatsApp share! 📲", "info");
  };

  const handleShareTelegram = () => {
    shareViaTelegram(refState.referralCode, referralLink);
    onToast?.("Opening Telegram share! ✈️", "info");
  };

  const handleNativeShare = async () => {
    const shared = await shareNativelyOrFallback(refState.referralCode, referralLink, handleCopyLink);
    if (shared) onToast?.("Shared successfully! 🎉", "success");
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = submitReferralWithdrawal({
      refState,
      withdrawAmount,
      withdrawUpi,
      userUid,
      studentName,
      minLimit: commissionConfig.minWithdrawalLimit || 50,
    });
    if (res.success) {
      setRefState(res.updatedState);
      setShowWithdrawModal(false);
      onToast?.(res.message, "success");
    } else {
      onToast?.(res.message, "error");
    }
  };

  const {
    level1Count,
    level1Earned,
    level5Count,
    level5Earned,
    totalTeamMembers,
  } = useMemo(
    () => computeReferralLevelStats(refState, referrerTier, commissionConfig),
    [refState, referrerTier, commissionConfig]
  );

  const calc = useReferralCalculator({
    subscriptionPlans,
    effectiveUid,
    effectiveName,
    commissionConfig,
    vipTier,
  });

  return {
    effectiveUid,
    effectiveName,
    refState,
    setRefState,
    commissionConfig,
    referrerTier,
    activePlanTiers,
    vipTier,
    isReferrerVip,
    dynamicTiers,
    subscriptionPlans,
    copiedCode,
    copiedLink,
    showWithdrawModal,
    setShowWithdrawModal,
    showQrModal,
    setShowQrModal,
    qrDataUrl,
    withdrawAmount,
    setWithdrawAmount,
    withdrawUpi,
    setWithdrawUpi,
    activeTab,
    setActiveTab,
    referralLink,
    handleCopyCode,
    handleCopyLink,
    handleShareWhatsApp,
    handleShareTelegram,
    handleNativeShare,
    handleWithdrawSubmit,
    level1Earned,
    level1Count,
    level5Earned,
    level5Count,
    totalTeamMembers,
    ...calc,
  };
}
