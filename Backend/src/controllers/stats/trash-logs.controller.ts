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
  log_id: string;
  machine_id: string | null;
  nitrogen: string | null;
  phosphorus: string | null;
  potassium: string | null;
  moisture: string | null;
  humidity: string | null;
  temperature: string | null;
  ph: string | null;
  date_created: string;
};

function mapTrashLog(row: TrashLogRow) {
  return {
    id: row.log_id,
    machine_id: row.machine_id,
    nitrogen: row.nitrogen,
    phosphorus: row.phosphorus,
    potassium: row.potassium,
    moisture: row.moisture,
    humidity: row.humidity,
    temperature: row.temperature,
    ph: row.ph,
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
        FROM trash_logs
        WHERE machine_id = $1
        `,
        [machineId],
      );

      const total = countResult.rows[0].count;

      // 📄 paginated logs
      const dataResult = await client.query<TrashLogRow>(
        `
        SELECT
          log_id,
          machine_id,
          nitrogen,
          phosphorus,
          potassium,
          moisture,
          humidity,
          temperature,
          ph,
          date_created
        FROM trash_logs
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
