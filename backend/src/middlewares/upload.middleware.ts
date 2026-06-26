import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import AppError from '../utils/appError';
import STATUS_CODES from '../constants/statusCodes';

// Configure memory storage to keep files in memory buffer before parsing/uploading
const storage = multer.memoryStorage();

// Supported mime types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
];

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new AppError(
        `Invalid file type: ${file.mimetype}. Only PDF, JPG, JPEG, and PNG are allowed.`,
        STATUS_CODES.BAD_REQUEST
      )
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limits
  },
});

export const uploadTravelDocuments = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  upload.array('files', 5)(req, res, (error: any) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      const message =
        error.code === 'LIMIT_FILE_SIZE'
          ? 'File size exceeds the 10MB limit.'
          : error.code === 'LIMIT_UNEXPECTED_FILE'
            ? 'Too many files uploaded. You can upload up to 5 documents.'
            : error.message;

      return next(new AppError(message, STATUS_CODES.BAD_REQUEST));
    }

    return next(error);
  });
};

export default upload;
