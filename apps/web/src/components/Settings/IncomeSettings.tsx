import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Loader2 } from 'lucide-react';

export function IncomeSettings() {
  const [monthlyIncome, setMonthlyIncome] = useState('');

  useEffect(() => {
    // Carregar valor salvo do localStorage ou API
    const saved = localStorage.getItem('monthlyIncome');
    if (saved) {
      setMonthlyIncome(saved);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('monthlyIncome', monthlyIncome);
    // TODO: Salvar na API quando endpoint estiver disponível
    alert('Receita mensal salva com sucesso!');
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receita Mensal</CardTitle>
        <CardDescription>
          Configure sua receita mensal para acompanhamento financeiro
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="monthlyIncome">Valor da Receita Mensal</Label>
            <Input
              id="monthlyIncome"
              type="text"
              value={monthlyIncome}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d,.-]/g, '');
                setMonthlyIncome(value);
              }}
              placeholder="0,00"
              className="text-lg"
            />
            {monthlyIncome && (
              <p className="text-sm text-muted-foreground">
                {formatCurrency(monthlyIncome)}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

