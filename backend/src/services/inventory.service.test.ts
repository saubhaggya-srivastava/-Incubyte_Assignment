import { InventoryService } from './inventory.service';
import { SweetRepository } from '../repositories/sweet.repository';
import { Sweet } from '../types';

// Mock the repository
jest.mock('../repositories/sweet.repository');

describe('InventoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('purchaseSweet', () => {
    it('should purchase a sweet when quantity is available', async () => {
      const mockSweet: Sweet = {
        id: '1',
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedSweet: Sweet = {
        ...mockSweet,
        quantity: 9,
      };

      (SweetRepository.findById as jest.Mock).mockResolvedValue(mockSweet);
      (SweetRepository.decrementQuantity as jest.Mock).mockResolvedValue(
        updatedSweet
      );

      const result = await InventoryService.purchaseSweet('1');

      expect(result).toEqual(updatedSweet);
      expect(SweetRepository.findById).toHaveBeenCalledWith('1');
      expect(SweetRepository.decrementQuantity).toHaveBeenCalledWith('1');
    });

    it('should throw error when sweet not found', async () => {
      (SweetRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(InventoryService.purchaseSweet('999')).rejects.toThrow(
        'Sweet not found'
      );

      expect(SweetRepository.decrementQuantity).not.toHaveBeenCalled();
    });

    it('should throw error when sweet is out of stock', async () => {
      const mockSweet: Sweet = {
        id: '1',
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (SweetRepository.findById as jest.Mock).mockResolvedValue(mockSweet);

      await expect(InventoryService.purchaseSweet('1')).rejects.toThrow(
        'Sweet is out of stock'
      );

      expect(SweetRepository.decrementQuantity).not.toHaveBeenCalled();
    });

    it('should handle multiple purchases correctly', async () => {
      const mockSweet: Sweet = {
        id: '1',
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedSweet: Sweet = {
        ...mockSweet,
        quantity: 4,
      };

      (SweetRepository.findById as jest.Mock).mockResolvedValue(mockSweet);
      (SweetRepository.decrementQuantity as jest.Mock).mockResolvedValue(
        updatedSweet
      );

      const result = await InventoryService.purchaseSweet('1');

      expect(result.quantity).toBe(4);
    });
  });

  describe('restockSweet', () => {
    it('should restock a sweet with valid quantity', async () => {
      const mockSweet: Sweet = {
        id: '1',
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedSweet: Sweet = {
        ...mockSweet,
        quantity: 60,
      };

      (SweetRepository.existsById as jest.Mock).mockResolvedValue(true);
      (SweetRepository.incrementQuantity as jest.Mock).mockResolvedValue(
        updatedSweet
      );

      const result = await InventoryService.restockSweet('1', 50);

      expect(result).toEqual(updatedSweet);
      expect(SweetRepository.existsById).toHaveBeenCalledWith('1');
      expect(SweetRepository.incrementQuantity).toHaveBeenCalledWith('1', 50);
    });

    it('should throw error when sweet not found', async () => {
      (SweetRepository.existsById as jest.Mock).mockResolvedValue(false);

      await expect(InventoryService.restockSweet('999', 50)).rejects.toThrow(
        'Sweet not found'
      );

      expect(SweetRepository.incrementQuantity).not.toHaveBeenCalled();
    });

    it('should throw error for zero quantity', async () => {
      (SweetRepository.existsById as jest.Mock).mockResolvedValue(true);

      await expect(InventoryService.restockSweet('1', 0)).rejects.toThrow(
        'Restock quantity must be a positive number'
      );

      expect(SweetRepository.incrementQuantity).not.toHaveBeenCalled();
    });

    it('should throw error for negative quantity', async () => {
      (SweetRepository.existsById as jest.Mock).mockResolvedValue(true);

      await expect(InventoryService.restockSweet('1', -10)).rejects.toThrow(
        'Restock quantity must be a positive number'
      );

      expect(SweetRepository.incrementQuantity).not.toHaveBeenCalled();
    });

    it('should allow restocking from zero quantity', async () => {
      const mockSweet: Sweet = {
        id: '1',
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedSweet: Sweet = {
        ...mockSweet,
        quantity: 100,
      };

      (SweetRepository.existsById as jest.Mock).mockResolvedValue(true);
      (SweetRepository.incrementQuantity as jest.Mock).mockResolvedValue(
        updatedSweet
      );

      const result = await InventoryService.restockSweet('1', 100);

      expect(result.quantity).toBe(100);
    });

    it('should handle large restock quantities', async () => {
      const mockSweet: Sweet = {
        id: '1',
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedSweet: Sweet = {
        ...mockSweet,
        quantity: 1010,
      };

      (SweetRepository.existsById as jest.Mock).mockResolvedValue(true);
      (SweetRepository.incrementQuantity as jest.Mock).mockResolvedValue(
        updatedSweet
      );

      const result = await InventoryService.restockSweet('1', 1000);

      expect(result.quantity).toBe(1010);
      expect(SweetRepository.incrementQuantity).toHaveBeenCalledWith('1', 1000);
    });
  });
});
