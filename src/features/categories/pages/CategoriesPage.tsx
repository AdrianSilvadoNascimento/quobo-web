import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { CategoryModel } from "../types/category.model";
import { useCallback, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { category_service } from "../services/category.service";
import { Plus, Tags } from "lucide-react";
import { InfiniteScrollList } from "../components/infiniteScrollList";
import { CategoryModal } from "../components/CategoryModal";

export const CategoriesPage: React.FC = () => {
  const [isSearching] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryModel | null>(null);

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

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        {/* Product List */}
        <InfiniteScrollList
          categories={categories}
          hasMore={hasMore}
          loading={loading || isSearching}
          loadMore={loadMore}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
        />
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