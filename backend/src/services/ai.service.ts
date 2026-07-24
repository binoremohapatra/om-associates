import OpenAI from 'openai';
import { prisma } from '../config/database';
import { config } from '../config';
import { NotFoundError } from '../types/errors';

// Initialize conditionally
let openai: OpenAI | null = null;
if (config.ai.provider === 'gemini' && config.ai.geminiApiKey) {
  openai = new OpenAI({ 
    apiKey: config.ai.geminiApiKey,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
  });
} else if (config.ai.openaiApiKey) {
  openai = new OpenAI({ apiKey: config.ai.openaiApiKey });
}

export class AiService {
  static async sendMessage(userId: string, orgId: string, message: string, conversationId?: string) {
    // 1. Fetch or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.chatConversation.findFirst({
        where: { id: conversationId, userId },
      });
      if (!conversation) throw new NotFoundError('Conversation');
    } else {
      // Create new conversation with generated title
      conversation = await prisma.chatConversation.create({
        data: { userId, title: message.slice(0, 40) + '...' },
      });
    }

    // 2. Fetch context from DB (RAG step - scoped to this org)
    // Here we'd fetch recent clients, filings, unpaid invoices to ground the AI
    const context = await this.gatherContext(orgId);

    // 3. Save user message
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      },
    });

    // 4. Call LLM or Stub
    let responseText = '';
    let usage = { promptTokens: 0, completionTokens: 0, model: config.ai.model };

    if (openai && (config.ai.provider === 'openai' || config.ai.provider === 'gemini')) {
      const history = await prisma.chatMessage.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: 'asc' },
        take: 10,
      });

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { 
          role: 'system', 
          content: `You are an AI chatbot for the website "OM Associates". 
          CRITICAL RULE: Only answer questions related to this website, its domain (taxation, GST, accounting, corporate compliance in India), and the specific user context provided. Do not answer questions outside of this scope.
          If you cannot fulfill the user's query or do not know the answer, politely tell them to contact the website owner.
          
          Use the following client data to ground your answers: ${JSON.stringify(context)}`
        },
        ...history.map((m: any) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      ];

      try {
        const completion = await openai.chat.completions.create({
          model: config.ai.model,
          messages,
        });

        responseText = completion.choices[0]?.message?.content || 'I could not generate a response. Please contact the website owner.';
        usage = {
          promptTokens: completion.usage?.prompt_tokens ?? 0,
          completionTokens: completion.usage?.completion_tokens ?? 0,
          model: completion.model,
        };
      } catch (error: any) {
        if (error?.status === 429) {
          responseText = "I am currently experiencing high traffic or my limits have been reached. Since this is related to taxation and your query, please contact the website owner for further assistance.";
        } else {
          console.error("AI Error:", error);
          responseText = "I'm having trouble processing your request right now. Please contact the website owner for further assistance.";
        }
      }
    } else {
      // Stub behavior for development without API key
      responseText = `[Stub] I am the TaxOS AI. I received your message: "${message}". ` + 
        `In a production environment, I would answer this using your live financial context. ` +
        `Current org has ${context.clientsCount} clients and ₹${context.totalUnpaid / 100} unpaid invoices.`;
    }

    // 5. Save assistant message
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: responseText,
        contextSnapshot: context, // Save what the AI saw to answer this
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        modelUsed: usage.model,
      },
    });

    return {
      conversationId: conversation.id,
      message: assistantMessage,
    };
  }

  static async getConversations(userId: string) {
    return prisma.chatConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
  }

  static async getConversationMessages(conversationId: string, userId: string) {
    const convo = await prisma.chatConversation.findFirst({
      where: { id: conversationId, userId },
    });
    if (!convo) throw new NotFoundError('Conversation');

    return prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  private static async gatherContext(orgId: string) {
    // Lightweight context gathering for the prompt
    const [clientsCount, unpaidInvoices] = await Promise.all([
      prisma.client.count({ where: { organizationId: orgId, deletedAt: null } }),
      prisma.invoice.aggregate({
        where: { organizationId: orgId, status: { in: ['SENT', 'OVERDUE'] }, deletedAt: null },
        _sum: { totalPaise: true, paidAmountPaise: true },
      }),
    ]);

    const totalUnpaid = (unpaidInvoices._sum.totalPaise ?? 0n) - (unpaidInvoices._sum.paidAmountPaise ?? 0n);

    return {
      clientsCount,
      totalUnpaid: Number(totalUnpaid),
      timestamp: new Date().toISOString(),
    };
  }
}
