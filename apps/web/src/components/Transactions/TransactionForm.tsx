import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/services/categories.service';
import { Account } from '@/services/accounts.service';
import { Transaction } from '@/services/transactions.service';
import { format } from 'date-fns';

const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.string().min(1, 'Valor é obrigatório').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    'Valor deve ser um número positivo'
  ),
  type: z.enum(['INCOME', 'EXPENSE'], {
    required_error: 'Tipo é obrigatório',
  }),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  accountId: z.string().min(1, 'Conta é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória'),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  transaction?: Transaction;
  categories: Category[];
  accounts: Account[];
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TransactionForm({
  transaction,
  categories,
  accounts,
  onSubmit,
  onCancel,
  isLoading = false,
}: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction
      ? {
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          categoryId: transaction.category.id,
          accountId: transaction.account.id,
          date: format(new Date(transaction.date), 'yyyy-MM-dd'),
        }
      : {
          type: 'EXPENSE',
          date: format(new Date(), 'yyyy-MM-dd'),
        },
  });

  const type = watch('type');

  const filteredCategories = categories.filter((cat) => {
    if (!cat.type) return true;
    return cat.type === type;
  });

  const handleFormSubmit = async (data: TransactionFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Descrição *</Label>
        <Input
          id="description"
          {...register('description')}
          placeholder="Ex: Compra no supermercado"
          className="min-h-[44px]"
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            {...register('amount')}
            placeholder="0.00"
            className="min-h-[44px]"
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo *</Label>
          <Select
            value={watch('type')}
            onValueChange={(value) => setValue('type', value as 'INCOME' | 'EXPENSE')}
          >
            <SelectTrigger id="type" className="min-h-[44px]">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXPENSE">Despesa</SelectItem>
              <SelectItem value="INCOME">Receita</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-red-500">{errors.type.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Categoria *</Label>
          <Select
            value={watch('categoryId')}
            onValueChange={(value) => setValue('categoryId', value)}
          >
            <SelectTrigger id="categoryId" className="min-h-[44px]">
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-sm text-red-500">{errors.categoryId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountId">Conta *</Label>
          <Select
            value={watch('accountId')}
            onValueChange={(value) => setValue('accountId', value)}
          >
            <SelectTrigger id="accountId" className="min-h-[44px]">
              <SelectValue placeholder="Selecione a conta" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.accountId && (
            <p className="text-sm text-red-500">{errors.accountId.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Data *</Label>
        <Input id="date" type="date" {...register('date')} className="min-h-[44px]" />
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="w-full sm:w-auto min-h-[44px]">
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto min-h-[44px]">
          {isLoading ? 'Salvando...' : transaction ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}

