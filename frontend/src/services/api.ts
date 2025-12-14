import axios from 'axios';
import type {
  AuthResponse,
  LoginData,
  RegisterData,
  Sweet,
  CreateSweetData,
  UpdateSweetData,
  SearchCriteria,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
};

// Sweet API
export const sweetAPI = {
  getAll: async (): Promise<Sweet[]> => {
    const response = await api.get<Sweet[]>('/sweets');
    return response.data;
  },

  search: async (criteria: SearchCriteria): Promise<Sweet[]> => {
    const response = await api.get<Sweet[]>('/sweets/search', {
      params: criteria,
    });
    return response.data;
  },

  create: async (data: CreateSweetData): Promise<Sweet> => {
    const response = await api.post<Sweet>('/sweets', data);
    return response.data;
  },

  update: async (id: string, data: UpdateSweetData): Promise<Sweet> => {
    const response = await api.put<Sweet>(`/sweets/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/sweets/${id}`);
  },

  purchase: async (id: string): Promise<Sweet> => {
    const response = await api.post<Sweet>(`/sweets/${id}/purchase`);
    return response.data;
  },

  restock: async (id: string, quantity: number): Promise<Sweet> => {
    const response = await api.post<Sweet>(`/sweets/${id}/restock`, {
      quantity,
    });
    return response.data;
  },
};

export default api;
