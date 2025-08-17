import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Create the database connection
const connectionString = process.env.DATABASE_URL!;

// Create postgres pool
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Create drizzle database instance
export const db = drizzle({ client: pool, schema });

export { schema };