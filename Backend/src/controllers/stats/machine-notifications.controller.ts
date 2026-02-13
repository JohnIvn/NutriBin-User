import { Controller, Get, Param } from '@nestjs/common';
import { MachineNotification } from 'src/service/notification/machine-notifications.interface';
import { MachineNotificationsService } from 'src/service/notification/machine-notifications.service';

@Controller('notifications')
export class MachineNotificationsController {
  constructor(
    private readonly notificationsService: MachineNotificationsService,
  ) {}

  // GET /notifications/:machine_id
  @Get(':machine_id')
  async getNotifications(
    @Param('machine_id') machine_id: string,
  ): Promise<MachineNotification[] | { error: string }> {
    try {
      const notifications =
        await this.notificationsService.getNotificationsByMachine(machine_id);
      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { error: 'Failed to fetch notifications' };
    }
  }
}
