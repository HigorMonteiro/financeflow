import api from '@/lib/api';

export type GoalType = 'EMERGENCY_FUND' | 'TRAVEL' | 'PURCHASE' | 'INVESTMENT' | 'OTHER';

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline?: string | null;
  type: GoalType;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalData {
  name: string;
  targetAmount: string;
  currentAmount?: string;
  deadline?: string | null;
  type: GoalType;
}

export interface UpdateGoalData {
  name?: string;
  targetAmount?: string;
  currentAmount?: string;
  deadline?: string | null;
  type?: GoalType;
}

export const goalsService = {
  async getAll(): Promise<Goal[]> {
    const response = await api.get<Goal[]>('/goals');
    return response.data;
  },

  async getById(id: string): Promise<Goal> {
    const response = await api.get<Goal>(`/goals/${id}`);
    return response.data;
  },

  async create(data: CreateGoalData): Promise<Goal> {
    const response = await api.post<Goal>('/goals', data);
    return response.data;
  },

  async update(id: string, data: UpdateGoalData): Promise<Goal> {
    const response = await api.put<Goal>(`/goals/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/goals/${id}`);
  },
};

