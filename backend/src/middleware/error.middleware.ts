import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Global error handler middleware
 * Catches all errors and formats them consistently
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error for debugging
  console.error('Error:', err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: err.errors,
      },
    });
    return;
  }

  // Handle known error messages
  if (err.message === 'Sweet not found' || err.message === 'User not found') {
    res.status(404).json({
      error: {
        message: err.message,
        code: 'NOT_FOUND',
      },
    });
    return;
  }

  if (err.message === 'Sweet is out of stock') {
    res.status(400).json({
      error: {
        message: err.message,
        code: 'OUT_OF_STOCK',
      },
    });
    return;
  }

  if (err.message === 'Invalid credentials' || err.message === 'Email already registered') {
    res.status(400).json({
      error: {
        message: err.message,
        code: 'BAD_REQUEST',
      },
    });
    return;
  }

  // Default to 500 internal server error
  res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  });
};
