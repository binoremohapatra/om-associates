import { z } from 'zod';
import { UserRole, EntityType, TaxRegime } from '@prisma/client';
import { validateGstin, validatePan } from '../utils/helpers';

// ── Shared Primitives ─────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
});

const gstinSchema = z.string().refine((val) => validateGstin(val).isValid, {
  message: 'Invalid GSTIN format or checksum',
});

const panSchema = z.string().refine((val) => validatePan(val).isValid, {
  message: 'Invalid PAN format',
});

// ── Auth Schemas ─────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ── Client Schemas ───────────────────────────────────────────────────────────

export const createClientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  gstin: gstinSchema.optional().nullable(),
  pan: panSchema.optional().nullable(),
  entityType: z.nativeEnum(EntityType),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
});

export const updateClientSchema = createClientSchema.partial();

// ── Tax Calculation Schemas ──────────────────────────────────────────────────

export const calculateTaxSchema = z.object({
  entityType: z.nativeEnum(EntityType),
  financialYear: z.string().regex(/^\d{4}-\d{2}$/, 'Must be in format YYYY-YY (e.g. 2025-26)'),
  grossIncome: z.number().int().min(0, 'Gross income must be >= 0 (in paise)'),
  totalDeductions: z.number().int().min(0).optional().default(0),
  regime: z.nativeEnum(TaxRegime).optional().default('NEW'),
  presumptiveTurnover: z.number().int().min(0).optional(),
  presumptiveRate: z.number().min(0).max(100).optional(),
});

// ── GST Schemas ───────────────────────────────────────────────────────────────

export const calculateGstSchema = z.object({
  amount: z.number().int().min(0, 'Amount must be >= 0 (in paise)'),
  rate: z.union([z.literal(0), z.literal(5), z.literal(12), z.literal(18), z.literal(28)]),
  transactionType: z.enum(['INTRA_STATE', 'INTER_STATE', 'EXPORT']),
});

// ── Invoice Schemas ───────────────────────────────────────────────────────────

export const invoiceLineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().min(0.01),
  unitPricePaise: z.number().int().min(0),
  gstRate: z.union([z.literal(0), z.literal(5), z.literal(12), z.literal(18), z.literal(28)]),
  hsn: z.string().optional().nullable(),
});

export const createInvoiceSchema = z.object({
  clientId: z.string().cuid(),
  invoiceDate: z.string().datetime(),
  dueDate: z.string().datetime(),
  discountPaise: z.number().int().min(0).optional().default(0),
  transactionType: z.enum(['INTRA_STATE', 'INTER_STATE', 'EXPORT']).default('INTRA_STATE'),
  lineItems: z.array(invoiceLineItemSchema).min(1, 'At least one line item is required'),
  notes: z.string().optional().nullable(),
  termsConditions: z.string().optional().nullable(),
});
