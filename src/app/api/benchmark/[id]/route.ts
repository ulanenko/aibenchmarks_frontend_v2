import {NextRequest, NextResponse} from 'next/server';
import {db} from '@/db';
import {benchmark} from '@/db/schema';
import {eq} from 'drizzle-orm';
import {getBenchmarkWithClient} from '@/services/server/benchmark-service.server';

type RouteContext = {
	params: {
		id: string;
	};
};

export async function PUT(request: NextRequest, context: RouteContext) {
	try {
		const id = Number(context.params.id);
		const json = await request.json();
		const {name, year, clientId, lang} = json;

		if (!name) {
			return NextResponse.json({error: 'Name is required'}, {status: 400});
		}

		if (!year) {
			return NextResponse.json({error: 'Year is required'}, {status: 400});
		}

		const [updatedBenchmark] = await db
			.update(benchmark)
			.set({
				name,
				year,
				clientId,
				lang,
				updatedAt: new Date(),
			})
			.where(eq(benchmark.id, id))
			.returning();

		if (!updatedBenchmark) {
			return NextResponse.json({error: 'Benchmark not found'}, {status: 404});
		}

		const benchmarkWithClient = await getBenchmarkWithClient(id);
		return NextResponse.json(benchmarkWithClient, {status: 200});
	} catch (error) {
		console.error('Error updating benchmark:', error);
		return NextResponse.json({error: 'Error updating benchmark'}, {status: 500});
	}
}

export async function DELETE(request: NextRequest, context: RouteContext) {
	try {
		const id = Number(context.params.id);
		const [deletedBenchmark] = await db.delete(benchmark).where(eq(benchmark.id, id)).returning();

		if (!deletedBenchmark) {
			return NextResponse.json({error: 'Benchmark not found'}, {status: 404});
		}

		return NextResponse.json(deletedBenchmark, {status: 200});
	} catch (error) {
		console.error('Error deleting benchmark:', error);
		return NextResponse.json({error: 'Error deleting benchmark'}, {status: 500});
	}
}
