import {NextRequest, NextResponse} from 'next/server';
import type {BenchmarkDTO} from '@/lib/benchmark/type';
import * as benchmarkService from '@/services/server/benchmark-service.server';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';

export async function GET(request: NextRequest): Promise<NextResponse<{error: string} | {benchmarks: BenchmarkDTO[]}>> {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user) {
			return NextResponse.json({error: 'Unauthorized'}, {status: 401});
		}

		const benchmarks = await benchmarkService.getAllBenchmarks();
		return NextResponse.json({benchmarks}, {status: 200});
	} catch (error) {
		console.error('Error fetching benchmarks:', error);
		return NextResponse.json(
			{error: error instanceof Error ? error.message : 'Error fetching benchmarks'},
			{status: 500},
		);
	}
}

export async function POST(request: NextRequest): Promise<NextResponse<{error: string} | {benchmark: BenchmarkDTO}>> {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user) {
			return NextResponse.json({error: 'Unauthorized'}, {status: 401});
		}

		const data = await request.json();

		if (!data.name) {
			return NextResponse.json({error: 'Name is required'}, {status: 400});
		}

		if (!data.year) {
			return NextResponse.json({error: 'Year is required'}, {status: 400});
		}

		const newBenchmark = await benchmarkService.createBenchmark(data, parseInt(session.user.id));

		if (!newBenchmark) {
			return NextResponse.json({error: 'Failed to create benchmark'}, {status: 500});
		}

		return NextResponse.json({benchmark: newBenchmark}, {status: 201});
	} catch (error) {
		console.error('Error creating benchmark:', error);
		return NextResponse.json(
			{error: error instanceof Error ? error.message : 'Error creating benchmark'},
			{status: 500},
		);
	}
}
