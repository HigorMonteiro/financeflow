import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Filter, X, Calendar, Search, Tag, Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

export interface FilterValues {
  search: string;
  type: 'all' | 'INCOME' | 'EXPENSE';
  categoryId: string;
  accountId: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  month: string; // Formato: YYYY-MM
  year: string; // Formato: YYYY
}

interface TransactionFiltersProps {
  categories: Array<{ id: string; name: string; color: string; icon?: string }>;
  accounts: Array<{ id: string; name: string }>;
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  onReset: () => void;
  isLoadingCategories?: boolean;
  isLoadingAccounts?: boolean;
  categoriesError?: Error | null;
  accountsError?: Error | null;
}

export function TransactionFilters({
  categories,
  accounts,
  filters,
  onFiltersChange,
  onReset,
  isLoadingCategories = false,
  isLoadingAccounts = false,
  categoriesError,
  accountsError,
}: TransactionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const activeFilters = useMemo(() => {
    const active: Array<{ key: keyof FilterValues; label: string; icon: React.ReactNode }> = [];
    
    if (filters.search) {
      active.push({
        key: 'search',
        label: `Busca: "${filters.search}"`,
        icon: <Search className="h-3 w-3" />,
      });
    }
    
    if (filters.type !== 'all') {
      active.push({
        key: 'type',
        label: filters.type === 'INCOME' ? 'Receitas' : 'Despesas',
        icon: filters.type === 'INCOME' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />,
      });
    }
    
    if (filters.categoryId) {
      const category = categories.find((c) => c.id === filters.categoryId);
      if (category) {
        active.push({
          key: 'categoryId',
          label: category.name,
          icon: <Tag className="h-3 w-3" />,
        });
      }
    }
    
    if (filters.accountId) {
      const account = accounts.find((a) => a.id === filters.accountId);
      if (account) {
        active.push({
          key: 'accountId',
          label: account.name,
          icon: <Wallet className="h-3 w-3" />,
        });
      }
    }
    
    if (filters.month && filters.year) {
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      const monthIndex = parseInt(filters.month) - 1;
      active.push({
        key: 'month',
        label: `${monthNames[monthIndex]} ${filters.year}`,
        icon: <Calendar className="h-3 w-3" />,
      });
    } else if (filters.month) {
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      const monthIndex = parseInt(filters.month) - 1;
      active.push({
        key: 'month',
        label: monthNames[monthIndex],
        icon: <Calendar className="h-3 w-3" />,
      });
    } else if (filters.year) {
      active.push({
        key: 'year',
        label: `Ano: ${filters.year}`,
        icon: <Calendar className="h-3 w-3" />,
      });
    }
    
    if (filters.startDate && filters.endDate) {
      const start = format(new Date(filters.startDate), "dd 'de' MMM", { locale: ptBR });
      const end = format(new Date(filters.endDate), "dd 'de' MMM 'de' yyyy", { locale: ptBR });
      active.push({
        key: 'startDate',
        label: `${start} - ${end}`,
        icon: <Calendar className="h-3 w-3" />,
      });
    } else if (filters.startDate) {
      const start = format(new Date(filters.startDate), "dd 'de' MMM 'de' yyyy", { locale: ptBR });
      active.push({
        key: 'startDate',
        label: `A partir de ${start}`,
        icon: <Calendar className="h-3 w-3" />,
      });
    } else if (filters.endDate) {
      const end = format(new Date(filters.endDate), "dd 'de' MMM 'de' yyyy", { locale: ptBR });
      active.push({
        key: 'endDate',
        label: `Até ${end}`,
        icon: <Calendar className="h-3 w-3" />,
      });
    }
    
    if (filters.minAmount) {
      const amount = parseFloat(filters.minAmount).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
      active.push({
        key: 'minAmount',
        label: `Mín: ${amount}`,
        icon: <DollarSign className="h-3 w-3" />,
      });
    }
    
    if (filters.maxAmount) {
      const amount = parseFloat(filters.maxAmount).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
      active.push({
        key: 'maxAmount',
        label: `Máx: ${amount}`,
        icon: <DollarSign className="h-3 w-3" />,
      });
    }
    
    return active;
  }, [filters, categories, accounts]);
  
  const hasActiveFilters = activeFilters.length > 0;
  
  const removeFilter = (key: keyof FilterValues) => {
    const newFilters = { ...filters };
    
    if (key === 'type') {
      newFilters[key] = 'all' as any;
    } else if (key === 'month') {
      newFilters.month = '';
      newFilters.year = '';
    } else if (key === 'year') {
      newFilters.year = '';
    } else if (key === 'startDate') {
      newFilters.startDate = '';
      newFilters.endDate = '';
    } else {
      newFilters[key] = '' as any;
    }
    
    onFiltersChange(newFilters);
  };

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value };
    
    // Se selecionar mês/ano, limpar datas específicas
    if (key === 'month' || key === 'year') {
      newFilters.startDate = '';
      newFilters.endDate = '';
    }
    
    // Se selecionar data inicial ou final, limpar mês/ano
    if (key === 'startDate' || key === 'endDate') {
      if (value) {
        newFilters.month = '';
        newFilters.year = '';
      }
    }
    
    onFiltersChange(newFilters);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                {activeFilters.length} {activeFilters.length === 1 ? 'ativo' : 'ativos'}
              </span>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onReset}>
                <X className="h-4 w-4 mr-1" />
                Limpar todos
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {/* Filtros Ativos */}
      {hasActiveFilters && (
        <CardContent className="pt-0 pb-4 border-b">
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <Toggle
                key={filter.key}
                pressed={true}
                onPressedChange={(pressed: boolean) => {
                  if (!pressed) {
                    removeFilter(filter.key);
                  }
                }}
                variant="outline"
                size="sm"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary hover:bg-primary/90"
                aria-label={`Remover filtro: ${filter.label}`}
              >
                <span className="flex items-center gap-1.5">
                  {filter.icon}
                  <span>{filter.label}</span>
                  <X className="h-3 w-3 ml-1" />
                </span>
              </Toggle>
            ))}
          </div>
        </CardContent>
      )}

      {isOpen && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Busca */}
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Descrição, categoria ou conta..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="INCOME">Receitas</SelectItem>
                  <SelectItem value="EXPENSE">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={filters.categoryId || '__all__'}
                onValueChange={(value) => handleFilterChange('categoryId', value === '__all__' ? '' : value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todas as categorias</SelectItem>
                  {isLoadingCategories ? (
                    <SelectItem value="__loading__" disabled>
                      Carregando categorias...
                    </SelectItem>
                  ) : categoriesError ? (
                    <SelectItem value="__error__" disabled>
                      Erro ao carregar categorias
                    </SelectItem>
                  ) : categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__no_data__" disabled>
                      Nenhuma categoria disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Conta */}
            <div className="space-y-2">
              <Label htmlFor="account">Conta</Label>
              <Select
                value={filters.accountId || '__all__'}
                onValueChange={(value) => handleFilterChange('accountId', value === '__all__' ? '' : value)}
              >
                <SelectTrigger id="account">
                  <SelectValue placeholder="Todas as contas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todas as contas</SelectItem>
                  {isLoadingAccounts ? (
                    <SelectItem value="__loading__" disabled>
                      Carregando contas...
                    </SelectItem>
                  ) : accountsError ? (
                    <SelectItem value="__error__" disabled>
                      Erro ao carregar contas
                    </SelectItem>
                  ) : accounts && accounts.length > 0 ? (
                    accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__no_data__" disabled>
                      Nenhuma conta disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Mês/Ano */}
            <div className="space-y-2">
              <Label htmlFor="month" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Mês/Ano
              </Label>
              <div className="flex gap-2">
                <Select
                  value={filters.month || '__all__'}
                  onValueChange={(value) => handleFilterChange('month', value === '__all__' ? '' : value)}
                >
                  <SelectTrigger id="month" className="flex-1">
                    <SelectValue placeholder="Todos os meses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Todos os meses</SelectItem>
                    <SelectItem value="01">Janeiro</SelectItem>
                    <SelectItem value="02">Fevereiro</SelectItem>
                    <SelectItem value="03">Março</SelectItem>
                    <SelectItem value="04">Abril</SelectItem>
                    <SelectItem value="05">Maio</SelectItem>
                    <SelectItem value="06">Junho</SelectItem>
                    <SelectItem value="07">Julho</SelectItem>
                    <SelectItem value="08">Agosto</SelectItem>
                    <SelectItem value="09">Setembro</SelectItem>
                    <SelectItem value="10">Outubro</SelectItem>
                    <SelectItem value="11">Novembro</SelectItem>
                    <SelectItem value="12">Dezembro</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.year || '__all__'}
                  onValueChange={(value) => handleFilterChange('year', value === '__all__' ? '' : value)}
                >
                  <SelectTrigger id="year" className="flex-1">
                    <SelectValue placeholder="Todos os anos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Todos os anos</SelectItem>
                    {(() => {
                      const currentYear = new Date().getFullYear();
                      const years = [];
                      // Mostrar últimos 5 anos e próximos 2 anos
                      for (let i = currentYear - 5; i <= currentYear + 2; i++) {
                        years.push(
                          <SelectItem key={i} value={i.toString()}>
                            {i}
                          </SelectItem>
                        );
                      }
                      return years;
                    })()}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Data Inicial */}
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data Inicial
              </Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            {/* Data Final */}
            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data Final
              </Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            {/* Valor Mínimo */}
            <div className="space-y-2">
              <Label htmlFor="minAmount">Valor Mínimo</Label>
              <Input
                id="minAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              />
            </div>

            {/* Valor Máximo */}
            <div className="space-y-2">
              <Label htmlFor="maxAmount">Valor Máximo</Label>
              <Input
                id="maxAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

