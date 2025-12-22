import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MobileFilters } from '@/components/ui/MobileFilters';
import { DesktopFiltersSidebar } from '@/components/ui/DesktopFiltersSidebar';
import { Label } from '@/components/ui/label';
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

function BudgetFiltersContent({
  status,
  sortBy,
  period = 'all',
  onStatusChange,
  onSortChange,
  onPeriodChange,
}: BudgetFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Status</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={status === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange('all')}
            className="min-h-[44px]"
          >
            Todos
          </Button>
          <Button
            variant={status === 'safe' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange('safe')}
            className="min-h-[44px]"
          >
            Dentro do Orçamento
          </Button>
          <Button
            variant={status === 'nearLimit' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange('nearLimit')}
            className="min-h-[44px]"
          >
            Próximo do Limite
          </Button>
          <Button
            variant={status === 'overBudget' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange('overBudget')}
            className="min-h-[44px]"
          >
            Excedido
          </Button>
        </div>
      </div>

      {onPeriodChange && (
        <div className="space-y-2">
          <Label>Período</Label>
          <Select value={period} onValueChange={(value) => onPeriodChange(value as BudgetPeriod | 'all')}>
            <SelectTrigger className="min-h-[44px]">
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

      <div className="space-y-2">
        <Label>Ordenar por</Label>
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="min-h-[44px]">
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

export function BudgetFilters(props: BudgetFiltersProps) {
  const activeFiltersCount =
    (props.status !== 'all' ? 1 : 0) + (props.period && props.period !== 'all' ? 1 : 0);

  return (
    <>
      {/* Mobile: Botão minimalista */}
      <MobileFilters
        activeFiltersCount={activeFiltersCount}
        title="Filtros de Orçamentos"
        className="md:hidden"
      >
        <BudgetFiltersContent {...props} />
      </MobileFilters>

      {/* Desktop: Sidebar lateral */}
      <DesktopFiltersSidebar
        activeFiltersCount={activeFiltersCount}
        title="Filtros de Orçamentos"
        className="hidden md:flex"
      >
        <BudgetFiltersContent {...props} />
      </DesktopFiltersSidebar>
    </>
  );
}

