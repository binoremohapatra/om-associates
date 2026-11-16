const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function seedAllUsersAndAppointments() {
  console.log('Connecting to Neon PostgreSQL database...');
  await prisma.$connect();

  const users = await prisma.user.findMany({
    include: { organization: true }
  });

  console.log(`Found ${users.length} users across organizations.`);

  // Profile data for each specific user
  const userProfiles = {
    'ayushomprakashtripathi@gmail.com': {
      companyName: 'Tripathi Realcon & Infrastructure LLP',
      gstin: '07AAQFT8821L1Z3',
      pan: 'AAQFT8821L',
      entityType: 'LLP',
      city: 'Noida',
      state: 'Uttar Pradesh',
      turnover: 92000000n,
      invoices: [{ num: 'INV-TRP-2025-01', paise: 4500000n, note: 'RERA Compliance & Real Estate Tax Retainer' }],
      cases: [{
        caseNumber: 'RERA-UP-2025-771',
        title: 'RERA Project Registration & Stamp Duty Structuring',
        court: 'UP RERA Authority, Greater Noida',
        description: 'Joint development agreement capital gains & RERA disclosure compliance',
        daysAhead: 5
      }],
      appointments: [
        {
          title: 'RERA Project Structuring & JDA Capital Gains',
          description: 'Consultation with Senior Advocate Om Prakash Tripathi on Joint Development Agreement tax exposure',
          daysAhead: 2,
          duration: 45,
          meetLink: 'https://meet.google.com/om-rera-consult'
        },
        {
          title: 'Advance Tax Instalment Q4 Review',
          description: 'Discussion on estimated real estate sales receipts & advance tax planning',
          daysAhead: 10,
          duration: 30,
          meetLink: 'https://meet.google.com/om-adv-tax'
        }
      ]
    },
    'harshjoshi181205@gmail.com': {
      companyName: 'Joshi Global Infotech Pvt Ltd',
      gstin: '27AAACJ9942M1Z5',
      pan: 'AAACJ9942M',
      entityType: 'PRIVATE_LIMITED',
      city: 'Mumbai',
      state: 'Maharashtra',
      turnover: 84000000n,
      invoices: [{ num: 'INV-JSH-2025-08', paise: 3800000n, note: 'SEZ Software Export & Cross-Border Advisory' }],
      cases: [{
        caseNumber: 'ITAT-MUM-2025-10AA',
        title: 'Section 10AA Software Export Deduction Audit Scrutiny',
        court: 'Income Tax Appellate Tribunal (ITAT), Mumbai',
        description: 'Foreign inward remittance certificates and export billing reconciliation',
        daysAhead: 8
      }],
      appointments: [
        {
          title: 'Software Export Withholding Tax & 10AA Scrutiny',
          description: 'Strategy session with Senior Advocate Om Prakash Tripathi for upcoming ITAT submission',
          daysAhead: 3,
          duration: 45,
          meetLink: 'https://meet.google.com/om-joshi-itat'
        }
      ]
    },
    'vishwaskumar@gmail.com': {
      companyName: 'Kumar Logistics & Transport Solutions Pvt Ltd',
      gstin: '10AAACK4411P1Z9',
      pan: 'AAACK4411P',
      entityType: 'PRIVATE_LIMITED',
      city: 'Patna',
      state: 'Bihar',
      turnover: 68000000n,
      invoices: [{ num: 'INV-KMR-2025-14', paise: 2800000n, note: 'Fleet GST & E-Way Bill Retainer' }],
      cases: [{
        caseNumber: 'EWB-PAT-SEC129-2025',
        title: 'Section 129 E-Way Bill Goods Detention Penalty Waiver',
        court: 'Commercial Taxes Department Appeals, Patna',
        description: 'Breakdown of consignment vehicle delay affidavit & bank guarantee release appeal',
        daysAhead: 6
      }],
      appointments: [
        {
          title: 'E-Way Bill Detention Penalty Waiver & Hearing Prep',
          description: 'Case hearing preparation with Senior Advocate Om Prakash Tripathi',
          daysAhead: 4,
          duration: 30,
          meetLink: 'https://meet.google.com/om-ewb-appeal'
        }
      ]
    },
    'test@test.com': {
      companyName: 'Apex Digital Retailers Pvt Ltd',
      gstin: '07AAACT1122Q1Z4',
      pan: 'AAACT1122Q',
      entityType: 'PRIVATE_LIMITED',
      city: 'New Delhi',
      state: 'Delhi',
      turnover: 52000000n,
      invoices: [{ num: 'INV-TST-2025-02', paise: 1800000n, note: 'E-Commerce TCS/TDS Monthly Retainer' }],
      cases: [{
        caseNumber: 'GST-TCS-DEL-2025',
        title: 'Marketplace E-Commerce TCS Credit Ledger Reconciliation',
        court: 'GST Ward 21, New Delhi',
        description: 'TCS credit discrepancy resolution with Amazon & Flipkart portals',
        daysAhead: 11
      }],
      appointments: [
        {
          title: 'E-Commerce Marketplace GST & Annual Filing Checklist',
          description: 'Consultation with Om Associates on Marketplace GST & Annual Filings',
          daysAhead: 3,
          duration: 30,
          meetLink: 'https://meet.google.com/om-test-retail'
        }
      ]
    }
  };

  // Seed for specific users
  for (const user of users) {
    const profile = userProfiles[user.email];
    if (!profile) continue;

    console.log(`\n========================================`);
    console.log(`Seeding data for user: ${user.name} (${user.email})...`);
    console.log(`Organization: ${user.organization?.name || user.organizationId}`);

    // 1. Ensure or update primary client
    let client = await prisma.client.findFirst({
      where: { organizationId: user.organizationId }
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          organizationId: user.organizationId,
          name: profile.companyName,
          gstin: profile.gstin,
          pan: profile.pan,
          entityType: profile.entityType,
          city: profile.city,
          state: profile.state,
          email: user.email,
          isActive: true
        }
      });
      console.log(`  + Created client: ${client.name}`);
    } else {
      client = await prisma.client.update({
        where: { id: client.id },
        data: {
          name: profile.companyName,
          gstin: profile.gstin,
          pan: profile.pan,
          entityType: profile.entityType,
          city: profile.city,
          state: profile.state,
          isActive: true
        }
      });
      console.log(`  ~ Updated client: ${client.name}`);
    }

    // Clean existing data for this client
    await prisma.appointment.deleteMany({ where: { clientId: client.id } });
    await prisma.gstFiling.deleteMany({ where: { clientId: client.id } });
    await prisma.taxFiling.deleteMany({ where: { clientId: client.id } });
    await prisma.invoice.deleteMany({ where: { clientId: client.id } });
    await prisma.legalCase.deleteMany({ where: { clientId: client.id } });
    await prisma.document.deleteMany({ where: { clientId: client.id } });

    // 2. Seed Appointments
    console.log(`  + Seeding ${profile.appointments.length} appointments...`);
    for (const apt of profile.appointments) {
      await prisma.appointment.create({
        data: {
          clientId: client.id,
          createdById: user.id,
          title: apt.title,
          description: apt.description,
          scheduledAt: new Date(Date.now() + apt.daysAhead * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // e.g. afternoon
          durationMinutes: apt.duration,
          status: 'SCHEDULED',
          meetLink: apt.meetLink
        }
      });
    }

    // 3. Seed Monthly GST Filings
    console.log(`  + Seeding GST Filings...`);
    const gstMonths = [
      { month: 'Jun', start: new Date('2025-06-01'), end: new Date('2025-06-30') },
      { month: 'Jul', start: new Date('2025-07-01'), end: new Date('2025-07-31') },
      { month: 'Aug', start: new Date('2025-08-01'), end: new Date('2025-08-31') },
      { month: 'Sep', start: new Date('2025-09-01'), end: new Date('2025-09-30') },
      { month: 'Oct', start: new Date('2025-10-01'), end: new Date('2025-10-31') },
    ];

    for (const m of gstMonths) {
      const scaledTurnover = profile.turnover / 6n;
      const scaledTax = (scaledTurnover * 18n) / 100n;

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
          totalTaxableValue: scaledTurnover,
          totalTaxPayable: scaledTax,
          acknowledgementNo: `AA${profile.gstin.slice(0, 2)}${m.month.toUpperCase()}2500${Math.floor(1000 + Math.random() * 9000)}C`,
          idempotencyKey: crypto.randomUUID()
        }
      });

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
          totalTaxableValue: scaledTurnover,
          totalTaxPayable: scaledTax,
          totalCgst: scaledTax / 2n,
          totalSgst: scaledTax / 2n,
          acknowledgementNo: `AA${profile.gstin.slice(0, 2)}${m.month.toUpperCase()}2500${Math.floor(1000 + Math.random() * 9000)}B`,
          idempotencyKey: crypto.randomUUID()
        }
      });
    }

    // Active Pending GSTR-3B (Due in 4 days)
    const novTurnover = profile.turnover / 5n;
    const novTax = (novTurnover * 18n) / 100n;
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
        notes: `Monthly tax offset & reconciliation for ${profile.companyName}`,
        idempotencyKey: crypto.randomUUID()
      }
    });

    // 4. Seed Income Tax
    console.log(`  + Seeding Income Tax...`);
    const taxableInc = (profile.turnover * 80n) / 100n;
    const taxLiab = (taxableInc * 15n) / 100n;
    await prisma.taxFiling.create({
      data: {
        clientId: client.id,
        createdById: user.id,
        financialYear: '2025-26',
        grossIncome: profile.turnover,
        totalDeductions: profile.turnover - taxableInc,
        taxableIncome: taxableInc,
        taxLiability: taxLiab,
        totalTaxPayable: taxLiab,
        tdsDeducted: (taxLiab * 80n) / 100n,
        netTaxPayable: (taxLiab * 20n) / 100n,
        status: 'ACCEPTED',
        acknowledgementNo: `ACK${profile.pan}202501`,
        filedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
        idempotencyKey: crypto.randomUUID()
      }
    });

    // 5. Seed Invoices
    console.log(`  + Seeding Invoices...`);
    for (const inv of profile.invoices) {
      await prisma.invoice.create({
        data: {
          organizationId: user.organizationId,
          clientId: client.id,
          createdById: user.id,
          invoiceNumber: inv.num,
          financialYear: '2025-26',
          status: 'SENT',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          subtotalPaise: (inv.paise * 84n) / 100n,
          totalTaxPaise: (inv.paise * 16n) / 100n,
          totalPaise: inv.paise,
          notes: inv.note,
          idempotencyKey: crypto.randomUUID()
        }
      });
    }

    // 6. Seed Legal Cases
    console.log(`  + Seeding Legal Cases...`);
    for (const c of profile.cases) {
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

    // 7. Seed Documents
    console.log(`  + Seeding Documents...`);
    await prisma.document.create({
      data: {
        clientId: client.id,
        fileName: `${profile.companyName.replace(/\s+/g, '_')}_GSTR3B_Ack.pdf`,
        fileType: 'application/pdf',
        sizeBytes: 245000,
        fileUrl: `/documents/${profile.pan}-gstr3b.pdf`,
        category: 'GST Receipt'
      }
    });
    await prisma.document.create({
      data: {
        clientId: client.id,
        fileName: `${profile.companyName.replace(/\s+/g, '_')}_ITR_Ack_AY2025.pdf`,
        fileType: 'application/pdf',
        sizeBytes: 390000,
        fileUrl: `/documents/${profile.pan}-itr.pdf`,
        category: 'Income Tax'
      }
    });
  }

  // Also seed appointments for the main user (Baddy's organization: cmrxrw1ht000leq20d4874yot)
  console.log(`\n========================================`);
  console.log(`Seeding Appointments for Main User Organization (cmrxrw1ht000leq20d4874yot)...`);
  const mainClients = await prisma.client.findMany({
    where: { organizationId: 'cmrxrw1ht000leq20d4874yot' }
  });

  const baddyUser = await prisma.user.findFirst({
    where: { email: 'binoremohapatra@gmail.com' }
  });

  if (mainClients.length > 0 && baddyUser) {
    const primaryClient = mainClients[0];
    await prisma.appointment.deleteMany({ where: { clientId: primaryClient.id } });

    await prisma.appointment.create({
      data: {
        clientId: primaryClient.id,
        createdById: baddyUser.id,
        title: 'Quarterly Corporate Tax Strategy & GST Audit Prep',
        description: 'Comprehensive meeting with Advocate Om Prakash Tripathi on ITC reconciliation & annual tax saving',
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // In 2 days
        durationMinutes: 45,
        status: 'SCHEDULED',
        meetLink: 'https://meet.google.com/om-tax-strategy'
      }
    });

    await prisma.appointment.create({
      data: {
        clientId: primaryClient.id,
        createdById: baddyUser.id,
        title: 'High Court Appeal Filing Pre-Submission Review',
        description: 'Review of writ petition draft and evidentiary annexures with Senior Legal Counsel',
        scheduledAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // In 6 days
        durationMinutes: 30,
        status: 'SCHEDULED',
        meetLink: 'https://meet.google.com/om-hc-appeal'
      }
    });

    console.log(`  ✓ Created 2 high-level consultation appointments for ${primaryClient.name}!`);
  }

  console.log('\n✅ ALL USERS, PROFILES, FILINGS & APPOINTMENTS SEEDED IN NEON POSTGRESQL!');
}

seedAllUsersAndAppointments()
  .catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
