import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { DatabaseService } from '../../service/database/database.service';
import type { UserSignInDto, UserSignUpDto } from '../../controllers/staff/user-auth.dto';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

type UserPublicRow = {
  customer_id: string;
  f_name: string;
  l_name: string;
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
  constructor(private readonly databaseService: DatabaseService) {}

  async signUp(dto: UserSignUpDto) {
    const fName = dto?.fName?.trim();
    const lName = dto?.lName?.trim();
    const emailRaw = dto?.email;
    const password = dto?.password;

    if (!fName) throw new BadRequestException('fName is required');
    if (!lName) throw new BadRequestException('lName is required');
    if (!emailRaw?.trim()) throw new BadRequestException('email is required');
    if (!password) throw new BadRequestException('password is required');

    const email = normalizeEmail(emailRaw);
    const contactNumber = dto?.contactNumber?.trim() || null;
    const address = dto?.address?.trim() || null;

    const client = this.databaseService.getClient();

    const existing = await client.query<{ customer_id: string }>(
      'SELECT customer_id FROM user_customer WHERE email = $1 LIMIT 1',
      [email],
    );

    if (existing.rowCount && existing.rowCount > 0) {
      throw new ConflictException(
        'A user account with this email already exists',
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await client.query<UserPublicRow>(
      `INSERT INTO user_customer (f_name, l_name, contact_number, address, email, password)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING customer_id, f_name, l_name, contact_number, address, email, date_created, last_updated, status`,
      [fName, lName, contactNumber, address, email, passwordHash],
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
      `SELECT customer_id, f_name, l_name, contact_number, address, email, password, date_created, last_updated, status
       FROM user_customer
       WHERE email = $1
       LIMIT 1`,
      [email],
    );

    if (!result.rowCount) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = result.rows[0];
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const safeUser: UserPublicRow = {
      customer_id: user.customer_id,
      f_name: user.f_name,
      l_name: user.l_name,
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
