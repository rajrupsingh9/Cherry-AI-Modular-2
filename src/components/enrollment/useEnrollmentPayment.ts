/**
 * useEnrollmentPayment.ts
 * Manages UPI payments, QR code generation, UTR verification, and referral discounts
 */
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  SUBSCRIPTION_PLANS,
  getActiveSubscriptionPlans,
  SubscriptionPlan,
  SubscriptionState,
  loadSubscriptionState,
  buildDynamicUpiUri,
  generateTransactionReference,
  DEFAULT_RECEIVER_UPI_ID,
  DEFAULT_MERCHANT_NAME,
  getStudentSubscriptions,
  StudentSubscriptionRecord,
} from "../../utils/subscriptionStore";
import { triggerCelebrationConfetti } from "../../utils/confetti";
import { OnboardingStep } from "./enrollmentTypes";
import {
  submitStudentUtr,
  checkApprovalForStudent,
  launchUpiApp,
  validateReferralDiscount,
} from "./enrollmentPaymentActions";

interface UseEnrollmentPaymentProps {
  propSubState?: SubscriptionState;
  currentStep: OnboardingStep;
  name: string;
  grade: string;
  board: string;
  mediumOfLearning: string;
  authedUser: any;
  setCurrentStep: (step: OnboardingStep) => void;
  onToast?: (message: string, type?: "info" | "success" | "warning" | "error") => void;
  onSubscriptionUpdated?: (state: SubscriptionState) => void;
}

