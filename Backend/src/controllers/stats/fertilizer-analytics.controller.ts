import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Query,
} from '@nestjs/common';

import { DatabaseService } from '../../service/database/database.service';

type FertilizerAnalyticsRow = {
  fertilizer_analytics_id: string;
  nitrogen: string | null;
  phosphorus: string | null;
  potassium: string | null;
  temperature: string | null;
  ph: string | null;
  humidity: string | null;
  moisture: string | null;
  methane: string | null;
  air_quality: string | null;
  carbon_monoxide: string | null;
  combustible_gases: string | null;
  weight_kg: string | null;
  reed_switch: string | null;
  date_created: string;
};

function mapFertilizerAnalytics(row: FertilizerAnalyticsRow) {
  const invertValue = (val: any) => {
    if (val === null || val === undefined) return null;
    const isTruthy =
      val === true ||
      val === 1 ||
      String(val).toLowerCase() === 'true' ||
      String(val).toLowerCase() === '1' ||
      String(val).toLowerCase() === 't';
    return !isTruthy;
  };

  return {
    id: row.fertilizer_analytics_id,
    nitrogen: row.nitrogen,
    phosphorus: row.phosphorus,
    potassium: row.potassium,
    temperature: row.temperature,
    ph: row.ph,
    humidity: row.humidity,
    moisture: row.moisture,
    methane: row.methane,
    air_quality: row.air_quality,
    carbon_monoxide: row.carbon_monoxide,
    combustible_gases: row.combustible_gases,
    weight_kg: row.weight_kg,
    reed_switch: invertValue(row.reed_switch),
    date_created: row.date_created,
  };
}

@Controller('fertilizer-analytics')
export class FertilizerAnalyticsController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get(':customerId')
  async getAnalytics(
    @Param('customerId') customerId: string,
    @Query('machineId') machineId?: string,
  ) {
    if (!customerId) {
      throw new BadRequestException('customerId is required');
    }

    const client = this.databaseService.getClient();

    try {
      const where: string[] = ['fa.user_id = $1'];
      const values: string[] = [customerId];

      // optional, but kept for flexibility
      if (machineId) {
        where.push(`fa.machine_id = $${values.length + 1}`);
        values.push(machineId);
      }

      const result = await client.query<FertilizerAnalyticsRow>(
        `
        SELECT
          fa.fertilizer_analytics_id,
          fa.nitrogen,
          fa.phosphorus,
          fa.potassium,
          fa.temperature,
          fa.ph,
          fa.humidity,
          fa.moisture,
          fa.methane,
          fa.air_quality,
          fa.carbon_monoxide,
          fa.combustible_gases,
          fa.weight_kg,
          fa.reed_switch,
          fa.date_created
        FROM fertilizer_analytics fa
        WHERE ${where.join(' AND ')}
        ORDER BY fa.date_created DESC
        LIMIT 1
        `,
        values,
      );

      return {
        ok: true,
        analytics: result.rows.map(mapFertilizerAnalytics),
      };
    } catch (error) {
      console.error(
        '[FertilizerAnalytics] Failed to load fertilizer analytics:',
        error,
      );
      throw new InternalServerErrorException(
        'Failed to load fertilizer analytics',
      );
    }
  }
}
