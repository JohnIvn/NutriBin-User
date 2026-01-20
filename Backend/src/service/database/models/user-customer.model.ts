import { Client } from 'pg';

export async function createUserCustomerTable(client: Client) {
  await client.query(`
    DO $$
    BEGIN
      CREATE TYPE user_customer_status AS ENUM ('active', 'inactive', 'banned');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    $$;
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS user_customer (
      customer_id uuid not null default gen_random_uuid (),
      machine_id text null,
      first_name text not null,
      last_name text not null,
      contact_number text null,
      address text null,
      email text not null,
      password text not null,
      date_created timestamp with time zone null default now(),
      last_updated timestamp with time zone null default now(),
      status public.user_customer_status null default 'active'::user_customer_status,
      constraint user_customer_pkey primary key (customer_id),
      constraint user_customer_contact_number_key unique (contact_number),
      constraint user_customer_email_key unique (email)
    );
  `);
}
