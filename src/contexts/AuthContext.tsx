import React, { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../features/auth/services/auth.service';
import type { UserModel } from '@/features/account/types/user.model';
import type { AccountModel, SubscriptionModel } from '@/features/account/types/account.model';
import { supabase } from '../config/supabase';
import { queryClient } from '../main';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (args: { email: string; password: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (args: { name: string; email: string; password: string; business_name?: string }) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  user: UserModel | null;
  account: AccountModel | null;
  subscription: SubscriptionModel | null;
  expirationDays: number | null;
  isTrial: boolean;
  isAssinant: boolean;
  expirationDate: Date | null;
  sessionExpiresAt: Date | null;
  isSubscriptionExpired: boolean;
  isSubscriptionSuspended: boolean;
  refreshToken: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Route memory helpers
const REDIRECT_KEY = 'quobo_redirect_after_login';

export const saveRedirectPath = (path: string) => {
  // Don't save auth-related paths
  const ignorePaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/logout'];
  if (ignorePaths.some(p => path.startsWith(p))) return;
  sessionStorage.setItem(REDIRECT_KEY, path);
};

export const popRedirectPath = (): string | null => {
  const path = sessionStorage.getItem(REDIRECT_KEY);
  sessionStorage.removeItem(REDIRECT_KEY);
  return path;
};

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
  const [sessionExpiresAt, setSessionExpiresAt] = useState<Date | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const isRefreshing = useRef(false);
  const handshakeInProgress = useRef(false);

  const updateUserData = useCallback((data: any) => {
    setUser(data.account_user);
    setAccount(data.account);
    setSubscription(data.subscription);
    setExpirationDays(data.expiration_days);
    setIsTrial(data.is_trial);
    setIsAssinant(data.is_assinant);
    setExpirationDate(data.expiration_date ? new Date(data.expiration_date) : null);

    // Parse session expiry
    if (data.session_expires_at) {
      setSessionExpiresAt(new Date(data.session_expires_at));
      localStorage.setItem('session_expires_at', data.session_expires_at);
    } else {
      setSessionExpiresAt(null);
      localStorage.removeItem('session_expires_at');
    }

    setIsAuthenticated(true);

    localStorage.setItem('session_active', 'true');
    localStorage.setItem('user_data', JSON.stringify(data.account_user));
    localStorage.setItem('account_data', JSON.stringify(data.account));
    localStorage.setItem('subscription_data', JSON.stringify(data.subscription));
    localStorage.setItem('expiration_days', data.expiration_days?.toString() || '');
    localStorage.setItem('is_trial', data.is_trial.toString());
    localStorage.setItem('is_assinant', data.is_assinant.toString());
    localStorage.setItem('expiration_date', data.expiration_date?.toString() || '');
  }, []);

  const clearUserData = useCallback(() => {
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
    queryClient.clear();
  }, []);

  /**
   * Perform handshake with backend using Supabase access token.
   * Called after any successful Supabase authentication.
   */
  const performHandshake = useCallback(async (supabaseAccessToken: string) => {
    const data = await authService.handshake(supabaseAccessToken);

    if (!data?.token) {
      throw new Error('Invalid response from backend handshake');
    }

    authService.setAccessToken(data.token);
    updateUserData(data);

    // Route memory: redirect to saved path after login
    const redirectPath = popRedirectPath();
    if (redirectPath && redirectPath !== '/login') {
      navigate(redirectPath, { replace: true });
    }
  }, [updateUserData, navigate]);

  /**
   * Initialize auth on mount — try to restore existing session
   */
  const initializeAuth = async () => {
    const hasSession = localStorage.getItem('session_active') === 'true';

    if (!hasSession) {
      setIsLoading(false);
      return;
    }

    // Attempt to restore session data from localStorage first for sticky UI
    try {
      const storedUser = localStorage.getItem('user_data');
      if (storedUser) setUser(JSON.parse(storedUser));

      const sessionExpiry = localStorage.getItem('session_expires_at');
      if (sessionExpiry) setSessionExpiresAt(new Date(sessionExpiry));
    } catch { }

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

  /**
   * Listen for Supabase auth state changes (OAuth redirect callbacks, token refresh)
   */
  useEffect(() => {
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Handle OAuth redirect callback or password recovery
        if (
          (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') &&
          session?.access_token &&
          !handshakeInProgress.current &&
          !isAuthenticated
        ) {
          handshakeInProgress.current = true;
          try {
            await performHandshake(session.access_token);
          } catch (error) {
            console.error('Handshake after auth state change failed:', error);
          } finally {
            handshakeInProgress.current = false;
          }
        }
      }
    );

    return () => {
      authSubscription.unsubscribe();
    };
  }, [performHandshake, isAuthenticated]);

  useEffect(() => {
    const handleDelinquency = () => {
      refreshToken();
    };

    authService.onDelinquency(handleDelinquency);
    return () => {
      authService.onDelinquency(null);
    };
  }, []);

  /**
   * Login with email and password via Supabase, then handshake with backend
   */
  const login = useCallback(async (args: { email: string; password: string }) => {
    try {
      setIsLoading(true);

      const { data: supaData, error } = await supabase.auth.signInWithPassword({
        email: args.email,
        password: args.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!supaData.session?.access_token) {
        throw new Error('No session returned from Supabase');
      }

      await performHandshake(supaData.session.access_token);
    } catch (error) {
      console.error("Login failed", error);
      clearUserData();
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [performHandshake, clearUserData]);

  /**
   * Login with Google via Supabase OAuth redirect
   */
  const loginWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);

      // Save current location for route memory before redirect
      if (location.pathname !== '/login' && location.pathname !== '/register') {
        saveRedirectPath(location.pathname + location.search);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Supabase will redirect the browser — the onAuthStateChange listener
      // will handle the callback and perform the handshake
    } catch (error) {
      console.error("Google Login failed", error);
      clearUserData();
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [clearUserData, location]);

  /**
   * Register with email/password via Supabase, user metadata is passed for backend to pick up
   */
  const register = useCallback(async (args: { name: string; email: string; password: string; business_name?: string }) => {
    try {
      setIsLoading(true);

      const { data: supaData, error } = await supabase.auth.signUp({
        email: args.email,
        password: args.password,
        options: {
          data: {
            name: args.name,
            business_name: args.business_name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // If email confirmation is required, the user won't have a confirmed session yet
      // supaData.user will exist but session may be null until email is confirmed
      if (supaData.session?.access_token) {
        // Email confirmation disabled — auto-confirm mode
        await performHandshake(supaData.session.access_token);
      }
      // If session is null, the user needs to confirm email first
      // The calling page should show a "check your email" message
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [performHandshake]);

  /**
   * Logout: sign out from Supabase + backend
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      clearUserData();
      setIsLoading(false);
    }
  }, [clearUserData]);

  /**
   * Forgot password via Supabase
   */
  const forgotPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Forgot password failed", error);
      throw error;
    }
  }, []);

  const isTrialExpired = (expirationDays !== null && expirationDays <= 0 && !isAssinant);
  const isSubscriptionSuspended = isAssinant && (
    subscription?.status === 'SUSPENDED' ||
    subscription?.status === 'PENDING' ||
    subscription?.status === 'EXPIRED' ||
    (subscription?.is_expired === true)
  );
  const isSubscriptionExpired = isTrialExpired || isSubscriptionSuspended;
  const isAdmin = user?.type === 'OWNER' || user?.type === 'ADMIN';

  const refreshToken = useCallback(async () => {
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
  }, [updateUserData]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      login,
      loginWithGoogle,
      register,
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
      isSubscriptionSuspended,
      refreshToken,
      isAdmin,
      sessionExpiresAt
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
