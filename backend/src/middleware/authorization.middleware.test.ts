import { Response, NextFunction } from 'express';
import { requireAdmin } from './authorization.middleware';
import { AuthRequest } from './auth.middleware';

describe('Authorization Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('requireAdmin', () => {
    it('should allow access for admin users', () => {
      mockRequest.user = {
        userId: 'admin-123',
        role: 'admin',
      };

      requireAdmin(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access for non-admin users', () => {
      mockRequest.user = {
        userId: 'user-123',
        role: 'user',
      };

      requireAdmin(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          message: 'Admin access required',
          code: 'FORBIDDEN',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 when user data is missing', () => {
      mockRequest.user = undefined;

      requireAdmin(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should be case-sensitive for role check', () => {
      mockRequest.user = {
        userId: 'user-123',
        role: 'Admin', // Wrong case
      };

      requireAdmin(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle empty role', () => {
      mockRequest.user = {
        userId: 'user-123',
        role: '',
      };

      requireAdmin(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('Integration tests', () => {
    it('should work in sequence with authentication middleware', () => {
      // Simulate authenticated admin user
      mockRequest.user = {
        userId: 'admin-456',
        role: 'admin',
      };

      requireAdmin(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle multiple authorization checks', () => {
      const users = [
        { userId: 'admin1', role: 'admin', shouldPass: true },
        { userId: 'user1', role: 'user', shouldPass: false },
        { userId: 'admin2', role: 'admin', shouldPass: true },
        { userId: 'user2', role: 'user', shouldPass: false },
      ];

      users.forEach((userData) => {
        mockRequest = { user: userData };
        mockResponse = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockReturnThis(),
        };
        nextFunction = jest.fn();

        requireAdmin(
          mockRequest as AuthRequest,
          mockResponse as Response,
          nextFunction
        );

        if (userData.shouldPass) {
          expect(nextFunction).toHaveBeenCalled();
          expect(mockResponse.status).not.toHaveBeenCalled();
        } else {
          expect(nextFunction).not.toHaveBeenCalled();
          expect(mockResponse.status).toHaveBeenCalledWith(403);
        }
      });
    });
  });
});
