import { SweetRepository } from './sweet.repository';
import { prisma } from '../config/database';

describe('SweetRepository', () => {
  // Clean up database before each test
  beforeEach(async () => {
    await prisma.sweet.deleteMany({});
  });

  // Clean up and disconnect after all tests
  afterAll(async () => {
    await prisma.sweet.deleteMany({});
    await prisma.$disconnect();
  });

  describe('create', () => {
    it('should create a new sweet', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'chocolate',
        price: 250,
        quantity: 100,
      };

      const sweet = await SweetRepository.create(sweetData);

      expect(sweet).toBeDefined();
      expect(sweet.id).toBeDefined();
      expect(sweet.name).toBe(sweetData.name);
      expect(sweet.category).toBe(sweetData.category);
      expect(sweet.price).toBe(sweetData.price);
      expect(sweet.quantity).toBe(sweetData.quantity);
      expect(sweet.createdAt).toBeDefined();
      expect(sweet.updatedAt).toBeDefined();
    });

    it('should generate unique IDs for different sweets', async () => {
      const sweet1 = await SweetRepository.create({
        name: 'Sweet 1',
        category: 'candy',
        price: 100,
        quantity: 50,
      });

      const sweet2 = await SweetRepository.create({
        name: 'Sweet 2',
        category: 'candy',
        price: 150,
        quantity: 75,
      });

      expect(sweet1.id).not.toBe(sweet2.id);
    });
  });

  describe('findAll', () => {
    it('should return all sweets', async () => {
      await SweetRepository.create({
        name: 'Sweet 1',
        category: 'candy',
        price: 100,
        quantity: 50,
      });

      await SweetRepository.create({
        name: 'Sweet 2',
        category: 'chocolate',
        price: 200,
        quantity: 75,
      });

      const sweets = await SweetRepository.findAll();

      expect(sweets).toHaveLength(2);
    });

    it('should return empty array when no sweets exist', async () => {
      const sweets = await SweetRepository.findAll();

      expect(sweets).toHaveLength(0);
    });

    it('should return sweets ordered by creation date (newest first)', async () => {
      const sweet1 = await SweetRepository.create({
        name: 'First',
        category: 'candy',
        price: 100,
        quantity: 50,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const sweet2 = await SweetRepository.create({
        name: 'Second',
        category: 'candy',
        price: 100,
        quantity: 50,
      });

      const sweets = await SweetRepository.findAll();

      expect(sweets[0].id).toBe(sweet2.id);
      expect(sweets[1].id).toBe(sweet1.id);
    });
  });

  describe('findById', () => {
    it('should find a sweet by ID', async () => {
      const created = await SweetRepository.create({
        name: 'Test Sweet',
        category: 'candy',
        price: 100,
        quantity: 50,
      });

      const found = await SweetRepository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe(created.name);
    });

    it('should return null for non-existent ID', async () => {
      const sweet = await SweetRepository.findById('non-existent-id');

      expect(sweet).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a sweet', async () => {
      const sweet = await SweetRepository.create({
        name: 'Original Name',
        category: 'candy',
        price: 100,
        quantity: 50,
      });

      const updated = await SweetRepository.update(sweet.id, {
        name: 'Updated Name',
        price: 150,
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.price).toBe(150);
      expect(updated.category).toBe('candy'); // Unchanged
      expect(updated.quantity).toBe(50); // Unchanged
    });

    it('should throw error when updating non-existent sweet', async () => {
      await expect(
        SweetRepository.update('non-existent-id', { name: 'Test' })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a sweet', async () => {
      const sweet = await SweetRepository.create({
        name: 'To Delete',
        category: 'candy',
        price: 100,
        quantity: 50,
      });

      await SweetRepository.delete(sweet.id);

      const found = await SweetRepository.findById(sweet.id);
      expect(found).toBeNull();
    });

    it('should throw error when deleting non-existent sweet', async () => {
      await expect(
        SweetRepository.delete('non-existent-id')
      ).rejects.toThrow();
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      // Create test sweets
      await SweetRepository.create({
        name: 'Milk Chocolate',
        category: 'chocolate',
        price: 250,
        quantity: 100,
      });

      await SweetRepository.create({
        name: 'Dark Chocolate',
        category: 'chocolate',
        price: 300,
        quantity: 50,
      });

      await SweetRepository.create({
        name: 'Gummy Bears',
        category: 'gummy',
        price: 150,
        quantity: 200,
      });

      await SweetRepository.create({
        name: 'Sour Worms',
        category: 'gummy',
        price: 180,
        quantity: 150,
      });
    });

    it('should search by name (case-insensitive)', async () => {
      const results = await SweetRepository.search({ name: 'chocolate' });

      expect(results).toHaveLength(2);
      expect(results.every((s) => s.name.toLowerCase().includes('chocolate'))).toBe(true);
    });

    it('should search by name (partial match)', async () => {
      const results = await SweetRepository.search({ name: 'Gummy' });

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Gummy Bears');
    });

    it('should search by category', async () => {
      const results = await SweetRepository.search({ category: 'gummy' });

      expect(results).toHaveLength(2);
      expect(results.every((s) => s.category === 'gummy')).toBe(true);
    });

    it('should search by minimum price', async () => {
      const results = await SweetRepository.search({ minPrice: 200 });

      expect(results).toHaveLength(2);
      expect(results.every((s) => s.price >= 200)).toBe(true);
    });

    it('should search by maximum price', async () => {
      const results = await SweetRepository.search({ maxPrice: 200 });

      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results.every((s) => s.price <= 200)).toBe(true);
    });

    it('should search by price range', async () => {
      const results = await SweetRepository.search({
        minPrice: 150,
        maxPrice: 250,
      });

      expect(results).toHaveLength(3);
      expect(results.every((s) => s.price >= 150 && s.price <= 250)).toBe(true);
    });

    it('should search by multiple criteria (AND logic)', async () => {
      const results = await SweetRepository.search({
        category: 'chocolate',
        minPrice: 275,
      });

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Dark Chocolate');
    });

    it('should return empty array when no matches found', async () => {
      const results = await SweetRepository.search({
        name: 'NonExistent',
      });

      expect(results).toHaveLength(0);
    });

    it('should return all sweets when no criteria provided', async () => {
      const results = await SweetRepository.search({});

      expect(results).toHaveLength(4);
    });
  });

  describe('decrementQuantity', () => {
    it('should decrement quantity by 1', async () => {
      const sweet = await SweetRepository.create({
        name: 'Test Sweet',
        category: 'candy',
        price: 100,
        quantity: 10,
      });

      const updated = await SweetRepository.decrementQuantity(sweet.id);

      expect(updated.quantity).toBe(9);
    });

    it('should allow decrementing to 0', async () => {
      const sweet = await SweetRepository.create({
        name: 'Test Sweet',
        category: 'candy',
        price: 100,
        quantity: 1,
      });

      const updated = await SweetRepository.decrementQuantity(sweet.id);

      expect(updated.quantity).toBe(0);
    });

    it('should throw error when decrementing non-existent sweet', async () => {
      await expect(
        SweetRepository.decrementQuantity('non-existent-id')
      ).rejects.toThrow();
    });
  });

  describe('incrementQuantity', () => {
    it('should increment quantity by specified amount', async () => {
      const sweet = await SweetRepository.create({
        name: 'Test Sweet',
        category: 'candy',
        price: 100,
        quantity: 10,
      });

      const updated = await SweetRepository.incrementQuantity(sweet.id, 5);

      expect(updated.quantity).toBe(15);
    });

    it('should handle large increment amounts', async () => {
      const sweet = await SweetRepository.create({
        name: 'Test Sweet',
        category: 'candy',
        price: 100,
        quantity: 10,
      });

      const updated = await SweetRepository.incrementQuantity(sweet.id, 1000);

      expect(updated.quantity).toBe(1010);
    });

    it('should throw error when incrementing non-existent sweet', async () => {
      await expect(
        SweetRepository.incrementQuantity('non-existent-id', 5)
      ).rejects.toThrow();
    });
  });

  describe('existsById', () => {
    it('should return true if sweet exists', async () => {
      const sweet = await SweetRepository.create({
        name: 'Test Sweet',
        category: 'candy',
        price: 100,
        quantity: 50,
      });

      const exists = await SweetRepository.existsById(sweet.id);

      expect(exists).toBe(true);
    });

    it('should return false if sweet does not exist', async () => {
      const exists = await SweetRepository.existsById('non-existent-id');

      expect(exists).toBe(false);
    });
  });

  describe('Integration tests', () => {
    it('should handle complete sweet lifecycle', async () => {
      // Create
      const sweet = await SweetRepository.create({
        name: 'Lifecycle Sweet',
        category: 'candy',
        price: 100,
        quantity: 50,
      });

      // Find by ID
      const found = await SweetRepository.findById(sweet.id);
      expect(found?.id).toBe(sweet.id);

      // Update
      const updated = await SweetRepository.update(sweet.id, {
        price: 150,
      });
      expect(updated.price).toBe(150);

      // Decrement quantity
      const afterPurchase = await SweetRepository.decrementQuantity(sweet.id);
      expect(afterPurchase.quantity).toBe(49);

      // Increment quantity
      const afterRestock = await SweetRepository.incrementQuantity(sweet.id, 10);
      expect(afterRestock.quantity).toBe(59);

      // Delete
      await SweetRepository.delete(sweet.id);
      const afterDelete = await SweetRepository.findById(sweet.id);
      expect(afterDelete).toBeNull();
    });
  });
});
