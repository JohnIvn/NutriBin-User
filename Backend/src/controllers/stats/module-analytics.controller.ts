import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';

import { DatabaseService } from '../../service/database/database.service';

type MachineAnalyticsRow = {
  machine_id: string;
  is_active: boolean | null;
  c1: boolean | null;
  c2: boolean | null;
  c3: boolean | null;
  c4: boolean | null;
  s1: boolean | null;
  s2: boolean | null;
  s3: boolean | null;
  s4: boolean | null;
  s5: boolean | null;
  s6: boolean | null;
  s7: boolean | null;
  s8: boolean | null;
  s9: boolean | null;
  s10: boolean | null;
  s11: boolean | null;
  m1: boolean | null;
  m2: boolean | null;
  m3: boolean | null;
  m4: boolean | null;
  m5: boolean | null;
  date_created: string;
  firmware_version: string | null;
  wifi_ssid: string | null;
  ip_address: string | null;
  target_firmware_version: string | null;
  update_status: string | null;
  last_update_attempt: string | null;
  last_seen: string | null;
};

function mapMachineAnalytics(row: MachineAnalyticsRow) {
  return {
    modules: {
      id: row.machine_id,
      is_active: row.is_active,
      arduino_q: row.c1,
      esp32_filter: row.c2,
      esp32_sensors: row.c3,
      esp32_servo: row.c4,
      camera: row.s1,
      humidity: row.s2,
      methane: row.s3,
      carbon_monoxide: row.s4,
      air_quality: row.s5,
      combustible_gasses: row.s6,
      npk: row.s7,
      moisture: row.s8,
      reed: row.s9,
      ultrasonic: row.s10,
      weight: row.s11,
      servo_a: row.m1,
      servo_b: row.m2,
      servo_mixer: row.m3,
      grinder: row.m4,
      exhaust: row.m5,
      firmware_version: row.firmware_version,
      wifi_ssid: row.wifi_ssid,
      ip_address: row.ip_address,
      target_firmware_version: row.target_firmware_version,
      update_status: row.update_status,
      last_update_attempt: row.last_update_attempt,
      last_seen: row.last_seen,
    },
    date_created: row.date_created,
  };
}

@Controller('module-analytics')
export class ModuleAnalyticsController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get(':machineId')
  async getLatestModuleAnalytics(@Param('machineId') machineId: string) {
    if (!machineId) {
      throw new BadRequestException('customerId is required');
    }

    const client = this.databaseService.getClient();

    try {
      const result = await client.query<MachineAnalyticsRow>(
        `
        SELECT
          ma.machine_id,
          ma.is_active,
          ma.c1, ma.c2, ma.c3, ma.c4,
          ma.s1, ma.s2, ma.s3, ma.s4, ma.s5, ma.s6, ma.s7, ma.s8, ma.s9, ma.s10, ma.s11,
          ma.m1, ma.m2, ma.m3, ma.m4, ma.m5,
          ma.firmware_version,
          ma.target_firmware_version,
          ma.wifi_ssid,
          ma.ip_address,
          ma.update_status,
          ma.last_update_attempt,
          ma.last_seen,
          ma.date_created
        FROM machines ma
        WHERE ma.machine_id = $1
        ORDER BY ma.date_created DESC
        LIMIT 1
        `,
        [machineId],
      );

      if (!result.rowCount) {
        throw new NotFoundException(
          'No module analytics found for this customer',
        );
      }

      return {
        ok: true,
        data: mapMachineAnalytics(result.rows[0]),
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to load module analytics');
    }
  }

  @Post('repair')
  async requestRepair(
    @Body('machineId') machineId: string,
    @Body('customerId') customerId: string,
    @Body('module') module: string,
  ) {
    const client = this.databaseService.getClient();

    if (!machineId) {
      throw new BadRequestException('machineId is missing');
    }

    if (!customerId) {
      throw new BadRequestException('customerId is missing');
    }

    if (!module) {
      throw new BadRequestException('module is required');
    }

    try {
      const result = await client.query(
        `
        SELECT repair_id
        FROM repair
        WHERE machine_id = $1 AND user_id = $2 AND description = $3
        `,
        [machineId, customerId, module],
      );

      if (result.rowCount) {
        throw new BadRequestException(
          'A repair for this module has already been requested',
        );
      }

      await client.query(
        `
        INSERT INTO repair
        (machine_id, user_id, description, repair_status)
        VALUES ($1, $2, $3, 'active')
        `,
        [machineId, customerId, module],
      );
      return {
        ok: true,
        message: 'Repair requested success',
      };
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }

      throw new InternalServerErrorException('Failed to make request');
    }
  }
}
