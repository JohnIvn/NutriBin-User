import { Module } from '@nestjs/common';
import { MachineNotificationsGateway } from './machine-notifications.gateway';
import { MachineNotificationsService } from './machine-notifications.service';
import { DatabaseService } from '../database/database.service';
import { MachineNotificationsController } from 'src/controllers/stats/machine-notifications.controller';
import { NotificationsRealtimeService } from './notification-realtime.service';

@Module({
  providers: [
    MachineNotificationsGateway,
    MachineNotificationsService,
    DatabaseService,
    NotificationsRealtimeService,
  ],
  controllers: [MachineNotificationsController],
  exports: [MachineNotificationsGateway],
})
export class MachineNotificationsModule {}
