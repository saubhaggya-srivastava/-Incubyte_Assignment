import { z } from 'zod';

/**
 * Validation schema for creating a sweet
 */
export const createSweetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be a positive number'),
  quantity: z.number().int().min(0, 'Quantity must be a non-negative integer'),
});

/**
 * Validation schema for updating a sweet
 */
export const updateSweetSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  price: z.number().positive('Price must be a positive number').optional(),
  quantity: z
    .number()
    .int()
    .min(0, 'Quantity must be a non-negative integer')
    .optional(),
});

/**
 * Validation schema for search criteria
 */
export const searchSweetsSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
});
