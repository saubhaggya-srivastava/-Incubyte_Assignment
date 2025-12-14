import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/authorization.middleware';

const router = Router();

/**
 * Inventory Routes
 * Purchase requires authentication
 * Restock requires admin role
 */

// Purchase a sweet (Authenticated)
router.post('/:id/purchase', authenticate, InventoryController.purchaseSweet);

// Restock a sweet (Admin only)
router.post(
  '/:id/restock',
  authenticate,
  requireAdmin,
  InventoryController.restockSweet
);

export { router as inventoryRoutes };
