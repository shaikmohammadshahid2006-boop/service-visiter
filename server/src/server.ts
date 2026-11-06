import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { connectDB } from './config/db';
import { User } from './models/User';
import { seedDatabase } from './utils/seed';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Check if database is empty and auto-seed if needed
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Running initial seed...');
      // We don't want seedDatabase to disconnect the DB
      // We'll run seeding within current connection
      const { seedDataInline } = await import('./utils/seedInline');
      await seedDataInline();
    }

    const app = createApp();

    const server = app.listen(PORT, () => {
      console.log(`[Server] ServiceVisit Tracker backend listening on http://localhost:${PORT}`);
    });

    const shutdown = async () => {
      console.log('\n[Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[Server] Fatal startup error:', error);
    process.exit(1);
  }
};

startServer();
