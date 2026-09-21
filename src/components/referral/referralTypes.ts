/**
 * referralTypes.ts
 * Types and interfaces for the Refer & Earn 5-Level Royalty System
 */
import React from "react";
import {
  ReferralAccountState,
  ReferralCommissionConfig,
  PlanReferralTier,
} from "../../utils/referralStore";
import { SubscriptionPlan } from "../../utils/subscriptionStore";

export type ReferralTab = "plan" | "calculator" | "history" | "rules";

export interface ReferAndEarnHubProps {
  studentName?: string;
  userUid?: string;
  onToast?: (message: string, type?: "success" | "info" | "error") => void;
  onClose?: () => void;
  onOpenSubscriptionPlans?: () => void;
}

export interface ReferralAlertsProps {
  refState: ReferralAccountState;
  setRefState: React.Dispatch<React.SetStateAction<ReferralAccountState>>;
  effectiveUid: string;
  referrerTier: PlanReferralTier;
  vipTier: PlanReferralTier;
  isReferrerVip: boolean;
  onOpenSubscriptionPlans?: () => void;
}

export interface ReferralHeroWalletProps {
  refState: ReferralAccountState;
  level1Earned: number;
  level1Count: number;
  level5Earned: number;
  level5Count: number;
  totalTeamMembers: number;
  onOpenWithdraw: () => void;
  onToast?: (message: string, type?: "success" | "info" | "error") => void;
}

export interface ReferralShareBarProps {
  referralCode: string;
  referralLink: string;
  copiedCode: boolean;
  copiedLink: boolean;
  referrerTier: PlanReferralTier;
  onCopyCode: () => void;
  onShareWhatsApp: () => void;
  onShareTelegram: () => void;
  onNativeShare: () => void;
  onOpenQrModal: () => void;
}

export interface ReferralPlanTabProps {
  dynamicTiers: any[];
  refState: ReferralAccountState;
  referrerTier: PlanReferralTier;
  vipTier: PlanReferralTier;
  isReferrerVip: boolean;
  subscriptionPlans: SubscriptionPlan[];
  commissionConfig: ReferralCommissionConfig;
  effectiveUid: string;
  effectiveName: string;
  onOpenSubscriptionPlans?: () => void;
}

export interface ReferralCalculatorTabProps {
  subscriptionPlans: SubscriptionPlan[];
  calcSelectedPlanId: string;
  setCalcSelectedPlanId: (id: string) => void;
  calcDirectInvites: number;
  setCalcDirectInvites: (val: number) => void;
  calcDuplicationRate: number;
  setCalcDuplicationRate: (val: number) => void;
  referrerTier: PlanReferralTier;
  vipTier: PlanReferralTier;
  isReferrerVip: boolean;
  calcLevel1Earned: number;
  calcLevel5Members: number;
  calcLevel5Earned: number;
  calcTotalPotential: number;
  calcRewardBreakdown: any;
  calcVipTotalPotential: number;
  calcVipUpgradeDifference: number;
  onOpenSubscriptionPlans?: () => void;
}

export interface ReferralHistoryTabProps {
  refState: ReferralAccountState;
}

export interface ReferralRulesTabProps {
  activePlanTiers: PlanReferralTier[];
  vipTier: PlanReferralTier;
  commissionConfig: ReferralCommissionConfig;
}

export interface ReferralModalsProps {
  showWithdrawModal: boolean;
  onCloseWithdrawModal: () => void;
  withdrawAmount: string;
  setWithdrawAmount: (val: string) => void;
  withdrawUpi: string;
  setWithdrawUpi: (val: string) => void;
  walletBalance: number;
  minWithdrawalLimit: number;
  onWithdrawSubmit: (e: React.FormEvent) => void;
  showQrModal: boolean;
  onCloseQrModal: () => void;
  qrDataUrl: string;
  studentName: string;
  referralCode: string;
  copiedLink: boolean;
  onCopyLink: () => void;
  onToast?: (message: string, type?: "success" | "info" | "error") => void;
}
