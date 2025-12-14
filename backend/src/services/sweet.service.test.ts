import { SweetService } from './sweet.service';
import { SweetRepository } from '../repositories/sweet.repository';
import { Sweet } from '../types';

// Mock the repository
jest.mock('../repositories/sweet.repository');

describe('SweetService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSweet', () => {
    it('should create a sweet with valid data', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: 100,
      };

      const mockSweet: Sweet = {
        id: '1',
        ...sweetData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (SweetRepository.create as jest.Mock).mockResolvedValue(mockSweet);

      const result = await SweetService.createSweet(sweetData);

      expect(result).toEqual(mockSweet);
      expect(SweetRepository.create).toHaveBeenCalledWith(sweetData);
    });

    it('should throw error for negative price', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: -2.5,
        quantity: 100,
      };

      await expect(SweetService.createSweet(sweetData)).rejects.toThrow(
        'Price must be a positive number'
      );
      expect(SweetRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error for zero price', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 0,
        quantity: 100,
      };

      await expect(SweetService.createSweet(sweetData)).rejects.toThrow(
        'Price must be a positive number'
      );
    });

    it('should throw error for negative quantity', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: -10,
      };

      await expect(SweetService.createSweet(sweetData)).rejects.toThrow(
        'Quantity must be a non-negative number'
      );
    });

    it('should allow zero quantity', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: 0,
      };

      const mockSweet: Sweet = {
        id: '1',
        ...sweetData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (SweetRepository.create as jest.Mock).mockResolvedValue(mockSweet);

      const result = await SweetService.createSweet(sweetData);

      expect(result).toEqual(mockSweet);
    });
  });

  describe('getAllSweets', () => {
    it('should return all sweets', async () => {
      const mockSweets: Sweet[] = [
        {
          id: '1',
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 2.5,
          quantity: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Gummy Bears',
          category: 'Gummy',
          price: 1.5,
          quantity: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (SweetRepository.findAll as jest.Mock).mockResolvedValue(mockSweets);

      const result = await SweetService.getAllSweets();

      expect(result).toEqual(mockSweets);
      expect(SweetRepository.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no sweets exist', async () => {
      (SweetRepository.findAll as jest.Mock).mockResolvedValue([]);

      const result = await SweetService.getAllSweets();

      expect(result).toEqual([]);
    });
  });

  describe('getSweetById', () => {
    it('should return sweet when found', async () => {
      const mockSweet: Sweet = {
        id: '1',
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (SweetRepository.findById as jest.Mock).mockResolvedValue(mockSweet);

      const result = await SweetService.getSweetById('1');

      expect(result).toEqual(mockSweet);
      expect(SweetRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw error when sweet not found', async () => {
      (SweetRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(SweetService.getSweetById('999')).rejects.toThrow(
        'Sweet not found'
      );
    });
  });

  describe('searchSweets', () => {
    it('should search sweets by name', async () => {
      const mockSweets: Sweet[] = [
        {
          id: '1',
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 2.5,
          quantity: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (SweetRepository.search as jest.Mock).mockResolvedValue(mockSweets);

      const result = await SweetService.searchSweets({ name: 'Chocolate' });

      expect(result).toEqual(mockSweets);
      expect(SweetRepository.search).toHaveBeenCalledWith({ name: 'Chocolate' });
    });

    it('should search sweets by category', async () => {
      const mockSweets: Sweet[] = [
        {
          id: '1',
          name: 'Gummy Bears',
          category: 'Gummy',
          price: 1.5,
          quantity: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (SweetRepository.search as jest.Mock).mockResolvedValue(mockSweets);

      const result = await SweetService.searchSweets({ category: 'Gummy' });

      expect(result).toEqual(mockSweets);
      expect(SweetRepository.search).toHaveBeenCalledWith({ category: 'Gummy' });
    });

    it('should search sweets by price range', async () => {
      const mockSweets: Sweet[] = [
        {
          id: '1',
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 2.5,
          quantity: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (SweetRepository.search as jest.Mock).mockResolvedValue(mockSweets);

      const result = await SweetService.searchSweets({
        minPrice: 2.0,
        maxPrice: 3.0,
      });

      expect(result).toEqual(mockSweets);
      expect(SweetRepository.search).toHaveBeenCalledWith({
        minPrice: 2.0,
        maxPrice: 3.0,
      });
    });

    it('should search sweets with multiple criteria', async () => {
      const mockSweets: Sweet[] = [];

      (SweetRepository.search as jest.Mock).mockResolvedValue(mockSweets);

      const result = await SweetService.searchSweets({
        name: 'Chocolate',
        category: 'Chocolate',
        minPrice: 2.0,
        maxPrice: 5.0,
      });

      expect(result).toEqual(mockSweets);
      expect(SweetRepository.search).toHaveBeenCalledWith({
        name: 'Chocolate',
        category: 'Chocolate',
        minPrice: 2.0,
        maxPrice: 5.0,
      });
    });

    it('should return empty array when no matches found', async () => {
      (SweetRepository.search as jest.Mock).mockResolvedValue([]);

      const result = await SweetService.searchSweets({ name: 'NonExistent' });

      expect(result).toEqual([]);
    });
  });

  describe('updateSweet', () => {
    it('should update sweet with valid data', async () => {
      const updateData = {
        name: 'Updated Chocolate',
        price: 3.0,
      };

      const mockSweet: Sweet = {
        id: '1',
        name: 'Updated Chocolate',
        category: 'Chocolate',
        price: 3.0,
        quantity: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (SweetRepository.existsById as jest.Mock).mockResolvedValue(true);
      (SweetRepository.update as jest.Mock).mockResolvedValue(mockSweet);

      const result = await SweetService.updateSweet('1', updateData);

      expect(result).toEqual(mockSweet);
      expect(SweetRepository.existsById).toHaveBeenCalledWith('1');
      expect(SweetRepository.update).toHaveBeenCalledWith('1', updateData);
    });

    it('should throw error when sweet not found', async () => {
      (SweetRepository.existsById as jest.Mock).mockResolvedValue(false);

      await expect(
        SweetService.updateSweet('999', { name: 'Updated' })
      ).rejects.toThrow('Sweet not found');

      expect(SweetRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error for negative price in update', async () => {
      (SweetRepository.existsById as jest.Mock).mockResolvedValue(true);

      await expect(
        SweetService.updateSweet('1', { price: -5.0 })
      ).rejects.toThrow('Price must be a positive number');

      expect(SweetRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error for zero price in update', async () => {
      (SweetRepository.existsById as jest.Mock).mockResolvedValue(true);

      await expect(
        SweetService.updateSweet('1', { price: 0 })
      ).rejects.toThrow('Price must be a positive number');
    });

    it('should throw error for negative quantity in update', async () => {
      (SweetRepository.existsById as jest.Mock).mockResolvedValue(true);

      await expect(
        SweetService.updateSweet('1', { quantity: -10 })
      ).rejects.toThrow('Quantity must be a non-negative number');
    });

    it('should allow zero quantity in update', async () => {
      const updateData = { quantity: 0 };

      const mockSweet: Sweet = {
        id: '1',
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (SweetRepository.existsById as jest.Mock).mockResolvedValue(true);
      (SweetRepository.update as jest.Mock).mockResolvedValue(mockSweet);

      const result = await SweetService.updateSweet('1', updateData);

      expect(result).toEqual(mockSweet);
    });
  });

  describe('deleteSweet', () => {
    it('should delete sweet when it exists', async () => {
      (SweetRepository.existsById as jest.Mock).mockResolvedValue(true);
      (SweetRepository.delete as jest.Mock).mockResolvedValue(undefined);

      await SweetService.deleteSweet('1');

      expect(SweetRepository.existsById).toHaveBeenCalledWith('1');
      expect(SweetRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw error when sweet not found', async () => {
      (SweetRepository.existsById as jest.Mock).mockResolvedValue(false);

      await expect(SweetService.deleteSweet('999')).rejects.toThrow(
        'Sweet not found'
      );

      expect(SweetRepository.delete).not.toHaveBeenCalled();
    });
  });
});
