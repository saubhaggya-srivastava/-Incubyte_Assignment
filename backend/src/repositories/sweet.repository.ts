import { prisma } from '../config/database';
import { Sweet, CreateSweetData, UpdateSweetData, SearchCriteria } from '../types';

/**
 * Sweet Repository
 * Handles database operations for sweets
 */
export class SweetRepository {
  /**
   * Create a new sweet
   * @param data - Sweet data (name, category, price, quantity)
   * @returns Promise<Sweet> - Created sweet
   */
  static async create(data: CreateSweetData): Promise<Sweet> {
    return prisma.sweet.create({
      data: {
        name: data.name,
        category: data.category,
        price: data.price,
        quantity: data.quantity,
      },
    });
  }

  /**
   * Find all sweets
   * @returns Promise<Sweet[]> - Array of all sweets
   */
  static async findAll(): Promise<Sweet[]> {
    return prisma.sweet.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find a sweet by ID
   * @param id - Sweet's unique identifier
   * @returns Promise<Sweet | null> - Sweet if found, null otherwise
   */
  static async findById(id: string): Promise<Sweet | null> {
    return prisma.sweet.findUnique({
      where: { id },
    });
  }

  /**
   * Update a sweet
   * @param id - Sweet's unique identifier
   * @param data - Updated sweet data
   * @returns Promise<Sweet> - Updated sweet
   */
  static async update(id: string, data: UpdateSweetData): Promise<Sweet> {
    return prisma.sweet.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a sweet
   * @param id - Sweet's unique identifier
   * @returns Promise<void>
   */
  static async delete(id: string): Promise<void> {
    await prisma.sweet.delete({
      where: { id },
    });
  }

  /**
   * Search sweets by multiple criteria
   * @param criteria - Search criteria (name, category, price range)
   * @returns Promise<Sweet[]> - Array of matching sweets
   */
  static async search(criteria: SearchCriteria): Promise<Sweet[]> {
    const where: any = {};

    // Name search (case-insensitive, partial match)
    // Note: SQLite doesn't support mode: 'insensitive', so we use contains which is case-insensitive by default in SQLite
    if (criteria.name) {
      where.name = {
        contains: criteria.name,
      };
    }

    // Category search (exact match)
    if (criteria.category) {
      where.category = criteria.category;
    }

    // Price range search
    if (criteria.minPrice !== undefined || criteria.maxPrice !== undefined) {
      where.price = {};
      if (criteria.minPrice !== undefined) {
        where.price.gte = criteria.minPrice;
      }
      if (criteria.maxPrice !== undefined) {
        where.price.lte = criteria.maxPrice;
      }
    }

    return prisma.sweet.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Decrement sweet quantity by 1 (for purchase)
   * @param id - Sweet's unique identifier
   * @returns Promise<Sweet> - Updated sweet
   */
  static async decrementQuantity(id: string): Promise<Sweet> {
    return prisma.sweet.update({
      where: { id },
      data: {
        quantity: {
          decrement: 1,
        },
      },
    });
  }

  /**
   * Increment sweet quantity (for restock)
   * @param id - Sweet's unique identifier
   * @param amount - Amount to add to quantity
   * @returns Promise<Sweet> - Updated sweet
   */
  static async incrementQuantity(id: string, amount: number): Promise<Sweet> {
    return prisma.sweet.update({
      where: { id },
      data: {
        quantity: {
          increment: amount,
        },
      },
    });
  }

  /**
   * Check if a sweet exists by ID
   * @param id - Sweet's unique identifier
   * @returns Promise<boolean> - True if sweet exists, false otherwise
   */
  static async existsById(id: string): Promise<boolean> {
    const sweet = await prisma.sweet.findUnique({
      where: { id },
      select: { id: true },
    });
    return sweet !== null;
  }
}
