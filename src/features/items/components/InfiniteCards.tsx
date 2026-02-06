import type { ItemModel } from "@/features/items/types/item.model";
import type React from "react";
import ItemCard from "./ItemCard";
import { useEffect, useRef, useState } from "react";
import { PackageOpen } from "lucide-react";
import Empty from "@/components/ui/Empty";
import { useNavigate } from "react-router-dom";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { item_service } from "../services/items.service";
import { Loader } from "@/components/ui";

interface InfiniteItemCardsProps {
  items: ItemModel[];
  hasMore: boolean;
  loading: boolean;
  loadMore: () => void;
  onRefresh?: () => void;
}

export const InfiniteItemCards: React.FC<InfiniteItemCardsProps> = ({
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
          <Loader size="lg" className="text-brand-600" />
          <p className="text-slate-500 text-sm font-medium">Buscando itens...</p>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <Empty
        description="Nenhum item encontrado"
        icon={<PackageOpen className="w-12 h-12 text-slate-400" />}
      />
    );
  }

  return (
    <>
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={() => handleEdit(item.id)}
              onDelete={() => handleDeleteClick(item)}
            />
          ))}
        </div>
        <div ref={observerTarget} />
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
  )
}