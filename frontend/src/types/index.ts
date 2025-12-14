export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Sweet {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface CreateSweetData {
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface UpdateSweetData {
  name?: string;
  category?: string;
  price?: number;
  quantity?: number;
}

export interface SearchCriteria {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}
