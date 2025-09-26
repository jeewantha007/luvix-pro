import express from 'express';
import { chatController } from '../controllers/chatController.js';
import { requireActiveSubscription } from '../middleware/subscriptionMiddleware.js';

const router = express.Router();

// POST /api/chats/:contactId/read
router.post('/:contactId/read', requireActiveSubscription, chatController.markAsRead);

export default router;
