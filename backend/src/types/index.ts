import { Request, Response } from 'express';
import { UserRole } from '@prisma/client';

// Extend Express Request with authenticated context
declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
    interface Request {
      requestId: string;
      organizationId?: string;
    }
  }
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string;
  name: string;
  avatarUrl: string | null;
}

// Standard API response envelope
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// Type-safe response helpers
export type TypedRequest<TBody = unknown, TQuery = unknown, TParams = unknown> = Request<
  Record<string, string> & (TParams extends object ? TParams : Record<string, never>),
  unknown,
  TBody,
  TQuery extends object ? TQuery : Record<string, never>
>;

export type TypedResponse<T = unknown> = Response<ApiResponse<T>>;

// Financial types
export type PaiseAmount = bigint;

export interface MoneyAmount {
  paise: bigint;
  rupees: number;
  formatted: string;
}

// Tax domain types
export interface TaxSlabBracket {
  min: number; // paise
  max: number | null; // null = unlimited
  rate: number; // 0.05 = 5%
}

export interface SurchargeRule {
  threshold: number; // paise
  rate: number; // 0.1 = 10%
  isMarginalRelief: boolean;
}

export interface TaxCalculationInput {
  grossIncome: bigint; // paise
  entityType: string;
  financialYear: string;
  regime?: 'NEW' | 'OLD';
  totalDeductions?: bigint; // paise
  deductions?: bigint; // paise
  presumptiveTurnover?: bigint; // paise (for 44AD/44ADA)
}

export interface TaxCalculationResult {
  grossIncome: bigint;
  totalDeductions: bigint;
  taxableIncome: bigint;
  taxLiability: bigint;
  surcharge: bigint;
  cess: bigint;
  totalTaxPayable: bigint;
  effectiveRatePercent: number;
  breakdown: TaxBreakdownLine[];
}

export interface TaxBreakdownLine {
  slabRange: string;
  slabRate: number;
  amount: bigint;
  tax: bigint;
}

export interface GstCalculationInput {
  amount: bigint; // paise (taxable value)
  rate: number; // 0, 5, 12, 18, 28
  transactionType: 'INTRA_STATE' | 'INTER_STATE' | 'EXPORT';
}

export interface GstCalculationResult {
  taxableValue: bigint;
  gstRate: number;
  transactionType: string;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgst: bigint;
  sgst: bigint;
  igst: bigint;
  totalGst: bigint;
  totalInvoiceValue: bigint;
}

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  orgId: string;
  type: 'access' | 'refresh';
  jti?: string; // JWT ID for refresh token tracking
}
