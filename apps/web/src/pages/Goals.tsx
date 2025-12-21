import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Goals() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Metas</h1>
            <p className="text-muted-foreground">
              Gerencie suas metas de economia
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Em Desenvolvimento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Esta página está em desenvolvimento. Em breve você poderá criar e gerenciar suas metas.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

