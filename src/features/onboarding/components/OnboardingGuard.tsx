import React from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';
import { WelcomeModal } from './WelcomeModal';

export const OnboardingGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { needsOnboarding, isCheckingOnboarding } = useOnboarding();

  if (isCheckingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <>
      {children}
      {needsOnboarding && <WelcomeModal />}
    </>
  );
};
