import api from '@/lib/api';

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: string;
  currency: string;
  billingStartDay?: number | null;
  billingEndDay?: number | null;
}

export const accountsService = {
  async getAll(): Promise<Account[]> {
    const response = await api.get<Account[]>('/accounts');
    return response.data;
  },

  async create(data: {
    name: string;
    type: string;
    balance: string;
    currency: string;
    billingStartDay?: number | null;
    billingEndDay?: number | null;
  }): Promise<Account> {
    const response = await api.post<Account>('/accounts', data);
    return response.data;
  },

  async update(id: string, data: Partial<Account>): Promise<Account> {
    const response = await api.put<Account>(`/accounts/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/accounts/${id}`);
  },
};

