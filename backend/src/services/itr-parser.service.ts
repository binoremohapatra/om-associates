const pdf = require('pdf-parse');
import { logger } from '../utils/logger';

export interface ParsedItrData {
  pan: string | null;
  assessmentYear: string | null;
  grossIncome: number;
  totalDeductions: number;
  netTaxPayable: number;
}

export class ItrParserService {
  /**
   * Parses an ITR-V or ITR Acknowledgment PDF buffer and extracts key financial data.
   */
  static async parsePdf(buffer: Buffer): Promise<ParsedItrData> {
    try {
      const data = await pdf(buffer);
      const text = data.text;
      
      // Basic logging to debug text structure if needed
      logger.info(`Extracted ${text.length} characters from ITR PDF`);

      const result: ParsedItrData = {
        pan: null,
        assessmentYear: null,
        grossIncome: 0,
        totalDeductions: 0,
        netTaxPayable: 0,
      };

      // 1. Extract PAN (Standard format: 5 letters, 4 numbers, 1 letter)
      const panMatch = text.match(/[A-Z]{5}[0-9]{4}[A-Z]/);
      if (panMatch) {
        result.pan = panMatch[0];
      }

      // 2. Extract Assessment Year
      // Looks for "Assessment Year 2024-25" or "AY 2024-25"
      const ayMatch = text.match(/(?:Assessment Year|AY)[\s:-]*(\d{4}-\d{2})/i);
      if (ayMatch && ayMatch[1]) {
        result.assessmentYear = ayMatch[1];
      }

      // Helper function to extract currency values
      const extractCurrency = (pattern: RegExp): number => {
        const match = text.match(pattern);
        if (match && match[1]) {
          // Remove commas and convert to number
          const parsed = parseInt(match[1].replace(/,/g, ''), 10);
          return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
      };

      // 3. Gross Total Income
      result.grossIncome = extractCurrency(/Gross Total Income.*?([\d,]+)/i);

      // 4. Deductions
      result.totalDeductions = extractCurrency(/Deductions under Chapter VI-A.*?([\d,]+)/i);

      // 5. Net Tax Payable (often 'Total Tax Payable' or 'Net tax payable')
      let tax = extractCurrency(/Net tax payable.*?([\d,]+)/i);
      if (tax === 0) {
         tax = extractCurrency(/Total Tax, Surcharge and Education Cess.*?([\d,]+)/i);
      }
      result.netTaxPayable = tax;

      return result;
    } catch (error: any) {
      logger.error(`Error parsing ITR PDF: ${error.message}`);
      throw new Error('Failed to parse ITR PDF document. Please ensure it is a valid, unlocked ITR-V file.');
    }
  }

  /**
   * Helper to convert Assessment Year (e.g. 2024-25) to Financial Year (e.g. 2023-24)
   */
  static ayToFy(ay: string): string {
    const parts = ay.split('-');
    if (parts.length === 2) {
      const start = parseInt(parts[0], 10) - 1;
      const end = parseInt(parts[1], 10) - 1;
      return `${start}-${end}`;
    }
    return ay; // Fallback
  }
}
