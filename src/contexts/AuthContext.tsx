import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { authService } from '../features/auth/services/auth.service';
import type { UserModel } from '@/features/account/types/user.model';
import type { AccountModel, SubscriptionModel } from '@/features/account/types/account.model';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (args: { email: string; password: string; remember?: boolean }) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  user: UserModel | null;
  account: AccountModel | null;
  subscription: SubscriptionModel | null;
  expirationDays: number | null;
  isTrial: boolean;
  isAssinant: boolean;
  expirationDate: Date | null;
  isSubscriptionExpired: boolean;
  updateSubscriptionStatus: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Module-level variable to prevent double execution in StrictMode
let restorationPromise: Promise<any> | null = null;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserModel | null>(null);
  const [account, setAccount] = useState<AccountModel | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionModel | null>(null);
  const [expirationDays, setExpirationDays] = useState<number | null>(null);
  const [isTrial, setIsTrial] = useState<boolean>(false);
  const [isAssinant, setIsAssinant] = useState<boolean>(false);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);

  const isRefreshing = useRef(false);

  const updateUserData = (data: any) => {
    setUser(data.account_user);
    setAccount(data.account);
    setSubscription(data.subscription);
    setExpirationDays(data.expiration_days);
    setIsTrial(data.is_trial);
    setIsAssinant(data.is_assinant);
    setExpirationDate(data.expiration_date ? new Date(data.expiration_date) : null);
    setIsAuthenticated(true);

    localStorage.setItem('session_active', 'true');
    localStorage.setItem('user_data', JSON.stringify(data.account_user));
    localStorage.setItem('account_data', JSON.stringify(data.account));
    localStorage.setItem('subscription_data', JSON.stringify(data.subscription));
    localStorage.setItem('expiration_days', data.expiration_days?.toString() || '');
    localStorage.setItem('is_trial', data.is_trial.toString());
    localStorage.setItem('is_assinant', data.is_assinant.toString());
    localStorage.setItem('expiration_date', data.expiration_date?.toString() || '');
  };

  const clearUserData = () => {
    setUser(null);
    setAccount(null);
    setSubscription(null);
    setExpirationDays(null);
    setIsTrial(false);
    setIsAssinant(false);
    setExpirationDate(null);
    setIsAuthenticated(false);
    authService.setAccessToken(null);
    localStorage.clear();
  };

  const initializeAuth = async () => {
    const hasSession = localStorage.getItem('session_active') === 'true';

    if (!hasSession) {
      setIsLoading(false);
      return;
    }

    try {
      if (!restorationPromise) {
        restorationPromise = authService.restoreSession();
      }

      const data = await restorationPromise;

      if (data?.token) {
        authService.setAccessToken(data.token);
        updateUserData(data);
      } else {
        clearUserData();
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      clearUserData();

      restorationPromise = null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (args: { email: string; password: string; remember?: boolean }) => {
    try {
      setIsLoading(true);
      const data = await authService.login(args);

      if (!data?.token) {
        throw new Error('Invalid response from server');
      }

      authService.setAccessToken(data.token);

      updateUserData(data);
    } catch (error) {
      console.error("Login failed", error);
      clearUserData();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      clearUserData();
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await authService.forgotPassword(email);
    } catch (error) {
      console.error("Forgot password failed", error);
    }
  };

  const isSubscriptionExpired = (expirationDays !== null && expirationDays <= 0 && !isAssinant);
  const isAdmin = user?.type === 'OWNER' || user?.type === 'ADMIN';

  const updateSubscriptionStatus = async () => {
    if (isRefreshing.current) return;

    try {
      isRefreshing.current = true;
      const data = await authService.refreshTokenRequest();

      if (data?.token) {
        authService.setAccessToken(data.token);
        updateUserData(data);
      }
    } catch (error) {
      console.error('Failed to update subscription status:', error);
    } finally {
      isRefreshing.current = false;
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      login,
      logout,
      forgotPassword,
      user,
      account,
      subscription,
      expirationDays,
      isTrial,
      isAssinant,
      expirationDate,
      isSubscriptionExpired,
      updateSubscriptionStatus,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
