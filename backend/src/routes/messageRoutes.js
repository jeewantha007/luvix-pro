import express from 'express';
import { messageController } from '../controllers/messageController.js';
import { requireActiveSubscription } from '../middleware/subscriptionMiddleware.js';

const router = express.Router();

// GET /api/messages
router.get('/', requireActiveSubscription, messageController.getMessages);

// POST /api/messages
router.post('/', requireActiveSubscription, messageController.createMessage);

export default router;
