import { Request, Response, NextFunction } from 'express';
import CloudinaryService from '../services/cloudinary.service';
import FileRepository from '../repositories/file.repository';
import STATUS_CODES from '../constants/statusCodes';
import AppError from '../utils/appError';
import logger from '../utils/logger';

const cloudinaryService = new CloudinaryService();
const fileRepository = new FileRepository();

export const uploadDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const user = req.user;

    if (!user) {
      return next(new AppError('Unauthorized: User context missing.', STATUS_CODES.UNAUTHORIZED));
    }

    if (!files || files.length === 0) {
      return next(new AppError('No files uploaded.', STATUS_CODES.BAD_REQUEST));
    }

    logger.info(`Processing upload of ${files.length} documents for user: ${user.email}`);

    // Upload files to Cloudinary in parallel
    const uploadPromises = files.map(async (file) => {
      // 1. Upload buffer to Cloudinary
      const cloudinaryResult = await cloudinaryService.uploadBuffer(
        file.buffer,
        file.originalname
      );

      // 2. Save metadata to MongoDB
      const savedFile = await fileRepository.create({
        userId: user.id || user._id,
        filename: file.originalname,
        path: cloudinaryResult.secure_url,
        mimetype: file.mimetype,
      });

      return {
        id: savedFile._id,
        filename: savedFile.filename,
        url: savedFile.path,
        mimetype: savedFile.mimetype,
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.status(STATUS_CODES.CREATED).json({
      status: 'success',
      message: 'Documents uploaded successfully.',
      data: {
        files: uploadedFiles,
      },
    });
  } catch (error: any) {
    logger.error('Error in uploadDocuments controller', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      status: error?.status,
      details: error?.response || error?.errors || error,
    });
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Failed to upload files.', STATUS_CODES.INTERNAL_SERVER_ERROR));
  }
};
