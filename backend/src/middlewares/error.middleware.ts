import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const status = (err as any).status || 500;
  const message = err.message || 'An unexpected error occurred on the server.';
  const errors = (err as any).errors;

  // Log error details
  logger.error(`[Error] ${err.name}: ${message}`, { stack: err.stack });

  const isDev = process.env.NODE_ENV !== 'production';
  res.status(status).json({
    status: 'error',
    message,
    ...(errors && { errors }),
    ...(isDev && { stack: err.stack }),
  });
};

export default errorHandler;
