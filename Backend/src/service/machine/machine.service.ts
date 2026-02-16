import {
  //BadRequestException,
  Injectable,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

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
export class MachineService {
  constructor(private readonly databaseService: DatabaseService) {}

  async fetchMachine(customerId: string): Promise<FetchMachinesRow[]> {
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

      return query.rows;
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
        error: 'Failed to add machine',
      };
    }
  }

  async getHardwareStatus(machineId: string) {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query(
        `
        SELECT
          c1, c2, c3, c4, c5,
          s1, s2, s3, s4, s5, s6, s7, s8, s9,
          m1, m2, m3, m4, m5, m6, m7
        FROM machines
        WHERE machine_id = $1
        ORDER BY date_created DESC
        LIMIT 1
        `,
        [machineId],
      );

      if (!result.rowCount) {
        return { ok: false, message: 'Machine not found' };
      }

      return {
        ok: true,
        data: result.rows[0],
      };
    } catch (err) {
      console.error('Error fetching hardware status:', err);
      return { ok: false, error: 'Database error' };
    }
  }

  async restartMachine(machineId: string) {
    // In a real scenario, this would send a command to the machine via MQTT or similar
    // For now, we'll simulate success and maybe log it
    console.log(`Restart command initiated for machine: ${machineId}`);

    return {
      ok: true,
      message: 'Restart command initiated successfully',
    };
  }
}
