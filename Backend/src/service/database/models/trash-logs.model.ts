import { Client } from 'pg';

export async function createTrashLogsTable(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS trash_logs (
      log_id uuid not null default gen_random_uuid (),
      machine_id uuid null,
      customer_id uuid null,
      nitrogen text null,
      phosphorus text null,
      potassium text null,
      moisture text null,
      humidity text null,
      temperature text null,
      ph text null,
      date_created timestamp with time zone null default now(),
      constraint trash_logs_pkey primary key (log_id),
      constraint trash_logs_customer_id_fkey foreign KEY (customer_id) references user_customer (customer_id),
      constraint trash_logs_machine_id_fkey foreign KEY (machine_id) references machines (machine_id) on delete set null
    );
  `);
}
