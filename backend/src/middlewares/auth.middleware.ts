// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import AppError from '../utils/appError';
import UserRepository from '../repositories/user.repository';
import { AuthPayload, Auth0Payload } from '../types/auth';

const userRepository = new UserRepository();

const isAuth0Payload = (payload: AuthPayload): payload is Auth0Payload => {
  return (payload as Auth0Payload).sub !== undefined;
};

const resolveUser = async (payload: AuthPayload) => {
  if (isAuth0Payload(payload)) {
    const auth0Id = payload.sub;
    let user = await userRepository.findByAuth0Id(auth0Id);

    if (!user) {
      const email = payload.email || `${auth0Id}@auth0.local`;
      const name = payload.name || payload.given_name || email.split('@')[0] || 'Auth0 User';

      user = await userRepository.create({
        auth0Id,
        email,
        name,
      });
    }

    return user;
  }

  if ('id' in payload && payload.id) {
    const user = await userRepository.findById(payload.id);
    if (!user) {
      throw new AppError('Local user not found.', 401);
    }
    return user;
  }

  throw new AppError('Unsupported authentication payload.', 401);
};

/**
 * Verifies the JWT in the Authorization header and stores the decoded
 * auth payload for later user synchronization.
 */
export const protect = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Missing or invalid authorization token.', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = await verifyToken(token);
    (req as any).authPayload = payload;
    next();
  } catch (err: any) {
    next(new AppError(err?.message || 'Invalid or expired token.', 401));
  }
};

// Aliases used by routes.
export const checkJwt = protect;

export const syncUser = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authPayload = (req as any).authPayload as AuthPayload | undefined;
    if (!authPayload) {
      return next(new AppError('Authenticated payload is missing.', 401));
    }

    const user = await resolveUser(authPayload);
    (req as any).user = user;
    next();
  } catch (err: any) {
    next(new AppError(err?.message || 'Failed to synchronize user.', 401));
  }
};
