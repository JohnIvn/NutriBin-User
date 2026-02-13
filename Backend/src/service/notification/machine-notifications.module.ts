import { Module } from '@nestjs/common';
import { MachineNotificationsGateway } from './machine-notifications.gateway';

@Module({
  providers: [MachineNotificationsGateway],
  exports: [MachineNotificationsGateway],
})
export class MachineNotificationsModule {}
