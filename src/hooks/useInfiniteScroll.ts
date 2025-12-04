import { useAuth } from '@/contexts/AuthContext';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollProps<T> {
  fetchFunction: (page: number, limit: number) => Promise<{
    data: T[];
    next: string,
    total: number;
  }>;
  limit?: number;
}

export function useInfiniteScroll<T extends { id: string }>({
  fetchFunction,
  limit = 20,
}: UseInfiniteScrollProps<T>) {
  const { isAuthenticated } = useAuth();

  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadingRef = useRef(false);

  const loadData = useCallback(
    async (pageNumber: number, isRefresh = false) => {
      if (!isAuthenticated) return;

      if (loadingRef.current && !isRefresh) return;

      try {
        loadingRef.current = true;
        isRefresh ? setRefreshing(true) : setLoading(true);
        setError(null);

        const result = await fetchFunction(pageNumber, limit);

        setData((prevData) => {
          if (isRefresh) return result.data;

          const existingIds = new Set(prevData.map(item => item.id))
          const newItems = result.data.filter(item => !existingIds.has(item.id));

          return [...prevData, ...newItems];
        })

        setHasMore(result.data.length >= limit && !!result.next);
        setPage(pageNumber);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados');
        console.error('Erro no infinite scroll:', err);
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchFunction, limit, isAuthenticated]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadData(page + 1);
    }
  }, [page, loading, hasMore, loadData]);

  const refresh = useCallback(() => {
    setData([]);
    setPage(0);
    setHasMore(true);
    loadData(0, true);
  }, [loadData]);

  useEffect(() => {
    loadData(0);
  }, [loadData]);

  return {
    data,
    loading,
    refreshing,
    hasMore,
    error,
    loadMore,
    refresh,
  };
}