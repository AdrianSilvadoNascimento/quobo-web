import React, { useCallback, useEffect, useRef, useState } from 'react';
import { UserPlus, Search, Users, X, SlidersHorizontal, Filter, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useNavigate } from 'react-router-dom';

import { customer_service } from '../services/customer.service';

import { CustomerModel, type CustomerType } from '../types/customer.model';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import InfiniteCards from '../components/InfiniteCards';

interface CustomerTypeProp {
  value: string;
  label: string;
}

export const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [customerType, setCustomerType] = useState<CustomerTypeProp>({ value: '', label: 'Todos os Tipos' });
  const [searchResults, setSearchResults] = useState<CustomerModel[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const customerTypes: CustomerTypeProp[] = [
    { value: 'PERSON', label: 'Pessoa Física' },
    { value: 'COMPANY', label: 'Pessoa Jurídica' },
  ]

  const debouncedSearchTerm = useDebounce(searchQuery, 200);

  const { account } = useAuth();

  const fetchProducts = useCallback((page: number, limit: number) => {
    return customer_service.getPaginatedCustomers(page, limit)
  }, [])

  const {
    data: customers,
    loading,
    hasMore,
    loadMore,
    refresh,
  } = useInfiniteScroll<CustomerModel>({
    fetchFunction: fetchProducts,
    limit: 40,
  });

  const filteredCustomers = customerType.value
    ? customers.filter(c => c.type === customerType.value)
    : customers;

  const performSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const termLower = term.toLowerCase();
      const localResults = filteredCustomers.filter(p =>
        p.name.toLowerCase().includes(termLower) ||
        p.email.toLowerCase().includes(termLower) ||
        p.document.toLowerCase().includes(termLower)
      );

      if (localResults.length > 0) {
        setSearchResults(localResults);
      } else {
        if (account?.id) {
          const serverResults = await customer_service.searchCustomers(term, customerType.value as CustomerType);
          setSearchResults(serverResults);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    performSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, customerType]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  const handleChangeCustomerType = (type: CustomerTypeProp) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setCustomerType(type);
    setSearchQuery('');
    setSearchResults(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-slate-600" />
            <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
          </div>
          <p className="text-slate-500 text-sm">Gerencie sua base de clientes e parceiros.</p>
        </div>
        <button
          onClick={() => navigate('/customers/new')}
          className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex items-center gap-2 relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 cursor-pointer"
              onClick={() => inputRef.current?.focus()}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar por nome, documento, telefone ou tipo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            {searchQuery ? (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div
                className="absolute right-3 top-2.5 text-slate-400 cursor-pointer"
                onClick={() => inputRef.current?.focus()}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              className="btn btn-ghost btn-sm flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              <span className="text-slate-600">
                {customerType.label}
              </span>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-white rounded-box w-52 z-50"
            >
              <li>
                <a onClick={() => handleChangeCustomerType({ value: '', label: 'Todos os Tipos' })}>
                  Todos os Tipos
                </a>
              </li>
              {customerTypes.map((type) => (
                <li key={type.value}>
                  <a onClick={() => handleChangeCustomerType(type)}>
                    {type.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <InfiniteCards
          items={searchResults || filteredCustomers}
          hasMore={hasMore}
          loading={loading || isSearching}
          loadMore={loadMore}
          onRefresh={refresh}
        />
      </div>
    </div>
  );
};
