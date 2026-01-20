import { Client } from 'pg';

export async function createFertilizerAnalyticsTable(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS fertilizer_analytics (
      fertilizer_analytics_id uuid not null default gen_random_uuid (),
      customer_id uuid null,
      nitrogen text null,
      phosphorus text null,
      potassium text null,
      temperature text null,
      ph text null,
      humidity text null,
      moisture text null,
      methane text null,
      hydrogen text null,
      smoke text null,
      benzene text null,
      date_created timestamp with time zone null default now(),
      machine_id uuid null,
      constraint fertilizer_analytics_pkey primary key (fertilizer_analytics_id),
      constraint fertilizer_analytics_customer_id_fkey foreign KEY (customer_id) references user_customer (customer_id) on delete set null,
      constraint fertilizer_analytics_machine_id_fkey foreign KEY (machine_id) references machines (machine_id)
    );
  `);
}
