import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

interface CSVImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CSVImportModal({ open, onOpenChange, onSuccess }: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/import/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      setFile(null);
      onSuccess?.();
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    },
  });

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
      importMutation.mutate(file);
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFile(null)}
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

