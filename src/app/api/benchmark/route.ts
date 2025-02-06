import {NextResponse} from 'next/server';
import {db} from '@/db';
import {benchmark} from '@/db/schema';
import {getBenchmarkWithClient, getAllBenchmarks} from '@/services/server/benchmark-service.server';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';

export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user) {
			return NextResponse.json({error: 'Unauthorized'}, {status: 401});
		}

		const benchmarks = await getAllBenchmarks();
		return NextResponse.json(benchmarks);
	} catch (error) {
		console.error('Error fetching benchmarks:', error);
		return NextResponse.json({error: 'Error fetching benchmarks'}, {status: 500});
	}
}

export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user) {
			return NextResponse.json({error: 'Unauthorized'}, {status: 401});
		}

		const json = await request.json();
		const {name, year, clientId, lang} = json;

		if (!name) {
			return NextResponse.json({error: 'Name is required'}, {status: 400});
		}

		if (!year) {
			return NextResponse.json({error: 'Year is required'}, {status: 400});
		}

		const [newBenchmark] = await db
			.insert(benchmark)
			.values({
				name,
				year,
				clientId,
				lang,
				userId: parseInt(session.user.id),
			})
			.returning();

		// Get the benchmark with client name
		const benchmarkWithClient = await getBenchmarkWithClient(newBenchmark.id);
		return NextResponse.json(benchmarkWithClient, {status: 201});
	} catch (error) {
		console.error('Error creating benchmark:', error);
		return NextResponse.json({error: 'Error creating benchmark'}, {status: 500});
	}
}
