import { Request, Response, NextFunction } from 'express';
import { TaxService } from '../services/tax.service';
import { sendSuccess, sendCreated } from '../utils/helpers';
import { z } from 'zod';
import { TaxRegime, EntityType } from '@prisma/client';
import { ItrParserService } from '../services/itr-parser.service';
import { prisma } from '../config/database';
import { encrypt } from '../utils/crypto';
import { BadRequestError } from '../types/errors';

export class TaxController {
  static async getTaxRules(req: Request, res: Response, next: NextFunction) {
    try {
      const { financialYear } = req.query;
      const rules = await TaxService.getTaxRules(
        req.user!.organizationId,
        (financialYear as string) || '2025-26'
      );
      sendSuccess(res, { rules });
    } catch (err) {
      next(err);
    }
  }

  static async createTaxFiling(req: Request, res: Response, next: NextFunction) {
    try {
      const filing = await TaxService.createTaxFiling(req.body, req.user!.id);
      
      // Convert BigInt to strings for JSON serialization
      const serialized = {
        ...filing,
        grossIncome: filing.grossIncome.toString(),
        totalDeductions: filing.totalDeductions.toString(),
        taxableIncome: filing.taxableIncome.toString(),
        taxLiability: filing.taxLiability.toString(),
        surcharge: filing.surcharge.toString(),
        cess: filing.cess.toString(),
        totalTaxPayable: filing.totalTaxPayable.toString(),
        netTaxPayable: filing.netTaxPayable.toString(),
        advanceTaxPaid: filing.advanceTaxPaid.toString(),
        tdsDeducted: filing.tdsDeducted.toString(),
      };

      sendCreated(res, { filing: serialized });
    } catch (err) {
      next(err);
    }
  }

  static async getTaxFilings(req: Request, res: Response, next: NextFunction) {
    try {
      const clientId = req.params.clientId as string;
      const filings = await TaxService.getTaxFilings(clientId);
      
      const serialized = filings.map(f => ({
        ...f,
        grossIncome: f.grossIncome.toString(),
        totalDeductions: f.totalDeductions.toString(),
        taxableIncome: f.taxableIncome.toString(),
        taxLiability: f.taxLiability.toString(),
        surcharge: f.surcharge.toString(),
        cess: f.cess.toString(),
        totalTaxPayable: f.totalTaxPayable.toString(),
        netTaxPayable: f.netTaxPayable.toString(),
        advanceTaxPaid: f.advanceTaxPaid.toString(),
        tdsDeducted: f.tdsDeducted.toString(),
      }));

      sendSuccess(res, { filings: serialized });
    } catch (err) {
      next(err);
    }
  }

  static async addDeduction(req: Request, res: Response, next: NextFunction) {
    try {
      const clientId = req.params.clientId as string;
      const deduction = await TaxService.addDeduction(clientId, req.body);
      
      sendCreated(res, { 
        deduction: {
          ...deduction,
          amountPaise: deduction.amountPaise.toString()
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async getDeductions(req: Request, res: Response, next: NextFunction) {
    try {
      const clientId = req.params.clientId as string;
      const { financialYear } = req.query;
      const deductions = await TaxService.getDeductions(clientId, financialYear as string);
      
      sendSuccess(res, {
        deductions: deductions.map(d => ({
          ...d,
          amountPaise: d.amountPaise.toString()
        }))
      });
    } catch (err) {
      next(err);
    }
  }

  static async uploadItrV(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new BadRequestError('No PDF file uploaded');

      const parsedData = await ItrParserService.parsePdf(req.file.buffer);
      if (!parsedData.pan) throw new BadRequestError('Could not find a valid PAN in the uploaded document.');
      
      const orgId = req.user!.organizationId;
      const encryptedPan = encrypt(parsedData.pan);
      
      let client = await prisma.client.findFirst({
        where: { organizationId: orgId, pan: encryptedPan }
      });

      if (!client) {
        client = await prisma.client.create({
          data: {
            organizationId: orgId,
            name: `Unknown Client (${parsedData.pan})`,
            pan: encryptedPan,
            entityType: EntityType.PROPRIETORSHIP
          }
        });
      }

      const financialYear = parsedData.assessmentYear 
        ? ItrParserService.ayToFy(parsedData.assessmentYear)
        : '2024-25';

      let filing = await prisma.taxFiling.findFirst({
        where: { clientId: client.id, financialYear }
      });

      if (!filing) {
        filing = await prisma.taxFiling.create({
          data: {
            clientId: client.id,
            createdById: req.user!.id,
            financialYear,
            regime: TaxRegime.NEW,
            grossIncome: parsedData.grossIncome,
            totalDeductions: parsedData.totalDeductions,
            taxableIncome: Math.max(0, parsedData.grossIncome - parsedData.totalDeductions),
            taxLiability: parsedData.netTaxPayable,
            totalTaxPayable: parsedData.netTaxPayable,
            netTaxPayable: parsedData.netTaxPayable,
            idempotencyKey: `itrv-${client.id}-${financialYear}-${Date.now()}`,
            status: 'FILED',
            filedAt: new Date()
          }
        });

        if (parsedData.totalDeductions > 0) {
          await prisma.deduction.create({
            data: {
              clientId: client.id,
              taxFilingId: filing.id,
              financialYear,
              section: 'Chapter VI-A',
              description: 'Imported from ITR-V',
              amountPaise: parsedData.totalDeductions,
            }
          });
        }
      }

      sendCreated(res, { 
        filing: {
          ...filing,
          grossIncome: filing.grossIncome.toString(),
          totalDeductions: filing.totalDeductions.toString(),
          taxableIncome: filing.taxableIncome.toString(),
          taxLiability: filing.taxLiability.toString(),
          surcharge: filing.surcharge.toString(),
          cess: filing.cess.toString(),
          totalTaxPayable: filing.totalTaxPayable.toString(),
          netTaxPayable: filing.netTaxPayable.toString(),
          advanceTaxPaid: filing.advanceTaxPaid.toString(),
          tdsDeducted: filing.tdsDeducted.toString(),
        },
        parsedData 
      });
    } catch (err) {
      next(err);
    }
  }
}
