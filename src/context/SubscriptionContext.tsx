import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  SubscriptionState,
  SubscriptionPlan,
  loadSubscriptionState,
  syncSubscriptionSettingsFromCloud,
  clearUserSubscriptionState,
  getInitialSubscriptionState,
  isStudentSubscribed,
} from "../utils/subscriptionStore";

export interface SubscriptionContextType {
  subscriptionState: SubscriptionState;
  showSubscriptionModal: boolean;
  isPro: boolean;
  setShowSubscriptionModal: (val: boolean) => void;
  setSubscriptionState: React.Dispatch<React.SetStateAction<SubscriptionState>>;
  refreshSubscription: () => Promise<void>;
  checkProAccess: () => boolean;
  clearSubscription: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export interface SubscriptionProviderProps {
  children: React.ReactNode;
  addToast?: (message: string, type?: "info" | "success" | "error" | "warning") => void;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children, addToast }) => {
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>(() => loadSubscriptionState());
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);

  // Sync cloud settings & listen to live subscription update events
  useEffect(() => {
    // Initial sync of subscription settings and dynamic plans from Firestore
    syncSubscriptionSettingsFromCloud().catch(() => {});

    const handleSubscriptionUpdated = (e: any) => {
      const newState: SubscriptionState = e?.detail || loadSubscriptionState();
      setSubscriptionState(newState);
      if (newState.isPro && addToast) {
        addToast("🎉 Pro Access Verified! Premium Socratic features are now active.", "success");
      }
    };

    window.addEventListener("cherry_subscription_updated", handleSubscriptionUpdated);
    return () => {
      window.removeEventListener("cherry_subscription_updated", handleSubscriptionUpdated);
    };
  }, [addToast]);

  // Capture referral invite code (?ref=CODE) from incoming share links
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

  const refreshSubscription = useCallback(async () => {
    try {
      await syncSubscriptionSettingsFromCloud();
      const fresh = loadSubscriptionState();
      setSubscriptionState(fresh);
    } catch (err) {
      console.warn("Could not refresh cloud subscription:", err);
    }
  }, []);

  const clearSubscription = useCallback(() => {
    clearUserSubscriptionState();
    setSubscriptionState(getInitialSubscriptionState());
  }, []);

  const checkProAccess = useCallback((): boolean => {
    return isStudentSubscribed(subscriptionState);
  }, [subscriptionState]);

  const isPro = useMemo(() => {
    return isStudentSubscribed(subscriptionState);
  }, [subscriptionState]);

  const value = useMemo(
    () => ({
      subscriptionState,
      showSubscriptionModal,
      isPro,
      setShowSubscriptionModal,
      setSubscriptionState,
      refreshSubscription,
      checkProAccess,
      clearSubscription,
    }),
    [
      subscriptionState,
      showSubscriptionModal,
      isPro,
      refreshSubscription,
      checkProAccess,
      clearSubscription,
    ]
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
