import express from 'express';
import { authController } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/check-email
router.post('/check-email', authController.checkEmail);

export default router;
