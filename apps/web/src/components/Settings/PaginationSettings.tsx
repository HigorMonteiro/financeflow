import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { authService } from '@/services/auth.service';
import { Save, Loader2, List } from 'lucide-react';

const ITEMS_PER_PAGE_OPTIONS = [
  { value: 3, label: '3 itens por página' },
  { value: 5, label: '5 itens por página' },
  { value: 10, label: '10 itens por página' },
  { value: 50, label: '50 itens por página (padrão)' },
];

export function PaginationSettings() {
  const queryClient = useQueryClient();
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);

  const { data: userData, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: authService.me,
  });

  useEffect(() => {
    if (userData?.user?.itemsPerPage) {
      setItemsPerPage(userData.user.itemsPerPage);
    }
  }, [userData]);

  const updatePaginationMutation = useMutation({
    mutationFn: async (value: number) => {
      return authService.update({ itemsPerPage: value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      alert('Preferência de paginação salva com sucesso!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Erro ao salvar preferência');
    },
  });

  const handleSave = () => {
    updatePaginationMutation.mutate(itemsPerPage);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="h-5 w-5" />
          Paginação
        </CardTitle>
        <CardDescription>
          Escolha quantos itens deseja ver por página em todas as listagens
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="itemsPerPage">Itens por página</Label>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(parseInt(value))}
            >
              <SelectTrigger id="itemsPerPage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Esta configuração será aplicada em todas as listagens do sistema (Transações, Metas, etc.)
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={updatePaginationMutation.isPending}
            >
              {updatePaginationMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Preferência
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

