import type {ClientBase} from '@/db/schema';
import type {ClientSchemaType} from '@/lib/client';

export async function getAllClients(): Promise<ClientBase[]> {
	const response = await fetch('/api/client');

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to fetch clients');
	}

	return response.json();
}

export async function createClient(data: ClientSchemaType): Promise<ClientBase> {
	const response = await fetch('/api/client', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to create client');
	}

	return response.json();
}
