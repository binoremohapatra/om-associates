import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { config } from '../config';
import { logger } from '../utils/logger';

export class DocumentController {
  // Get storage stats
  static async getStats(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      // Get all clients for this org
      const clients = await prisma.client.findMany({
        where: { organizationId: orgId },
        select: { id: true }
      });
      const clientIds = clients.map(c => c.id);

      const documents = await prisma.document.findMany({
        where: { clientId: { in: clientIds }, isDeleted: false }
      });

      const totalSize = documents.reduce((acc, doc) => acc + doc.sizeBytes, 0);
      const totalDocuments = documents.length;
      
      const stats = {
        totalSize,
        totalDocuments,
        usagePercent: Math.min((totalSize / (10 * 1024 * 1024 * 1024)) * 100, 100), // Assuming 10GB limit
        storageLimit: 10 * 1024 * 1024 * 1024
      };

      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      logger.error(`Document Stats Error: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch document stats' });
    }
  }

  // Get documents (with folder/category filtering)
  static async getDocuments(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { folder, category, search, starred, trash } = req.query;

      const clients = await prisma.client.findMany({
        where: { organizationId: orgId },
        select: { id: true }
      });
      const clientIds = clients.map(c => c.id);

      const where: any = { clientId: { in: clientIds } };
      
      if (trash === 'true') {
        where.isDeleted = true;
      } else {
        where.isDeleted = false;
        if (folder) where.folderName = folder;
        const category = (req.query.category as string) || undefined;
        if (category) where.category = category;
        if (starred === 'true') where.isStarred = true;
      }

      if (search) {
        where.OR = [
          { fileName: { contains: search as string, mode: 'insensitive' } },
          { tags: { has: search as string } }
        ];
      }

      const documents = await prisma.document.findMany({
        where,
        include: { client: { select: { name: true } } },
        orderBy: { updatedAt: 'desc' }
      });

      res.status(200).json({ success: true, data: documents });
    } catch (error: any) {
      logger.error(`Get Documents Error: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch documents' });
    }
  }

  // Upload document handler (stubbed for S3/Cloudinary)
  static async uploadDocument(req: Request, res: Response) {
    try {
      const { clientId, folderName, category } = req.body;
      const file = req.file; // Assuming multer is used

      if (!file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      // TODO: Actual S3/Cloudinary upload logic would go here.
      // For now, we simulate success and save metadata.

      const doc = await prisma.document.create({
        data: {
          clientId,
          folderName: folderName || 'General',
          fileName: file.originalname,
          fileUrl: `/uploads/${file.filename}`, // Mock URL
          fileType: file.mimetype,
          sizeBytes: file.size,
          category,
          currentVersion: 1
        }
      });

      // Generate version history entry
      await prisma.documentVersion.create({
        data: {
          documentId: doc.id,
          versionNum: 1,
          fileUrl: doc.fileUrl,
          sizeBytes: doc.sizeBytes,
          createdBy: req.user!.id
        }
      });

      res.status(201).json({ success: true, data: doc });
    } catch (error: any) {
      logger.error(`Upload Document Error: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to upload document' });
    }
  }

  // Toggle Star
  static async toggleStar(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { isStarred } = req.body;

      const doc = await prisma.document.update({
        where: { id },
        data: { isStarred }
      });

      res.status(200).json({ success: true, data: doc });
    } catch (error: any) {
      logger.error(`Toggle Star Error: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to update document status' });
    }
  }

  // Trash Document
  static async trashDocument(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const doc = await prisma.document.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date() }
      });
      res.status(200).json({ success: true, data: doc });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to trash document' });
    }
  }

  // Restore Document
  static async restoreDocument(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const doc = await prisma.document.update({
        where: { id },
        data: { isDeleted: false, deletedAt: null }
      });
      res.status(200).json({ success: true, data: doc });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to restore document' });
    }
  }
}
