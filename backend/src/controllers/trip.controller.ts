import { Request, Response, NextFunction } from 'express';
import TripRepository from '../repositories/trip.repository';
import FileRepository from '../repositories/file.repository';
import { updateTripSchema } from '../validators/trip.validator';
import STATUS_CODES from '../constants/statusCodes';
import AppError from '../utils/appError';
import logger from '../utils/logger';

const tripRepository = new TripRepository();
const fileRepository = new FileRepository();

/**
 * Get all trips for the logged-in user
 */
export const getAllTrips = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      return next(new AppError('Unauthorized: User context missing.', STATUS_CODES.UNAUTHORIZED));
    }

    const trips = await tripRepository.findByUserId(user._id.toString());

    res.status(STATUS_CODES.OK).json({
      status: 'success',
      results: trips.length,
      data: { trips },
    });
  } catch (error: any) {
    logger.error(`Error in getAllTrips: ${error.message}`);
    next(new AppError('Failed to fetch trips.', STATUS_CODES.INTERNAL_SERVER_ERROR));
  }
};

/**
 * Get a specific trip by ID (for the owner)
 */
export const getTripById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      return next(new AppError('Unauthorized: User context missing.', STATUS_CODES.UNAUTHORIZED));
    }

    const trip = await tripRepository.findById(id);

    if (!trip) {
      return next(new AppError('Trip not found.', STATUS_CODES.NOT_FOUND));
    }

    // Verify ownership
    if (trip.userId.toString() !== user._id.toString()) {
      return next(new AppError('You do not have permission to access this trip.', STATUS_CODES.FORBIDDEN));
    }

    res.status(STATUS_CODES.OK).json({
      status: 'success',
      data: { trip },
    });
  } catch (error: any) {
    logger.error(`Error in getTripById: ${error.message}`);
    next(new AppError('Failed to retrieve trip.', STATUS_CODES.INTERNAL_SERVER_ERROR));
  }
};

/**
 * Get a public trip by ID (without authentication check)
 */
export const getPublicTripById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const trip = await tripRepository.findById(id);

    if (!trip) {
      return next(new AppError('Trip not found.', STATUS_CODES.NOT_FOUND));
    }

    // Verify it is flagged public
    if (!trip.isPublic) {
      return next(
        new AppError('This trip itinerary has not been shared publicly.', STATUS_CODES.FORBIDDEN)
      );
    }

    res.status(STATUS_CODES.OK).json({
      status: 'success',
      data: {
        trip: {
          title: trip.title,
          itinerary: trip.itinerary,
          destination: trip.itinerary?.destination,
          startDate: trip.itinerary?.startDate,
          endDate: trip.itinerary?.endDate,
        },
      },
    });
  } catch (error: any) {
    logger.error(`Error in getPublicTripById: ${error.message}`);
    next(new AppError('Failed to retrieve public itinerary.', STATUS_CODES.INTERNAL_SERVER_ERROR));
  }
};

/**
 * Update a trip details (title, public flag)
 */
export const updateTrip = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      return next(new AppError('Unauthorized: User context missing.', STATUS_CODES.UNAUTHORIZED));
    }

    // Validate body
    const validationResult = updateTripSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        status: 'error',
        message: 'Validation Failed',
        errors: validationResult.error.errors,
      });
      return;
    }

    const trip = await tripRepository.findById(id);

    if (!trip) {
      return next(new AppError('Trip not found.', STATUS_CODES.NOT_FOUND));
    }

    // Verify ownership
    if (trip.userId.toString() !== user._id.toString()) {
      return next(new AppError('You do not have permission to modify this trip.', STATUS_CODES.FORBIDDEN));
    }

    // Perform update
    const updatedTrip = await tripRepository.update(id, validationResult.data);

    res.status(STATUS_CODES.OK).json({
      status: 'success',
      message: 'Trip updated successfully.',
      data: { trip: updatedTrip },
    });
  } catch (error: any) {
    logger.error(`Error in updateTrip: ${error.message}`);
    next(new AppError('Failed to update trip.', STATUS_CODES.INTERNAL_SERVER_ERROR));
  }
};

/**
 * Delete a trip
 */
export const deleteTrip = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      return next(new AppError('Unauthorized: User context missing.', STATUS_CODES.UNAUTHORIZED));
    }

    const trip = await tripRepository.findById(id);

    if (!trip) {
      return next(new AppError('Trip not found.', STATUS_CODES.NOT_FOUND));
    }

    // Verify ownership
    if (trip.userId.toString() !== user._id.toString()) {
      return next(new AppError('You do not have permission to delete this trip.', STATUS_CODES.FORBIDDEN));
    }

    await tripRepository.delete(id);

    res.status(STATUS_CODES.OK).json({
      status: 'success',
      message: 'Trip deleted successfully.',
    });
  } catch (error: any) {
    logger.error(`Error in deleteTrip: ${error.message}`);
    next(new AppError('Failed to delete trip.', STATUS_CODES.INTERNAL_SERVER_ERROR));
  }
};

/**
 * Get dashboard statistics for the logged-in user
 */
export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      return next(new AppError('Unauthorized: User context missing.', STATUS_CODES.UNAUTHORIZED));
    }

    const tripsCount = await tripRepository.countByUserId(user._id.toString());
    const documentsCount = await fileRepository.countByUserId(user._id.toString());

    res.status(STATUS_CODES.OK).json({
      status: 'success',
      data: {
        stats: {
          tripsCreated: tripsCount,
          documentsUploaded: documentsCount,
        },
      },
    });
  } catch (error: any) {
    logger.error(`Error in getDashboardStats: ${error.message}`);
    next(new AppError('Failed to load dashboard statistics.', STATUS_CODES.INTERNAL_SERVER_ERROR));
  }
};
