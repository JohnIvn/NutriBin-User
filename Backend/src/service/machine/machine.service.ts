import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

type MachinesRow = {
  machine_id: string;
};

@Injectable()
export class MachineService {
  constructor(private readonly databaseService: DatabaseService) {}

  async fetchMachine(customerId: string): Promise<MachinesRow[]> {
    const client = this.databaseService.getClient();

    try {
      const query = await client.query<MachinesRow>(
        `
        SELECT machine_id
        FROM public.machine_customers
        WHERE customer_id = $1
        `,
        [customerId],
      );

      return query.rows;
    } catch (err) {
      console.error('Error fetching machines:', err);
      throw err;
    }
  }
}
