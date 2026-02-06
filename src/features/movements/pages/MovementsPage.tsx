import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Plus, TrendingUp, Loader2, List, BarChart3, Search, X, SlidersHorizontal, Filter, ChevronDown, ArrowLeftRight } from 'lucide-react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { movement_service } from '../services/movement.service';
import type { MovementModel, MovementType } from '../types/movement.model';
import { MovementCard } from '../components/MovementCard';
import { MovementsAnalyticsTab } from '../components/MovementsAnalyticsTab';
import { NewMovementModal } from '../components/NewMovementModal';

type TabType = 'list' | 'analytics';

interface MovementTypeProp {
  value: MovementType | '';
  label: string;
}

export const MovementsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [movementType, setMovementType] = useState<MovementTypeProp>({ value: '', label: 'Todos os Tipos' });
  const [searchResults, setSearchResults] = useState<MovementModel[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearchTerm = useDebounce(searchQuery, 200);

  const movementTypes: MovementTypeProp[] = [
    { value: 'ENTRY', label: 'Entrada' },
    { value: 'OUT', label: 'Saída' },
    { value: 'ADJUST', label: 'Ajuste' },
    { value: 'TRANSFER', label: 'Transferência' },
    { value: 'SALE', label: 'Venda' },
  ];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['movements', 'infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      return movement_service.getMovements(pageParam, 40);
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
  const movements = useMemo(() => {
    return data?.pages.flatMap(page => page.data) ?? [];
  }, [data]);

  const loading = isFetching && !isFetchingNextPage;
  const hasMore = hasNextPage ?? false;

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['movements'] });
  };

  const filteredMovements = movementType.value
    ? movements.filter(m => m.move_type === movementType.value)
    : movements;

  const performSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const termLower = term.toLowerCase();
      const localResults = filteredMovements.filter(m =>
        m.item?.name.toLowerCase().includes(termLower) ||
        m.item?.barcode?.toLowerCase().includes(termLower) ||
        m.description?.toLowerCase().includes(termLower)
      );

      if (localResults.length > 0) {
        setSearchResults(localResults);
      } else {
        const filters = {
          type: movementType.value || undefined,
          search: term,
        };
        const serverResults = await movement_service.searchMovements(filters, 100);
        setSearchResults(serverResults);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    performSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, movementType]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  const handleChangeMovementType = (type: MovementTypeProp) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setMovementType(type);
    setSearchQuery('');
    setSearchResults(null);
  };

  const displayedMovements = searchResults || filteredMovements;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center flex-wrap justify-between">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-slate-400" />
            <h1 className="text-2xl font-bold text-slate-800">Movimentações</h1>
          </div>
          <p className="text-sm text-slate-500">Visualize e gerencie movimentações de estoque</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn flex items-center text-sm gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Movimentação
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('list')}
            className={`cursor-pointer flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${activeTab === 'list'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
          >
            <List className="w-4 h-4" />
            Listagem
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`cursor-pointer flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${activeTab === 'analytics'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
          >
            <BarChart3 className="w-4 h-4" />
            Análises
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'list' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex items-center gap-2 relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 cursor-pointer"
                onClick={() => inputRef.current?.focus()}
              />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar por produto, código de barras..."
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
                <div
                  className="absolute right-3 top-2.5 text-slate-400 cursor-pointer"
                  onClick={() => inputRef.current?.focus()}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="dropdown dropdown-start md:dropdown-end">
              <button
                tabIndex={0}
                className="btn btn-ghost btn-sm flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                <span className="text-slate-600">
                  {movementType.label}
                </span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </button>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-white rounded-box w-52 z-50"
              >
                <li>
                  <a onClick={() => handleChangeMovementType({ value: '', label: 'Todos os Tipos' })}>
                    Todos os Tipos
                  </a>
                </li>
                {movementTypes.map((type) => (
                  <li key={type.value}>
                    <a onClick={() => handleChangeMovementType(type)}>
                      {type.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Movements List */}
          <div className="p-4 space-y-3">
            {isSearching || loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : displayedMovements.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-lg">Nenhuma movimentação encontrada</p>
                <p className="text-slate-400 text-sm mt-1">
                  {searchQuery || movementType.value ? 'Tente ajustar os filtros' : 'Crie sua primeira movimentação'}
                </p>
              </div>
            ) : (
              <>
                {displayedMovements.map((movement) => (
                  <MovementCard key={movement.id} movement={movement} />
                ))}

                {/* Load More Button */}
                {!searchResults && hasMore && (
                  <div className="flex justify-center py-4">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Carregando...
                        </div>
                      ) : (
                        'Carregar mais'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <MovementsAnalyticsTab />
      )}

      {/* New Movement Modal */}
      <NewMovementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          refresh();
        }}
      />
    </div>
  );
};

