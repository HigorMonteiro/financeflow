import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown, Download, Upload, Edit, Trash2 } from 'lucide-react';
import { getIcon } from '@/lib/icons';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  type: 'INCOME' | 'EXPENSE';
  category: {
    id: string;
    name: string;
    color: string;
    icon?: string;
  };
  account: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  categories: Category[];
  onCategoryChange?: (transactionId: string, categoryId: string) => void;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transactionId: string) => void;
  onImport?: () => void;
  onExport?: () => void;
}

export function TransactionTable({ 
  transactions, 
  categories,
  onCategoryChange,
  onEdit,
  onDelete,
  onImport, 
  onExport 
}: TransactionTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof Transaction | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // Debug: Log categorias quando componente monta ou categorias mudam
  useEffect(() => {
    if (categories && categories.length > 0) {
      console.log('TransactionTable - Categorias disponíveis:', categories.length, categories.map(c => c.name));
    } else {
      console.warn('TransactionTable - Nenhuma categoria disponível!');
    }
  }, [categories]);

  // As transações já vêm filtradas da página, então só ordenamos aqui
  const filteredTransactions = transactions
    .sort((a, b) => {
      if (!sortColumn) return 0;

      let aValue: any = a[sortColumn];
      let bValue: any = b[sortColumn];

      if (sortColumn === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortColumn === 'amount') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (column: keyof Transaction) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

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

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const balance = totalIncome - totalExpense;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Transações</CardTitle>
          <div className="flex gap-2">
            {onImport && (
              <Button onClick={onImport} variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Importar CSV
              </Button>
            )}
            {onExport && (
              <Button onClick={onExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>

        {/* Totais */}
        <div className="mb-4 grid grid-cols-3 gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Receitas</div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalIncome.toFixed(2))}
            </div>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Despesas</div>
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalExpense.toFixed(2))}
            </div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="text-sm text-muted-foreground">Saldo</div>
            <div
              className={`text-lg font-bold ${
                balance >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatCurrency(balance.toFixed(2))}
            </div>
          </div>
        </div>

        {/* Tabela estilo Planilha */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th
                    className="border p-2 text-left cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-2">
                      Data
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th
                    className="border p-2 text-left cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center gap-2">
                      Descrição
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="border p-2 text-left">Categoria</th>
                  <th className="border p-2 text-left">Conta</th>
                  <th
                    className="border p-2 text-right cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Valor
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="border p-2 text-center">Tipo</th>
                  <th className="border p-2 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="border p-8 text-center text-muted-foreground">
                      Nenhuma transação encontrada
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="border p-2">{formatDate(transaction.date)}</td>
                      <td className="border p-2">{transaction.description}</td>
                      <td className="border p-2">
                        {editingCategoryId === transaction.id ? (
                          <Select
                            value={transaction.category.id}
                            onValueChange={(newCategoryId) => {
                              if (onCategoryChange && newCategoryId !== transaction.category.id) {
                                onCategoryChange(transaction.id, newCategoryId);
                              }
                              setEditingCategoryId(null);
                            }}
                            onOpenChange={(open) => {
                              if (!open) {
                                setEditingCategoryId(null);
                              }
                            }}
                            autoFocus
                          >
                            <SelectTrigger className="h-7 text-xs min-w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent 
                              className="max-h-[300px] overflow-y-auto z-[100]"
                              position="popper"
                              sideOffset={5}
                            >
                              {categories && categories.length > 0 ? (
                                <>
                                  {categories.map((category) => (
                                    <SelectItem 
                                      key={`category-${category.id}`}
                                      value={category.id}
                                      className="cursor-pointer"
                                    >
                                      <span className="inline-flex items-center gap-1.5">
                                        {category.icon && (() => {
                                          const IconComponent = getIcon(category.icon);
                                          return IconComponent ? <IconComponent className="h-3 w-3" /> : null;
                                        })()}
                                        <span>{category.name}</span>
                                      </span>
                                    </SelectItem>
                                  ))}
                                </>
                              ) : (
                                <SelectItem value="__no_categories__" disabled>
                                  Nenhuma categoria disponível
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 hover:ring-1 hover:ring-offset-1 transition-all"
                            style={{
                              backgroundColor: `${transaction.category.color}20`,
                              color: transaction.category.color,
                            }}
                            onClick={() => setEditingCategoryId(transaction.id)}
                            title="Clique para editar a categoria"
                          >
                            {transaction.category.icon && (() => {
                              const IconComponent = getIcon(transaction.category.icon);
                              return IconComponent ? <IconComponent className="h-3 w-3" /> : null;
                            })()}
                            {transaction.category.name}
                          </span>
                        )}
                      </td>
                      <td className="border p-2">{transaction.account.name}</td>
                      <td
                        className={`border p-2 text-right font-medium ${
                          transaction.type === 'INCOME'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {transaction.type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="border p-2 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            transaction.type === 'INCOME'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}
                        >
                          {transaction.type === 'INCOME' ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td className="border p-2">
                        <div className="flex items-center justify-center gap-2">
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(transaction)}
                              className="h-8 w-8 p-0"
                              title="Editar transação"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm('Tem certeza que deseja excluir esta transação?')) {
                                  onDelete(transaction.id);
                                }
                              }}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              title="Excluir transação"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Mostrando {filteredTransactions.length} de {transactions.length} transações
        </div>
      </CardContent>
    </Card>
  );
}

