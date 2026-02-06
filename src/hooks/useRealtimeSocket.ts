import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../features/auth/services/auth.service';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ChangeEvent<T = any> {
  action: 'created' | 'updated' | 'deleted';
  data: T;
}

/**
 * Hook centralizado para WebSocket com integração ao React Query.
 * Conecta automaticamente quando o usuário está autenticado e invalida
 * o cache React Query quando eventos de mudança são recebidos.
 */
export const useRealtimeSocket = () => {
  const queryClient = useQueryClient();
  const { account, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Só conectar se estiver autenticado e tiver uma conta
    if (!isAuthenticated || !account?.id) return;

    const token = authService.accessToken;
    if (!token) return;

    console.log('🔌 useRealtimeSocket: Conectando ao WebSocket...');

    const socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socketRef.current = socket;

    // Handlers de conexão
    socket.on('connected', (payload) => {
      console.log('✅ useRealtimeSocket: Conectado ao WebSocket', payload);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ useRealtimeSocket: Erro de conexão', err.message);
    });

    socket.on('disconnect', () => {
      console.log('🔌 useRealtimeSocket: Desconectado');
    });

    // === EVENT HANDLERS - Atualização do cache React Query ===

    // Items
    socket.on('items:change', (event: ChangeEvent) => {
      console.log('📦 items:change recebido:', event);
      // Invalida todas as queries relacionadas a items
      queryClient.invalidateQueries({ queryKey: ['items'] });
      // Também invalida dashboard pois pode mostrar produtos
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    // Categories
    socket.on('categories:change', (event: ChangeEvent) => {
      console.log('🏷️ categories:change recebido:', event);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    });

    // Movements
    socket.on('movements:change', (event: ChangeEvent) => {
      console.log('🔄 movements:change recebido:', event);
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      // Dashboard exibe dados de movimentação
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    // Customers
    socket.on('customers:change', (event: ChangeEvent) => {
      console.log('👥 customers:change recebido:', event);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    });

    // Audits
    socket.on('audits:change', (event: ChangeEvent) => {
      console.log('📋 audits:change recebido:', event);
      queryClient.invalidateQueries({ queryKey: ['audits'] });
    });

    // Cleanup na desmontagem ou quando dependências mudam
    return () => {
      console.log('🔌 useRealtimeSocket: Fechando conexão WebSocket');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, account?.id, queryClient]);

  return {
    socket: socketRef.current,
  };
};
