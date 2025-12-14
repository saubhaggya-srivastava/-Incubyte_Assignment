import { UserRepository } from './user.repository';
import { prisma } from '../config/database';

describe('UserRepository', () => {
  // Clean up database before each test
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  // Clean up and disconnect after all tests
  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('create', () => {
    it('should create a new user with default role', async () => {
      const userData = {
        email: 'test@example.com',
        passwordHash: 'hashed_password',
      };

      const user = await UserRepository.create(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.passwordHash).toBe(userData.passwordHash);
      expect(user.role).toBe('user');
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should create a user with admin role', async () => {
      const userData = {
        email: 'admin@example.com',
        passwordHash: 'hashed_password',
        role: 'admin',
      };

      const user = await UserRepository.create(userData);

      expect(user.role).toBe('admin');
    });

    it('should generate unique IDs for different users', async () => {
      const user1 = await UserRepository.create({
        email: 'user1@example.com',
        passwordHash: 'hash1',
      });

      const user2 = await UserRepository.create({
        email: 'user2@example.com',
        passwordHash: 'hash2',
      });

      expect(user1.id).not.toBe(user2.id);
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        passwordHash: 'hashed_password',
      };

      await UserRepository.create(userData);

      await expect(UserRepository.create(userData)).rejects.toThrow();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const userData = {
        email: 'find@example.com',
        passwordHash: 'hashed_password',
      };

      const createdUser = await UserRepository.create(userData);
      const foundUser = await UserRepository.findByEmail(userData.email);

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe(userData.email);
    });

    it('should return null for non-existent email', async () => {
      const user = await UserRepository.findByEmail('nonexistent@example.com');

      expect(user).toBeNull();
    });

    it('should be case-sensitive for email', async () => {
      await UserRepository.create({
        email: 'test@example.com',
        passwordHash: 'hash',
      });

      const user = await UserRepository.findByEmail('TEST@EXAMPLE.COM');

      expect(user).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find a user by ID', async () => {
      const createdUser = await UserRepository.create({
        email: 'findbyid@example.com',
        passwordHash: 'hashed_password',
      });

      const foundUser = await UserRepository.findById(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe(createdUser.email);
    });

    it('should return null for non-existent ID', async () => {
      const user = await UserRepository.findById('non-existent-id');

      expect(user).toBeNull();
    });
  });

  describe('existsByEmail', () => {
    it('should return true if user exists', async () => {
      const email = 'exists@example.com';
      await UserRepository.create({
        email,
        passwordHash: 'hash',
      });

      const exists = await UserRepository.existsByEmail(email);

      expect(exists).toBe(true);
    });

    it('should return false if user does not exist', async () => {
      const exists = await UserRepository.existsByEmail(
        'notexists@example.com'
      );

      expect(exists).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      await UserRepository.create({
        email: 'user1@example.com',
        passwordHash: 'hash1',
      });

      await UserRepository.create({
        email: 'user2@example.com',
        passwordHash: 'hash2',
      });

      const users = await UserRepository.findAll();

      expect(users).toHaveLength(2);
      expect(users[0].email).toBeDefined();
      expect(users[1].email).toBeDefined();
    });

    it('should return empty array when no users exist', async () => {
      const users = await UserRepository.findAll();

      expect(users).toHaveLength(0);
    });

    it('should return users ordered by creation date (newest first)', async () => {
      const user1 = await UserRepository.create({
        email: 'first@example.com',
        passwordHash: 'hash1',
      });

      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const user2 = await UserRepository.create({
        email: 'second@example.com',
        passwordHash: 'hash2',
      });

      const users = await UserRepository.findAll();

      expect(users[0].id).toBe(user2.id); // Newest first
      expect(users[1].id).toBe(user1.id);
    });
  });

  describe('delete', () => {
    it('should delete a user by ID', async () => {
      const user = await UserRepository.create({
        email: 'delete@example.com',
        passwordHash: 'hash',
      });

      await UserRepository.delete(user.id);

      const foundUser = await UserRepository.findById(user.id);
      expect(foundUser).toBeNull();
    });

    it('should throw error when deleting non-existent user', async () => {
      await expect(
        UserRepository.delete('non-existent-id')
      ).rejects.toThrow();
    });
  });

  describe('Integration tests', () => {
    it('should handle complete user lifecycle', async () => {
      // Create user
      const user = await UserRepository.create({
        email: 'lifecycle@example.com',
        passwordHash: 'hashed_password',
        role: 'admin',
      });

      // Find by email
      const foundByEmail = await UserRepository.findByEmail(user.email);
      expect(foundByEmail?.id).toBe(user.id);

      // Find by ID
      const foundById = await UserRepository.findById(user.id);
      expect(foundById?.email).toBe(user.email);

      // Check exists
      const exists = await UserRepository.existsByEmail(user.email);
      expect(exists).toBe(true);

      // Delete
      await UserRepository.delete(user.id);

      // Verify deletion
      const afterDelete = await UserRepository.findById(user.id);
      expect(afterDelete).toBeNull();
    });
  });
});
