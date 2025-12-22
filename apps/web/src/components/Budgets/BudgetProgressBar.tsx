interface BudgetProgressBarProps {
  progress: number;
  spent: string;
  amount: string;
}

const formatCurrency = (value: string) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(parseFloat(value));
};

export function BudgetProgressBar({ progress, spent, amount }: BudgetProgressBarProps) {
  const isOverBudget = progress > 100;
  const isNearLimit = progress >= 80 && progress <= 100;
  const isSafe = progress < 80;

  const getColor = () => {
    if (isOverBudget) return 'bg-red-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getBgColor = () => {
    if (isOverBudget) return 'bg-red-100 dark:bg-red-950';
    if (isNearLimit) return 'bg-yellow-100 dark:bg-yellow-950';
    return 'bg-green-100 dark:bg-green-950';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          Gasto: <span className="font-medium text-foreground">{formatCurrency(spent)}</span>
        </span>
        <span className="text-muted-foreground">
          Orçamento: <span className="font-medium text-foreground">{formatCurrency(amount)}</span>
        </span>
      </div>
      <div className={`w-full rounded-full h-3 overflow-hidden ${getBgColor()}`}>
        <div
          className={`h-full rounded-full transition-all ${getColor()}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{Math.round(progress)}% utilizado</span>
        {progress > 100 && (
          <span className="text-red-600 font-medium">
            Excedido em {formatCurrency((parseFloat(spent) - parseFloat(amount)).toString())}
          </span>
        )}
      </div>
    </div>
  );
}

