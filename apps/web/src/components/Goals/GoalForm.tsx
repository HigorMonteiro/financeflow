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
import { Goal, CreateGoalData, GoalType } from '@/services/goals.service';
import { Loader2 } from 'lucide-react';

interface GoalFormProps {
  goal?: Goal;
  onSubmit: (data: CreateGoalData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const goalTypeOptions: { value: GoalType; label: string }[] = [
  { value: 'EMERGENCY_FUND', label: '💰 Fundo de Emergência' },
  { value: 'TRAVEL', label: '✈️ Viagem' },
  { value: 'PURCHASE', label: '🛒 Compra' },
  { value: 'INVESTMENT', label: '📈 Investimento' },
  { value: 'OTHER', label: '🎯 Outro' },
];

export function GoalForm({ goal, onSubmit, onCancel, isLoading = false }: GoalFormProps) {
  const [formData, setFormData] = useState<CreateGoalData>({
    name: goal?.name || '',
    targetAmount: goal?.targetAmount || '',
    currentAmount: goal?.currentAmount || '',
    deadline: goal?.deadline || null,
    type: goal?.type || 'OTHER',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        deadline: goal.deadline || null,
        type: goal.type,
      });
    }
  }, [goal]);

  const formatCurrencyInput = (value: string): string => {
    const numericValue = value.replace(/[^\d,.-]/g, '').replace(',', '.');
    return numericValue;
  };

  const handleChange = (field: keyof CreateGoalData, value: string | null) => {
    if (field === 'targetAmount' || field === 'currentAmount') {
      const formatted = formatCurrencyInput(value || '');
      setFormData((prev) => ({ ...prev, [field]: formatted }));
    } else if (field === 'deadline') {
      setFormData((prev) => ({ ...prev, [field]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value as any }));
    }
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      newErrors.name = 'O nome da meta deve ter pelo menos 3 caracteres';
    }

    const targetAmount = parseFloat(formData.targetAmount);
    if (!formData.targetAmount || isNaN(targetAmount) || targetAmount <= 0) {
      newErrors.targetAmount = 'O valor alvo deve ser maior que zero';
    }

    if (formData.currentAmount) {
      const currentAmount = parseFloat(formData.currentAmount);
      if (isNaN(currentAmount) || currentAmount < 0) {
        newErrors.currentAmount = 'O valor atual não pode ser negativo';
      }
    }

    if (formData.deadline) {
      const deadline = new Date(formData.deadline);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (deadline < now) {
        newErrors.deadline = 'A data limite não pode ser no passado';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const submitData: CreateGoalData = {
      ...formData,
      currentAmount: formData.currentAmount || undefined,
      deadline: formData.deadline
        ? (() => {
            const dateStr = formData.deadline;
            if (dateStr.includes('T')) {
              return dateStr;
            }
            const date = new Date(dateStr + 'T00:00:00');
            return date.toISOString();
          })()
        : null,
    };

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Nome da Meta <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Ex: Viagem para Europa"
          className={`min-h-[44px] ${errors.name ? 'border-destructive' : ''}`}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetAmount">
          Valor Alvo <span className="text-destructive">*</span>
        </Label>
        <Input
          id="targetAmount"
          type="text"
          value={formData.targetAmount}
          onChange={(e) => handleChange('targetAmount', e.target.value)}
          placeholder="0.00"
          className={`min-h-[44px] ${errors.targetAmount ? 'border-destructive' : ''}`}
        />
        {errors.targetAmount && (
          <p className="text-sm text-destructive">{errors.targetAmount}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentAmount">Valor Atual</Label>
        <Input
          id="currentAmount"
          type="text"
          value={formData.currentAmount}
          onChange={(e) => handleChange('currentAmount', e.target.value)}
          placeholder="0.00"
          className={`min-h-[44px] ${errors.currentAmount ? 'border-destructive' : ''}`}
        />
        {errors.currentAmount && (
          <p className="text-sm text-destructive">{errors.currentAmount}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">
          Tipo de Meta <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.type}
          onValueChange={(value) => handleChange('type', value)}
        >
          <SelectTrigger className="min-h-[44px]">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            {goalTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline">Data Limite (opcional)</Label>
        <Input
          id="deadline"
          type="date"
          value={formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : ''}
          onChange={(e) => handleChange('deadline', e.target.value || null)}
          className={`min-h-[44px] ${errors.deadline ? 'border-destructive' : ''}`}
        />
        {errors.deadline && (
          <p className="text-sm text-destructive">{errors.deadline}</p>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="w-full sm:w-auto min-h-[44px]">
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto min-h-[44px]">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {goal ? 'Salvar Alterações' : 'Criar Meta'}
        </Button>
      </div>
    </form>
  );
}

