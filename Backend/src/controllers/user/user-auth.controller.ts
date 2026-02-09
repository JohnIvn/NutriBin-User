import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { UserAuthService } from '../../service/auth/user-auth.service';
import * as bcrypt from 'bcryptjs';
import type {
  UserSignInDto,
  UserSignUpDto,
  GoogleSignInDto,
  ForgotPasswordDto,
} from './user-auth.dto';
import { randomInt, randomUUID } from 'crypto';
import { DatabaseService } from '../../service/database/database.service';
import { BrevoService } from '../../service/email/brevo.service';
import { Throttle } from '@nestjs/throttler';

@Controller('user')
export class UserAuthController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailer: BrevoService,
    private readonly userAuthService: UserAuthService,
  ) {}

  @Get('check-email/:email')
  async checkEmailAvailability(@Param('email') email: string) {
    console.log(email);
    if (!email) {
      throw new BadRequestException('Request body is required');
    }

    return this.userAuthService.checkEmail({ email });
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    console.log(body);
    if (!body) {
      throw new BadRequestException('Request body is required');
    }

    return this.userAuthService.forgotPassword(body);
  }

  @Post('signup')
  async signUp(@Body() body: UserSignUpDto) {
    console.log(body);
    if (!body) {
      throw new BadRequestException('Request body is required');
    }

    return this.userAuthService.signUp(body);
  }

  @Post('signin')
  @Throttle({ default: { limit: 3, ttl: 60 } })
  async signIn(@Body() body: UserSignInDto) {
    if (!body) {
      throw new BadRequestException('Request body is required');
    }

    return this.userAuthService.signIn(body);
  }

  @Post('google-signin')
  async googleSignIn(@Body() body: GoogleSignInDto) {
    if (!body || !body.credential) {
      throw new BadRequestException('Google credential is required');
    }

    return this.userAuthService.googleSignIn(body.credential);
  }

  @Post('google-signup')
  async googleSignUp(@Body() body: GoogleSignInDto) {
    if (!body || !body.credential) {
      throw new BadRequestException('Google credential is required');
    }

    return this.userAuthService.googleSignUp(body.credential);
  }

  @Post('google-auth')
  async googleAuthenticate(@Body() body: GoogleSignInDto) {
    if (!body || !body.credential) {
      throw new BadRequestException('Google credential is required');
    }

    return this.userAuthService.googleAuth(body.credential);
  }

  @Post('email-verification')
  async sendEmailVerificationForSignup(
    @Body('newEmail') newEmail: string,
    @Body('type') type: string,
  ) {
    const client = this.databaseService.getClient();

    if (!newEmail?.trim()) {
      throw new BadRequestException('Email is required');
    }

    const normalizedEmail = newEmail.trim().toLowerCase();

    try {
      // Ensure email is not already used
      if (!type || type === '') {
        const existingEmail = await client.query(
          'SELECT customer_id FROM user_customer WHERE email = $1 LIMIT 1',
          [normalizedEmail],
        );

        if (existingEmail.rowCount) {
          throw new ConflictException('Email already exists');
        }
      }

      const code = String(randomInt(100000, 1000000));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // For non-existing users, generate a transient user id so code can be stored
      const userId = randomUUID();

      await client.query(
        `INSERT INTO codes (user_id, code, purpose, expires_at, used)
         VALUES ($1, $2, $3, $4, false)`,
        [userId, code, 'email_verification', expiresAt],
      );

      await this.mailer.sendUserVerificationCode(normalizedEmail, code);

      return {
        ok: true,
        message: 'Verification code sent to the email address',
        code: code.toString(),
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to send verification code',
      );
    }
  }

  @Post('send-verification')
  async sendEmailVerification(@Body('email') email: string) {
    try {
      let userId;
      if (!email?.trim()) {
        throw new BadRequestException('Email is required');
      }
      const client = this.databaseService.getClient();

      const normalizedEmail = email.trim().toLowerCase();
      const code = String(randomInt(100000, 1000000));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const customer = await client.query<{
        customer_id: string;
      }>(`SELECT customer_id FROM user_customer WHERE email=$1`, [email]);

      if (customer?.rowCount && customer.rowCount > 0) {
        const customer_id = customer.rows[0].customer_id;
        userId = customer_id;
      } else {
        userId = randomUUID();
      }

      await client.query(
        `INSERT INTO codes (user_id, code, purpose, expires_at, used)
        VALUES ($1, $2, $3, $4, false)`,
        [userId, code, 'email_verification', expiresAt],
      );

      await this.mailer.sendUserVerificationCode(normalizedEmail, code);

      return {
        ok: true,
        message: 'Verification code sent to the email address',
        code: code.toString(),
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to send verification code',
      );
    }
  }

  @Post('verify-email')
  async verifyEmail(@Body('verificationCode') verificationCode: string) {
    try {
      const client = this.databaseService.getClient();

      const codeResult = await client.query<{
        code_id: string;
        code: string;
        expires_at: string;
      }>(
        `SELECT code_id, code, expires_at FROM codes
           WHERE code = $1 AND purpose = 'email_verification' AND used = false
           ORDER BY created_at DESC LIMIT 1`,
        [String(verificationCode).trim()],
      );

      if (!codeResult.rowCount) {
        throw new BadRequestException('Invalid or expired verification code');
      }

      const record = codeResult.rows[0];
      const now = new Date();
      const expiresAt = new Date(record.expires_at);
      if (expiresAt < now) {
        throw new BadRequestException('Verification code has expired');
      }

      // mark code as used
      await client.query('UPDATE codes SET used = true WHERE code_id = $1', [
        record.code_id,
      ]);

      // If no error found
      return {
        ok: true,
        message: 'Successful Verification',
      };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw err;
    }
  }
  @Post('verify-sms')
  async verifySms(@Body('verificationCode') verificationCode: string) {
    try {
      const client = this.databaseService.getClient();

      const codeResult = await client.query<{
        code_id: string;
        code: string;
        expires_at: string;
      }>(
        `SELECT code_id, code, expires_at FROM codes
           WHERE code = $1 AND purpose = 'sms_verification' AND used = false
           ORDER BY created_at DESC LIMIT 1`,
        [String(verificationCode).trim()],
      );

      if (!codeResult.rowCount) {
        throw new BadRequestException('Invalid or expired verification code');
      }

      const record = codeResult.rows[0];
      const now = new Date();
      const expiresAt = new Date(record.expires_at);
      if (expiresAt < now) {
        throw new BadRequestException('Verification code has expired');
      }

      // mark code as used
      await client.query('UPDATE codes SET used = true WHERE code_id = $1', [
        record.code_id,
      ]);

      // If no error found
      return {
        ok: true,
        message: 'Successful Verification',
      };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw err;
    }
  }

  @Patch('update-password')
  async updatePassword(
    @Body('email') email: string,
    @Body('newPassword') newPassword: string,
  ) {
    if (!email || !newPassword) {
      throw new BadRequestException(
        'email, newPassword, and verificationCode are required',
      );
    }

    const client = this.databaseService.getClient();

    try {
      const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);

      const updateResult = await client.query<{
        customer_id: string;
        email: string;
      }>(
        `UPDATE user_customer
        SET password = $1, last_updated = now()
        WHERE email = $2
        RETURNING customer_id, email`,
        [hashedPassword, email.trim().toLowerCase()],
      );

      if (!updateResult.rowCount) {
        throw new NotFoundException('Account not found with this email');
      }

      return {
        ok: true,
        message: 'Password updated successfully',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update password');
    }
  }

  @Post('mobile-signin')
  async mobileSignIn(
    @Body() body: UserSignInDto & { verificationCode?: string },
  ) {
    if (!body) {
      throw new BadRequestException('Request body is required');
    }

    return this.userAuthService.mobileSignIn(body);
  }
}
