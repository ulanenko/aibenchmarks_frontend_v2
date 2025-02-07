import {NextRequest, NextResponse} from 'next/server';
import type {BenchmarkDTO} from '@/lib/benchmark/type';
import * as benchmarkService from '@/services/server/benchmark-service.server';

type RouteParams = {id: string};
type RouteContext = {params: Promise<RouteParams>};

export async function PUT(
	request: NextRequest,
	context: RouteContext,
): Promise<NextResponse<{error: string} | {benchmark: BenchmarkDTO}>> {
	try {
		const params = await context.params;
		const id = Number(params.id);
		const data = await request.json();

		if (!data.name) {
			return NextResponse.json({error: 'Name is required'}, {status: 400});
		}

		if (!data.year) {
			return NextResponse.json({error: 'Year is required'}, {status: 400});
		}

		const updatedBenchmark = await benchmarkService.updateBenchmark(id, data);

		if (!updatedBenchmark) {
			return NextResponse.json({error: 'Benchmark not found'}, {status: 404});
		}

		return NextResponse.json({benchmark: updatedBenchmark}, {status: 200});
	} catch (error) {
		console.error('Error updating benchmark:', error);
		return NextResponse.json(
			{error: error instanceof Error ? error.message : 'Error updating benchmark'},
			{status: 500},
		);
	}
}

export async function DELETE(
	request: NextRequest,
	context: RouteContext,
): Promise<NextResponse<{error: string} | {benchmark: BenchmarkDTO}>> {
	try {
		const params = await context.params;
		const id = Number(params.id);

		const deletedBenchmark = await benchmarkService.deleteBenchmark(id);

		if (!deletedBenchmark) {
			return NextResponse.json({error: 'Benchmark not found'}, {status: 404});
		}

		return NextResponse.json({benchmark: deletedBenchmark}, {status: 200});
	} catch (error) {
		console.error('Error deleting benchmark:', error);
		return NextResponse.json(
			{error: error instanceof Error ? error.message : 'Error deleting benchmark'},
			{status: 500},
		);
	}
}
