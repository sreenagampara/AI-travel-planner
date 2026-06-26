import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger';
import { env } from './env';

let configured = false;

const configureCloudinary = (): void => {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  configured = true;
  logger.info('Cloudinary configured successfully.');
};

configureCloudinary();

export const isCloudinaryConfigured = (): boolean => configured;
export { cloudinary };
export default cloudinary;
