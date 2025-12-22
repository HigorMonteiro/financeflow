import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BudgetPeriod } from '@/services/budgets.service';

export type FilterStatus = 'all' | 'safe' | 'nearLimit' | 'overBudget';
export type SortOption = 'period' | 'progress' | 'amount' | 'created';

interface BudgetFiltersProps {
  status: FilterStatus;
  sortBy: SortOption;
  period?: BudgetPeriod | 'all';
  onStatusChange: (status: FilterStatus) => void;
  onSortChange: (sort: SortOption) => void;
  onPeriodChange?: (period: BudgetPeriod | 'all') => void;
}

export function BudgetFilters({
  status,
  sortBy,
  period = 'all',
  onStatusChange,
  onSortChange,
  onPeriodChange,
}: BudgetFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Status:</span>
        <Button
          variant={status === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange('all')}
        >
          Todos
        </Button>
        <Button
          variant={status === 'safe' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange('safe')}
        >
          Dentro do Orçamento
        </Button>
        <Button
          variant={status === 'nearLimit' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange('nearLimit')}
        >
          Próximo do Limite
        </Button>
        <Button
          variant={status === 'overBudget' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange('overBudget')}
        >
          Excedido
        </Button>
      </div>

      {onPeriodChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Período:</span>
          <Select value={period} onValueChange={(value) => onPeriodChange(value as BudgetPeriod | 'all')}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="WEEKLY">Semanal</SelectItem>
              <SelectItem value="MONTHLY">Mensal</SelectItem>
              <SelectItem value="YEARLY">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Ordenar por:</span>
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="period">Período</SelectItem>
            <SelectItem value="progress">Progresso</SelectItem>
            <SelectItem value="amount">Valor</SelectItem>
            <SelectItem value="created">Data de Criação</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

