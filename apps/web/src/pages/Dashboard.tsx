import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { analyticsService } from '@/services/analytics.service';
import { TrendingUp, TrendingDown, Wallet, Target, ArrowRight } from 'lucide-react';
import { typography } from '@/lib/typography';

export function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: analyticsService.getDashboard,
  });

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(value));
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p>Carregando dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-destructive">Erro ao carregar dashboard</p>
        </div>
      </AppLayout>
    );
  }

  const monthlyBalance = parseFloat(data?.monthly.balance || '0');

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
          {/* Header */}
          <div>
            <h1 className={typography.h1}>Dashboard</h1>
            <p className={`hidden md:block ${typography.subtitle}`}>
              Visão geral das suas finanças
            </p>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Saldo Total */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={typography.label}>Saldo Total</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={typography.currencyMedium}>{formatCurrency(data?.balance.total || '0')}</div>
                <p className={`${typography.caption} mt-1`}>
                  {data?.balance.byAccount.length || 0} conta(s)
                </p>
              </CardContent>
            </Card>

            {/* Receitas do Mês */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={typography.label}>Receitas do Mês</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className={`${typography.currencyMedium} text-green-600`}>
                  {formatCurrency(data?.monthly.income || '0')}
                </div>
                <p className={`${typography.caption} mt-1`}>
                  Mês atual
                </p>
              </CardContent>
            </Card>

            {/* Despesas do Mês */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={typography.label}>Despesas do Mês</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className={`${typography.currencyMedium} text-red-600`}>
                  {formatCurrency(data?.monthly.expenses || '0')}
                </div>
                <p className={`${typography.caption} mt-1`}>
                  Mês atual
                </p>
              </CardContent>
            </Card>

            {/* Saldo do Mês */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={typography.label}>Saldo do Mês</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={`${typography.currencyMedium} ${
                    monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(data?.monthly.balance || '0')}
                </div>
                <p className={`${typography.caption} mt-1`}>
                  {monthlyBalance >= 0 ? 'Positivo' : 'Negativo'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Metas */}
          {data?.goals && data.goals.length > 0 && (
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/goals')}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Metas
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate('/goals'); }}>
                    Ver todas
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.goals.slice(0, 3).map((goal) => (
                    <div key={goal.id} className="hover:bg-muted/50 p-2 rounded transition-colors">
                      <div className={`flex justify-between ${typography.bodySmall} mb-1`}>
                        <span className="font-medium">{goal.name}</span>
                        <span>
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            goal.progress >= 100 ? 'bg-green-500' : 'bg-primary'
                          }`}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {data.goals.length > 3 && (
                    <p className={`${typography.bodySmall} text-muted-foreground text-center pt-2`}>
                      +{data.goals.length - 3} {data.goals.length - 3 === 1 ? 'meta' : 'metas'} restantes
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transações Recentes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {data?.recentTransactions && data.recentTransactions.length > 0 ? (
                  <div className="space-y-2 md:space-y-3">
                    {data.recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-start justify-between p-3 rounded-lg border gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${typography.body} truncate`}>{transaction.description}</p>
                          <div className={`flex flex-wrap items-center gap-1.5 md:gap-2 ${typography.bodySmall} text-muted-foreground mt-1`}>
                            <span>{format(new Date(transaction.date), 'dd/MM/yyyy')}</span>
                            <span>•</span>
                            <span
                              className="px-2 py-0.5 rounded text-xs"
                              style={{
                                backgroundColor: `${transaction.category.color}20`,
                                color: transaction.category.color,
                              }}
                            >
                              {transaction.category.name}
                            </span>
                            <span>•</span>
                            <span className="truncate">{transaction.account.name}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`font-bold ${typography.body} text-red-600`}>
                            -{formatCurrency(transaction.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma despesa ainda. Importe um CSV para começar!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Top Categorias */}
            <Card>
              <CardHeader>
                <CardTitle>Top Categorias (Mês Atual)</CardTitle>
              </CardHeader>
              <CardContent>
                {data?.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
                  <div className="space-y-3">
                    {data.categoryBreakdown.slice(0, 5).map((category) => (
                      <div key={category.categoryId}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{category.categoryName}</span>
                          <span className="font-medium">
                            {formatCurrency(category.amount)} ({category.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              category.type === 'INCOME' ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${category.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma transação no mês atual
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
