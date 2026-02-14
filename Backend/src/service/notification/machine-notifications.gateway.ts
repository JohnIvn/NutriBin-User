// src/service/notification/machine-notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MachineNotificationsService } from './machine-notifications.service';
import { MachineNotification } from './machine-notifications.interface';

@WebSocketGateway({ cors: true })
export class MachineNotificationsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly notificationsService: MachineNotificationsService,
  ) {}

  // Listen for clients requesting notifications for a specific machine
  @SubscribeMessage('getNotifications')
  async handleGetNotifications(
    @MessageBody() machine_id: string,
  ): Promise<MachineNotification[] | { error: string }> {
    console.log('Received getNotifications for machine:', machine_id);
    try {
      const notifications: MachineNotification[] =
        await this.notificationsService.getNotificationsByMachine(machine_id);
      console.log('Returning notifications:', notifications);

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { error: 'Failed to fetch notifications' };
    }
  }
}
