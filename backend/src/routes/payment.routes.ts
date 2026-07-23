import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth middleware
router.use(authenticate);

// Analytics
router.get('/analytics', PaymentController.getAnalytics);

// Invoices
router.get('/invoices', PaymentController.getInvoices);
router.post('/invoices', PaymentController.createInvoice);

// Subscriptions
router.get('/subscriptions', PaymentController.getSubscriptions);
router.post('/subscriptions', PaymentController.createSubscription);

// Razorpay Mock Endpoints
router.post('/razorpay/order', PaymentController.createOrder);
router.post('/razorpay/verify', PaymentController.verifyPayment);

export default router;
