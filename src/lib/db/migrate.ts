import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function main() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error('DATABASE_URL/POSTGRES_URL not set');
  const client = postgres(url, { max: 1 });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: './drizzle/migrations' });
  await client.end();
  console.log('✅ Migrations applied');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
