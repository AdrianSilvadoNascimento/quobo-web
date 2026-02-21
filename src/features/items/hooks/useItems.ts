import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { item_service } from '../services/items.service';
import type { ItemModel } from '../types/item.model';

/**
 * Hook para buscar items com paginação
 */
export const useItems = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['items', page, limit],
    queryFn: () => item_service.getProducts(page, limit),
  });
};

/**
 * Hook para buscar um item específico
 */
export const useItem = (itemId: string) => {
  return useQuery({
    queryKey: ['items', itemId],
    queryFn: () => item_service.getItem(itemId),
    enabled: !!itemId,
  });
};

/**
 * Hook para buscar items por termo
 */
export const useSearchItems = (searchTerm: string, limit: number = 50) => {
  return useQuery({
    queryKey: ['items', 'search', searchTerm],
    queryFn: () => item_service.searchItems(searchTerm, limit),
    enabled: searchTerm.length > 0,
  });
};

/**
 * Hooks de mutation para items
 */
export const useItemMutations = () => {
  const queryClient = useQueryClient();

  const createItem = useMutation({
    mutationFn: (data: Partial<ItemModel>) => item_service.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  const updateItem = useMutation({
    mutationFn: ({ id, data, file }: { id: string; data: Partial<ItemModel>; file?: File }) =>
      item_service.updateItem(id, data, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => item_service.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  return {
    createItem,
    updateItem,
    deleteItem,
  };
};
