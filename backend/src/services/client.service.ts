import { ClientRepository } from '../repositories/client.repository';
import { NotFoundError, ConflictError } from '../types/errors';
import { encrypt, decrypt } from '../utils/crypto';
import type { Prisma } from '@prisma/client';

export class ClientService {
  static async createClient(orgId: string, data: any) {
    // Check GSTIN uniqueness within org if provided
    if (data.gstin) {
      const existing = await ClientRepository.findMany(orgId, { search: data.gstin });
      if (existing.total > 0) throw new ConflictError('Client with this GSTIN already exists');
    }

    const payload: Prisma.ClientUncheckedCreateInput = {
      ...data,
      organizationId: orgId,
      pan: data.pan ? encrypt(data.pan) : null,
    };

    const client = await ClientRepository.create(payload);
    return this.sanitize(client);
  }

  static async getClientDetails(id: string, orgId: string) {
    const client = await ClientRepository.findById(id, orgId);
    if (!client) throw new NotFoundError('Client');

    const outstanding = await ClientRepository.getOutstandingBalance(id);
    
    return {
      ...this.sanitize(client),
      outstandingAmount: outstanding,
      // Status derived dynamically (stubbed logic for now)
      status: outstanding > 0n ? 'Pending' : 'Compliant',
    };
  }

  static async listClients(orgId: string, query: { page: number; limit: number; search?: string }) {
    const { items, total } = await ClientRepository.findMany(orgId, {
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      search: query.search,
    });

    return {
      items: items.map(this.sanitize),
      total,
    };
  }

  static async updateClient(id: string, orgId: string, data: any) {
    const client = await ClientRepository.findById(id, orgId);
    if (!client) throw new NotFoundError('Client');

    if (data.pan) data.pan = encrypt(data.pan);
    
    const updated = await ClientRepository.update(id, orgId, data);
    return this.sanitize(updated);
  }

  static async deleteClient(id: string, orgId: string) {
    const client = await ClientRepository.findById(id, orgId);
    if (!client) throw new NotFoundError('Client');
    await ClientRepository.softDelete(id, orgId);
  }

  // Helper to decrypt fields for the response
  private static sanitize(client: any) {
    return {
      ...client,
      pan: client.pan ? decrypt(client.pan) : null,
    };
  }
}
