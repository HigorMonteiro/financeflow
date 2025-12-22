import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileFilters } from '@/components/ui/MobileFilters';
import { Label } from '@/components/ui/label';

interface AnalyticsFiltersProps {
  period: 'month' | 'quarter' | 'year';
  trendPeriod: 'day' | 'week' | 'month';
  months: number;
  categoryType: 'INCOME' | 'EXPENSE';
  onPeriodChange: (period: 'month' | 'quarter' | 'year') => void;
  onTrendPeriodChange: (period: 'day' | 'week' | 'month') => void;
  onMonthsChange: (months: number) => void;
  onCategoryTypeChange: (type: 'INCOME' | 'EXPENSE') => void;
}

function AnalyticsFiltersContent({
  period,
  trendPeriod,
  months,
  categoryType,
  onPeriodChange,
  onTrendPeriodChange,
  onMonthsChange,
  onCategoryTypeChange,
}: AnalyticsFiltersProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Período de Comparação</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={period === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPeriodChange('month')}
            className="min-h-[44px]"
          >
            Mensal
          </Button>
          <Button
            variant={period === 'quarter' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPeriodChange('quarter')}
            className="min-h-[44px]"
          >
            Trimestral
          </Button>
          <Button
            variant={period === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPeriodChange('year')}
            className="min-h-[44px]"
          >
            Anual
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Agrupamento de Tendências</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={trendPeriod === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTrendPeriodChange('day')}
            className="min-h-[44px]"
          >
            Diário
          </Button>
          <Button
            variant={trendPeriod === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTrendPeriodChange('week')}
            className="min-h-[44px]"
          >
            Semanal
          </Button>
          <Button
            variant={trendPeriod === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTrendPeriodChange('month')}
            className="min-h-[44px]"
          >
            Mensal
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Período de Fluxo de Caixa</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={months === 3 ? 'default' : 'outline'}
            size="sm"
            onClick={() => onMonthsChange(3)}
            className="min-h-[44px]"
          >
            3 meses
          </Button>
          <Button
            variant={months === 6 ? 'default' : 'outline'}
            size="sm"
            onClick={() => onMonthsChange(6)}
            className="min-h-[44px]"
          >
            6 meses
          </Button>
          <Button
            variant={months === 12 ? 'default' : 'outline'}
            size="sm"
            onClick={() => onMonthsChange(12)}
            className="min-h-[44px]"
          >
            12 meses
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tipo de Categoria</Label>
        <Select value={categoryType} onValueChange={(value) => onCategoryTypeChange(value as 'INCOME' | 'EXPENSE')}>
          <SelectTrigger className="min-h-[44px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Despesas</SelectItem>
            <SelectItem value="INCOME">Receitas</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function AnalyticsFilters(props: AnalyticsFiltersProps) {
  const activeFiltersCount = 
    (props.period !== 'month' ? 1 : 0) +
    (props.trendPeriod !== 'month' ? 1 : 0) +
    (props.months !== 6 ? 1 : 0) +
    (props.categoryType !== 'EXPENSE' ? 1 : 0);

  return (
    <>
      {/* Mobile: Botão minimalista */}
      <MobileFilters
        activeFiltersCount={activeFiltersCount}
        title="Filtros de Análises"
        className="md:hidden"
      >
        <AnalyticsFiltersContent {...props} />
      </MobileFilters>

      {/* Desktop: Filtros completos - mantém o layout atual */}
    </>
  );
}

