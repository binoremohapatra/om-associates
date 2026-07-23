const pdf = require('pdf-parse');
import { logger } from '../utils/logger';

export interface ParsedEximData {
  recordType: 'IEC' | 'BILL_OF_ENTRY' | 'SHIPPING_BILL' | 'LUT' | 'UNKNOWN';
  documentNumber: string | null;
  portCode: string | null;
}

export class EximParserService {
  /**
   * Parses an EXIM document (IEC, Shipping Bill, etc.) PDF buffer and extracts key data.
   */
  static async parsePdf(buffer: Buffer): Promise<ParsedEximData> {
    try {
      const data = await pdf(buffer);
      const text = data.text;
      
      logger.info(`Extracted ${text.length} characters from EXIM PDF`);

      const result: ParsedEximData = {
        recordType: 'UNKNOWN',
        documentNumber: null,
        portCode: null,
      };

      // 1. Determine Record Type & Document Number
      if (text.match(/Importer[\s-]*Exporter\s*Code/i) || text.match(/\bIEC\b/i)) {
        result.recordType = 'IEC';
        // Extract IEC: usually 10 alphanumeric characters
        const iecMatch = text.match(/(?:IEC(?:\s*No\.?)?|Importer[\s-]*Exporter\s*Code)[\s:-]*([A-Z0-9]{10})/i);
        if (iecMatch && iecMatch[1]) {
          result.documentNumber = iecMatch[1];
        }
      } else if (text.match(/Shipping\s*Bill/i)) {
        result.recordType = 'SHIPPING_BILL';
        // Shipping bill usually 7 digits
        const sbMatch = text.match(/Shipping\s*Bill(?:\s*No\.?)?[\s:-]*(\d+)/i);
        if (sbMatch && sbMatch[1]) {
          result.documentNumber = sbMatch[1];
        }
      } else if (text.match(/Bill\s*of\s*Entry/i)) {
        result.recordType = 'BILL_OF_ENTRY';
        // BoE usually 7 digits
        const boeMatch = text.match(/Bill\s*of\s*Entry(?:\s*No\.?)?[\s:-]*(\d+)/i);
        if (boeMatch && boeMatch[1]) {
          result.documentNumber = boeMatch[1];
        }
      } else if (text.match(/Letter\s*of\s*Undertaking/i) || text.match(/\bLUT\b/i)) {
        result.recordType = 'LUT';
        // LUT ARN usually 15 characters
        const lutMatch = text.match(/(?:ARN|LUT(?:\s*No\.?)?)[\s:-]*([A-Z0-9]+)/i);
        if (lutMatch && lutMatch[1]) {
          result.documentNumber = lutMatch[1];
        }
      }

      // 2. Determine Port Code (Typically 6 characters like INBOM4 for shipping bills/boe)
      const portMatch = text.match(/(?:Port\s*Code)[\s:-]*([A-Z0-9]{6})/i);
      if (portMatch && portMatch[1]) {
        result.portCode = portMatch[1];
      }

      return result;
    } catch (error: any) {
      logger.error(`Error parsing EXIM PDF: ${error.message}`);
      throw new Error('Failed to parse EXIM document. Please ensure it is a valid, unlocked PDF.');
    }
  }
}
