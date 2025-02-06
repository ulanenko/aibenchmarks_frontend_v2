'use server';

import {db} from '@/db';
import {client} from '@/db/schema';
import type {ClientSchemaType} from '@/lib/client';

export async function getAllClients() {
	return db.select().from(client);
}

export async function createClient(data: ClientSchemaType) {
	const [newClient] = await db.insert(client).values(data).returning();
	return newClient;
}
