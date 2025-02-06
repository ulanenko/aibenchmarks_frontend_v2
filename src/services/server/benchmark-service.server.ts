'use server';

import {db} from '@/db';
import {benchmark, BenchmarkBase, client, user} from '@/db/schema';
import {BenchmarkDTO} from '@/lib/benchmark/type';
import {eq} from 'drizzle-orm';

const benchmarkQuery = db
	.select({
		benchmark,
		clientName: client.name,
		userName: user.name,
	})
	.from(benchmark)
	.leftJoin(client, eq(benchmark.clientId, client.id))
	.leftJoin(user, eq(benchmark.userId, user.id));

interface QueryResult {
	benchmark: typeof benchmark.$inferSelect;
	clientName: string | null;
	userName: string | null;
}

const mapBenchmarkResult = (result: QueryResult): BenchmarkDTO => ({
	...result.benchmark,
	clientName: result.clientName,
	userName: result.userName,
});

export async function getAllBenchmarks(): Promise<BenchmarkDTO[]> {
	const benchmarks = await benchmarkQuery;
	return benchmarks.map(mapBenchmarkResult);
}

export async function getBenchmarkWithClient(id: number): Promise<BenchmarkDTO> {
	const result = await benchmarkQuery.where(eq(benchmark.id, id));
	if (!result[0]) throw new Error('Benchmark not found');
	return mapBenchmarkResult(result[0]);
}

export async function getBenchmarksByUser(userId: number): Promise<BenchmarkDTO[]> {
	const benchmarks = await benchmarkQuery.where(eq(benchmark.userId, userId));
	return benchmarks.map(mapBenchmarkResult);
}
