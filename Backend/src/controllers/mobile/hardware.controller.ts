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
  const invertStatus = (val: any) => {
    if (val === null || val === undefined) return null;
    // Database value true means there is a fault/issue -> App should show Offline (false)
    // Database value false means everything is OK -> App should show Online (true)
    const isTruthy =
      val === true ||
      val === 1 ||
      String(val).toLowerCase() === 'true' ||
      String(val).toLowerCase() === '1' ||
      String(val).toLowerCase() === 't';

    return !isTruthy;
  };

  return {
    id: row.machine_id,
    modules: {
      arduino_q: invertStatus(row.c1),
      esp32_filter: invertStatus(row.c2),
      esp32_sensors: invertStatus(row.c3),
      esp32_servo: invertStatus(row.c4),
      camera: invertStatus(row.s1),
      humidity: invertStatus(row.s2),
      methane: invertStatus(row.s3),
      carbon_monoxide: invertStatus(row.s4),
      air_quality: invertStatus(row.s5),
      combustible_gasses: invertStatus(row.s6),
      npk: invertStatus(row.s7),
      moisture: invertStatus(row.s8),
      reed: invertStatus(row.s9),
      ultrasonic: invertStatus(row.s10),
      weight: invertStatus(row.s11),
      servo_a: invertStatus(row.m1),
      servo_b: invertStatus(row.m2),
      servo_mixer: invertStatus(row.m3),
      grinder: invertStatus(row.m4),
      exhaust: invertStatus(row.m5),
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
