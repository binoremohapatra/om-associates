const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function isolateUsers() {
  console.log('Connecting to Neon PostgreSQL database...');
  await prisma.$connect();

  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users in database.`);

  const baddyEmails = [
    'binoremohapatra@gmail.com',
    'mohapatrabinore9@gmail.com',
    'mrbaddyforu@gmail.com',
    'animewifulover@gmail.com'
  ];

  for (const user of users) {
    if (baddyEmails.includes(user.email)) {
      console.log(`User ${user.email} is in main multi-company org (cmrxrw1ht000leq20d4874yot).`);
      continue;
    }

    console.log(`Isolating user: ${user.name} (${user.email})...`);

    // Create an isolated organization for this user
    const org = await prisma.organization.create({
      data: {
        name: `${user.name || 'Client'}'s Isolated Workspace`,
        email: user.email,
        entityType: 'PRIVATE_LIMITED',
        subscriptionTier: 'FREE',
        city: 'New Delhi',
        state: 'Delhi'
      }
    });

    // Update user to point to their own organization
    await prisma.user.update({
      where: { id: user.id },
      data: {
        organizationId: org.id,
        role: 'OWNER'
      }
    });

    // Create an isolated client company specifically for this user
    await prisma.client.create({
      data: {
        organizationId: org.id,
        name: `${user.name || 'My'} Enterprises Pvt Ltd`,
        gstin: `07${user.name ? user.name.slice(0, 4).toUpperCase() : 'USER'}1234A1Z1`,
        pan: `${user.name ? user.name.slice(0, 4).toUpperCase() : 'USER'}1234A`,
        entityType: 'PRIVATE_LIMITED',
        city: 'New Delhi',
        state: 'Delhi',
        email: user.email,
        isActive: true
      }
    });

    console.log(`  ✓ Isolated into Org: ${org.id}`);
  }

  console.log('✅ MULTI-TENANCY ISOLATION COMPLETE! Each user now has their OWN separate organization.');
}

isolateUsers()
  .catch(err => {
    console.error('Isolation failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
