import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './secondarySchema';

// Secondary database connection string
const SECONDARY_DB_URI =
	'postgresql://postgres2.jdogtbveorrkbjqgjmxa:dfhfgh2324sS@aws-0-eu-central-1.pooler.supabase.com:5432/postgres';

// Connection for queries to the secondary database
const secondaryClient = postgres(SECONDARY_DB_URI, {
	ssl: 'require',
	max: 5,
	idle_timeout: 30,
	connect_timeout: 10,
});

// Create drizzle instance with the schema
export const secondaryDb = drizzle(secondaryClient, {schema});

// Test connection
export const testSecondaryDbConnection = async () => {
	try {
		// Simple query to check connection
		const result = await secondaryClient`SELECT 1 as connection_test`;
		console.log('Secondary database connection successful:', result[0].connection_test === 1);
		return true;
	} catch (error) {
		console.error('Unable to connect to the secondary database:', error);
		return false;
	}
};
