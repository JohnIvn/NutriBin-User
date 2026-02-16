import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { MachineService } from '../../service/machine/machine.service';

@Controller('hardware')
export class HardwareController {
  constructor(private readonly machineService: MachineService) {}

  @Get('status/:machineId')
  async getHardwareStatus(@Param('machineId') machineId: string) {
    if (!machineId) {
      throw new BadRequestException('machineId is required');
    }

    return this.machineService.getHardwareStatus(machineId);
  }

  @Post('restart/:machineId')
  async restartMachine(@Param('machineId') machineId: string) {
    if (!machineId) {
      throw new BadRequestException('machineId is required');
    }

    return this.machineService.restartMachine(machineId);
  }
}
