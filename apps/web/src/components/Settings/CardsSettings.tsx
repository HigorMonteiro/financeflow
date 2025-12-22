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
import { cardsService, Card as CardType } from '@/services/cards.service';
import { Plus, Trash2, Edit, Save, X, CreditCard, Loader2 } from 'lucide-react';

const BANK_OPTIONS = [
  { value: 'NUBANK', label: 'Nubank' },
  { value: 'INTER', label: 'Inter' },
  { value: 'ITAU', label: 'Itaú' },
  { value: 'SANTANDER', label: 'Santander' },
  { value: 'BRADESCO', label: 'Bradesco' },
  { value: 'CAIXA', label: 'Caixa Econômica' },
  { value: 'BB', label: 'Banco do Brasil' },
  { value: 'OTHER', label: 'Outro' },
];

export function CardsSettings() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bank: 'NUBANK',
    lastFourDigits: '',
    bestPurchaseDay: 1,
    dueDay: 10,
    closingDay: 5,
    limit: '',
  });

  const { data: cards, isLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: cardsService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: cardsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setIsCreating(false);
      setFormData({
        name: '',
        bank: 'NUBANK',
        lastFourDigits: '',
        bestPurchaseDay: 1,
        dueDay: 10,
        closingDay: 5,
        limit: '',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CardType> }) =>
      cardsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: cardsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate({
        ...formData,
        lastFourDigits: formData.lastFourDigits || undefined,
        limit: formData.limit || undefined,
      });
    }
  };

  const handleEdit = (card: CardType) => {
    setEditingId(card.id);
    setFormData({
      name: card.name,
      bank: card.bank,
      lastFourDigits: card.lastFourDigits || '',
      bestPurchaseDay: card.bestPurchaseDay,
      dueDay: card.dueDay,
      closingDay: card.closingDay,
      limit: card.limit || '',
    });
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({
      name: '',
      bank: 'NUBANK',
      lastFourDigits: '',
      bestPurchaseDay: 1,
      dueDay: 10,
      closingDay: 5,
      limit: '',
    });
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
            <CardTitle>Gerenciar Cartões</CardTitle>
            <CardDescription>
              Adicione e gerencie seus cartões de crédito
            </CardDescription>
          </div>
          {!isCreating && !editingId && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cartão
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {(isCreating || editingId) && (
          <div className="mb-6 p-4 border rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Cartão *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Nubank Roxinho"
                />
              </div>
              <div className="space-y-2">
                <Label>Banco/Instituição *</Label>
                <Select
                  value={formData.bank}
                  onValueChange={(value) => setFormData({ ...formData, bank: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BANK_OPTIONS.map((bank) => (
                      <SelectItem key={bank.value} value={bank.value}>
                        {bank.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Últimos 4 dígitos</Label>
                <Input
                  value={formData.lastFourDigits}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lastFourDigits: e.target.value.replace(/\D/g, '').slice(0, 4),
                    })
                  }
                  placeholder="1234"
                  maxLength={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Limite do Cartão</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Melhor Dia para Compra *</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.bestPurchaseDay}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bestPurchaseDay: parseInt(e.target.value) || 1,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">Dia do mês (1-31)</p>
              </div>
              <div className="space-y-2">
                <Label>Dia de Vencimento *</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dueDay}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dueDay: parseInt(e.target.value) || 1,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">Dia do mês (1-31)</p>
              </div>
              <div className="space-y-2">
                <Label>Dia de Fechamento *</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.closingDay}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      closingDay: parseInt(e.target.value) || 1,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">Quando começa nova fatura</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={!formData.name || createMutation.isPending || updateMutation.isPending}
              >
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
          {cards && cards.length > 0 ? (
            cards.map((card) => {
              const bankOption = BANK_OPTIONS.find((b) => b.value === card.bank);
              return (
                <div
                  key={card.id}
                  className={`flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 ${
                    !card.isActive ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 rounded bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{card.name}</span>
                        {!card.isActive && (
                          <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                            Inativo
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>
                          {bankOption?.label || card.bank}
                          {card.lastFourDigits && ` • Final ${card.lastFourDigits}`}
                        </div>
                        <div className="flex gap-4 text-xs">
                          <span>Vencimento: dia {card.dueDay}</span>
                          <span>Fechamento: dia {card.closingDay}</span>
                          <span>Melhor compra: dia {card.bestPurchaseDay}</span>
                        </div>
                        {card.limit && (
                          <div className="text-xs">
                            Limite:{' '}
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(parseFloat(card.limit))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(card)}
                      disabled={editingId === card.id}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir este cartão?')) {
                          deleteMutation.mutate(card.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhum cartão cadastrado
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

