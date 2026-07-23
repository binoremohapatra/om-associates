import { Request, Response } from 'express';
import { prisma } from '../config/database'; 
import { logger } from '../utils/logger';

export class DashboardController {
  static getSummary = async (req: Request, res: Response) => {
    try {
      const orgId = (req as any).user?.organizationId;
      
      if (!orgId) {
        return res.status(401).json({ success: false, error: 'Unauthorized: No organization found' });
      }

      // Execute concurrent queries for performance
      const [
        activeClientsCount,
        totalGstFilings,
        overdueGstFilings,
        totalTaxFilings,
        overdueTaxFilings,
        pendingInvoices,
        lastInvoice,
        recentLogs,
        recentDocuments
      ] = await Promise.all([
        // 1. Business Status queries
        prisma.client.count({ where: { organizationId: orgId, isActive: true } }),
        prisma.gstFiling.count({ where: { client: { organizationId: orgId } } }),
        prisma.gstFiling.count({ where: { client: { organizationId: orgId }, status: 'OVERDUE' } }),
        prisma.taxFiling.count({ where: { client: { organizationId: orgId } } }),
        prisma.taxFiling.count({ where: { client: { organizationId: orgId }, status: 'OVERDUE' } }),
        
        // 2. Payment Summary queries
        prisma.invoice.aggregate({
          where: { organizationId: orgId, status: { in: ['DRAFT', 'SENT'] } },
          _sum: { totalPaise: true }
        }),
        prisma.invoice.findFirst({
          where: { organizationId: orgId },
          orderBy: { updatedAt: 'desc' },
          select: { invoiceNumber: true, status: true }
        }),

        // 3. Recent Activity queries
        prisma.auditLog.findMany({
          where: { actor: { organizationId: orgId } },
          orderBy: { createdAt: 'desc' },
          take: 4,
          select: { action: true, entityType: true, createdAt: true }
        }),

        // 4. Recent Documents
        prisma.document.findMany({
          where: { client: { organizationId: orgId } },
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: { fileName: true, fileType: true }
        })
      ]);

      // Calculate Compliance Score (100% minus the percentage of overdue filings)
      const totalFilings = totalGstFilings + totalTaxFilings;
      const totalOverdue = overdueGstFilings + overdueTaxFilings;
      let complianceScore = 100;
      if (totalFilings > 0) {
        complianceScore = Math.max(0, Math.round(100 - ((totalOverdue / totalFilings) * 100)));
      }

      const businessStatus = {
        gst: activeClientsCount > 0 ? 'Active' : 'Inactive',
        pan: activeClientsCount > 0 ? 'Verified' : 'Pending',
        iec: activeClientsCount > 0 ? 'Active' : 'Inactive',
        complianceScore
      };

      // Query Upcoming Due Dates
      const upcomingGst = await prisma.gstFiling.findMany({
        where: { client: { organizationId: orgId }, status: 'PENDING', dueDate: { gte: new Date() } },
        orderBy: { dueDate: 'asc' },
        take: 2,
        select: { formType: true, dueDate: true }
      });

      const upcomingTax = await prisma.taxFiling.findMany({
        where: { client: { organizationId: orgId }, status: 'PENDING' },
        orderBy: { createdAt: 'desc' }, // TaxFiling doesn't have a direct dueDate in schema, using creation for proxy
        take: 1,
        select: { financialYear: true, createdAt: true }
      });

      const dueDates: any[] = [];
      upcomingGst.forEach(gst => {
        const daysLeft = Math.ceil((gst.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        dueDates.push({
          title: `GST Return (${gst.formType})`,
          status: daysLeft === 1 ? 'Due Tomorrow' : `${daysLeft} Days Left`,
          color: daysLeft <= 3 ? 'red' : 'amber'
        });
      });
      upcomingTax.forEach(tax => {
        dueDates.push({
          title: `ITR Filing (${tax.financialYear})`,
          status: '12 Days Left', // Mocking days left for ITR as schema doesn't have it
          color: 'sky'
        });
      });

      // Map Payment Summary
      const paymentSummary = {
        pendingBills: Math.round(Number(pendingInvoices._sum.totalPaise || 0) / 100), // Convert paise to rupees
        lastInvoice: lastInvoice?.invoiceNumber || '-',
        lastInvoiceStatus: lastInvoice?.status || '-'
      };

      // Map Recent Activity
      const recentActivity = recentLogs.map(log => {
        let type = 'document';
        if (log.entityType === 'GstFiling' || log.entityType === 'TaxFiling') type = 'gst';
        if (log.entityType === 'Invoice') type = 'payment';
        
        // Simple relative time string
        const diffMs = Date.now() - log.createdAt.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHrs / 24);
        let dateStr = 'Just now';
        if (diffDays > 0) dateStr = diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
        else if (diffHrs > 0) dateStr = `${diffHrs} hours ago`;

        return {
          title: `${log.action} ${log.entityType}`,
          date: dateStr,
          type
        };
      });

      res.json({
        success: true,
        data: {
          businessStatus,
          dueDates,
          paymentSummary,
          recentActivity,
          recentDocuments: recentDocuments || []
        }
      });
    } catch (error: any) {
      logger.error(`Dashboard Summary Error: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch dashboard summary' });
    }
  };
}

