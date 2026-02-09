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

type MachineRow = {
  machine_id: string;
};

@Controller('trash-logs')
export class TrashLogsController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get(':customerId')
  async getLogs(
    @Param('customerId') customerId: string,
    @Query('machineId') machineId?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const pageNum = Number(page);
    const limitNum = Number(limit);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Invalid pagination parameters');
    }

    const offset = (pageNum - 1) * limitNum;
    const client = this.databaseService.getClient();

    try {
      let resolvedMachineId = machineId;

      // 🔍 resolve first active machine for customer
      if (!resolvedMachineId) {
        const machineResult = await client.query<MachineRow>(
          `
          SELECT m.machine_id
          FROM machines m
          JOIN machine_customers mc ON mc.machine_id = m.machine_id
          WHERE mc.customer_id = $1
            AND m.is_active = true
          LIMIT 1
          `,
          [customerId],
        );

        if (machineResult.rows.length === 0) {
          return {
            ok: true,
            logs: [],
            pagination: {
              total: 0,
              page: pageNum,
              limit: limitNum,
              totalPages: 0,
            },
          };
        }

        resolvedMachineId = machineResult.rows[0].machine_id;
      } else {
        // 🔒 ensure machine belongs to customer if provided explicitly
        const machineCheck = await client.query(
          `
          SELECT 1
          FROM machine_customers
          WHERE machine_id = $1 AND customer_id = $2
          LIMIT 1
          `,
          [resolvedMachineId, customerId],
        );

        if (!machineCheck.rowCount) {
          throw new BadRequestException('Machine not found for this customer');
        }
      }

      const where: string[] = ['machine_id = $1'];
      const values: Array<string | number> = [resolvedMachineId];

      // 🔢 total count
      const countResult = await client.query<{ count: number }>(
        `
        SELECT COUNT(*)::int AS count
        FROM trash_logs
        WHERE ${where.join(' AND ')}
        `,
        values,
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
        WHERE ${where.join(' AND ')}
        ORDER BY date_created DESC
        LIMIT $2
        OFFSET $3
        `,
        [...values, limitNum, offset],
      );

      return {
        ok: true,
        machine_id: resolvedMachineId,
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
