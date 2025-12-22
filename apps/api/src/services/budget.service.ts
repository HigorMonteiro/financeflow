import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export type BudgetPeriod = 'MONTHLY' | 'YEARLY' | 'WEEKLY';

export interface CreateBudgetDTO {
  categoryId: string;
  amount: string;
  period: BudgetPeriod;
  startDate: string;
}

export interface UpdateBudgetDTO {
  categoryId?: string;
  amount?: string;
  period?: BudgetPeriod;
  startDate?: string;
}

export class BudgetService {
  /**
   * Calculate spent amount for a budget based on period
   */
  private async calculateSpent(
    userId: string,
    categoryId: string,
    startDate: Date,
    period: BudgetPeriod
  ): Promise<number> {
    let endDate: Date;

    switch (period) {
      case 'WEEKLY':
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'MONTHLY':
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'YEARLY':
        endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        categoryId,
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    return transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  }

  /**
   * Calculate progress percentage for a budget
   */
  private calculateProgress(spent: number, budgetAmount: number): number {
    if (budgetAmount <= 0) return 0;
    const progress = (spent / budgetAmount) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }

  /**
   * Get all budgets for a user
   */
  async getAll(userId: string, filters?: { page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const [budgets, total] = await Promise.all([
      prisma.budget.findMany({
        where: { userId },
        include: {
          category: true,
        },
        orderBy: {
          startDate: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.budget.count({ where: { userId } }),
    ]);

    const budgetsWithProgress = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await this.calculateSpent(
          userId,
          budget.categoryId,
          budget.startDate,
          budget.period as BudgetPeriod
        );
        const progress = this.calculateProgress(spent, parseFloat(budget.amount));

        return {
          ...budget,
          spent: spent.toFixed(2),
          progress,
          remaining: (parseFloat(budget.amount) - spent).toFixed(2),
        };
      })
    );

    return {
      budgets: budgetsWithProgress,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };
  }

  /**
   * Get a specific budget by ID
   */
  async getById(userId: string, budgetId: string) {
    const budget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
      include: {
        category: true,
      },
    });

    if (!budget) {
      throw new AppError(404, 'Orçamento não encontrado');
    }

    const spent = await this.calculateSpent(
      userId,
      budget.categoryId,
      budget.startDate,
      budget.period as BudgetPeriod
    );
    const progress = this.calculateProgress(spent, parseFloat(budget.amount));

    return {
      ...budget,
      spent: spent.toFixed(2),
      progress,
      remaining: (parseFloat(budget.amount) - spent).toFixed(2),
    };
  }

  /**
   * Create a new budget
   */
  async create(userId: string, data: CreateBudgetDTO) {
    const amount = parseFloat(data.amount);

    if (amount <= 0) {
      throw new AppError(400, 'O valor do orçamento deve ser maior que zero');
    }

    // Verificar se categoria existe e pertence ao usuário ou é padrão
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        OR: [{ userId }, { isDefault: true }],
      },
    });

    if (!category) {
      throw new AppError(404, 'Categoria não encontrada');
    }

    // Verificar se já existe orçamento para esta categoria no mesmo período
    const startDate = new Date(data.startDate);
    let endDate: Date;

    switch (data.period) {
      case 'WEEKLY':
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'MONTHLY':
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'YEARLY':
        endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
    }

    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId,
        categoryId: data.categoryId,
        startDate: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    if (existingBudget) {
      throw new AppError(
        400,
        'Já existe um orçamento para esta categoria neste período'
      );
    }

    const budget = await prisma.budget.create({
      data: {
        userId,
        categoryId: data.categoryId,
        amount: amount.toFixed(2),
        period: data.period,
        startDate,
      },
      include: {
        category: true,
      },
    });

    const spent = await this.calculateSpent(
      userId,
      budget.categoryId,
      budget.startDate,
      budget.period as BudgetPeriod
    );
    const progress = this.calculateProgress(spent, parseFloat(budget.amount));

    return {
      ...budget,
      spent: spent.toFixed(2),
      progress,
      remaining: (parseFloat(budget.amount) - spent).toFixed(2),
    };
  }

  /**
   * Update an existing budget
   */
  async update(userId: string, budgetId: string, data: UpdateBudgetDTO) {
    const budget = await this.getById(userId, budgetId);

    const updateData: any = {};

    if (data.categoryId !== undefined) {
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          OR: [{ userId }, { isDefault: true }],
        },
      });

      if (!category) {
        throw new AppError(404, 'Categoria não encontrada');
      }
      updateData.categoryId = data.categoryId;
    }

    if (data.amount !== undefined) {
      const amount = parseFloat(data.amount);
      if (amount <= 0) {
        throw new AppError(400, 'O valor do orçamento deve ser maior que zero');
      }
      updateData.amount = amount.toFixed(2);
    }

    if (data.period !== undefined) {
      updateData.period = data.period;
    }

    if (data.startDate !== undefined) {
      updateData.startDate = new Date(data.startDate);
    }

    const updated = await prisma.budget.update({
      where: { id: budgetId },
      data: updateData,
      include: {
        category: true,
      },
    });

    const spent = await this.calculateSpent(
      userId,
      updated.categoryId,
      updated.startDate,
      updated.period as BudgetPeriod
    );
    const progress = this.calculateProgress(spent, parseFloat(updated.amount));

    return {
      ...updated,
      spent: spent.toFixed(2),
      progress,
      remaining: (parseFloat(updated.amount) - spent).toFixed(2),
    };
  }

  /**
   * Delete a budget
   */
  async delete(userId: string, budgetId: string) {
    await this.getById(userId, budgetId);

    await prisma.budget.delete({
      where: { id: budgetId },
    });
  }
}

