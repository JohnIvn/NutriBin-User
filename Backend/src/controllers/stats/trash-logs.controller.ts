import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Query,
} from '@nestjs/common';
import { DatabaseService } from 'src/service/database/database.service';

type TrashLogRow = {
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

function mapTrashLog(row: TrashLogRow) {
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

@Controller('trash-logs')
export class TrashLogsController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get(':machineId')
  async getLogs(
    @Param('machineId') machineId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const pageNum = Number(page);
    const limitNum = Number(limit);

    if (!machineId) {
      throw new BadRequestException('machineId is required');
    }

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Invalid pagination parameters');
    }

    const offset = (pageNum - 1) * limitNum;
    const client = this.databaseService.getClient();

    try {
      // 🔢 total count
      const countResult = await client.query<{ count: number }>(
        `
        SELECT COUNT(*)::int AS count
        FROM fertilizer_analytics
        WHERE machine_id = $1
        `,
        [machineId],
      );

      const total = countResult.rows[0].count;

      // 📄 paginated logs
      const dataResult = await client.query<TrashLogRow>(
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
        WHERE machine_id = $1
        ORDER BY date_created DESC
        LIMIT $2
        OFFSET $3
        `,
        [machineId, limitNum, offset],
      );

      return {
        ok: true,
        machine_id: machineId,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
        logs: dataResult.rows.map(mapTrashLog),
      };
    } catch (error) {
      console.error('[TrashLogs] Failed to load trash logs:', error);
      throw new InternalServerErrorException('Failed to load trash logs');
    }
  }
}
