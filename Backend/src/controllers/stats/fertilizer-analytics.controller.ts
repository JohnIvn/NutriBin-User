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
  hydrogen: string | null;
  smoke: string | null;
  benzene: string | null;
  date_created: string;
};

function mapFertilizerAnalytics(row: FertilizerAnalyticsRow) {
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
    hydrogen: row.hydrogen,
    smoke: row.smoke,
    benzene: row.benzene,
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
      const where: string[] = ['fa.customer_id = $1'];
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
          fa.hydrogen,
          fa.smoke,
          fa.benzene,
          fa.date_created
        FROM fertilizer_analytics fa
        WHERE ${where.join(' AND ')}
        ORDER BY fa.date_created DESC
        `,
        values,
      );

      return {
        ok: true,
        analytics: result.rows.map(mapFertilizerAnalytics),
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Failed to load fertilizer analytics',
      );
    }
  }
}
