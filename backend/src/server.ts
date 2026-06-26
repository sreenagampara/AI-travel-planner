import { loadEnv } from './config/env';
loadEnv();

import app from './app';
import connectDB from './config/db';
import logger from './utils/logger';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 5000;

let server: any;

// Establish database connection and start server
const startServer = async () => {
  try {
    await connectDB();
    
    server = app.listen(PORT, () => {
      logger.info(`Server successfully started in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error: any) {
    logger.error(`Failed to boot server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

// Crash handling - Uncaught Exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error(`CRITICAL: Uncaught Exception - ${error.message}`, { stack: error.stack });
  // Graceful exit
  process.exit(1);
});

// Crash handling - Unhandled Promise Rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error(`CRITICAL: Unhandled Rejection - ${reason?.message || reason}`);
  // Shutdown server gracefully first, then exit
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Graceful shutdown on SIGTERM / SIGINT signals (Render/Docker friendly)
const shutdown = (signal: string) => {
  logger.warn(`Received signal ${signal}. Starting graceful termination...`);
  
  if (server) {
    server.close(async () => {
      logger.info('HTTP server stopped.');
      try {
        await mongoose.connection.close();
        logger.info('Database connection closed.');
        logger.info('Graceful shutdown completed successfully.');
        process.exit(0);
      } catch (err: any) {
        logger.error(`Error closing database connection during shutdown: ${err.message}`);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
