import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomBytes, randomInt } from 'crypto';
import { OAuth2Client } from 'google-auth-library';

import { DatabaseService } from '../database/database.service';
import { BrevoService } from '../email/brevo.service';
import type {
  CheckEmailDto,
  ForgotPasswordDto,
  UserSignInDto,
  UserSignUpDto,
} from '../../controllers/user/user-auth.dto';
import { IprogSmsService } from '../iprogsms/iprogsms.service';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function generateRandomPassword(length = 12): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*()-_=+';
  const buf = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars[buf[i] % chars.length];
  }
  return out;
}

type UserPublicRow = {
  customer_id: string;
  first_name: string;
  last_name: string;
  contact_number: string | null;
  address: string | null;
  email: string;
  date_created: string;
  last_updated: string;
  status: string;
};

type UserDbRow = UserPublicRow & {
  password: string;
};

@Injectable()
export class UserAuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailer: BrevoService,
    private readonly iprogSms: IprogSmsService,
  ) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn(
        '⚠️  GOOGLE_CLIENT_ID not found in environment variables. Google Sign-In will not work.',
      );
    }
    this.googleClient = new OAuth2Client(clientId);
  }

  async checkEmail(dto: CheckEmailDto) {
    const email = dto?.email;
    const client = this.databaseService.getClient();

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const result = await client.query(
        'SELECT customer_id FROM user_customer WHERE email = $1 LIMIT 1',
        [normalizedEmail],
      );

      return {
        ok: true,
        available: result.rows.length === 0,
      };
    } catch {
      throw new InternalServerErrorException('Failed to check email');
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto?.email;
    const normalizedEmail = email.trim().toLowerCase();
    const client = this.databaseService.getClient();

    try {
      const userResult = await client.query<{
        customer_id: string;
        first_name: string;
        email: string;
      }>(
        `SELECT customer_id, first_name, email FROM user_customer WHERE email = $1 LIMIT 1`,
        [normalizedEmail],
      );

      if (!userResult.rowCount) {
        throw new NotFoundException('Account not found');
      }

      const user = userResult.rows[0];

      await client.query(
        'DELETE FROM user_password_resets WHERE customer_id = $1',
        [user.customer_id],
      );

      // Generate secure token
      const token = String(randomInt(100000, 1000000));

      await client.query(
        `INSERT INTO user_password_resets (customer_id, token, expires_at)
        VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
        [user.customer_id, token],
      );

      await this.mailer.sendPasswordResetLinkEmail(
        user.email,
        token,
        user.customer_id,
      );

      return {
        ok: true,
        message: 'Password reset link sent to your email',
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

  async signUp(dto: UserSignUpDto) {
    const firstname = dto?.firstname?.trim();
    const lastname = dto?.lastname?.trim();
    const emailRaw = dto?.email;
    const password = dto?.password;

    if (!firstname) {
      return {
        ok: false,
        error: 'firstname is required',
      };
    }
    if (!lastname) {
      return {
        ok: false,
        error: 'lastname is required',
      };
    }
    if (!emailRaw?.trim()) {
      return {
        ok: false,
        error: 'email is required',
      };
    }
    if (!password) {
      return {
        ok: false,
        error: 'password is required',
      };
    }

    if (
      !dto.emailVerificationCode ||
      !/^[0-9]{6}$/.test(String(dto.emailVerificationCode).trim())
    ) {
      throw new BadRequestException(
        'Email verification code is required and must be a 6-digit number',
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailRaw)) {
      return {
        ok: false,
        error: 'Invalid email format',
      };
    }

    const email = normalizeEmail(emailRaw);
    const contactNumber = dto?.contact?.trim() || null;
    const address = dto?.address?.trim() || null;

    if (contactNumber) {
      const phoneRegex = /^[\d\s\-+()]+$/;
      if (!phoneRegex.test(contactNumber)) {
        return {
          ok: false,
          error: 'Invalid phone number format',
        };
      }
    }

    const client = this.databaseService.getClient();

    const existingEmail = await client.query<{ customer_id: string }>(
      'SELECT customer_id FROM user_customer WHERE email = $1 LIMIT 1',
      [email],
    );

    if (existingEmail.rowCount && existingEmail.rowCount > 0) {
      throw new ConflictException('An account with this email already exists');
    }

    if (contactNumber) {
      const existingPhone = await client.query<{ customer_id: string }>(
        'SELECT customer_id FROM user_customer WHERE contact_number = $1 LIMIT 1',
        [contactNumber],
      );

      if (existingPhone.rowCount && existingPhone.rowCount > 0) {
        return {
          ok: false,
          error: 'A user account with this phone number already exists',
        };
      }
    }

    // Verify email verification code using codes table (same approach as password reset)
    try {
      const codeResult = await client.query<{
        code_id: string;
        code: string;
        expires_at: string;
      }>(
        `SELECT code_id, code, expires_at FROM codes
           WHERE code = $1 AND purpose = 'email_verification' AND used = false
           ORDER BY created_at DESC LIMIT 1`,
        [String(dto.emailVerificationCode).trim()],
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
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await client.query<UserPublicRow>(
      `INSERT INTO user_customer (first_name, last_name, contact_number, address, email, password)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING customer_id, first_name, last_name, contact_number, address, email, date_created, last_updated, status`,
      [firstname, lastname, contactNumber, address, email, passwordHash],
    );

    const user = created.rows[0];
    if (!user) {
      throw new InternalServerErrorException('Failed to create user account');
    }
    await client.query(
      `INSERT INTO authentication (
      customer_id,
      authentication_type,
      enabled,
      user_type
   )
   VALUES ($1, 'N/A', false, 'customer')
   ON CONFLICT (customer_id) DO NOTHING`,
      [user.customer_id],
    );
    return {
      ok: true,
      user,
    };
  }

  async signIn(dto: UserSignInDto) {
    const emailRaw = dto?.email;
    const password = dto?.password;

    if (!emailRaw?.trim()) throw new BadRequestException('email is required');
    if (!password) throw new BadRequestException('password is required');

    const email = normalizeEmail(emailRaw);
    const client = this.databaseService.getClient();

    const result = await client.query<UserDbRow>(
      `SELECT customer_id, first_name, last_name, contact_number, address, email, password, date_created, last_updated, status
       FROM user_customer
       WHERE email = $1
       LIMIT 1`,
      [email],
    );

    if (!result.rowCount) {
      return {
        ok: false,
        error: 'Account not found',
      };
    }

    const user = result.rows[0];

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return {
        ok: false,
        error: 'Wrong email or password',
      };
    }

    if (user.status !== 'active') {
      return {
        ok: false,
        error:
          user.status === 'banned'
            ? 'This admin account is banned'
            : 'This admin account is inactive',
      };
    }

    // Check if MFA is enabled for this admin
    const mfaResult = await client.query<{
      authentication_type: string;
      enabled: boolean;
    }>(
      `SELECT authentication_type, enabled FROM authentication WHERE customer_id = $1 LIMIT 1`,
      [user.customer_id],
    );
    if (
      mfaResult.rowCount &&
      mfaResult.rows[0].enabled &&
      mfaResult.rows[0].authentication_type === 'email'
    ) {
      // Generate MFA verification token
      const mfaToken = Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 16).toString(16),
      ).join('');

      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await client.query(
        `
        INSERT INTO authentication (
          customer_id,
          mfa_token,
          mfa_token_expiry,
          user_type,
          authentication_type,
          enabled
        )
        VALUES ($1, $2, $3, 'customer', 'email', true)
        ON CONFLICT (customer_id) DO UPDATE
        SET mfa_token = EXCLUDED.mfa_token,
            mfa_token_expiry = EXCLUDED.mfa_token_expiry,
            enabled = true,
            user_type = 'customer',
            authentication_type = 'email'
        `,
        [user.customer_id, mfaToken, tokenExpiry.toISOString()],
      );

      // Send verification email
      const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}verify-mfa?token=${mfaToken}&customerId=${user.customer_id}`;

      try {
        await this.mailer.sendMfaVerificationEmail(
          user.email,
          user.first_name,
          verificationLink,
        );
      } catch (err) {
        console.error('Failed to send MFA verification email:', err);
      }

      return {
        ok: true,
        requiresMFA: true,
        mfaType: 'email',
        message: 'MFA verification email sent',
        customerId: user.customer_id,
      };
    }

    if (
      mfaResult.rowCount &&
      mfaResult.rows[0].enabled &&
      mfaResult.rows[0].authentication_type === 'sms'
    ) {
      // Ensure admin has a contact number
      const phone = user.contact_number;
      if (!phone) {
        return {
          ok: false,
          error: 'No phone number on record for SMS verification',
        };
      }

      // Clear previous MFA codes for this user
      await client.query(
        `DELETE FROM codes WHERE user_id = $1 AND purpose = 'mfa' AND used = false`,
        [user.customer_id],
      );

      const code = String(Math.floor(100000 + Math.random() * 900000));

      await client.query(
        `INSERT INTO codes (user_id, code, purpose, expires_at)
           VALUES ($1, $2, 'mfa', NOW() + INTERVAL '10 minutes')`,
        [user.customer_id, code],
      );

      try {
        await this.iprogSms.sendSms({
          to: phone,
          body: `Your NutriBin verification code is: ${code}`,
        });
      } catch (smsErr) {
        console.error('Failed to send MFA SMS (admin):', smsErr);
      }

      return {
        ok: true,
        requiresMFA: true,
        mfaType: 'sms',
        message: 'MFA verification code sent via SMS',
        customerId: user.customer_id,
      };
    }

    const safeUser: UserPublicRow = {
      customer_id: user.customer_id,
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
      requiresMFA: false,
      mfaType: 'sms',
      message: 'MFA verification code sent via SMS',
      user: safeUser,
    };
  }

  async googleSignIn(credential: string) {
    try {
      const webClientId = process.env.GOOGLE_CLIENT_ID;
      const androidClientId = process.env.GOOGLE_ANDROID_CLIENT_ID;
      if (!webClientId || !androidClientId) {
        throw new Error('Google client IDs are not properly set');
      }

      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: [webClientId, androidClientId],
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const email = normalizeEmail(payload.email);
      // Note: firstName and lastName from Google payload are not used in sign-in, only in sign-up
      // const firstName = payload.given_name || '';
      // const lastName = payload.family_name || '';

      const client = this.databaseService.getClient();

      // Check if user exists in user table
      const result = await client.query<UserPublicRow>(
        `SELECT customer_id, first_name, last_name, contact_number, address, email, date_created, last_updated, status
         FROM user_customer
         WHERE email = $1
         LIMIT 1`,
        [email],
      );

      if (result.rowCount) {
        const user = result.rows[0];

        if (user.status !== 'active') {
          return {
            ok: false,
            error:
              user.status === 'banned'
                ? 'This user account is banned'
                : 'This user account is inactive',
          };
        }

        const safeUser = {
          customer_id: user.customer_id,
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
          user: safeUser,
        };
      }

      // Account not found - don't allow login
      return {
        ok: false,
        error:
          'No account found with this email. Please contact an administrator to create your account.',
      };
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }

  async googleSignUp(credential: string) {
    try {
      // Verify the Google token
      const webClientId = process.env.GOOGLE_CLIENT_ID;
      const androidClientId = process.env.GOOGLE_ANDROID_CLIENT_ID;
      if (!webClientId || !androidClientId) {
        throw new Error('Google client IDs are not properly set');
      }

      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: [webClientId, androidClientId],
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const email = normalizeEmail(payload.email);
      // Note: firstName and lastName are from Google payload but stored in DB with different names
      const firstName = payload.given_name || '';
      const lastName = payload.family_name || '';

      const client = this.databaseService.getClient();

      // Check if user already exists in user_user table
      const userResult = await client.query<UserPublicRow>(
        `SELECT customer_id FROM user_customer WHERE email = $1 LIMIT 1`,
        [email],
      );

      if (userResult.rowCount) {
        return {
          ok: false,
          error: 'A user account with this email already exists',
        };
      }

      // Generate a temporary password, hash it, and store the hash in DB
      const tempPassword = generateRandomPassword(12);
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      // Create new user account
      const newUser = await client.query<UserPublicRow>(
        `INSERT INTO user_customer (first_name, last_name, email, password)
         VALUES ($1, $2, $3, $4)
         RETURNING customer_id, first_name, last_name, contact_number, address, email, date_created, last_updated, status`,
        [
          firstName,
          lastName,
          email,
          passwordHash, // Empty password for Google sign-in users
        ],
      );

      const user = newUser.rows[0];
      if (!user) {
        throw new InternalServerErrorException('Failed to create user account');
      }

      // Email the temporary password to the new staff member
      try {
        await this.mailer.sendCustomerWelcomeWithPassword(
          email,
          firstName || '',
          tempPassword,
        );
      } catch (mailErr) {
        console.error('Failed to send welcome email with password:', mailErr);
        // don't block account creation if email sending fails; just log
      }

      const safeUser = {
        customer_id: user.customer_id,
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
        user: safeUser,
        newAccount: true,
      };
    } catch (error) {
      console.error('Google Sign-Up Error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create user account with Google',
      );
    }
  }

  async googleAuth(credential: string) {
    try {
      const webClientId = process.env.GOOGLE_CLIENT_ID;
      const androidClientId = process.env.GOOGLE_ANDROID_CLIENT_ID;
      if (!webClientId || !androidClientId) {
        throw new Error('Google client IDs are not properly set');
      }

      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: [webClientId, androidClientId],
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const email = normalizeEmail(payload.email);
      const firstName = payload.given_name || '';
      const lastName = payload.family_name || '';

      const client = this.databaseService.getClient();

      // Check if user exists in user table
      const result = await client.query<UserPublicRow>(
        `SELECT customer_id, first_name, last_name, contact_number, address, email, date_created, last_updated, status
       FROM user_customer
       WHERE email = $1
       LIMIT 1`,
        [email],
      );

      // User exists - sign in
      if (result.rowCount) {
        const user = result.rows[0];

        if (user.status !== 'active') {
          return {
            ok: false,
            error:
              user.status === 'banned'
                ? 'This user account is banned'
                : 'This user account is inactive',
          };
        }

        const safeUser = {
          customer_id: user.customer_id,
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
          user: safeUser,
          isNewUser: false,
        };
      }

      // User doesn't exist - sign up
      // Generate a temporary password, hash it, and store the hash in DB
      const tempPassword = generateRandomPassword(12);
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      // Create new user account
      const newUser = await client.query<UserPublicRow>(
        `INSERT INTO user_customer (first_name, last_name, email, password)
       VALUES ($1, $2, $3, $4)
       RETURNING customer_id, first_name, last_name, contact_number, address, email, date_created, last_updated, status`,
        [firstName, lastName, email, passwordHash],
      );

      const user = newUser.rows[0];
      if (!user) {
        throw new InternalServerErrorException('Failed to create user account');
      }

      // Email the temporary password to the new customer
      try {
        await this.mailer.sendCustomerWelcomeWithPassword(
          email,
          firstName || '',
          tempPassword,
        );
      } catch (mailErr) {
        console.error('Failed to send welcome email with password:', mailErr);
        // don't block account creation if email sending fails; just log
      }

      const safeUser = {
        customer_id: user.customer_id,
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
        user: safeUser,
        isNewUser: true,
      };
    } catch (error) {
      console.error('Google Auth Error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }

  async mobileSignIn(dto: UserSignInDto & { verificationCode?: string }) {
    const emailRaw = dto?.email;
    const password = dto?.password;
    const verificationCode = dto?.verificationCode;

    if (!emailRaw?.trim()) throw new BadRequestException('email is required');
    if (!password) throw new BadRequestException('password is required');

    const email = normalizeEmail(emailRaw);
    const client = this.databaseService.getClient();

    const result = await client.query<UserDbRow>(
      `SELECT customer_id, first_name, last_name, contact_number, address, email, password, date_created, last_updated, status
       FROM user_customer
       WHERE email = $1
       LIMIT 1`,
      [email],
    );

    if (!result.rowCount) {
      return {
        ok: false,
        error: 'Account not found',
      };
    }

    const user = result.rows[0];

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return {
        ok: false,
        error: 'Wrong email or password',
      };
    }

    if (user.status !== 'active') {
      return {
        ok: false,
        error:
          user.status === 'banned'
            ? 'This user account is banned'
            : 'This user account is inactive',
      };
    }

    // Check if MFA is enabled for this user
    const mfaResult = await client.query<{
      authentication_type: string;
      enabled: boolean;
    }>(
      `SELECT authentication_type, enabled FROM authentication WHERE customer_id = $1 LIMIT 1`,
      [user.customer_id],
    );

    // If MFA is enabled
    if (mfaResult.rowCount && mfaResult.rows[0].enabled) {
      const mfaType = mfaResult.rows[0].authentication_type;

      // If verification code is not provided, we need to send one
      if (!verificationCode) {
        if (mfaType === 'email') {
          // Clear previous MFA codes for this user
          await client.query(
            `DELETE FROM codes WHERE user_id = $1 AND purpose = 'mfa' AND used = false`,
            [user.customer_id],
          );

          const code = String(randomInt(100000, 1000000));

          await client.query(
            `INSERT INTO codes (user_id, code, purpose, expires_at)
             VALUES ($1, $2, 'mfa', NOW() + INTERVAL '15 minutes')`,
            [user.customer_id, code],
          );

          try {
            await this.mailer.sendUserVerificationCode(user.email, code);
          } catch (emailErr) {
            console.error('Failed to send MFA email:', emailErr);
            throw new InternalServerErrorException(
              'Failed to send verification email',
            );
          }

          return {
            ok: true,
            requiresMFA: true,
            mfaType: 'email',
            message: 'MFA verification code sent to your email',
            customerId: user.customer_id,
          };
        }

        if (mfaType === 'sms') {
          const phone = user.contact_number;
          if (!phone) {
            return {
              ok: false,
              error: 'No phone number on record for SMS verification',
            };
          }

          await client.query(
            `DELETE FROM codes WHERE user_id = $1 AND purpose = 'mfa' AND used = false`,
            [user.customer_id],
          );

          const code = String(randomInt(100000, 1000000));

          await client.query(
            `INSERT INTO codes (user_id, code, purpose, expires_at)
             VALUES ($1, $2, 'mfa', NOW() + INTERVAL '15 minutes')`,
            [user.customer_id, code],
          );

          try {
            await this.iprogSms.sendSms({
              to: phone,
              body: `Your NutriBin verification code is: ${code}`,
            });
          } catch (smsErr) {
            console.error('Failed to send MFA SMS:', smsErr);
            throw new InternalServerErrorException(
              'Failed to send verification SMS',
            );
          }

          return {
            ok: true,
            requiresMFA: true,
            mfaType: 'sms',
            message: 'MFA verification code sent via SMS',
            customerId: user.customer_id,
          };
        }
      }

      // If verification code is provided, verify it
      if (verificationCode) {
        // Verify the code (works for both email and SMS)
        const codeResult = await client.query<{
          code: string;
          expires_at: string;
          code_id: string;
        }>(
          `SELECT code, expires_at, code_id FROM codes
           WHERE user_id = $1 AND purpose = 'mfa' AND used = false
           ORDER BY created_at DESC
           LIMIT 1`,
          [user.customer_id],
        );

        if (!codeResult.rowCount) {
          return {
            ok: false,
            error: 'No verification code found. Please request a new code.',
          };
        }

        const record = codeResult.rows[0];
        const now = new Date();
        const expiresAt = new Date(record.expires_at);

        if (expiresAt < now) {
          return {
            ok: false,
            error: 'Verification code has expired',
          };
        }

        if (record.code !== String(verificationCode).trim()) {
          return {
            ok: false,
            error: 'The verification code you entered is incorrect.',
          };
        }

        // Mark code as used
        await client.query('UPDATE codes SET used = true WHERE code_id = $1', [
          record.code_id,
        ]);

        // Code is valid, proceed with sign-in
        const safeUser: UserPublicRow = {
          customer_id: user.customer_id,
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
          requiresMFA: false,
          user: safeUser,
        };
      }
    }

    // No MFA enabled, sign in directly
    const safeUser: UserPublicRow = {
      customer_id: user.customer_id,
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
      requiresMFA: false,
      user: safeUser,
    };
  }
}
