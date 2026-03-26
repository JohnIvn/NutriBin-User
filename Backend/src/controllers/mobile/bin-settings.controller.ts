import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { DatabaseService } from 'src/service/database/database.service';

type BinSettingsRow = {
  machine_id: string;
  nickname: string | null;
  is_active: boolean;
  firmware_version: string;
  serial_number: string | null;
  model: string | null;
  wifi_ssid: string | null;
  ip_address: string | null;
};

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
      // Fetch details from 'machines', 'machine_customers', and 'machine_serial'
      const result = await client.query<BinSettingsRow>(
        `SELECT m.machine_id, mc.nickname, m.is_active, m.firmware_version, ms.serial_number, ms.model, m.wifi_ssid, m.ip_address 
         FROM machines m
         LEFT JOIN machine_customers mc ON m.machine_id = mc.machine_id
         LEFT JOIN public.machine_serial ms ON m.machine_id = ms.machine_serial_id
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
