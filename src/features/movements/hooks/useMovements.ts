import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movement_service, type CreateMovementData, type MovementFilters } from '../services/movement.service';

/**
 * Hook para buscar movimentações com paginação
 */
export const useMovements = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['movements', page, limit],
    queryFn: () => movement_service.getMovements(page, limit),
  });
};

/**
 * Hook para buscar movimentações com filtros
 */
export const useSearchMovements = (filters: MovementFilters, limit: number = 50) => {
  return useQuery({
    queryKey: ['movements', 'search', filters],
    queryFn: () => movement_service.searchMovements(filters, limit),
    enabled: Object.keys(filters).length > 0,
  });
};

/**
 * Hook para buscar histórico de movimentações de um item
 */
export const useItemMovementHistory = (itemId: string, from?: string, to?: string) => {
  return useQuery({
    queryKey: ['movements', 'history', itemId, from, to],
    queryFn: () => movement_service.getItemHistory(itemId, from, to),
    enabled: !!itemId,
  });
};

/**
 * Hook para estatísticas de movimentações
 */
export const useMovementStatistics = (from?: string, to?: string) => {
  return useQuery({
    queryKey: ['movements', 'statistics', from, to],
    queryFn: () => movement_service.getStatistics(from, to),
  });
};

/**
 * Hook para itens mais movimentados
 */
export const useTopMovedItems = (limit: number = 10, from?: string, to?: string) => {
  return useQuery({
    queryKey: ['movements', 'top-items', limit, from, to],
    queryFn: () => movement_service.getTopMovedItems(limit, from, to),
  });
};

/**
 * Hooks de mutation para movimentações
 */
export const useMovementMutations = () => {
  const queryClient = useQueryClient();

  const createMovement = useMutation({
    mutationFn: (data: CreateMovementData) => movement_service.createMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['items'] }); // Atualiza estoque
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Atualiza dashboard
    },
  });

  return {
    createMovement,
  };
};
