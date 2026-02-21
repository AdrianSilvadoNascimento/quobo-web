import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customer_service } from '../services/customer.service';
import type { CustomerModel, CustomerType } from '../types/customer.model';

/**
 * Hook para buscar customers com paginação
 */
export const useCustomers = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['customers', page, limit],
    queryFn: () => customer_service.getPaginatedCustomers(page, limit),
  });
};

/**
 * Hook para buscar um customer específico
 */
export const useCustomer = (customerId: string) => {
  return useQuery({
    queryKey: ['customers', customerId],
    queryFn: () => customer_service.getCustomerById(customerId),
    enabled: !!customerId,
  });
};

/**
 * Hook para buscar customers por termo
 */
export const useSearchCustomers = (searchTerm: string, type: CustomerType, limit: number = 50) => {
  return useQuery({
    queryKey: ['customers', 'search', searchTerm, type],
    queryFn: () => customer_service.searchCustomers(searchTerm, type, limit),
    enabled: searchTerm.length > 0,
  });
};

/**
 * Hooks de mutation para customers
 */
export const useCustomerMutations = (accountId: string) => {
  const queryClient = useQueryClient();

  const createCustomer = useMutation({
    mutationFn: (data: CustomerModel) => customer_service.createCustomer(accountId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const updateCustomer = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CustomerModel> }) =>
      customer_service.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const deleteCustomer = useMutation({
    mutationFn: (id: string) => customer_service.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  return {
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
};
