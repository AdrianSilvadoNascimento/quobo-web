import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Settings,
  Package,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { MovementType } from '../types/movement.model';
import type { ItemModel } from '@/features/items/types/item.model';
import { movement_service, type CreateMovementData } from '../services/movement.service';
import { item_service } from '@/features/items/services/items.service';

export const NewMovementPage: React.FC = () => {
  const navigate = useNavigate();

  // Form states
  const [selectedType, setSelectedType] = useState<MovementType | ''>('');
  const [selectedProduct, setSelectedProduct] = useState<ItemModel | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [description, setDescription] = useState('');

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ItemModel[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const movementTypes = [
    {
      value: 'ENTRY' as MovementType,
      label: 'Entrada',
      icon: TrendingUp,
      color: 'green',
      description: 'Adiciona produtos ao estoque'
    },
    {
      value: 'OUT' as MovementType,
      label: 'Saída',
      icon: TrendingDown,
      color: 'red',
      description: 'Remove produtos do estoque'
    },
    {
      value: 'ADJUST' as MovementType,
      label: 'Ajuste',
      icon: Settings,
      color: 'blue',
      description: 'Ajusta quantidade do estoque'
    },
  ];

  const handleSearchProduct = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await item_service.searchItems(term, 10);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectProduct = (product: ItemModel) => {
    setSelectedProduct(product);
    setSearchResults([]);
    setSearchTerm(product.name);
  };

  const validateForm = (): boolean => {
    if (!selectedType) {
      setError('Selecione o tipo de movimentação');
      return false;
    }
    if (!selectedProduct) {
      setError('Selecione um produto');
      return false;
    }
    if (quantity <= 0) {
      setError('Quantidade deve ser maior que zero');
      return false;
    }
    if (selectedType === 'OUT' && selectedProduct.quantity < quantity) {
      setError(`Estoque insuficiente. Disponível: ${selectedProduct.quantity}`);
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const data: CreateMovementData = {
        move_type: selectedType as MovementType,
        item_id: selectedProduct!.id,
        quantity,
        description: description || undefined,
      };

      await movement_service.createMovement(data);

      // Success - redirect to list
      navigate('/movements');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar movimentação';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeConfig = (type: MovementType) => {
    return movementTypes.find(t => t.value === type);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/movements')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nova Movimentação</h1>
          <p className="text-sm text-slate-500">Registre entradas, saídas ou ajustes de estoque</p>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
        {/* Step 1: Select Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            1. Tipo de Movimentação *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {movementTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.value;
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${isSelected
                    ? `border-${type.color}-500 bg-${type.color}-50`
                    : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-6 h-6 ${isSelected ? `text-${type.color}-600` : 'text-slate-400'}`} />
                    <div>
                      <div className="font-semibold text-slate-800">{type.label}</div>
                      <div className="text-xs text-slate-500 mt-1">{type.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Product */}
        {selectedType && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              2. Produto *
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchProduct(e.target.value)}
                placeholder="Buscar produto por nome ou código..."
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-3 w-5 h-5 text-blue-600 animate-spin" />
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 border border-slate-200 rounded-lg divide-y max-h-64 overflow-y-auto">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="w-full p-3 hover:bg-slate-50 text-left transition-colors"
                  >
                    <div className="font-medium text-slate-800">{product.name}</div>
                    <div className="text-sm text-slate-500 mt-1">
                      Estoque: {product.quantity} {product.unit_of_measure?.abbreviation || 'un'}
                      {product.barcode && ` • Código: ${product.barcode}`}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Product */}
            {selectedProduct && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{selectedProduct.name}</div>
                  <div className="text-sm text-slate-600">
                    Estoque atual: {selectedProduct.quantity} {selectedProduct.unit_of_measure?.abbreviation || 'un'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Quantity */}
        {selectedProduct && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              3. Quantidade *
            </label>
            <input
              type="number"
              min="1"
              value={quantity || ''}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              placeholder="Digite a quantidade"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {selectedType === 'OUT' && quantity > selectedProduct.quantity && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-amber-800">
                  Quantidade maior que o estoque disponível ({selectedProduct.quantity})
                </span>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Description (Optional) */}
        {selectedProduct && quantity > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              4. Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Compra fornecedor XYZ, Venda balcão, Ajuste de inventário..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate('/movements')}
          disabled={isSubmitting}
          className="px-6 py-3 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedType || !selectedProduct || quantity <= 0 || isSubmitting}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Criando...' : 'Criar Movimentação'}
        </button>
      </div>
    </div>
  );
};
