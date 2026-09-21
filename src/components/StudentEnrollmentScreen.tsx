/**
 * StudentEnrollmentScreen.tsx
 * Ultra-lean Orchestrator for the 5-step Student Onboarding & Payment Flow
 * Strict Architectural Separation of Concerns (SoC) & < 300 LOC cap
 */
import React, { useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  OnboardingStep,
  StudentEnrollmentScreenProps,
  STEPS_NAV,
} from "./enrollment/enrollmentTypes";
import { useEnrollmentAuth } from "./enrollment/useEnrollmentAuth";
import { useEnrollmentPayment } from "./enrollment/useEnrollmentPayment";
import { EnrollmentStepperHeader } from "./enrollment/EnrollmentStepperHeader";
import { StepGoogleLogin } from "./enrollment/StepGoogleLogin";
import { StepProfileSetup } from "./enrollment/StepProfileSetup";
import { StepPaymentPlan } from "./enrollment/StepPaymentPlan";
import { StepApiKeySetup } from "./enrollment/StepApiKeySetup";
import { StepLaunchApp } from "./enrollment/StepLaunchApp";
import { triggerCelebrationConfetti } from "../utils/confetti";
import { distributeAndCreditReferralCommission } from "../utils/referralStore";

export const StudentEnrollmentScreen: React.FC<StudentEnrollmentScreenProps> = ({
  initialDetails,
  currentUser: propUser,
  subscriptionState: propSubState,
  onComplete,
  onSkipToDesk,
  onToast,
  onSubscriptionUpdated,
  onUserAuthenticated,
}) => {
  // Profile Form State
  const [name, setName] = useState(initialDetails.name || propUser?.displayName || "");
  const [grade, setGrade] = useState(initialDetails.grade || "Class 10");
  const [board, setBoard] = useState(initialDetails.board || "CBSE Board");
  const [mediumOfLearning, setMediumOfLearning] = useState(
    initialDetails.mediumOfLearning || "Hinglish"
  );
  const [selectedAvatar, setSelectedAvatar] = useState("🧑‍🎓");
  const [profileError, setProfileError] = useState<string | null>(null);

  // Authentication Hook
  const authState = useEnrollmentAuth({
    propUser,
    name,
    setName,
    setCurrentStep: (step) => setCurrentStep(step),
    onToast,
    onUserAuthenticated,
    onComplete,
  });

  // Step state
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(() => {
    if (!authState.isGoogleAuthenticated) return "google_login";
    if (initialDetails?.name && initialDetails.name.trim().length >= 2) {
      return "payment_149";
    }
    return "profile_setup";
  });

  // Payment Hook
  const paymentState = useEnrollmentPayment({
    propSubState,
    currentStep,
    name,
    grade,
    board,
    mediumOfLearning,
    authedUser: authState.authedUser,
    setCurrentStep,
    onToast,
    onSubscriptionUpdated,
  });

  // Step 2 Submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      setProfileError("Please enter your valid name.");
      return;
    }
    setProfileError(null);

    await authState.saveProfileToCloud({
      name: cleanName,
      grade,
      board,
      mediumOfLearning,
      avatarEmoji: selectedAvatar,
    });

    // Process referral commission attribution if invite code entered
    const activeCode =
      paymentState.appliedReferral?.referralCode ||
      paymentState.referralCodeInput.trim().toUpperCase();

    if (activeCode) {
      const studentId =
        authState.authedUser?.uid || "std_" + Math.random().toString(36).substring(2, 8);
      try {
        const attribution = await distributeAndCreditReferralCommission({
          referralCode: activeCode,
          newStudentId: studentId,
          newStudentName: cleanName,
          newStudentGrade: grade,
          newStudentEmail: authState.authedUser?.email || undefined,
          planPriceINR: paymentState.selectedPlan.priceINR,
          planDurationMonths: paymentState.selectedPlan.durationMonths,
          planId: paymentState.selectedPlan.id,
          planName: paymentState.selectedPlan.name,
        });

        if (attribution.success) {
          triggerCelebrationConfetti();
          onToast?.(attribution.message, "success");
        } else if (attribution.isSelfReferral) {
          onToast?.(attribution.message, "warning");
        }
      } catch (err: any) {
        console.warn("[StudentEnrollmentScreen] Referral attribution error:", err);
      }
    }

    onToast?.(`Profile saved for ${cleanName}! 🎓 Proceeding to subscription activation.`, "success");
    setCurrentStep("payment_149");
  };

  // Step Navigation Back handler
  const handleBackStep = () => {
    const currentIndex = STEPS_NAV.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS_NAV[currentIndex - 1].id as OnboardingStep);
    }
  };

  // Final Launch App
  const handleFinalLaunch = () => {
    triggerCelebrationConfetti();
    onComplete({
      name: name.trim() || "Student",
      grade,
      board,
      mediumOfLearning,
      avatarEmoji: selectedAvatar,
    });
  };

  return (
    <div
      id="student-enrollment-flow"
      className="w-full h-full min-h-full flex-1 bg-[#F8FAFC] text-slate-900 flex flex-col justify-between relative overflow-hidden select-none"
    >
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between px-4 pt-3 pb-4 z-10 relative overflow-y-auto no-scrollbar">
        {/* Top Header & Stepper Bar */}
        <EnrollmentStepperHeader
          currentStep={currentStep}
          onBack={handleBackStep}
          onSkipToDesk={onSkipToDesk}
        />

        {/* Dynamic Step Viewport */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {currentStep === "google_login" && (
              <StepGoogleLogin
                isLoggingIn={authState.isLoggingIn}
                onGoogleLogin={authState.handleGoogleLogin}
                onDirectStudentLogin={authState.handleDirectStudentLogin}
              />
            )}

            {currentStep === "profile_setup" && (
              <StepProfileSetup
                name={name}
                setName={setName}
                grade={grade}
                setGrade={setGrade}
                board={board}
                setBoard={setBoard}
                mediumOfLearning={mediumOfLearning}
                setMediumOfLearning={setMediumOfLearning}
                selectedAvatar={selectedAvatar}
                setSelectedAvatar={setSelectedAvatar}
                profileError={profileError}
                onSubmit={handleProfileSubmit}
              />
            )}

            {currentStep === "payment_149" && (
              <StepPaymentPlan
                plans={paymentState.plans}
                selectedPlanId={paymentState.selectedPlanId}
                onSelectPlanId={paymentState.setSelectedPlanId}
                selectedPlan={paymentState.selectedPlan}
                qrDataUrl={paymentState.qrDataUrl}
                userUtrInput={paymentState.userUtrInput}
                setUserUtrInput={paymentState.setUserUtrInput}
                isActivatingPayment={paymentState.isActivatingPayment}
                onConfirmPayment={paymentState.handleConfirmPayment}
                submittedPendingRecord={paymentState.submittedPendingRecord}
                isCheckingApproval={paymentState.isCheckingApproval}
                onCheckApprovalStatus={paymentState.handleCheckApprovalStatus}
                copiedUpi={paymentState.copiedUpi}
                onCopyUpiId={paymentState.handleCopyUpiId}
                receiverUpiId={paymentState.subState.customUpiReceiverId}
                onOpenUpiIntent={paymentState.handleOpenUpiIntent}
                referralCodeInput={paymentState.referralCodeInput}
                setReferralCodeInput={paymentState.setReferralCodeInput}
                appliedReferral={paymentState.appliedReferral}
                referralFeedback={paymentState.referralFeedback}
                showReferralInput={paymentState.showReferralInput}
                setShowReferralInput={paymentState.setShowReferralInput}
                onApplyReferralCode={paymentState.handleApplyReferralCode}
              />
            )}

            {currentStep === "api_key_setup" && (
              <StepApiKeySetup
                onSuccess={() => setCurrentStep("launch_app")}
                onUseCloudEngine={() => {
                  onToast?.("Configured with Cherry AI High-Speed Cloud Engine! ⚡", "success");
                  setCurrentStep("launch_app");
                }}
                onToast={onToast}
              />
            )}

            {currentStep === "launch_app" && (
              <StepLaunchApp
                name={name}
                grade={grade}
                board={board}
                mediumOfLearning={mediumOfLearning}
                selectedAvatar={selectedAvatar}
                onLaunchApp={handleFinalLaunch}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
