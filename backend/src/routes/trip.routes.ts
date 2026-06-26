import { Router } from 'express';
import { checkJwt, syncUser } from '../middlewares/auth.middleware';
import {
  getAllTrips,
  getTripById,
  getPublicTripById,
  updateTrip,
  deleteTrip,
  getDashboardStats,
} from '../controllers/trip.controller';

const tripRouter = Router();

// Public Route (No Authentication required)
tripRouter.get('/public/:id', getPublicTripById);

// Protected Routes (Require Auth0 validation & sync)
tripRouter.get('/stats', checkJwt, syncUser, getDashboardStats);
tripRouter.get('/', checkJwt, syncUser, getAllTrips);
tripRouter.get('/:id', checkJwt, syncUser, getTripById);
tripRouter.patch('/:id', checkJwt, syncUser, updateTrip);
tripRouter.delete('/:id', checkJwt, syncUser, deleteTrip);

export default tripRouter;
