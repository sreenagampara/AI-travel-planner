import { Router } from 'express';
import { checkJwt, syncUser } from '../middlewares/auth.middleware';
import { generateTripItinerary } from '../controllers/itinerary.controller';

const itineraryRouter = Router();

// Protect route with Auth0 checkJwt and user profile sync middleware
itineraryRouter.post(
  '/generate',
  checkJwt,
  syncUser,
  generateTripItinerary
);

export default itineraryRouter;
