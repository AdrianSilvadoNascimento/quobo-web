import React, { useEffect, useRef, useState } from 'react';
import { MoreHorizontal, Tags, Edit, Trash2 } from 'lucide-react';
import { CategoryModel } from '../types/category.model';
import Empty from '@/components/ui/Empty';
import { UtilsService } from '@/utils/utils_service';

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
                  <label tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
                    <MoreHorizontal className="w-5 h-5" />
                  </label>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52">
                    <li>
                      <a onClick={() => onEdit?.(category)} className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Editar
                      </a>
                    </li>
                    <li>
                      <a onClick={() => handleDeleteClick(category)} className="flex items-center gap-2 text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </a>
                    </li>
                  </ul>
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
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={handleCancelDelete} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
                  Excluir Categoria
                </h3>
                <p className="text-slate-600 text-center mb-6">
                  Tem certeza que deseja excluir a categoria <span className="font-semibold">{categoryToDelete?.name}</span>? Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelDelete}
                    className="flex-1 btn bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="flex-1 btn bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
