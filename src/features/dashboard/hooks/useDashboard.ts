import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { server } from '../../../services/api';
import { authService } from '../../auth/services/auth.service';

export type DashboardPeriod = '7d' | '30d' | '1m';

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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const fetchDashboard = async (period: DashboardPeriod): Promise<DashboardData> => {
  const response = await server.api.get('/dashboard', {
    params: { period },
  });
  return response.data;
};

/**
 * Hook para dados do dashboard usando React Query + WebSocket para updates realtime.
 *
 * - staleTime: 5 minutos (evita re-fetch desnecessário ao navegar/recarregar)
 * - WebSocket: escuta 'refreshDashboard' para atualizar cache em tempo real
 * - Filtro por período: '7d', '30d' ou '1m'
 */
export const useDashboard = (accountId: string, period: DashboardPeriod = '7d') => {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // React Query para dados do dashboard
  const {
    data,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery<DashboardData>({
    queryKey: ['dashboard', period],
    queryFn: () => fetchDashboard(period),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // manter no garbage collector por 10 min
    enabled: !!accountId,
    refetchOnWindowFocus: false, // não re-fetchar ao focar a janela
  });

  // WebSocket para updates realtime
  useEffect(() => {
    if (!accountId) return;

    const token = authService.accessToken;
    if (!token) return;

    const socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connected', () => {
      setConnected(true);
    });

    socket.on('connect_error', () => {
      setConnected(false);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Quando o backend envia dados frescos do dashboard via WebSocket,
    // atualizar diretamente o cache do React Query (sem refetch HTTP)
    socket.on('refreshDashboard', (freshDashboard: DashboardData) => {
      console.log('🔄 Dashboard atualizado via WebSocket');
      queryClient.setQueryData(['dashboard', period], freshDashboard);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accountId, period, queryClient]);

  const error = queryError ? (queryError as Error).message : null;

  return {
    data: data || null,
    loading,
    error,
    connected,
    refetch,
  };
};
