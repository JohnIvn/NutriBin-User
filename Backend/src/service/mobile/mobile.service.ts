import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

type Response = {
  ok: boolean;
  message: string;
  data: any;
};

type FetchMachinesRow = {
  machine_id: string;
  serial_number: string;
  nickname?: string | null;
};

type MachineRow = {
  machine_serial_id: string;
  serial_number: string;
  is_used: boolean;
  is_active: boolean;
  date_created: string;
};

type FertilizerAnalyticsRow = {
  nitrogen: string | null;
  phosphorus: string | null;
  potassium: string | null;
  temperature: string | null;
  ph: string | null;
  humidity: string | null;
  moisture: string | null;
  weight_kg: string | null;
  reed_switch: any;
  methane: string | null;
  air_quality: string | null;
  carbon_monoxide: string | null;
  combustible_gases: string | null;
};

type NotificationRow = {
  header: string;
  subheader: string;
  type: string;
  description: string;
  date: string;
  resolved: boolean;
};

@Injectable()
export class MobileService {
  constructor(private readonly databaseService: DatabaseService) {}

  async fetchMachine(customerId: string): Promise<Response> {
    const client = this.databaseService.getClient();

    try {
      const machineResponse = await client.query<
        FetchMachinesRow & { is_active: boolean }
      >(
        `
    SELECT mc.machine_id, ms.serial_number, mc.nickname, m.is_active
    FROM machine_customers mc
    LEFT JOIN machine_serial ms
      ON mc.machine_id = ms.machine_serial_id
    LEFT JOIN machines m
      ON mc.machine_id = m.machine_id
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

      // Check if the machine is already associated with this customer
      const existingAssociation = await client.query(
        `
        SELECT 1 FROM machine_customers
        WHERE machine_id = $1 AND customer_id = $2
        `,
        [machineId, customerId],
      );

      if (
        existingAssociation &&
        existingAssociation.rowCount &&
        existingAssociation.rowCount > 0
      ) {
        return {
          ok: false,
          error: 'You have already scanned and registered this machine.',
        };
      }

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

      const result = await client.query<
        FertilizerAnalyticsRow & { is_active: boolean }
      >(
        `
  SELECT nitrogen, phosphorus, potassium, 
         temperature, ph, humidity, moisture, weight_kg, reed_switch,
         methane, air_quality, carbon_monoxide, combustible_gases,
         m.is_active
  FROM fertilizer_analytics fa
  INNER JOIN machines m ON fa.machine_id = m.machine_id
  WHERE fa.machine_id = $1 
    AND EXISTS (
      SELECT 1 
      FROM machine_customers mc
      WHERE mc.machine_id = $1
        AND mc.customer_id = $2
    )
  ORDER BY fa.date_created DESC
  LIMIT 1
  `,
        [machineId, customerId],
      );

      if (!result.rows || result.rowCount == 0) {
        return { ok: false, error: 'No data  found' };
      }

      const row = result.rows[0] as FertilizerAnalyticsRow & {
        is_active: boolean;
      };
      const isMachineOffline = row.is_active === false;

      // Invert reed_switch logic
      const invertValue = (val: any) => {
        if (isMachineOffline) return 'offline';
        if (val === null || val === undefined) return null;
        const isTruthy =
          val === true ||
          val === 1 ||
          String(val).toLowerCase() === 'true' ||
          String(val).toLowerCase() === '1' ||
          String(val).toLowerCase() === 't';
        return !isTruthy;
      };

      row.reed_switch = invertValue(row.reed_switch);
      row.is_active = !isMachineOffline;

      return {
        ok: true,
        data: row,
        message: 'Machine data fetched successfully',
      };
    } catch (err) {
      console.error(err);
      return {
        ok: false,
        error: 'Internal server error',
      };
    }
  }

  async fetchNotifications(machineId: string, customerId: string) {
    try {
      const client = this.databaseService.getClient();

      if (!machineId) {
        return { ok: false, message: 'Machine ID is required' };
      }
      if (!customerId) {
        return { ok: false, message: 'Customer ID is required' };
      }

      const result = await client.query<NotificationRow>(
        `
  SELECT header, subheader, type, description, date, resolved
  FROM machine_notifications mn
  WHERE mn.machine_id = $1 
    AND EXISTS (
      SELECT 1 
      FROM machine_customers mc
      WHERE mc.machine_id = $1
        AND mc.customer_id = $2
    )
  `,
        [machineId, customerId],
      );

      if (!result.rows || result.rowCount == 0) {
        return { ok: false, error: 'No data  found' };
      }

      return {
        ok: true,
        data: result.rows,
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
  async deleteMachineAssociation(machineId: string, customerId: string) {
    try {
      const client = this.databaseService.getClient();

      if (!machineId) {
        return { ok: false, error: 'Machine id is required' };
      }

      if (!customerId) {
        return { ok: false, error: 'Customer id is required' };
      }

      const result = await client.query<MachineRow>(
        `
	  SELECT machine_id, customer_id
	  FROM machine_customers
	  WHERE machine_id = $1 AND customer_id = $2 
	  `,
        [machineId, customerId],
      );

      if (result.rowCount === 0) {
        return {
          ok: false,
          error: 'No machine found registered with user',
        };
      }

      await client.query(
        `
	  DELETE
    FROM machine_customers 
	  WHERE machine_id = $1 AND customer_id = $2 
	  `,
        [machineId, customerId],
      );

      return {
        ok: true,
        message: 'Machine registration removed successfully',
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
