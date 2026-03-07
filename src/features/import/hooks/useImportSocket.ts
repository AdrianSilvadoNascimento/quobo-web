import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { server } from '../../../services/api';

const POLL_INTERVAL_MS = 500;   // poll every 500ms while job is active
const POLL_MAX_DURATION = 300000; // stop after 5 minutes max

export type ImportJobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type ImportType = 'full' | 'items' | 'categories' | 'customers' | 'suppliers';

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

export interface ImportProgressEvent {
  jobId: string;
  type: ImportType;
  processed: number;
  total: number;
  percentage: number;
  currentEntity: string;
  skipped: number;
  errors: ImportError[];
  status: ImportJobStatus;
  timestamp: string;
}

export interface ImportCompletedEvent {
  jobId: string;
  type: ImportType;
  success: number;
  failed: number;
  skipped: number;
  errors: ImportError[];
  duration: number;
  status: ImportJobStatus;
  timestamp: string;
}

export interface ImportQueuedEvent {
  jobId: string;
  type: ImportType;
  total: number;
  status: ImportJobStatus;
  timestamp: string;
}

export interface ImportFailedEvent {
  jobId: string;
  error: string;
  status: ImportJobStatus;
  timestamp: string;
}

interface UseImportSocketState {
  currentJob: ImportProgressEvent | null;
  completedJobs: ImportCompletedEvent[];
  isRestoringJob: boolean;
}

/**
 * Hook para acompanhar importação.
 * Usa polling em GET /import/active para acompanhar em tempo real.
 * Restaura jobs ativos ao montar.
 */
export const useImportSocket = () => {
  const { isAuthenticated } = useAuth();
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStartRef = useRef<number>(0);

  const [state, setState] = useState<UseImportSocketState>({
    currentJob: null,
    completedJobs: [],
    isRestoringJob: true,
  });

  // Callbacks para eventos específicos
  const onCompletedRef = useRef<((event: ImportCompletedEvent) => void) | null>(null);
  const onFailedRef = useRef<((event: ImportFailedEvent) => void) | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  /** Fetch active job from the server and update state */
  const fetchActiveJob = useCallback(async (): Promise<ImportProgressEvent | null> => {
    try {
      const response = await server.api.get('/import/active');
      const { job } = response.data;
      if (!job) return null;

      return {
        jobId: job.jobId,
        type: job.type,
        processed: job.processed || 0,
        total: job.total,
        percentage: job.total > 0 ? Math.round((job.processed / job.total) * 100) : 0,
        currentEntity: '',
        skipped: job.skipped || 0,
        errors: job.errors || [],
        status: job.status as ImportJobStatus,
        timestamp: job.createdAt,
      };
    } catch {
      return null;
    }
  }, []);

  /** Start polling at intervals */
  const startPolling = useCallback(() => {
    stopPolling();
    pollStartRef.current = Date.now();

    pollTimerRef.current = setInterval(async () => {
      // Safety timeout
      if (Date.now() - pollStartRef.current > POLL_MAX_DURATION) {
        stopPolling();
        return;
      }

      const job = await fetchActiveJob();
      if (!job) {
        // Job might have been dismissed or cleared
        stopPolling();
        return;
      }

      setState(prev => ({
        ...prev,
        currentJob: job,
      }));

      // If the job is completed or failed, stop polling
      if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
        stopPolling();

        if (job.status === 'completed') {
          const completedEvent: ImportCompletedEvent = {
            jobId: job.jobId,
            type: job.type,
            success: job.processed - (job.skipped || 0),
            failed: 0,
            skipped: job.skipped || 0,
            errors: job.errors || [],
            duration: 0,
            status: 'completed',
            timestamp: job.timestamp,
          };
          setState(prev => ({
            ...prev,
            completedJobs: [completedEvent, ...prev.completedJobs].slice(0, 10),
          }));
          onCompletedRef.current?.(completedEvent);
        } else if (job.status === 'failed') {
          onFailedRef.current?.({
            jobId: job.jobId,
            error: job.errors?.[0]?.message || 'Falha na importação',
            status: 'failed',
            timestamp: job.timestamp,
          });
        }
      }
    }, POLL_INTERVAL_MS);
  }, [fetchActiveJob, stopPolling]);

  // Restore active job on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    const restoreActiveJob = async () => {
      const job = await fetchActiveJob();

      if (job) {
        setState(prev => ({
          ...prev,
          currentJob: job,
          isRestoringJob: false,
        }));

        // If job is still active, start polling
        if (job.status === 'queued' || job.status === 'processing') {
          startPolling();
        }
      } else {
        setState(prev => ({ ...prev, isRestoringJob: false }));
      }
    };

    restoreActiveJob();

    return () => stopPolling();
  }, [isAuthenticated, fetchActiveJob, startPolling, stopPolling]);

  // Callbacks
  const onCompleted = useCallback((callback: (event: ImportCompletedEvent) => void) => {
    onCompletedRef.current = callback;
  }, []);

  const onFailed = useCallback((callback: (event: ImportFailedEvent) => void) => {
    onFailedRef.current = callback;
  }, []);

  const clearCurrentJob = useCallback(() => {
    setState(prev => ({ ...prev, currentJob: null }));
  }, []);

  const dismissActiveJob = useCallback(async () => {
    stopPolling();
    try {
      await server.api.post('/import/dismiss');
    } catch { /* ignore */ }
    setState(prev => ({ ...prev, currentJob: null }));
  }, [stopPolling]);

  /** Set currentJob immediately from HTTP response and start polling */
  const startJob = useCallback((jobId: string, type: ImportType, total: number) => {
    setState(prev => ({
      ...prev,
      currentJob: {
        jobId,
        type,
        processed: 0,
        total,
        percentage: 0,
        currentEntity: '',
        skipped: 0,
        errors: [],
        status: 'queued',
        timestamp: new Date().toISOString(),
      },
    }));
    // Begin polling for updates
    startPolling();
  }, [startPolling]);

  return {
    ...state,
    onCompleted,
    onFailed,
    clearCurrentJob,
    dismissActiveJob,
    startJob,
  };
};
