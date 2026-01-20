import { Client } from 'pg';

export async function createCameraLogsTable(client: Client) {
  await client.query(`
    DO $$
    BEGIN
      CREATE TYPE classification_type AS ENUM ('N/A', 'small', 'medium', 'large');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    $$;
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS camera_logs (
      camera_log_id uuid not null default gen_random_uuid (),
      machine_id uuid null,
      details text null,
      classification public.classification_type null default 'N/A'::classification_type,
      date_created timestamp with time zone null default now(),
      customer_id uuid null,
      constraint camera_logs_pkey primary key (camera_log_id),
      constraint camera_logs_customer_id_fkey foreign KEY (customer_id) references user_customer (customer_id) on delete set null,
      constraint camera_logs_machine_id_fkey foreign KEY (machine_id) references machines (machine_id) on delete set null
    );
  `);
}
