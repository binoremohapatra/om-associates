import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export class AppointmentController {
  // Get Appointments
  static async getAppointments(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;

      const clients = await prisma.client.findMany({
        where: { organizationId: orgId },
        select: { id: true }
      });
      const clientIds = clients.map(c => c.id);

      const appointments = await prisma.appointment.findMany({
        where: { clientId: { in: clientIds } },
        include: { client: { select: { name: true } } },
        orderBy: { scheduledAt: 'asc' }
      });

      res.status(200).json({ success: true, data: appointments });
    } catch (error: any) {
      logger.error(`Get Appointments Error: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch appointments' });
    }
  }

  // Schedule Appointment
  static async scheduleAppointment(req: Request, res: Response) {
    try {
      const { clientId, title, description, scheduledAt, durationMinutes } = req.body;

      const appointment = await prisma.appointment.create({
        data: {
          clientId,
          createdById: req.user!.id,
          title,
          description,
          scheduledAt: new Date(scheduledAt),
          durationMinutes: durationMinutes || 30,
          meetLink: `https://meet.google.com/mock-${Math.random().toString(36).substring(7)}`,
        },
        include: { client: { select: { name: true } } }
      });

      res.status(201).json({ success: true, data: appointment });
    } catch (error: any) {
      logger.error(`Schedule Appointment Error: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to schedule appointment' });
    }
  }
}
