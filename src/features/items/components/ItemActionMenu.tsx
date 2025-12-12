import React from 'react';
import { Edit2, MoreVertical, Trash2 } from 'lucide-react';

interface ItemActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const ItemActionMenu: React.FC<ItemActionMenuProps> = ({ onEdit, onDelete }) => {
  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-sm btn-circle bg-white/80 hover:bg-white text-slate-500 shadow-sm backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreVertical className="w-4 h-4" />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow-lg bg-white rounded-xl w-40 border border-slate-100 mt-1"
        onClick={(e) => e.stopPropagation()}
      >
        <li>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        </li>
        <li>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 active:bg-red-100"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ItemActionMenu;