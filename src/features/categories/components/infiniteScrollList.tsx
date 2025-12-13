import React, { useEffect, useRef, useState } from 'react';
import { Tags } from 'lucide-react';
import { CategoryModel } from '../types/category.model';
import Empty from '@/components/ui/Empty';
import { UtilsService } from '@/utils/utils_service';
import { CategoryActionMenu } from './CategoryActionMenu';
import { ExcludeCategoryModal } from './ExcludeCategoryModal';

interface InfiniteScrollListProps {
  categories: CategoryModel[];
  hasMore: boolean;
  loading: boolean;
  loadMore: () => void;
  onEdit?: (category: CategoryModel) => void;
  onDelete?: (categoryId: string) => void;
}

export const InfiniteScrollList: React.FC<InfiniteScrollListProps> = ({
  categories,
  hasMore,
  loading,
  loadMore,
  onEdit,
  onDelete,
}) => {
  const observerTarget = useRef<HTMLDivElement>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryModel | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, loadMore]);

  const handleDeleteClick = (category: CategoryModel) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete && onDelete) {
      onDelete(categoryToDelete.id);
    }
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg text-brand-600"></span>
          <p className="text-slate-500 text-sm font-medium">Buscando categorias...</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <Empty
        description="Nenhuma categoria encontrada"
        icon={<Tags className="w-12 h-12 text-slate-400" />}
      />
    );
  }

  return (
    <div>
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
          <tr>
            <th className="px-6 py-4">Nome</th>
            <th className="px-6 py-4">Criado em</th>
            <th className="px-6 py-4">Atualizado em</th>
            <th className="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {categories.map((category) => (
            <tr key={category.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {category.name}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="flex-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  {UtilsService.sanitizeDate(category.created_at)}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="flex-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  {UtilsService.sanitizeDate(category.updated_at)}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="dropdown dropdown-end">
                  <CategoryActionMenu onEdit={() => onEdit?.(category)} onDelete={() => handleDeleteClick(category)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Loading Sentinel */}
      <div ref={observerTarget} className="h-10 flex items-center justify-center p-4">
        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
            Carregando mais categorias...
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <ExcludeCategoryModal
          categoryToDelete={categoryToDelete}
          handleCancelDelete={handleCancelDelete}
          handleConfirmDelete={handleConfirmDelete}
        />
      )}
    </div>
  );
};
