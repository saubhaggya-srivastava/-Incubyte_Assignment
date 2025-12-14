import { SweetRepository } from '../repositories/sweet.repository';
import { Sweet } from '../types';

/**
 * Inventory Service
 * Business logic for inventory management (purchase and restock)
 */
export class InventoryService {
  /**
   * Purchase a sweet (decrement quantity by 1)
   * @param id - Sweet's unique identifier
   * @returns Promise<Sweet> - Updated sweet
   * @throws Error if sweet not found or out of stock
   */
  static async purchaseSweet(id: string): Promise<Sweet> {
    // Check if sweet exists
    const sweet = await SweetRepository.findById(id);

    if (!sweet) {
      throw new Error('Sweet not found');
    }

    // Check if sweet is in stock
    if (sweet.quantity <= 0) {
      throw new Error('Sweet is out of stock');
    }

    // Decrement quantity atomically
    return SweetRepository.decrementQuantity(id);
  }

  /**
   * Restock a sweet (increment quantity by specified amount)
   * @param id - Sweet's unique identifier
   * @param quantity - Amount to add to inventory
   * @returns Promise<Sweet> - Updated sweet
   * @throws Error if sweet not found or quantity is not positive
   */
  static async restockSweet(id: string, quantity: number): Promise<Sweet> {
    // Validate quantity is positive
    if (quantity <= 0) {
      throw new Error('Restock quantity must be a positive number');
    }

    // Check if sweet exists
    const exists = await SweetRepository.existsById(id);

    if (!exists) {
      throw new Error('Sweet not found');
    }

    // Increment quantity atomically
    return SweetRepository.incrementQuantity(id, quantity);
  }
}
