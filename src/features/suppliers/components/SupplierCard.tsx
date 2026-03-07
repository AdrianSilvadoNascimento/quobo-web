import React from 'react';
import { Building2, Mail, Phone, Tag, ChevronRight } from 'lucide-react';
import type { SupplierModel } from '../models/supplier.model';

interface SupplierCardProps {
  supplier: SupplierModel;
  onClick?: () => void;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({ supplier, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-slate-300 transition-all"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
        <Building2 className="w-6 h-6 text-brand-500" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-slate-800 truncate">{supplier.name}</p>
          {!supplier.active && (
            <span className="badge badge-sm badge-error">Inativo</span>
          )}
        </div>

        {supplier.trade_name && (
          <p className="text-xs text-slate-500 truncate">{supplier.trade_name}</p>
        )}

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {supplier.category && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Tag className="w-3 h-3" />
              {supplier.category.name}
            </span>
          )}
          {supplier.email && (
            <span className="flex items-center gap-1 text-xs text-slate-400 truncate">
              <Mail className="w-3 h-3" />
              {supplier.email}
            </span>
          )}
          {supplier.phone && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Phone className="w-3 h-3" />
              {supplier.phone}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
    </div>
  );
};
