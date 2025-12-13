import type React from "react";
import type { CategoryModel } from "../types/category.model";
import { CategoryActionMenu } from "./CategoryActionMenu";
import { UtilsService } from "@/utils/utils_service";
import { Tag } from "lucide-react";
import { ExcludeCategoryModal } from "./ExcludeCategoryModal";
import { useState } from "react";

type CategoryCardProps = {
  category: CategoryModel;
  onEdit?: () => void;
  onDelete?: (categoryId: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onEdit, onDelete }) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryModel | null>(null);

  const handleDeleteClick = (category: CategoryModel) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete && onDelete) {
      onDelete(categoryToDelete.id);
    }
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  return (
    <>
      <div className="group relative bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 flex flex-col h-full">
        <div className="flex items-center justify-between">
          <div className="p-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-700">{category.name}</h3>
          </div>
          <div className="mr-2 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <CategoryActionMenu
              onEdit={onEdit || (() => { })}
              onDelete={() => handleDeleteClick(category)}
            />
          </div>
        </div>

        {/* Status */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-600 font-medium">Criado em:</p>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                {UtilsService.sanitizeDate(category.created_at)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-600 font-medium">Atualizado em:</p>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                {UtilsService.sanitizeDate(category.updated_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <ExcludeCategoryModal
          categoryToDelete={categoryToDelete}
          handleCancelDelete={handleCancelDelete}
          handleConfirmDelete={handleConfirmDelete}
        />
      )}
    </>
  )
}

export default CategoryCard;