/**
 * useAppEventListeners.ts
 * Manages global window events, key rotation alerts, PWA checks, referrals, keyboard shortcuts, and mic prompts.
 */
import React, { useEffect, useCallback } from "react";
import {
  SubscriptionState,
  loadSubscriptionState,
  syncSubscriptionSettingsFromCloud,
} from "../../utils/subscriptionStore";
import { AudioPodcastData } from "../../types";

interface UseAppEventListenersParams {
  addToast: (message: string, type: "info" | "success" | "error") => void;
  subscriptionState: SubscriptionState;
  setSubscriptionState: React.Dispatch<React.SetStateAction<SubscriptionState>>;
  setShowEnrollmentScreen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowStudentAccountHub: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveAudioPodcast: React.Dispatch<React.SetStateAction<AudioPodcastData | null>>;
  setIsAudioPodcastModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowPwaInstallModal: React.Dispatch<React.SetStateAction<boolean>>;
  showPostLoginMicModal: boolean;
  setShowPostLoginMicModal: React.Dispatch<React.SetStateAction<boolean>>;
  user: any;
  isAdmin: boolean;
  showBrandSplash: boolean;
  showIntroWalkthrough: boolean;
  showEnrollmentScreen: boolean;
  currentScreen: string;
  state: string;
  togglePauseTeaching: () => void;
}

