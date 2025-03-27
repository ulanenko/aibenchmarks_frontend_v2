'use server';

import {db} from '@/db';
import {benchmark, client, user} from '@/db/schema';
import {BenchmarkDTO, CreateBenchmarkDTO, UpdateBenchmarkDTO, MappingSettings} from '@/lib/benchmark/type';
import { StrategyBenchmark } from '@/lib/strategy/type';
import {eq} from 'drizzle-orm';

// Define types for the query results
type BenchmarkWithRelations = {
	benchmark: typeof benchmark.$inferSelect;
	clientName: string | null;
	userName: string | null;
};

const mapBenchmarkResult = (result: BenchmarkWithRelations): BenchmarkDTO => ({
	...result.benchmark,
	clientName: result.clientName,
	userName: result.userName,
	mappingSettings: result.benchmark.mappingSettings as MappingSettings | null,
});

export async function getAllBenchmarks(): Promise<BenchmarkDTO[]> {
	try {
		// Use a simpler query that doesn't rely on complex joins
		const benchmarks = await db
			.select({
				benchmark: benchmark,
				clientName: client.name,
				userName: user.name,
			})
			.from(benchmark)
			.leftJoin(client, eq(benchmark.clientId, client.id))
			.leftJoin(user, eq(benchmark.userId, user.id));

		return benchmarks.map(mapBenchmarkResult);
	} catch (error) {
		console.error('Error getting all benchmarks:', error);
		throw error;
	}
}

export async function getBenchmarkById(id: number): Promise<BenchmarkDTO | null> {
	try {
		const results = await db
			.select({
				benchmark: benchmark,
				clientName: client.name,
				userName: user.name,
			})
			.from(benchmark)
			.leftJoin(client, eq(benchmark.clientId, client.id))
			.leftJoin(user, eq(benchmark.userId, user.id))
			.where(eq(benchmark.id, id));

		if (results.length === 0) {
			return null;
		}

		return mapBenchmarkResult(results[0]);
	} catch (error) {
		console.error(`Error getting benchmark with ID ${id}:`, error);
		throw error;
	}
}

export async function createBenchmark(data: CreateBenchmarkDTO, userId: number): Promise<BenchmarkDTO> {
	try {
		const [result] = await db
			.insert(benchmark)
			.values({
				name: data.name,
				year: data.year,
				clientId: data.clientId,
				userId: userId,
				lang: data.lang || null,
				mappingSettings: data.mappingSettings || null,
			})
			.returning();

		return {
			...result,
			clientName: null,
			userName: null,
			mappingSettings: result.mappingSettings as MappingSettings | null,
		};
	} catch (error) {
		console.error('Error creating benchmark:', error);
		throw error;
	}
}

export async function updateBenchmark(id: number, data: UpdateBenchmarkDTO): Promise<BenchmarkDTO> {
	try {
		const [result] = await db
			.update(benchmark)
			.set({
				...(data.name !== undefined && {name: data.name}),
				...(data.year !== undefined && {year: data.year}),
				...(data.clientId !== undefined && {clientId: data.clientId}),
				...(data.lang !== undefined && {lang: data.lang}),
				...(data.mappingSettings !== undefined && {mappingSettings: data.mappingSettings}),
				updatedAt: new Date(),
			})
			.where(eq(benchmark.id, id))
			.returning();

		return {
			...result,
			clientName: null,
			userName: null,
			mappingSettings: result.mappingSettings as MappingSettings | null,
		};
	} catch (error) {
		console.error(`Error updating benchmark with ID ${id}:`, error);
		throw error;
	}
}

export async function deleteBenchmark(id: number): Promise<void> {
	try {
		await db.delete(benchmark).where(eq(benchmark.id, id));
	} catch (error) {
		console.error(`Error deleting benchmark with ID ${id}:`, error);
		throw error;
	}
}

export async function saveMappingSettings(benchmarkId: number, settings: MappingSettings): Promise<void> {
	try {
		await db
			.update(benchmark)
			.set({
				mappingSettings: settings,
				updatedAt: new Date(),
			})
			.where(eq(benchmark.id, benchmarkId));
	} catch (error) {
		console.error(`Error saving mapping settings for benchmark ${benchmarkId}:`, error);
		throw error;
	}
}

export async function loadMappingSettings(benchmarkId: number): Promise<MappingSettings | null> {
	try {
		const result = await db.query.benchmark.findFirst({
			where: eq(benchmark.id, benchmarkId),
			columns: {
				mappingSettings: true,
			},
		});

		return (result?.mappingSettings as MappingSettings) || null;
	} catch (error) {
		console.error(`Error loading mapping settings for benchmark ${benchmarkId}:`, error);
		throw error;
	}
}

/**
 * Updates the strategy for a benchmark
 * Stores the strategy data in mappingSettings.strategy
 */
export async function updateBenchmarkStrategy(benchmarkId: number, strategyData: StrategyBenchmark): Promise<BenchmarkDTO | null> {
	try {
		// Get the current benchmark
		const benchmarkResult = await getBenchmarkById(benchmarkId);
		
		if (!benchmarkResult) {
			throw new Error(`Benchmark with ID ${benchmarkId} not found`);
		}
		
		
	
		
		// Update the benchmark with the new mappingSettings
		const [result] = await db
			.update(benchmark)
			.set({
				strategy: strategyData,
				updatedAt: new Date(),
			})
			.where(eq(benchmark.id, benchmarkId))
			.returning();
			
		// Return the updated benchmark with the strategy already set
		return {
			...result,
			clientName: benchmarkResult.clientName,
			userName: benchmarkResult.userName,
		} as BenchmarkDTO;
	} catch (error) {
		console.error(`Error updating strategy for benchmark ${benchmarkId}:`, error);
		throw error;
	}
}
