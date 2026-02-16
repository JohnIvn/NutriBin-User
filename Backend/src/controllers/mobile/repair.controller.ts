import {
  Body,
  Controller,
  Post,
  BadRequestException,
  Get,
  Param,
} from '@nestjs/common';
import { RepairService } from '../../service/mobile/repair.service';

@Controller('mobile/repair')
export class RepairController {
  constructor(private readonly repairService: RepairService) {}

  @Post('create')
  async createRepair(
    @Body('machineId') machineId: string,
    @Body('userId') userId: string,
    @Body('description') description: string,
  ) {
    if (!machineId || !userId || !description) {
      throw new BadRequestException(
        'machineId, userId, and description are required',
      );
    }
    return this.repairService.createRepairRequest(
      machineId,
      userId,
      description,
    );
  }

  @Get(':userId')
  async getRepairRequests(@Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.repairService.getRepairRequests(userId);
  }
}
