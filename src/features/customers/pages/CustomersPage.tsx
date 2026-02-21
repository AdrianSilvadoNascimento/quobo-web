import React, { useEffect, useRef, useState, useMemo } from 'react';
import { UserPlus, Search, Users, X, SlidersHorizontal, Filter, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

import { customer_service } from '../services/customer.service';

import { CustomerModel, type CustomerType } from '../types/customer.model';
import InfiniteCards from '../components/InfiniteCards';
import { Button } from '@/components/ui';

interface CustomerTypeProp {
  value: string;
  label: string;
}

export const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['customers', 'infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      return customer_service.getPaginatedCustomers(pageParam, 40);
    },
    getNextPageParam: (lastPage, _allPages) => {
      if (lastPage.next) {
        return _allPages.length;
      }
      return undefined;
    },
    initialPageParam: 0,
  });

  // Combine all pages into a single array
  const customers = useMemo(() => {
    return data?.pages.flatMap(page => page.data) ?? [];
  }, [data]);

  const loading = isFetching && !isFetchingNextPage;
  const hasMore = hasNextPage ?? false;

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

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
        <Button
          onClick={() => navigate('/customers/new')}
          size="sm"
          icon={<UserPlus className="w-4 h-4" />}
        >
          Novo Cliente
        </Button>
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
            <Button
              tabIndex={0}
              variant="ghost"
              size="sm"
              icon={<Filter className="w-4 h-4" />}
            >
              <span className="text-slate-600">
                {customerType.label}
              </span>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
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
