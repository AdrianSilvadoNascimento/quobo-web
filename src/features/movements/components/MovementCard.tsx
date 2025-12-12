import React from 'react';
import type { MovementModel, MovementType } from '../types/movement.model';
import { TrendingUp, TrendingDown, Settings, ShoppingCart, ArrowRightLeft, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MovementCardProps {
  movement: MovementModel;
  onClick?: (movement: MovementModel) => void;
}

const getMovementConfig = (type: MovementType) => {
  const configs = {
    ENTRY: {
      icon: TrendingUp,
      label: 'Entrada',
      theme: 'green',
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-l-green-500',
      iconColor: 'text-green-600'
    },
    OUT: {
      icon: TrendingDown,
      label: 'Saída',
      theme: 'red',
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-l-red-500',
      iconColor: 'text-red-600'
    },
    ADJUST: {
      icon: Settings,
      label: 'Ajuste',
      theme: 'slate',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-l-slate-400',
      iconColor: 'text-slate-600'
    },
    TRANSFER: {
      icon: ArrowRightLeft,
      label: 'Transferência',
      theme: 'blue',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-l-blue-500',
      iconColor: 'text-blue-600'
    },
    SALE: {
      icon: ShoppingCart,
      label: 'Venda',
      theme: 'orange',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-l-orange-500',
      iconColor: 'text-orange-600'
    },
  };

  return configs[type] || configs.ADJUST;
};

export const MovementCard: React.FC<MovementCardProps> = ({ movement, onClick }) => {
  const config = getMovementConfig(movement.move_type);
  const Icon = config.icon;

  const formattedDate = format(new Date(movement.created_at), "dd/MM/yyyy 'às' HH:mm", {
    locale: ptBR,
  });

  const formattedValue = movement.total_value
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(movement.total_value)
    : null;

  return (
    <div
      onClick={() => onClick?.(movement)}
      className={`
        group relative bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden
        border-l-[4px] ${config.border}
      `}
    >
      <div className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">

        {/* Ícone e Identificação Básica */}
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate group-hover:text-brand-600 transition-colors">
              <span className="text-slate-600 font-medium uppercase tracking-wider mr-2">
                Item:
              </span>
              {movement.item?.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
                {config.label}
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Origem / Destino (Desktop) */}
        <div className="hidden md:block flex-1 text-sm text-slate-500 px-4 border-l border-slate-100">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase mb-0.5">Origem / Destino</span>
            <span className="truncate uppercase">
              Interno
            </span>
          </div>
        </div>

        {/* Informações Numéricas */}
        <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6 sm:pl-4 sm:border-l border-slate-100">

          {/* Usuário (Mobile Compacto / Desktop) */}
          <div className="flex items-center gap-2 sm:hidden md:flex">
            {movement.account_user?.avatar ? (
              <img src={movement.account_user.avatar} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                <User className="w-3 h-3 text-slate-400" />
              </div>
            )}
            <span className="text-xs text-slate-500 truncate max-w-[80px]">
              {movement.account_user?.name.split(' ')[0]}
            </span>
          </div>

          <div className="text-right">
            <div className={`text-lg font-bold ${config.text} tabular-nums leading-none`}>
              {movement.move_type === 'OUT' || movement.move_type === 'SALE' ? '-' : '+'}
              {movement.quantity}
              <span className="text-xs ml-1 font-normal text-slate-500">
                {movement.item?.unit_of_measure?.abbreviation || 'UN'}
              </span>
            </div>
            {formattedValue && (
              <div className="text-xs text-slate-400 font-medium mt-1">
                {formattedValue}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};