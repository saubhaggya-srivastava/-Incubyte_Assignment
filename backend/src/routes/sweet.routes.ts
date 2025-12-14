import { Router } from 'express';
import { SweetController } from '../controllers/sweet.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/authorization.middleware';

const router = Router();

/**
 * Sweet Routes
 * All routes require authentication
 * Admin-only routes also require admin role
 */

// Create a new sweet (Admin only)
router.post('/', authenticate, requireAdmin, SweetController.createSweet);

// Get all sweets (Authenticated)
router.get('/', authenticate, SweetController.getAllSweets);

// Search sweets (Authenticated)
router.get('/search', authenticate, SweetController.searchSweets);

// Update a sweet (Admin only)
router.put('/:id', authenticate, requireAdmin, SweetController.updateSweet);

// Delete a sweet (Admin only)
router.delete('/:id', authenticate, requireAdmin, SweetController.deleteSweet);

export { router as sweetRoutes };
