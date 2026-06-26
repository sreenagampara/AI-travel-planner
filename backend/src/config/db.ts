import dns from 'dns';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import { env } from './env';

dns.setServers(['1.1.1.1', '8.8.8.8']);

export const connectDB = async (): Promise<void> => {
  const mongoURI = env.MONGODB_URI;

  if (!mongoURI) {
    logger.error('MONGODB_URI environment variable is not defined.');
    process.exit(1);
  }

  try {
    mongoose.connection.on('connected', () => {
      logger.info('Successfully established MongoDB connection.');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection lost. Disconnected.');
    });

    await mongoose.connect(mongoURI);
  } catch (error: any) {
    logger.error(`Initial MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
