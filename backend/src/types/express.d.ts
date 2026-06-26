import { IUser } from '../models/user.model';
import { AuthPayload } from './auth';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      authPayload?: AuthPayload;
    }
  }
}
