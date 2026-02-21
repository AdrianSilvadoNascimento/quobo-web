import { server } from '../../../services/api';
import type { LoginResponseEntity } from '@/features/account/types/login_response.model';

export class AuthService {
  accessToken: string | null = null;
  isRefreshing: boolean = false;
  refreshQueue: ((token?: string) => void)[] = [];
  private onDelinquencyCallback: (() => void) | null = null;
  private delinquencyDetected: boolean = false;

  constructor() { }

  /**
   * Check if user has an active access token
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  processQueue(token?: string) {
    this.refreshQueue.forEach(queue => queue(token));
    this.refreshQueue = [];
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  /**
   * Register a callback to be called when a 403 delinquency is detected
   */
  onDelinquency(callback: (() => void) | null) {
    this.onDelinquencyCallback = callback;
  }

  /**
   * Trigger the delinquency callback (called from interceptor)
   * Only fires once to prevent infinite loops
   */
  triggerDelinquency() {
    if (this.delinquencyDetected) return;
    this.delinquencyDetected = true;
    this.onDelinquencyCallback?.();
  }

  /**
   * Reset delinquency flag (called when subscription status is resolved)
   */
  resetDelinquency() {
    this.delinquencyDetected = false;
  }

  async login(params: { email: string; password: string; remember?: boolean }) {
    try {
      const { email, password, remember } = params;
      const { data } = await server.api.post<LoginResponseEntity>(
        '/auth/login',
        {
          email,
          password,
          remember,
          platform: 'web' // Explicitly set platform for web client
        },
        { withCredentials: true }
      );
      return data;
    } catch (error) {
      throw error;
    }
  }

  async loginWithGoogle(idToken: string, displayName?: string, photoURL?: string) {
    try {
      const { data } = await server.api.post<LoginResponseEntity>(
        '/auth/google',
        {
          idToken,
          displayName,
          photoURL
        },
        { withCredentials: true }
      );
      return data;
    } catch (error) {
      throw error;
    }
  }

  async register(params: any) {
    try {
      const { data } = await server.api.post('/auth/register', params);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await server.api.post('/auth/logout', {}, { withCredentials: true });
      this.setAccessToken(null);
    } catch (error) {
      console.error('Logout failed', error);
      this.setAccessToken(null);
    }
  }

  async forgotPassword(email: string) {
    try {
      const { data } = await server.api.post('/auth/forgot-password', { email });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async resendToken(email: string) {
    try {
      const { data } = await server.api.post('/auth/resend-token', { email });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async resendVerificationEmail(email: string) {
    try {
      const { data } = await server.api.post('/auth/resend-verification-email', { email });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(params: { email: string; token: string; password: string; passwordConfirmation: string }) {
    try {
      const args = {
        email: params.email,
        code: params.token,
        newPassword: params.password,
        confirmPassword: params.passwordConfirmation
      };
      const { data } = await server.api.post('/auth/reset-password', args);
      debugger
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Restaura a sessão ao inicializar a aplicação
   * Usa o refresh_token do cookie para obter um novo access_token
   */
  async restoreSession() {
    try {
      const { data } = await server.api.post<LoginResponseEntity>(
        '/auth/refresh',
        {},
        { withCredentials: true }
      );
      return data;
    } catch (error) {
      console.error('Session restoration failed', error);
      throw error;
    }
  }

  /**
   * Renova o access_token quando ele expira (chamado pelo interceptor)
   */
  async refreshTokenRequest() {
    try {
      const { data } = await server.api.post<LoginResponseEntity>(
        '/auth/refresh',
        {},
        { withCredentials: true }
      );
      return data;
    } catch (error) {
      throw error;
    }
  }
}

export const authService = new AuthService();

server.api.interceptors.request.use(
  async config => {
    if (authService.accessToken) {
      config.headers.Authorization = `${server.tokenPrefix} ${authService.accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

server.api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;

    if (original.url?.includes('/auth/refresh')) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (authService.isRefreshing) {
        return new Promise(resolve => {
          authService.refreshQueue.push((token) => {
            if (token) {
              original.headers.Authorization = `${server.tokenPrefix} ${token}`;
              resolve(server.api(original));
            } else {
              resolve(Promise.reject(err));
            }
          });
        });
      }

      authService.isRefreshing = true;

      try {
        const data = await authService.refreshTokenRequest();
        const { token } = data!;


        authService.setAccessToken(token);
        authService.processQueue(token);

        original.headers.Authorization = `${server.tokenPrefix} ${token}`;
        return server.api(original);
      } catch (error) {
        authService.processQueue(undefined);
        authService.setAccessToken(null);

        localStorage.clear();
        window.location.href = '/login';

        return Promise.reject(error);
      } finally {
        authService.isRefreshing = false;
      }
    }

    if (err.response?.status === 403 && !original._retry403) {
      original._retry403 = true;
      // Delinquency detected — trigger subscription status refresh
      authService.triggerDelinquency();
      return Promise.reject(err);
    }

    return Promise.reject(err);
  }
);
