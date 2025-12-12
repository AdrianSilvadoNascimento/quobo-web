import type React from "react";
import { useEffect, useRef } from "react";
import { PackageOpen } from "lucide-react";
import Empty from "@/components/ui/Empty";
import type { CategoryModel } from "../types/category.model";
import CategoryCard from "./CategoryCard";

interface InfiniteCategoryCardsProps {
  categories: CategoryModel[];
  onEdit?: (category: CategoryModel) => void;
  onDelete: (id: string) => void;
  hasMore: boolean;
  loading: boolean;
  loadMore: () => void;
  onRefresh?: () => void;
}

export const InfiniteCategoryCards: React.FC<InfiniteCategoryCardsProps> = ({
  categories,
  hasMore,
  loading,
  onEdit,
  onDelete,
  loadMore,
}) => {
  const observerTarget = useRef<HTMLDivElement>(null);

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

  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg text-brand-600"></span>
          <p className="text-slate-500 text-sm font-medium">Buscando itens...</p>
        </div>
      </div>
    );
  }

  if (!categories.length) {
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
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={onEdit ? () => onEdit(category) : undefined}
              onDelete={onDelete ? () => onDelete(category.id) : undefined}
            />
          ))}
        </div>

        {/* Loading Sentinel */}
        <div ref={observerTarget} className="h-10 flex items-center justify-center p-4">
          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              Carregando mais categorias...
            </div>
          )}
        </div>
      </div>
    </>
  )
}