export function useAppEventListeners({
  addToast,
  subscriptionState,
  setSubscriptionState,
  setShowEnrollmentScreen,
  setShowStudentAccountHub,
  setActiveAudioPodcast,
  setIsAudioPodcastModalOpen,
  setShowPwaInstallModal,
  showPostLoginMicModal,
  setShowPostLoginMicModal,
  user,
  isAdmin,
  showBrandSplash,
  showIntroWalkthrough,
  showEnrollmentScreen,
  currentScreen,
  state,
  togglePauseTeaching,
}: UseAppEventListenersParams) {
  // 1. Global listener to open dual-voice audio podcast from any screen
  useEffect(() => {
    const handleOpenPodcastEvent = (e: any) => {
      if (e.detail) {
        setActiveAudioPodcast(e.detail);
        setIsAudioPodcastModalOpen(true);
      }
    };
    window.addEventListener("cherry_open_audio_podcast", handleOpenPodcastEvent);
    return () => {
      window.removeEventListener("cherry_open_audio_podcast", handleOpenPodcastEvent);
    };
  }, [setActiveAudioPodcast, setIsAudioPodcastModalOpen]);

  // 2. Real-time synchronization for Student Subscription & Pro Access
  useEffect(() => {
    syncSubscriptionSettingsFromCloud().catch(() => {});
    const handleSubscriptionUpdated = (e: any) => {
      const newState: SubscriptionState = e?.detail || loadSubscriptionState();
      setSubscriptionState(newState);
      if (newState.isPro) {
        addToast("🎉 Pro Access Verified! Premium Socratic features are now active.", "success");
      }
    };
    window.addEventListener("cherry_subscription_updated", handleSubscriptionUpdated);
    return () => {
      window.removeEventListener("cherry_subscription_updated", handleSubscriptionUpdated);
    };
  }, [addToast, setSubscriptionState]);

  // 3. Global event listener for Pro subscription plans navigation
  useEffect(() => {
    const handleOpenPlans = () => {
      setShowEnrollmentScreen(true);
      setShowStudentAccountHub(false);
    };
    window.addEventListener("cherry_open_subscription_plans", handleOpenPlans);
    return () => {
      window.removeEventListener("cherry_open_subscription_plans", handleOpenPlans);
    };
  }, [setShowEnrollmentScreen, setShowStudentAccountHub]);

  // 4. Automatically trigger the PWA "Install App" popup on landing if not in standalone mode
  useEffect(() => {
    try {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      const dismissedThisSession = sessionStorage.getItem("pwa_install_dismissed_session");
      if (!isStandalone && !dismissedThisSession) {
        const timer = setTimeout(() => {
          setShowPwaInstallModal(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch (_) {}
  }, [setShowPwaInstallModal]);

  // 5. Capture referral invite code (?ref=CODE) from incoming share links
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.location.search) {
        const urlParams = new URLSearchParams(window.location.search);
        const refParam = urlParams.get("ref");
        if (refParam && refParam.trim()) {
          const cleanRef = refParam.trim().toUpperCase();
          localStorage.setItem("cherry_pending_ref_code", cleanRef);
        }
      }
    } catch (_) {}
  }, []);

  // 6. Post-Login Microphone Permission Handlers
  const handleAllowPostLoginMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      sessionStorage.setItem("cherry_mic_prompt_handled", "true");
      setShowPostLoginMicModal(false);
      addToast("Microphone enabled! Aap Cherry Ma'am se bolkar doubts pooch sakte hain 🎙️✨", "success");
    } catch (err: any) {
      console.warn("[PostLoginMic] Permission request denied or dismissed:", err);
      sessionStorage.setItem("cherry_mic_prompt_handled", "true");
      setShowPostLoginMicModal(false);
      addToast("Speaker-Only Mode active. Aap text se bhi doubts pooch sakte hain 🔊💬", "info");
    }
  }, [addToast, setShowPostLoginMicModal]);

  const handleDismissPostLoginMic = useCallback(() => {
    sessionStorage.setItem("cherry_mic_prompt_handled", "true");
    setShowPostLoginMicModal(false);
  }, [setShowPostLoginMicModal]);

  // 7. Trigger microphone setup modal only after student is logged in and past splash/intro/enrollment
  useEffect(() => {
    if (
      user &&
      !isAdmin &&
      !showBrandSplash &&
      !showIntroWalkthrough &&
      !showEnrollmentScreen &&
      sessionStorage.getItem("cherry_mic_prompt_handled") !== "true"
    ) {
      const timer = setTimeout(() => {
        setShowPostLoginMicModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, isAdmin, showBrandSplash, showIntroWalkthrough, showEnrollmentScreen, setShowPostLoginMicModal]);

  // 8. Listen for Gemini API Key automatic failovers and 60s cooldown recoveries
  useEffect(() => {
    const handleKeyRotated = (e: any) => {
      const detail = e?.detail;
      if (detail && detail.success && detail.nextKeyLabel) {
        if (detail.isPreemptive) {
          addToast(
            `⚡ Predictive Handover: Soft-switched to ${detail.nextKeyLabel} to prevent quota interruption! 🛡️`,
            "info"
          );
        } else {
          addToast(
            `⚡ Rate limit hit. Auto-switched to ${detail.nextKeyLabel}! 🔑`,
            "info"
          );
        }
      } else if (detail && !detail.success) {
        addToast(
          "All configured Gemini API keys reached quota limit. Please add another backup key or wait for 60s cooldown.",
          "error"
        );
      }
    };
    const handleKeyRecovered = (e: any) => {
      const detail = e?.detail;
      if (detail && Array.isArray(detail.recoveredLabels) && detail.recoveredLabels.length > 0) {
        addToast(
          `🟢 60s Cooldown Complete: ${detail.recoveredLabels.join(", ")} is back on Standby! ✨`,
          "success"
        );
      }
    };
    window.addEventListener("gemini-key-rotated", handleKeyRotated);
    window.addEventListener("gemini-key-recovered", handleKeyRecovered);
    return () => {
      window.removeEventListener("gemini-key-rotated", handleKeyRotated);
      window.removeEventListener("gemini-key-recovered", handleKeyRecovered);
    };
  }, [addToast]);

  // 9. Keyboard shortcut listener: Space or P to Pause/Resume live session
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || "").toLowerCase();
      const isInput =
        activeTag === "input" ||
        activeTag === "textarea" ||
        (document.activeElement as HTMLElement)?.isContentEditable;
      if (isInput) return;
      if (currentScreen === "classroom" && state !== "disconnected") {
        if (e.code === "Space" || e.key === "p" || e.key === "P") {
          e.preventDefault();
          togglePauseTeaching();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentScreen, state, togglePauseTeaching]);

  return {
    handleAllowPostLoginMic,
    handleDismissPostLoginMic,
  };
}
