import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/Layout/AppLayout';
import { TransactionTable, Transaction } from '@/components/Transactions/TransactionTable';
import { TransactionFilters, FilterValues } from '@/components/Transactions/TransactionFilters';
import { CSVImportModal } from '@/components/Import/CSVImportModal';
import { transactionsService } from '@/services/transactions.service';
import { categoriesService } from '@/services/categories.service';
import { accountsService } from '@/services/accounts.service';

const initialFilters: FilterValues = {
  search: '',
  type: 'all',
  categoryId: '',
  accountId: '',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  month: '',
  year: '',
};

export function Transactions() {
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const queryClient = useQueryClient();

  // Buscar categorias e contas para os filtros
  const { 
    data: categoriesData, 
    isLoading: isLoadingCategories,
    error: categoriesError 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  const { 
    data: accountsData, 
    isLoading: isLoadingAccounts,
    error: accountsError 
  } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsService.getAll,
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  // Construir query params para a API
  const queryParams = useMemo(() => {
    const params: any = {};
    
    if (filters.type !== 'all') {
      params.type = filters.type;
    }
    if (filters.categoryId) {
      params.categoryId = filters.categoryId;
    }
    if (filters.accountId) {
      params.accountId = filters.accountId;
    }
    
    // Filtro por mês/ano (tem prioridade sobre datas específicas)
    if (filters.month && filters.year) {
      // Se mês e ano estão selecionados, calcular início e fim do mês
      const year = parseInt(filters.year);
      const month = parseInt(filters.month) - 1; // JavaScript usa 0-11 para meses
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
      
      params.startDate = startOfMonth.toISOString().split('T')[0];
      params.endDate = endOfMonth.toISOString().split('T')[0];
    } else if (filters.month) {
      // Se apenas mês está selecionado, usar o ano atual
      const currentYear = new Date().getFullYear();
      const month = parseInt(filters.month) - 1;
      const startOfMonth = new Date(currentYear, month, 1);
      const endOfMonth = new Date(currentYear, month + 1, 0, 23, 59, 59, 999);
      
      params.startDate = startOfMonth.toISOString().split('T')[0];
      params.endDate = endOfMonth.toISOString().split('T')[0];
    } else if (filters.year) {
      // Se apenas ano está selecionado, usar todo o ano
      const year = parseInt(filters.year);
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
      
      params.startDate = startOfYear.toISOString().split('T')[0];
      params.endDate = endOfYear.toISOString().split('T')[0];
    } else {
      // Se não há filtro de mês/ano, usar as datas específicas se existirem
      if (filters.startDate) {
        params.startDate = filters.startDate;
      }
      if (filters.endDate) {
        params.endDate = filters.endDate;
      }
    }
    
    if (filters.minAmount) {
      params.minAmount = filters.minAmount;
    }
    if (filters.maxAmount) {
      params.maxAmount = filters.maxAmount;
    }

    return params;
  }, [filters]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['transactions', queryParams],
    queryFn: () => transactionsService.getAll(queryParams),
  });

  // Mutation para atualizar categoria
  const updateCategoryMutation = useMutation({
    mutationFn: ({ transactionId, categoryId }: { transactionId: string; categoryId: string }) =>
      transactionsService.updateCategory(transactionId, categoryId),
    onSuccess: () => {
      // Invalidar e refetch das transações
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      // Também invalidar o dashboard para atualizar os dados
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleCategoryChange = (transactionId: string, categoryId: string) => {
    updateCategoryMutation.mutate({ transactionId, categoryId });
  };

  // Aplicar filtro de busca no frontend (já que a API não suporta busca textual)
  const transactions: Transaction[] = useMemo(() => {
    const allTransactions =
      data?.transactions.map((t) => ({
        id: t.id,
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: {
          id: t.category.id,
          name: t.category.name,
          color: t.category.color,
          icon: t.category.icon,
        },
        account: {
          id: t.account.id,
          name: t.account.name,
        },
      })) || [];

    if (!filters.search) {
      return allTransactions;
    }

    const searchLower = filters.search.toLowerCase();
    return allTransactions.filter(
      (t) =>
        t.description.toLowerCase().includes(searchLower) ||
        t.category.name.toLowerCase().includes(searchLower) ||
        t.account.name.toLowerCase().includes(searchLower)
    );
  }, [data, filters.search]);

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p>Carregando transações...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Transações</h1>
              <p className="text-muted-foreground">
                Gerencie suas receitas e despesas
              </p>
            </div>
          </div>

          {/* Filtros */}
          <TransactionFilters
            categories={categoriesData || []}
            accounts={accountsData || []}
            filters={filters}
            onFiltersChange={setFilters}
            onReset={handleResetFilters}
            isLoadingCategories={isLoadingCategories}
            isLoadingAccounts={isLoadingAccounts}
            categoriesError={categoriesError}
            accountsError={accountsError}
          />

          <TransactionTable
            transactions={transactions}
            categories={categoriesData || []}
            onCategoryChange={handleCategoryChange}
            onImport={() => setImportModalOpen(true)}
            onExport={() => {
              // TODO: Implementar exportação
              console.log('Exportar');
            }}
          />
          
          {/* Debug: Mostrar quantas categorias estão disponíveis */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-muted-foreground">
              Debug: {categoriesData?.length || 0} categorias carregadas
            </div>
          )}

          <CSVImportModal
            open={importModalOpen}
            onOpenChange={setImportModalOpen}
            onSuccess={() => {
              refetch();
            }}
          />
        </div>
      </div>
    </AppLayout>
  );
}

