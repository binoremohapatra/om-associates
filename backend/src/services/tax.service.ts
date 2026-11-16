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

    // A simplified Indian tax calculation engine
    const totalDeductions = deductions || 0;
    const taxableIncome = Math.max(0, Number(grossIncome) - Number(totalDeductions));
    
    // Standard tax rate: 30% for corporate/firm, progressive for individuals
    const isCompany = client.entityType === 'PRIVATE_LIMITED' || client.entityType === 'PUBLIC_LIMITED' || client.entityType === 'LLP';
    const taxLiability = isCompany ? taxableIncome * 0.25 : (taxableIncome > 50000000 ? taxableIncome * 0.2 : (taxableIncome > 30000000 ? taxableIncome * 0.05 : 0)); 
    
    const cessRate = rule?.cessRate ?? 0.04;
    const surcharge = taxLiability * (rule?.surchargeRules ? 0.1 : 0);
    const cess = (taxLiability + surcharge) * cessRate;
    const totalTaxPayable = Math.round(taxLiability + surcharge + cess);

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
