import { Client } from 'pg';

export async function createModuleAnalyticsTable(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS module_analytics (
      module_analytics_id uuid not null default gen_random_uuid (),
      customer_id uuid null,
      esp32 boolean null default true,
      arduino_q boolean null default true,
      arduino_r3 boolean null default true,
      ultrasonic boolean null default true,
      reed boolean null default true,
      moisture boolean null default true,
      temperature boolean null default true,
      humidity boolean null default true,
      gas boolean null default true,
      ph boolean null default true,
      npk boolean null default true,
      camera_1 boolean null default true,
      camera_2 boolean null default true,
      stepper_motor boolean null default true,
      heating_pad boolean null default true,
      exhaust_fan boolean null default true,
      dc_motor boolean null default true,
      grinder_motor boolean null default true,
      power_supply boolean null default true,
      servo_motor boolean null default true,
      date_created timestamp with time zone null default now(),
      machine_id uuid null,
      constraint module_analytics_pkey primary key (module_analytics_id),
      constraint module_analytics_customer_id_fkey foreign KEY (customer_id) references user_customer (customer_id) on delete set null,
      constraint module_analytics_machine_id_fkey foreign KEY (machine_id) references machines (machine_id)
    );
  `);
}
