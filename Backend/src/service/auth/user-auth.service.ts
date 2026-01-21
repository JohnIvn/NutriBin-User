import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { OAuth2Client } from 'google-auth-library';

import { DatabaseService } from '../database/database.service';
import { BrevoService } from '../email/brevo.service';
import type {
  CheckEmailDto,
  UserSignInDto,
  UserSignUpDto,
} from '../../controllers/user/user-auth.dto';

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
      const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-mfa?token=${mfaToken}&customerId=${user.customer_id}`;
      const emailContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Login</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #FFF5E4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFF5E4; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #CD5C08 0%, #A34906 100%); padding: 30px 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 1px;">NutriBin</h1>
                      <p style="margin: 8px 0 0 0; color: #FFF5E4; font-size: 14px; font-weight: 500;">Multi-Factor Authentication</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px; color: #333333; font-size: 16px; line-height: 1.6;">
                      <h2 style="margin: 0 0 20px 0; color: #CD5C08; font-size: 24px;">Verify Your Login 🔐</h2>
                      <p style="margin: 0 0 15px 0;">Hello <strong>${user.first_name}</strong>,</p>
                      <p style="margin: 0 0 20px 0;">A login attempt was made to your NutriBin account. To complete the sign-in process, please verify your identity by clicking the button below.</p>
                      <div style="text-align: center; margin: 35px 0;">
                        <a href="${verificationLink}" style="display: inline-block; background-color: #CD5C08; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 6px rgba(205, 92, 8, 0.3);">Verify Login</a>
                      </div>
                      <div style="background-color: #FFF5E4; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #CD5C08;">⏱️ Time Sensitive</p>
                        <p style="margin: 0; color: #666; font-size: 14px;">This verification link will expire in <strong>24 hours</strong>.</p>
                      </div>
                      <div style="background-color: #FFF9F0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFA500;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #FF8800;">⚠️ Security Alert</p>
                        <p style="margin: 0; color: #666; font-size: 14px;">If you didn't attempt to log in, please ignore this email and ensure your account password is secure.</p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #FFF5E4; padding: 30px 40px; text-align: center; border-top: 2px solid #CD5C08;">
                      <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;"><strong>NutriBin</strong> - Smart Nutrition Management</p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
                      <p style="margin: 15px 0 0 0; color: #999999; font-size: 12px;">© ${new Date().getFullYear()} NutriBin. All rights reserved.</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
      await this.mailer.sendHtmlEmail(
        user.email,
        'NutriBin - Verify Your Login',
        emailContent,
      );

      return {
        ok: true,
        requiresMFA: true,
        message: 'MFA verification email sent',
        userId: user.customer_id,
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
      user: safeUser,
    };
  }

  async googleSignIn(credential: string) {
    try {
      // Verify the Google token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
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
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
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
}
