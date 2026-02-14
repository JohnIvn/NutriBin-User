import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MachineNotification } from './machine-notifications.interface';
import { MachineNotificationsGateway } from './machine-notifications.gateway';

@Injectable()
export class MachineNotificationsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly gateway: MachineNotificationsGateway,
  ) {}

  async getNotificationsByMachine(
    machine_id: string,
  ): Promise<MachineNotification[]> {
    const query = `
      SELECT 
        notification_id,
        machine_id,
        header,
        subheader,
        type,
        description,
        date,
        resolved,
        date_created
      FROM machine_notifications
      WHERE machine_id = $1
      ORDER BY date_created DESC;
    `;
    const result = await this.db
      .getClient()
      .query<MachineNotification>(query, [machine_id]);
    return result.rows;
  }
}
