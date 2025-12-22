import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

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
    // Normalizar para início do dia (00:00:00)
    startDate.setHours(0, 0, 0, 0);
    
    let endDate: Date;

    switch (data.period) {
      case 'WEEKLY':
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'MONTHLY':
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'YEARLY':
        endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setHours(23, 59, 59, 999);
    }

    // Buscar todos os orçamentos da categoria para verificar sobreposição
    const existingBudgets = await prisma.budget.findMany({
      where: {
        userId,
        categoryId: data.categoryId,
      },
      select: {
        startDate: true,
        period: true,
      },
    });

    // Verificar se algum orçamento existente sobrepõe o período do novo
    for (const existing of existingBudgets) {
      let existingEndDate: Date;
      const existingStartDate = new Date(existing.startDate);
      // Normalizar para início do dia
      existingStartDate.setHours(0, 0, 0, 0);

      switch (existing.period) {
        case 'WEEKLY':
          existingEndDate = new Date(existingStartDate);
          existingEndDate.setDate(existingEndDate.getDate() + 7);
          existingEndDate.setHours(23, 59, 59, 999);
          break;
        case 'MONTHLY':
          existingEndDate = new Date(existingStartDate);
          existingEndDate.setMonth(existingEndDate.getMonth() + 1);
          existingEndDate.setHours(23, 59, 59, 999);
          break;
        case 'YEARLY':
          existingEndDate = new Date(existingStartDate);
          existingEndDate.setFullYear(existingEndDate.getFullYear() + 1);
          existingEndDate.setHours(23, 59, 59, 999);
          break;
        default:
          existingEndDate = new Date(existingStartDate);
          existingEndDate.setMonth(existingEndDate.getMonth() + 1);
          existingEndDate.setHours(23, 59, 59, 999);
      }

      // Verificar sobreposição: períodos se sobrepõem se:
      // O novo período começa antes do existente terminar E termina depois do existente começar
      // Mas não se são exatamente adjacentes (um termina quando o outro começa)
      const hasOverlap = startDate.getTime() < existingEndDate.getTime() && 
                         endDate.getTime() > existingStartDate.getTime();

      if (hasOverlap) {
        const periodLabels: Record<BudgetPeriod, string> = {
          WEEKLY: 'semanal',
          MONTHLY: 'mensal',
          YEARLY: 'anual',
        };

        const periodLabel = periodLabels[data.period] || 'mensal';
        const formattedStartDate = format(startDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
        const categoryName = category.name;

        throw new AppError(
          400,
          `Já existe um orçamento ${periodLabel} para a categoria "${categoryName}" iniciando em ${formattedStartDate}. Por favor, escolha outro período ou categoria.`
        );
      }
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
    let categoryToCheck = null;
    let periodToCheck: BudgetPeriod | undefined = undefined;
    let startDateToCheck: Date | undefined = undefined;

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
      categoryToCheck = category;
    } else {
      // Buscar categoria atual se não estiver sendo alterada
      const currentCategory = await prisma.category.findUnique({
        where: { id: budget.categoryId },
      });
      categoryToCheck = currentCategory;
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
      periodToCheck = data.period;
    } else {
      periodToCheck = budget.period as BudgetPeriod;
    }

    if (data.startDate !== undefined) {
      const newStartDate = new Date(data.startDate);
      newStartDate.setHours(0, 0, 0, 0);
      updateData.startDate = newStartDate;
      startDateToCheck = newStartDate;
    } else {
      startDateToCheck = new Date(budget.startDate);
      startDateToCheck.setHours(0, 0, 0, 0);
    }

    // Verificar se já existe outro orçamento para esta categoria no mesmo período
    if (categoryToCheck && periodToCheck && startDateToCheck) {
      let endDate: Date;

      switch (periodToCheck) {
        case 'WEEKLY':
          endDate = new Date(startDateToCheck);
          endDate.setDate(endDate.getDate() + 7);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'MONTHLY':
          endDate = new Date(startDateToCheck);
          endDate.setMonth(endDate.getMonth() + 1);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'YEARLY':
          endDate = new Date(startDateToCheck);
          endDate.setFullYear(endDate.getFullYear() + 1);
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          endDate = new Date(startDateToCheck);
          endDate.setMonth(endDate.getMonth() + 1);
          endDate.setHours(23, 59, 59, 999);
      }

      // Buscar todos os orçamentos da categoria (exceto o atual) para verificar sobreposição
      const existingBudgets = await prisma.budget.findMany({
        where: {
          userId,
          id: { not: budgetId },
          categoryId: categoryToCheck.id,
        },
        select: {
          startDate: true,
          period: true,
        },
      });

      // Verificar se algum orçamento existente sobrepõe o período do atualizado
      for (const existing of existingBudgets) {
        let existingEndDate: Date;
        const existingStartDate = new Date(existing.startDate);
        existingStartDate.setHours(0, 0, 0, 0);

        switch (existing.period) {
          case 'WEEKLY':
            existingEndDate = new Date(existingStartDate);
            existingEndDate.setDate(existingEndDate.getDate() + 7);
            existingEndDate.setHours(23, 59, 59, 999);
            break;
          case 'MONTHLY':
            existingEndDate = new Date(existingStartDate);
            existingEndDate.setMonth(existingEndDate.getMonth() + 1);
            existingEndDate.setHours(23, 59, 59, 999);
            break;
          case 'YEARLY':
            existingEndDate = new Date(existingStartDate);
            existingEndDate.setFullYear(existingEndDate.getFullYear() + 1);
            existingEndDate.setHours(23, 59, 59, 999);
            break;
          default:
            existingEndDate = new Date(existingStartDate);
            existingEndDate.setMonth(existingEndDate.getMonth() + 1);
            existingEndDate.setHours(23, 59, 59, 999);
        }

        // Verificar sobreposição: períodos se sobrepõem se:
        // O novo período começa antes do existente terminar E termina depois do existente começar
        const hasOverlap = startDateToCheck.getTime() < existingEndDate.getTime() && 
                           endDate.getTime() > existingStartDate.getTime();

        if (hasOverlap) {
          const periodLabels: Record<BudgetPeriod, string> = {
            WEEKLY: 'semanal',
            MONTHLY: 'mensal',
            YEARLY: 'anual',
          };

          const periodLabel = periodLabels[periodToCheck] || 'mensal';
          const formattedStartDate = format(startDateToCheck, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
          const categoryName = categoryToCheck.name;

          throw new AppError(
            400,
            `Já existe um orçamento ${periodLabel} para a categoria "${categoryName}" iniciando em ${formattedStartDate}. Por favor, escolha outro período ou categoria.`
          );
        }
      }
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

