import api from '@/lib/api';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  type: 'INCOME' | 'EXPENSE';
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  account: {
    id: string;
    name: string;
  };
  tags: string[];
  createdAt: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
}

export const transactionsService = {
  async getAll(params?: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    accountId?: string;
    type?: 'INCOME' | 'EXPENSE';
    minAmount?: string;
    maxAmount?: string;
  }): Promise<TransactionsResponse> {
    const response = await api.get<TransactionsResponse>('/transactions', { params });
    return response.data;
  },

  async getById(id: string): Promise<Transaction> {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  async create(data: {
    accountId: string;
    categoryId: string;
    amount: string;
    type: 'INCOME' | 'EXPENSE';
    description: string;
    date: string;
  }): Promise<Transaction> {
    const response = await api.post<Transaction>('/transactions', data);
    return response.data;
  },

  async update(id: string, data: {
    categoryId?: string;
    accountId?: string;
    amount?: string;
    type?: 'INCOME' | 'EXPENSE';
    description?: string;
    date?: string;
  }): Promise<Transaction> {
    const response = await api.put<Transaction>(`/transactions/${id}`, data);
    return response.data;
  },

  async updateCategory(id: string, categoryId: string): Promise<Transaction> {
    return this.update(id, { categoryId });
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },
};

