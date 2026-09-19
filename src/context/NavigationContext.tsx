import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

export type ScreenType = "home" | "syllabus" | "classroom" | "quiz" | "lab" | "profile" | "admin";

export interface ToastItem {
  id: string;
  message: string;
  type: "info" | "success" | "error" | "warning";
}

export interface NavigationContextType {
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  showBrandSplash: boolean;
  setShowBrandSplash: (val: boolean) => void;
  showIntroWalkthrough: boolean;
  setShowIntroWalkthrough: (val: boolean) => void;
  showEnrollmentScreen: boolean;
  setShowEnrollmentScreen: (val: boolean) => void;
  showPostLoginMicModal: boolean;
  setShowPostLoginMicModal: (val: boolean) => void;
  showPwaInstallModal: boolean;
  setShowPwaInstallModal: (val: boolean) => void;
  showTips: boolean;
  setShowTips: (val: boolean) => void;
  showCaptions: boolean;
  setShowCaptions: (val: boolean) => void;
  activeWorkspaceTab: "board" | "document";
  setActiveWorkspaceTab: (tab: "board" | "document") => void;
  isFullScreenBoard: boolean;
  setIsFullScreenBoard: (val: boolean) => void;
  activeFaq: number | null;
  setActiveFaq: (idx: number | null) => void;
  toasts: ToastItem[];
  addToast: (message: string, type?: "info" | "success" | "error" | "warning") => void;
  removeToast: (id: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("home");
  const [showBrandSplash, setShowBrandSplash] = useState(true);
  const [showIntroWalkthrough, setShowIntroWalkthrough] = useState(false);
  const [showEnrollmentScreen, setShowEnrollmentScreen] = useState(false);
  const [showPostLoginMicModal, setShowPostLoginMicModal] = useState(false);
  const [showPwaInstallModal, setShowPwaInstallModal] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"board" | "document">("board");
  const [isFullScreenBoard, setIsFullScreenBoard] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: "info" | "success" | "error" | "warning" = "info") => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      currentScreen,
      setCurrentScreen,
      showBrandSplash,
      setShowBrandSplash,
      showIntroWalkthrough,
      setShowIntroWalkthrough,
      showEnrollmentScreen,
      setShowEnrollmentScreen,
      showPostLoginMicModal,
      setShowPostLoginMicModal,
      showPwaInstallModal,
      setShowPwaInstallModal,
      showTips,
      setShowTips,
      showCaptions,
      setShowCaptions,
      activeWorkspaceTab,
      setActiveWorkspaceTab,
      isFullScreenBoard,
      setIsFullScreenBoard,
      activeFaq,
      setActiveFaq,
      toasts,
      addToast,
      removeToast,
    }),
    [
      currentScreen,
      showBrandSplash,
      showIntroWalkthrough,
      showEnrollmentScreen,
      showPostLoginMicModal,
      showPwaInstallModal,
      showTips,
      showCaptions,
      activeWorkspaceTab,
      isFullScreenBoard,
      activeFaq,
      toasts,
      addToast,
      removeToast,
    ]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};
