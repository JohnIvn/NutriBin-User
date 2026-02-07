import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
} from '@nestjs/common';

import { DatabaseService } from '../../service/database/database.service';

type ModuleAnalyticsRow = {
  module_analytics_id: string;
  esp32: boolean | null;
  arduino_q: boolean | null;
  arduino_r3: boolean | null;
  ultrasonic: boolean | null;
  reed: boolean | null;
  moisture: boolean | null;
  temperature: boolean | null;
  humidity: boolean | null;
  gas: boolean | null;
  ph: boolean | null;
  npk: boolean | null;
  camera_1: boolean | null;
  camera_2: boolean | null;
  stepper_motor: boolean | null;
  heating_pad: boolean | null;
  exhaust_fan: boolean | null;
  dc_motor: boolean | null;
  grinder_motor: boolean | null;
  power_supply: boolean | null;
  servo_motor: boolean | null;
  date_created: string;
};

function mapModuleAnalytics(row: ModuleAnalyticsRow) {
  return {
    id: row.module_analytics_id,
    modules: {
      esp32: row.esp32,
      arduino_q: row.arduino_q,
      arduino_r3: row.arduino_r3,
      ultrasonic: row.ultrasonic,
      reed: row.reed,
      moisture: row.moisture,
      temperature: row.temperature,
      humidity: row.humidity,
      gas: row.gas,
      ph: row.ph,
      npk: row.npk,
      camera_1: row.camera_1,
      camera_2: row.camera_2,
      stepper_motor: row.stepper_motor,
      heating_pad: row.heating_pad,
      exhaust_fan: row.exhaust_fan,
      dc_motor: row.dc_motor,
      grinder_motor: row.grinder_motor,
      power_supply: row.power_supply,
      servo_motor: row.servo_motor,
    },
    date_created: row.date_created,
  };
}

@Controller('module-analytics')
export class ModuleAnalyticsController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get(':customerId')
  async getLatestModuleAnalytics(@Param('customerId') customerId: string) {
    if (!customerId) {
      throw new BadRequestException('customerId is required');
    }

    const client = this.databaseService.getClient();

    try {
      const result = await client.query<ModuleAnalyticsRow>(
        `
        SELECT
          ma.module_analytics_id,
          ma.esp32,
          ma.arduino_q,
          ma.arduino_r3,
          ma.ultrasonic,
          ma.reed,
          ma.moisture,
          ma.temperature,
          ma.humidity,
          ma.gas,
          ma.ph,
          ma.npk,
          ma.camera_1,
          ma.camera_2,
          ma.stepper_motor,
          ma.heating_pad,
          ma.exhaust_fan,
          ma.dc_motor,
          ma.grinder_motor,
          ma.power_supply,
          ma.servo_motor,
          ma.date_created
        FROM module_analytics ma
        WHERE ma.user_id = $1
        ORDER BY ma.date_created DESC
        LIMIT 1
        `,
        [customerId],
      );

      if (!result.rowCount) {
        throw new NotFoundException(
          'No module analytics found for this customer',
        );
      }

      return {
        ok: true,
        data: mapModuleAnalytics(result.rows[0]),
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
}
