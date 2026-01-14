import { Client } from 'pg';

export async function createAuthenticationTable(client: Client) {
  await client.query(`
    DO $$
    BEGIN
      CREATE TYPE authentication_type AS ENUM ('N/A', 'email', 'sms');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    $$;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS authentication (
      authentication_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id uuid NOT NULL,
      authentication_type authentication_type DEFAULT 'N/A',
      enabled boolean DEFAULT false,
      date_created timestamptz DEFAULT now(),
      mfa_token varchar(256),
      mfa_token_expiry timestamptz,
      CONSTRAINT authentication_customer_unique UNIQUE (customer_id),
      CONSTRAINT authentication_customer_fk
        FOREIGN KEY (customer_id)
        REFERENCES user_customer(customer_id)
        ON DELETE CASCADE
    );
  `);
}
