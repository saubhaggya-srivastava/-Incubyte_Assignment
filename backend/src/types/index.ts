// User types
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: string; // 'user' or 'admin'
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  role?: string;
}

// Sweet types
export interface Sweet {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
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

// DTO types
export interface CreateUserDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateSweetDto {
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface UpdateSweetDto {
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

// Response types
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: any;
  };
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  role: string;
}

// Express Request extension
export interface AuthRequest extends Express.Request {
  user?: {
    userId: string;
    role: string;
  };
}
