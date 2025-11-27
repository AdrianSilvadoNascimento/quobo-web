import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { onboardingService, type OnboardingStatusResponse } from '../services/onboarding.service';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingContextType {
  needsOnboarding: boolean;
  isCheckingOnboarding: boolean;
  checkOnboarding: () => Promise<void>;
  setNeedsOnboarding: (value: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);

  const checkOnboarding = async () => {
    if (!isAuthenticated || !user) {
      setNeedsOnboarding(false);
      return;
    }

    try {
      setIsCheckingOnboarding(true);
      const status: OnboardingStatusResponse = await onboardingService.checkOnboardingStatus();
      setNeedsOnboarding(status.needsOnboarding);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setNeedsOnboarding(false);
    } finally {
      setIsCheckingOnboarding(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      checkOnboarding();
    }
  }, [isAuthenticated, user]);

  return (
    <OnboardingContext.Provider
      value={{
        needsOnboarding,
        isCheckingOnboarding,
        checkOnboarding,
        setNeedsOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
