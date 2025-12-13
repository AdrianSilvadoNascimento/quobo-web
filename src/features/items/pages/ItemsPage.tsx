import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X, SlidersHorizontal, Package } from 'lucide-react';
import { item_service } from '../services/items.service';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useAuth } from '@/contexts/AuthContext';
import type { ItemModel } from '../types/item.model';
import { useDebounce } from '@/hooks/useDebounce';
import { InfiniteScrollList } from '../components/InfiniteScrollList';
import { InfiniteItemCards } from '../components/InfiniteCards';

export const ItemsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ItemModel[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearchTerm = useDebounce(searchQuery, 200);

  const { account } = useAuth();

  const fetchProducts = useCallback((page: number, limit: number) => {
    return item_service.getProducts(page, limit)
  }, [])

  const {
    data: products,
    loading,
    hasMore,
    loadMore,
  } = useInfiniteScroll<ItemModel>({
    fetchFunction: fetchProducts,
    limit: 40,
  });

  const performSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const termLower = term.toLowerCase();
      const localResults = products.filter(p =>
        p.name.toLowerCase().includes(termLower) ||
        p.description.toLowerCase().includes(termLower) ||
        (p.barcode && p.barcode.includes(term))
      );

      if (localResults.length > 0) {
        setSearchResults(localResults);
      } else {
        if (account?.id) {
          const serverResults = await item_service.searchItems(term);
          setSearchResults(serverResults);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    performSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    loadMore();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-slate-400" />
            <h1 className="text-2xl font-bold text-slate-800">Produtos</h1>
          </div>
          <p className="text-slate-500 text-sm">Gerencie seu catálogo de produtos e níveis de estoque.</p>
        </div>
        <button
          onClick={() => navigate('/products/new')}
          className="btn bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 cursor-pointer"
              onClick={() => inputRef.current?.focus()}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar por nome, código ou categoria..."
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
        </div>

        <div className="md:hidden block">
          <InfiniteItemCards
            items={searchResults || products}
            hasMore={hasMore}
            loading={loading || isSearching}
            loadMore={loadMore}
            onRefresh={loadMore}
          />
        </div>

        <div className="md:block hidden">
          {/* Product List */}
          <InfiniteScrollList
            items={searchResults || products}
            hasMore={hasMore}
            loading={loading || isSearching}
            loadMore={loadMore}
            onRefresh={loadMore}
          />
        </div>
      </div>
    </div>
  );
};