import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Box, Check, ClipboardList, Layers } from 'lucide-react';
import { category_service } from '@/features/categories/services/category.service';
import { CategoryModel } from '@/features/categories/types/category.model';
import { AuditStockType } from '../types/audit.model';
import { audit_service } from '../services/audit.service';
import { useAuth } from '@/contexts/AuthContext';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { AlertModal } from '@/components/AlertModal';

import { item_service } from '@/features/items/services/items.service';
import { AlertCircle } from 'lucide-react';

export const NewAuditPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedType, setSelectedType] = useState<AuditStockType | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [hasProducts, setHasProducts] = useState<boolean | null>(null);
  const [showNoProductsModal, setShowNoProductsModal] = useState(false);

  // Error handling
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  // Categories Infinite Scroll & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const observerTarget = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkProducts = async () => {
      try {
        const response = await item_service.getProducts(0, 1);
        const hasProds = response.total > 0;
        setHasProducts(hasProds);
        if (!hasProds) {
          setShowNoProductsModal(true);
        }
      } catch (error) {
        console.error('Failed to check products', error);
        setHasProducts(false);
        setShowNoProductsModal(true);
      }
    };
    checkProducts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCategories = React.useCallback((page: number, limit: number) => {
    return category_service.getPaginatedCategories(page, limit, debouncedSearch);
  }, [debouncedSearch]);

  const {
    data: categories,
    loading: isLoadingCategories,
    hasMore,
    loadMore
  } = useInfiniteScroll<CategoryModel>({
    fetchFunction: fetchCategories,
    limit: 20
  });

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingCategories) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoadingCategories, loadMore]);


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>(''); // 'init' | 'fetching'

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const parseErrorMessage = (error: any): { title: string; message: string } => {
    // Check if it's an Axios error with response data
    if (error.response?.data) {
      const { message, error: errorType } = error.response.data;

      // Handle validation errors
      if (Array.isArray(message)) {
        return {
          title: 'Erro de Validação',
          message: message.join('\n')
        };
      }

      // Handle custom error messages
      if (typeof message === 'string') {
        return {
          title: errorType || 'Erro ao Criar Auditoria',
          message
        };
      }
    }

    // Default error
    return {
      title: 'Erro ao Criar Auditoria',
      message: 'Ocorreu um erro inesperado ao criar a auditoria. Por favor, tente novamente.'
    };
  };

  const handleStartAudit = async () => {
    if (!selectedType) return;
    if (selectedType === AuditStockType.CYCLIC && selectedCategories.length === 0) return;
    if (!hasProducts) return;

    setIsSubmitting(true);

    try {
      // Step 1: Initiating
      setLoadingStep('init');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay for UX as requested

      // Step 2: Fetching products (simulated as part of creation process on backend)
      setLoadingStep('fetching');

      const newAudit = await audit_service.createAudit({
        type: selectedType,
        categories: selectedType === AuditStockType.CYCLIC ? selectedCategories : undefined,
        participants: user?.id ? [user.id] : []
      });

      // Success
      navigate(`/audits/${newAudit.id}`);

    } catch (error) {
      console.error('Failed to create audit', error);
      const { title, message } = parseErrorMessage(error);
      setErrorModal({
        isOpen: true,
        title,
        message
      });
      setIsSubmitting(false);
      setLoadingStep('');
    }
  };

  if (isSubmitting) {
    return (
      <div className="fixed inset-0 bg-slate-900/90 z-50 flex flex-col items-center justify-center text-white">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
            {loadingStep === 'init' ? '1/2' : '2/2'}
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2">
          {loadingStep === 'init' ? 'Passo 1: Iniciando Auditoria' : 'Passo 2: Buscando todos os produtos'}
        </h2>
        <p className="text-slate-400">
          {loadingStep === 'init' ? 'Criando registro e alocando recursos...' : 'Sincronizando banco de dados com a lista de contagem...'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/audits')}
          className="cursor-pointer p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nova Auditoria</h1>
          <p className="text-slate-500 text-sm">Configure o escopo da sua contagem.</p>
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${hasProducts === false ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Step 1: Type Selection */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800">1. Tipo de Auditoria</h3>

          <div
            onClick={() => setSelectedType(AuditStockType.CYCLIC)}
            className={`
              relative p-6 rounded-xl border-2 cursor-pointer transition-all
              ${selectedType === AuditStockType.CYCLIC
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-200 bg-white hover:border-slate-300'}
            `}
          >
            {selectedType === AuditStockType.CYCLIC && (
              <div className="absolute top-4 right-4 text-blue-600">
                <CheckCircleIcon />
              </div>
            )}
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4 text-slate-600">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">Cíclica</h4>
            <p className="text-sm text-slate-500">
              Escolha categorias específicas para contar. Ideal para manutenções rotineiras de estoque.
            </p>
          </div>

          <div
            onClick={() => setSelectedType(AuditStockType.TOTAL)}
            className={`
              relative p-6 rounded-xl border-2 cursor-pointer transition-all
              ${selectedType === AuditStockType.TOTAL
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-200 bg-white hover:border-slate-300'}
            `}
          >
            {selectedType === AuditStockType.TOTAL && (
              <div className="absolute top-4 right-4 text-blue-600">
                <CheckCircleIcon />
              </div>
            )}
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4 text-slate-600">
              <Box className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">Total (Inventário)</h4>
            <p className="text-sm text-slate-500">
              Contagem de TODOS os produtos do estoque. Ideal para balanços anuais ou semestrais.
            </p>
          </div>
        </div>

        {/* Step 2: Configuration */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800">2. Configuração</h3>

          <div className="bg-white rounded-xl border border-slate-200 p-6 min-h-[400px] flex flex-col">
            {!selectedType ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Layers className="w-8 h-8 opacity-50" />
                </div>
                <p>Selecione um tipo de auditoria ao lado para ver as opções de configuração.</p>
              </div>
            ) : selectedType === AuditStockType.TOTAL ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                  <Box className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Modo Total Selecionado</h4>
                <p className="text-slate-500 text-sm max-w-xs">
                  Isso irá gerar uma lista de contagem para todos os produtos do estoque. Certifique-se de que sua equipe está preparada.
                </p>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase">Selecione as Categorias</span>
                  <span className="text-xs text-slate-400">{selectedCategories.length} selecionadas</span>
                </div>

                {/* Search Categories */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Buscar categoria..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar max-h-[300px]">
                  {categories.map(category => (
                    <label
                      key={category.id}
                      className={`
                        flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                        ${selectedCategories.includes(category.id)
                          ? 'border-blue-500 bg-blue-50/30'
                          : 'border-slate-100 hover:border-slate-200'}
                      `}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleToggleCategory(category.id)}
                      />
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-5 h-5 rounded border flex items-center justify-center transition-colors
                          ${selectedCategories.includes(category.id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-slate-300 bg-white'}
                        `}>
                          {selectedCategories.includes(category.id) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{category.name}</span>
                      </div>
                    </label>
                  ))}

                  {/* Loading Sentinel */}
                  <div ref={observerTarget} className="h-4 flex items-center justify-center">
                    {isLoadingCategories && <span className="loading loading-spinner loading-xs text-slate-400"></span>}
                  </div>

                  {!isLoadingCategories && categories.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      Nenhuma categoria encontrada.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-slate-200 p-4 z-40 transition-all duration-300">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-sm text-slate-500 hidden sm:block">
            {selectedType === AuditStockType.CYCLIC && selectedCategories.length === 0
              ? 'Selecione pelo menos uma categoria'
              : 'Tudo pronto para iniciar'}
          </span>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => navigate('/audits')}
              className="btn btn-ghost border border-slate-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleStartAudit}
              disabled={!selectedType || (selectedType === AuditStockType.CYCLIC && selectedCategories.length === 0) || !hasProducts}
              className="btn bg-blue-600 hover:bg-blue-700 text-white border-none gap-2 px-8 disabled:bg-slate-300 disabled:text-slate-500"
            >
              <Check className="w-4 h-4" />
              Iniciar Contagem
            </button>
          </div>
        </div>
      </div>

      {/* No Products Modal */}
      {showNoProductsModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-800">Nenhum produto cadastrado</h3>
                <p className="py-4 text-slate-600">
                  Você precisa cadastrar pelo menos um produto antes de iniciar uma auditoria de estoque.
                </p>
              </div>
            </div>
            <div className="modal-action">
              <button
                onClick={() => {
                  setShowNoProductsModal(false);
                  navigate('/products/new');
                }}
                className="btn bg-blue-600 hover:bg-blue-700 text-white border-none"
              >
                Cadastrar Produto
              </button>
              <button
                onClick={() => {
                  setShowNoProductsModal(false);
                  navigate('/audits');
                }}
                className="btn btn-ghost"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      <AlertModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })}
        title={errorModal.title}
        message={errorModal.message}
        type="error"
        confirmText="Entendi"
      />
    </div>
  );
};

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.75 12L10.58 14.83L16.25 9.17004" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
