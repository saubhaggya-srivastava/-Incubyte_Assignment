import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service';
import { restockSchema } from '../validators/inventory.validator';
import { ZodError } from 'zod';

/**
 * Inventory Controller
 * Handles HTTP requests for inventory management (purchase and restock)
 */
export class InventoryController {
  /**
   * Purchase a sweet (Authenticated)
   * POST /api/sweets/:id/purchase
   */
  static async purchaseSweet(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Purchase sweet
      const sweet = await InventoryService.purchaseSweet(id);

      res.status(200).json(sweet);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Sweet not found') {
          res.status(404).json({
            error: {
              message: error.message,
              code: 'NOT_FOUND',
            },
          });
        } else if (error.message === 'Sweet is out of stock') {
          res.status(400).json({
            error: {
              message: error.message,
              code: 'OUT_OF_STOCK',
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
   * Restock a sweet (Admin only)
   * POST /api/sweets/:id/restock
   */
  static async restockSweet(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Validate request body
      const validatedData = restockSchema.parse(req.body);

      // Restock sweet
      const sweet = await InventoryService.restockSweet(
        id,
        validatedData.quantity
      );

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
}
