import { Request, Response, NextFunction } from 'express';
import { AiService } from '../services/ai.service';
import { sendSuccess } from '../utils/helpers';
import { z } from 'zod';

export class AiController {
  static async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, conversationId } = req.body;
      const result = await AiService.sendMessage(
        req.user!.id,
        req.organizationId!,
        message,
        conversationId
      );
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const convos = await AiService.getConversations(req.user!.id);
      sendSuccess(res, convos);
    } catch (err) {
      next(err);
    }
  }

  static async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const messages = await AiService.getConversationMessages((req.params.conversationId as string), req.user!.id);
      sendSuccess(res, messages);
    } catch (err) {
      next(err);
    }
  }
}
