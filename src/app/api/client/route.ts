import {NextRequest, NextResponse} from 'next/server';
import {client} from '@/db/schema';
import type {ClientSchemaType} from '@/lib/client';
import * as clientService from '@/services/server/client-service.server';

type ClientDBType = typeof client.$inferSelect;

export async function GET(request: NextRequest): Promise<NextResponse<{error: string} | {clients: ClientDBType[]}>> {
	try {
		const clients = await clientService.getAllClients();
		return NextResponse.json({clients}, {status: 200});
	} catch (error) {
		console.error('Error fetching clients:', error);
		return NextResponse.json(
			{error: error instanceof Error ? error.message : 'Failed to fetch clients'},
			{status: 500},
		);
	}
}

export async function POST(request: NextRequest): Promise<NextResponse<{error: string} | {client: ClientDBType}>> {
	try {
		const data = (await request.json()) as ClientSchemaType;

		if (!data.name) {
			return NextResponse.json({error: 'Name is required'}, {status: 400});
		}

		const client = await clientService.createClient(data);

		if (!client) {
			return NextResponse.json({error: 'Failed to create client'}, {status: 500});
		}

		return NextResponse.json({client}, {status: 201});
	} catch (error) {
		console.error('Error creating client:', error);
		return NextResponse.json(
			{error: error instanceof Error ? error.message : 'Failed to create client'},
			{status: 500},
		);
	}
}
