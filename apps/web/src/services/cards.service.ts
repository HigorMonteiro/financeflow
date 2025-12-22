import api from '@/lib/api';

export interface Card {
  id: string;
  userId: string;
  name: string;
  bank: string;
  lastFourDigits?: string | null;
  bestPurchaseDay: number;
  dueDay: number;
  closingDay: number;
  limit?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardData {
  name: string;
  bank: string;
  lastFourDigits?: string;
  bestPurchaseDay: number;
  dueDay: number;
  closingDay: number;
  limit?: string;
}

export interface UpdateCardData {
  name?: string;
  bank?: string;
  lastFourDigits?: string;
  bestPurchaseDay?: number;
  dueDay?: number;
  closingDay?: number;
  limit?: string;
  isActive?: boolean;
}

export const cardsService = {
  async getAll(): Promise<Card[]> {
    const response = await api.get<Card[]>('/cards');
    return response.data;
  },

  async getById(id: string): Promise<Card> {
    const response = await api.get<Card>(`/cards/${id}`);
    return response.data;
  },

  async create(data: CreateCardData): Promise<Card> {
    const response = await api.post<Card>('/cards', data);
    return response.data;
  },

  async update(id: string, data: UpdateCardData): Promise<Card> {
    const response = await api.put<Card>(`/cards/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/cards/${id}`);
  },
};

