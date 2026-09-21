/**
 * ReferAndEarnHub.tsx
 * Thin Orchestrator for the 5-Level Passive Royalty and Referral System
 */
import React from "react";
import { ChevronLeft, Layers, TrendingUp, Clock, HelpCircle } from "lucide-react";
import { ReferAndEarnHubProps, ReferralTab } from "./referral/referralTypes";
import { useReferralHub } from "./referral/useReferralHub";
import { ReferralAlerts } from "./referral/ReferralAlerts";
import { ReferralHeroWallet } from "./referral/ReferralHeroWallet";
import { ReferralShareBar } from "./referral/ReferralShareBar";
import { ReferralPlanTab } from "./referral/ReferralPlanTab";
import { ReferralCalculatorTab } from "./referral/ReferralCalculatorTab";
import { ReferralHistoryTab } from "./referral/ReferralHistoryTab";
import { ReferralRulesTab } from "./referral/ReferralRulesTab";
import { ReferralModals } from "./referral/ReferralModals";

export const ReferAndEarnHub: React.FC<ReferAndEarnHubProps> = ({
  studentName = "Student",
  userUid = "",
  onToast,
  onClose,
  onOpenSubscriptionPlans,
}) => {
  const hub = useReferralHub({ studentName, userUid, onToast });

  const tabs: { id: ReferralTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "plan", label: "5-Level Plan", icon: Layers },
    { id: "calculator", label: "Income Simulator", icon: TrendingUp },
    { id: "history", label: "History & Logs", icon: Clock },
    { id: "rules", label: "Rules & FAQ", icon: HelpCircle },
  ];

  return (
    <div className="w-full flex-1 flex flex-col space-y-3.5 sm:space-y-4 text-left max-w-2xl mx-auto px-1 sm:px-2 pb-8 overflow-x-hidden">
      {/* Mobile-First Header Navigation */}
      <div className="flex items-center justify-between gap-2 pb-1">
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
            <span>Profile</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white text-sm shadow-xs">
              🎁
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                Refer & Earn
              </h2>
              <span className="text-[10px] text-slate-500 font-mono font-medium">
                5-Level Income System
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10.5px] font-mono font-black flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
            {hub.isReferrerVip ? "👑 VIP " : "⭐ "}
            L1 {hub.referrerTier.level1Percent}%
            {hub.referrerTier.level5Percent > 0 ? ` + L5 ${hub.referrerTier.level5Percent}%` : ""}
          </span>
        </div>
      </div>

      {/* Account Alerts, Frozen state, Missed earnings & Tier Banner */}
      <ReferralAlerts
        refState={hub.refState}
        setRefState={hub.setRefState}
        effectiveUid={hub.effectiveUid}
        referrerTier={hub.referrerTier}
        vipTier={hub.vipTier}
        isReferrerVip={hub.isReferrerVip}
        onOpenSubscriptionPlans={onOpenSubscriptionPlans}
      />

      {/* Hero Wallet Card */}
      <ReferralHeroWallet
        refState={hub.refState}
        level1Earned={hub.level1Earned}
        level1Count={hub.level1Count}
        level5Earned={hub.level5Earned}
        level5Count={hub.level5Count}
        totalTeamMembers={hub.totalTeamMembers}
        onOpenWithdraw={() => hub.setShowWithdrawModal(true)}
        onToast={onToast}
      />

      {/* 1-Tap Multi-Channel Share Bar */}
      <ReferralShareBar
        referralCode={hub.refState.referralCode}
        referralLink={hub.referralLink}
        copiedCode={hub.copiedCode}
        copiedLink={hub.copiedLink}
        referrerTier={hub.referrerTier}
        onCopyCode={hub.handleCopyCode}
        onShareWhatsApp={hub.handleShareWhatsApp}
        onShareTelegram={hub.handleShareTelegram}
        onNativeShare={hub.handleNativeShare}
        onOpenQrModal={() => hub.setShowQrModal(true)}
      />

      {/* Segmented Sub-Tabs Bar */}
      <div className="w-full overflow-x-auto flex items-center gap-1.5 p-1.5 bg-slate-100/90 border border-slate-200 rounded-2xl touch-pan-x overscroll-x-contain">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = hub.activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => hub.setActiveTab(tab.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer select-none active:scale-95 ${
                isActive
                  ? "bg-white text-indigo-700 shadow-xs font-black border border-slate-200/90"
                  : "text-slate-600 hover:text-slate-900 bg-transparent hover:bg-white/60 border border-transparent"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: 5-Level Plan Structure */}
      {hub.activeTab === "plan" && (
        <ReferralPlanTab
          dynamicTiers={hub.dynamicTiers}
          refState={hub.refState}
          referrerTier={hub.referrerTier}
          vipTier={hub.vipTier}
          isReferrerVip={hub.isReferrerVip}
          subscriptionPlans={hub.subscriptionPlans}
          commissionConfig={hub.commissionConfig}
          effectiveUid={hub.effectiveUid}
          effectiveName={hub.effectiveName}
          onOpenSubscriptionPlans={onOpenSubscriptionPlans}
        />
      )}

      {/* Tab 2: Potential Income Simulator */}
      {hub.activeTab === "calculator" && (
        <ReferralCalculatorTab
          subscriptionPlans={hub.subscriptionPlans}
          calcSelectedPlanId={hub.calcSelectedPlanId}
          setCalcSelectedPlanId={hub.setCalcSelectedPlanId}
          calcDirectInvites={hub.calcDirectInvites}
          setCalcDirectInvites={hub.setCalcDirectInvites}
          calcDuplicationRate={hub.calcDuplicationRate}
          setCalcDuplicationRate={hub.setCalcDuplicationRate}
          referrerTier={hub.referrerTier}
          vipTier={hub.vipTier}
          isReferrerVip={hub.isReferrerVip}
          calcLevel1Earned={hub.calcLevel1Earned}
          calcLevel5Members={hub.calcLevel5Members}
          calcLevel5Earned={hub.calcLevel5Earned}
          calcTotalPotential={hub.calcTotalPotential}
          calcRewardBreakdown={hub.calcRewardBreakdown}
          calcVipTotalPotential={hub.calcVipTotalPotential}
          calcVipUpgradeDifference={hub.calcVipUpgradeDifference}
          onOpenSubscriptionPlans={onOpenSubscriptionPlans}
        />
      )}

      {/* Tab 3: History & Logs */}
      {hub.activeTab === "history" && <ReferralHistoryTab refState={hub.refState} />}

      {/* Tab 4: Rules & FAQ */}
      {hub.activeTab === "rules" && (
        <ReferralRulesTab
          activePlanTiers={hub.activePlanTiers}
          vipTier={hub.vipTier}
          commissionConfig={hub.commissionConfig}
        />
      )}

      {/* Modals for Withdrawal & QR Code */}
      <ReferralModals
        showWithdrawModal={hub.showWithdrawModal}
        onCloseWithdrawModal={() => hub.setShowWithdrawModal(false)}
        withdrawAmount={hub.withdrawAmount}
        setWithdrawAmount={hub.setWithdrawAmount}
        withdrawUpi={hub.withdrawUpi}
        setWithdrawUpi={hub.setWithdrawUpi}
        walletBalance={hub.refState.walletBalance}
        minWithdrawalLimit={hub.commissionConfig.minWithdrawalLimit || 50}
        onWithdrawSubmit={hub.handleWithdrawSubmit}
        showQrModal={hub.showQrModal}
        onCloseQrModal={() => hub.setShowQrModal(false)}
        qrDataUrl={hub.qrDataUrl}
        studentName={hub.refState.studentName}
        referralCode={hub.refState.referralCode}
        copiedLink={hub.copiedLink}
        onCopyLink={hub.handleCopyLink}
        onToast={onToast}
      />
    </div>
  );
};
