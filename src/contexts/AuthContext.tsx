import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/auth.service';
import type { UserModel } from '@/features/account/types/user.model';
import type { AccountModel } from '@/features/account/types/account.model';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (args: { email: string; password: string; remember?: boolean }) => Promise<void>;
  logout: () => void;
  user: UserModel | null;
  account: AccountModel | null;
  expirationDays: number | null;
  isTrial: boolean;
  isAssinant: boolean;
  expirationDate: Date | null;
  isSubscriptionExpired: boolean;
  updateSubscriptionStatus: (expirationDays: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('logged_in');
  });

  const [isLoading, setIsLoading] = useState(false);

  const [user, setUser] = useState<UserModel | null>(() => {
    const cached = localStorage.getItem('user_data');
    return cached ? JSON.parse(cached) : null;
  });

  const [account, setAccount] = useState<AccountModel | null>(() => {
    const cached = localStorage.getItem('account_data');
    return cached ? JSON.parse(cached) : null;
  });

  const [expirationDays, setExpirationDays] = useState<number | null>(() => {
    const cached = localStorage.getItem('expiration_days');
    return cached ? parseInt(cached) : null;
  });

  const [isTrial, setIsTrial] = useState<boolean>(() => {
    const cached = localStorage.getItem('is_trial');
    return cached === 'true';
  });

  const [isAssinant, setIsAssinant] = useState<boolean>(() => {
    const cached = localStorage.getItem('is_assinant');
    return cached === 'true';
  });

  const [expirationDate, setExpirationDate] = useState<Date | null>(() => {
    const cached = localStorage.getItem('expiration_date');
    return cached ? new Date(cached) : null;
  });

  const refreshUser = async () => {
    try {
      const data = await authService.refreshTokenRequest();

      authService.setAccessToken(data.token);

      setUser(data.account_user);
      setAccount(data.account);
      setExpirationDays(data.expiration_days);
      setIsTrial(data.is_trial);
      setIsAssinant(data.is_assinant);
      setExpirationDate(data.expiration_date ? new Date(data.expiration_date) : null);
      setIsAuthenticated(true);

      localStorage.setItem('logged_in', 'true');
      localStorage.setItem('user_data', JSON.stringify(data.account_user));
      localStorage.setItem('account_data', JSON.stringify(data.account));
      localStorage.setItem('expiration_days', data.expiration_days?.toString() || '');
      localStorage.setItem('is_trial', data.is_trial.toString());
      localStorage.setItem('is_assinant', data.is_assinant.toString());
      localStorage.setItem('expiration_date', data.expiration_date?.toString() || '');
    } catch (error) {
      setUser(null);
      setAccount(null);
      setExpirationDays(null);
      setIsTrial(false);
      setIsAssinant(false);
      setExpirationDate(null);
      setIsAuthenticated(false);

      localStorage.clear();
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (args: { email: string; password: string; remember?: boolean }) => {
    try {
      const data = await authService.login(args);

      authService.setAccessToken(data.token);

      setUser(data.account_user);
      setAccount(data.account);
      setExpirationDays(data.expiration_days);
      setIsTrial(data.is_trial);
      setIsAssinant(data.is_assinant);
      setExpirationDate(data.expiration_date ? new Date(data.expiration_date) : null);
      setIsAuthenticated(true);

      localStorage.setItem('logged_in', 'true');
      localStorage.setItem('user_data', JSON.stringify(data.account_user));
      localStorage.setItem('account_data', JSON.stringify(data.account));
      localStorage.setItem('expiration_days', data.expiration_days?.toString() || '');
      localStorage.setItem('is_trial', data.is_trial.toString());
      localStorage.setItem('is_assinant', data.is_assinant.toString());
      localStorage.setItem('expiration_date', data.expiration_date?.toString() || '');
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setAccount(null);
    setExpirationDays(null);
    setIsTrial(false);
    setIsAssinant(false);
    setExpirationDate(null);
    setIsAuthenticated(false);

    localStorage.clear();
  };

  // Computed: check if subscription is expired
  const isSubscriptionExpired = (expirationDays !== null && expirationDays <= 0 && !isAssinant);

  // Update subscription status after successful checkout
  const updateSubscriptionStatus = (newExpirationDays: number) => {
    setIsAssinant(true);
    setIsTrial(false);
    setExpirationDays(newExpirationDays);

    // Update localStorage
    localStorage.setItem('is_assinant', 'true');
    localStorage.setItem('is_trial', 'false');
    localStorage.setItem('expiration_days', newExpirationDays.toString());
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, user, account, expirationDays, isTrial, isAssinant, expirationDate, isSubscriptionExpired, updateSubscriptionStatus }}>
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
