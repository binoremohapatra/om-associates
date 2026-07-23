import { Router } from 'express';
import express from 'express';
import { Webhook } from 'svix';
import { prisma } from '../config/database';

const router = Router();

router.post('/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Missing CLERK_WEBHOOK_SECRET' });
  }

  // Get the headers and body
  const headers = req.headers;
  const payload = req.body;

  // Get the Svix headers for verification
  const svix_id = headers['svix-id'] as string;
  const svix_timestamp = headers['svix-timestamp'] as string;
  const svix_signature = headers['svix-signature'] as string;

  // If there are no Svix headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Error occured -- no svix headers' });
  }

  // Create a new Webhook instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  // Attempt to verify the incoming webhook
  // If successful, the payload will be available from 'evt'
  // If the verification fails, error out and return error code
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err: any) {
    console.error('Error verifying webhook:', err.message);
    return res.status(400).json({ error: 'Error verifying webhook' });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id: clerkId, email_addresses, first_name, last_name, image_url, unsafe_metadata } = evt.data;
    
    const email = email_addresses[0]?.email_address;
    const name = `${first_name || ''} ${last_name || ''}`.trim();
    
    // Check if organization exists or use a default one since multi-tenant requires an orgId
    // If the user signed up via custom UI, they might have organizationName in unsafe_metadata
    let organizationId = 'org_default';
    
    if (unsafe_metadata?.company) {
      const companyName = unsafe_metadata.company as string;
      // Find or create org
      let org = await prisma.organization.findFirst({ where: { name: companyName } });
      if (!org) {
        org = await prisma.organization.create({
          data: {
            name: companyName,
            email: email,
          }
        });
      }
      organizationId = org.id;
    } else {
      let org = await prisma.organization.findFirst({ where: { name: 'Default Organization' } });
      if (!org) {
        org = await prisma.organization.create({
          data: {
            name: 'Default Organization',
            email: 'admin@taxos.com',
          }
        });
      }
      organizationId = org.id;
    }

    try {
      await prisma.user.upsert({
        where: { clerkId },
        update: {
          email,
          name,
          avatarUrl: image_url,
        },
        create: {
          clerkId,
          email,
          name,
          avatarUrl: image_url,
          organizationId,
          role: 'OWNER', // Depending on business logic
        }
      });
    } catch (e) {
      console.error('Failed to sync user to DB', e);
    }
  }

  if (eventType === 'user.deleted') {
    const { id: clerkId } = evt.data;
    try {
      await prisma.user.delete({ where: { clerkId } });
    } catch (e) {
      console.error('Failed to delete user from DB', e);
    }
  }

  res.status(200).json({ success: true });
});

export default router;
