import React from 'react';
import type { MovementModel, MovementType } from '../types/movement.model';
import { Package, TrendingUp, TrendingDown, Settings, ShoppingCart, ArrowRightLeft } from 'lucide-react';
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
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
    },
    OUT: {
      icon: TrendingDown,
      label: 'Saída',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
    },
    ADJUST: {
      icon: Settings,
      label: 'Ajuste',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
    },
    TRANSFER: {
      icon: ArrowRightLeft,
      label: 'Transferência',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200',
    },
    SALE: {
      icon: ShoppingCart,
      label: 'Venda',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200',
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

  const handleClick = () => {
    if (onClick) onClick(movement);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 border ${config.borderColor} rounded-lg ${config.bgColor} hover:shadow-md transition-all cursor-pointer`}
    >
      <div className="flex items-start justify-between">
        {/* Left side - Icon and Info */}
        <div className="flex gap-3 flex-1">
          <div className={`p-2 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Product Name */}
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-slate-400" />
              <h3 className="font-semibold text-slate-800 truncate">
                {movement.item?.name || 'Produto não informado'}
              </h3>
            </div>

            {/* Description if exists */}
            {movement.description && (
              <p className="text-sm text-slate-600 mb-2 line-clamp-2">{movement.description}</p>
            )}

            {/* Movement type badge and date */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-medium px-2 py-1 rounded ${config.bgColor} ${config.textColor}`}>
                {config.label}
              </span>
              <span className="text-xs text-slate-500">{formattedDate}</span>
            </div>

            {/* User info if exists */}
            {movement.account_user && (
              <p className="text-xs text-slate-500 mt-1">
                Por: {movement.account_user.name} {movement.account_user.lastname}
              </p>
            )}
          </div>
        </div>

        {/* Right side - Quantity */}
        <div className="text-right ml-4">
          <p className={`text-2xl font-bold ${config.textColor}`}>
            {movement.move_type === 'OUT' ? '-' : '+'}
            {movement.quantity}
          </p>
          {movement.item?.unit_of_measure?.abbreviation && (
            <p className="text-xs text-slate-500">{movement.item.unit_of_measure.abbreviation}</p>
          )}

          {/* Price info if available */}
          {movement.total_value && movement.total_value > 0 && (
            <p className="text-sm text-slate-600 mt-1">
              R$ {movement.total_value.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
