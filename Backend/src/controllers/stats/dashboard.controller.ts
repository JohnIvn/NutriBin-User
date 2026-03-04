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

type MachineRow = {
  machine_id: string;
};

type MachineData = {
  machine_id: string;
  latestAnalytics: any;
  trashLogs: any[];
  stats: {
    avgNitrogen: number;
    avgPhosphorus: number;
    totalTrashLogs: number;
  };
};

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get(':customerId')
  async getDashboard(@Param('customerId') customerId: string) {
    const client = this.databaseService.getClient();

    try {
      // 1️⃣ Get all active machines
      const machineResult = await client.query<MachineRow>(
        `SELECT mc.machine_id
       FROM machine_customers mc
       JOIN machine_serial ms ON ms.machine_serial_id = mc.machine_id
       WHERE mc.customer_id = $1
         AND ms.is_active = true
       `,
        [customerId],
      );

      if (machineResult.rows.length === 0) {
        return { ok: false, message: 'No active machines found' };
      }

      const machineIds = machineResult.rows.map((m) => m.machine_id);

      // 2️⃣ Fetch active announcements
      const announcementResult = await client.query<AnnouncementRow>(
        `SELECT
         announcement_id, title, body, author, priority, notified,
         date_published, is_active, date_created
       FROM announcements
       WHERE is_active = true
       ORDER BY COALESCE(date_published::timestamptz, date_created) DESC
       `,
        [],
      );

      // 3️⃣ Fetch data for each machine
      const machineData: MachineData[] = [];

      for (const machineId of machineIds) {
        // Latest analytics for this machine
        const analyticsResult = await client.query<FertilizerAnalyticsRow>(
          `SELECT
           fertilizer_analytics_id, nitrogen, phosphorus, potassium,
           moisture, humidity, temperature, ph, date_created
         FROM fertilizer_analytics
         WHERE machine_id = $1
         ORDER BY date_created DESC
         LIMIT 1`,
          [machineId],
        );

        const latestAnalytics = analyticsResult.rows[0];

        // Last 4 trash logs for this machine
        const trashResult = await client.query<TrashLogRow>(
          `SELECT
           fertilizer_analytics_id, nitrogen, phosphorus, potassium,
           temperature, ph, humidity, moisture,
           methane, air_quality, carbon_monoxide, combustible_gases,
           weight_kg, reed_switch, date_created
         FROM fertilizer_analytics
         WHERE machine_id = $1
         ORDER BY date_created DESC
         LIMIT 4`,
          [machineId],
        );

        const trashLogs = trashResult.rows.map((log) => ({
          ...log,
          nitrogen: log.nitrogen ? parseFloat(log.nitrogen) : null,
          phosphorus: log.phosphorus ? parseFloat(log.phosphorus) : null,
          potassium: log.potassium ? parseFloat(log.potassium) : null,
          temperature: log.temperature ? parseFloat(log.temperature) : null,
          ph: log.ph ? parseFloat(log.ph) : null,
          humidity: log.humidity ? parseFloat(log.humidity) : null,
          moisture: log.moisture ? parseFloat(log.moisture) : null,
          methane: log.methane ? parseFloat(log.methane) : null,
          air_quality: log.air_quality ? parseFloat(log.air_quality) : null,
          carbon_monoxide: log.carbon_monoxide
            ? parseFloat(log.carbon_monoxide)
            : null,
          combustible_gases: log.combustible_gases
            ? parseFloat(log.combustible_gases)
            : null,
          weight_kg: log.weight_kg ? parseFloat(log.weight_kg) : null,
        }));

        // Compute stats for this machine
        const avgNitrogen =
          trashLogs.reduce((sum, t) => sum + (t.nitrogen || 0), 0) /
          (trashLogs.length || 1);
        const avgPhosphorus =
          trashLogs.reduce((sum, t) => sum + (t.phosphorus || 0), 0) /
          (trashLogs.length || 1);

        machineData.push({
          machine_id: machineId,
          latestAnalytics: latestAnalytics
            ? {
                ...latestAnalytics,
                nitrogen: latestAnalytics.nitrogen
                  ? parseFloat(latestAnalytics.nitrogen)
                  : null,
                phosphorus: latestAnalytics.phosphorus
                  ? parseFloat(latestAnalytics.phosphorus)
                  : null,
                potassium: latestAnalytics.potassium
                  ? parseFloat(latestAnalytics.potassium)
                  : null,
              }
            : null,
          trashLogs,
          stats: {
            avgNitrogen,
            avgPhosphorus,
            totalTrashLogs: trashLogs.length,
          },
        });
      }

      // 4️⃣ Return dashboard-ready object
      return {
        ok: true,
        machines: machineData,
        announcements: announcementResult.rows,
      };
    } catch (err) {
      console.error('Dashboard error', err);
      throw new InternalServerErrorException('Failed to fetch dashboard data');
    }
  }
}
