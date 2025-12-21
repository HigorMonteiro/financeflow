import { prisma } from '../config/database';
import { CategoryType, TransactionType, AccountType } from '../types/enums';

export interface CSVImportResult {
  success: boolean;
  imported: {
    categories: number;
    accounts: number;
    transactions: number;
  };
  errors: string[];
}

export class CSVImportService {
  /**
   * Importa dados de um arquivo CSV
   * Formato esperado: Data,Descrição,Valor,Categoria,Conta
   */
  async importFromCSV(userId: string, csvContent: string): Promise<CSVImportResult> {
    const result: CSVImportResult = {
      success: true,
      imported: {
        categories: 0,
        accounts: 0,
        transactions: 0,
      },
      errors: [],
    };

    try {
      const lines = csvContent.split('\n').filter((line) => line.trim());
      if (lines.length < 2) {
        throw new Error('CSV vazio ou sem dados');
      }

      // Detectar delimitador (vírgula ou ponto e vírgula)
      const delimiter = csvContent.includes(';') ? ';' : ',';
      
      // Parsear cabeçalho
      const headerLine = lines[0];
      const headers = this.parseCSVLine(headerLine, delimiter).map((h) =>
        h.trim().toLowerCase()
      );

      // Log para debug (apenas em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        console.log('CSV Headers encontrados:', headers);
        console.log('Delimitador detectado:', delimiter);
      }

      // Encontrar índices das colunas
      // Suporta português e inglês (formato Nubank)
      const dateIndex = this.findColumnIndex(headers, [
        'date', // Nubank usa "date" (prioridade)
        'data',
        'data da transação',
        'data da transacao',
        'dt',
      ]);
      const descriptionIndex = this.findColumnIndex(headers, [
        'title', // Nubank usa "title" (prioridade)
        'descrição',
        'description',
        'descricao',
        'desc',
        'titulo',
        'título',
      ]);
      const amountIndex = this.findColumnIndex(headers, [
        'amount', // Nubank usa "amount" (prioridade)
        'valor',
        'value',
        'vlr',
      ]);
      const categoryIndex = this.findColumnIndex(headers, [
        'categoria',
        'category',
        'cat',
      ]);
      const accountIndex = this.findColumnIndex(headers, [
        'conta',
        'account',
        'banco',
        'bank',
      ]);
      const typeIndex = this.findColumnIndex(headers, ['tipo', 'type', 'receita', 'despesa']);

      if (dateIndex === -1 || descriptionIndex === -1 || amountIndex === -1) {
        const missingColumns = [];
        if (dateIndex === -1) missingColumns.push('Data/Date');
        if (descriptionIndex === -1) missingColumns.push('Descrição/Title');
        if (amountIndex === -1) missingColumns.push('Valor/Amount');
        
        throw new Error(
          `Colunas obrigatórias não encontradas: ${missingColumns.join(', ')}. Colunas encontradas: ${headers.join(', ')}`
        );
      }

      // Buscar ou criar conta padrão
      let defaultAccount = await prisma.account.findFirst({
        where: { userId },
      });

      if (!defaultAccount) {
        defaultAccount = await prisma.account.create({
          data: {
            userId,
            name: 'Conta Principal',
            type: AccountType.CHECKING,
            balance: '0',
            currency: 'BRL',
          },
        });
        result.imported.accounts++;
      }

      // Processar linhas de dados
      const categoriesMap = new Map<string, string>(); // nome -> id

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
          const columns = this.parseCSVLine(line, delimiter);

          const dateStr = columns[dateIndex]?.trim();
          const description = columns[descriptionIndex]?.trim();
          let amountStr = columns[amountIndex]?.trim() || '';
          
          // Preservar valor original para debug
          const originalAmountStr = amountStr;
          // Remover caracteres não numéricos, mantendo sinal negativo e separadores decimais
          amountStr = amountStr.replace(/[^\d.,-]/g, '');
          
          const categoryName = columns[categoryIndex]?.trim() || 'Outros';
          const accountName = columns[accountIndex]?.trim();
          const typeStr = columns[typeIndex]?.trim() || '';

          if (!dateStr || !description || !amountStr || amountStr === '') {
            result.errors.push(
              `Linha ${i + 1}: Dados incompletos (Data: "${dateStr}", Descrição: "${description}", Valor: "${originalAmountStr}")`
            );
            continue;
          }

          // Parsear data
          const date = this.parseDate(dateStr);
          if (!date || isNaN(date.getTime())) {
            result.errors.push(`Linha ${i + 1}: Data inválida: ${dateStr}`);
            continue;
          }

          // Parsear valor (substituir vírgula por ponto para parseFloat)
          let amount = parseFloat(amountStr.replace(',', '.'));
          if (isNaN(amount) || amount === 0) {
            result.errors.push(`Linha ${i + 1}: Valor inválido: ${originalAmountStr}`);
            continue;
          }

          // Determinar tipo de transação
          // Formato Nubank: valores negativos são receitas (pagamentos recebidos)
          // Valores positivos são despesas (gastos)
          let transactionType = TransactionType.EXPENSE;
          
          // No formato Nubank, valores negativos são receitas
          if (amount < 0) {
            transactionType = TransactionType.INCOME;
            amount = Math.abs(amount); // Converter para positivo para armazenar
          } else if (amount > 0) {
            transactionType = TransactionType.EXPENSE;
          } else if (
            typeStr.toLowerCase().includes('receita') ||
            typeStr.toLowerCase().includes('income') ||
            description.toLowerCase().includes('pagamento recebido') ||
            description.toLowerCase().includes('estorno')
          ) {
            transactionType = TransactionType.INCOME;
          }

          // Buscar ou criar categoria
          let categoryId = categoriesMap.get(categoryName);
          if (!categoryId) {
            let category = await prisma.category.findFirst({
              where: {
                userId,
                name: categoryName,
              },
            });

            if (!category) {
              category = await prisma.category.create({
                data: {
                  userId,
                  name: categoryName,
                  type:
                    transactionType === TransactionType.INCOME
                      ? CategoryType.INCOME
                      : CategoryType.EXPENSE,
                  color: '#3B82F6',
                  icon: 'receipt',
                },
              });
              result.imported.categories++;
            }
            categoriesMap.set(categoryName, category.id);
            categoryId = category.id;
          }

          // Buscar conta
          let account = defaultAccount;
          if (accountName) {
            const foundAccount = await prisma.account.findFirst({
              where: {
                userId,
                name: accountName,
              },
            });
            if (foundAccount) {
              account = foundAccount;
            } else {
              // Criar conta se não existir
              account = await prisma.account.create({
                data: {
                  userId,
                  name: accountName,
                  type: AccountType.CHECKING,
                  balance: '0',
                  currency: 'BRL',
                },
              });
              result.imported.accounts++;
            }
          }

          // Criar transação
          // amount já está positivo se era negativo (receita do Nubank)
          await prisma.transaction.create({
            data: {
              userId,
              accountId: account.id,
              categoryId,
              amount: amount.toFixed(2),
              type: transactionType,
              description,
              date,
              tags: '[]',
            },
          });

          result.imported.transactions++;
        } catch (error: any) {
          result.errors.push(`Linha ${i + 1}: ${error.message}`);
        }
      }

      if (result.errors.length > 0 && result.imported.transactions === 0) {
        result.success = false;
      }
    } catch (error: any) {
      console.error('Erro na importação CSV:', error);
      result.success = false;
      result.errors.push(`Erro geral: ${error.message || 'Erro desconhecido'}`);
      
      // Se não houver mensagem de erro específica, adicionar stack trace em desenvolvimento
      if (process.env.NODE_ENV === 'development' && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }

    return result;
  }

  private parseCSVLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);

    return result;
  }

  private findColumnIndex(headers: string[], possibleNames: string[]): number {
    for (const name of possibleNames) {
      // Buscar correspondência exata primeiro (mais preciso)
      const exactIndex = headers.findIndex((h) => h === name);
      if (exactIndex !== -1) return exactIndex;
      
      // Se não encontrar exato, buscar por inclusão (fallback)
      const index = headers.findIndex((h) => h.includes(name));
      if (index !== -1) return index;
    }
    return -1;
  }

  private parseDate(dateStr: string): Date | null {
    // Tentar vários formatos de data
    const formats = [
      /^(\d{2})\/(\d{2})\/(\d{4})$/, // DD/MM/YYYY
      /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD (formato Nubank)
      /^(\d{2})-(\d{2})-(\d{4})$/, // DD-MM-YYYY
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        if (format === formats[0]) {
          // DD/MM/YYYY
          return new Date(
            parseInt(match[3]),
            parseInt(match[2]) - 1,
            parseInt(match[1])
          );
        } else if (format === formats[1]) {
          // YYYY-MM-DD (formato Nubank: 2025-12-20)
          return new Date(
            parseInt(match[1]),
            parseInt(match[2]) - 1,
            parseInt(match[3])
          );
        } else {
          // DD-MM-YYYY
          return new Date(
            parseInt(match[3]),
            parseInt(match[2]) - 1,
            parseInt(match[1])
          );
        }
      }
    }

    // Tentar parse direto (funciona com formato ISO do Nubank)
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    return null;
  }
}

