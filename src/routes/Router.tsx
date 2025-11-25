import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { MovementsPage } from '../features/movements/pages/MovementsPage';
import { CustomersPage } from '../features/customers/pages/CustomersPage';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ItemsPage } from '../features/itens/pages/ItemsPage';
import { CategoriesPage } from '../features/categories/pages/CategoriesPage';
import { AccountLayout } from '@/features/account/layouts/AccountLayout';
import { ProfilePage } from '@/features/account/pages/ProfilePage';
import { FinancePage } from '@/features/account/pages/FinancePage';
import { CheckoutPage } from '@/features/checkout/pages/CheckoutPage';

export const Router: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

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

      {/* Protected Routes */}
      {
        isAuthenticated ? (
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/products" element={<ItemsPage />} />
            <Route path="/movements" element={<MovementsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/categories" element={<CategoriesPage />} />

            {/* Checkout/Plans Routes */}
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/plans" element={<Navigate to="/checkout" replace />} />

            {/* Account routes */}
            <Route path="/account" element={<AccountLayout />}>
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="finance" element={<FinancePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )
      }
    </Routes>
  );
}
