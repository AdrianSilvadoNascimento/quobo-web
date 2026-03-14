import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth, saveRedirectPath } from '../contexts/AuthContext';

import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { MovementsPage } from '../features/movements/pages/MovementsPage';
import { CustomersPage } from '../features/customers/pages/CustomersPage';
import { TeamPage } from '@/features/team/pages/TeamPage';
import { InviteAcceptPage } from '@/features/team/pages/InviteAcceptPage';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ItemsPage } from '../features/items/pages/ItemsPage';
import { ItemForm } from '../features/items/pages/ItemForm';
import { CategoriesPage } from '../features/categories/pages/CategoriesPage';
import { AccountLayout } from '@/features/account/layouts/AccountLayout';
import { ProfilePage } from '@/features/account/pages/ProfilePage';
import { FinancePage } from '@/features/account/pages/FinancePage';
import { CheckoutPage } from '@/features/checkout/pages/CheckoutPage';
import { CheckoutSuccessPage } from '@/features/checkout/pages/CheckoutSuccessPage';
import CustomerForm from '@/features/customers/pages/CustomerForm';
import { AuditsPage } from '@/features/audits/pages/AuditsPage';
import { NewAuditPage } from '@/features/audits/pages/NewAuditPage';
import { AuditDetailsPage } from '@/features/audits/pages/AuditDetailsPage';
import ForgotPassword from '@/features/auth/pages/ForgotPassword';
import ResetPassword from '@/features/auth/pages/ResetPassword';
import { AuthCallbackPage } from '@/features/auth/pages/AuthCallbackPage';
import { ImportPage } from '@/features/import';
import { FeatureGuard } from '@/components/FeatureGuard';
import { SuppliersPage } from '@/features/suppliers/pages/SuppliersPage';
import { SupplierFormPage } from '@/features/suppliers/pages/SupplierFormPage';
import { SettingsLayout } from '@/features/settings/layouts/SettingsLayout';
import { UnitOfMeasureSettingsPage } from '@/features/settings/pages/UnitOfMeasureSettingsPage';
import { IntegrationSettingsPage } from '@/features/settings/pages/IntegrationSettingsPage';
import { WebhookSettingsPage } from '@/features/settings/pages/WebhookSettingsPage';

/**
 * Redirects to login while saving the attempted path for route memory.
 */
const RedirectToLogin: React.FC = () => {
  const location = useLocation();

  // Save the current path so we can redirect after login
  saveRedirectPath(location.pathname + location.search);

  return <Navigate to="/login" replace />;
};

export const Router: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />
      <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/checkout/success" element={<CheckoutSuccessPage />} />

      {/* Invite Accept - Always public, regardless of auth status */}
      <Route path="/invite/accept/:token" element={<InviteAcceptPage />} />

      {/* Protected Routes */}
      {
        isAuthenticated ? (
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/products" element={<ItemsPage />} />
            <Route path="/products/new" element={<ItemForm />} />
            <Route path="/products/:id" element={<ItemForm />} />

            <Route path="/movements" element={<MovementsPage />} />

            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/new" element={<CustomerForm />} />
            <Route path="/customers/:id" element={<CustomerForm />} />

            <Route path="/team" element={
              <FeatureGuard check={(feature) => feature?.team_features?.enabled}>
                <TeamPage />
              </FeatureGuard>
            } />

            <Route path="/categories" element={<CategoriesPage />} />

            {/* Audits Routes */}
            <Route path="/audits" element={<AuditsPage />} />
            <Route path="/audits/new" element={<NewAuditPage />} />
            <Route path="/audits/:id" element={<AuditDetailsPage />} />

            {/* Supplier Routes */}
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/suppliers/new" element={<SupplierFormPage />} />
            <Route path="/suppliers/:id" element={<SupplierFormPage />} />

            {/* Import Route */}
            <Route path="/import" element={
              <FeatureGuard check={(feature) => feature?.import_features?.excel_import}>
                <ImportPage />
              </FeatureGuard>
            } />

            {/* Checkout/Plans Routes */}
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/plans" element={<Navigate to="/checkout" replace />} />

            {/* Account routes */}
            <Route path="/account" element={<AccountLayout />}>
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<ProfilePage />} />
              {/* Finance page is admin-only */}
              <Route path="finance" element={
                user?.type === 'OWNER' || user?.type === 'ADMIN'
                  ? <FinancePage />
                  : <Navigate to="/account/profile" replace />
              } />
            </Route>

            {/* Settings Routes */}
            <Route path="/settings" element={<SettingsLayout />}>
              <Route index element={<Navigate to="unit-of-measure" replace />} />
              <Route path="unit-of-measure" element={<UnitOfMeasureSettingsPage />} />
              <Route path="integrations" element={
                <FeatureGuard check={(feature) => feature?.api_access?.enabled}>
                  <IntegrationSettingsPage />
                </FeatureGuard>
              } />
              <Route path="webhooks" element={
                <FeatureGuard check={(feature) => feature?.api_access?.enabled}>
                  <WebhookSettingsPage />
                </FeatureGuard>
              } />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<RedirectToLogin />} />
        )
      }
    </Routes>
  );
}
