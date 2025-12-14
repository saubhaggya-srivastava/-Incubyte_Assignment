import request from 'supertest';
import express from 'express';
import { inventoryRoutes } from '../routes/inventory.routes';
import { InventoryService } from '../services/inventory.service';
import { TokenService } from '../services/token.service';
import { prisma } from '../config/database';

// Set environment variables before imports
process.env.JWT_SECRET = 'test-secret-key';

// Mock the service
jest.mock('../services/inventory.service');

const app = express();
app.use(express.json());
app.use('/api/sweets', inventoryRoutes);

describe('InventoryController', () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(() => {
    // Generate tokens for testing
    adminToken = TokenService.generateToken('admin-id', 'admin');
    userToken = TokenService.generateToken('user-id', 'user');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/sweets/:id/purchase', () => {
    it('should purchase a sweet as authenticated user', async () => {
      const mockSweet = {
        id: '1',
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: 9,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (InventoryService.purchaseSweet as jest.Mock).mockResolvedValue(mockSweet);

      const response = await request(app)
        .post('/api/sweets/1/purchase')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.quantity).toBe(9);
      expect(InventoryService.purchaseSweet).toHaveBeenCalledWith('1');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).post('/api/sweets/1/purchase');

      expect(response.status).toBe(401);
      expect(InventoryService.purchaseSweet).not.toHaveBeenCalled();
    });

    it('should return 404 when sweet not found', async () => {
      (InventoryService.purchaseSweet as jest.Mock).mockRejectedValue(
        new Error('Sweet not found')
      );

      const response = await request(app)
        .post('/api/sweets/999/purchase')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 400 when sweet is out of stock', async () => {
      (InventoryService.purchaseSweet as jest.Mock).mockRejectedValue(
        new Error('Sweet is out of stock')
      );

      const response = await request(app)
        .post('/api/sweets/1/purchase')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(400);
    });

    it('should allow admin to purchase', async () => {
      const mockSweet = {
        id: '1',
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: 9,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (InventoryService.purchaseSweet as jest.Mock).mockResolvedValue(mockSweet);

      const response = await request(app)
        .post('/api/sweets/1/purchase')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it('should return 500 for unexpected errors', async () => {
      (InventoryService.purchaseSweet as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .post('/api/sweets/1/purchase')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/sweets/:id/restock', () => {
    const restockData = {
      quantity: 50,
    };

    it('should restock a sweet as admin', async () => {
      const mockSweet = {
        id: '1',
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (InventoryService.restockSweet as jest.Mock).mockResolvedValue(mockSweet);

      const response = await request(app)
        .post('/api/sweets/1/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(restockData);

      expect(response.status).toBe(200);
      expect(response.body.quantity).toBe(60);
      expect(InventoryService.restockSweet).toHaveBeenCalledWith('1', 50);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/sweets/1/restock')
        .send(restockData);

      expect(response.status).toBe(401);
      expect(InventoryService.restockSweet).not.toHaveBeenCalled();
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/api/sweets/1/restock')
        .set('Authorization', `Bearer ${userToken}`)
        .send(restockData);

      expect(response.status).toBe(403);
      expect(InventoryService.restockSweet).not.toHaveBeenCalled();
    });

    it('should return 404 when sweet not found', async () => {
      (InventoryService.restockSweet as jest.Mock).mockRejectedValue(
        new Error('Sweet not found')
      );

      const response = await request(app)
        .post('/api/sweets/999/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(restockData);

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid quantity', async () => {
      const invalidData = {
        quantity: -10,
      };

      const response = await request(app)
        .post('/api/sweets/1/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(InventoryService.restockSweet).not.toHaveBeenCalled();
    });

    it('should return 400 for zero quantity', async () => {
      const invalidData = {
        quantity: 0,
      };

      const response = await request(app)
        .post('/api/sweets/1/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(InventoryService.restockSweet).not.toHaveBeenCalled();
    });

    it('should return 400 for missing quantity', async () => {
      const response = await request(app)
        .post('/api/sweets/1/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(InventoryService.restockSweet).not.toHaveBeenCalled();
    });

    it('should return 400 for non-integer quantity', async () => {
      const invalidData = {
        quantity: 10.5,
      };

      const response = await request(app)
        .post('/api/sweets/1/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(InventoryService.restockSweet).not.toHaveBeenCalled();
    });
  });
});
