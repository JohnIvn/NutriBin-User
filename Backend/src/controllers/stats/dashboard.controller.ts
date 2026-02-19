import {
  Controller,
  Get,
  Param,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from 'src/service/database/database.service';

type AnnouncementRow = {
  announcement_id: string;
  title: string;
  body: string;
  author: string | null;
  priority: string | null;
  notified: string[] | null;
  date_published: string | null;
  is_active: boolean;
  date_created: string;
};

type FertilizerAnalyticsRow = {
  fertilizer_analytics_id: string;
  nitrogen: string | null;
  phosphorus: string | null;
  potassium: string | null;
  moisture: string | null;
  humidity: string | null;
  temperature: string | null;
  ph: string | null;
  date_created: string;
};

type TrashLogRow = {
  log_id: string;
  nitrogen: string | null;
  phosphorus: string | null;
  potassium: string | null;
  moisture: string | null;
  humidity: string | null;
  temperature: string | null;
  ph: string | null;
  date_created: string;
};

type MachineRow = {
  machine_id: string;
};

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get(':customerId')
  async getAnalytics(@Param('customerId') customerId: string) {
    const client = this.databaseService.getClient();

    try {
      const machineResult = await client.query<MachineRow>(
        `
        SELECT mc.machine_id
        FROM machine_customers mc
        JOIN machine_serial ms ON ms.machine_serial_id = mc.machine_id 
        WHERE mc.customer_id = $1
          AND ms.is_active = true
        LIMIT 1
        `,
        [customerId],
      );

      const machineId = machineResult.rows[0]?.machine_id;

      const announcement = await client.query<AnnouncementRow>(
        `
        SELECT
          announcement_id,
          title,
          body,
          author,
          priority,
          notified,
          date_published,
          is_active,
          date_created
        FROM announcements
        WHERE is_active = true
        ORDER BY COALESCE(date_published::timestamptz, date_created) DESC
        LIMIT 2
        `,
      );

      const analytics = await client.query<FertilizerAnalyticsRow>(
        `
        SELECT
          fertilizer_analytics_id,
          nitrogen,
          phosphorus,
          potassium,
          moisture,
          humidity,
          temperature,
          ph,
          date_created
        FROM fertilizer_analytics
        WHERE machine_id = $1
        ORDER BY date_created DESC
        LIMIT 1
        `,
        [machineId],
      );

      let trashLogs: TrashLogRow[] = [];

      if (machineId) {
        const trashLogsResult = await client.query<TrashLogRow>(
          `
          SELECT
            log_id,
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
          LIMIT 4
          `,
          [machineId],
        );
        trashLogs = trashLogsResult.rows;
      }

      return {
        ok: true,
        announcements: announcement.rows,
        latestAnalytics: analytics.rows[0] ?? null,
        trashLogs: trashLogs,
      };
    } catch (err) {
      console.error('Dashboard analytics error', err);
      throw new InternalServerErrorException('Failed to fetch');
    }
  }
}
