import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
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

//   @Get('/:customerId')
//   async fetchMachineId(@Param('customerId') customerId: string) {

//     if (!customerId) {
//       throw new BadRequestException('Request body is required');
//     }

//     return 'test';
//   }
}
