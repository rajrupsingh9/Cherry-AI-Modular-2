/**
 * useReferralCalculator.ts
 * Custom hook for the 5-Level Compounding Referral Income Simulator
 */
import { useState, useMemo } from "react";
import { SubscriptionPlan } from "../../utils/subscriptionStore";
import {
  PlanReferralTier,
  ReferralCommissionConfig,
} from "../../utils/referralStore";
import { computeSimulatorProjections } from "./referralCalculations";

interface UseReferralCalculatorProps {
  subscriptionPlans: SubscriptionPlan[];
  effectiveUid: string;
  effectiveName: string;
  commissionConfig: ReferralCommissionConfig;
  vipTier: PlanReferralTier;
}

export function useReferralCalculator({
  subscriptionPlans,
  effectiveUid,
  effectiveName,
  commissionConfig,
  vipTier,
}: UseReferralCalculatorProps) {
  const [calcDirectInvites, setCalcDirectInvites] = useState<number>(5);
  const [calcDuplicationRate, setCalcDuplicationRate] = useState<number>(3);
  const [calcSelectedPlanId, setCalcSelectedPlanId] = useState<string>(() => {
    return subscriptionPlans[0]?.id || "semiannual_149";
  });

  const calcTargetPlan = useMemo(() => {
    return (
      subscriptionPlans.find((p) => p.id === calcSelectedPlanId) ||
      subscriptionPlans[0] || {
        id: "semiannual_149",
        name: "6 Months Plan",
        priceINR: 149,
        durationMonths: 6,
      }
    );
  }, [subscriptionPlans, calcSelectedPlanId]);

  const {
    rewardBreakdown: calcRewardBreakdown,
    level1Earned: calcLevel1Earned,
    level5Members: calcLevel5Members,
    level5Earned: calcLevel5Earned,
    totalPotential: calcTotalPotential,
    vipTotalPotential: calcVipTotalPotential,
    vipUpgradeDifference: calcVipUpgradeDifference,
  } = useMemo(
    () =>
      computeSimulatorProjections({
        targetPlan: calcTargetPlan,
        calcDirectInvites,
        calcDuplicationRate,
        effectiveUid,
        effectiveName,
        commissionConfig,
        vipTier,
      }),
    [
      calcTargetPlan,
      calcDirectInvites,
      calcDuplicationRate,
      effectiveUid,
      effectiveName,
      commissionConfig,
      vipTier,
    ]
  );

  return {
    calcDirectInvites,
    setCalcDirectInvites,
    calcDuplicationRate,
    setCalcDuplicationRate,
    calcSelectedPlanId,
    setCalcSelectedPlanId,
    calcTargetPlan,
    calcRewardBreakdown,
    calcLevel1Earned,
    calcLevel5Members,
    calcLevel5Earned,
    calcTotalPotential,
    calcVipTotalPotential,
    calcVipUpgradeDifference,
  };
}
