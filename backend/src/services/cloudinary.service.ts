import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';
import logger from '../utils/logger';
import AppError from '../utils/appError';
import STATUS_CODES from '../constants/statusCodes';

export class CloudinaryService {
  async uploadBuffer(
    fileBuffer: Buffer,
    fileName: string,
    folder: string = 'travel_ai_planner'
  ): Promise<UploadApiResponse> {
    if (!isCloudinaryConfigured()) {
      throw new AppError(
        'Cloudinary is not configured. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }

    return new Promise((resolve, reject) => {
      logger.debug(`Initiating Cloudinary upload stream for file: ${fileName}`);
      const publicId = `${Date.now()}-${fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-')}`;
      
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'auto', // Detects images or PDFs automatically
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary stream upload error', {
              message: error.message,
              httpCode: (error as any).http_code,
              name: error.name,
            });
            return reject(
              new AppError(
                `Cloudinary upload failed: ${error.message}`,
                STATUS_CODES.INTERNAL_SERVER_ERROR
              )
            );
          }
          if (!result) {
            logger.error('Cloudinary upload resolved without response payload.');
            return reject(new Error('Cloudinary upload resolved empty.'));
          }
          
          logger.debug(`Cloudinary upload complete: ${result.secure_url}`);
          resolve(result);
        }
      );

      uploadStream.end(fileBuffer);
    });
  }
}

export default CloudinaryService;
