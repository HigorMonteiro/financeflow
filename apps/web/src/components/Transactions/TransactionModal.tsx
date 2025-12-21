import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TransactionForm } from './TransactionForm';
import { Transaction } from '@/services/transactions.service';
import { Category } from '@/services/categories.service';
import { Account } from '@/services/accounts.service';

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
  categories: Category[];
  accounts: Account[];
  onSubmit: (data: {
    description: string;
    amount: string;
    type: 'INCOME' | 'EXPENSE';
    categoryId: string;
    accountId: string;
    date: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function TransactionModal({
  open,
  onOpenChange,
  transaction,
  categories,
  accounts,
  onSubmit,
  isLoading = false,
}: TransactionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </DialogTitle>
        </DialogHeader>
        <TransactionForm
          transaction={transaction}
          categories={categories}
          accounts={accounts}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

