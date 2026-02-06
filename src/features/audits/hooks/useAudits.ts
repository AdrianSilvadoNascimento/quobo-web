import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { audit_service } from '../services/audit.service';
import type { CreateAuditPayload } from '../types/audit.model';

/**
 * Hook para buscar auditorias com paginação
 */
export const useAudits = (page: number, limit: number, search?: string) => {
  return useQuery({
    queryKey: ['audits', page, limit, search],
    queryFn: () => audit_service.getAudits(page, limit, search),
  });
};

/**
 * Hook para buscar uma auditoria específica
 */
export const useAudit = (auditId: string) => {
  return useQuery({
    queryKey: ['audits', auditId],
    queryFn: () => audit_service.getAudit(auditId),
    enabled: !!auditId,
  });
};

/**
 * Hook para buscar deep link de uma auditoria
 */
export const useAuditDeepLink = (auditId: string) => {
  return useQuery({
    queryKey: ['audits', auditId, 'deep-link'],
    queryFn: () => audit_service.getAuditDeepLink(auditId),
    enabled: !!auditId,
  });
};

/**
 * Hooks de mutation para auditorias
 */
export const useAuditMutations = () => {
  const queryClient = useQueryClient();

  const createAudit = useMutation({
    mutationFn: (data: CreateAuditPayload) => audit_service.createAudit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
    },
  });

  const pauseAudit = useMutation({
    mutationFn: (id: string) => audit_service.pauseAudit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
    },
  });

  const resumeAudit = useMutation({
    mutationFn: (id: string) => audit_service.resumeAudit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
    },
  });

  return {
    createAudit,
    pauseAudit,
    resumeAudit,
  };
};
