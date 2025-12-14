import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../validators/auth.validator';

/**
 * Authentication Controller
 * Handles HTTP requests for user registration and login
 */
export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = registerSchema.parse(req.body);

      // Register user
      const user = await AuthService.registerUser(
        validatedData.email,
        validatedData.password
      );

      // Return success response (exclude password hash)
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        // Handle validation errors
        if (error.name === 'ZodError') {
          res.status(400).json({
            error: {
              message: 'Validation failed',
              code: 'VALIDATION_ERROR',
              details: error,
            },
          });
          return;
        }

        // Handle business logic errors
        if (
          error.message === 'Email already registered' ||
          error.message === 'Invalid email format' ||
          error.message === 'Password must be at least 8 characters long'
        ) {
          res.status(400).json({
            error: {
              message: error.message,
              code: 'BAD_REQUEST',
            },
          });
          return;
        }
      }

      // Handle unexpected errors
      res.status(500).json({
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  /**
   * Login a user
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = loginSchema.parse(req.body);

      // Login user
      const result = await AuthService.loginUser(
        validatedData.email,
        validatedData.password
      );

      // Return success response
      res.status(200).json({
        message: 'Login successful',
        token: result.token,
        user: result.user,
      });
    } catch (error) {
      if (error instanceof Error) {
        // Handle validation errors
        if (error.name === 'ZodError') {
          res.status(400).json({
            error: {
              message: 'Validation failed',
              code: 'VALIDATION_ERROR',
              details: error,
            },
          });
          return;
        }

        // Handle authentication errors
        if (error.message === 'Invalid credentials') {
          res.status(401).json({
            error: {
              message: 'Invalid credentials',
              code: 'UNAUTHORIZED',
            },
          });
          return;
        }
      }

      // Handle unexpected errors
      res.status(500).json({
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }
}
