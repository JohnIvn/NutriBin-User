import { Client } from 'pg';

export async function createMachinesTable(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS machines (
      machine_id uuid not null default gen_random_uuid (),
      customer_id uuid null,
      is_active boolean null default true,
      c1 boolean null default false,
      c2 boolean null default false,
      c3 boolean null default false,
      c4 boolean null default false,
      c5 boolean null default false,
      s1 boolean null default false,
      s2 boolean null default false,
      s3 boolean null default false,
      s4 boolean null default false,
      s5 boolean null default false,
      s6 boolean null default false,
      s7 boolean null default false,
      s8 boolean null default false,
      s9 boolean null default false,
      m1 boolean null default false,
      m2 boolean null default false,
      m3 boolean null default false,
      m4 boolean null default false,
      m5 boolean null default false,
      m6 boolean null default false,
      m7 boolean null default false,
      date_created timestamp with time zone null default now(),
      constraint machines_pkey primary key (machine_id),
      constraint machines_user_id_fkey foreign KEY (customer_id) references user_customer (customer_id) on delete set null
    );
  `);
}
