import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service';

// Extend Express Request type to include user data
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user data to request
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: {
          message: 'No authorization token provided',
          code: 'UNAUTHORIZED',
        },
      });
      return;
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      res.status(401).json({
        error: {
          message: 'Invalid authorization header format',
          code: 'UNAUTHORIZED',
        },
      });
      return;
    }

    // Verify token
    const decoded = TokenService.verifyToken(token);

    // Attach user data to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Invalid token';

    res.status(401).json({
      error: {
        message: errorMessage,
        code: 'UNAUTHORIZED',
      },
    });
  }
};
