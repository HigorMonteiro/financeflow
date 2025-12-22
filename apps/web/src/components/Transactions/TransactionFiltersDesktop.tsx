import { DesktopFiltersSidebar } from '@/components/ui/DesktopFiltersSidebar';
import { TransactionFilters, FilterValues } from './TransactionFilters';

interface TransactionFiltersDesktopProps {
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

export function TransactionFiltersDesktop({
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
}: TransactionFiltersDesktopProps) {
  return (
    <DesktopFiltersSidebar
      activeFiltersCount={activeFiltersCount}
      title="Filtros de Transações"
      className="hidden md:flex"
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
    </DesktopFiltersSidebar>
  );
}

