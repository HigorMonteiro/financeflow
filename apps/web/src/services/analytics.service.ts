import api from '@/lib/api';

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
    date: string;
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

export interface TrendData {
  date: string;
  income: string;
  expenses: string;
  balance: string;
}

export interface CashFlowData {
  month: string;
  income: string;
  expenses: string;
  balance: string;
}

export interface CategoryAnalysisData {
  categoryId: string;
  categoryName: string;
  color: string;
  amount: string;
  percentage: number;
}

export interface PeriodComparisonData {
  current: {
    income: string;
    expenses: string;
    balance: string;
  };
  previous: {
    income: string;
    expenses: string;
    balance: string;
  };
  changes: {
    income: number;
    expenses: number;
    balance: number;
  };
}

export const analyticsService = {
  async getDashboard(): Promise<DashboardData> {
    const response = await api.get<DashboardData>('/analytics/dashboard');
    return response.data;
  },

  async getTrends(
    startDate?: string,
    endDate?: string,
    period: 'day' | 'week' | 'month' = 'month'
  ): Promise<TrendData[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('period', period);
    const response = await api.get<TrendData[]>(`/analytics/trends?${params.toString()}`);
    return response.data;
  },

  async getCashFlow(months: number = 6): Promise<CashFlowData[]> {
    const response = await api.get<CashFlowData[]>(`/analytics/cash-flow?months=${months}`);
    return response.data;
  },

  async getCategoryAnalysis(
    startDate?: string,
    endDate?: string,
    type: 'INCOME' | 'EXPENSE' = 'EXPENSE'
  ): Promise<CategoryAnalysisData[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('type', type);
    const response = await api.get<CategoryAnalysisData[]>(
      `/analytics/category-analysis?${params.toString()}`
    );
    return response.data;
  },

  async getPeriodComparison(
    period: 'month' | 'quarter' | 'year' = 'month'
  ): Promise<PeriodComparisonData> {
    const response = await api.get<PeriodComparisonData>(
      `/analytics/period-comparison?period=${period}`
    );
    return response.data;
  },
};

