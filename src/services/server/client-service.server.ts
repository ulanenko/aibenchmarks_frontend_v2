'use server';

import {db} from '@/db';
import {client} from '@/db/schema';
import type {ClientSchemaType} from '@/lib/client';
import {eq} from 'drizzle-orm';

type ClientDBType = typeof client.$inferSelect;

export async function getAllClients(): Promise<ClientDBType[]> {
	return await db.select().from(client);
}

export async function createClient(data: ClientSchemaType): Promise<ClientDBType | null> {
	const [newClient] = await db.insert(client).values(data).returning();

	return newClient || null;
}

export async function getClientById(id: number): Promise<ClientDBType | null> {
	const [foundClient] = await db.select().from(client).where(eq(client.id, id));

	return foundClient || null;
}

export async function updateClient(id: number, data: Partial<ClientSchemaType>): Promise<ClientDBType | null> {
	const [updatedClient] = await db
		.update(client)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(client.id, id))
		.returning();

	return updatedClient || null;
}

export async function deleteClient(id: number): Promise<ClientDBType | null> {
	const [deletedClient] = await db.delete(client).where(eq(client.id, id)).returning();

	return deletedClient || null;
}
