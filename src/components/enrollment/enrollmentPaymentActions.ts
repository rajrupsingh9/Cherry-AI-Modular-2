/**
 * enrollmentPaymentActions.ts
 * Standalone asynchronous handlers for UTR submission, approval status check, and UPI app intent launching
 */
import {
  buildDynamicUpiUri,
  DEFAULT_RECEIVER_UPI_ID,
  DEFAULT_MERCHANT_NAME,
  recordStudentUtrPayment,
  checkStudentApprovalStatus,
  saveStudentSubscriptionToCloud,
  SubscriptionPlan,
  StudentSubscriptionRecord,
} from "../../utils/subscriptionStore";
import { lookupReferralCode, ReferralLookupResult } from "../../utils/referralStore";

export function validateReferralDiscount(
  code: string,
  authedUser: any,
  name: string,
  plan: SubscriptionPlan
): ReferralLookupResult {
  const studentId = authedUser?.uid || "student_enroll";
  const studentName = name.trim() || authedUser?.displayName || "Student";
  return lookupReferralCode(code.trim().toUpperCase(), studentId, studentName, {
    priceINR: plan.priceINR,
    durationMonths: plan.durationMonths,
    planId: plan.id,
  });
}

export interface SubmitUtrParams {
  authedUser: any;
  name: string;
  grade: string;
  board: string;
  mediumOfLearning: string;
  selectedPlan: SubscriptionPlan;
  payableAmount: number;
  userUtrInput: string;
}

export async function submitStudentUtr({
  authedUser,
  name,
  grade,
  board,
  mediumOfLearning,
  selectedPlan,
  payableAmount,
  userUtrInput,
}: SubmitUtrParams): Promise<StudentSubscriptionRecord> {
  const targetUid = authedUser?.uid || `std_${Date.now()}`;
  const targetEmail = authedUser?.email || undefined;
  const targetName = name.trim() || authedUser?.displayName || "Student";

  const record = recordStudentUtrPayment({
    studentId: targetUid,
    studentName: targetName,
    studentEmail: targetEmail,
    grade: grade || "Class 10",
    board: board || "CBSE Board",
    subject: "Science",
    mediumOfLearning: mediumOfLearning || "Hinglish",
    planId: selectedPlan.id,
    amountINR: payableAmount,
    utrNumber: userUtrInput.trim(),
    status: "pending_verification",
  });

  await saveStudentSubscriptionToCloud(record);
  return record;
}

export async function checkApprovalForStudent(authedUser: any, name: string) {
  const currentUid = authedUser?.uid;
  const currentEmail = authedUser?.email;
  const currentName = name.trim() || authedUser?.displayName;

  return await checkStudentApprovalStatus({
    studentId: currentUid,
    studentEmail: currentEmail,
    studentName: currentName,
  });
}

export function launchUpiApp({
  receiverUpiId,
  merchantName,
  amount,
  transactionRef,
  planName,
  studentName,
  appScheme,
}: {
  receiverUpiId?: string;
  merchantName?: string;
  amount: number;
  transactionRef: string;
  planName: string;
  studentName: string;
  appScheme?: "gpay" | "phonepe" | "paytm";
}) {
  const genericUri = buildDynamicUpiUri({
    receiverUpiId: receiverUpiId || DEFAULT_RECEIVER_UPI_ID,
    merchantName: merchantName || DEFAULT_MERCHANT_NAME,
    amount,
    transactionRef,
    note: `CherryAI ${planName} - ${studentName || "Student"}`,
  });

  let targetUrl = genericUri;
  if (appScheme === "gpay") targetUrl = genericUri.replace("upi://pay", "tez://upi/pay");
  else if (appScheme === "phonepe") targetUrl = genericUri.replace("upi://pay", "phonepe://pay");
  else if (appScheme === "paytm") targetUrl = genericUri.replace("upi://pay", "paytmmp://pay");

  window.location.href = targetUrl;
}
