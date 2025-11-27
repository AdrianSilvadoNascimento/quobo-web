import axios from 'axios';
import { server } from '../../../services/api';

import type { LoginResponseEntity } from '@/features/account/types/login_response.model';

export class AuthService {
  // Access token stored in memory only
  accessToken: string | null = null;

  // Flag to prevent multiple simultaneous refresh requests
  isRefreshing: boolean = false;

  // Queue of pending requests waiting for token refresh
  refreshQueue: ((token?: string) => void)[] = [];

  constructor() {
  }

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

  async login(params: { email: string; password: string; remember?: boolean }) {
    try {
      const { email, password, remember } = params;
      const { data } = await server.api.post<LoginResponseEntity>('/auth/login', { email, password, remember });
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
      await server.api.post('/auth/logout');
      this.setAccessToken(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  }

  async refreshTokenRequest() {
    const { data } = await axios.post<LoginResponseEntity>(`${server.baseURL}/auth/refresh`, {}, { withCredentials: true });
    return data;
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
        const { token } = data;

        authService.setAccessToken(token);

        authService.processQueue(token);

        original.headers.Authorization = `${server.tokenPrefix} ${token}`;
        return server.api(original);
      } catch (error) {
        authService.processQueue(undefined);
        authService.setAccessToken(null);
        return Promise.reject(error);
      } finally {
        authService.isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);
