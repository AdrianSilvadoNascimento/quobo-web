import { useEffect, useRef } from "react";
import type { CustomerModel } from "../types/customer.model";
import Empty from "@/components/ui/Empty";
import { Users } from "lucide-react";
import CustomerCard from "./CustomerCard";

interface InfiniteCardsProps {
  items: CustomerModel[];
  hasMore: boolean;
  loading: boolean;
  loadMore: () => void;
  onRefresh?: () => void;
}

export const InfiniteCards: React.FC<InfiniteCardsProps> = ({
  items,
  hasMore,
  loading,
  loadMore,
  onRefresh,
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

  if (!items.length) {
    return (
      <Empty
        description="Nenhum cliente encontrado"
        icon={<Users className="w-12 h-12 text-slate-400" />}
      />
    );
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <CustomerCard key={item.id} customer={item} onDelete={onRefresh} />
        ))}
      </div>
    </div>
  )
}

export default InfiniteCards;
