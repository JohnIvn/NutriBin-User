// src/service/notification/machine-notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  NotificationsRealtimeService,
  MachineNotification,
} from './notification-realtime.service';
import { forwardRef, Inject } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class MachineNotificationsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => NotificationsRealtimeService))
    private readonly realtimeService: NotificationsRealtimeService,
  ) {}

  /**
   * Client joins a specific machine room to receive notifications
   */
  @SubscribeMessage('joinMachine')
  handleJoinMachine(
    @ConnectedSocket() client: Socket,
    @MessageBody() machine_id: string,
  ) {
    if (!machine_id) return;
    client.join(machine_id);
    console.log(`Client ${client.id} joined machine room: ${machine_id}`);
  }

  /**
   * Client requests current notifications for a machine
   */
  @SubscribeMessage('getNotifications')
  async handleGetNotifications(
    @ConnectedSocket() client: Socket,
    @MessageBody() machine_id: string,
  ): Promise<MachineNotification[] | { error: string }> {
    try {
      const notifications =
        await this.realtimeService.getNotificationsByMachine(machine_id);
      return notifications;
    } catch (err) {
      console.error('Error fetching notifications:', err);
      return { error: 'Failed to fetch notifications' };
    }
  }

  /**
   * Emit a notification to all clients in a machine room
   */
  emitNotification(machineId: string, notification: MachineNotification) {
    this.server.to(machineId).emit('notification', notification);
    console.log(`Emitted notification to machine ${machineId}`, notification);
  }
}
