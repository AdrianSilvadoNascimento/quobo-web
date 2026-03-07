import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building2, Loader2 } from 'lucide-react';
import { supplier_service } from '../services/supplier.service';
import { SupplierModel } from '../models/supplier.model';
import { SupplierCard } from '../components/SupplierCard';

export const SuppliersPage: React.FC = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<SupplierModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const loadSuppliers = useCallback(async (p = 0) => {
    try {
      setLoading(true);
      const result = await supplier_service.findPaginated(p, 20);
      setSuppliers(p === 0 ? result.data : prev => [...prev, ...result.data]);
      setHasMore(result.next !== null);
      setTotal(result.total);
      setPage(p);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuppliers(0);
  }, [loadSuppliers]);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      loadSuppliers(0);
      return;
    }
    try {
      setSearching(true);
      const results = await supplier_service.search(term.trim());
      setSuppliers(results);
      setHasMore(false);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Fornecedores</h1>
            <p className="text-sm text-slate-500">{total} cadastrado{total !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => navigate('/suppliers/new')}
            className="btn btn-primary btn-sm gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Fornecedor
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Buscar por nome, CNPJ, e-mail..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          />
        </div>

        {/* List */}
        {loading && suppliers.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : suppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Building2 className="w-12 h-12 text-slate-300" />
            <p className="text-slate-500">
              {searchTerm ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor cadastrado'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/suppliers/new')}
                className="btn btn-primary btn-sm gap-2"
              >
                <Plus className="w-4 h-4" />
                Cadastrar primeiro fornecedor
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {suppliers.map(supplier => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                onClick={() => navigate(`/suppliers/${supplier.id}`)}
              />
            ))}

            {hasMore && (
              <button
                onClick={() => loadSuppliers(page + 1)}
                disabled={loading}
                className="btn btn-ghost btn-sm mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Carregar mais'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
