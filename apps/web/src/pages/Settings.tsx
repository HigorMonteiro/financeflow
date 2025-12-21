import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserSettings } from '@/components/Settings/UserSettings';
import { CategorySettings } from '@/components/Settings/CategorySettings';
import { IncomeSettings } from '@/components/Settings/IncomeSettings';
import { SavingsSettings } from '@/components/Settings/SavingsSettings';
import { CardsSettings } from '@/components/Settings/CardsSettings';
import { User, FolderTree, DollarSign, PiggyBank, CreditCard } from 'lucide-react';

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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="user" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Usuário</span>
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
            </TabsList>

            <TabsContent value="user" className="mt-6">
              <UserSettings />
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
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
