import { Client } from 'pg';

export async function createAuthenticationTable(client: Client) {
  await client.query(`
    DO $$
    BEGIN
      CREATE TYPE authentication_type AS ENUM ('N/A', 'email', 'sms');
      CREATE TYPE user_type AS ENUM ('N/A', 'staff', 'admin', 'customer');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    $$;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS authentication (
      authentication_id uuid not null default gen_random_uuid (),
      staff_id text null,
      admin_id text null,
      user_type public.user_type null default 'N/A'::user_type,
      authentication_type public.authentication_type null default 'N/A'::authentication_type,
      enabled boolean null default false,
      mfa_token character varying(256) null,
      mfa_token_expiry timestamp with time zone null,
      date_created timestamp with time zone null default now(),
      customer_id uuid null,
      constraint authentication_pkey primary key (authentication_id),
      constraint unique_admin_id unique (admin_id),
      constraint unique_staff_id unique (staff_id),
      constraint authentication_customer_id_fkey foreign KEY (customer_id) references user_customer (customer_id) on delete set null
    );
  `);
}
