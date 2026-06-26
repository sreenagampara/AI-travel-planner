import { Router } from 'express';
import STATUS_CODES from '../constants/statusCodes';
import uploadRouter from './upload.routes';
import itineraryRouter from './itinerary.routes';
import tripRouter from './trip.routes';
import authRouter from './auth.routes';

const apiRouter = Router();

// Health Check route
apiRouter.get('/health', (_req, res) => {
  res.status(STATUS_CODES.OK).json({ status: 'ok', message: 'Travel AI Planner API is running' });
});

// Mounting Sub-Routers
apiRouter.use('/auth', authRouter);
apiRouter.use('/upload', uploadRouter);
apiRouter.use('/itinerary', itineraryRouter);
apiRouter.use('/trips', tripRouter);

export default apiRouter;
