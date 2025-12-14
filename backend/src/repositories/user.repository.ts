import { prisma } from '../config/database';
import { User, CreateUserData } from '../types';

/**
 * User Repository
 * Handles database operations for users
 */
export class UserRepository {
  /**
   * Create a new user
   * @param data - User data (email, passwordHash, role)
   * @returns Promise<User> - Created user
   */
  static async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role || 'user',
      },
    });
  }

  /**
   * Find a user by email
   * @param email - User's email address
   * @returns Promise<User | null> - User if found, null otherwise
   */
  static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find a user by ID
   * @param id - User's unique identifier
   * @returns Promise<User | null> - User if found, null otherwise
   */
  static async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Check if a user exists by email
   * @param email - User's email address
   * @returns Promise<boolean> - True if user exists, false otherwise
   */
  static async existsByEmail(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return user !== null;
  }

  /**
   * Get all users (for admin purposes)
   * @returns Promise<User[]> - Array of all users
   */
  static async findAll(): Promise<User[]> {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete a user by ID
   * @param id - User's unique identifier
   * @returns Promise<void>
   */
  static async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }
}
