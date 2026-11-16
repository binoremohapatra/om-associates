const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function seed() {
  console.log('Connecting to Neon PostgreSQL database...');
  await prisma.$connect();

  const org = await prisma.organization.findFirst({
    where: { id: 'cmrxrw1ht000leq20d4874yot' }
  });

  if (!org) {
    console.error('Target organization not found');
    process.exit(1);
  }

  console.log(`Found organization: ${org.name} (${org.id})`);

  // Update org with professional details if not set
  await prisma.organization.update({
    where: { id: org.id },
    data: {
      name: 'Om Associates Clients & Partners',
      gstin: '07AAAAA0000A1Z5',
      pan: 'AAAPO1234F',
      entityType: 'PRIVATE_LIMITED',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      phone: '+91 75039 01456',
      email: 'om.associates.adv@gmail.com'
    }
  });

  // Find a user to act as creator
  const user = await prisma.user.findFirst({
    where: { organizationId: org.id }
  });

  if (!user) {
    console.error('No user found for organization');
    process.exit(1);
  }

  console.log(`Using creator user: ${user.name} (${user.email})`);

  // 1. Create or ensure Client
  let client = await prisma.client.findFirst({
    where: { organizationId: org.id, name: 'Om Apex Enterprises Pvt Ltd' }
  });

  if (!client) {
    client = await prisma.client.create({
      data: {
        organizationId: org.id,
        name: 'Om Apex Enterprises Pvt Ltd',
        gstin: '07AABCO1234D1Z8',
        pan: 'AABCO1234D',
        entityType: 'PRIVATE_LIMITED',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        phone: '+91 75039 01456',
        email: 'billing@omapex.com',
        isActive: true
      }
    });
    console.log(`Created primary client: ${client.name} (${client.id})`);
  } else {
    console.log(`Primary client exists: ${client.id}`);
  }

  // 2. Clear old demo data for this client if needed and recreate fresh
  await prisma.gstFiling.deleteMany({ where: { clientId: client.id } });
  await prisma.taxFiling.deleteMany({ where: { clientId: client.id } });
  await prisma.invoice.deleteMany({ where: { clientId: client.id } });
  await prisma.legalCase.deleteMany({ where: { clientId: client.id } });
  await prisma.document.deleteMany({ where: { clientId: client.id } });

  console.log('Seeding GST Filings...');
  const gstMonths = [
    { month: 'Jun 2025', start: new Date('2025-06-01'), end: new Date('2025-06-30'), turnover: 42000000n, tax: 7560000n, itc: 4200000n },
    { month: 'Jul 2025', start: new Date('2025-07-01'), end: new Date('2025-07-31'), turnover: 49000000n, tax: 8820000n, itc: 5120000n },
    { month: 'Aug 2025', start: new Date('2025-08-01'), end: new Date('2025-08-31'), turnover: 53000000n, tax: 9540000n, itc: 5800000n },
    { month: 'Sep 2025', start: new Date('2025-09-01'), end: new Date('2025-09-30'), turnover: 61000000n, tax: 10980000n, itc: 6740000n },
    { month: 'Oct 2025', start: new Date('2025-10-01'), end: new Date('2025-10-31'), turnover: 58000000n, tax: 10440000n, itc: 6310000n },
  ];

  for (const m of gstMonths) {
    // GSTR-1 Filed
    await prisma.gstFiling.create({
      data: {
        clientId: client.id,
        createdById: user.id,
        formType: 'GSTR_1',
        periodStart: m.start,
        periodEnd: m.end,
        dueDate: new Date(m.end.getTime() + 11 * 24 * 60 * 60 * 1000),
        filedAt: new Date(m.end.getTime() + 10 * 24 * 60 * 60 * 1000),
        status: 'FILED',
        totalTaxableValue: m.turnover,
        totalTaxPayable: m.tax,
        acknowledgementNo: `AA07${m.start.getMonth() + 1}2500${Math.floor(1000 + Math.random() * 9000)}C`,
        idempotencyKey: crypto.randomUUID()
      }
    });

    // GSTR-3B Filed
    await prisma.gstFiling.create({
      data: {
        clientId: client.id,
        createdById: user.id,
        formType: 'GSTR_3B',
        periodStart: m.start,
        periodEnd: m.end,
        dueDate: new Date(m.end.getTime() + 20 * 24 * 60 * 60 * 1000),
        filedAt: new Date(m.end.getTime() + 19 * 24 * 60 * 60 * 1000),
        status: 'FILED',
        totalTaxableValue: m.turnover,
        totalTaxPayable: m.tax,
        totalCgst: m.tax / 2n,
        totalSgst: m.tax / 2n,
        acknowledgementNo: `AA07${m.start.getMonth() + 1}2500${Math.floor(1000 + Math.random() * 9000)}B`,
        idempotencyKey: crypto.randomUUID()
      }
    });
  }

  // Active Month (Nov 2025)
  // GSTR-1 Filed
  await prisma.gstFiling.create({
    data: {
      clientId: client.id,
      createdById: user.id,
      formType: 'GSTR_1',
      periodStart: new Date('2025-11-01'),
      periodEnd: new Date('2025-11-30'),
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      filedAt: new Date(),
      status: 'FILED',
      totalTaxableValue: 64500000n,
      totalTaxPayable: 11610000n,
      acknowledgementNo: 'AA071125008912C',
      idempotencyKey: crypto.randomUUID()
    }
  });

  // GSTR-3B Pending (Due in 4 days)
  const dueDateGst3b = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
  await prisma.gstFiling.create({
    data: {
      clientId: client.id,
      createdById: user.id,
      formType: 'GSTR_3B',
      periodStart: new Date('2025-11-01'),
      periodEnd: new Date('2025-11-30'),
      dueDate: dueDateGst3b,
      status: 'PENDING',
      totalTaxableValue: 64500000n,
      totalTaxPayable: 11610000n,
      notes: 'Pending final offset from electronic credit ledger',
      idempotencyKey: crypto.randomUUID()
    }
  });

  console.log('Seeding Income Tax Filings...');
  await prisma.taxFiling.create({
    data: {
      clientId: client.id,
      createdById: user.id,
      financialYear: '2025-26',
      grossIncome: 750000000n, // ₹75 Lakhs
      totalDeductions: 15000000n,
      taxableIncome: 600000000n,
      taxLiability: 90000000n,
      totalTaxPayable: 93600000n, // tax + cess
      tdsDeducted: 72000000n,
      netTaxPayable: 21600000n,
      status: 'ACCEPTED',
      acknowledgementNo: 'ACK981240912401',
      filedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      idempotencyKey: crypto.randomUUID()
    }
  });

  console.log('Seeding Invoices...');
  await prisma.invoice.create({
    data: {
      organizationId: org.id,
      clientId: client.id,
      createdById: user.id,
      invoiceNumber: 'INV-2025-089',
      financialYear: '2025-26',
      status: 'SENT',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      subtotalPaise: 4000000n,
      totalCgstPaise: 360000n,
      totalSgstPaise: 360000n,
      totalTaxPaise: 720000n,
      totalPaise: 4720000n, // ₹47,200
      notes: 'Professional Legal & GST Advisory Retainer',
      idempotencyKey: crypto.randomUUID()
    }
  });

  await prisma.invoice.create({
    data: {
      organizationId: org.id,
      clientId: client.id,
      createdById: user.id,
      invoiceNumber: 'INV-2025-072',
      financialYear: '2025-26',
      status: 'PAID',
      dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      paidAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      subtotalPaise: 3500000n,
      totalTaxPaise: 630000n,
      totalPaise: 4130000n,
      paidAmountPaise: 4130000n,
      notes: 'MCA Annual Compliance & Filing',
      idempotencyKey: crypto.randomUUID()
    }
  });

  console.log('Seeding Legal Cases...');
  await prisma.legalCase.create({
    data: {
      clientId: client.id,
      caseNumber: 'ROC-DEL-2025-9128',
      title: 'Annual ROC Compliance & Filing',
      court: 'Registrar of Companies (ROC) Delhi',
      status: 'OPEN',
      description: 'Director KYC & Financial statements (AOC-4, MGT-7) in legal review',
      nextHearingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.legalCase.create({
    data: {
      clientId: client.id,
      caseNumber: 'GST-APPEAL-42-2025',
      title: 'ITC Mismatch Reconciliation (GSTR-2B vs 3B)',
      court: 'GST State Jurisdiction Ward 42',
      status: 'OPEN',
      description: 'Vendor invoice mismatch reconciliation & salvage response submitted',
      nextHearingDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000)
    }
  });

  console.log('Seeding Documents...');
  await prisma.document.create({
    data: {
      clientId: client.id,
      fileName: 'GSTR-3B_Oct2025_Acknowledgment.pdf',
      fileType: 'application/pdf',
      sizeBytes: 245760,
      fileUrl: '/documents/gstr-3b-oct2025.pdf',
      category: 'GST Receipt'
    }
  });

  await prisma.document.create({
    data: {
      clientId: client.id,
      fileName: 'Form_16_PartA_AY2025-26.pdf',
      fileType: 'application/pdf',
      sizeBytes: 421888,
      fileUrl: '/documents/form-16-parta.pdf',
      category: 'Income Tax'
    }
  });

  await prisma.document.create({
    data: {
      clientId: client.id,
      fileName: 'OmAssociates_Retainer_Receipt_089.pdf',
      fileType: 'application/pdf',
      sizeBytes: 189440,
      fileUrl: '/documents/retainer-receipt-089.pdf',
      category: 'Tax Invoice'
    }
  });

  console.log('Seeding Audit Log...');
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: 'UPDATE',
      entityType: 'GstFiling',
      entityId: client.id,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  });

  console.log('✅ SEEDING COMPLETE! Real data stored in Neon PostgreSQL.');
}

seed()
  .catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
