import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Body,
  Post,
} from '@nestjs/common';
import { randomInt } from 'crypto';

import { DatabaseService } from '../../service/database/database.service';
import { NodemailerService } from '../../service/email/nodemailer.service';

type UserPublicRow = {
  customer_id: string;
  first_name: string;
  last_name: string;
  birthday: string;
  age: number;
  contact_number: string | null;
  address: string | null;
  email: string;
  date_created: string;
  last_updated: string;
  status: string;
};

function mapUser(row: UserPublicRow) {
  return {
    customer_id: row.customer_id,
    first_name: row.first_name,
    last_name: row.last_name,
    birthday: row.birthday,
    age: row.age,
    contact_number: row.contact_number,
    address: row.address,
    email: row.email,
    date_created: row.date_created,
    last_updated: row.last_updated,
    status: row.status,
  };
}

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailer: NodemailerService,
  ) {}

  private async ensureResetTable() {
    const client = this.databaseService.getClient();
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_password_resets (
        reset_id SERIAL PRIMARY KEY,
        customer_id UUID NOT NULL,
        token VARCHAR(128) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  @Get(':customerId')
  async getProfile(@Param('customerId') customerId: string) {
    if (!customerId) {
      throw new BadRequestException('customerId is required');
    }

    const client = this.databaseService.getClient();

    try {
      const userResult = await client.query<{
        customer_id: string;
        first_name: string;
        last_name: string;
        birthday: string | null;
        age: number | null;
        contact_number: string | null;
        address: string | null;
        email: string;
        date_created: string;
        last_updated: string;
        status: string;
      }>(
        `SELECT customer_id, first_name, last_name, NULL as birthday, NULL as age, contact_number, address, email, date_created, last_updated, status
         FROM user_customer
         WHERE customer_id = $1
         LIMIT 1`,
        [customerId],
      );

      if (userResult.rowCount) {
        return {
          ok: true,
          user: mapUser(userResult.rows[0] as UserPublicRow),
        };
      }
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to load settings');
    }
  }

  @Patch(':customerId')
  async updateProfile(
    @Param('customerId') customerId: string,
    @Body()
    body: {
      firstname?: string;
      lastname?: string;
      address?: string | null;
      age?: number;
      contact?: string | null;
    },
  ) {
    if (!customerId) {
      throw new BadRequestException('customerId is required');
    }

    const client = this.databaseService.getClient();

    try {
      const updates: string[] = [];
      const values: (string | number | null)[] = [];

      if (body.firstname !== undefined) {
        updates.push(`first_name = $${updates.length + 1}`);
        values.push(body.firstname.trim());
      }

      if (body.lastname !== undefined) {
        updates.push(`last_name = $${updates.length + 1}`);
        values.push(body.lastname.trim());
      }

      if (body.address !== undefined) {
        updates.push(`address = $${updates.length + 1}`);
        values.push(body.address?.trim() || null);
      }

      if (body.contact !== undefined) {
        updates.push(`contact_number = $${updates.length + 1}`);
        values.push(body.contact?.trim() || null);
      }

      // Only update age for user (not admin)
      if (body.age !== undefined) {
        const parsedAge = Number(body.age);
        if (Number.isNaN(parsedAge)) {
          throw new BadRequestException('age must be a number');
        }
        updates.push(`age = $${updates.length + 1}`);
        values.push(parsedAge);
      }

      if (updates.length === 0) {
        throw new BadRequestException('No fields provided to update');
      }

      const setClause = `${updates.join(', ')}, last_updated = now()`;

      // Update admin table
      const result = await client.query<{
        customer_id: string;
        first_name: string;
        last_name: string;
        birthday: string | null;
        age: number | null;
        contact_number: string | null;
        address: string | null;
        email: string;
        date_created: string;
        last_updated: string;
        status: string;
      }>(
        `UPDATE user_customer
           SET ${setClause}
           WHERE customer_id = $${updates.length + 1}
           RETURNING customer_id, first_name, last_name, NULL as birthday, NULL as age, contact_number, address, email, date_created, last_updated, status`,
        [...values, customerId],
      );

      if (!result.rowCount) {
        throw new NotFoundException('Account not found');
      }

      return {
        ok: true,
        user: mapUser(result.rows[0] as UserPublicRow),
        message: 'Settings updated successfully',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update settings');
    }
  }

  @Patch(':customerId/close')
  async closeAccount(@Param('customerId') customerId: string) {
    if (!customerId) {
      throw new BadRequestException('customerId is required');
    }

    const client = this.databaseService.getClient();

    try {
      const existing = await client.query<{ status: string }>(
        'SELECT status FROM user_customer WHERE customer_id = $1 LIMIT 1',
        [customerId],
      );

      if (!existing.rowCount) {
        throw new NotFoundException('Account not found');
      }

      const currentStatus = existing.rows[0].status;
      if (currentStatus === 'inactive') {
        throw new BadRequestException('Account is already inactive');
      }
      if (currentStatus === 'banned') {
        throw new BadRequestException('Banned accounts cannot be closed');
      }

      await client.query(
        `UPDATE user_customer
         SET status = 'inactive', last_updated = now()
         WHERE customer_id = $1`,
        [customerId],
      );

      return {
        ok: true,
        message: 'Account has been deactivated',
        status: 'inactive',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to close account');
    }
  }

  @Post(':customerId/password-reset')
  async requestPasswordReset(@Param('customerId') customerId: string) {
    if (!customerId) {
      throw new BadRequestException('customerId is required');
    }

    const client = this.databaseService.getClient();

    try {
      // First check admin table
      let userResult = await client.query<{
        customer_id: string;
        first_name: string;
        email: string;
      }>(
        `SELECT customer_id, first_name, email FROM user_customer WHERE customer_id = $1 LIMIT 1`,
        [customerId],
      );

      if (!userResult.rowCount) {
        throw new NotFoundException('Account not found');
      }

      const user = userResult.rows[0];

      await this.ensureResetTable();

      // Clear previous codes for this user
      await client.query(
        'DELETE FROM user_password_resets WHERE customer_id = $1',
        [customerId],
      );

      const code = String(randomInt(100000, 1000000));

      await client.query(
        `INSERT INTO user_password_resets (customer_id, token, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
        [customerId, code],
      );

      await this.mailer.sendPasswordResetCodeEmail(user.email, code);

      return {
        ok: true,
        message: 'Password reset code sent to your email',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to request password reset',
      );
    }
  }

  @Post(':customerId/password-reset/verify')
  async verifyPasswordReset(
    @Param('customerId') customerId: string,
    @Body() body: { code?: string; newPassword?: string },
  ) {
    if (!customerId) throw new BadRequestException('customerId is required');
    const code = body?.code?.trim();
    const newPassword = body?.newPassword;

    if (!code || !/^\d{6}$/.test(code)) {
      throw new BadRequestException(
        'Verification code must be a 6-digit number',
      );
    }
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException(
        'New password must be at least 8 characters long',
      );
    }

    const client = this.databaseService.getClient();
    try {
      // Check if user exists 
      let userResult = await client.query(
        'SELECT customer_id as FROM user_customer WHERE customer_id = $1 LIMIT 1',
        [customerId],
      );

      if (!userResult.rowCount) {
        userResult = await client.query(
          'SELECT customer_id FROM user_customer WHERE customer_id = $1 LIMIT 1',
          [customerId],
        );
      }

      if (!userResult.rowCount) {
        throw new NotFoundException('Account not found');
      }

      // Get latest reset record for this user
      const reset = await client.query<{ token: string; expires_at: string }>(
        `SELECT token, expires_at FROM user_password_resets
         WHERE customer_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [customerId],
      );

      if (!reset.rowCount) {
        throw new BadRequestException('No password reset request found');
      }

      const record = reset.rows[0];
      const now = new Date();
      const expiresAt = new Date(record.expires_at);
      if (expiresAt < now) {
        throw new BadRequestException('Verification code has expired');
      }
      if (record.token !== code) {
        throw new BadRequestException('Invalid verification code');
      }

      // Update password
      // Use bcrypt without importing here; keep hashing in DB? We'll import bcrypt to be consistent
      // But since this file doesn't have bcrypt yet, add it
      return await (async () => {
        const bcrypt = await import('bcryptjs');
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Update password in the appropriate table
        await client.query(
          'UPDATE user_customer SET password = $1, last_updated = NOW() WHERE customer_id = $2',
          [passwordHash, customerId],
        );

        await client.query(
          'DELETE FROM user_password_resets WHERE customer_id = $1',
          [customerId],
        );
        return { ok: true, message: 'Password has been reset successfully' };
      })();
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to verify password reset');
    }
  }
}
