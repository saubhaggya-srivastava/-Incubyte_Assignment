import { z } from 'zod';

/**
 * Validation schema for restocking a sweet
 */
export const restockSchema = z.object({
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});
