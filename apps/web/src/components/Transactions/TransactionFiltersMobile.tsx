import { Button } from '@/components/ui/button';
import { MobileFilters } from '@/components/ui/MobileFilters';
import { TransactionFilters, FilterValues } from './TransactionFilters';

interface TransactionFiltersMobileProps {
  categories: Array<{ id: string; name: string; color: string; icon?: string }>;
  accounts: Array<{ id: string; name: string }>;
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  onReset: () => void;
  isLoadingCategories?: boolean;
  isLoadingAccounts?: boolean;
  categoriesError?: Error | null;
  accountsError?: Error | null;
  activeFiltersCount: number;
}

export function TransactionFiltersMobile({
  categories,
  accounts,
  filters,
  onFiltersChange,
  onReset,
  isLoadingCategories = false,
  isLoadingAccounts = false,
  categoriesError,
  accountsError,
  activeFiltersCount,
}: TransactionFiltersMobileProps) {
  return (
    <MobileFilters
      activeFiltersCount={activeFiltersCount}
      title="Filtros de Transações"
      className="md:hidden"
    >
      <TransactionFilters
        categories={categories}
        accounts={accounts}
        filters={filters}
        onFiltersChange={onFiltersChange}
        onReset={onReset}
        isLoadingCategories={isLoadingCategories}
        isLoadingAccounts={isLoadingAccounts}
        categoriesError={categoriesError}
        accountsError={accountsError}
        isMobile={true}
      />
    </MobileFilters>
  );
}

