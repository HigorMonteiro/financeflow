import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CashFlowData } from '@/services/analytics.service';
import { format } from 'date-fns';

interface CashFlowChartProps {
  data: CashFlowData[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const formattedData = data.map((item) => {
    const [year, month] = item.month.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return {
      ...item,
      month: format(date, 'MMM/yyyy'),
      income: parseFloat(item.income),
      expenses: parseFloat(item.expenses),
      balance: parseFloat(item.balance),
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de Caixa</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(value)
              }
            />
            <Legend />
            <Bar dataKey="income" fill="#10B981" name="Receitas" />
            <Bar dataKey="expenses" fill="#EF4444" name="Despesas" />
            <Bar dataKey="balance" fill="#3B82F6" name="Saldo" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

