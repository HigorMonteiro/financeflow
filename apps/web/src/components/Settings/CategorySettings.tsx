import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { categoriesService } from '@/services/categories.service';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, Save, X, Loader2 } from 'lucide-react';
import { getIcon } from '@/lib/icons';

export function CategorySettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    color: '#3B82F6',
    icon: 'Receipt',
    isDefault: false,
  });

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  const createMutation = useMutation({
    mutationFn: categoriesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsCreating(false);
      setFormData({ name: '', type: 'EXPENSE', color: '#3B82F6', icon: 'Receipt', isDefault: false });
      toast({
        variant: 'success',
        title: 'Categoria criada!',
        description: 'A categoria foi criada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar categoria',
        description: error.response?.data?.error || 'Não foi possível criar a categoria. Tente novamente.',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => categoriesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingId(null);
      toast({
        variant: 'success',
        title: 'Categoria atualizada!',
        description: 'A categoria foi atualizada com sucesso.',
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

  const deleteMutation = useMutation({
    mutationFn: categoriesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        variant: 'success',
        title: 'Categoria excluída!',
        description: 'A categoria foi excluída com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir categoria',
        description: error.response?.data?.error || 'Não foi possível excluir a categoria. Tente novamente.',
      });
    },
  });

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (category: any) => {
    // Não permitir editar categorias padrão
    if (category.isDefault) {
      toast({
        variant: 'warning',
        title: 'Ação não permitida',
        description: 'Não é possível editar categorias padrão do sistema.',
      });
      return;
    }
    
    setEditingId(category.id);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
      isDefault: category.isDefault || false,
    });
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({ name: '', type: 'EXPENSE', color: '#3B82F6', icon: 'Receipt', isDefault: false });
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
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gerenciar Categorias</CardTitle>
            <CardDescription>
              Crie e edite suas categorias de receitas e despesas
            </CardDescription>
          </div>
          {!isCreating && !editingId && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {(isCreating || editingId) && (
          <div className="mb-6 p-4 border rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome da categoria"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXPENSE">Despesa</SelectItem>
                    <SelectItem value="INCOME">Receita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cor</Label>
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ícone</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Nome do ícone (ex: Home)"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!formData.name || createMutation.isPending || updateMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  {category.icon && (() => {
                    const IconComponent = getIcon(category.icon);
                    return IconComponent ? (
                      <div
                        className="p-2 rounded"
                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                    ) : null;
                  })()}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category.name}</span>
                      {(category as any).isDefault && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          Padrão
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {category.type === 'INCOME' ? 'Receita' : 'Despesa'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!(category as any).isDefault && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        disabled={editingId === category.id}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir esta categoria?')) {
                            deleteMutation.mutate(category.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                  {(category as any).isDefault && (
                    <span className="text-xs text-muted-foreground self-center">
                      Categoria padrão do sistema
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma categoria cadastrada
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

