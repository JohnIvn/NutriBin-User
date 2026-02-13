import { Module } from '@nestjs/common';
import { MachineNotificationsGateway } from './machine-notifications.gateway';
import { MachineNotificationsService } from './machine-notifications.service';
import { DatabaseService } from '../database/database.service';
import { MachineNotificationsController } from 'src/controllers/stats/machine-notifications.controller';

@Module({
  providers: [
    MachineNotificationsGateway,
    MachineNotificationsService,
    DatabaseService,
  ],
  controllers: [MachineNotificationsController],
  exports: [MachineNotificationsGateway],
})
export class MachineNotificationsModule {}
