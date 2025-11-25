import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { MovementsPage } from '../features/movements/pages/MovementsPage';
import { CustomersPage } from '../features/customers/pages/CustomersPage';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ItensPage } from '../features/itens/pages/ItensPage';
import { CategoriesPage } from '../features/categories/pages/CategoriesPage';

export const Router: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />

      {/* Protected Routes */}
      {isAuthenticated ? (
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ItensPage />} />
          <Route path="/movements" element={<MovementsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}
