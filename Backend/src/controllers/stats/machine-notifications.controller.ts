import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { DatabaseService } from 'src/service/database/database.service';
interface MachineNotification {
  notification_id: string;
  machine_id: string;
  header: string;
  subheader?: string | null;
  type: string;
  description?: string | null;
  date?: Date | null;
  resolved?: boolean | null;
  date_created?: Date | null;
}

@Controller('notifications')
export class MachineNotificationsController {
  constructor(private readonly databaseService: DatabaseService) {}
  @Get(':machine_id')
  async getNotifications(@Param('machine_id') machineId: string) {
    if (!machineId) {
      throw new BadRequestException('machineId is required');
    }

    const client = this.databaseService.getClient();

    try {
      const notifications = await client.query<MachineNotification>(
        `
      SELECT *
      FROM machine_notifications
      WHERE machine_id = $1 AND resolved = false
      ORDER BY date_created DESC
      `,
        [machineId],
      );

      if (!notifications.rowCount) {
        throw new NotFoundException('No notification found');
      }

      return {
        ok: true,
        data: notifications.rows,
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new BadRequestException('Failed to fetch notifications');
    }
  }
}
