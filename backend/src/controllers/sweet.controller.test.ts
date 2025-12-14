import request from 'supertest';
import express from 'express';
import { sweetRoutes } from '../routes/sweet.routes';
import { SweetService } from '../services/sweet.service';
import { TokenService } from '../services/token.service';
import { prisma } from '../config/database';

// Set environment variables before imports
process.env.JWT_SECRET = 'test-secret-key';

// Mock the service
jest.mock('../services/sweet.service');

const app = express();
app.use(express.json());
app.use('/api/sweets', sweetRoutes);

describe('SweetController', () => {
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

  describe('POST /api/sweets', () => {
    const validSweetData = {
      name: 'Chocolate Bar',
      category: 'Chocolate',
      price: 2.5,
      quantity: 100,
    };

    it('should create a sweet as admin', async () => {
      const mockSweet = {
        id: '1',
        ...validSweetData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (SweetService.createSweet as jest.Mock).mockResolvedValue(mockSweet);

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validSweetData);

      expect(response.status).toBe(201);
      expect(response.body.id).toBe(mockSweet.id);
      expect(response.body.name).toBe(mockSweet.name);
      expect(response.body.category).toBe(mockSweet.category);
      expect(response.body.price).toBe(mockSweet.price);
      expect(response.body.quantity).toBe(mockSweet.quantity);
      expect(SweetService.createSweet).toHaveBeenCalledWith(validSweetData);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .send(validSweetData);

      expect(response.status).toBe(401);
      expect(SweetService.createSweet).not.toHaveBeenCalled();
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validSweetData);

      expect(response.status).toBe(403);
      expect(SweetService.createSweet).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: '',
        category: 'Chocolate',
        price: -2.5,
        quantity: 100,
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(SweetService.createSweet).not.toHaveBeenCalled();
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteData);

      expect(response.status).toBe(400);
      expect(SweetService.createSweet).not.toHaveBeenCalled();
    });

    it('should return 500 for service errors', async () => {
      (SweetService.createSweet as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validSweetData);

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/sweets', () => {
    it('should return all sweets for authenticated users', async () => {
      const mockSweets = [
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

      (SweetService.getAllSweets as jest.Mock).mockResolvedValue(mockSweets);

      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Chocolate Bar');
      expect(response.body[1].name).toBe('Gummy Bears');
      expect(SweetService.getAllSweets).toHaveBeenCalled();
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/sweets');

      expect(response.status).toBe(401);
      expect(SweetService.getAllSweets).not.toHaveBeenCalled();
    });

    it('should return empty array when no sweets exist', async () => {
      (SweetService.getAllSweets as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/sweets/search', () => {
    it('should search sweets by name', async () => {
      const mockSweets = [
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

      (SweetService.searchSweets as jest.Mock).mockResolvedValue(mockSweets);

      const response = await request(app)
        .get('/api/sweets/search?name=Chocolate')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Chocolate Bar');
      expect(SweetService.searchSweets).toHaveBeenCalledWith({
        name: 'Chocolate',
      });
    });

    it('should search sweets by category', async () => {
      const mockSweets = [
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

      (SweetService.searchSweets as jest.Mock).mockResolvedValue(mockSweets);

      const response = await request(app)
        .get('/api/sweets/search?category=Gummy')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].category).toBe('Gummy');
      expect(SweetService.searchSweets).toHaveBeenCalledWith({
        category: 'Gummy',
      });
    });

    it('should search sweets by price range', async () => {
      const mockSweets = [
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

      (SweetService.searchSweets as jest.Mock).mockResolvedValue(mockSweets);

      const response = await request(app)
        .get('/api/sweets/search?minPrice=2&maxPrice=3')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].price).toBe(2.5);
      expect(SweetService.searchSweets).toHaveBeenCalledWith({
        minPrice: 2,
        maxPrice: 3,
      });
    });

    it('should search with multiple criteria', async () => {
      const mockSweets: any[] = [];

      (SweetService.searchSweets as jest.Mock).mockResolvedValue(mockSweets);

      const response = await request(app)
        .get('/api/sweets/search?name=Chocolate&category=Chocolate&minPrice=2&maxPrice=5')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSweets);
      expect(SweetService.searchSweets).toHaveBeenCalledWith({
        name: 'Chocolate',
        category: 'Chocolate',
        minPrice: 2,
        maxPrice: 5,
      });
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/sweets/search?name=Chocolate');

      expect(response.status).toBe(401);
      expect(SweetService.searchSweets).not.toHaveBeenCalled();
    });

    it('should return empty array when no matches found', async () => {
      (SweetService.searchSweets as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/sweets/search?name=NonExistent')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('PUT /api/sweets/:id', () => {
    const updateData = {
      name: 'Updated Chocolate',
      price: 3.0,
    };

    it('should update a sweet as admin', async () => {
      const mockSweet = {
        id: '1',
        name: 'Updated Chocolate',
        category: 'Chocolate',
        price: 3.0,
        quantity: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (SweetService.updateSweet as jest.Mock).mockResolvedValue(mockSweet);

      const response = await request(app)
        .put('/api/sweets/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Chocolate');
      expect(response.body.price).toBe(3.0);
      expect(SweetService.updateSweet).toHaveBeenCalledWith('1', updateData);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put('/api/sweets/1')
        .send(updateData);

      expect(response.status).toBe(401);
      expect(SweetService.updateSweet).not.toHaveBeenCalled();
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .put('/api/sweets/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(SweetService.updateSweet).not.toHaveBeenCalled();
    });

    it('should return 404 when sweet not found', async () => {
      (SweetService.updateSweet as jest.Mock).mockRejectedValue(
        new Error('Sweet not found')
      );

      const response = await request(app)
        .put('/api/sweets/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        price: -5.0,
      };

      const response = await request(app)
        .put('/api/sweets/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(SweetService.updateSweet).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    it('should delete a sweet as admin', async () => {
      (SweetService.deleteSweet as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/api/sweets/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);
      expect(SweetService.deleteSweet).toHaveBeenCalledWith('1');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).delete('/api/sweets/1');

      expect(response.status).toBe(401);
      expect(SweetService.deleteSweet).not.toHaveBeenCalled();
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .delete('/api/sweets/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(SweetService.deleteSweet).not.toHaveBeenCalled();
    });

    it('should return 404 when sweet not found', async () => {
      (SweetService.deleteSweet as jest.Mock).mockRejectedValue(
        new Error('Sweet not found')
      );

      const response = await request(app)
        .delete('/api/sweets/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
