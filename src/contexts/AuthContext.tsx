import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService, type User, type Account } from '../services/auth.service';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (args: { email: string; password: string; remember?: boolean }) => Promise<void>;
  logout: () => void;
  user: User | null;
  account: Account | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Optimistic initialization: if 'logged_in' flag exists, assume authenticated
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('logged_in');
  });

  // If we are optimistically authenticated, we are NOT loading initially (we show the app)
  // If we are NOT authenticated, we are not loading either (we show login)
  // But we still need to fetch the real user data in background
  const [isLoading, setIsLoading] = useState(false);

  // Initialize user and account from localStorage to prevent flickering
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('user_data');
    return cached ? JSON.parse(cached) : null;
  });

  const [account, setAccount] = useState<Account | null>(() => {
    const cached = localStorage.getItem('account_data');
    return cached ? JSON.parse(cached) : null;
  });

  const refreshUser = async () => {
    try {
      // Try to refresh token using cookie
      const data = await authService.refreshTokenRequest();

      authService.setAccessToken(data.token);

      setUser(data.account_user);
      setAccount(data.account);
      setIsAuthenticated(true);

      // Cache user data to prevent flickering on refresh
      localStorage.setItem('logged_in', 'true');
      localStorage.setItem('user_data', JSON.stringify(data.account_user));
      localStorage.setItem('account_data', JSON.stringify(data.account));
    } catch (error) {
      // If refresh fails (no cookie or invalid), we are not logged in
      setUser(null);
      setAccount(null);
      setIsAuthenticated(false);

      // Clear all cached data
      localStorage.removeItem('logged_in');
      localStorage.removeItem('user_data');
      localStorage.removeItem('account_data');
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
      setIsAuthenticated(true);

      // Cache user data
      localStorage.setItem('logged_in', 'true');
      localStorage.setItem('user_data', JSON.stringify(data.account_user));
      localStorage.setItem('account_data', JSON.stringify(data.account));
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setAccount(null);
    setIsAuthenticated(false);

    // Clear all cached data
    localStorage.removeItem('logged_in');
    localStorage.removeItem('user_data');
    localStorage.removeItem('account_data');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, user, account }}>
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
