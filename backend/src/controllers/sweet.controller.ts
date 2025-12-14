import { Request, Response } from 'express';
import { SweetService } from '../services/sweet.service';
import {
  createSweetSchema,
  updateSweetSchema,
  searchSweetsSchema,
} from '../validators/sweet.validator';
import { ZodError } from 'zod';

/**
 * Sweet Controller
 * Handles HTTP requests for sweet management
 */
export class SweetController {
  /**
   * Create a new sweet (Admin only)
   * POST /api/sweets
   */
  static async createSweet(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = createSweetSchema.parse(req.body);

      // Create sweet
      const sweet = await SweetService.createSweet(validatedData);

      res.status(201).json(sweet);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.errors,
          },
        });
      } else if (error instanceof Error) {
        res.status(500).json({
          error: {
            message: error.message,
            code: 'INTERNAL_ERROR',
          },
        });
      }
    }
  }

  /**
   * Get all sweets (Authenticated)
   * GET /api/sweets
   */
  static async getAllSweets(_req: Request, res: Response): Promise<void> {
    try {
      const sweets = await SweetService.getAllSweets();
      res.status(200).json(sweets);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({
          error: {
            message: error.message,
            code: 'INTERNAL_ERROR',
          },
        });
      }
    }
  }

  /**
   * Search sweets by criteria (Authenticated)
   * GET /api/sweets/search
   */
  static async searchSweets(req: Request, res: Response): Promise<void> {
    try {
      // Parse query parameters
      const criteria: any = {};

      if (req.query.name) {
        criteria.name = req.query.name as string;
      }
      if (req.query.category) {
        criteria.category = req.query.category as string;
      }
      if (req.query.minPrice) {
        criteria.minPrice = parseFloat(req.query.minPrice as string);
      }
      if (req.query.maxPrice) {
        criteria.maxPrice = parseFloat(req.query.maxPrice as string);
      }

      // Validate criteria
      const validatedCriteria = searchSweetsSchema.parse(criteria);

      // Search sweets
      const sweets = await SweetService.searchSweets(validatedCriteria);

      res.status(200).json(sweets);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.errors,
          },
        });
      } else if (error instanceof Error) {
        res.status(500).json({
          error: {
            message: error.message,
            code: 'INTERNAL_ERROR',
          },
        });
      }
    }
  }

  /**
   * Update a sweet (Admin only)
   * PUT /api/sweets/:id
   */
  static async updateSweet(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Validate request body
      const validatedData = updateSweetSchema.parse(req.body);

      // Update sweet
      const sweet = await SweetService.updateSweet(id, validatedData);

      res.status(200).json(sweet);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.errors,
          },
        });
      } else if (error instanceof Error) {
        if (error.message === 'Sweet not found') {
          res.status(404).json({
            error: {
              message: error.message,
              code: 'NOT_FOUND',
            },
          });
        } else {
          res.status(500).json({
            error: {
              message: error.message,
              code: 'INTERNAL_ERROR',
            },
          });
        }
      }
    }
  }

  /**
   * Delete a sweet (Admin only)
   * DELETE /api/sweets/:id
   */
  static async deleteSweet(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Delete sweet
      await SweetService.deleteSweet(id);

      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Sweet not found') {
          res.status(404).json({
            error: {
              message: error.message,
              code: 'NOT_FOUND',
            },
          });
        } else {
          res.status(500).json({
            error: {
              message: error.message,
              code: 'INTERNAL_ERROR',
            },
          });
        }
      }
    }
  }
}
