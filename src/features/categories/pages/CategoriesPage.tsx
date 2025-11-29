import { useCallback, useEffect, useRef, useState } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/contexts/AuthContext";

import { Plus, Search, SlidersHorizontal, Tags, X } from "lucide-react";

import type { CategoryModel } from "../types/category.model";
import { category_service } from "../services/category.service";
import { InfiniteScrollList } from "../components/infiniteScrollList";
import { CategoryModal } from "../components/CategoryModal";

export const CategoriesPage: React.FC = () => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryModel | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CategoryModel[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearchTerm = useDebounce(searchQuery, 200);

  const { account } = useAuth();

  const fetchProducts = useCallback((account_id: string, page: number, limit: number) => {
    return category_service.getPaginatedCategories(account_id, page, limit)
  }, [])

  const {
    data: categories,
    loading,
    hasMore,
    loadMore,
    refresh,
  } = useInfiniteScroll<CategoryModel>({
    fetchFunction: fetchProducts,
    limit: 40,
    account_id: account?.id
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
      const localResults = categories.filter(category =>
        category.name.toLowerCase().includes(termLower)
      );

      if (localResults.length > 0) {
        setSearchResults(localResults);
        return;
      }

      if (account?.id) {
        const serverResults = await category_service.searchCategories(account.id, term);
        setSearchResults(serverResults);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }

  useEffect(() => {
    performSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    loadMore();
  }

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (category: Partial<CategoryModel>) => {
    if (!account?.id) return;

    try {
      if (editingCategory) {
        await category_service.updateCategory(category as CategoryModel);
      } else {
        await category_service.createCategory(account.id, category as CategoryModel);
      }
      refresh();
    } catch (error) {
      console.error('Error saving category:', error);
      throw error;
    }
  };

  const handleEditCategory = (category: CategoryModel) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!account?.id) return;

    try {
      await category_service.deleteCategory(categoryId);
      refresh();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Erro ao excluir categoria');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Tags className="w-6 h-6 text-slate-400" />
            <h1 className="text-2xl font-bold text-slate-800">
              Categories
            </h1>
          </div>
          <p className="text-slate-500 text-sm">Gerencie seu catálogo de categorias.</p>
        </div>
        <button
          onClick={handleCreateCategory}
          className="btn bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Nova Categoria
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
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
              placeholder="Buscar por nome da categoria..."
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          {/* Product List */}
          <InfiniteScrollList
            categories={searchResults || categories}
            hasMore={hasMore}
            loading={loading || isSearching}
            loadMore={loadMore}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
          />
        </div>
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
      />
    </div>
  );
};