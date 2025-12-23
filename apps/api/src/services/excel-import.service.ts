import XLSX from 'xlsx';
import { prisma } from '../config/database';
import { AccountType, CategoryType, TransactionType, type AccountType as AccountTypeType } from '../types/enums';

export interface ImportResult {
  success: boolean;
  imported: {
    categories: number;
    accounts: number;
    transactions: number;
  };
  errors: string[];
}

export class ExcelImportService {
  /**
   * Importa dados de uma planilha Excel para o banco de dados
   */
  async importFromExcel(
    userId: string,
    fileBuffer: Buffer,
    mapping?: {
      sheets?: Record<string, {
        headers?: Record<string, string>;
        rowStart?: number;
      }>;
    }
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      imported: {
        categories: 0,
        accounts: 0,
        transactions: 0,
      },
      errors: [],
    };

    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

      // Importar categorias (se houver aba de categorias)
      const categoriesSheet = this.findSheet(workbook, ['Categorias', 'Categories', 'Categoria']);
      if (categoriesSheet) {
        try {
          const categories = this.parseCategories(workbook.Sheets[categoriesSheet], userId);
          for (const category of categories) {
            try {
              const existing = await prisma.category.findFirst({
                where: {
                  userId,
                  name: category.name,
                },
              });

              if (!existing) {
                await prisma.category.create({
                  data: category,
                });
              } else {
                await prisma.category.update({
                  where: { id: existing.id },
                  data: category,
                });
              }
              result.imported.categories++;
            } catch (error: any) {
              result.errors.push(`Erro ao importar categoria ${category.name}: ${error.message}`);
            }
          }
        } catch (error: any) {
          result.errors.push(`Erro ao processar categorias: ${error.message}`);
        }
      }

      // Importar contas (se houver aba de contas)
      const accountsSheet = this.findSheet(workbook, ['Contas', 'Accounts', 'Conta']);
      if (accountsSheet) {
        try {
          const accounts = this.parseAccounts(workbook.Sheets[accountsSheet], userId);
          for (const account of accounts) {
            try {
              await prisma.account.create({
                data: account,
              });
              result.imported.accounts++;
            } catch (error: any) {
              result.errors.push(`Erro ao importar conta ${account.name}: ${error.message}`);
            }
          }
        } catch (error: any) {
          result.errors.push(`Erro ao processar contas: ${error.message}`);
        }
      }

      // Importar transações (aba principal)
      const transactionsSheet = this.findSheet(workbook, [
        'Transações',
        'Transactions',
        'Extrato',
        'Movimentações',
        'Dados',
      ]);
      
      if (transactionsSheet) {
        try {
          const transactions = await this.parseTransactions(
            workbook.Sheets[transactionsSheet],
            userId
          );
          
          for (const transaction of transactions) {
            try {
              await prisma.transaction.create({
                data: transaction,
              });
              result.imported.transactions++;
            } catch (error: any) {
              result.errors.push(`Erro ao importar transação: ${error.message}`);
            }
          }
        } catch (error: any) {
          result.errors.push(`Erro ao processar transações: ${error.message}`);
        }
      } else {
        result.errors.push('Nenhuma aba de transações encontrada');
      }