export function useEnrollmentPayment({
  propSubState,
  currentStep,
  name,
  grade,
  board,
  mediumOfLearning,
  authedUser,
  setCurrentStep,
  onToast,
  onSubscriptionUpdated,
}: UseEnrollmentPaymentProps) {
  const [subState, setSubState] = useState<SubscriptionState>(() =>
    propSubState || loadSubscriptionState()
  );
  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => getActiveSubscriptionPlans());

  useEffect(() => {
    const handlePlansUpdated = (e: any) => setPlans(e.detail || getActiveSubscriptionPlans());
    const handleUpiUpdated = (e: any) => {
      setSubState((prev) => ({
        ...prev,
        customUpiReceiverId: e.detail?.receiverUpiId || DEFAULT_RECEIVER_UPI_ID,
        merchantName: e.detail?.merchantName || DEFAULT_MERCHANT_NAME,
      }));
    };
    const handleSubUpdated = (e: any) => setSubState(e.detail || loadSubscriptionState());

    window.addEventListener("cherry_plans_updated", handlePlansUpdated);
    window.addEventListener("cherry_upi_config_updated", handleUpiUpdated);
    window.addEventListener("cherry_subscription_updated", handleSubUpdated);
    return () => {
      window.removeEventListener("cherry_plans_updated", handlePlansUpdated);
      window.removeEventListener("cherry_upi_config_updated", handleUpiUpdated);
      window.removeEventListener("cherry_subscription_updated", handleSubUpdated);
    };
  }, []);

  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => {
    const popular = plans.find((p) => p.popular);
    if (popular) return popular.id;
    const semiannual = plans.find((p) => p.id === "semiannual_149");
    if (semiannual) return semiannual.id;
    return plans[0]?.id || SUBSCRIPTION_PLANS[0]?.id || "semiannual_149";
  });

  const selectedPlan: SubscriptionPlan =
    plans.find((p) => p.id === selectedPlanId) ||
    plans.find((p) => p.popular) ||
    plans[0] ||
    SUBSCRIPTION_PLANS[0];

  const [activeTxnRef] = useState(() => generateTransactionReference());
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [userUtrInput, setUserUtrInput] = useState("");
  const [isActivatingPayment, setIsActivatingPayment] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isCheckingApproval, setIsCheckingApproval] = useState(false);

  const [submittedPendingRecord, setSubmittedPendingRecord] = useState<StudentSubscriptionRecord | null>(() => {
    try {
      const currentUid = authedUser?.uid;
      const currentEmail = authedUser?.email;
      const list = getStudentSubscriptions();
      const found = list.find((s) => {
        if (currentUid && (s.id === currentUid || (s as any).userId === currentUid)) return true;
        if (currentEmail && s.studentEmail && s.studentEmail.toLowerCase() === currentEmail.toLowerCase()) return true;
        return false;
      });
      if (found && found.status === "pending_verification" && !found.isPro) {
        return found;
      }
    } catch (_) {}
    return null;
  });

  // Referral / Coupon Code State
  const [referralCodeInput, setReferralCodeInput] = useState<string>(() => {
    try {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const urlRef = urlParams.get("ref");
        if (urlRef && urlRef.trim()) return urlRef.trim().toUpperCase();
        return localStorage.getItem("cherry_pending_ref_code") || "";
      }
    } catch (_) {}
    return "";
  });
  const [appliedReferral, setAppliedReferral] = useState<any>(null);
  const [referralFeedback, setReferralFeedback] = useState<{
    status: "idle" | "valid" | "invalid";
    message: string;
  }>({ status: "idle", message: "" });
  const [showReferralInput, setShowReferralInput] = useState<boolean>(Boolean(referralCodeInput));

  const payableAmount = appliedReferral?.discountAmountINR
    ? Math.max(0, selectedPlan.priceINR - appliedReferral.discountAmountINR)
    : selectedPlan.priceINR;

  // Auto-validate referral code
  useEffect(() => {
    const raw = referralCodeInput.trim();
    if (raw) {
      setShowReferralInput(true);
      const lookup = validateReferralDiscount(raw, authedUser, name, selectedPlan);
      setAppliedReferral(lookup.valid ? lookup : null);
      setReferralFeedback({
        status: lookup.valid ? "valid" : "invalid",
        message: lookup.message,
      });
    }
  }, [selectedPlan, authedUser, name]);

  const handleApplyReferralCode = (codeToVerify?: string) => {
    const targetCode = (codeToVerify || referralCodeInput).trim();
    if (!targetCode) {
      setAppliedReferral(null);
      setReferralFeedback({ status: "invalid", message: "Please enter an invite code." });
      return;
    }
    const lookup = validateReferralDiscount(targetCode, authedUser, name, selectedPlan);
    setAppliedReferral(lookup.valid ? lookup : null);
    setReferralFeedback({
      status: lookup.valid ? "valid" : "invalid",
      message: lookup.message,
    });
    onToast?.(lookup.message, lookup.valid ? "success" : "warning");
  };

  // Generate UPI QR code
  useEffect(() => {
    if (currentStep !== "payment_149") return;
    const upiUri = buildDynamicUpiUri({
      receiverUpiId: subState.customUpiReceiverId || DEFAULT_RECEIVER_UPI_ID,
      merchantName: subState.merchantName || DEFAULT_MERCHANT_NAME,
      amount: payableAmount,
      transactionRef: activeTxnRef,
      note: `CherryAI ${selectedPlan.name} - ${name || "Student"}`,
    });

    QRCode.toDataURL(upiUri, {
      width: 240,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Error generating UPI QR code:", err));
  }, [currentStep, subState, payableAmount, activeTxnRef, name]);

  // Submit UTR
  const handleConfirmPayment = async () => {
    const cleanUtr = userUtrInput.trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      onToast?.("Please enter a valid UPI Reference / UTR Number from your payment app.", "warning");
      return;
    }

    setIsActivatingPayment(true);
    try {
      const record = await submitStudentUtr({
        authedUser,
        name,
        grade,
        board,
        mediumOfLearning,
        selectedPlan,
        payableAmount,
        userUtrInput: cleanUtr,
      });
      setSubmittedPendingRecord(record);
      setIsActivatingPayment(false);
      onToast?.("✅ Payment verification request submitted to Admin! 📩 Verification is pending.", "success");
    } catch (err) {
      console.error("Error submitting UTR request:", err);
      setIsActivatingPayment(false);
      onToast?.("Could not submit UTR verification request. Please try again.", "error");
    }
  };

  // Check Approval Status
  const handleCheckApprovalStatus = async () => {
    setIsCheckingApproval(true);
    try {
      const res = await checkApprovalForStudent(authedUser, name);
      if (res.isApproved && res.record) {
        setSubmittedPendingRecord(null);
        triggerCelebrationConfetti();
        onToast?.("🎉 Payment Approved by Admin! Pro access is now active.", "success");
        const updatedSub = loadSubscriptionState();
        setSubState(updatedSub);
        onSubscriptionUpdated?.(updatedSub);
        setCurrentStep("api_key_setup");
      } else if (res.record?.status === "pending_verification") {
        setSubmittedPendingRecord(res.record);
        onToast?.("⏳ Verification is still pending. Admin has not approved this request yet.", "info");
      } else {
        onToast?.("No pending approval found. Please submit your UTR reference.", "info");
      }
    } catch (err) {
      console.warn("Approval status check error:", err);
      onToast?.("Could not check approval status right now. Please try again.", "error");
    } finally {
      setIsCheckingApproval(false);
    }
  };

  const handleOpenUpiIntent = (appScheme?: "gpay" | "phonepe" | "paytm") => {
    launchUpiApp({
      receiverUpiId: subState.customUpiReceiverId,
      merchantName: subState.merchantName,
      amount: payableAmount,
      transactionRef: activeTxnRef,
      planName: selectedPlan.name,
      studentName: name,
      appScheme,
    });
    onToast?.("Opening UPI App... Complete payment and enter UTR below.", "info");
  };

  const handleCopyUpiId = () => {
    const idToCopy = subState.customUpiReceiverId || DEFAULT_RECEIVER_UPI_ID;
    navigator.clipboard.writeText(idToCopy);
    setCopiedUpi(true);
    onToast?.("Merchant UPI ID copied to clipboard! 📋", "success");
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return {
    subState,
    plans,
    selectedPlanId,
    setSelectedPlanId,
    selectedPlan,
    qrDataUrl,
    userUtrInput,
    setUserUtrInput,
    isActivatingPayment,
    submittedPendingRecord,
    isCheckingApproval,
    copiedUpi,
    referralCodeInput,
    setReferralCodeInput,
    appliedReferral,
    referralFeedback,
    showReferralInput,
    setShowReferralInput,
    handleApplyReferralCode,
    handleConfirmPayment,
    handleCheckApprovalStatus,
    handleOpenUpiIntent,
    handleCopyUpiId,
  };
}
