import { useState, useMemo, useEffect, useRef } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/Layout/AppLayout';
import { BudgetCard } from '@/components/Budgets/BudgetCard';
import { BudgetForm } from '@/components/Budgets/BudgetForm';
import { BudgetFilters, FilterStatus, SortOption } from '@/components/Budgets/BudgetFilters';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { budgetsService, Budget, CreateBudgetData, BudgetPeriod } from '@/services/budgets.service';
import { categoriesService } from '@/services/categories.service';
import { useUserPagination } from '@/hooks/useUserPagination';
import { useToast } from '@/hooks/use-toast';

export function Budgets() {
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>();
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('created');
  const [periodFilter, setPeriodFilter] = useState<BudgetPeriod | 'all'>('all');
  const queryClient = useQueryClient();
  const itemsPerPage = useUserPagination();
  const { toast } = useToast();

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['budgets', itemsPerPage],
    queryFn: ({ pageParam = 1 }) =>
      budgetsService.getAll({ page: pageParam, limit: itemsPerPage }),
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore && lastPage.page) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const budgetsData = useMemo(() => {
    return data?.pages.flatMap((page) => page.budgets) || [];
  }, [data]);

  const createMutation = useMutation({
    mutationFn: budgetsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setBudgetModalOpen(false);
      setEditingBudget(undefined);
      toast({
        variant: 'success',
        title: 'Orçamento criado!',
        description: 'Seu orçamento foi criado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar orçamento',
        description: error.response?.data?.error || 'Não foi possível criar o orçamento. Tente novamente.',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateBudgetData }) =>
      budgetsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setBudgetModalOpen(false);
      setEditingBudget(undefined);
      toast({
        variant: 'success',
        title: 'Orçamento atualizado!',
        description: 'Seu orçamento foi atualizado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar orçamento',
        description: error.response?.data?.error || 'Não foi possível atualizar o orçamento. Tente novamente.',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: budgetsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteDialogOpen(false);
      setBudgetToDelete(null);
      toast({
        variant: 'success',
        title: 'Orçamento excluído!',
        description: 'O orçamento foi excluído com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir orçamento',
        description: error.response?.data?.error || 'Não foi possível excluir o orçamento. Tente novamente.',
      });
    },
  });

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

  const filteredAndSortedBudgets = useMemo(() => {
    if (!budgetsData.length) return [];

    let filtered = [...budgetsData];

    // Filtrar por status
    if (statusFilter === 'safe') {
      filtered = filtered.filter((budget) => budget.progress !== undefined && budget.progress < 80);
    } else if (statusFilter === 'nearLimit') {
      filtered = filtered.filter(
        (budget) =>
          budget.progress !== undefined && budget.progress >= 80 && budget.progress <= 100
      );
    } else if (statusFilter === 'overBudget') {
      filtered = filtered.filter(
        (budget) => budget.progress !== undefined && budget.progress > 100
      );
    }

    // Filtrar por período
    if (periodFilter !== 'all') {
      filtered = filtered.filter((budget) => budget.period === periodFilter);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'period':
          const periodOrder: Record<BudgetPeriod, number> = {
            WEEKLY: 1,
            MONTHLY: 2,
            YEARLY: 3,
          };
          return periodOrder[a.period] - periodOrder[b.period];
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        case 'amount':
          return parseFloat(b.amount) - parseFloat(a.amount);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [budgetsData, statusFilter, sortBy, periodFilter]);

  const handleCreateBudget = () => {
    setEditingBudget(undefined);
    setBudgetModalOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setBudgetModalOpen(true);
  };

  const handleDeleteBudget = (budgetId: string) => {
    setBudgetToDelete(budgetId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (budgetToDelete) {
      deleteMutation.mutate(budgetToDelete);
    }
  };

  const handleSubmitBudget = async (data: CreateBudgetData) => {
    if (editingBudget) {
      await updateMutation.mutateAsync({ id: editingBudget.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
          <div className="flex justify-between items-center gap-2">
            <h1 className="text-xl md:text-3xl font-bold">Orçamentos</h1>
            <div className="flex items-center gap-2">
              <BudgetFilters
                status={statusFilter}
                sortBy={sortBy}
                period={periodFilter}
                onStatusChange={setStatusFilter}
                onSortChange={setSortBy}
                onPeriodChange={setPeriodFilter}
              />
              {/* Botão Desktop */}
              <FloatingActionButton
                onClick={handleCreateBudget}
                label="Novo Orçamento"
              />
            </div>
          </div>

          {/* Lista de Orçamentos */}
          {filteredAndSortedBudgets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                {budgetsData.length === 0
                  ? 'Você ainda não tem orçamentos criados'
                  : 'Nenhum orçamento encontrado com os filtros selecionados'}
              </p>
              {budgetsData.length === 0 && (
                <Button onClick={handleCreateBudget}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Orçamento
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredAndSortedBudgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  onEdit={handleEditBudget}
                  onDelete={handleDeleteBudget}
                />
              ))}
            </div>
          )}

          {/* Scroll infinito trigger */}
          <div ref={observerTarget} className="h-20 flex items-center justify-center">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Carregando mais orçamentos...</span>
              </div>
            )}
            {!hasNextPage && budgetsData.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Todos os orçamentos foram carregados ({budgetsData.length}{' '}
                {budgetsData.length === 1 ? 'orçamento' : 'orçamentos'})
              </p>
            )}
          </div>

          {/* Modal de criação/edição */}
          <Dialog open={budgetModalOpen} onOpenChange={setBudgetModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
                </DialogTitle>
              </DialogHeader>
              <BudgetForm
                budget={editingBudget}
                categories={categoriesData || []}
                onSubmit={handleSubmitBudget}
                onCancel={() => {
                  setBudgetModalOpen(false);
                  setEditingBudget(undefined);
                }}
                isLoading={createMutation.isPending || updateMutation.isPending}
              />
            </DialogContent>
          </Dialog>

          {/* Dialog de confirmação de exclusão */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Excluir Orçamento</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    'Excluir'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AppLayout>
  );
}

