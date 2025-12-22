import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendsChart } from '@/components/Analytics/TrendsChart';
import { CashFlowChart } from '@/components/Analytics/CashFlowChart';
import { CategoryPieChart } from '@/components/Analytics/CategoryPieChart';
import { PeriodComparison } from '@/components/Analytics/PeriodComparison';
import { AnalyticsFilters } from '@/components/Analytics/AnalyticsFilters';
import { analyticsService } from '@/services/analytics.service';
import { format, subMonths, subDays } from 'date-fns';
import { Calendar, TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { typography } from '@/lib/typography';

export function Analytics() {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [trendPeriod, setTrendPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [months, setMonths] = useState(6);
  const [categoryType, setCategoryType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');

  const endDate = new Date();
  const startDate = subMonths(endDate, months);

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['analytics', 'trends', format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'), trendPeriod],
    queryFn: () =>
      analyticsService.getTrends(
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd'),
        trendPeriod
      ),
  });

  const { data: cashFlow, isLoading: cashFlowLoading } = useQuery({
    queryKey: ['analytics', 'cash-flow', months],
    queryFn: () => analyticsService.getCashFlow(months),
  });

  const { data: categoryAnalysis, isLoading: categoryLoading } = useQuery({
    queryKey: [
      'analytics',
      'category-analysis',
      format(startDate, 'yyyy-MM-dd'),
      format(endDate, 'yyyy-MM-dd'),
      categoryType,
    ],
    queryFn: () =>
      analyticsService.getCategoryAnalysis(
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd'),
        categoryType
      ),
  });

  const { data: periodComparison, isLoading: comparisonLoading } = useQuery({
    queryKey: ['analytics', 'period-comparison', period],
    queryFn: () => analyticsService.getPeriodComparison(period),
  });

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-xl md:text-3xl font-bold">Análises Detalhadas</h1>
              <p className="hidden md:block text-sm md:text-base text-muted-foreground">
                Visualize tendências, fluxo de caixa e análises por categoria
              </p>
            </div>
            <AnalyticsFilters
              period={period}
              trendPeriod={trendPeriod}
              months={months}
              categoryType={categoryType}
              onPeriodChange={setPeriod}
              onTrendPeriodChange={setTrendPeriod}
              onMonthsChange={setMonths}
              onCategoryTypeChange={setCategoryType}
            />
          </div>

          {/* Comparação de Períodos */}
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            <div className="hidden md:flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
              <span className={typography.label}>Período de comparação:</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={period === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod('month')}
                  className="min-h-[44px]"
                >
                  Mensal
                </Button>
                <Button
                  variant={period === 'quarter' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod('quarter')}
                  className="min-h-[44px]"
                >
                  Trimestral
                </Button>
                <Button
                  variant={period === 'year' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod('year')}
                  className="min-h-[44px]"
                >
                  Anual
                </Button>
              </div>
            </div>
            {comparisonLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">Carregando...</div>
                </CardContent>
              </Card>
            ) : periodComparison ? (
              <PeriodComparison data={periodComparison} period={period} />
            ) : null}
          </div>

          {/* Tendências */}
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <h2 className={typography.h2}>Tendências</h2>
              </div>
              <div className="hidden md:flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <span className={typography.label}>Agrupamento:</span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={trendPeriod === 'day' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTrendPeriod('day')}
                    className="min-h-[44px]"
                  >
                    Diário
                  </Button>
                  <Button
                    variant={trendPeriod === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTrendPeriod('week')}
                    className="min-h-[44px]"
                  >
                    Semanal
                  </Button>
                  <Button
                    variant={trendPeriod === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTrendPeriod('month')}
                    className="min-h-[44px]"
                  >
                    Mensal
                  </Button>
                </div>
              </div>
            </div>
            {trendsLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">Carregando...</div>
                </CardContent>
              </Card>
            ) : trends && trends.length > 0 ? (
              <TrendsChart data={trends} />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    Nenhum dado disponível para o período selecionado
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Fluxo de Caixa */}
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <h2 className={typography.h2}>Fluxo de Caixa</h2>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <span className={typography.label}>Período:</span>
                <Button
                  variant={months === 3 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMonths(3)}
                  className="min-h-[44px]"
                >
                  3 meses
                </Button>
                <Button
                  variant={months === 6 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMonths(6)}
                  className="min-h-[44px]"
                >
                  6 meses
                </Button>
                <Button
                  variant={months === 12 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMonths(12)}
                  className="min-h-[44px]"
                >
                  12 meses
                </Button>
              </div>
            </div>
            {cashFlowLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">Carregando...</div>
                </CardContent>
              </Card>
            ) : cashFlow && cashFlow.length > 0 ? (
              <CashFlowChart data={cashFlow} />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    Nenhum dado disponível para o período selecionado
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Análise por Categoria */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  <h2 className={typography.h2}>Análise por Categoria</h2>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    variant={categoryType === 'EXPENSE' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryType('EXPENSE')}
                    className="min-h-[44px]"
                  >
                    Despesas
                  </Button>
                  <Button
                    variant={categoryType === 'INCOME' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryType('INCOME')}
                    className="min-h-[44px]"
                  >
                    Receitas
                  </Button>
                </div>
              </div>
              {categoryLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">Carregando...</div>
                  </CardContent>
                </Card>
              ) : categoryAnalysis && categoryAnalysis.length > 0 ? (
                <CategoryPieChart
                  data={categoryAnalysis}
                  title={`${categoryType === 'EXPENSE' ? 'Despesas' : 'Receitas'} por Categoria`}
                />
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                      Nenhum dado disponível para o período selecionado
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
