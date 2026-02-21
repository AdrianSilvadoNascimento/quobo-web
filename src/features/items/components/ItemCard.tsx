import type React from "react";
import type { ItemModel } from "../types/item.model";
import { ItemActionMenu } from "./ItemActionMenu";
import { Package, Tag } from "lucide-react";
import { useState } from "react";

type ItemCardProps = {
  item: ItemModel;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onEdit, onDelete }) => {
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formattedSalePrice = formatPrice(item.sale_price);
  const formattedUnitPrice = formatPrice(item.unit_price);

  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Image Section - Reduced Height */}
      <div className="relative h-48 bg-slate-50 overflow-hidden shrink-0">
        {item.product_image && !imageError ? (
          <img
            src={item.product_image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-gradient-to-b from-slate-100 to-slate-200"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50 bg-gradient-to-b from-slate-100 to-slate-200">
            <Package className="w-10 h-10" />
          </div>
        )}

        {/* Floating Menu */}
        <div className="absolute top-2 right-2 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <ItemActionMenu
            onEdit={onEdit || (() => { })}
            onDelete={onDelete || (() => { })}
          />
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          {item.active ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-green-700 shadow-sm backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
              Ativo
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-500 shadow-sm backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
              Inativo
            </span>
          )}
        </div>
      </div>

      {/* Content Section - Compact */}
      <div className="p-3 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-md text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors" title={item.name}>
              {item.name}
            </h3>
            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600 font-medium whitespace-nowrap shrink-0">
              {item.quantity} {item.unit_of_measure?.abbreviation}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            <span className="flex items-center gap-1.5">
              <Tag className="w-4 h-4" />
              {item.category?.name || 'Sem categoria'}
            </span>
          </p>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-3 h-8 leading-4">
          {item.description || "Sem descrição"}
        </p>

        {/* Pricing Grid */}
        <div className="mt-auto pt-2 border-t border-slate-50 grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Custo</span>
            <span className="font-medium text-xs text-slate-600">{formattedUnitPrice}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Venda</span>
            <span className="font-bold text-sm text-slate-800">{formattedSalePrice}</span>
          </div>
        </div>

        {/* Barcode/SKU Footer */}
        {item.barcode && (
          <div className="mt-2 pt-1 border-t border-slate-50 flex justify-between items-center">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">SKU</span>
            <span className="font-mono text-[10px] text-slate-500 truncate max-w-[120px]" title={item.barcode}>
              {item.barcode}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ItemCard;