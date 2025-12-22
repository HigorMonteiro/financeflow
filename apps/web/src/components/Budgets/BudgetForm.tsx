import { useState, useEffect } from 'react';
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
import { Budget, CreateBudgetData, BudgetPeriod } from '@/services/budgets.service';
import { Category } from '@/services/categories.service';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface BudgetFormProps {
  budget?: Budget;
  categories: Category[];
  onSubmit: (data: CreateBudgetData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const budgetPeriodOptions: { value: BudgetPeriod; label: string }[] = [
  { value: 'WEEKLY', label: 'Semanal' },
  { value: 'MONTHLY', label: 'Mensal' },
  { value: 'YEARLY', label: 'Anual' },
];

export function BudgetForm({
  budget,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
}: BudgetFormProps) {
  const [formData, setFormData] = useState<CreateBudgetData>({
    categoryId: budget?.categoryId || '',
    amount: budget?.amount || '',
    period: budget?.period || 'MONTHLY',
    startDate: budget?.startDate
      ? format(new Date(budget.startDate), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd'),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (budget) {
      setFormData({
        categoryId: budget.categoryId,
        amount: budget.amount,
        period: budget.period,
        startDate: format(new Date(budget.startDate), 'yyyy-MM-dd'),
      });
    }
  }, [budget]);

  const formatCurrencyInput = (value: string): string => {
    const numericValue = value.replace(/[^\d,.-]/g, '').replace(',', '.');
    return numericValue;
  };

  const handleChange = (field: keyof CreateBudgetData, value: string) => {
    if (field === 'amount') {
      const formatted = formatCurrencyInput(value);
      setFormData((prev) => ({ ...prev, [field]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value as any }));
    }
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.categoryId) {
      newErrors.categoryId = 'Selecione uma categoria';
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'O valor do orçamento deve ser maior que zero';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'A data de início é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      await onSubmit({
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
      });
    }
  };

  const expenseCategories = categories.filter((cat) => cat.type === 'EXPENSE' || !cat.type);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="categoryId">Categoria *</Label>
        <Select
          value={formData.categoryId}
          onValueChange={(value) => handleChange('categoryId', value)}
        >
          <SelectTrigger id="categoryId">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {expenseCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryId && (
          <p className="text-sm text-red-500">{errors.categoryId}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor do Orçamento *</Label>
          <Input
            id="amount"
            type="text"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            placeholder="0,00"
          />
          {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="period">Período *</Label>
          <Select
            value={formData.period}
            onValueChange={(value) => handleChange('period', value)}
          >
            <SelectTrigger id="period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {budgetPeriodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="startDate">Data de Início *</Label>
        <Input
          id="startDate"
          type="date"
          value={formData.startDate}
          onChange={(e) => handleChange('startDate', e.target.value)}
        />
        {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : budget ? (
            'Atualizar Orçamento'
          ) : (
            'Criar Orçamento'
          )}
        </Button>
      </div>
    </form>
  );
}

