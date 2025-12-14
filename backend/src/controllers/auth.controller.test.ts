import request from 'supertest';
import express, { Express } from 'express';
import authRoutes from '../routes/auth.routes';
import { prisma } from '../config/database';

// Set environment variables for testing
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.JWT_EXPIRATION = '24h';

describe('AuthController', () => {
  let app: Express;

  beforeAll(() => {
    // Create Express app for testing
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    // Clean up and disconnect
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.role).toBe('user');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'invalid-email',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for password shorter than 8 characters', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'short',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for duplicate email', async () => {
      // Register first user
      await request(app).post('/api/auth/register').send({
        email: 'duplicate@example.com',
        password: 'password123',
      });

      // Attempt to register with same email
      const response = await request(app).post('/api/auth/register').send({
        email: 'duplicate@example.com',
        password: 'password456',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Email already registered');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app).post('/api/auth/register').send({
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a test user before each login test
      await request(app).post('/api/auth/register').send({
        email: 'login@example.com',
        password: 'password123',
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('login@example.com');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should return JWT token on successful login', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'password123',
      });

      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.split('.')).toHaveLength(3); // JWT format
    });

    it('should return 401 for non-existent email', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(401);
      expect(response.body.error.message).toBe('Invalid credentials');
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.error.message).toBe('Invalid credentials');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'invalid-email',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app).post('/api/auth/login').send({
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should not reveal whether email or password was incorrect', async () => {
      const response1 = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      const response2 = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'wrongpassword',
      });

      expect(response1.body.error.message).toBe(response2.body.error.message);
    });
  });

  describe('Integration tests', () => {
    it('should complete full registration and login flow', async () => {
      // Register
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'fullflow@example.com',
          password: 'password123',
        });

      expect(registerResponse.status).toBe(201);

      // Login
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: 'fullflow@example.com',
        password: 'password123',
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.token).toBeDefined();
      expect(loginResponse.body.user.id).toBe(
        registerResponse.body.user.id
      );
    });
  });
});
