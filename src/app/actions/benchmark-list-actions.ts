'use server';

import {BenchmarkDTO, CreateBenchmarkDTO, UpdateBenchmarkDTO, MappingSettings} from '@/lib/benchmark/type';
import {revalidatePath} from 'next/cache';
import * as benchmarkService from '@/services/server/benchmark-service.server';

/**
 * Server action to get all benchmarks safely
 */
export async function getAllBenchmarks(): Promise<{
	benchmarks: BenchmarkDTO[];
	error: string | null;
}> {
	try {
		const benchmarks = await benchmarkService.getAllBenchmarks();
		return {benchmarks, error: null};
	} catch (error) {
		console.error('Error getting all benchmarks:', error);
		return {
			benchmarks: [],
			error: error instanceof Error ? error.message : 'Failed to get benchmarks',
		};
	}
}

/**
 * Server action to create a new benchmark safely
 */
export async function createBenchmark(data: CreateBenchmarkDTO): Promise<{
	benchmark: BenchmarkDTO | null;
	error: string | null;
}> {
	try {
		// Get the current user ID (in a real app, this would come from auth)
		const userId = 1; // Placeholder - replace with actual user ID from auth

		const benchmark = await benchmarkService.createBenchmark(data, userId);

		revalidatePath('/benchmarks');

		return {benchmark, error: null};
	} catch (error) {
		console.error('Error creating benchmark:', error);
		return {
			benchmark: null,
			error: error instanceof Error ? error.message : 'Failed to create benchmark',
		};
	}
}


/**
 * Server action to delete a benchmark safely
 */
export async function deleteBenchmark(id: number): Promise<{
	success: boolean;
	error: string | null;
}> {
	try {
		await benchmarkService.deleteBenchmark(id);

		revalidatePath('/benchmarks');

		return {success: true, error: null};
	} catch (error) {
		console.error(`Error deleting benchmark with ID ${id}:`, error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to delete benchmark',
		};
	}
}
