import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { category_service } from '../services/category.service';
import type { CategoryModel } from '../types/category.model';

/**
 * Hook para buscar categorias com paginação
 */
export const useCategories = (page: number, limit: number, search?: string) => {
  return useQuery({
    queryKey: ['categories', page, limit, search],
    queryFn: () => category_service.getPaginatedCategories(page, limit, search),
  });
};

/**
 * Hook para buscar todas as categorias (sem paginação)
 */
export const useAllCategories = () => {
  return useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => category_service.getCategories(),
  });
};

/**
 * Hooks de mutation para categorias
 */
export const useCategoryMutations = () => {
  const queryClient = useQueryClient();

  const createCategory = useMutation({
    mutationFn: (data: CategoryModel) => category_service.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const updateCategory = useMutation({
    mutationFn: (data: CategoryModel) => category_service.updateCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => category_service.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
