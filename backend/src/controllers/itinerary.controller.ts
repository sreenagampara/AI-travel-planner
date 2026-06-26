import { Request, Response, NextFunction } from 'express';
import ItineraryService from '../services/itinerary.service';
import { generateItinerarySchema } from '../validators/trip.validator';
import STATUS_CODES from '../constants/statusCodes';
import AppError from '../utils/appError';
import logger from '../utils/logger';

const itineraryService = new ItineraryService();

export const generateTripItinerary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      return next(new AppError('Unauthorized: User context missing.', STATUS_CODES.UNAUTHORIZED));
    }

    // 1. Validate request body with Zod
    const validationResult = generateItinerarySchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        status: 'error',
        message: 'Validation Failed',
        errors: validationResult.error.errors,
      });
      return;
    }

    const { fileIds } = validationResult.data;

    logger.info(`Requested itinerary generation for user: ${user.email} with files: ${fileIds}`);

    // 2. Invoke itinerary generation service pipeline
    const trip = await itineraryService.generateItineraryFromFiles(fileIds, user._id.toString());

    // 3. Return successfully generated trip
    res.status(STATUS_CODES.CREATED).json({
      status: 'success',
      message: 'Itinerary generated successfully.',
      data: {
        trip,
      },
    });
  } catch (error: any) {
    logger.error(`Error in generateTripItinerary controller: ${error.message}`);
    next(error); // Express global error middleware handles formatting
  }
};
