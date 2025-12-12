import { Trash2 } from "lucide-react"
import type { CategoryModel } from "../types/category.model";

interface ExcludeCategoryModalProps {
  categoryToDelete: CategoryModel | null;
  handleCancelDelete: () => void;
  handleConfirmDelete: () => void;
}

export const ExcludeCategoryModal = ({
  categoryToDelete,
  handleCancelDelete,
  handleConfirmDelete,
}: ExcludeCategoryModalProps) => {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleCancelDelete} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
              Excluir Categoria
            </h3>
            <p className="text-slate-600 text-center mb-6">
              Tem certeza que deseja excluir a categoria <span className="font-semibold">{categoryToDelete?.name}</span>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 btn bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 btn bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
