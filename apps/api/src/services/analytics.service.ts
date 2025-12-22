import { prisma } from '../config/database';
import Decimal from 'decimal.js';
import { getBillingPeriod } from '../utils/billing-period.utils';

export interface DashboardData {
  balance: {
    total: string;
    byAccount: Array<{
      accountId: string;
      accountName: string;
      balance: string;
    }>;
  };
  monthly: {
    income: string;
    expenses: string;
    balance: string;
  };
  recentTransactions: Array<{
    id: string;
    date: Date;
    description: string;
    amount: string;
    type: string;
    category: {
      name: string;
      color: string;
    };
    account: {
      name: string;
    };
  }>;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    amount: string;
    type: string;
    percentage: number;
  }>;
  goals: Array<{
    id: string;
    name: string;
    targetAmount: string;
    currentAmount: string;
    progress: number;
  }>;
}

export class AnalyticsService {
  async getDashboardData(userId: string): Promise<DashboardData> {
    const now = new Date();

    // Buscar todas as contas do usuário
    const accounts = await prisma.account.findMany({
      where: { userId },
    });

    // Calcular saldo total
    const totalBalance = accounts.reduce((sum, acc) => {
      return sum + parseFloat(acc.balance);
    }, 0);

    // Saldo por conta
    const balanceByAccount = accounts.map((acc) => ({
      accountId: acc.id,
      accountName: acc.name,
      balance: acc.balance,
    }));

    // Calcular transações do período atual considerando períodos de fatura por conta
    // Se todas as contas têm período de fatura configurado, usa o período mais comum
    // Caso contrário, agrupa transações por conta e seu respectivo período
    const accountsWithBilling = accounts.filter(
      (acc) => acc.billingStartDay && acc.billingEndDay
    );

    let monthlyTransactions: any[] = [];

    if (accountsWithBilling.length > 0) {
      // Buscar transações agrupadas por período de fatura de cada conta
      const transactionPromises = accounts.map(async (account) => {
        const period = getBillingPeriod(
          account.billingStartDay,
          account.billingEndDay,
          now
        );

        return prisma.transaction.findMany({
          where: {
            userId,
            accountId: account.id,
            date: {
              gte: period.startDate,
              lte: period.endDate,
            },
          },
        });
      });

      const transactionsByAccount = await Promise.all(transactionPromises);
      monthlyTransactions = transactionsByAccount.flat();
    } else {
      // Fallback: usar mês calendário se nenhuma conta tem período configurado
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      monthlyTransactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });
    }

    const monthlyIncome = monthlyTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const monthlyExpenses = monthlyTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const monthlyBalance = monthlyIncome - monthlyExpenses;

    // Últimas 5 despesas
    const recentTransactions = await prisma.transaction.findMany({
      where: { 
        userId,
        type: 'EXPENSE',
      },
      include: {
        category: true,
        account: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: 5,
    });

    // Breakdown por categoria (período atual considerando períodos de fatura)
    let categoryTransactions: any[] = [];

    if (accountsWithBilling.length > 0) {
      const categoryPromises = accounts.map(async (account) => {
        const period = getBillingPeriod(
          account.billingStartDay,
          account.billingEndDay,
          now
        );

        return prisma.transaction.findMany({
          where: {
            userId,
            accountId: account.id,
            date: {
              gte: period.startDate,
              lte: period.endDate,
            },
          },
          include: {
            category: true,
          },
        });
      });

      const categoriesByAccount = await Promise.all(categoryPromises);
      categoryTransactions = categoriesByAccount.flat();
    } else {
      // Fallback: usar mês calendário
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      categoryTransactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        include: {
          category: true,
        },
      });
    }

    const categoryMap = new Map<
      string,
      { name: string; amount: number; type: string }
    >();

    categoryTransactions.forEach((t) => {
      const key = t.categoryId;
      const existing = categoryMap.get(key) || {
        name: t.category.name,
        amount: 0,
        type: t.type,
      };
      existing.amount += parseFloat(t.amount);
      categoryMap.set(key, existing);
    });

    const totalByCategory = Array.from(categoryMap.values()).reduce(
      (sum, cat) => sum + cat.amount,
      0
    );

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([id, data]) => ({
      categoryId: id,
      categoryName: data.name,
      amount: data.amount.toFixed(2),
      type: data.type,
      percentage: totalByCategory > 0 ? (data.amount / totalByCategory) * 100 : 0,
    }));

    // Metas
    const goals = await prisma.goal.findMany({
      where: { userId },
    });

    const goalsWithProgress = goals.map((goal) => {
      const current = parseFloat(goal.currentAmount);
      const target = parseFloat(goal.targetAmount);
      const progress = target > 0 ? (current / target) * 100 : 0;

      return {
        id: goal.id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        progress: Math.min(progress, 100),
      };
    });

    return {
      balance: {
        total: totalBalance.toFixed(2),
        byAccount: balanceByAccount,
      },
      monthly: {
        income: monthlyIncome.toFixed(2),
        expenses: monthlyExpenses.toFixed(2),
        balance: monthlyBalance.toFixed(2),
      },
      recentTransactions: recentTransactions.map((t) => ({
        id: t.id,
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: {
          name: t.category.name,
          color: t.category.color,
        },
        account: {
          name: t.account.name,
        },
      })),
      categoryBreakdown: categoryBreakdown.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount)),
      goals: goalsWithProgress,
    };
  }

  async getTrends(
    userId: string,
    startDate: Date,
    endDate: Date,
    period: 'day' | 'week' | 'month' = 'month'
  ) {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const trends: Record<string, { income: number; expenses: number; balance: number }> = {};

    transactions.forEach((transaction) => {
      const amount = parseFloat(transaction.amount);
      let key: string;

      if (period === 'day') {
        key = transaction.date.toISOString().split('T')[0];
      } else if (period === 'week') {
        const date = new Date(transaction.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        const date = new Date(transaction.date);
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!trends[key]) {
        trends[key] = { income: 0, expenses: 0, balance: 0 };
      }

      if (transaction.type === 'INCOME') {
        trends[key].income += amount;
      } else {
        trends[key].expenses += amount;
      }
      trends[key].balance = trends[key].income - trends[key].expenses;
    });

    return Object.entries(trends)
      .map(([date, data]) => ({
        date,
        income: new Decimal(data.income).toFixed(2),
        expenses: new Decimal(data.expenses).toFixed(2),
        balance: new Decimal(data.balance).toFixed(2),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getCashFlow(userId: string, months: number = 6) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const monthlyData: Record<string, { income: number; expenses: number }> = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const amount = parseFloat(transaction.amount);

      if (!monthlyData[key]) {
        monthlyData[key] = { income: 0, expenses: 0 };
      }

      if (transaction.type === 'INCOME') {
        monthlyData[key].income += amount;
      } else {
        monthlyData[key].expenses += amount;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        income: new Decimal(data.income).toFixed(2),
        expenses: new Decimal(data.expenses).toFixed(2),
        balance: new Decimal(data.income - data.expenses).toFixed(2),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async getCategoryAnalysis(
    userId: string,
    startDate: Date,
    endDate: Date,
    type: 'INCOME' | 'EXPENSE' = 'EXPENSE'
  ) {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    });

    const categoryMap = new Map<string, { name: string; color: string; amount: number }>();

    transactions.forEach((transaction) => {
      const categoryId = transaction.categoryId;
      const existing = categoryMap.get(categoryId) || {
        name: transaction.category.name,
        color: transaction.category.color,
        amount: 0,
      };
      existing.amount += parseFloat(transaction.amount);
      categoryMap.set(categoryId, existing);
    });

    const total = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.amount, 0);

    return Array.from(categoryMap.entries())
      .map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.name,
        color: data.color,
        amount: new Decimal(data.amount).toFixed(2),
        percentage: total > 0 ? (data.amount / total) * 100 : 0,
      }))
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
  }

  async getPeriodComparison(userId: string, period: 'month' | 'quarter' | 'year' = 'month') {
    const now = new Date();
    let currentStart: Date;
    let currentEnd: Date;
    let previousStart: Date;
    let previousEnd: Date;

    if (period === 'month') {
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (period === 'quarter') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      currentStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
      currentEnd = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59, 999);
      const previousQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
      const previousYear = currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
      previousStart = new Date(previousYear, previousQuarter * 3, 1);
      previousEnd = new Date(previousYear, (previousQuarter + 1) * 3, 0, 23, 59, 59, 999);
    } else {
      currentStart = new Date(now.getFullYear(), 0, 1);
      currentEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      previousStart = new Date(now.getFullYear() - 1, 0, 1);
      previousEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
    }

    const [currentTransactions, previousTransactions] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: currentStart,
            lte: currentEnd,
          },
        },
      }),
      prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: previousStart,
            lte: previousEnd,
          },
        },
      }),
    ]);

    const calculateTotals = (transactions: typeof currentTransactions) => {
      const income = transactions
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const expenses = transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      return {
        income: new Decimal(income).toFixed(2),
        expenses: new Decimal(expenses).toFixed(2),
        balance: new Decimal(income - expenses).toFixed(2),
      };
    };

    const current = calculateTotals(currentTransactions);
    const previous = calculateTotals(previousTransactions);

    const calculateChange = (current: string, previous: string) => {
      const currentNum = parseFloat(current);
      const previousNum = parseFloat(previous);
      if (previousNum === 0) return currentNum > 0 ? 100 : 0;
      return ((currentNum - previousNum) / previousNum) * 100;
    };

    return {
      current,
      previous,
      changes: {
        income: calculateChange(current.income, previous.income),
        expenses: calculateChange(current.expenses, previous.expenses),
        balance: calculateChange(current.balance, previous.balance),
      },
    };
  }
}

