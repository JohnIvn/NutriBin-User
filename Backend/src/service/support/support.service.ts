import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SupportService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createTicket(
    customerId: string,
    subject: string,
    description: string,
    priority: string = 'medium',
  ) {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query(
        `INSERT INTO support_tickets (customer_id, subject, description, priority)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [customerId, subject, description, priority],
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw new InternalServerErrorException('Failed to create support ticket');
    }
  }

  async getTicketsByCustomer(customerId: string) {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query(
        `SELECT * FROM support_tickets WHERE customer_id = $1 ORDER BY date_created DESC`,
        [customerId],
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching customer tickets:', error);
      throw new InternalServerErrorException('Failed to fetch support tickets');
    }
  }

  async getTicketById(ticketId: string, customerId: string) {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query(
        `SELECT * FROM support_tickets WHERE ticket_id = $1 AND customer_id = $2`,
        [ticketId, customerId],
      );
      if (result.rows.length === 0)
        throw new NotFoundException('Ticket not found');
      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Error fetching ticket by ID:', error);
      throw new InternalServerErrorException('Failed to fetch ticket');
    }
  }

  async addMessage(ticketId: string, senderId: string, message: string) {
    const client = this.databaseService.getClient();
    try {
      // First verify ticket ownership
      const ticketCheck = await client.query(
        `SELECT customer_id FROM support_tickets WHERE ticket_id = $1`,
        [ticketId],
      );
      if (ticketCheck.rows.length === 0)
        throw new NotFoundException('Ticket not found');

      const result = await client.query(
        `INSERT INTO support_messages (ticket_id, sender_id, sender_type, message)
         VALUES ($1, $2, 'customer', $3)
         RETURNING *`,
        [ticketId, senderId, message],
      );

      // Update the ticket's last_updated field
      await client.query(
        `UPDATE support_tickets SET last_updated = now() WHERE ticket_id = $1`,
        [ticketId],
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error adding message to ticket:', error);
      throw new InternalServerErrorException('Failed to add message');
    }
  }

  async getMessages(ticketId: string, customerId: string) {
    const client = this.databaseService.getClient();
    try {
      // Verify access
      const accessCheck = await client.query(
        `SELECT 1 FROM support_tickets WHERE ticket_id = $1 AND customer_id = $2`,
        [ticketId, customerId],
      );
      if (accessCheck.rows.length === 0)
        throw new NotFoundException('Ticket not found or access denied');

      const result = await client.query(
        `SELECT * FROM support_messages WHERE ticket_id = $1 ORDER BY date_sent ASC`,
        [ticketId],
      );
      return result.rows;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Error fetching ticket messages:', error);
      throw new InternalServerErrorException('Failed to fetch messages');
    }
  }
}
