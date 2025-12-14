import * as jwt from 'jsonwebtoken';

// Set environment variables BEFORE importing TokenService
process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes-only';
process.env.JWT_EXPIRATION = '24h';

import { TokenService } from './token.service';

describe('TokenService', () => {
  const testUserId = 'user-123';
  const testRole = 'user';

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = TokenService.generateToken(testUserId, testRole);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include userId and role in token payload', () => {
      const token = TokenService.generateToken(testUserId, testRole);
      const decoded = TokenService.decodeToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(testUserId);
      expect(decoded?.role).toBe(testRole);
    });

    it('should generate token with expiration', () => {
      const token = TokenService.generateToken(testUserId, testRole);
      const decoded = TokenService.decodeToken(token);

      expect(decoded).toHaveProperty('exp');
      expect(decoded).toHaveProperty('iat');
    });

    it('should generate different tokens for different users', () => {
      const token1 = TokenService.generateToken('user-1', 'user');
      const token2 = TokenService.generateToken('user-2', 'user');

      expect(token1).not.toBe(token2);
    });

    it('should generate token for admin role', () => {
      const token = TokenService.generateToken(testUserId, 'admin');
      const decoded = TokenService.decodeToken(token);

      expect(decoded?.role).toBe('admin');
    });

    // Note: Testing empty JWT_SECRET requires module reload which is complex in Jest
    // In production, the application will fail to start if JWT_SECRET is not set
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const token = TokenService.generateToken(testUserId, testRole);
      const decoded = TokenService.verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testUserId);
      expect(decoded.role).toBe(testRole);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        TokenService.verifyToken(invalidToken);
      }).toThrow('Invalid token');
    });

    it('should throw error for expired token', async () => {
      // Create a token that expires immediately
      const secret = process.env.JWT_SECRET || 'test-secret';
      const expiredToken = jwt.sign(
        { userId: testUserId, role: testRole },
        secret,
        { expiresIn: '1ms' }
      );

      // Wait for token to expire
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(() => {
        TokenService.verifyToken(expiredToken);
      }).toThrow(); // Will throw either "Token has expired" or "Invalid token"
    });

    it('should throw error for token with wrong secret', () => {
      const wrongSecretToken = jwt.sign(
        { userId: testUserId, role: testRole },
        'wrong-secret',
        { expiresIn: '24h' }
      );

      expect(() => {
        TokenService.verifyToken(wrongSecretToken);
      }).toThrow('Invalid token');
    });

    // Note: Testing empty JWT_SECRET requires module reload which is complex in Jest
    // In production, the application will fail to start if JWT_SECRET is not set
  });

  describe('decodeToken', () => {
    it('should decode a token without verification', () => {
      const token = TokenService.generateToken(testUserId, testRole);
      const decoded = TokenService.decodeToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(testUserId);
      expect(decoded?.role).toBe(testRole);
    });

    it('should return null for invalid token format', () => {
      const invalidToken = 'not-a-valid-token';
      const decoded = TokenService.decodeToken(invalidToken);

      expect(decoded).toBeNull();
    });

    it('should decode expired token without throwing error', () => {
      const secret = process.env.JWT_SECRET || 'test-secret';
      const expiredToken = jwt.sign(
        { userId: testUserId, role: testRole },
        secret,
        { expiresIn: '1ms' }
      );

      const decoded = TokenService.decodeToken(expiredToken);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(testUserId);
    });
  });

  describe('Integration tests', () => {
    it('should complete full token lifecycle', () => {
      // Generate token
      const token = TokenService.generateToken(testUserId, 'admin');

      // Decode without verification
      const decodedWithoutVerify = TokenService.decodeToken(token);
      expect(decodedWithoutVerify?.userId).toBe(testUserId);
      expect(decodedWithoutVerify?.role).toBe('admin');

      // Verify token
      const verified = TokenService.verifyToken(token);
      expect(verified.userId).toBe(testUserId);
      expect(verified.role).toBe('admin');
    });

    it('should handle multiple user roles correctly', () => {
      const userToken = TokenService.generateToken('user-1', 'user');
      const adminToken = TokenService.generateToken('admin-1', 'admin');

      const userDecoded = TokenService.verifyToken(userToken);
      const adminDecoded = TokenService.verifyToken(adminToken);

      expect(userDecoded.role).toBe('user');
      expect(adminDecoded.role).toBe('admin');
    });
  });
});
