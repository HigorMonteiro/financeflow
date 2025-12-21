import { prisma } from '../config/database';
import { TransactionType } from '../types/enums';
import { AppError } from '../middlewares/error.middleware';

export interface CreateTransactionDTO {
  accountId: string;
  categoryId: string;
  amount: string;
  type: string;
  description: string;
  date: string;
}

export interface UpdateTransactionDTO {
  accountId?: string;
  categoryId?: string;
  amount?: string;
  type?: string;
  description?: string;
  date?: string;
}

export class TransactionService {
  async getAll(userId: string, filters?: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    accountId?: string;
    type?: string;
    minAmount?: string;
    maxAmount?: string;
  }) {
    const where: any = { userId };

    if (filters?.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      where.date = { ...where.date, gte: startDate };
    }

    if (filters?.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      where.date = { ...where.date, lte: endDate };
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.accountId) {
      where.accountId = filters.accountId;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.minAmount) {
      where.amount = { ...where.amount, gte: filters.minAmount };
    }

    if (filters?.maxAmount) {
      where.amount = { ...where.amount, lte: filters.maxAmount };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return {
      transactions,
      total: transactions.length,
    };
  }

  async getById(userId: string, id: string) {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        category: true,
        account: true,
      },
    });

    if (!transaction) {
      throw new AppError(404, 'Transação não encontrada');
    }

    return transaction;
  }

  async create(userId: string, data: CreateTransactionDTO) {
    // Verificar se conta existe
    const account = await prisma.account.findFirst({
      where: {
        id: data.accountId,
        userId,
      },
    });

    if (!account) {
      throw new AppError(404, 'Conta não encontrada');
    }

    // Verificar se categoria existe
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        userId,
      },
    });

    if (!category) {
      throw new AppError(404, 'Categoria não encontrada');
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId: data.accountId,
        categoryId: data.categoryId,
        amount: data.amount,
        type: data.type as TransactionType,
        description: data.description,
        date: new Date(data.date),
        tags: '[]',
      },
      include: {
        category: true,
        account: true,
      },
    });

    // Atualizar saldo da conta
    const amount = parseFloat(data.amount);
    const currentBalance = parseFloat(account.balance);
    const newBalance =
      data.type === TransactionType.INCOME
        ? currentBalance + amount
        : currentBalance - amount;

    await prisma.account.update({
      where: { id: account.id },
      data: { balance: newBalance.toFixed(2) },
    });

    return transaction;
  }

  async update(userId: string, id: string, data: UpdateTransactionDTO) {
    const transaction = await this.getById(userId, id);

    const updateData: any = {};

    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.accountId !== undefined) updateData.accountId = data.accountId;

    const updated = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        account: true,
      },
    });

    return updated;
  }

  async delete(userId: string, id: string) {
    await this.getById(userId, id);

    await prisma.transaction.delete({
      where: { id },
    });
  }
}

