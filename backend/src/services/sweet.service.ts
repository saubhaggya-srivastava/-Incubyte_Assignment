import { SweetRepository } from '../repositories/sweet.repository';
import {
  Sweet,
  CreateSweetData,
  UpdateSweetData,
  SearchCriteria,
} from '../types';

/**
 * Sweet Service
 * Business logic for sweet management
 */
export class SweetService {
  /**
   * Create a new sweet with validation
   * @param data - Sweet data
   * @returns Promise<Sweet> - Created sweet
   * @throws Error if price is not positive or quantity is negative
   */
  static async createSweet(data: CreateSweetData): Promise<Sweet> {
    // Validate price is positive
    if (data.price <= 0) {
      throw new Error('Price must be a positive number');
    }

    // Validate quantity is non-negative
    if (data.quantity < 0) {
      throw new Error('Quantity must be a non-negative number');
    }

    return SweetRepository.create(data);
  }

  /**
   * Get all sweets
   * @returns Promise<Sweet[]> - Array of all sweets
   */
  static async getAllSweets(): Promise<Sweet[]> {
    return SweetRepository.findAll();
  }

  /**
   * Get a sweet by ID
   * @param id - Sweet's unique identifier
   * @returns Promise<Sweet> - Sweet
   * @throws Error if sweet not found
   */
  static async getSweetById(id: string): Promise<Sweet> {
    const sweet = await SweetRepository.findById(id);

    if (!sweet) {
      throw new Error('Sweet not found');
    }

    return sweet;
  }

  /**
   * Search sweets by criteria
   * @param criteria - Search criteria (name, category, price range)
   * @returns Promise<Sweet[]> - Array of matching sweets
   */
  static async searchSweets(criteria: SearchCriteria): Promise<Sweet[]> {
    return SweetRepository.search(criteria);
  }

  /**
   * Update a sweet with validation
   * @param id - Sweet's unique identifier
   * @param data - Updated sweet data
   * @returns Promise<Sweet> - Updated sweet
   * @throws Error if sweet not found or validation fails
   */
  static async updateSweet(
    id: string,
    data: UpdateSweetData
  ): Promise<Sweet> {
    // Check if sweet exists
    const exists = await SweetRepository.existsById(id);
    if (!exists) {
      throw new Error('Sweet not found');
    }

    // Validate price if provided
    if (data.price !== undefined && data.price <= 0) {
      throw new Error('Price must be a positive number');
    }

    // Validate quantity if provided
    if (data.quantity !== undefined && data.quantity < 0) {
      throw new Error('Quantity must be a non-negative number');
    }

    return SweetRepository.update(id, data);
  }

  /**
   * Delete a sweet
   * @param id - Sweet's unique identifier
   * @returns Promise<void>
   * @throws Error if sweet not found
   */
  static async deleteSweet(id: string): Promise<void> {
    // Check if sweet exists
    const exists = await SweetRepository.existsById(id);
    if (!exists) {
      throw new Error('Sweet not found');
    }

    await SweetRepository.delete(id);
  }
}
