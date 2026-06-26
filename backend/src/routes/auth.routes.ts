import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { passwordPolicy } from '../middleware/passwordPolicy';
import { validationResult } from 'express-validator';

const router = Router();

// Helper to handle validation errors
const handleValidation = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/register', passwordPolicy, handleValidation, register);
router.post('/login', handleValidation, login);

export default router;
