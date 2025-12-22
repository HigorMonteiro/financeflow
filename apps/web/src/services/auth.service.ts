import api from '@/lib/api';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  itemsPerPage?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async register(data: RegisterInput): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    localStorage.setItem('token', response.data.token);
    return response.data;
  },

  async login(data: LoginInput): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    localStorage.setItem('token', response.data.token);
    return response.data;
  },

  async me(): Promise<{ user: User }> {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  },

  async update(data: {
    name?: string;
    email?: string;
    password?: string;
    currentPassword?: string;
    itemsPerPage?: number;
  }): Promise<User> {
    const response = await api.put<User>('/user', data);
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('token');
  },
};

