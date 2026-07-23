import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import crypto from 'crypto';

export class PaymentController {
  // Get Payment Analytics
  static async getAnalytics(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;

      const invoices = await prisma.invoice.findMany({
        where: { organizationId: orgId },
        select: {
          status: true,
          totalPaise: true,
          paidAt: true,
          dueDate: true,
        }
      });

      let totalRevenuePaise = BigInt(0);
      let pendingBillsPaise = BigInt(0);
      let overdueInvoices = 0;

      const now = new Date();
      const revenueByMonth: Record<string, number> = {};

      for (const inv of invoices) {
        if (inv.status === 'PAID') {
          totalRevenuePaise += inv.totalPaise;
          if (inv.paidAt) {
            const monthName = inv.paidAt.toLocaleString('default', { month: 'short' });
            revenueByMonth[monthName] = (revenueByMonth[monthName] || 0) + Number(inv.totalPaise) / 100;
          }
        } else if (inv.status === 'SENT') {
          pendingBillsPaise += inv.totalPaise;
          if (inv.dueDate && inv.dueDate < now) {
            overdueInvoices++;
          }
        } else if (inv.status === 'OVERDUE') {
          pendingBillsPaise += inv.totalPaise;
          overdueInvoices++;
        }
      }

      const revenueData = Object.entries(revenueByMonth).map(([name, amount]) => ({ name, amount }));

      const analytics = {
        totalRevenue: Number(totalRevenuePaise) / 100,
        pendingBills: Number(pendingBillsPaise) / 100,
        activeSubscriptions: 0,
        overdueInvoices,
        revenueData
      };

      res.status(200).json({ success: true, data: analytics });
    } catch (error: any) {
      logger.error(`Get Payment Analytics Error: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
  }

  // Create Invoice
  static async createInvoice(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { clientId, amount, description } = req.body;

      if (!clientId || !amount) {
        return res.status(400).json({ success: false, error: 'Client and amount are required' });
      }

      const client = await prisma.client.findFirst({
        where: { id: clientId, organizationId: orgId }
      });

      if (!client) {
        return res.status(403).json({ success: false, error: 'Client not found or unauthorized' });
      }

      const amountPaise = BigInt(Math.floor(Number(amount) * 100));
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);

      const invoice = await prisma.invoice.create({
        data: {
          organizationId: orgId,
          clientId,
          createdById: req.user!.id,
          invoiceNumber,
          financialYear: '2026-27',
          status: 'SENT',
          dueDate,
          subtotalPaise: amountPaise,
          idempotencyKey: invoiceNumber,
        }
      });

      return res.status(201).json({ success: true, data: invoice });
    } catch (error: any) {
      logger.error(`Create Invoice Error: ${error.message}`);
      return res.status(500).json({ success: false, error: 'Failed to create invoice' });
    }
  }

  // Get Invoices
  static async getInvoices(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { status } = req.query;

      const where: any = { organizationId: orgId };
      if (status && status !== 'ALL') {
        where.status = status;
      }

      const invoices = await prisma.invoice.findMany({
        where,
        include: { client: { select: { name: true, gstin: true } } },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({ success: true, data: invoices });
    } catch (error: any) {
      logger.error(`Get Invoices Error: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch invoices' });
    }
  }

  // Create Subscription
  static async createSubscription(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { clientId, planName, amount, billingCycle } = req.body;

      if (!clientId || !planName || !amount) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      const client = await prisma.client.findFirst({
        where: { id: clientId, organizationId: orgId }
      });

      if (!client) {
        return res.status(403).json({ success: false, error: 'Client not found or unauthorized' });
      }

      const amountPaise = BigInt(Math.floor(Number(amount) * 100));
      const nextBillingDate = new Date();
      if (billingCycle === 'YEARLY') {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      } else {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      }

      const subscription = await prisma.subscription.create({
        data: {
          clientId,
          planName,
          amountPaise,
          billingCycle: billingCycle || 'MONTHLY',
          status: 'ACTIVE',
          nextBillingDate,
          razorpaySubId: `sub_mock_${Date.now()}`
        }
      });

      return res.status(201).json({ success: true, data: subscription });
    } catch (error: any) {
      logger.error(`Create Subscription Error: ${error.message}`);
      return res.status(500).json({ success: false, error: 'Failed to create subscription' });
    }
  }

  // Get Subscriptions
  static async getSubscriptions(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;

      // We need to fetch subscriptions for clients belonging to this org
      const clients = await prisma.client.findMany({
        where: { organizationId: orgId },
        select: { id: true }
      });
      const clientIds = clients.map(c => c.id);

      const subscriptions = await prisma.subscription.findMany({
        where: { clientId: { in: clientIds } },
        include: { client: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({ success: true, data: subscriptions });
    } catch (error: any) {
      logger.error(`Get Subscriptions Error: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch subscriptions' });
    }
  }

  // Create Razorpay Order (Mock)
  static async createOrder(req: Request, res: Response) {
    try {
      const { invoiceId, amountPaise } = req.body;

      // Mocking Razorpay order creation
      const mockOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;

      // Create pending transaction
      const transaction = await prisma.paymentTransaction.create({
        data: {
          invoiceId,
          clientId: req.user!.id, // should technically be the client ID, using user ID as placeholder for demo
          amountPaise: BigInt(amountPaise),
          razorpayOrderId: mockOrderId,
          status: 'PENDING'
        }
      });

      res.status(200).json({
        success: true,
        data: {
          id: mockOrderId,
          amount: amountPaise,
          currency: 'INR'
        }
      });
    } catch (error: any) {
      logger.error(`Create Order Error: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to create payment order' });
    }
  }

  // Verify Razorpay Payment (Mock)
  static async verifyPayment(req: Request, res: Response) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      // In production: Verify signature using razorpay secret
      // const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET)
      //   .update(razorpay_order_id + "|" + razorpay_payment_id)
      //   .digest('hex');
      // if (generated_signature !== razorpay_signature) throw new Error("Invalid signature");

      // Update Transaction
      const transaction = await prisma.paymentTransaction.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          status: 'SUCCESS'
        }
      });

      // Update Invoice Status
      if (transaction.invoiceId) {
        await prisma.invoice.update({
          where: { id: transaction.invoiceId },
          data: { status: 'PAID', paidAt: new Date() }
        });
      }

      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } catch (error: any) {
      logger.error(`Verify Payment Error: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to verify payment' });
    }
  }
}

// Ensure BigInt serialization works in JSON
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
