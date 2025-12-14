import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

/**
 * Authorization Middleware
 * Checks if user has admin role
 * Note: Must be used after authenticate middleware
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Check if user data exists (should be set by authenticate middleware)
  if (!req.user) {
    res.status(401).json({
      error: {
        message: 'Authentication required',
        code: 'UNAUTHORIZED',
      },
    });
    return;
  }

  // Check if user has admin role
  if (req.user.role !== 'admin') {
    res.status(403).json({
      error: {
        message: 'Admin access required',
        code: 'FORBIDDEN',
      },
    });
    return;
  }

  next();
};
