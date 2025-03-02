import type {ClientBase} from '@/db/schema';
import type {ClientSchemaType} from '@/lib/client';

type APIResponse<T> = {
	error?: string;
} & T;

export async function getAllClients(): Promise<ClientBase[]> {
	const response = await fetch('/api/client');
	const data = (await response.json()) as APIResponse<{clients: ClientBase[]}>;

	if (!response.ok) {
		throw new Error(data.error || 'Failed to fetch clients');
	}

	return data.clients;
}

export async function createClient(data: ClientSchemaType): Promise<ClientBase> {
	const response = await fetch('/api/client', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(data),
	});

	const responseData = (await response.json()) as APIResponse<{client: ClientBase}>;

	if (!response.ok) {
		throw new Error(responseData.error || 'Failed to create client');
	}

	return responseData.client;
}

export async function getClientById(id: number): Promise<ClientBase> {
	const response = await fetch(`/api/client/${id}`);
	const data = (await response.json()) as APIResponse<{client: ClientBase}>;

	if (!response.ok) {
		throw new Error(data.error || 'Failed to fetch client');
	}

	return data.client;
}

export async function updateClient(id: number, data: Partial<ClientSchemaType>): Promise<ClientBase> {
	const response = await fetch(`/api/client/${id}`, {
		method: 'PUT',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(data),
	});

	const responseData = (await response.json()) as APIResponse<{client: ClientBase}>;

	if (!response.ok) {
		throw new Error(responseData.error || 'Failed to update client');
	}

	return responseData.client;
}

export async function deleteClient(id: number): Promise<ClientBase> {
	const response = await fetch(`/api/client/${id}`, {
		method: 'DELETE',
	});

	const data = (await response.json()) as APIResponse<{client: ClientBase}>;

	if (!response.ok) {
		throw new Error(data.error || 'Failed to delete client');
	}

	return data.client;
}
