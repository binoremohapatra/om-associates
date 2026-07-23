import { prisma } from '../config/database';
import { TaxRegime, EntityType } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../types/errors';

export class TaxService {
  /**
   * Fetch all Tax Rules for an organization or global defaults.
   */
  static async getTaxRules(organizationId: string, financialYear: string) {
    const rules = await prisma.taxRule.findMany({
      where: {
        financialYear,
        OR: [{ organizationId: null }, { organizationId }],
      },
    });
    return rules;
  }

  /**
   * Create or update a Tax Filing (Income Tax)
   */
  static async createTaxFiling(data: any, createdById: string) {
    const { clientId, financialYear, regime, grossIncome, deductions } = data;

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) throw new NotFoundError('Client not found');

    const rule = await prisma.taxRule.findFirst({
      where: {
        financialYear,
        entityType: client.entityType,
        regime,
      },
    });

    if (!rule) {
      throw new BadRequestError(`No tax rule configured for ${client.entityType} in ${financialYear}`);
    }

    // A very simplified calculation engine for the sake of architecture
    const totalDeductions = deductions || 0;
    const taxableIncome = Math.max(0, Number(grossIncome) - Number(totalDeductions));
    
    // In a real scenario, this iterates over rule.slabBrackets
    const taxLiability = taxableIncome > 50000000 ? taxableIncome * 0.3 : 0; 
    
    const surcharge = taxLiability * (rule.surchargeRules ? 0.1 : 0);
    const cess = (taxLiability + surcharge) * rule.cessRate;
    const totalTaxPayable = taxLiability + surcharge + cess;

    return prisma.taxFiling.create({
      data: {
        clientId,
        createdById,
        financialYear,
        regime,
        grossIncome,
        totalDeductions,
        taxableIncome,
        taxLiability,
        surcharge,
        cess,
        totalTaxPayable,
        netTaxPayable: totalTaxPayable, // without advance tax
        idempotencyKey: `tf_${clientId}_${financialYear}_${Date.now()}`,
      },
    });
  }

  static async getTaxFilings(clientId: string) {
    return prisma.taxFiling.findMany({
      where: { clientId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async addDeduction(clientId: string, data: any) {
    return prisma.deduction.create({
      data: {
        clientId,
        financialYear: data.financialYear,
        section: data.section,
        description: data.description,
        amountPaise: data.amountPaise,
      },
    });
  }

  static async getDeductions(clientId: string, financialYear: string) {
    return prisma.deduction.findMany({
      where: { clientId, financialYear },
    });
  }
}
