import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

import { DatabaseService } from '../database/database.service';
import { NodemailerService } from '../email/nodemailer.service';
import type {
  UserSignInDto,
  UserSignUpDto,
} from '../../controllers/user/user-auth.dto';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
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
    private readonly mailer: NodemailerService,
  ) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn(
        '⚠️  GOOGLE_CLIENT_ID not found in environment variables. Google Sign-In will not work.',
      );
    }
    this.googleClient = new OAuth2Client(clientId);
  }

  async signUp(dto: UserSignUpDto) {
    const firstname = dto?.firstname?.trim();
    const lastname = dto?.lastname?.trim();
    const emailRaw = dto?.email;
    const password = dto?.password;
    const birthday = dto?.birthday;
    const age = dto?.age;

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
      throw new ConflictException(
        'An account with this email already exists',
      );
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

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await client.query<UserPublicRow>(
      `INSERT INTO user_customer (first_name, last_name, birthday, age, contact_number, address, email, password)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING customer_id, first_name, last_name, contact_number, address, email, date_created, last_updated, status`,
      [
        firstname,
        lastname,
        birthday,
        age,
        contactNumber,
        address,
        email,
        passwordHash,
      ],
    );

    const user = created.rows[0];
    if (!user) {
      throw new InternalServerErrorException('Failed to create staff account');
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
        error: 'Wrong password',
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
}
