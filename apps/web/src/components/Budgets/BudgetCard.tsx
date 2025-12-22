import { Budget } from '@/services/budgets.service';
import { BudgetProgressBar } from './BudgetProgressBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (budgetId: string) => void;
}

const periodLabels: Record<Budget['period'], string> = {
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensal',
  YEARLY: 'Anual',
};

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(value));
  };

  const isOverBudget = budget.progress && budget.progress > 100;
  const isNearLimit = budget.progress && budget.progress >= 80 && budget.progress <= 100;
  const isSafe = budget.progress && budget.progress < 80;

  const getPeriodEndDate = () => {
    const startDate = new Date(budget.startDate);
    switch (budget.period) {
      case 'WEEKLY':
        startDate.setDate(startDate.getDate() + 7);
        break;
      case 'MONTHLY':
        startDate.setMonth(startDate.getMonth() + 1);
        break;
      case 'YEARLY':
        startDate.setFullYear(startDate.getFullYear() + 1);
        break;
    }
    return startDate;
  };

  return (
    <Card
      className={`${
        isOverBudget
          ? 'border-red-500'
          : isNearLimit
          ? 'border-yellow-500'
          : ''
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: budget.category.color }}
              />
              <span className="text-lg">{budget.category.name}</span>
            </CardTitle>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {formatCurrency(budget.spent || '0')} / {formatCurrency(budget.amount)}
              </span>
              {budget.progress !== undefined && (
                <span
                  className={`font-semibold ${
                    isOverBudget
                      ? 'text-red-600'
                      : isNearLimit
                      ? 'text-yellow-600'
                      : 'text-primary'
                  }`}
                >
                  {Math.round(budget.progress)}%
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(budget)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(budget.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {budget.progress !== undefined && budget.spent && (
          <BudgetProgressBar
            progress={budget.progress}
            spent={budget.spent}
            amount={budget.amount}
          />
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            Período: {periodLabels[budget.period]} - De{' '}
            {format(new Date(budget.startDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} até{' '}
            {format(getPeriodEndDate(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </span>
        </div>

        {budget.remaining && (
          <div className="text-sm">
            <span className="text-muted-foreground">Restante: </span>
            <span
              className={`font-medium ${
                parseFloat(budget.remaining) < 0 ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {formatCurrency(budget.remaining)}
            </span>
          </div>
        )}

        {isOverBudget && (
          <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
            <AlertCircle className="h-4 w-4" />
            <span>Orçamento excedido!</span>
          </div>
        )}

        {isNearLimit && !isOverBudget && (
          <div className="flex items-center gap-2 text-sm text-yellow-600 font-medium">
            <AlertCircle className="h-4 w-4" />
            <span>Atenção: próximo do limite</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

