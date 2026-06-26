import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import requestLogger from './middlewares/requestLogger.middleware';
import apiRouter from './routes';
import errorHandler from './middlewares/error.middleware';
import AppError from './utils/appError';
import STATUS_CODES from './constants/statusCodes';

const app = express();

// Standard Security Headers
app.use(helmet());

// CORS configuration - support frontend origins
const localDevOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
]
  .filter(Boolean)
  .flatMap((origin) => origin?.toString().split(',') ?? [])
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map((origin) => origin?.toString()) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || localDevOriginPattern.test(origin)) {
        callback(null, true);
      } else {
        callback(new AppError(`Blocked by CORS policy: ${origin}`, STATUS_CODES.FORBIDDEN));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use(requestLogger);

// API Routes
app.use('/api', apiRouter);

// Centralized Error Handler (must be registered last)
app.use(errorHandler);

export default app;
