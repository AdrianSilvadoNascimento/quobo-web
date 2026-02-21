import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ClipboardCheck, X, SlidersHorizontal } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { audit_service } from '../services/audit.service';
import { InfiniteScrollList } from '../components/infiniteScroll';
import { Button } from '@/components/ui';

export const AuditsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce search query to avoid too many requests
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['audits', 'infinite', debouncedSearch],
    queryFn: async ({ pageParam = 0 }) => {
      return audit_service.getAudits(pageParam, 20, debouncedSearch);
    },
    getNextPageParam: (lastPage, _allPages) => {
      if (lastPage.next) {
        return _allPages.length;
      }
      return undefined;
    },
    initialPageParam: 0,
  });

  // Combine all pages into a single array
  const audits = useMemo(() => {
    return data?.pages.flatMap(page => page.data) ?? [];
  }, [data]);

  const loading = isFetching && !isFetchingNextPage;
  const hasMore = hasNextPage ?? false;

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    loadMore();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-slate-400" />
            <h1 className="text-2xl font-bold text-slate-800">Auditorias</h1>
          </div>
          <p className="text-slate-500 text-sm">Controle e contagem de estoque para garantir a acuracidade.</p>
        </div>
        <Button
          variant='primary'
          size='sm'
          icon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/audits/new')}
        >
          Nova Auditoria
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 cursor-pointer"
            />
            <input
              type="text"
              placeholder="Buscar por código, ID ou responsável..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            {searchQuery ? (
              <button
                onClick={handleClearSearch}
                className="cursor-pointer absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div className="absolute right-3 top-2.5 text-slate-400 cursor-pointer">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* List */}
          <InfiniteScrollList
            audits={audits}
            hasMore={hasMore}
            loading={loading}
            loadMore={loadMore}
          />
        </div>
      </div>
    </div>
  );
};
