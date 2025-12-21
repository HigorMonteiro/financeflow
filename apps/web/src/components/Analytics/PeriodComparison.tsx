import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PeriodComparisonData } from '@/services/analytics.service';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PeriodComparisonProps {
  data: PeriodComparisonData;
  period: 'month' | 'quarter' | 'year';
}

export function PeriodComparison({ data, period }: PeriodComparisonProps) {
  const periodLabels = {
    month: 'Mensal',
    quarter: 'Trimestral',
    year: 'Anual',
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(value));
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getChangeColor = (change: number, isExpense: boolean = false) => {
    if (change === 0) return 'text-gray-500';
    if (isExpense) {
      return change < 0 ? 'text-green-500' : 'text-red-500';
    }
    return change > 0 ? 'text-green-500' : 'text-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparação {periodLabels[period]}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Receitas</h3>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{formatCurrency(data.current.income)}</p>
              <p className="text-sm text-muted-foreground">
                Período anterior: {formatCurrency(data.previous.income)}
              </p>
              <div className={`flex items-center gap-1 ${getChangeColor(data.changes.income)}`}>
                {getChangeIcon(data.changes.income)}
                <span className="text-sm font-medium">{formatChange(data.changes.income)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Despesas</h3>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{formatCurrency(data.current.expenses)}</p>
              <p className="text-sm text-muted-foreground">
                Período anterior: {formatCurrency(data.previous.expenses)}
              </p>
              <div
                className={`flex items-center gap-1 ${getChangeColor(data.changes.expenses, true)}`}
              >
                {getChangeIcon(data.changes.expenses)}
                <span className="text-sm font-medium">{formatChange(data.changes.expenses)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Saldo</h3>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{formatCurrency(data.current.balance)}</p>
              <p className="text-sm text-muted-foreground">
                Período anterior: {formatCurrency(data.previous.balance)}
              </p>
              <div className={`flex items-center gap-1 ${getChangeColor(data.changes.balance)}`}>
                {getChangeIcon(data.changes.balance)}
                <span className="text-sm font-medium">{formatChange(data.changes.balance)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

