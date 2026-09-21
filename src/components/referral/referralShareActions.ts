/**
 * referralShareActions.ts
 * Sharing helpers, clipboard copy utilities, and withdrawal dispatch
 */
import {
  ReferralAccountState,
  requestWithdrawal,
} from "../../utils/referralStore";

export function shareViaWhatsApp(referralCode: string, referralLink: string) {
  const message = `🚀 *Namaste! Join Cherry AI 1-on-1 Socratic Classroom & Virtual Lab!*\n\nUse my referral invite code *${referralCode}* to get instant access and earn up to 67% Referral Rewards! 🎉\n\n👉 Join here: ${referralLink}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
}

export function shareViaTelegram(referralCode: string, referralLink: string) {
  const text = `🚀 Join Cherry AI 1-on-1 Socratic Classroom & Virtual Lab!\n\nUse my invite code ${referralCode} to get instant access and earn up to 67% Referral Rewards! 🎉\n\n👉 Join here: ${referralLink}`;
  const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
  window.open(tgUrl, "_blank");
}

export async function shareNativelyOrFallback(
  referralCode: string,
  referralLink: string,
  fallbackCopy: () => void
): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: "Cherry AI - 1-on-1 AI Classroom & Lab",
        text: `Join Cherry AI with my referral code ${referralCode} and earn up to 67% Referral Rewards!`,
        url: referralLink,
      });
      return true;
    } catch (_) {
      return false;
    }
  } else {
    fallbackCopy();
    return false;
  }
}

export function submitReferralWithdrawal({
  refState,
  withdrawAmount,
  withdrawUpi,
  userUid,
  studentName,
  minLimit,
}: {
  refState: ReferralAccountState;
  withdrawAmount: string;
  withdrawUpi: string;
  userUid?: string;
  studentName?: string;
  minLimit: number;
}) {
  const amt = parseFloat(withdrawAmount);
  if (isNaN(amt) || amt < minLimit) {
    return { success: false, message: `Minimum withdrawal amount is ₹${minLimit}.` };
  }
  return requestWithdrawal(refState, amt, withdrawUpi, userUid, studentName);
}
