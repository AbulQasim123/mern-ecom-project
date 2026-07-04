import express from 'express';
import { signupUser, loginUser, getMe, deleteAccount } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);

// Protected routes - require a valid Bearer token
router.get('/me', protect, getMe);
router.delete('/delete', protect, deleteAccount);

export default router;
