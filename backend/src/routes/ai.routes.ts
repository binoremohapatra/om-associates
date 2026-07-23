import { Router } from 'express';
import { AiController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/request';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().cuid().optional(),
});

router.post('/chat', validate(chatSchema), AiController.chat);
router.get('/conversations', AiController.getConversations);
router.get('/conversations/:conversationId/messages', AiController.getMessages);

export default router;
