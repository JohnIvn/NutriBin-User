import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

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
      const result = await client.query(
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
}
