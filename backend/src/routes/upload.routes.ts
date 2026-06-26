import { Router } from 'express';
import { checkJwt, syncUser } from '../middlewares/auth.middleware';
import { uploadTravelDocuments } from '../middlewares/upload.middleware';
import { uploadDocuments } from '../controllers/upload.controller';

const uploadRouter = Router();

// Protect upload endpoint with Auth0 checkJwt, user synchronization and support up to 5 documents
uploadRouter.post(
  '/',
  checkJwt,
  syncUser,
  uploadTravelDocuments,
  uploadDocuments
);

export default uploadRouter;
