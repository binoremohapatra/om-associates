const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function seedMultipleCompanies() {
  console.log('Connecting to Neon PostgreSQL database...');
  await prisma.$connect();

  const orgId = 'cmrxrw1ht000leq20d4874yot';
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) {
    console.error('Organization not found');
    process.exit(1);
  }

  const user = await prisma.user.findFirst({ where: { organizationId: orgId } });
  if (!user) {
    console.error('User not found');
    process.exit(1);
  }

  console.log(`Target Organization: ${org.name} | User: ${user.name}`);

  const companies = [
    {
      name: 'Om Apex Enterprises Pvt Ltd',
      gstin: '07AABCO1234D1Z8',
      pan: 'AABCO1234D',
      entityType: 'PRIVATE_LIMITED',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      phone: '+91 75039 01456',
      email: 'billing@omapex.com',
      turnoverScale: 1.0,
      cases: [
        {
          caseNumber: 'ROC-DEL-2025-9128',
          title: 'Annual ROC Compliance & Filing (AOC-4 & MGT-7)',
          court: 'Registrar of Companies (ROC) Delhi',
          description: 'Director KYC, AOC-4 and MGT-7 filings in advocate review',
          daysAhead: 4
        },
        {
          caseNumber: 'GST-APPEAL-42-2025',
          title: 'GSTR-2B vs 3B Input Tax Credit Reconciliation',
          court: 'GST State Jurisdiction Ward 42',
          description: 'Vendor invoice mismatch reconciliation & salvage response submitted',
          daysAhead: 12
        }
      ],
      pendingInv: { num: 'INV-2025-089', paise: 4720000n, note: 'Retainer & Monthly GST Advisory' }
    },
    {
      name: 'Tripathi Logistics & Freight LLP',
      gstin: '06AATTL5678E1Z4',
      pan: 'AATTL5678E',
      entityType: 'LLP',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      phone: '+91 98101 23456',
      email: 'accounts@tripathilogistics.in',
      turnoverScale: 0.75,
      cases: [
        {
          caseNumber: 'EWB-PENALTY-HR-2025',
          title: 'E-Way Bill Detention Penalty Appeal (Sec 129)',
          court: 'Office of Joint Commissioner (Appeals), Gurugram',
          description: 'Vehicle transit delay breakdown justification and bank guarantee release petition',
          daysAhead: 6
        }
      ],
      pendingInv: { num: 'INV-2025-094', paise: 3250000n, note: 'LLP Annual Filing & E-Way Bill Legal Representation' }
    },
    {
      name: 'Shree Radhey Organics India Ltd',
      gstin: '09AABCS9988F1Z2',
      pan: 'AABCS9988F',
      entityType: 'PUBLIC_LIMITED',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201301',
      phone: '+91 99112 87654',
      email: 'compliance@radheyorganics.com',
      turnoverScale: 1.6,
      cases: [
        {
          caseNumber: 'DGFT-REDEMPTION-2025',
          title: 'DGFT EPCG Authorization Export Obligation Redemption',
          court: 'Directorate General of Foreign Trade (CLA), New Delhi',
          description: 'EODC submission for agricultural exports machinery duty remission',
          daysAhead: 9
        },
        {
          caseNumber: 'FSSAI-REG-UP-881',
          title: 'Central FSSAI License & Labelling Compliance Review',
          court: 'Food Safety and Standards Authority of India',
          description: 'Export grade packaging compliance verification completed',
          daysAhead: 18
        }
      ],
      pendingInv: { num: 'INV-2025-102', paise: 6500000n, note: 'Corporate Retainer & Export Advisory' }
    },
    {
      name: 'NxtGen Cloudworks Technologies Pvt Ltd',
      gstin: '29AAACN4321G1Z6',
      pan: 'AAACN4321G',
      entityType: 'PRIVATE_LIMITED',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560100',
      phone: '+91 80234 56789',
      email: 'finance@nxtgencloud.io',
      turnoverScale: 1.3,
      cases: [
        {
          caseNumber: 'IT-SEC-115BAA-BLR',
          title: 'Section 115BAA 22% Corporate Tax Concession Audit',
          court: 'Income Tax Appellate Tribunal (ITAT), Bengaluru',
          description: 'Software export withholding tax cross-border scrutiny submission',
          daysAhead: 15
        }
      ],
      pendingInv: { num: 'INV-2025-110', paise: 5400000n, note: 'Cross-Border SaaS Tax & LUT Advisory' }
    }
  ];

  for (const comp of companies) {
    console.log(`Processing company: ${comp.name}...`);

    let client = await prisma.client.findFirst({
      where: { organizationId: orgId, gstin: comp.gstin }
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          organizationId: orgId,
          name: comp.name,
          gstin: comp.gstin,
          pan: comp.pan,
          entityType: comp.entityType,
          city: comp.city,
          state: comp.state,
          pincode: comp.pincode,
          phone: comp.phone,
          email: comp.email,
          isActive: true
        }
      });
      console.log(`  + Created client: ${client.name} (${client.id})`);
    } else {
      await prisma.client.update({
        where: { id: client.id },
        data: {
          name: comp.name,
          pan: comp.pan,
          entityType: comp.entityType,
          city: comp.city,
          state: comp.state,
          phone: comp.phone,
          email: comp.email,
          isActive: true
        }
      });
      console.log(`  ~ Updated client: ${client.name} (${client.id})`);
    }

    // Clean existing filings/cases for this client to ensure idempotency
    await prisma.gstFiling.deleteMany({ where: { clientId: client.id } });
    await prisma.taxFiling.deleteMany({ where: { clientId: client.id } });
    await prisma.legalCase.deleteMany({ where: { clientId: client.id } });
    await prisma.invoice.deleteMany({ where: { clientId: client.id } });
    await prisma.document.deleteMany({ where: { clientId: client.id } });

    // Seed 5 months of GST filings
    const gstMonths = [
      { month: 'Jun', start: new Date('2025-06-01'), end: new Date('2025-06-30'), baseTurnover: 42000000 },
      { month: 'Jul', start: new Date('2025-07-01'), end: new Date('2025-07-31'), baseTurnover: 49000000 },
      { month: 'Aug', start: new Date('2025-08-01'), end: new Date('2025-08-31'), baseTurnover: 53000000 },
      { month: 'Sep', start: new Date('2025-09-01'), end: new Date('2025-09-30'), baseTurnover: 61000000 },
      { month: 'Oct', start: new Date('2025-10-01'), end: new Date('2025-10-31'), baseTurnover: 58000000 },
    ];

    for (const m of gstMonths) {
      const scaledTurnover = BigInt(Math.round(m.baseTurnover * comp.turnoverScale));
      const scaledTax = BigInt(Math.round(Number(scaledTurnover) * 0.18));

      // GSTR-1
      await prisma.gstFiling.create({
        data: {
          clientId: client.id,
          createdById: user.id,
          formType: 'GSTR_1',
          periodStart: m.start,
          periodEnd: m.end,
          dueDate: new Date(m.end.getTime() + 11 * 24 * 60 * 60 * 1000),
          filedAt: new Date(m.end.getTime() + 9 * 24 * 60 * 60 * 1000),
          status: 'FILED',
          totalTaxableValue: scaledTurnover,
          totalTaxPayable: scaledTax,
          acknowledgementNo: `AA${comp.gstin.slice(0, 2)}${m.month.toUpperCase()}2500${Math.floor(1000 + Math.random() * 9000)}C`,
          idempotencyKey: crypto.randomUUID()
        }
      });

      // GSTR-3B
      await prisma.gstFiling.create({
        data: {
          clientId: client.id,
          createdById: user.id,
          formType: 'GSTR_3B',
          periodStart: m.start,
          periodEnd: m.end,
          dueDate: new Date(m.end.getTime() + 20 * 24 * 60 * 60 * 1000),
          filedAt: new Date(m.end.getTime() + 18 * 24 * 60 * 60 * 1000),
          status: 'FILED',
          totalTaxableValue: scaledTurnover,
          totalTaxPayable: scaledTax,
          totalCgst: scaledTax / 2n,
          totalSgst: scaledTax / 2n,
          acknowledgementNo: `AA${comp.gstin.slice(0, 2)}${m.month.toUpperCase()}2500${Math.floor(1000 + Math.random() * 9000)}B`,
          idempotencyKey: crypto.randomUUID()
        }
      });
    }

    // Active Month GSTR-1 (Filed)
    const novTurnover = BigInt(Math.round(64500000 * comp.turnoverScale));
    const novTax = BigInt(Math.round(Number(novTurnover) * 0.18));
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
        totalTaxableValue: novTurnover,
        totalTaxPayable: novTax,
        acknowledgementNo: `AA${comp.gstin.slice(0, 2)}NOV2500912C`,
        idempotencyKey: crypto.randomUUID()
      }
    });

    // Active Month GSTR-3B (Pending, Due in 4 days)
    await prisma.gstFiling.create({
      data: {
        clientId: client.id,
        createdById: user.id,
        formType: 'GSTR_3B',
        periodStart: new Date('2025-11-01'),
        periodEnd: new Date('2025-11-30'),
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        status: 'PENDING',
        totalTaxableValue: novTurnover,
        totalTaxPayable: novTax,
        notes: `Monthly statutory return offset for ${comp.name}`,
        idempotencyKey: crypto.randomUUID()
      }
    });

    // Income Tax Filing
    const grossInc = BigInt(Math.round(750000000 * comp.turnoverScale));
    const taxableInc = BigInt(Math.round(Number(grossInc) * 0.8));
    const taxLiab = BigInt(Math.round(Number(taxableInc) * 0.15));
    await prisma.taxFiling.create({
      data: {
        clientId: client.id,
        createdById: user.id,
        financialYear: '2025-26',
        grossIncome: grossInc,
        totalDeductions: grossInc - taxableInc,
        taxableIncome: taxableInc,
        taxLiability: taxLiab,
        totalTaxPayable: taxLiab,
        tdsDeducted: BigInt(Math.round(Number(taxLiab) * 0.8)),
        netTaxPayable: BigInt(Math.round(Number(taxLiab) * 0.2)),
        status: 'ACCEPTED',
        acknowledgementNo: `ACK${comp.pan}202501`,
        filedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        idempotencyKey: crypto.randomUUID()
      }
    });

    // Pending Invoice
    await prisma.invoice.create({
      data: {
        organizationId: orgId,
        clientId: client.id,
        createdById: user.id,
        invoiceNumber: comp.pendingInv.num,
        financialYear: '2025-26',
        status: 'SENT',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        subtotalPaise: BigInt(Math.round(Number(comp.pendingInv.paise) * 0.84)),
        totalTaxPaise: BigInt(Math.round(Number(comp.pendingInv.paise) * 0.16)),
        totalPaise: comp.pendingInv.paise,
        notes: comp.pendingInv.note,
        idempotencyKey: crypto.randomUUID()
      }
    });

    // Legal Cases
    for (const c of comp.cases) {
      await prisma.legalCase.create({
        data: {
          clientId: client.id,
          caseNumber: c.caseNumber,
          title: c.title,
          court: c.court,
          status: 'OPEN',
          description: c.description,
          nextHearingDate: new Date(Date.now() + c.daysAhead * 24 * 60 * 60 * 1000)
        }
      });
    }

    // Documents
    await prisma.document.create({
      data: {
        clientId: client.id,
        fileName: `${comp.name.replace(/\s+/g, '_')}_GSTR3B_Ack.pdf`,
        fileType: 'application/pdf',
        sizeBytes: 256000,
        fileUrl: `/documents/${comp.pan}-gstr3b.pdf`,
        category: 'GST Receipt'
      }
    });
    await prisma.document.create({
      data: {
        clientId: client.id,
        fileName: `${comp.name.replace(/\s+/g, '_')}_Form16_AY2025.pdf`,
        fileType: 'application/pdf',
        sizeBytes: 412000,
        fileUrl: `/documents/${comp.pan}-form16.pdf`,
        category: 'Income Tax'
      }
    });
  }

  console.log('✅ ALL 4 COMPANIES SEEDED SUCCESSFULLY IN NEON POSTGRESQL!');
}

seedMultipleCompanies()
  .catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
