import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { server } from '../services/api';
import { authService } from '../features/auth/services/auth.service';

export interface DashboardData {
  products: number;
  lowStock: number;
  totalProducts: number;
  productsGrowth?: number;
  enteredsGrowth?: number;
  exitsGrowth?: number;
  lowStockStatus?: string;
  weeklyMovement?: WeeklyMovementData[];
  weeklySummary?: WeeklySummaryData;
  lowStockProducts?: LowStockProduct[];
  recentActivities?: RecentActivity[];
  totalStockValue?: number;
  topMovedItems?: TopMovedItem[];
  sevenDayMovements?: number;
}

export interface WeeklyMovementData {
  day: string;
  dayLabel: string;
  entries: number;
  exits: number;
}

export interface WeeklySummaryData {
  sales: number;
  productsSold: number;
  newProducts: number;
  activeClients: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  category: string;
  currentQuantity: number;
  minQuantity: number;
  status: 'low' | 'out';
}

export interface RecentActivity {
  id: string;
  type: string;
  productName: string;
  description: string;
  timestamp: string;
  user: string;
}

export interface TopMovedItem {
  id: string;
  name: string;
  barcode?: string;
  product_image?: string;
  totalMovements: number;
  movements: {
    entries: number;
    exits: number;
  };
}

interface UseWebSocketDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  connected: boolean;
  refetch: () => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useWebSocketDashboard = (accountId: string): UseWebSocketDashboardReturn => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);
  const hasFetchedRef = useRef(false);

  // Connect to WebSocket and fetch data
  useEffect(() => {
    console.log('🔄 useEffect executado, accountId:', accountId);

    if (!accountId) {
      console.log('⚠️ useEffect: accountId vazio, parando loading');
      setLoading(false);
      setError('Conta não identificada');
      return;
    }

    // Get auth token from authService (stored in memory)
    const token = authService.accessToken;

    if (!token) {
      console.log('⚠️ useEffect: Token não encontrado no authService');
      setError('Token de autenticação não encontrado');
      setLoading(false);
      return;
    }

    // Fetch dashboard data via HTTP
    const fetchDashboard = async () => {
      if (hasFetchedRef.current) return;

      try {
        setLoading(true);
        hasFetchedRef.current = true;
        // Usar o endpoint do domínio dashboard (sem parametro ID)
        const response = await server.api.get('/dashboard');
        setData(response.data);
        setError(null);
      } catch (err: any) {
        console.error('❌ fetchDashboard: Erro ao buscar dados:', err);
        setError(err.response?.data?.message || 'Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false)
      }
    };

    // Create socket connection (refresh token is in HTTP-only cookie, sent automatically)
    const socket = io(API_URL, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      withCredentials: true // Important: send cookies
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on('connected', (payload) => {
      console.log('✅ WebSocket conectado:', payload);
      setConnected(true);
      setError(null);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Erro de conexão WebSocket:', err.message);
      setConnected(false);
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket desconectado');
      setConnected(false);
    });

    // Listen for dashboard updates
    socket.on('refreshDashboard', (freshDashboard: DashboardData) => {
      console.log('🔄 Dashboard atualizado via WebSocket');
      setData(freshDashboard);
      setLoading(false);
    });

    // Fetch initial data
    console.log('🔄 useEffect: Chamando fetchDashboard');
    fetchDashboard();

    // Cleanup on unmount
    return () => {
      console.log('🔌 Fechando conexão WebSocket');
      socket.disconnect();
      hasFetchedRef.current = false;
    };
  }, [accountId]);

  // Refetch function for manual refresh
  const refetch = async () => {
    if (!accountId) {
      console.log('⚠️ refetch: accountId vazio');
      return;
    }

    console.log('🔄 refetch: Iniciando refetch para accountId:', accountId);
    try {
      setLoading(true);
      const response = await server.api.get('/dashboard');
      console.log('✅ refetch: Dados recebidos:', response.data);
      setData(response.data);
      setError(null);
    } catch (err: any) {
      console.error('❌ refetch: Erro ao buscar dados:', err);
      setError(err.response?.data?.message || 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
      console.log('✅ refetch: Loading finalizado');
    }
  };

  return {
    data,
    loading,
    error,
    connected,
    refetch
  };
};
