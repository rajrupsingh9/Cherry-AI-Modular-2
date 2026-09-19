import React from "react";
import { AuthProvider } from "../../context/AuthContext";
import { NavigationProvider, useNavigation } from "../../context/NavigationContext";
import { SubscriptionProvider } from "../../context/SubscriptionContext";
import { ClassroomProvider } from "../../context/ClassroomContext";
import { LiveSessionUiProvider } from "../../context/LiveSessionContext";

interface AppProvidersProps {
  children: React.ReactNode;
}

const ContextBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    addToast,
    setCurrentScreen,
    setShowEnrollmentScreen,
    setShowBrandSplash,
    setShowIntroWalkthrough,
  } = useNavigation();

  return (
    <AuthProvider
      addToast={addToast}
      onNavigateScreen={setCurrentScreen}
      setShowEnrollmentScreen={setShowEnrollmentScreen}
      setShowBrandSplash={setShowBrandSplash}
      setShowIntroWalkthrough={setShowIntroWalkthrough}
    >
      <SubscriptionProvider addToast={addToast}>
        <ClassroomProvider addToast={addToast}>
          <LiveSessionUiProvider addToast={addToast}>
            {children}
          </LiveSessionUiProvider>
        </ClassroomProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
};

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <NavigationProvider>
      <ContextBridge>{children}</ContextBridge>
    </NavigationProvider>
  );
};
