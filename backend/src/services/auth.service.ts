import { UserRepository } from '../repositories/user.repository';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { User, AuthResponse } from '../types';

/**
 * Authentication Service
 * Handles user registration and login
 */
export class AuthService {
  /**
   * Register a new user
   * @param email - User's email address
   * @param password - User's plain text password
   * @returns Promise<User> - Created user
   * @throws Error if email already exists or validation fails
   */
  static async registerUser(email: string, password: string): Promise<User> {
    // Validate email format
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password length
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Check if user already exists
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await PasswordService.hashPassword(password);

    // Create user
    const user = await UserRepository.create({
      email,
      passwordHash,
      role: 'user', // Default role
    });

    return user;
  }

  /**
   * Login a user
   * @param email - User's email address
   * @param password - User's plain text password
   * @returns Promise<AuthResponse> - JWT token and user data
   * @throws Error if credentials are invalid
   */
  static async loginUser(
    email: string,
    password: string
  ): Promise<AuthResponse> {
    // Find user by email
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Compare password
    const isPasswordValid = await PasswordService.comparePassword(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = TokenService.generateToken(user.id, user.role);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Validate email format
   * @param email - Email address to validate
   * @returns boolean - True if valid, false otherwise
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
