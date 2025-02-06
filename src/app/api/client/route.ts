import {NextResponse} from 'next/server';
import {getAllClients, createClient} from '@/services/server/client-service.server';

export async function GET() {
	try {
		const clients = await getAllClients();
		return NextResponse.json(clients);
	} catch (error) {
		console.error('Error fetching clients:', error);
		return NextResponse.json({error: 'Error fetching clients'}, {status: 500});
	}
}

export async function POST(request: Request) {
	try {
		const data = await request.json();
		const client = await createClient(data);
		return NextResponse.json(client);
	} catch (error) {
		console.error('Error creating client:', error);
		return NextResponse.json({error: 'Error creating client'}, {status: 500});
	}
}
