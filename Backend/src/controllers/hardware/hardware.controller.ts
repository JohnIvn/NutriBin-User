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
};

function mapMachineAnalytics(row: MachineAnalyticsRow) {
  const invert = (val: any) => {
    if (val === null || val === undefined) return null;
    // Returns true if the value represents a logical false (meaning the module is Online)
    // Returns false if the value represents a logical true (meaning the module is Offline)
    const isTruthy =
      val === true ||
      val === 1 ||
      String(val).toLowerCase() === 'true' ||
      String(val).toLowerCase() === 't' ||
      String(val).toLowerCase() === '1';

    return !isTruthy;
  };

  return {
    id: row.machine_id,
    modules: {
      arduino_q: invert(row.c1),
      esp32_filter: invert(row.c2),
      esp32_sensors: invert(row.c3),
      esp32_servo: invert(row.c4),
      camera: invert(row.s1),
      humidity: invert(row.s2),
      methane: invert(row.s3),
      carbon_monoxide: invert(row.s4),
      air_quality: invert(row.s5),
      combustible_gasses: invert(row.s6),
      npk: invert(row.s7),
      moisture: invert(row.s8),
      reed: invert(row.s9),
      ultrasonic: invert(row.s10),
      weight: invert(row.s11),
      servo_a: invert(row.m1),
      servo_b: invert(row.m2),
      servo_mixer: invert(row.m3),
      grinder: invert(row.m4),
      exhaust: invert(row.m5),
    },
    date_created: row.date_created,
  };
}

@Controller('hardware')
export class HardwareController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get(':machineId')
  async getLatestModuleAnalytics(@Param('machineId') machineId: string) {
    if (!machineId) {
      throw new BadRequestException('machineId is required');
    }

    const client = this.databaseService.getClient();

    try {
      const result = await client.query<MachineAnalyticsRow>(
        `
        SELECT
          ma.machine_id,
          ma.c1,
          ma.c2,
          ma.c3,
          ma.c4,
          ma.s1,
          ma.s2,
          ma.s3,
          ma.s4,
          ma.s5,
          ma.s6,
          ma.s7,
          ma.s8,
          ma.s9,
          ma.s10,
          ma.s11,
          ma.m1,
          ma.m2,
          ma.m3,
          ma.m4,
          ma.m5,
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
  ) {
    const client = this.databaseService.getClient();

    if (!machineId) {
      throw new BadRequestException('machineId is missing');
    }

    if (!customerId) {
      throw new BadRequestException('customerId is missing');
    }

    try {
      const result = await client.query(
        `
        SELECT repair_id
        FROM repair
        WHERE machine_id = $1 AND user_id = $2
        `,
        [machineId, customerId],
      );

      if (result.rowCount) {
        throw new BadRequestException('The repair has already been requested');
      }

      await client.query(
        `
        INSERT INTO repair
        (machine_id, user_id, description, repair_status)
        VALUES ($1, $2, 'Need Repair', 'active')
        `,
        [machineId, customerId],
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
