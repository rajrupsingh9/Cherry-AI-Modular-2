/**
 * referralCalculations.ts
 * Calculation logic for referral network statistics, dynamic level rewards, and compounding simulation
 */
import {
  ReferralAccountState,
  ReferralCommissionConfig,
  PlanReferralTier,
  calculateTieredReferralReward,
} from "../../utils/referralStore";
import { SubscriptionPlan } from "../../utils/subscriptionStore";

export function computeReferralLevelStats(
  refState: ReferralAccountState,
  referrerTier: PlanReferralTier,
  commissionConfig: ReferralCommissionConfig
) {
  const level1Count = refState.tierCounts[1] || 0;
  const level1EarnedFromActivities = (refState.activities || [])
    .filter((a) => a.level === 1 && a.status === "credited")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const level1Earned =
    level1EarnedFromActivities > 0
      ? level1EarnedFromActivities
      : level1Count *
        (referrerTier.level1Percent
          ? Math.max(1, Math.round(149 * (referrerTier.level1Percent / 100)))
          : commissionConfig.level1Reward);

  const level5Count = refState.tierCounts[5] || 0;
  const level5EarnedFromActivities = (refState.activities || [])
    .filter((a) => a.level === 5 && a.status === "credited")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const level5Earned =
    level5EarnedFromActivities > 0
      ? level5EarnedFromActivities
      : level5Count *
        (referrerTier.level5Percent
          ? Math.max(1, Math.round(149 * (referrerTier.level5Percent / 100)))
          : commissionConfig.level5Reward);

  const totalTeamMembers = Object.values(refState.tierCounts).reduce(
    (a: number, b: number) => a + Number(b || 0),
    0
  );

  return {
    level1Count,
    level1Earned,
    level5Count,
    level5Earned,
    totalTeamMembers,
  };
}

export function computeSimulatorProjections({
  targetPlan,
  calcDirectInvites,
  calcDuplicationRate,
  effectiveUid,
  effectiveName,
  commissionConfig,
  vipTier,
}: {
  targetPlan: SubscriptionPlan;
  calcDirectInvites: number;
  calcDuplicationRate: number;
  effectiveUid: string;
  effectiveName: string;
  commissionConfig: ReferralCommissionConfig;
  vipTier: PlanReferralTier;
}) {
  const rewardBreakdown = calculateTieredReferralReward({
    planPriceINR: targetPlan.priceINR,
    planDurationMonths: targetPlan.durationMonths,
    planId: targetPlan.id,
    planName: targetPlan.name,
    referrerIdOrName: effectiveUid || effectiveName,
    config: commissionConfig,
  });

  const level1Earned = calcDirectInvites * rewardBreakdown.level1Reward;
  const level5Members = Math.round(
    calcDirectInvites * Math.pow(calcDuplicationRate, 4)
  );
  const level5Earned = level5Members * rewardBreakdown.level5Reward;
  const totalPotential = level1Earned + level5Earned;

  const vipL1 = Math.max(1, Math.round(targetPlan.priceINR * (vipTier.level1Percent / 100)));
  const vipL5 = Math.max(1, Math.round(targetPlan.priceINR * (vipTier.level5Percent / 100)));

  const vipTotalPotential =
    calcDirectInvites * vipL1 + level5Members * vipL5;
  const vipUpgradeDifference = Math.max(0, vipTotalPotential - totalPotential);

  return {
    rewardBreakdown,
    level1Earned,
    level5Members,
    level5Earned,
    totalPotential,
    vipTotalPotential,
    vipUpgradeDifference,
  };
}

export function resolveEffectiveUser(studentName = "Student", userUid = "") {
  let effectiveUid = userUid;
  if (!effectiveUid || effectiveUid === "local_learner") {
    try {
      const localUserRaw = localStorage.getItem("local_active_user");
      if (localUserRaw) {
        const parsed = JSON.parse(localUserRaw);
        if (parsed?.uid) effectiveUid = parsed.uid;
      }
    } catch (_) {}
  }

  let effectiveName = studentName;
  if (!effectiveName || effectiveName === "Student") {
    try {
      const localUserRaw = localStorage.getItem("local_active_user");
      if (localUserRaw) {
        const parsed = JSON.parse(localUserRaw);
        if (parsed?.displayName) effectiveName = parsed.displayName;
      }
      if (!effectiveName || effectiveName === "Student") {
        const profRaw = localStorage.getItem("cherry_student_profile");
        if (profRaw) {
          const prof = JSON.parse(profRaw);
          if (prof?.name) effectiveName = prof.name;
        }
      }
    } catch (_) {}
  }

  return {
    effectiveUid: effectiveUid || "",
    effectiveName: effectiveName || "Student",
  };
}

