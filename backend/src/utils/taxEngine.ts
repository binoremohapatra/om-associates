/**
 * TaxOS Tax Calculation Engine
 * 
 * Pure functions only — no side effects, no I/O.
 * All monetary values in PAISE (BigInt).
 * Versioned by financial year — rates applied match what was in force at the time.
 */

import type {
  TaxCalculationInput,
  TaxCalculationResult,
  TaxSlabBracket,
  SurchargeRule,
  TaxBreakdownLine,
  GstCalculationInput,
  GstCalculationResult,
} from '../types';

// ── Income Tax Computation ────────────────────────────────────────────────────

export function computeIncomeTax(
  taxableIncomePaise: bigint,
  slabs: TaxSlabBracket[],
): { taxPaise: bigint; breakdown: TaxBreakdownLine[] } {
  let remaining = taxableIncomePaise;
  let totalTax = 0n;
  const breakdown: TaxBreakdownLine[] = [];

  for (const slab of slabs) {
    if (remaining <= 0n) break;

    const slabMin = BigInt(Math.round(slab.min));
    const slabMax = slab.max !== null ? BigInt(Math.round(slab.max)) : null;
    const slabWidth = slabMax !== null ? slabMax - slabMin : remaining;
    const taxableInSlab = slabMax !== null
      ? BigInt(Math.min(Number(remaining), Number(slabMax - slabMin)))
      : remaining;

    if (taxableInSlab <= 0n) {
      remaining -= BigInt(Math.min(Number(remaining), Number(slabWidth)));
      continue;
    }

    const slabRateBigInt = BigInt(Math.round(slab.rate * 10000)); // e.g. 0.05 → 500
    const tax = (taxableInSlab * slabRateBigInt) / 10000n;

    totalTax += tax;
    breakdown.push({
      slabRange: `${slab.min / 100000}L – ${slab.max ? slab.max / 100000 + 'L' : '∞'}`,
      slabRate: slab.rate,
      amount: taxableInSlab,
      tax,
    });

    remaining -= taxableInSlab;
  }

  return { taxPaise: totalTax, breakdown };
}

export function computeSurcharge(
  taxPaise: bigint,
  totalIncomePaise: bigint,
  surchargeRules: SurchargeRule[],
): bigint {
  const sortedRules = [...surchargeRules].sort((a, b) => a.threshold - b.threshold);
  let applicableRate = 0;

  for (const rule of sortedRules) {
    if (totalIncomePaise >= BigInt(Math.round(rule.threshold))) {
      applicableRate = rule.rate;
    }
  }

  if (applicableRate === 0) return 0n;

  const surcharge = (taxPaise * BigInt(Math.round(applicableRate * 10000))) / 10000n;

  // Marginal relief: surcharge cannot exceed the income above threshold
  const lowestRule = sortedRules[0];
  if (lowestRule && applicableRate > 0) {
    const incomeAboveThreshold = totalIncomePaise - BigInt(Math.round(lowestRule.threshold));
    if (surcharge > incomeAboveThreshold) {
      return incomeAboveThreshold > 0n ? incomeAboveThreshold : 0n;
    }
  }

  return surcharge;
}

export function computeCess(taxPlusSurchargePaise: bigint, cessRate: number): bigint {
  return (taxPlusSurchargePaise * BigInt(Math.round(cessRate * 10000))) / 10000n;
}

// ── Entity-Specific Computation ───────────────────────────────────────────────

export function computePresumptiveTax(
  turnoverPaise: bigint,
  presumptiveRatePercent: number, // e.g. 8 for 44AD, 50 for 44ADA
  slabs: TaxSlabBracket[],
  surchargeRules: SurchargeRule[],
  cessRate: number,
): TaxCalculationResult {
  // Step 1: Compute deemed income from turnover
  const deemedIncome = (turnoverPaise * BigInt(Math.round(presumptiveRatePercent * 100))) / 10000n;
  const { taxPaise, breakdown } = computeIncomeTax(deemedIncome, slabs);
  const surcharge = computeSurcharge(taxPaise, deemedIncome, surchargeRules);
  const cess = computeCess(taxPaise + surcharge, cessRate);

  return {
    grossIncome: deemedIncome,
    totalDeductions: 0n,
    taxableIncome: deemedIncome,
    taxLiability: taxPaise,
    surcharge,
    cess,
    totalTaxPayable: taxPaise + surcharge + cess,
    effectiveRatePercent:
      deemedIncome > 0n
        ? Number(((taxPaise + surcharge + cess) * 10000n) / deemedIncome) / 100
        : 0,
    breakdown,
  };
}

export function computeFlatRateTax(
  taxableIncomePaise: bigint,
  flatRate: number, // e.g. 0.30 for Partnership
  surchargeRules: SurchargeRule[],
  cessRate: number,
): TaxCalculationResult {
  const rateBigInt = BigInt(Math.round(flatRate * 10000));
  const taxPaise = (taxableIncomePaise * rateBigInt) / 10000n;
  const surcharge = computeSurcharge(taxPaise, taxableIncomePaise, surchargeRules);
  const cess = computeCess(taxPaise + surcharge, cessRate);

  return {
    grossIncome: taxableIncomePaise,
    totalDeductions: 0n,
    taxableIncome: taxableIncomePaise,
    taxLiability: taxPaise,
    surcharge,
    cess,
    totalTaxPayable: taxPaise + surcharge + cess,
    effectiveRatePercent:
      taxableIncomePaise > 0n
        ? Number(((taxPaise + surcharge + cess) * 10000n) / taxableIncomePaise) / 100
        : 0,
    breakdown: [
      {
        slabRange: 'Entire income (flat rate)',
        slabRate: flatRate,
        amount: taxableIncomePaise,
        tax: taxPaise,
      },
    ],
  };
}

