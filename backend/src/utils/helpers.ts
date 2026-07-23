// ── GSTIN Validation ─────────────────────────────────────────────────────────
// Format: 2-digit state + 10-char PAN + 1-digit entity + Z + 1 checksum
// Reference: GST Council's checksum specification

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const GSTIN_CHAR_SET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function gstinChecksumChar(gstin: string): string {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const charVal = GSTIN_CHAR_SET.indexOf(gstin[i]!);
    const factor = (i + 1) % 2 === 0 ? 2 : 1;
    const product = charVal * factor;
    sum += Math.floor(product / GSTIN_CHAR_SET.length) + (product % GSTIN_CHAR_SET.length);
  }
  const remainder = sum % GSTIN_CHAR_SET.length;
  return GSTIN_CHAR_SET[(GSTIN_CHAR_SET.length - remainder) % GSTIN_CHAR_SET.length]!;
}

export interface GstinValidationResult {
  isValid: boolean;
  errors: string[];
  parsed?: {
    stateCode: string;
    pan: string;
    entityOrder: string;
    checkDigit: string;
  };
}

export function validateGstin(gstin: string): GstinValidationResult {
  const errors: string[] = [];

  if (!gstin) {
    return { isValid: false, errors: ['GSTIN is required'] };
  }

  const cleaned = gstin.trim().toUpperCase();

  if (cleaned.length !== 15) {
    errors.push(`GSTIN must be exactly 15 characters (got ${cleaned.length})`);
    return { isValid: false, errors };
  }

  if (!GSTIN_REGEX.test(cleaned)) {
    errors.push('GSTIN format is invalid (expected: 2 digits + 5 letters + 4 digits + 1 letter + [1-9A-Z] + Z + checksum)');
    return { isValid: false, errors };
  }

  const stateCode = parseInt(cleaned.slice(0, 2), 10);
  if (stateCode < 1 || stateCode > 38) {
    errors.push(`Invalid state code: ${cleaned.slice(0, 2)} (valid: 01–37)`);
    return { isValid: false, errors };
  }

  const expectedChecksum = gstinChecksumChar(cleaned);
  if (cleaned[14] !== expectedChecksum) {
    errors.push(`Checksum mismatch (expected: ${expectedChecksum}, got: ${cleaned[14]})`);
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    parsed: {
      stateCode: cleaned.slice(0, 2),
      pan: cleaned.slice(2, 12),
      entityOrder: cleaned[12]!,
      checkDigit: cleaned[14]!,
    },
  };
}

// ── PAN Validation ────────────────────────────────────────────────────────────
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export function validatePan(pan: string): { isValid: boolean; error?: string } {
  const cleaned = pan.trim().toUpperCase();
  if (cleaned.length !== 10) return { isValid: false, error: 'PAN must be exactly 10 characters' };
  if (!PAN_REGEX.test(cleaned)) return { isValid: false, error: 'PAN format invalid (AAAAA9999A)' };
  return { isValid: true };
}

// ── Financial Year Utilities ──────────────────────────────────────────────────

export function getCurrentFinancialYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-based
  // FY runs Apr 1 – Mar 31
  const fyStart = month >= 4 ? year : year - 1;
  const fyEnd = fyStart + 1;
  return `${fyStart}-${String(fyEnd).slice(2)}`;
}

export function parseFy(fy: string): { startYear: number; endYear: number } {
  const [startStr, endStr] = fy.split('-');
  const startYear = parseInt(startStr!, 10);
  const endYear = startYear + 1;
  return { startYear, endYear };
}

export function getFyDateRange(fy: string): { start: Date; end: Date } {
  const { startYear } = parseFy(fy);
  return {
    start: new Date(`${startYear}-04-01T00:00:00.000Z`),
    end: new Date(`${startYear + 1}-03-31T23:59:59.999Z`),
  };
}

// ── Money Utilities (paise <-> rupees) ────────────────────────────────────────

export function rupeesToPaise(rupees: number): bigint {
  return BigInt(Math.round(rupees * 100));
}

export function paiseToRupees(paise: bigint): number {
  return Number(paise) / 100;
}

export function formatInr(paise: bigint): string {
  const rupees = paiseToRupees(paise);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(rupees);
}

// Serialize BigInt-containing objects for JSON response
export function serializeBigInt<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_key, val) => (typeof val === 'bigint' ? Number(val) : val))
  ) as T;
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(query: { page?: string; limit?: string }, maxLimit = 100): PaginationParams {
  const page = Math.max(1, parseInt(query.page ?? '1', 10));
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit ?? '20', 10)));
  return { page, limit, skip: (page - 1) * limit };
}

export function buildPaginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// ── Response Builder ──────────────────────────────────────────────────────────

import { Response } from 'express';
import type { ApiResponse, PaginationMeta } from '../types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: PaginationMeta
): void {
  // Serialize BigInt fields before sending
  const serialized = serializeBigInt(data);
  res.status(statusCode).json({
    success: true,
    data: serialized,
    ...(meta ? { meta } : {}),
  } satisfies ApiResponse<T>);
}

export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, 201);
}

export function sendNoContent(res: Response): void {
  res.status(204).end();
}
