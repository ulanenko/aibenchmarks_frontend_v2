'use server';

import {db} from '@/db';
import {benchmark, client, user} from '@/db/schema';
import {BenchmarkDTO, CreateBenchmarkDTO, UpdateBenchmarkDTO} from '@/lib/benchmark/type';
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

export async function getBenchmarkWithClient(id: number): Promise<BenchmarkDTO | null> {
	const result = await benchmarkQuery.where(eq(benchmark.id, id));
	if (!result[0]) return null;
	return mapBenchmarkResult(result[0]);
}

export async function getBenchmarksByUser(userId: number): Promise<BenchmarkDTO[]> {
	const benchmarks = await benchmarkQuery.where(eq(benchmark.userId, userId));
	return benchmarks.map(mapBenchmarkResult);
}

export async function updateBenchmark(id: number, data: UpdateBenchmarkDTO): Promise<BenchmarkDTO | null> {
	const [updatedBenchmark] = await db
		.update(benchmark)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(benchmark.id, id))
		.returning();

	if (!updatedBenchmark) {
		return null;
	}

	return getBenchmarkWithClient(id);
}

export async function deleteBenchmark(id: number): Promise<BenchmarkDTO | null> {
	const [deletedBenchmark] = await db.delete(benchmark).where(eq(benchmark.id, id)).returning();

	if (!deletedBenchmark) return null;

	return getBenchmarkWithClient(id);
}

export async function createBenchmark(data: CreateBenchmarkDTO, userId: number): Promise<BenchmarkDTO | null> {
	const [newBenchmark] = await db
		.insert(benchmark)
		.values({
			...data,
			userId,
		})
		.returning();

	if (!newBenchmark) {
		return null;
	}

	return getBenchmarkWithClient(newBenchmark.id);
}
