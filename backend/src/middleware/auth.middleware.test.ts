import { Response, NextFunction } from 'express';

// Set environment variables BEFORE importing modules
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.JWT_EXPIRATION = '24h';

import { authenticate, AuthRequest } from './auth.middleware';
import { TokenService } from '../services/token.service';

describe('Authentication Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('authenticate', () => {
    it('should authenticate request with valid token', () => {
      const token = TokenService.generateToken('user-123', 'user');
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.userId).toBe('user-123');
      expect(mockRequest.user?.role).toBe('user');
    });

    it('should attach user data to request', () => {
      const userId = 'test-user-id';
      const role = 'admin';
      const token = TokenService.generateToken(userId, role);
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.user).toEqual({
        userId,
        role,
      });
    });

    it('should accept token without Bearer prefix', () => {
      const token = TokenService.generateToken('user-123', 'user');
      mockRequest.headers = {
        authorization: token,
      };

      authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
    });

    it('should return 401 when no authorization header is provided', () => {
      mockRequest.headers = {};

      authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          message: 'No authorization token provided',
          code: 'UNAUTHORIZED',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is empty', () => {
      mockRequest.headers = {
        authorization: '',
      };

      authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          message: 'Invalid token',
          code: 'UNAUTHORIZED',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 when token is expired', async () => {
      // Create an expired token
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { userId: 'user-123', role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '1ms' }
      );

      // Wait for token to expire
      await new Promise((resolve) => setTimeout(resolve, 10));

      mockRequest.headers = {
        authorization: `Bearer ${expiredToken}`,
      };

      authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 for Bearer with no token', () => {
      mockRequest.headers = {
        authorization: 'Bearer ',
      };

      authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          message: 'Invalid authorization header format',
          code: 'UNAUTHORIZED',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle different user roles', () => {
      const roles = ['user', 'admin'];

      roles.forEach((role) => {
        const token = TokenService.generateToken('user-id', role);
        mockRequest.headers = {
          authorization: `Bearer ${token}`,
        };

        authenticate(
          mockRequest as AuthRequest,
          mockResponse as Response,
          nextFunction
        );

        expect(mockRequest.user?.role).toBe(role);
      });
    });

    it('should not modify request if authentication fails', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.user).toBeUndefined();
    });
  });

  describe('Integration tests', () => {
    it('should work with real token generation and verification', () => {
      // Generate a real token
      const userId = 'integration-test-user';
      const role = 'admin';
      const token = TokenService.generateToken(userId, role);

      // Use it in middleware
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      // Verify it worked
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user?.userId).toBe(userId);
      expect(mockRequest.user?.role).toBe(role);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should handle multiple authentication attempts', () => {
      const tokens = [
        TokenService.generateToken('user1', 'user'),
        TokenService.generateToken('user2', 'admin'),
        TokenService.generateToken('user3', 'user'),
      ];

      tokens.forEach((token) => {
        mockRequest = { headers: { authorization: `Bearer ${token}` } };
        nextFunction = jest.fn();

        authenticate(
          mockRequest as AuthRequest,
          mockResponse as Response,
          nextFunction
        );

        expect(nextFunction).toHaveBeenCalled();
        expect(mockRequest.user).toBeDefined();
      });
    });
  });
});
