import api from '@/lib/api';

export type BudgetPeriod = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: string;
  period: BudgetPeriod;
  startDate: string;
  spent?: string;
  progress?: number;
  remaining?: string;
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetData {
  categoryId: string;
  amount: string;
  period: BudgetPeriod;
  startDate: string;
}

export interface UpdateBudgetData {
  categoryId?: string;
  amount?: string;
  period?: BudgetPeriod;
  startDate?: string;
}

export interface BudgetsResponse {
  budgets: Budget[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  hasMore?: boolean;
}

export const budgetsService = {
  async getAll(params?: { page?: number; limit?: number }): Promise<BudgetsResponse> {
    const response = await api.get<BudgetsResponse>('/budgets', { params });
    return response.data;
  },

  async getById(id: string): Promise<Budget> {
    const response = await api.get<Budget>(`/budgets/${id}`);
    return response.data;
  },

  async create(data: CreateBudgetData): Promise<Budget> {
    const response = await api.post<Budget>('/budgets', data);
    return response.data;
  },

  async update(id: string, data: UpdateBudgetData): Promise<Budget> {
    const response = await api.put<Budget>(`/budgets/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`);
  },
};

