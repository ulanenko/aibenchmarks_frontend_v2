import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Fix for Supabase connection string requiring SSL and proper encoding
const connectionString = process.env.DATABASE_URL!;

// Connection for queries
const client = postgres(connectionString, {
	ssl: 'require',
	max: 1,
});

export const db = drizzle(client, {schema});
