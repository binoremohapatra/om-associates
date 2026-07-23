import { prisma } from '../config/database';

export class AnalyticsService {
  static async getComplianceScore(organizationId: string) {
    // 1. Get total GST Filings due in the last 12 months
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    const filings = await prisma.gstFiling.findMany({
      where: {
        client: { organizationId },
        dueDate: { gte: oneYearAgo, lte: now },
      },
      select: { status: true, dueDate: true, filedAt: true },
    });

    let onTime = 0;
    let late = 0;
    let missed = 0;

    for (const f of filings) {
      if (f.status === 'FILED' || f.status === 'ACCEPTED') {
        if (f.filedAt && f.filedAt <= f.dueDate) {
          onTime++;
        } else {
          late++;
        }
      } else {
        missed++;
      }
    }

    const total = filings.length;
    let score = 100;
    
    if (total > 0) {
      const onTimeWeight = onTime * 1;
      const lateWeight = late * 0.5;
      score = Math.round(((onTimeWeight + lateWeight) / total) * 100);
    }

    return { score, onTime, late, missed, total };
  }

  static async getDashboardData(organizationId: string) {
    // 1. Compliance Score
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    const filings = await prisma.gstFiling.findMany({
      where: {
        client: { organizationId },
        dueDate: { gte: oneYearAgo, lte: now },
      },
      select: { status: true, dueDate: true, filedAt: true },
    });

    let onTime = 0;
    let late = 0;
    let missed = 0;

    for (const f of filings) {
      if (f.status === 'FILED' || f.status === 'ACCEPTED') {
        if (f.filedAt && f.filedAt <= f.dueDate) {
          onTime++;
        } else {
          late++;
        }
      } else {
        missed++;
      }
    }

    const totalFilings = filings.length;
    let score = 100;
    if (totalFilings > 0) {
      const onTimeWeight = onTime * 1;
      const lateWeight = late * 0.5;
      score = Math.round(((onTimeWeight + lateWeight) / totalFilings) * 100);
    }
    const onTimeRate = totalFilings > 0 ? ((onTime / totalFilings) * 100).toFixed(1) + '%' : '0%';

    // ITC Utilised (mock value for now, or aggregate if available)
    const itcUtilised = '₹0';
    // Active Notices
    const noticesCount = await prisma.gstNotice.count({
      where: {
        client: { organizationId },
        status: 'OPEN'
      }
    });

    // 2. Revenue Trends (Last 6 Months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueData = [];
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        status: 'PAID',
        invoiceDate: { gte: sixMonthsAgo }
      },
      select: { invoiceDate: true, totalPaise: true, totalTaxPaise: true }
    });

    // Initialize 6 months
    const monthMap = new Map();
    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo);
      d.setMonth(d.getMonth() + i);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthMap.set(key, { month: months[d.getMonth()], revenue: 0, tax: 0, savings: 0 });
    }

    invoices.forEach(inv => {
      const key = `${inv.invoiceDate.getFullYear()}-${inv.invoiceDate.getMonth()}`;
      if (monthMap.has(key)) {
        const d = monthMap.get(key);
        d.revenue += Number(inv.totalPaise) / 100;
        d.tax += Number(inv.totalTaxPaise) / 100;
        // Mock savings as 15% of tax for demonstration
        d.savings += (Number(inv.totalTaxPaise) / 100) * 0.15;
      }
    });

    for (const data of monthMap.values()) {
      revenueData.push(data);
    }

    // 3. Tax Breakdown (Current FY)
    const taxBreakdown = [];
    
    // Sum GST Payable
    const gstFilings = await prisma.gstFiling.aggregate({
      where: { client: { organizationId }, status: { in: ['FILED', 'ACCEPTED'] } },
      _sum: { totalTaxPayable: true }
    });
    const gstTotal = Number(gstFilings._sum.totalTaxPayable || 0) / 100;
    if (gstTotal > 0) taxBreakdown.push({ name: 'GST Payable', value: 0, amount: gstTotal, color: '#818CF8' });

    // Sum Income Tax
    const itFilings = await prisma.taxFiling.aggregate({
      where: { client: { organizationId }, status: { in: ['FILED', 'ACCEPTED'] } },
      _sum: { totalTaxPayable: true }
    });
    const itTotal = Number(itFilings._sum.totalTaxPayable || 0) / 100;
    if (itTotal > 0) taxBreakdown.push({ name: 'Income Tax', value: 0, amount: itTotal, color: '#38BDF8' });

    // Sum TDS (Mock from deductions or separate table if it exists, otherwise just default)
    const tdsTotal = 154000; // Mock placeholder
    taxBreakdown.push({ name: 'TDS/TCS', value: 0, amount: tdsTotal, color: '#34D399' });

    // Calculate percentages
    const totalTax = taxBreakdown.reduce((acc, curr) => acc + curr.amount, 0);
    taxBreakdown.forEach(t => {
      t.value = totalTax > 0 ? Math.round((t.amount / totalTax) * 100) : 0;
    });

    // 4. Recent Activity
    const recentActivity: any[] = [];
    // Get latest payment transactions
    const payments = await prisma.paymentTransaction.findMany({
      where: { client: { organizationId } },
      orderBy: { createdAt: 'desc' },
      take: 2,
      include: { client: true }
    });
    
    // Get latest filings
    const recentGstFilings = await prisma.gstFiling.findMany({
      where: { client: { organizationId }, status: { in: ['FILED', 'ACCEPTED'] } },
      orderBy: { filedAt: 'desc' },
      take: 2,
      include: { client: true }
    });

    payments.forEach(p => {
      recentActivity.push({
        id: p.id,
        type: p.status === 'SUCCESS' ? 'success' : p.status === 'FAILED' ? 'danger' : 'info',
        action: `Payment ${p.status.toLowerCase()} for ${p.client.name}`,
        time: p.createdAt.toISOString(),
        amount: Number(p.amountPaise) / 100
      });
    });

    recentGstFilings.forEach(f => {
      recentActivity.push({
        id: f.id,
        type: 'success',
        action: `${f.formType.replace('_', '-')} filed successfully for ${f.client.name}`,
        time: (f.filedAt || f.createdAt).toISOString(),
        amount: null
      });
    });

    // Sort combined activity by time
    recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    // Format times relative (e.g., "2 hours ago")
    recentActivity.forEach(a => {
      const diffMs = now.getTime() - new Date(a.time).getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHrs / 24);
      if (diffDays > 0) a.time = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      else if (diffHrs > 0) a.time = `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
      else a.time = 'Just now';
    });

    return {
      compliance: {
        score,
        returnsFiled: `${onTime + late}/${totalFilings}`,
        onTimeRate,
        activeNotices: noticesCount,
        itcUtilised
      },
      revenueTrends: revenueData,
      taxBreakdown: taxBreakdown.length > 0 ? taxBreakdown : [
        { name: 'Income Tax', value: 100, amount: 0, color: '#38BDF8' }
      ],
      recentActivity: recentActivity.slice(0, 4)
    };
  }
}
