import { Edit, MoreVertical, Trash2 } from "lucide-react";
import type React from "react";

type CategoryActionMenuProps = {
  onEdit: () => void;
  onDelete: () => void;
}

export const CategoryActionMenu: React.FC<CategoryActionMenuProps> = ({ onEdit, onDelete }) => {
  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
        <MoreVertical className="w-5 h-5" />
      </label>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52">
        <li>
          <a onClick={onEdit} className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Editar
          </a>
        </li>
        <li>
          <a onClick={onDelete} className="flex items-center gap-2 text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
            Excluir
          </a>
        </li>
      </ul>
    </div>
  )
}