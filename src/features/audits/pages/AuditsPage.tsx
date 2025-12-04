import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ClipboardCheck, X, SlidersHorizontal } from 'lucide-react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { audit_service } from '../services/audit.service';
import type { ItemAuditModel } from '../types/audit.model';
import { InfiniteScrollList } from '../components/infiniteScroll';

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

  const fetchAudits = useCallback((page: number, limit: number) => {
    return audit_service.getAudits(page, limit, debouncedSearch);
  }, [debouncedSearch]);

  const {
    data: audits,
    loading,
    hasMore,
    loadMore
  } = useInfiniteScroll<ItemAuditModel>({
    fetchFunction: fetchAudits,
    limit: 20
  });

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
        <button
          onClick={() => navigate('/audits/new')}
          className="btn bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Nova Auditoria
        </button>
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
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
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

        {/* List */}
        <InfiniteScrollList
          audits={audits}
          hasMore={hasMore}
          loading={loading}
          loadMore={loadMore}
        />
      </div>
    </div>
  );
};
