import React, { useState } from 'react';
import type { MovementType } from '../types/movement.model';
import { Filter, X } from 'lucide-react';
import type { MovementFilters } from '../services/movement.service';

interface MovementFiltersProps {
  onFilterChange: (filters: MovementFilters) => void;
  onClearFilters: () => void;
}

export const MovementFiltersComponent: React.FC<MovementFiltersProps> = ({
  onFilterChange,
  onClearFilters,
}) => {
  const [type, setType] = useState<MovementType | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = type || startDate || endDate;

  const handleApplyFilters = () => {
    const filters: MovementFilters = {};

    if (type) filters.type = type as MovementType;
    if (startDate) filters.from = startDate;
    if (endDate) filters.to = endDate;

    onFilterChange(filters);
  };

  const handleClearAll = () => {
    setType('');
    setStartDate('');
    setEndDate('');
    onClearFilters();
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium"
        >
          <Filter className="w-4 h-4" />
          <span>Filtros</span>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
              Ativos
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
            Limpar
          </button>
        )}
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="space-y-3 pt-3 border-t border-slate-200">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tipo de Movimentação
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MovementType | '')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="ENTRY">Entrada</option>
              <option value="OUT">Saída</option>
              <option value="ADJUST">Ajuste</option>
              <option value="TRANSFER">Transferência</option>
              <option value="SALE">Venda</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={handleApplyFilters}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Aplicar Filtros
          </button>
        </div>
      )}
    </div>
  );
};
