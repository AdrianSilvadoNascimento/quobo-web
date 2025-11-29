import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  DollarSign,
  Package,
  Barcode,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { item_service } from '../services/items.service';
import { category_service } from '@/features/categories/services/category.service';
import { unit_of_measure_service } from '../services/unit_of_measure.service';

import { CategoryModel } from '@/features/categories/types/category.model';
import { UnitOfMeasureModel } from '../types/unity_of_measure.model';
import { ItemModel } from '../types/item.model';
import EmptyCategoryModal from '../components/EmptyCategoriesModal';
import { AlertModal, type AlertType } from '@/components/AlertModal';

export const ItemForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { account } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [units, setUnits] = useState<UnitOfMeasureModel[]>([]);

  const [openEmptyCategoryModal, setOpenEmptyCategoryModal] = useState(false);

  // Alert Modal State
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as AlertType,
  });

  const showAlert = (title: string, message: string, type: AlertType = 'info') => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category_id: '',
    description: '',
    unit_price: '', // Custo
    sale_price: '', // Venda
    quantity: '',
    min_stock: '5',
    unit_of_measure: 'UNIDADE', // Default fallback
    active: true
  });

  useEffect(() => {
    const loadData = async () => {
      if (!account?.id) return;

      try {
        setIsFetching(true);
        const [cats, uoms] = await Promise.all([
          category_service.getCategories(account.id),
          unit_of_measure_service.getUnits(account.id)
        ]);

        if (!cats.length) {
          setOpenEmptyCategoryModal(true);
          return;
        }

        setCategories(cats);
        setUnits(uoms);

        if (id) {
          const item = await item_service.getItem(account.id, id);
          setFormData({
            name: item.name,
            barcode: item.barcode || '',
            category_id: item.category_id || '',
            description: item.description || '',
            unit_price: item.unit_price.toString(),
            sale_price: item.sale_price.toString(),
            quantity: item.quantity.toString(),
            min_stock: item.min_stock?.toString() || '5',
            unit_of_measure: item.unit_of_measure?.name || 'UNIDADE',
            active: item.active
          });
          setImagePreview(item.product_image || null);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        showAlert('Erro ao carregar dados', 'Não foi possível carregar as informações do produto.', 'error');
      } finally {
        setIsFetching(false);
      }
    };

    loadData();
  }, [account?.id, id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name === 'unit_of_measure') {
      const selectedUnit = units.find(u => u.name === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        min_stock: selectedUnit ? selectedUnit.low_stock_threshold.toString() : prev.min_stock
      }));
      return;
    }

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account?.id) return;

    setIsLoading(true);

    try {
      const payload: Partial<ItemModel> = {
        name: formData.name,
        barcode: formData.barcode,
        category_id: formData.category_id,
        description: formData.description,
        unit_price: parseFloat(formData.unit_price) || 0,
        sale_price: parseFloat(formData.sale_price) || 0,
        quantity: parseInt(formData.quantity) || 0,
        min_stock: parseInt(formData.min_stock) || 0,
        active: formData.active,
        product_image: imagePreview || '',
      };

      // Find unit ID if needed
      const selectedUnit = units.find(u => u.name === formData.unit_of_measure);
      if (selectedUnit) {
        payload.unit_of_measure_id = selectedUnit.id;
      }

      if (id) {
        await item_service.updateItem(account.id, id, payload);
      } else {
        await item_service.createItem(account.id, payload);
      }

      navigate('/products');
    } catch (error) {
      console.error('Error saving item:', error);
      showAlert('Erro ao salvar produto', 'Verifique os dados e tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to calculate margin
  const cost = parseFloat(formData.unit_price) || 0;
  const sale = parseFloat(formData.sale_price) || 0;
  const margin = sale > 0 ? ((sale - cost) / sale) * 100 : 0;

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (openEmptyCategoryModal) {
    return (
      <EmptyCategoryModal />
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/products')}
          className="cursor-pointer p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {id ? 'Editar Produto' : 'Novo Produto'}
          </h1>
          <p className="text-slate-500 text-sm">
            {id ? 'Atualize as informações do produto.' : 'Preencha as informações para cadastrar um item.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">

          {/* General Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-400" />
              Informações Gerais
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Camiseta Básica Branca"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Código de Barras (EAN/GTIN)</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleInputChange}
                      placeholder="Digite o código"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    />
                    <Barcode className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Categoria</label>
                  <div className="dropdown w-full">
                    <div tabIndex={0} role="button" className="btn btn-ghost w-full px-4 py-5.5 font-normal text-base bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-slate-600 transition-all">
                      <span className={!formData.category_id ? 'text-slate-400' : ''}>
                        {categories.find(c => c.id === formData.category_id)?.name || 'Selecione...'}
                      </span>
                      <ChevronDown className="w-4 h-4 opacity-50" />
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full max-h-60 overflow-y-auto">
                      {categories.length === 0 && (
                        <li>
                          <a className="text-center text-slate-500 py-2">Nenhuma categoria encontrada</a>
                        </li>
                      )}
                      {categories.map(cat => (
                        <li key={cat.id}>
                          <a onClick={() => {
                            setFormData(prev => ({ ...prev, category_id: cat.id }));
                            if (document.activeElement instanceof HTMLElement) {
                              document.activeElement.blur();
                            }
                          }}>
                            {cat.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Descrição</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Detalhes técnicos, observações, etc."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-slate-400" />
              Financeiro
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Preço de Custo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleInputChange}
                  placeholder="0,00"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Preço de Venda (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  name="sale_price"
                  value={formData.sale_price}
                  onChange={handleInputChange}
                  placeholder="0,00"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-semibold text-slate-800"
                />
              </div>
            </div>

            {sale > 0 && cost > 0 && (
              <div className="mt-4 p-3 bg-brand-50 rounded-lg border border-brand-100 flex items-center justify-between text-sm">
                <span className="text-brand-700 font-medium">Margem de Lucro Estimada:</span>
                <span className={`font-bold ${margin < 20 ? 'text-orange-600' : 'text-green-600'}`}>
                  {margin.toFixed(2)}%
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Right Column - Image & Settings */}
        <div className="space-y-6">

          {/* Image Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide">Imagem do Produto</h3>

            <div className="relative">
              {imagePreview ? (
                <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-slate-200 group">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="cursor-pointer absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-full shadow-sm hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="w-12 h-12 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="mb-2 text-sm text-slate-500 font-medium">Clique para enviar</p>
                    <p className="text-xs text-slate-400">PNG, JPG (Max. 2MB)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>

          {/* Inventory Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide">Estoque & Unidades</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Estoque Inicial</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Unidade de Medida</label>
                <div className="dropdown w-full">
                  <div className="dropdown-end">
                    <label tabIndex={0} className="w-full btn btn-ghost btn-sm rounded-btn border py-6 border-slate-200 hover:bg-slate-50">
                      <span className="w-full flex items-center justify-between gap-2">
                        <span className="text-slate-600">{formData.unit_of_measure}</span>
                        <ChevronDown className="w-4 h-4 opacity-50" />
                      </span>
                    </label>
                  </div>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full max-h-60 overflow-y-auto">
                    {units.map(unit => (
                      <li key={unit.name}>
                        <a onClick={() => {
                          setFormData(prev => ({ ...prev, unit_of_measure: unit.name }));
                          if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                          }
                        }}>
                          {unit.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Estoque Mínimo (Alerta)</label>
                <div className="relative">
                  <input
                    type="number"
                    name="min_stock"
                    value={formData.min_stock}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-16 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                  <AlertCircle className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                  <span className="absolute right-3 top-3.5 text-xs font-semibold text-slate-400 pointer-events-none">
                    {units.find(u => u.name === formData.unit_of_measure)?.abbreviation || ''}
                  </span>
                </div>
                {(() => {
                  const selectedUnit = units.find(u => u.name === formData.unit_of_measure);
                  if (selectedUnit) {
                    return (
                      <p className="text-xs text-slate-400 mt-1">
                        Sugestão para {selectedUnit.name}: <span className="font-medium text-slate-600">{selectedUnit.low_stock_threshold}</span>
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
            <div>
              <span className="block text-sm font-bold text-slate-800 uppercase tracking-wide">Produto Ativo</span>
              <span className="text-xs text-slate-500">Visível em vendas e listagens</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
                className="toggle rounded-md toggle-primary"
              />
            </label>
          </div>

        </div>

        {/* Action Buttons (Floating or Bottom) */}
        <div className="lg:col-span-3 flex justify-end gap-3 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="btn px-6 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="loading loading-dots loading-md" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Produto
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};