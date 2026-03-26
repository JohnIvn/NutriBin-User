import {
  //BadRequestException,
  Injectable,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

type FetchMachinesRow = {
  machine_id: string;
  nickname: string;
  serial_number?: string;
};

type MachineRow = {
  machine_serial_id: string;
  serial_number: string;
  is_used: boolean;
  is_active: boolean;
  date_created: string;
};

type HardwareStatusRow = {
  c1: boolean;
  c2: boolean;
  c3: boolean;
  c4: boolean;
  c5: boolean;
  s1: boolean;
  s2: boolean;
  s3: boolean;
  s4: boolean;
  s5: boolean;
  s6: boolean;
  s7: boolean;
  s8: boolean;
  s9: boolean;
  m1: boolean;
  m2: boolean;
  m3: boolean;
  m4: boolean;
  m5: boolean;
  m6: boolean;
  m7: boolean;
};

type MachineInfoRow = {
  firmware_version: string;
  target_firmware_version: string | null;
  update_status: string | null;
  update_progress: string | null;
  is_active: boolean;
  model: string;
};

type FirmwareRow = {
  version: string;
  release_notes: string;
  release_date: string;
  created_at?: string;
};

type ModelRow = {
  model: string;
};

type FirmwareVersionRow = {
  firmware_version: string;
};

type UpdateProgressRow = {
  update_progress: string;
};

type CompleteUpdateRow = {
  firmware_version: string;
  update_status: string;
};

@Injectable()
export class MachineService {
  constructor(private readonly databaseService: DatabaseService) {}

  async fetchMachine(customerId: string): Promise<FetchMachinesRow[]> {
    const client = this.databaseService.getClient();

    try {
      const query = await client.query<FetchMachinesRow>(
        `
        SELECT 
          mc.machine_id, 
          mc.nickname, 
          ms.serial_number
        FROM public.machine_customers mc
        LEFT JOIN public.machines m ON mc.machine_id = m.machine_id
        LEFT JOIN public.machine_serial ms ON m.machine_id = ms.machine_serial_id
        WHERE mc.customer_id = $1
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

  async addNameMachine(machineId: string, name: string, customerId: string) {
    try {
      const nameTrim = name.trim();
      const client = this.databaseService.getClient();

      if (!name) {
        return { ok: false, error: 'Serial is required' };
      }

      const result = await client.query<MachineRow>(
        `
      SELECT machine_id
      FROM machine_customers
      WHERE customer_id = $1 AND machine_id = $2
      `,
        [customerId, machineId],
      );

      if (!result.rowCount) {
        return { ok: false, error: 'Machine not found' };
      }

      await client.query(
        `
      UPDATE machine_customers
      SET nickname = $1
      WHERE customer_id = $2 AND machine_id = $3
      `,
        [nameTrim, customerId, machineId],
      );

      return {
        ok: true,
        message: 'Machine nickname added successfully',
      };
    } catch (err) {
      console.error(err);
      return {
        ok: false,
        error: 'Failed to name machine',
      };
    }
  }

  async getHardwareStatus(machineId: string) {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<HardwareStatusRow>(
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

  async getSerialByMachineId(machineId: string): Promise<{
    ok: boolean;
    serial_number?: string;
    error?: string;
  }> {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<{ serial_number: string }>(
        `
        SELECT ms.serial_number
        FROM public.machines m
        LEFT JOIN public.machine_serial ms ON m.machine_id = ms.machine_serial_id
        WHERE m.machine_id = $1
        `,
        [machineId],
      );

      if (!result.rowCount || !result.rows[0]?.serial_number) {
        return { ok: false, error: 'Serial not found for this machine' };
      }

      return {
        ok: true,
        serial_number: result.rows[0].serial_number,
      };
    } catch (err) {
      console.error('Error fetching serial by machine ID:', err);
      return { ok: false, error: 'Database error' };
    }
  }

  restartMachine(machineId: string) {
    console.log(`Restart command initiated for machine: ${machineId}`);

    return {
      ok: true,
      message: 'Restart command initiated successfully',
    };
  }

  async checkFirmware(machineId: string) {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<FirmwareVersionRow>(
        `
      SELECT firmware_version
      FROM public.machines
      WHERE machine_id = $1
      `,
        [machineId],
      );

      if (result.rowCount === 0) {
        return { ok: false, error: 'Machine not found' };
      }

      return {
        ok: true,
        firmwareVersion: result.rows[0].firmware_version,
      };
    } catch (err) {
      console.error('Error checking firmware:', err);
      return { ok: false, error: 'Database error' };
    }
  }

  async autoUpdateFirmware(machineId: string) {
    const client = this.databaseService.getClient();

    try {
      const machineResult = await client.query<{
        firmware_version: string;
        model: string;
      }>(
        `       SELECT m.firmware_version, ms.model
        FROM public.machines m
        JOIN public.machine_serial ms
          ON m.machine_id = ms.machine_serial_id
        WHERE m.machine_id = $1
        `,
        [machineId],
      );

      if (machineResult.rowCount === 0) {
        return { ok: false, error: 'Machine not found' };
      }

      const { firmware_version: currentVersion, model } = machineResult.rows[0];

      const firmwareResult = await client.query<FirmwareRow>(
        `
        SELECT version
        FROM public.firmware
        WHERE status = 'Stable'
        AND $1 = ANY(target_models)
        ORDER BY release_date DESC, created_at DESC
        LIMIT 1
        `,
        [model],
      );

      if (firmwareResult.rowCount === 0) {
        return { ok: false, message: 'No compatible firmware found' };
      }

      const latestVersion = firmwareResult.rows[0].version;

      if (compareVersions(currentVersion, latestVersion) < 0) {
        await client.query(
          `
          UPDATE public.machines
          SET firmware_version = $1,
              target_firmware_version = NULL,
              update_status = 'success',
              update_progress = '100',
              last_update_attempt = NOW()
          WHERE machine_id = $2
          `,
          [latestVersion, machineId],
        );

        return {
          ok: true,
          updated: true,
          previousVersion: currentVersion,
          newVersion: latestVersion,
        };
      }

      return {
        ok: true,
        updated: false,
        currentVersion,
        latestVersion,
      };
    } catch (err) {
      console.error('Error auto updating firmware:', err);
      return { ok: false, error: 'Database error' };
    }
  }

  async firmwareVersions(machineId: string) {
    const client = this.databaseService.getClient();

    try {
      const machineResult = await client.query<ModelRow>(
        `       SELECT ms.model
      FROM public.machine_serial ms
      JOIN public.machines m
        ON m.machine_id = ms.machine_serial_id
      WHERE m.machine_id = $1
      `,
        [machineId],
      );

      if (machineResult.rowCount === 0) {
        return { ok: false, error: 'Machine not found' };
      }

      const { model } = machineResult.rows[0];

      const firmwareResult = await client.query<FirmwareRow>(
        `
        SELECT version, release_notes, release_date
        FROM public.firmware
        WHERE status = 'Stable'
        AND $1 = ANY(target_models)
        ORDER BY release_date DESC, created_at DESC
        `,
        [model],
      );

      return {
        ok: true,
        model,
        versions: firmwareResult.rows,
      };
    } catch (err) {
      console.error('Error fetching stable firmware:', err);
      return { ok: false, error: 'Database error' };
    }
  }

  async getAllFirmwareVersions(machineId: string) {
    const client = this.databaseService.getClient();

    try {
      const machineResult = await client.query<ModelRow>(
        `
        SELECT ms.model
        FROM public.machines m
        JOIN public.machine_serial ms ON m.machine_id = ms.machine_serial_id
        WHERE m.machine_id = $1
        `,
        [machineId],
      );

      if (machineResult.rowCount === 0) {
        return { ok: false, error: 'Machine not found' };
      }

      const { model } = machineResult.rows[0];

      const firmwareResult = await client.query<FirmwareRow>(
        `
        SELECT version, release_notes, release_date, created_at
        FROM public.firmware
        WHERE status = 'Stable'
        AND $1 = ANY(target_models)
        ORDER BY release_date DESC, created_at DESC
        `,
        [model],
      );

      return {
        ok: true,
        versions: firmwareResult.rows.map((row) => ({
          version: row.version,
          releaseNotes: row.release_notes,
          releaseDate: row.release_date,
        })),
      };
    } catch (err) {
      console.error('Error fetching all firmware versions:', err);
      return { ok: false, error: 'Database error' };
    }
  }

  async checkFirmwareUpdate(machineId: string) {
    const client = this.databaseService.getClient();

    try {
      const machineResult = await client.query<MachineInfoRow>(
        `
        SELECT m.firmware_version, m.target_firmware_version, m.update_status, m.update_progress, m.is_active, ms.model
        FROM public.machines m
        JOIN public.machine_serial ms ON m.machine_id = ms.machine_serial_id
        WHERE m.machine_id = $1
        `,
        [machineId],
      );

      if (machineResult.rowCount === 0) {
        return { ok: false, error: 'Machine not found' };
      }

      const {
        firmware_version: currentVersion,
        target_firmware_version: targetFirmwareVersion,
        update_status: updateStatus,
        update_progress: updateProgress,
        is_active: isActive,
        model,
      } = machineResult.rows[0];

      const isOnline = isActive ? true : false;

      const firmwareResult = await client.query<FirmwareRow>(
        `
        SELECT version, release_notes, release_date
        FROM public.firmware
        WHERE status = 'Stable' 
        AND $1 = ANY(target_models)
        ORDER BY release_date DESC, created_at DESC
        LIMIT 1
        `,
        [model],
      );

      if (firmwareResult.rowCount === 0) {
        return { ok: false, message: 'No compatible firmware found' };
      }

      const latestFirmware = firmwareResult.rows[0];
      const latestVersion = latestFirmware.version;

      const hasActiveUpdate =
        updateStatus === 'pending' ||
        updateStatus === 'interrupted' ||
        updateStatus === 'failed';

      if (currentVersion < latestVersion || hasActiveUpdate) {
        return {
          ok: true,
          updateAvailable: currentVersion < latestVersion,
          currentVersion,
          latestVersion,
          targetFirmwareVersion: targetFirmwareVersion ?? latestVersion,
          updateStatus: updateStatus ?? 'pending',
          updateProgress: updateProgress ?? '0',
          releaseNotes: latestFirmware.release_notes,
          releaseDate: latestFirmware.release_date,
          isOnline,
        };
      } else {
        return {
          ok: true,
          updateAvailable: false,
          currentVersion,
          latestVersion,
          targetFirmwareVersion,
          updateStatus,
          updateProgress,
          isOnline,
        };
      }
    } catch (err) {
      console.error('Error checking firmware update:', err);
      return { ok: false, error: 'Database error' };
    }
  }

  async updateFirmware(machineId: string, version: string) {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query(
        `
        UPDATE public.machines
        SET target_firmware_version = $2,
            update_status = 'pending',
            update_progress = '0',
            last_update_attempt = now()
        WHERE machine_id = $1
        RETURNING *
        `,
        [machineId, version],
      );

      if (result.rowCount === 0) {
        return { ok: false, error: 'Machine not found or update failed' };
      }

      return {
        ok: true,
        message: 'Firmware updated successfully',
        newVersion: version,
      };
    } catch (err) {
      console.error('Error updating firmware:', err);
      return { ok: false, error: 'Database error' };
    }
  }

  async updateProgress(machineId: string, updateProgress: string) {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query(
        `
        UPDATE public.machines
        SET update_progress = $2
        WHERE machine_id = $1
        RETURNING *
        `,
        [machineId, updateProgress],
      );

      if (result.rowCount === 0) {
        return { ok: false, error: 'Machine not found' };
      }

      return {
        ok: true,
        message: 'Progress updated',
        updateProgress,
      };
    } catch (err) {
      console.error('Error updating progress:', err);
      return { ok: false, error: 'Database error' };
    }
  }

  async completeProgress(machineId: string) {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<UpdateProgressRow>(
        `
        UPDATE public.machines
        SET update_progress = '100'
        WHERE machine_id = $1
        RETURNING update_progress
        `,
        [machineId],
      );

      if (result.rowCount === 0) {
        return { ok: false, error: 'Machine not found' };
      }

      return {
        ok: true,
        message: 'Progress completion tracked',
        updateProgress: result.rows[0].update_progress,
      };
    } catch (err) {
      console.error('Error completing progress:', err);
      return { ok: false, error: 'Database error' };
    }
  }

  async completeUpdate(machineId: string) {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<CompleteUpdateRow>(
        `
        UPDATE public.machines
        SET firmware_version = target_firmware_version,
            update_status = 'success',
            update_progress = '100',
            last_update_attempt = now()
        WHERE machine_id = $1 AND target_firmware_version IS NOT NULL
        RETURNING firmware_version, update_status
        `,
        [machineId],
      );

      if (result.rowCount === 0) {
        return {
          ok: false,
          error: 'Machine not found or no target version set',
        };
      }

      return {
        ok: true,
        message: 'Update completed successfully',
        firmwareVersion: result.rows[0].firmware_version,
        updateStatus: result.rows[0].update_status,
      };
    } catch (err) {
      console.error('Error completing update:', err);
      return { ok: false, error: 'Database error' };
    }
  }
}

function compareVersions(v1: string, v2: string) {
  const a = v1.replace('v', '').split('.').map(Number);
  const b = v2.replace('v', '').split('.').map(Number);

  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] || 0) - (b[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}
