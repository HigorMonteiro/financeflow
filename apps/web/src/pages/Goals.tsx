import { useState, useMemo, useEffect, useRef } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/Layout/AppLayout';
import { GoalCard } from '@/components/Goals/GoalCard';
import { GoalForm } from '@/components/Goals/GoalForm';
import { GoalFilters, FilterStatus, SortOption } from '@/components/Goals/GoalFilters';
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
import { goalsService, Goal, CreateGoalData } from '@/services/goals.service';
import { useUserPagination } from '@/hooks/useUserPagination';
import { useToast } from '@/hooks/use-toast';
import { typography } from '@/lib/typography';

export function Goals() {
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('deadline');
  const queryClient = useQueryClient();
  const itemsPerPage = useUserPagination();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['goals', itemsPerPage],
    queryFn: ({ pageParam = 1 }) =>
      goalsService.getAll({ page: pageParam, limit: itemsPerPage }),
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore && lastPage.page) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const goalsData = useMemo(() => {
    return data?.pages.flatMap((page) => page.goals) || [];
  }, [data]);

  const createMutation = useMutation({
    mutationFn: goalsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setGoalModalOpen(false);
      setEditingGoal(undefined);
      toast({
        variant: 'success',
        title: 'Meta criada!',
        description: 'Sua meta foi criada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar meta',
        description: error.response?.data?.error || 'Não foi possível criar a meta. Tente novamente.',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateGoalData }) =>
      goalsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setGoalModalOpen(false);
      setEditingGoal(undefined);
      toast({
        variant: 'success',
        title: 'Meta atualizada!',
        description: 'Sua meta foi atualizada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar meta',
        description: error.response?.data?.error || 'Não foi possível atualizar a meta. Tente novamente.',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: goalsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteDialogOpen(false);
      setGoalToDelete(null);
      toast({
        variant: 'success',
        title: 'Meta excluída!',
        description: 'A meta foi excluída com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir meta',
        description: error.response?.data?.error || 'Não foi possível excluir a meta. Tente novamente.',
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

  const filteredAndSortedGoals = useMemo(() => {
    if (!goalsData.length) return [];

    let filtered = [...goalsData];

    if (statusFilter === 'active') {
      filtered = filtered.filter((goal) => goal.progress < 100);
    } else if (statusFilter === 'completed') {
      filtered = filtered.filter((goal) => goal.progress >= 100);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'progress':
          return b.progress - a.progress;
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [goalsData, statusFilter, sortBy]);

  const handleCreateGoal = () => {
    setEditingGoal(undefined);
    setGoalModalOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalModalOpen(true);
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoalToDelete(goalId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (goalToDelete) {
      deleteMutation.mutate(goalToDelete);
    }
  };

  const handleSubmitGoal = async (data: CreateGoalData) => {
    if (editingGoal) {
      await updateMutation.mutateAsync({ id: editingGoal.id, data });
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
            <h1 className={typography.h1}>Metas</h1>
            <div className="flex items-center gap-2">
              <GoalFilters
                status={statusFilter}
                sortBy={sortBy}
                onStatusChange={setStatusFilter}
                onSortChange={setSortBy}
              />
              {/* Botão Desktop */}
              <FloatingActionButton
                onClick={handleCreateGoal}
                label="Nova Meta"
              />
            </div>
          </div>

          {filteredAndSortedGoals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                {goalsData.length === 0
                  ? 'Você ainda não tem metas criadas'
                  : 'Nenhuma meta encontrada com os filtros selecionados'}
              </p>
              {goalsData.length === 0 && (
                <Button onClick={handleCreateGoal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Meta
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredAndSortedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={handleEditGoal}
                  onDelete={handleDeleteGoal}
                />
              ))}
            </div>
          )}

          <Dialog open={goalModalOpen} onOpenChange={setGoalModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingGoal ? 'Editar Meta' : 'Nova Meta'}
                </DialogTitle>
              </DialogHeader>
              <GoalForm
                goal={editingGoal}
                onSubmit={handleSubmitGoal}
                onCancel={() => {
                  setGoalModalOpen(false);
                  setEditingGoal(undefined);
                }}
                isLoading={createMutation.isPending || updateMutation.isPending}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar exclusão</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.
                </p>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleteMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    'Excluir'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Scroll infinito trigger */}
          <div ref={observerTarget} className="h-20 flex items-center justify-center">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Carregando mais metas...</span>
              </div>
            )}
            {!hasNextPage && goalsData.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Todas as metas foram carregadas ({goalsData.length} {goalsData.length === 1 ? 'meta' : 'metas'})
              </p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
