import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface FeatureGuardProps {
  /** Dot-path checker against subscription.plan.features */
  check: (features: any) => boolean;
  /** Where to redirect when feature is not available */
  redirectTo?: string;
  children: React.ReactNode;
}

/**
 * Route guard that checks plan features before rendering children.
 * If the feature is not enabled, redirects to /dashboard (or custom path).
 *
 * Usage:
 *   <FeatureGuard check={(f) => f?.import_features?.excel_import}>
 *     <ImportPage />
 *   </FeatureGuard>
 */
export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  check,
  redirectTo = '/dashboard',
  children,
}) => {
  const { subscription } = useAuth();
  const features = subscription?.plan?.features;

  if (!features || !check(features)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
