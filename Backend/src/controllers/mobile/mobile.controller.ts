import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { DatabaseService } from 'src/service/database/database.service';
import { BrevoService } from 'src/service/email/brevo.service';
import { MobileService } from 'src/service/mobile/mobile.service';

@Controller('mobile')
export class MobileController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailer: BrevoService,
    private readonly mobileService: MobileService,
  ) {}

  @Get('')
  test() {
    console.log('Endpoint for mobile triggered');
    return {
      ok: true,
      data: null,
      message: 'Success',
    };
  }

  // Fetches the machine ID when a user signed in
  @Get('machine/:customerId')
  async fetchMachineId(@Param('customerId') customerId: string) {
    if (!customerId) {
      throw new BadRequestException('Customer ID Required');
    }

    return this.mobileService.fetchMachine(customerId);
  }

  @Post('machine/add-machine')
  async addMachine(
    @Body('machineSerial') machineSerial: string,
    @Body('customerId') customerId: string,
  ) {
    if (!machineSerial || !customerId) {
      return { ok: false, error: 'machineSerial and customerId are required' };
    }

    return this.mobileService.registerMachine(machineSerial, customerId);
  }

  // Fetches machines data on user view (When the user chose a machine to view)
  @Get('machine/data/:customerId/:machineId')
  async fetchMachineData(
    @Param('machineId') machineId: string,
    @Param('customerId') customerId: string,
  ) {
    if (!customerId) {
      throw new ForbiddenException('Customer ID is required');
    }

    return this.mobileService.fetchMachineData(machineId, customerId);
  }

  //Uncomment the code if it is gonna be used
  /*
	
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
