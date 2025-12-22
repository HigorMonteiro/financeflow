import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, FileText, AlertCircle, CheckCircle2, CreditCard } from 'lucide-react';
import api from '@/lib/api';
import { cardsService } from '@/services/cards.service';
import { useToast } from '@/hooks/use-toast';

interface CSVImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const BANK_DISPLAY_NAMES: Record<string, string> = {
  NUBANK: 'Nubank',
  INTER: 'Inter',
  ITAU: 'Itaú',
  SANTANDER: 'Santander',
  BRADESCO: 'Bradesco',
  CAIXA: 'Caixa Econômica',
  BB: 'Banco do Brasil',
  UNKNOWN: 'Desconhecido',
};

export function CSVImportModal({ open, onOpenChange, onSuccess }: CSVImportModalProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string>('none');
  const [detectedBank, setDetectedBank] = useState<{
    bank: string;
    confidence: number;
    indicators: string[];
  } | null>(null);

  const { data: cards } = useQuery({
    queryKey: ['cards'],
    queryFn: cardsService.getAll,
    enabled: open,
    retry: false,
  });

  const importMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/import/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.detectedBank) {
        setDetectedBank(data.detectedBank);
      }
      setFile(null);
      onSuccess?.();
      toast({
        variant: 'success',
        title: 'Importação concluída!',
        description: `${data.importedCount || 0} transações foram importadas com sucesso.`,
      });
      setTimeout(() => {
        onOpenChange(false);
        setDetectedBank(null);
        setSelectedCardId('none');
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao importar arquivo',
        description: error.response?.data?.error || 'Não foi possível importar o arquivo. Verifique o formato e tente novamente.',
      });
    },
  });

  // Detectar banco quando arquivo é selecionado
  useEffect(() => {
    if (file && !importMutation.data) {
      const detectBankMutation = async () => {
        try {
          const formData = new FormData();
          formData.append('file', file);
          const response = await api.post('/import/detect-bank', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          setDetectedBank({
            bank: response.data.bank,
            confidence: response.data.confidence,
            indicators: response.data.indicators,
          });
        } catch (error) {
          // Ignorar erro, apenas tentar detectar
        }
      };
      detectBankMutation();
    }
  }, [file]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv') || droppedFile.type === 'text/csv') {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      if (selectedCardId && selectedCardId !== 'none') {
        formData.append('cardId', selectedCardId);
      }
      importMutation.mutate(formData as any);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar CSV</DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo CSV com suas transações. O formato esperado é:
            Data,Descrição,Valor,Categoria,Conta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Área de Upload */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
          >
            {file ? (
              <div className="space-y-2">
                <FileText className="h-12 w-12 mx-auto text-primary" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                {detectedBank && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Banco detectado: {BANK_DISPLAY_NAMES[detectedBank.bank] || detectedBank.bank}
                      </span>
                    </div>
                    {detectedBank.confidence < 0.7 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Confiança: {(detectedBank.confidence * 100).toFixed(0)}%
                      </p>
                    )}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setDetectedBank(null);
                    setSelectedCardId('none');
                  }}
                  className="mt-2"
                >
                  Remover arquivo
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-primary hover:underline"
                  >
                    Clique para selecionar
                  </label>
                  <span className="text-muted-foreground"> ou arraste o arquivo aqui</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Apenas arquivos CSV (máx. 10MB)
                </p>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Seleção de Cartão (quando banco detectado) */}
          {file && detectedBank && Array.isArray(cards) && cards.length > 0 && (
            <div className="space-y-2">
              <Label>Associar a um cartão (opcional)</Label>
              <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cartão ou deixe em branco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não associar a cartão</SelectItem>
                  {cards
                    .filter(
                      (card: any) =>
                        card.isActive &&
                        (card.bank === detectedBank.bank || selectedCardId === 'none')
                    )
                    .map((card: any) => (
                      <SelectItem key={card.id} value={card.id}>
                        {card.name} ({BANK_DISPLAY_NAMES[card.bank] || card.bank})
                        {card.lastFourDigits && ` • Final ${card.lastFourDigits}`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                O sistema detectou que este CSV pertence ao{' '}
                <strong>{BANK_DISPLAY_NAMES[detectedBank.bank] || detectedBank.bank}</strong>.
                Você pode associar as transações a um cartão específico.
              </p>
            </div>
          )}

          {/* Resultado da Importação */}
          {importMutation.isSuccess && importMutation.data && (
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Importação concluída!</span>
              </div>
              <div className="text-sm space-y-1">
                <p>
                  ✓ {importMutation.data.imported?.transactions || 0} transações importadas
                </p>
                {importMutation.data.imported?.categories > 0 && (
                  <p>
                    ✓ {importMutation.data.imported.categories} categorias criadas
                  </p>
                )}
                {importMutation.data.imported?.accounts > 0 && (
                  <p>✓ {importMutation.data.imported.accounts} contas criadas</p>
                )}
              </div>
              {importMutation.data.errors?.length > 0 && (
                <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                  <p className="font-medium">Avisos:</p>
                  <ul className="list-disc list-inside">
                    {importMutation.data.errors.slice(0, 5).map((error: string, i: number) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {importMutation.isError && (
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Erro na importação</span>
              </div>
              <div className="text-sm mt-2 space-y-1">
                <p>
                  {(importMutation.error as any)?.response?.data?.error ||
                    (importMutation.error as any)?.response?.data?.errors?.[0] ||
                    (importMutation.error as any)?.message ||
                    'Erro ao processar o arquivo'}
                </p>
                {(importMutation.error as any)?.response?.data?.errors &&
                  (importMutation.error as any).response.data.errors.length > 1 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs">
                        Ver todos os erros (
                        {(importMutation.error as any).response.data.errors.length})
                      </summary>
                      <ul className="list-disc list-inside mt-2 text-xs space-y-1">
                        {(importMutation.error as any).response.data.errors
                          .slice(1, 10)
                          .map((error: string, i: number) => (
                            <li key={i}>{error}</li>
                          ))}
                      </ul>
                    </details>
                  )}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!file || importMutation.isPending}
            >
              {importMutation.isPending ? 'Importando...' : 'Importar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

