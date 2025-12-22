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

export function Settings() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie suas preferências e configurações
            </p>
          </div>

          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="user" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Usuário</span>
              </TabsTrigger>
              <TabsTrigger value="accounts" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Contas</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <FolderTree className="h-4 w-4" />
                <span className="hidden sm:inline">Categorias</span>
              </TabsTrigger>
              <TabsTrigger value="income" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Receita</span>
              </TabsTrigger>
              <TabsTrigger value="savings" className="flex items-center gap-2">
                <PiggyBank className="h-4 w-4" />
                <span className="hidden sm:inline">Guardado</span>
              </TabsTrigger>
              <TabsTrigger value="cards" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Cartões</span>
              </TabsTrigger>
              <TabsTrigger value="pagination" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Paginação</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="user" className="mt-6">
              <UserSettings />
            </TabsContent>

            <TabsContent value="accounts" className="mt-6">
              <AccountSettings />
            </TabsContent>

            <TabsContent value="categories" className="mt-6">
              <CategorySettings />
            </TabsContent>

            <TabsContent value="income" className="mt-6">
              <IncomeSettings />
            </TabsContent>

            <TabsContent value="savings" className="mt-6">
              <SavingsSettings />
            </TabsContent>

            <TabsContent value="cards" className="mt-6">
              <CardsSettings />
            </TabsContent>

            <TabsContent value="pagination" className="mt-6">
              <PaginationSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
