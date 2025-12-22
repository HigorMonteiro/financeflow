import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { getIcon } from '@/lib/icons';
import { Transaction } from './TransactionTable';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transactionId: string) => void;
}

export function TransactionCard({ transaction, onEdit, onDelete }: TransactionCardProps) {
  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(value));
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy');
    } catch {
      return dateStr;
    }
  };

  const IconComponent = transaction.category.icon
    ? getIcon(transaction.category.icon)
    : null;

  const isIncome = transaction.type === 'INCOME';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Left side - Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              {/* Category Icon */}
              {IconComponent && (
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: `${transaction.category.color}20`,
                    color: transaction.category.color,
                  }}
                >
                  <IconComponent className="h-5 w-5" />
                </div>
              )}

              {/* Transaction Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm md:text-base truncate">
                  {transaction.description}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(transaction.date)}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${transaction.category.color}20`,
                      color: transaction.category.color,
                    }}
                  >
                    {transaction.category.name}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {transaction.account.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Amount and Actions */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div
              className={`text-lg font-bold ${
                isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isIncome ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </div>

            {/* Actions */}
            {(onEdit || onDelete) && (
              <div className="flex gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(transaction)}
                    aria-label="Editar transação"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(transaction.id)}
                    aria-label="Excluir transação"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

