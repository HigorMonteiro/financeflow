import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyticsService } from '@/services/analytics.service';
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';

export function Dashboard() {
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

  const balance = parseFloat(data?.balance.total || '0');
  const monthlyIncome = parseFloat(data?.monthly.income || '0');
  const monthlyExpenses = parseFloat(data?.monthly.expenses || '0');
  const monthlyBalance = parseFloat(data?.monthly.balance || '0');

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral das suas finanças
            </p>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Saldo Total */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data?.balance.total || '0')}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data?.balance.byAccount.length || 0} conta(s)
                </p>
              </CardContent>
            </Card>

            {/* Receitas do Mês */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(data?.monthly.income || '0')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Mês atual
                </p>
              </CardContent>
            </Card>

            {/* Despesas do Mês */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(data?.monthly.expenses || '0')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Mês atual
                </p>
              </CardContent>
            </Card>

            {/* Saldo do Mês */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(data?.monthly.balance || '0')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {monthlyBalance >= 0 ? 'Positivo' : 'Negativo'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Metas */}
          {data?.goals && data.goals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Metas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.goals.map((goal) => (
                    <div key={goal.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{goal.name}</span>
                        <span>
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transações Recentes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {data?.recentTransactions && data.recentTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {data.recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{transaction.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              transaction.type === 'INCOME'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {transaction.type === 'INCOME' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.account.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma transação ainda. Importe um CSV para começar!
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