export function computeSlabTax(input: TaxCalculationInput & {
  slabs: TaxSlabBracket[];
  surchargeRules: SurchargeRule[];
  cessRate: number;
}): TaxCalculationResult {
  const { grossIncome, totalDeductions = 0n, slabs, surchargeRules, cessRate } = input;
  const taxableIncome = grossIncome > totalDeductions ? grossIncome - totalDeductions : 0n;
  const { taxPaise, breakdown } = computeIncomeTax(taxableIncome, slabs);
  const surcharge = computeSurcharge(taxPaise, taxableIncome, surchargeRules);
  const cess = computeCess(taxPaise + surcharge, cessRate);

  return {
    grossIncome,
    totalDeductions,
    taxableIncome,
    taxLiability: taxPaise,
    surcharge,
    cess,
    totalTaxPayable: taxPaise + surcharge + cess,
    effectiveRatePercent:
      grossIncome > 0n
        ? Number(((taxPaise + surcharge + cess) * 10000n) / grossIncome) / 100
        : 0,
    breakdown,
  };
}

// ── Late Fee Computation (GST) ────────────────────────────────────────────────

export function computeGstLateFee(
  dueDate: Date,
  filedAt: Date | null,
  lateFeePerDayPaise: bigint,
  lateFeeMaxPaise: bigint,
): bigint {
  const reference = filedAt ?? new Date();
  if (reference <= dueDate) return 0n;

  const daysLate = Math.floor((reference.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  const rawFee = lateFeePerDayPaise * BigInt(daysLate);
  return rawFee > lateFeeMaxPaise ? lateFeeMaxPaise : rawFee;
}

export function computeGstInterest(
  taxDuePaise: bigint,
  dueDate: Date,
  paymentDate: Date | null,
  annualInterestRate: number,
): bigint {
  const reference = paymentDate ?? new Date();
  if (reference <= dueDate) return 0n;

  const daysLate = Math.floor((reference.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  const dailyRate = annualInterestRate / 365;
  const interest = (taxDuePaise * BigInt(Math.round(dailyRate * daysLate * 10000))) / 10000n;
  return interest;
}

// ── GST Calculation ───────────────────────────────────────────────────────────

const GST_RATES = [0, 5, 12, 18, 28] as const;
type GstRate = typeof GST_RATES[number];

export function computeGst(input: GstCalculationInput): GstCalculationResult {
  const { amount, rate, transactionType } = input;

  if (!GST_RATES.includes(rate as GstRate)) {
    throw new Error(`Invalid GST rate: ${rate}. Must be one of ${GST_RATES.join(', ')}`);
  }

  const rateBigInt = BigInt(Math.round(rate * 100)); // basis points * 100
  const totalGst = (amount * rateBigInt) / 10000n;

  let cgst = 0n, sgst = 0n, igst = 0n;
  let cgstRate = 0, sgstRate = 0, igstRate = 0;

  if (transactionType === 'INTRA_STATE') {
    cgst = totalGst / 2n;
    sgst = totalGst - cgst; // handles odd paise
    cgstRate = rate / 2;
    sgstRate = rate / 2;
  } else if (transactionType === 'INTER_STATE') {
    igst = totalGst;
    igstRate = rate;
  }
  // EXPORT: zero-rated, all values remain 0

  return {
    taxableValue: amount,
    gstRate: rate,
    transactionType,
    cgstRate,
    sgstRate,
    igstRate,
    cgst,
    sgst,
    igst,
    totalGst,
    totalInvoiceValue: amount + totalGst,
  };
}

// ── Compliance Score ──────────────────────────────────────────────────────────

export interface FilingRecord {
  dueDate: Date;
  filedAt: Date | null;
  weight?: number; // More recent filings weighted higher
}

export function computeComplianceScore(filings: FilingRecord[]): number {
  if (filings.length === 0) return 100;

  const now = new Date();
  const pastFilings = filings.filter((f) => f.dueDate < now);
  if (pastFilings.length === 0) return 100;

  let totalWeight = 0;
  let onTimeWeight = 0;

  pastFilings.forEach((filing, index) => {
    const weight = filing.weight ?? (index + 1); // recency weight
    totalWeight += weight;
    const isOnTime =
      filing.filedAt !== null && filing.filedAt <= filing.dueDate;
    if (isOnTime) onTimeWeight += weight;
  });

  return totalWeight > 0
    ? Math.round((onTimeWeight / totalWeight) * 100 * 10) / 10
    : 100;
}

// ── Invoice Line Item Computation ─────────────────────────────────────────────

export function computeLineItemTotals(
  unitPricePaise: bigint,
  quantity: number,
  gstRate: number,
  transactionType: GstCalculationInput['transactionType'],
) {
  const baseAmountPaise = BigInt(Math.round(Number(unitPricePaise) * quantity));
  const gstResult = computeGst({ amount: baseAmountPaise, rate: gstRate, transactionType });
  return {
    baseAmountPaise,
    cgstPaise: gstResult.cgst,
    sgstPaise: gstResult.sgst,
    igstPaise: gstResult.igst,
    totalPaise: gstResult.totalInvoiceValue,
    cgstRate: gstResult.cgstRate,
    sgstRate: gstResult.sgstRate,
    igstRate: gstResult.igstRate,
  };
}
