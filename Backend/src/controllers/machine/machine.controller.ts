import {
  BadRequestException,
  Body,
  //  Body,
  Controller,
  Get,
  Post,
  Delete,
  //  Patch,
  Param,
} from '@nestjs/common';
// import type { MachineDto } from 'src/data/machine';
import { DatabaseService } from 'src/service/database/database.service';
import { BrevoService } from 'src/service/email/brevo.service';
import { MachineService } from 'src/service/machine/machine.service';

@Controller('machine')
export class MachineController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailer: BrevoService,
    private readonly machineService: MachineService,
  ) {}

  // Fetches the machine ID when a user signed in
  @Get(':customerId')
  async fetchMachineId(@Param('customerId') customerId: string) {
    if (!customerId) {
      throw new BadRequestException('Request body is required');
    }

    return this.machineService.fetchMachine(customerId);
  }

  // Get serial number by machine ID
  @Get('serial/:machineId')
  async getSerial(@Param('machineId') machineId: string) {
    if (!machineId) {
      throw new BadRequestException('Machine ID is required');
    }

    return this.machineService.getSerialByMachineId(machineId);
  }

  @Get('firmware-update/:machineId')
  async checkFirmwareUpdate(@Param('machineId') machineId: string) {
    if (!machineId) {
      throw new BadRequestException('Machine ID is required');
    }

    return this.machineService.checkFirmwareUpdate(machineId);
  }

  @Get('firmware-versions/:machineId')
  async getFirmwareVersions(@Param('machineId') machineId: string) {
    if (!machineId) {
      throw new BadRequestException('Machine ID is required');
    }

    return this.machineService.getAllFirmwareVersions(machineId);
  }

  @Post('update-firmware')
  async updateFirmware(
    @Body('machineId') machineId: string,
    @Body('version') version: string,
  ) {
    if (!machineId || !version) {
      throw new BadRequestException('machineId and version are required');
    }

    return this.machineService.updateFirmware(machineId, version);
  }

  @Post('update-progress')
  async updateProgress(
    @Body('machineId') machineId: string,
    @Body('updateProgress') updateProgress: string,
  ) {
    if (!machineId || updateProgress === undefined) {
      throw new BadRequestException(
        'machineId and updateProgress are required',
      );
    }

    return this.machineService.updateProgress(machineId, updateProgress);
  }

  @Post('complete-update')
  async completeUpdate(@Body('machineId') machineId: string) {
    if (!machineId) {
      throw new BadRequestException('machineId is required');
    }

    return this.machineService.completeUpdate(machineId);
  }

  @Post('add-machine')
  async addMachine(
    @Body('machineSerial') machineSerial: string,
    @Body('customerId') customerId: string,
  ) {
    if (!machineSerial || !customerId) {
      return { ok: false, error: 'machineSerial and customerId are required' };
    }

    return this.machineService.addMachine(machineSerial, customerId);
  }

  @Post('add-name-machine')
  async addNameMachine(
    @Body('name') name: string,
    @Body('customerId') customerId: string,
    @Body('machineId') machineId: string,
  ) {
    if (!name || !customerId) {
      return { ok: false, error: 'machineSerial and customerId are required' };
    }

    return this.machineService.addNameMachine(machineId, name, customerId);
  }

  @Delete('delete')
  async deleteMachine(
    @Body('customerId') customerId: string,
    @Body('machineId') machineId: string,
  ) {
    if (!customerId || !machineId) {
      throw new BadRequestException('customerId and machineId are required');
    }

    const client = this.databaseService.getClient();

    try {
      const result = await client.query(
        `DELETE FROM machine_customers 
       WHERE customer_id = $1 AND machine_id = $2 
       RETURNING *`,
        [customerId, machineId],
      );

      if (!result || result.rowCount === 0) {
        return { ok: false, error: 'Machine not found or already deleted' };
      }

      return { ok: true, message: 'Machine deleted successfully' };
    } catch (error) {
      console.error('Failed to delete machine:', error);
      return { ok: false, error: 'Failed to delete machine' };
    }
  }

  //Uncomment the code if it is gonna be used
  /*
  // Fetches machines data on user view (When the user chose a machine to view)
  @Get('data/:machineId')
  async fetchMachineData(@Param('machineId') machineId: string) {
    if (!machineId) {
      throw new BadRequestException('Request body is required');
    }

    return { ok: true };
  }

  // Interval based sending of machine data (From Q to Server), to record machine data and allow non http based connection
  @Post('insert/:machineId/:customerId')
  async sendMachineData(
    @Body() body: MachineDto,
    @Param('customerId') customerId: string,
    @Param('machineId') machineId: string,
  ) {
    if (!customerId || !machineId) {
      throw new BadRequestException('Request body is required');
    }

    return { ok: true };
  }

  // Register machine for a user (wifi_ssid and password is HASHED)
  @Post('register/:customerId')
  async registerMachine(
    @Body() body: MachineDto,
    @Param('customerId') customerId: string,
  ) {
    if (!customerId) {
      throw new BadRequestException('Request body is required');
    }

    return { ok: true };
  }

  // Update Maching information (name and wifi information)
  @Patch('update/:machineId')
  async updateMachineData(@Param('machineId') machineId: string) {
    if (!machineId) {
      throw new BadRequestException('Request body is required');
    }

    return { ok: true };
  }
  
  */
}
