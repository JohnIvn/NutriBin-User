import {
  BadRequestException,
  Body,
  //  Body,
  Controller,
  Get,
  Post,
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
