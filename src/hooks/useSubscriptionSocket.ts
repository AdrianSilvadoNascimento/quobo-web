import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { authService } from '../features/auth/services/auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface UseSubscriptionSocketReturn {
  connected: boolean;
  lastUpdate: Date | null;
}

export const useSubscriptionSocket = (accountId: string | undefined): UseSubscriptionSocketReturn => {
  const [connected, setConnected] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accountId) return;

    const token = authService.accessToken;
    if (!token) return;

    const socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Subscription Socket connected');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Subscription Socket disconnected');
      setConnected(false);
    });

    socket.on('subscription_canceled', (data) => {
      console.log('🔔 Subscription canceled event received:', data);
      setLastUpdate(new Date());
    });

    socket.on('subscriptionUpdated', (data) => {
      console.log('🔔 Subscription updated event received:', data);
      setLastUpdate(new Date());
    });

    return () => {
      socket.disconnect();
    };
  }, [accountId]);

  return { connected, lastUpdate };
};
