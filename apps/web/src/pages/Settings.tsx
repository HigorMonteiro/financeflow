import { AppLayout } from '@/components/Layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserSettings } from '@/components/Settings/UserSettings';
import { CategorySettings } from '@/components/Settings/CategorySettings';
import { IncomeSettings } from '@/components/Settings/IncomeSettings';
import { SavingsSettings } from '@/components/Settings/SavingsSettings';
import { CardsSettings } from '@/components/Settings/CardsSettings';
import { PaginationSettings } from '@/components/Settings/PaginationSettings';
import { AccountSettings } from '@/components/Settings/AccountSettings';
import { User, FolderTree, DollarSign, PiggyBank, CreditCard, List, Wallet } from 'lucide-react';
import { typography } from '@/lib/typography';

export function Settings() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4 md:mb-8">
            <h1 className="text-xl md:text-3xl font-bold">Configurações</h1>
            <p className="hidden md:block text-sm md:text-base text-muted-foreground">
              Gerencie suas preferências e configurações
            </p>
          </div>

          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 h-auto overflow-x-auto">
              <TabsTrigger value="user" className="flex flex-col items-center gap-1 min-h-[44px] px-2 py-2">
                <User className="h-4 w-4" />
                <span className="text-xs md:text-sm">Usuário</span>
              </TabsTrigger>
              <TabsTrigger value="accounts" className="flex flex-col items-center gap-1 min-h-[44px] px-2 py-2">
                <Wallet className="h-4 w-4" />
                <span className="text-xs md:text-sm">Contas</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex flex-col items-center gap-1 min-h-[44px] px-2 py-2">
                <FolderTree className="h-4 w-4" />
                <span className="text-xs md:text-sm">Categorias</span>
              </TabsTrigger>
              <TabsTrigger value="income" className="flex flex-col items-center gap-1 min-h-[44px] px-2 py-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs md:text-sm">Receita</span>
              </TabsTrigger>
              <TabsTrigger value="savings" className="flex flex-col items-center gap-1 min-h-[44px] px-2 py-2">
                <PiggyBank className="h-4 w-4" />
                <span className="text-xs md:text-sm">Guardado</span>
              </TabsTrigger>
              <TabsTrigger value="cards" className="flex flex-col items-center gap-1 min-h-[44px] px-2 py-2">
                <CreditCard className="h-4 w-4" />
                <span className="text-xs md:text-sm">Cartões</span>
              </TabsTrigger>
              <TabsTrigger value="pagination" className="flex flex-col items-center gap-1 min-h-[44px] px-2 py-2">
                <List className="h-4 w-4" />
                <span className="text-xs md:text-sm">Paginação</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="user" className="mt-4 md:mt-6">
              <UserSettings />
            </TabsContent>

            <TabsContent value="accounts" className="mt-4 md:mt-6">
              <AccountSettings />
            </TabsContent>

            <TabsContent value="categories" className="mt-4 md:mt-6">
              <CategorySettings />
            </TabsContent>

            <TabsContent value="income" className="mt-4 md:mt-6">
              <IncomeSettings />
            </TabsContent>

            <TabsContent value="savings" className="mt-4 md:mt-6">
              <SavingsSettings />
            </TabsContent>

            <TabsContent value="cards" className="mt-4 md:mt-6">
              <CardsSettings />
            </TabsContent>

            <TabsContent value="pagination" className="mt-4 md:mt-6">
              <PaginationSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
