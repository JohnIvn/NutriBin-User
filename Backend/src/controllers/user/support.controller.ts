import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SupportService } from '../../service/support/support.service';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  async createTicket(
    @Body()
    body: {
      customerId: string;
      subject: string;
      description: string;
      priority?: string;
    },
  ) {
    if (!body.customerId || !body.subject || !body.description) {
      throw new BadRequestException(
        'customerId, subject, and description are required',
      );
    }
    return this.supportService.createTicket(
      body.customerId,
      body.subject,
      body.description,
      body.priority,
    );
  }

  @Get('tickets/customer/:customerId')
  async getTickets(@Param('customerId') customerId: string) {
    return this.supportService.getTicketsByCustomer(customerId);
  }

  @Get('tickets/:id/customer/:customerId')
  async getTicketById(
    @Param('id') id: string,
    @Param('customerId') customerId: string,
  ) {
    return this.supportService.getTicketById(id, customerId);
  }

  @Post('tickets/:id/messages')
  async addMessage(
    @Param('id') id: string,
    @Body()
    body: {
      senderId: string;
      message: string;
    },
  ) {
    if (!body.senderId || !body.message) {
      throw new BadRequestException('senderId and message are required');
    }
    return this.supportService.addMessage(id, body.senderId, body.message);
  }

  @Get('tickets/:id/messages/customer/:customerId')
  async getMessages(
    @Param('id') id: string,
    @Param('customerId') customerId: string,
  ) {
    return this.supportService.getMessages(id, customerId);
  }
}
