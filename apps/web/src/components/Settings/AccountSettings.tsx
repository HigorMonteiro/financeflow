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
import { accountsService, Account } from '@/services/accounts.service';
import { Plus, Edit2, Trash2, Save, X, Loader2, Calendar } from 'lucide-react';

const ACCOUNT_TYPES = [
  { value: 'CHECKING', label: 'Conta Corrente' },
  { value: 'SAVINGS', label: 'Conta Poupança' },
  { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
  { value: 'INVESTMENT', label: 'Investimento' },
  { value: 'OTHER', label: 'Outro' },
];

const CURRENCY_OPTIONS = [
  { value: 'BRL', label: 'R$ - Real Brasileiro' },
  { value: 'USD', label: '$ - Dólar Americano' },
  { value: 'EUR', label: '€ - Euro' },
];

// Gerar array de dias do mês (1-31)
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export function AccountSettings() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'CHECKING',
    balance: '0',
    currency: 'BRL',
    billingStartDay: null as number | null,
    billingEndDay: null as number | null,
  });

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: accountsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setIsCreating(false);
      setFormData({
        name: '',
        type: 'CHECKING',
        balance: '0',
        currency: 'BRL',
        billingStartDay: null,
        billingEndDay: null,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Account> }) =>
      accountsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: accountsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate({
        ...formData,
        billingStartDay: formData.billingStartDay || null,
        billingEndDay: formData.billingEndDay || null,
      });
    }
  };

  const handleEdit = (account: Account) => {
    setEditingId(account.id);
    setIsCreating(false);
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
      billingStartDay: account.billingStartDay ?? null,
      billingEndDay: account.billingEndDay ?? null,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({
      name: '',
      type: 'CHECKING',
      balance: '0',
      currency: 'BRL',
      billingStartDay: null,
      billingEndDay: null,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.')) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
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
          <Calendar className="h-5 w-5" />
          Contas
        </CardTitle>
        <CardDescription>
          Gerencie suas contas e configure períodos de fatura
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Formulário de criação/edição */}
          {(isCreating || editingId) && (
            <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
              <h3 className="font-semibold">
                {editingId ? 'Editar Conta' : 'Nova Conta'}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Conta *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Conta Corrente Nubank"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="balance">Saldo Inicial</Label>
                  <Input
                    id="balance"
                    type="text"
                    value={formData.balance}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d,.-]/g, '');
                      setFormData({ ...formData, balance: value });
                    }}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Moeda *</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((curr) => (
                        <SelectItem key={curr.value} value={curr.value}>
                          {curr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Período de Fatura */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Período de Fatura (Opcional)
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure os dias de início e término da fatura para esta conta. 
                  Isso será usado para calcular relatórios mensais baseados no período de fatura, 
                  não no mês calendário.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billingStartDay">Dia de Início</Label>
                    <Select
                      value={formData.billingStartDay?.toString() || 'none'}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          billingStartDay: value === 'none' ? null : parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger id="billingStartDay">
                        <SelectValue placeholder="Selecione o dia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Não configurar</SelectItem>
                        {DAYS.map((day) => (
                          <SelectItem key={day} value={day.toString()}>
                            Dia {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billingEndDay">Dia de Término</Label>
                    <Select
                      value={formData.billingEndDay?.toString() || 'none'}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          billingEndDay: value === 'none' ? null : parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger id="billingEndDay">
                        <SelectValue placeholder="Selecione o dia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Não configurar</SelectItem>
                        {DAYS.map((day) => (
                          <SelectItem key={day} value={day.toString()}>
                            Dia {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.billingStartDay && formData.billingEndDay && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      <strong>Período configurado:</strong> Do dia {formData.billingStartDay} ao dia{' '}
                      {formData.billingEndDay} de cada mês.
                      {formData.billingStartDay > formData.billingEndDay && (
                        <span className="block mt-1 text-xs">
                          (Nota: O período vai do dia {formData.billingStartDay} de um mês ao dia{' '}
                          {formData.billingEndDay} do mês seguinte)
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={
                    !formData.name ||
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Botão de adicionar */}
          {!isCreating && !editingId && (
            <Button onClick={() => setIsCreating(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          )}

          {/* Lista de contas */}
          {accounts && accounts.length > 0 ? (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{account.name}</h4>
                        <span className="text-xs px-2 py-1 bg-muted rounded">
                          {ACCOUNT_TYPES.find((t) => t.value === account.type)?.label ||
                            account.type}
                        </span>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          Saldo: <span className="font-medium">{formatCurrency(account.balance)}</span>
                        </p>
                        <p>Moeda: {account.currency}</p>
                        {account.billingStartDay && account.billingEndDay ? (
                          <p className="text-blue-600 dark:text-blue-400">
                            Período de fatura: Dia {account.billingStartDay} ao dia{' '}
                            {account.billingEndDay}
                            {account.billingStartDay > account.billingEndDay && (
                              <span className="text-xs">
                                {' '}
                                (do mês anterior ao atual)
                              </span>
                            )}
                          </p>
                        ) : (
                          <p className="text-muted-foreground">
                            Período de fatura: Mês calendário (não configurado)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(account)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma conta cadastrada ainda.</p>
              <p className="text-sm mt-2">Clique em "Nova Conta" para começar.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

