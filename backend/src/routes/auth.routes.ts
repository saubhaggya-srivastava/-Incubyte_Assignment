import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

/**
 * Authentication Routes
 * Base path: /api/auth
 */

// POST /api/auth/register - Register a new user
router.post('/register', AuthController.register);

// POST /api/auth/login - Login a user
router.post('/login', AuthController.login);

export default router;
