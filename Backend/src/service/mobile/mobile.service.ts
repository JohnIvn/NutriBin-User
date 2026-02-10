import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

type Response = {
  ok: boolean;
  message: string;
  data: any;
};

type FetchMachinesRow = {
  machine_id: string;
};

type MachineRow = {
  machine_serial_id: string;
  serial_number: string;
  is_used: boolean;
  is_active: boolean;
  date_created: string;
};

@Injectable()
export class MobileService {
  constructor(private readonly databaseService: DatabaseService) {}

  async fetchMachine(customerId: string): Promise<Response> {
    const client = this.databaseService.getClient();

    try {
      const query = await client.query<FetchMachinesRow>(
        `
		SELECT machine_id
		FROM public.machine_customers
		WHERE customer_id = $1
		`,
        [customerId],
      );

      return {
        ok: true,
        data: query.rows,
        message: 'Successful fetching',
      };
    } catch (err) {
      console.error('Error fetching machines:', err);
      throw err;
    }
  }

  async addMachine(machineSerial: string, customerId: string) {
    try {
      const serial = machineSerial.trim();
      const client = this.databaseService.getClient();

      if (!serial) {
        return { ok: false, error: 'Serial is required' };
      }

      const result = await client.query<MachineRow>(
        `
	  SELECT machine_serial_id
	  FROM machine_serial
	  WHERE serial_number = $1
	  `,
        [serial],
      );

      if (!result.rowCount) {
        return { ok: false, error: 'Serial not found' };
      }

      const machineId = result.rows[0].machine_serial_id;

      await client.query(
        `
	  UPDATE machine_serial
	  SET is_used = true, is_active = true
	  WHERE serial_number = $1
	  `,
        [serial],
      );

      await client.query(
        `
	  INSERT INTO machines (machine_id)
	  VALUES ($1)
	  ON CONFLICT (machine_id) DO NOTHING
	  `,
        [machineId],
      );

      await client.query(
        `
	  INSERT INTO machine_customers (machine_id, customer_id)
	  VALUES ($1, $2)
	  `,
        [machineId, customerId],
      );

      return {
        ok: true,
        message: 'Machine added successfully',
      };
    } catch (err) {
      console.error(err);
      return {
        ok: false,
        error: 'Internal server error',
      };
    }
  }
}
