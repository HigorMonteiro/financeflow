import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryAnalysisData } from '@/services/analytics.service';

interface CategoryPieChartProps {
  data: CategoryAnalysisData[];
  title: string;
}

const COLORS = [
  '#8B5CF6',
  '#F59E0B',
  '#EF4444',
  '#3B82F6',
  '#EC4899',
  '#10B981',
  '#6366F1',
  '#14B8A6',
  '#F97316',
  '#84CC16',
];

export function CategoryPieChart({ data, title }: CategoryPieChartProps) {
  const chartData = data.map((item) => ({
    name: item.categoryName,
    value: parseFloat(item.amount),
    percentage: item.percentage,
    color: item.color,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm font-medium">{formatCurrency(data.value)}</p>
          <p className="text-sm text-muted-foreground">
            {data.payload.percentage.toFixed(1)}% do total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
          {/* Gráfico de Pizza */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Lista de Categorias */}
          <div className="w-full lg:w-1/2 space-y-3">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm truncate">{item.name}</span>
                    <span className="font-semibold text-sm whitespace-nowrap">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color || COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

