import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { DatabaseService } from 'src/service/database/database.service';

@Controller('mobile/bin-settings')
export class BinSettingsController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get(':machineId')
  async getBinSettings(@Param('machineId') machineId: string) {
    if (!machineId) {
      throw new BadRequestException('Machine ID is required');
    }

    const client = this.databaseService.getClient();

    try {
      // In a real scenario, you might have a 'bin_settings' table.
      // For now, we fetch details from 'machines' and 'machine_customers'
      const result = await client.query(
        `SELECT m.machine_id, mc.nickname, m.is_active 
         FROM machines m
         LEFT JOIN machine_customers mc ON m.machine_id = mc.machine_id
         WHERE m.machine_id = $1`,
        [machineId],
      );

      if (result.rowCount === 0) {
        return { ok: false, message: 'Bin not found' };
      }

      return { ok: true, data: result.rows[0] };
    } catch (error) {
      console.error('Error fetching bin settings:', error);
      return { ok: false, error: 'Database error' };
    }
  }

  @Patch('nickname')
  async updateNickname(
    @Body('machineId') machineId: string,
    @Body('customerId') customerId: string,
    @Body('nickname') nickname: string,
  ) {
    if (!machineId || !customerId || !nickname) {
      throw new BadRequestException('Missing required fields');
    }

    const client = this.databaseService.getClient();

    try {
      const result = await client.query(
        `UPDATE machine_customers 
         SET nickname = $1 
         WHERE machine_id = $2 AND customer_id = $3
         RETURNING *`,
        [nickname, machineId, customerId],
      );

      if (result.rowCount === 0) {
        return { ok: false, message: 'Bin link not found for this user' };
      }

      return { ok: true, message: 'Nickname updated successfully' };
    } catch (error) {
      console.error('Error updating nickname:', error);
      return { ok: false, error: 'Database error' };
    }
  }
}
