import React, { useState, useEffect } from 'react';
import { X, Save, Tag } from 'lucide-react';
import { CategoryModel } from '../types/category.model';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Partial<CategoryModel>) => Promise<void>;
  category?: CategoryModel | null;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  category
}) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
    } else {
      setName('');
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent, continueCreating = false) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await onSave({ ...category, name: name.trim() });
      setName('');
      if (!continueCreating) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Erro ao salvar categoria');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">

          {/* Header with Gradient */}
          <div className="relative bg-gradient-to-br from-[#22B8E6] via-[#2563EB] to-[#1E40AF] px-6 py-8">
            <button
              onClick={handleClose}
              className="cursor-pointer absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Tag className="w-6 h-6 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white text-center">
              {category ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
            <p className="text-white/80 text-sm text-center mt-1">
              {category ? 'Atualize as informações da categoria' : 'Crie uma nova categoria para organizar seus produtos'}
            </p>
          </div>

          {/* Form Body */}
          <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-6">
            <div>
              <label htmlFor="category-name" className="block text-sm font-semibold text-slate-700 mb-2">
                Nome da Categoria *
              </label>
              <div className="relative">
                <input
                  id="category-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Eletrônicos, Roupas, Alimentos..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  autoFocus
                  disabled={isLoading}
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  <option value="Eletrônicos" />
                  <option value="Roupas" />
                  <option value="Alimentos" />
                  <option value="Bebidas" />
                  <option value="Limpeza" />
                  <option value="Higiene" />
                  <option value="Papelaria" />
                  <option value="Ferramentas" />
                </datalist>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Digite um nome descritivo para a categoria
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="btn flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                  className="btn flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="loading loading-dots loading-md" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Salvar
                    </div>
                  )}
                </button>
              </div>
              {!category && (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e as any, true)}
                  disabled={isLoading || !name.trim()}
                  className="btn w-full bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="loading loading-dots loading-md" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Salvar e Continuar Criando
                    </div>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
