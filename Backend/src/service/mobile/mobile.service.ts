import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

type Response = {
  ok: boolean;
  message: string;
  data: any;
};

type FetchMachinesRow = {
  machine_id: string;
  machine_serial: string;
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
      const machineResponse = await client.query<FetchMachinesRow>(
        `
    SELECT mc.machine_id, ms.serial_number
    FROM machine_customers mc
    LEFT JOIN machine_serial ms
      ON mc.machine_id = ms.machine_serial_id
    WHERE mc.customer_id = $1
  `,
        [customerId],
      );

      if (machineResponse.rowCount === 0) {
        return {
          ok: true,
          data: null,
          message: 'No machines found for this customer',
        };
      }

      const data = machineResponse.rows;
      return {
        ok: true,
        data: data,
        message: 'Successful fetching',
      };
    } catch (err) {
      console.error('Error fetching machines:', err);
      throw err;
    }
  }

  async registerMachine(machineSerial: string, customerId: string) {
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

      if (result.rowCount == 0 || !result.rows) {
        return {
          ok: false,
          error: 'Serial does not match any existing machines',
        };
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

  async fetchMachineData(machineId: string, customerId: string) {
    try {
      const client = this.databaseService.getClient();

      if (!machineId) {
        return { ok: false, message: 'Machine ID is required' };
      }
      if (!customerId) {
        return { ok: false, message: 'Customer ID is required' };
      }

      const result = await client.query<MachineRow>(
        `
	  SELECT nitrogen, phosphorus, potassium, 
	  		 temperature, ph, humidity, moisture, weight_kg, reed_switch,
			 methane, air_quality, carbon_monoxide, combustible_gases
	  FROM fertilizer_analytics
	  WHERE machine_id = $1
	  AND user_id = $2
	  `,
        [machineId, customerId],
      );

      if (!result.rows || result.rowCount == 0) {
        return { ok: false, error: 'No data  found' };
      }

      const machineData = result.rows[0];
      return {
        ok: true,
        data: machineData,
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
