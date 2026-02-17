import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

type RepairRequestRow = {
  id: string;
  machine_id: string;
  user_id: string;
  description: string;
  repair_status: 'active' | 'completed' | 'cancelled';
  date_created: string;
  date_updated: string | null;
  serial_number: string | null;
};

@Injectable()
export class RepairService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createRepairRequest(
    machineId: string,
    userId: string,
    description: string,
  ) {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query<RepairRequestRow>(
        `INSERT INTO repair (machine_id, user_id, description, repair_status)
         VALUES ($1, $2, $3, 'active')
         RETURNING *`,
        [machineId, userId, description],
      );
      return {
        ok: true,
        message: 'Repair request created successfully',
        data: result.rows[0],
      };
    } catch (error) {
      console.error('Error creating repair request:', error);
      throw new InternalServerErrorException('Failed to create repair request');
    }
  }

  async getRepairRequests(userId: string) {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query<RepairRequestRow>(
        `SELECT r.*, ms.serial_number 
          FROM repair r
          LEFT JOIN machine_serial ms ON r.machine_id = ms.machine_serial_id
          WHERE r.user_id = $1 
          ORDER BY r.date_created DESC`,
        [userId],
      );

      return {
        ok: true,
        data: result.rows,
        message: 'Successfully fetched repair requests',
      };
    } catch (error) {
      console.error('Error fetching repair requests:', error);
      throw new InternalServerErrorException('Failed to fetch repair requests');
    }
  }
}
