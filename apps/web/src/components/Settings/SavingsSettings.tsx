import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2 } from 'lucide-react';

export function SavingsSettings() {
  const { toast } = useToast();
  const [savings, setSavings] = useState('');

  useEffect(() => {
    // Carregar valor salvo do localStorage ou API
    const saved = localStorage.getItem('savings');
    if (saved) {
      setSavings(saved);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('savings', savings);
    // TODO: Salvar na API quando endpoint estiver disponível
    toast({
      variant: 'success',
      title: 'Valor salvo!',
      description: 'Dinheiro guardado salvo com sucesso.',
    });
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
        <CardTitle>Dinheiro Guardado</CardTitle>
        <CardDescription>
          Configure o valor total que você tem guardado/poupado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="savings">Valor Total Guardado</Label>
            <Input
              id="savings"
              type="text"
              value={savings}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d,.-]/g, '');
                setSavings(value);
              }}
              placeholder="0,00"
              className="text-lg"
            />
            {savings && (
              <p className="text-sm text-muted-foreground">
                {formatCurrency(savings)}
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

