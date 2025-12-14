import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database';
import authRoutes from './routes/auth.routes';
import { sweetRoutes } from './routes/sweet.routes';
import { inventoryRoutes } from './routes/inventory.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetRoutes);
app.use('/api/sweets', inventoryRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Sweet Shop API is running' });
});

// Error handler (must be last)
app.use(errorHandler);

async function main() {
  console.log('🚀 Starting Sweet Shop Backend...');

  // Connect to database
  await connectDatabase();

  // Start server
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
  });
}

main().catch((error) => {
  console.error('❌ Failed to start backend:', error);
  process.exit(1);
});