      if (result.errors.length > 0) {
        result.success = false;
      }
    } catch (error: any) {
      result.success = false;
      result.errors.push(`Erro geral: ${error.message}`);
    }

    return result;
  }

  private findSheet(workbook: XLSX.WorkBook, names: string[]): string | null {
    for (const name of names) {
      if (workbook.SheetNames.includes(name)) {
        return name;
      }
    }
    return null;
  }

  private parseCategories(sheet: XLSX.WorkSheet, userId: string): Array<{
    userId: string;
    name: string;
    type: string;
    color: string;
    icon: string;
  }> {
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    const categories: Array<{
      userId: string;
      name: string;
      type: string;
      color: string;
      icon: string;
    }> = [];

    // Assumir que a primeira linha é cabeçalho
    const headers = (data[0] || []).map((h: any) => String(h).toLowerCase());
    const nameIndex = headers.findIndex((h) => h.includes('nome') || h.includes('name'));
    const typeIndex = headers.findIndex((h) => h.includes('tipo') || h.includes('type'));
    const colorIndex = headers.findIndex((h) => h.includes('cor') || h.includes('color'));
    const iconIndex = headers.findIndex((h) => h.includes('icone') || h.includes('icon'));

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const name = String(row[nameIndex] || row[0] || '').trim();
      if (!name) continue;

      const typeStr = String(row[typeIndex] || row[1] || 'EXPENSE').toUpperCase();
      const type = typeStr.includes('RECEITA') || typeStr.includes('INCOME')
        ? CategoryType.INCOME
        : CategoryType.EXPENSE;

      categories.push({
        userId,
        name,
        type,
        color: String(row[colorIndex] || row[2] || '#3B82F6'),
        icon: String(row[iconIndex] || row[3] || 'receipt'),
      });
    }

    return categories;
  }

  private parseAccounts(sheet: XLSX.WorkSheet, userId: string): Array<{
    userId: string;
    name: string;
    type: string;
    balance: string;
    currency: string;
  }> {
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    const accounts: Array<{
      userId: string;
      name: string;
      type: string;
      balance: string;
      currency: string;
    }> = [];

    const headers = (data[0] || []).map((h: any) => String(h).toLowerCase());
    const nameIndex = headers.findIndex((h) => h.includes('nome') || h.includes('name'));
    const typeIndex = headers.findIndex((h) => h.includes('tipo') || h.includes('type'));
    const balanceIndex = headers.findIndex((h) => h.includes('saldo') || h.includes('balance'));
    const currencyIndex = headers.findIndex((h) => h.includes('moeda') || h.includes('currency'));

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const name = String(row[nameIndex] || row[0] || '').trim();
      if (!name) continue;

      const typeStr = String(row[typeIndex] || row[1] || 'CHECKING').toUpperCase();
      let type: AccountTypeType = AccountType.CHECKING;
      if (typeStr.includes('POUPANÇA') || typeStr.includes('SAVINGS')) {
        type = AccountType.SAVINGS;
      } else if (typeStr.includes('CARTÃO') || typeStr.includes('CARD')) {
        type = AccountType.CREDIT_CARD;
      } else if (typeStr.includes('INVESTIMENTO') || typeStr.includes('INVESTMENT')) {
        type = AccountType.INVESTMENT;
      } else if (typeStr.includes('DINHEIRO') || typeStr.includes('CASH')) {
        type = AccountType.CASH;
      }

      accounts.push({
        userId,
        name,
        type,
        balance: String(row[balanceIndex] || row[2] || '0'),
        currency: String(row[currencyIndex] || row[3] || 'BRL'),
      });
    }

    return accounts;
  }

  private async parseTransactions(
    sheet: XLSX.WorkSheet,
    userId: string
  ): Promise<Array<{
    userId: string;
    accountId: string;
    categoryId: string;
    amount: string;
    type: string;
    description: string;
    date: Date;
    tags: string;
  }>> {
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false }) as any[][];
    const transactions: Array<{
      userId: string;
      accountId: string;
      categoryId: string;
      amount: string;
      type: string;
      description: string;
      date: Date;
      tags: string;
    }> = [];

    if (data.length < 2) return transactions;

    const headers = (data[0] || []).map((h: any) => String(h).toLowerCase());
    const dateIndex = headers.findIndex((h) => h.includes('data') || h.includes('date'));
    const descriptionIndex = headers.findIndex(
      (h) => h.includes('descrição') || h.includes('description') || h.includes('descricao')
    );
    const amountIndex = headers.findIndex(
      (h) => h.includes('valor') || h.includes('amount') || h.includes('value')
    );
    const categoryIndex = headers.findIndex(
      (h) => h.includes('categoria') || h.includes('category')
    );
    const accountIndex = headers.findIndex(
      (h) => h.includes('conta') || h.includes('account') || h.includes('banco')
    );
    const typeIndex = headers.findIndex(
      (h) => h.includes('tipo') || h.includes('type') || h.includes('receita') || h.includes('despesa')
    );

    // Buscar conta padrão se não especificada
    const defaultAccount = await prisma.account.findFirst({
      where: { userId },
    });

    if (!defaultAccount) {
      throw new Error('Nenhuma conta encontrada. Crie uma conta primeiro.');
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const dateStr = String(row[dateIndex] || row[0] || '');
      const description = String(row[descriptionIndex] || row[1] || '').trim();
      const amountStr = String(row[amountIndex] || row[2] || '0').replace(/[^\d.,-]/g, '');

      if (!dateStr || !description || !amountStr || amountStr === '0') continue;

      let date: Date;
      if (typeof dateStr === 'number') {
        // Excel date serial number
        const excelEpoch = new Date(1899, 11, 30);
        date = new Date(excelEpoch.getTime() + dateStr * 86400000);
      } else {
        date = new Date(dateStr);
      }

      if (isNaN(date.getTime())) continue;

      const amount = parseFloat(amountStr.replace(',', '.'));
      if (isNaN(amount) || amount === 0) continue;

      const categoryName = String(row[categoryIndex] || row[3] || 'Outros').trim();
      const accountName = String(row[accountIndex] || '').trim();

      // Buscar ou criar categoria
      let category = await prisma.category.findFirst({
        where: {
          userId,
          name: categoryName,
        },
      });

      if (!category) {
        const typeStr = String(row[typeIndex] || '').toUpperCase();
        const isIncome = amount > 0 || typeStr.includes('RECEITA') || typeStr.includes('INCOME');
        
        category = await prisma.category.create({
          data: {
            userId,
            name: categoryName,
            type: isIncome ? CategoryType.INCOME : CategoryType.EXPENSE,
            color: '#3B82F6',
            icon: 'receipt',
          },
        });
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
        }
      }

      const transactionType = amount > 0 ? TransactionType.INCOME : TransactionType.EXPENSE;

      transactions.push({
        userId,
        accountId: account.id,
        categoryId: category.id,
        amount: Math.abs(amount).toFixed(2),
        type: transactionType,
        description,
        date,
        tags: '[]',
      });
    }

    return transactions;
  }
}

