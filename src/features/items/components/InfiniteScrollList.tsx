import React, { useEffect, useRef, useState } from 'react';
import { Package, Tag } from 'lucide-react';
import { ItemModel } from '../types/item.model';
import Empty from '@/components/ui/Empty';
import { ItemActionMenu } from './ItemActionMenu';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { item_service } from '../services/items.service';

interface InfiniteScrollListProps {
  items: ItemModel[];
  hasMore: boolean;
  loading: boolean;
  loadMore: () => void;
  onRefresh?: () => void;
}

export const InfiniteScrollList: React.FC<InfiniteScrollListProps> = ({
  items,
  hasMore,
  loading,
  loadMore,
  onRefresh,
}) => {
  const observerTarget = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [itemToDelete, setItemToDelete] = useState<ItemModel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  const handleEdit = (id: string) => {
    navigate(`/products/${id}`);
  };

  const handleDeleteClick = (item: ItemModel) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      await item_service.deleteItem(itemToDelete.id);
      setItemToDelete(null);
      if (onRefresh) {
        onRefresh();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg text-brand-600"></span>
          <p className="text-slate-500 text-sm font-medium">Buscando produtos...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Empty
        description="Nenhum item encontrado"
        icon={<Package className="w-12 h-12 text-slate-400" />}
      />
    );
  }

  return (
    <>
      <div className="">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
            <tr>
              <th className="px-6 py-4">Produto</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4 text-center">Estoque</th>
              <th className="px-6 py-4 text-right">Preço</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      {item.product_image && !imageError ? (
                        <img
                          src={item.product_image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <Package className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{item.name}</div>
                      <div className="text-xs text-slate-400">
                        {item.barcode || 'Sem SKU'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-400" />
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {item.category?.name || 'Sem Categoria'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`font-medium ${item.quantity <= 5 ? 'text-red-600' : 'text-slate-700'
                      }`}
                  >
                    {item.quantity}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">
                    {item.unit_of_measure?.abbreviation || 'un'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-700">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(item.sale_price)}
                </td>
                <td className="px-6 py-4 text-center">
                  {item.active ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      Inativo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <ItemActionMenu
                    onEdit={() => handleEdit(item.id)}
                    onDelete={() => handleDeleteClick(item)}
                  />
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
              Carregando mais itens...
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Produto"
        message={`Tem certeza que deseja excluir o produto "${itemToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        type="danger"
        isLoading={isDeleting}
      />
    </>
  );
};
