import { useState, useMemo, useEffect, useRef } from 'react';
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/Layout/AppLayout';
import { TransactionTable, Transaction } from '@/components/Transactions/TransactionTable';
import { TransactionFilters, FilterValues } from '@/components/Transactions/TransactionFilters';
import { TransactionFiltersMobile } from '@/components/Transactions/TransactionFiltersMobile';
import { TransactionModal } from '@/components/Transactions/TransactionModal';
import { CSVImportModal } from '@/components/Import/CSVImportModal';
import { Button } from '@/components/ui/button';
import { transactionsService, Transaction as TransactionType } from '@/services/transactions.service';
import { categoriesService } from '@/services/categories.service';
import { accountsService } from '@/services/accounts.service';
import { useUserPagination } from '@/hooks/useUserPagination';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { ImportExportActions } from '@/components/Transactions/ImportExportActions';

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
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionType | undefined>();
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const queryClient = useQueryClient();
  const itemsPerPage = useUserPagination();
  const { toast } = useToast();

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

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['transactions', queryParams, itemsPerPage],
    queryFn: ({ pageParam = 1 }) =>
      transactionsService.getAll({ ...queryParams, page: pageParam, limit: itemsPerPage }),
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore && lastPage.page) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const transactionsData = useMemo(() => {
    return data?.pages.flatMap((page) => page.transactions) || [];
  }, [data]);

  // Mutation para atualizar categoria
  const updateCategoryMutation = useMutation({
    mutationFn: ({ transactionId, categoryId }: { transactionId: string; categoryId: string }) =>
      transactionsService.updateCategory(transactionId, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        variant: 'success',
        title: 'Categoria atualizada!',
        description: 'A categoria da transação foi atualizada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar categoria',
        description: error.response?.data?.error || 'Não foi possível atualizar a categoria. Tente novamente.',
      });
    },
  });

  // Mutation para criar transação
  const createTransactionMutation = useMutation({
    mutationFn: (data: {
      accountId: string;
      categoryId: string;
      amount: string;
      type: 'INCOME' | 'EXPENSE';
      description: string;
      date: string;
    }) => transactionsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setTransactionModalOpen(false);
      setEditingTransaction(undefined);
      toast({
        variant: 'success',
        title: 'Transação criada!',
        description: 'Sua transação foi criada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar transação',
        description: error.response?.data?.error || 'Não foi possível criar a transação. Tente novamente.',
      });
    },
  });

  // Mutation para atualizar transação
  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TransactionType> }) =>
      transactionsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setTransactionModalOpen(false);
      setEditingTransaction(undefined);
      toast({
        variant: 'success',
        title: 'Transação atualizada!',
        description: 'Sua transação foi atualizada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar transação',
        description: error.response?.data?.error || 'Não foi possível atualizar a transação. Tente novamente.',
      });
    },
  });

  // Mutation para deletar transação
  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string) => transactionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast({
        variant: 'success',
        title: 'Transação excluída!',
        description: 'A transação foi excluída com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir transação',
        description: error.response?.data?.error || 'Não foi possível excluir a transação. Tente novamente.',
      });
    },
  });

  const handleCategoryChange = (transactionId: string, categoryId: string) => {
    updateCategoryMutation.mutate({ transactionId, categoryId });
  };

  const handleCreateTransaction = () => {
    setEditingTransaction(undefined);
    setTransactionModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction as TransactionType);
    setTransactionModalOpen(true);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    deleteTransactionMutation.mutate(transactionId);
  };

  const handleSubmitTransaction = async (data: {
    description: string;
    amount: string;
    type: 'INCOME' | 'EXPENSE';
    categoryId: string;
    accountId: string;
    date: string;
  }) => {
    if (editingTransaction) {
      await updateTransactionMutation.mutateAsync({
        id: editingTransaction.id,
        data,
      });
    } else {
      await createTransactionMutation.mutateAsync(data);
    }
  };

  // Observer para scroll infinito
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
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
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Aplicar filtro de busca no frontend (já que a API não suporta busca textual)
  const transactions: Transaction[] = useMemo(() => {
    const allTransactions = transactionsData.map((t) => ({
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
    }));

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
  }, [transactionsData, filters.search]);

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
          <div className="flex justify-between items-center gap-2">
            <h1 className="text-xl md:text-3xl font-bold">Transações</h1>
            <div className="flex items-center gap-2">
              {/* Filtros Mobile */}
              <div className="md:hidden flex items-center gap-2">
                <TransactionFiltersMobile
                  categories={categoriesData || []}
                  accounts={accountsData || []}
                  filters={filters}
                  onFiltersChange={setFilters}
                  onReset={handleResetFilters}
                  isLoadingCategories={isLoadingCategories}
                  isLoadingAccounts={isLoadingAccounts}
                  categoriesError={categoriesError}
                  accountsError={accountsError}
                  activeFiltersCount={
                    Object.values(filters).filter(
                      (v) => v !== '' && v !== 'all'
                    ).length
                  }
                />
                <ImportExportActions
                  onImport={() => setImportModalOpen(true)}
                  onExport={() => {
                    // TODO: Implementar exportação
                    console.log('Exportar');
                  }}
                />
              </div>
              {/* Botão Desktop */}
              <FloatingActionButton
                onClick={handleCreateTransaction}
                label="Nova Transação"
              />
            </div>
          </div>

          {/* Filtros Desktop */}
          <div className="hidden md:block">
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
          </div>

          <TransactionTable
            transactions={transactions}
            categories={categoriesData || []}
            onCategoryChange={handleCategoryChange}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            onImport={() => setImportModalOpen(true)}
            onExport={() => {
              // TODO: Implementar exportação
              console.log('Exportar');
            }}
          />

          {/* Scroll infinito trigger */}
          <div ref={observerTarget} className="h-20 flex items-center justify-center">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Carregando mais transações...</span>
              </div>
            )}
            {!hasNextPage && transactions.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Todas as transações foram carregadas ({transactions.length} {transactions.length === 1 ? 'transação' : 'transações'})
              </p>
            )}
          </div>
          
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

          <TransactionModal
            open={transactionModalOpen}
            onOpenChange={setTransactionModalOpen}
            transaction={editingTransaction}
            categories={categoriesData || []}
            accounts={accountsData || []}
            onSubmit={handleSubmitTransaction}
            isLoading={
              createTransactionMutation.isPending || updateTransactionMutation.isPending
            }
          />
        </div>
      </div>
    </AppLayout>
  );
}

