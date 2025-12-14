import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { prisma } from '../config/database';

// Set environment variables for testing
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.JWT_EXPIRATION = '24h';

describe('AuthService', () => {
  // Clean up database before each test
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  // Clean up and disconnect after all tests
  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('registerUser', () => {
    it('should register a new user with valid credentials', async () => {
      const email = 'newuser@example.com';
      const password = 'password123';

      const user = await AuthService.registerUser(email, password);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.role).toBe('user');
      expect(user.passwordHash).not.toBe(password); // Password should be hashed
    });

    it('should hash the password before storing', async () => {
      const email = 'hashtest@example.com';
      const password = 'password123';

      const user = await AuthService.registerUser(email, password);

      // Verify password is hashed
      expect(user.passwordHash).not.toBe(password);
      expect(user.passwordHash.length).toBeGreaterThan(password.length);

      // Verify hash is valid bcrypt hash
      expect(user.passwordHash).toMatch(/^\$2[aby]\$\d{2}\$/);
    });

    it('should reject registration with invalid email format', async () => {
      const invalidEmails = [
        'notanemail',
        'missing@domain',
        '@nodomain.com',
        'spaces in@email.com',
      ];

      for (const email of invalidEmails) {
        await expect(
          AuthService.registerUser(email, 'password123')
        ).rejects.toThrow('Invalid email format');
      }
    });

    it('should reject registration with password shorter than 8 characters', async () => {
      const email = 'test@example.com';
      const shortPasswords = ['pass', '1234567', 'short'];

      for (const password of shortPasswords) {
        await expect(
          AuthService.registerUser(email, password)
        ).rejects.toThrow('Password must be at least 8 characters long');
      }
    });

    it('should reject registration with duplicate email', async () => {
      const email = 'duplicate@example.com';
      const password = 'password123';

      // Register first user
      await AuthService.registerUser(email, password);

      // Attempt to register with same email
      await expect(
        AuthService.registerUser(email, 'differentpassword')
      ).rejects.toThrow('Email already registered');
    });

    it('should accept password with exactly 8 characters', async () => {
      const email = 'minlength@example.com';
      const password = '12345678'; // Exactly 8 characters

      const user = await AuthService.registerUser(email, password);

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
    });

    it('should store user with default role "user"', async () => {
      const email = 'defaultrole@example.com';
      const password = 'password123';

      const user = await AuthService.registerUser(email, password);

      expect(user.role).toBe('user');
    });
  });

  describe('loginUser', () => {
    const testEmail = 'login@example.com';
    const testPassword = 'password123';

    beforeEach(async () => {
      // Register a test user before each login test
      await AuthService.registerUser(testEmail, testPassword);
    });

    it('should login with valid credentials', async () => {
      const result = await AuthService.loginUser(testEmail, testPassword);

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(testEmail);
      expect(result.user.role).toBe('user');
    });

    it('should return a valid JWT token', async () => {
      const result = await AuthService.loginUser(testEmail, testPassword);

      // Verify token structure (JWT has 3 parts separated by dots)
      expect(result.token.split('.')).toHaveLength(3);

      // Verify token can be decoded
      const decoded = TokenService.decodeToken(result.token);
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(result.user.id);
      expect(decoded?.role).toBe(result.user.role);
    });

    it('should reject login with non-existent email', async () => {
      await expect(
        AuthService.loginUser('nonexistent@example.com', 'password123')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should reject login with incorrect password', async () => {
      await expect(
        AuthService.loginUser(testEmail, 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should not reveal whether email or password was incorrect', async () => {
      // Both should return the same error message
      let emailError: Error | undefined;
      let passwordError: Error | undefined;

      try {
        await AuthService.loginUser('nonexistent@example.com', 'password123');
      } catch (error) {
        emailError = error as Error;
      }

      try {
        await AuthService.loginUser(testEmail, 'wrongpassword');
      } catch (error) {
        passwordError = error as Error;
      }

      expect(emailError?.message).toBe('Invalid credentials');
      expect(passwordError?.message).toBe('Invalid credentials');
      expect(emailError?.message).toBe(passwordError?.message);
    });

    it('should be case-sensitive for password', async () => {
      await expect(
        AuthService.loginUser(testEmail, 'PASSWORD123')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should include user ID in response', async () => {
      const result = await AuthService.loginUser(testEmail, testPassword);

      expect(result.user.id).toBeDefined();
      expect(typeof result.user.id).toBe('string');
    });

    it('should not include password hash in response', async () => {
      const result = await AuthService.loginUser(testEmail, testPassword);

      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('Integration tests', () => {
    it('should complete full registration and login flow', async () => {
      const email = 'fullflow@example.com';
      const password = 'securepassword123';

      // Register
      const registeredUser = await AuthService.registerUser(email, password);
      expect(registeredUser.email).toBe(email);

      // Login
      const loginResult = await AuthService.loginUser(email, password);
      expect(loginResult.user.id).toBe(registeredUser.id);
      expect(loginResult.token).toBeDefined();

      // Verify token
      const decoded = TokenService.verifyToken(loginResult.token);
      expect(decoded.userId).toBe(registeredUser.id);
    });

    it('should handle multiple user registrations', async () => {
      const users = [
        { email: 'user1@example.com', password: 'password123' },
        { email: 'user2@example.com', password: 'password456' },
        { email: 'user3@example.com', password: 'password789' },
      ];

      // Register all users
      for (const userData of users) {
        const user = await AuthService.registerUser(
          userData.email,
          userData.password
        );
        expect(user.email).toBe(userData.email);
      }

      // Login with each user
      for (const userData of users) {
        const result = await AuthService.loginUser(
          userData.email,
          userData.password
        );
        expect(result.user.email).toBe(userData.email);
        expect(result.token).toBeDefined();
      }
    });

    it('should maintain password security across registration and login', async () => {
      const email = 'security@example.com';
      const password = 'mysecretpassword';

      // Register
      const user = await AuthService.registerUser(email, password);

      // Verify password is hashed
      expect(user.passwordHash).not.toBe(password);

      // Verify we can login with original password
      const loginResult = await AuthService.loginUser(email, password);
      expect(loginResult.user.id).toBe(user.id);

      // Verify we cannot login with hash
      await expect(
        AuthService.loginUser(email, user.passwordHash)
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
