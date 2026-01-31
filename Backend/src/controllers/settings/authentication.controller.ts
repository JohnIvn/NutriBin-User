import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Body,
  Post,
} from '@nestjs/common';

import { DatabaseService } from '../../service/database/database.service';
import { BrevoService } from 'src/service/email/brevo.service';

interface UserRow {
  id: string;
  first_name: string;
  last_name: string;
  contact_number: string | null;
  address: string | null;
  email: string;
  date_created: Date;
  last_updated: Date;
  status: string;
}

@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailer: BrevoService,
  ) {}

  @Get(':customerId/mfa')
  async getMFASettings(@Param('customerId') customerId: string) {
    if (!customerId) {
      throw new BadRequestException('customerId is required');
    }

    const client = this.databaseService.getClient();

    try {
      // Check if MFA row exists
      const result = await client.query<{
        authentication_type: string;
        enabled: boolean;
      }>(
        `SELECT authentication_type, enabled
       FROM authentication
       WHERE customer_id = $1
       LIMIT 1`,
        [customerId],
      );

      // If no row exists, create one
      if (result.rowCount === 0) {
        await client.query(
          `INSERT INTO authentication (customer_id, authentication_type, enabled, user_type)
          VALUES ($1, 'N/A', false, 'customer')`,
          [customerId],
        );

        return {
          ok: true,
          mfaType: 'customer',
          message: 'MFA row created',
        };
      }

      // Row exists, return current type
      return {
        ok: true,
        mfaType: result.rows[0].authentication_type,
        enabled: result.rows[0].enabled,
      };
    } catch (error) {
      console.error('Failed to get or create MFA row:', error);
      throw new InternalServerErrorException('Failed to load MFA settings');
    }
  }

  @Patch(':customerId/mfa')
  async updateMFASettings(
    @Param('customerId') customerId: string,
    @Body() body: { mfaType?: 'N/A' | 'email' },
  ) {
    if (!customerId) {
      throw new BadRequestException('customerId is required');
    }

    if (!body.mfaType) {
      throw new BadRequestException('mfaType is required');
    }

    const enabled = body.mfaType !== 'N/A';
    const client = this.databaseService.getClient();

    try {
      await client.query(
        `
      INSERT INTO authentication (
        customer_id,
        user_type,
        authentication_type,
        enabled
      )
      VALUES ($1, 'customer', $2, $3)
      ON CONFLICT (customer_id)
      DO UPDATE SET
        authentication_type = EXCLUDED.authentication_type,
        enabled = EXCLUDED.enabled
      `,
        [customerId, body.mfaType, enabled],
      );

      return {
        ok: true,
        message: 'MFA settings updated successfully',
        mfaType: body.mfaType,
      };
    } catch (error) {
      console.error('Error updating MFA settings:', error);
      throw new InternalServerErrorException('Failed to update MFA settings');
    }
  }

  @Post('verify-mfa')
  async verifyMFA(@Body() body: { token?: string; customerId?: string }) {
    if (!body.token) {
      throw new BadRequestException('token is required');
    }

    if (!body.customerId) {
      throw new BadRequestException('customerId is required');
    }

    const client = this.databaseService.getClient();

    try {
      console.log(`[MFA] Verifying token for customer_id=${body.customerId}`);

      // 1️⃣ Verify MFA token exists and is valid
      const authResult = await client.query<{
        mfa_token: string | null;
        mfa_token_expiry: string | null;
        enabled: boolean;
        authentication_type: string;
      }>(
        `
      SELECT mfa_token, mfa_token_expiry, enabled, authentication_type
      FROM authentication
      WHERE customer_id = $1
      LIMIT 1
      `,
        [body.customerId],
      );

      if (authResult.rows.length === 0) {
        throw new BadRequestException('No MFA record found');
      }

      const auth = authResult.rows[0];

      if (!auth.enabled || auth.authentication_type === 'N/A') {
        throw new BadRequestException('MFA is not enabled for this account');
      }

      if (!auth.mfa_token) {
        throw new BadRequestException('No MFA token found for this account');
      }

      if (auth.mfa_token !== body.token) {
        throw new BadRequestException('Invalid MFA token');
      }

      if (
        auth.mfa_token_expiry &&
        new Date(auth.mfa_token_expiry) < new Date()
      ) {
        throw new BadRequestException('MFA token has expired');
      }

      console.log(`[MFA] Token verified for customer_id=${body.customerId}`);

      // 2️⃣ Verify customer exists and fetch customer data
      const customerResult = await client.query<{
        customer_id: string;
        first_name: string;
        last_name: string;
        contact_number: string | null;
        address: string | null;
        email: string;
        date_created: string;
        last_updated: string;
        status: string;
      }>(
        `
      SELECT
        customer_id,
        first_name,
        last_name,
        contact_number,
        address,
        email,
        date_created,
        last_updated,
        status
      FROM user_customer
      WHERE customer_id = $1
      LIMIT 1
      `,
        [body.customerId],
      );

      if (customerResult.rows.length === 0) {
        throw new BadRequestException('Customer not found');
      }

      const customer = customerResult.rows[0];

      // 3️⃣ Clear MFA token AFTER successful verification
      await client.query(
        `
      UPDATE authentication
      SET mfa_token = NULL,
          mfa_token_expiry = NULL
      WHERE customer_id = $1
      `,
        [body.customerId],
      );

      return {
        ok: true,
        message: 'MFA verification successful',
        customer: {
          customer_id: customer.customer_id,
          first_name: customer.first_name,
          last_name: customer.last_name,
          contact_number: customer.contact_number,
          address: customer.address,
          email: customer.email,
          date_created: customer.date_created,
          last_updated: customer.last_updated,
          status: customer.status,
          role: 'customer',
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      console.error('Error verifying MFA:', error);
      throw new InternalServerErrorException('Failed to verify MFA');
    }
  }

  @Post('verify-mfa-sms')
  async verifyMfaSms(@Body() body: { code?: string; customerId?: string }) {
    if (!body.code) throw new BadRequestException('code is required');
    if (!body.customerId)
      throw new BadRequestException('customerId is required');

    const client = this.databaseService.getClient();

    try {
      const userId = body.customerId;

      // Get latest unused mfa code for this user
      const codeResult = await client.query<{
        code: string;
        expires_at: string;
        code_id: string;
      }>(
        `SELECT code, expires_at, code_id FROM codes
         WHERE user_id = $1 AND purpose = 'mfa' AND used = false
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId],
      );

      if (!codeResult.rowCount) {
        throw new BadRequestException('No MFA code found for this account');
      }

      const record = codeResult.rows[0];
      const now = new Date();
      const expiresAt = new Date(record.expires_at);
      if (expiresAt < now) {
        throw new BadRequestException('Verification code has expired');
      }

      if (record.code !== String(body.code).trim()) {
        throw new BadRequestException(
          'The verification code you entered is incorrect.',
        );
      }

      // Mark code as used
      await client.query('UPDATE codes SET used = true WHERE code_id = $1', [
        record.code_id,
      ]);

      // Fetch user data to return after successful verification
      const userQuery = `SELECT customer_id, first_name, last_name, contact_number, address, email, date_created, last_updated, status FROM user_customer WHERE customer_id = $1`;

      const userResult = await client.query<UserRow>(userQuery, [userId]);
      if (!userResult.rowCount) throw new BadRequestException('User not found');

      const user = userResult.rows[0];
      const safeUser = {
        customer_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        contact_number: user.contact_number,
        address: user.address,
        email: user.email,
        date_created: user.date_created,
        last_updated: user.last_updated,
        status: user.status,
      };

      return {
        ok: true,
        message: 'MFA verification successful',
        user: safeUser,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error('Error verifying MFA SMS:', error);
      throw new InternalServerErrorException('Failed to verify MFA SMS');
    }
  }
}
