'use server';

import { UpdateBenchmarkDTO, BenchmarkDTO, MappingSettings } from "@/lib/benchmark/type";
import { StrategyBenchmark } from "@/lib/strategy/type";
import { revalidatePath } from "next/cache";
import * as benchmarkService from "@/services/server/benchmark-service.server";



/**
 * Server action to get a benchmark by ID safely
 */
export async function getBenchmarkById(id: number): Promise<{
	benchmark: BenchmarkDTO | null;
	error: string | null;
}> {
	try {
		const benchmark = await benchmarkService.getBenchmarkById(id);
		return {benchmark, error: null};
	} catch (error) {
		console.error(`Error getting benchmark with ID ${id}:`, error);
		return {
			benchmark: null,
			error: error instanceof Error ? error.message : 'Failed to get benchmark',
		};
	}
}


/**
 * Server action to update a benchmark safely
 */
export async function updateBenchmark(data: UpdateBenchmarkDTO): Promise<{
	benchmark: BenchmarkDTO | null;
	error: string | null;
}> {
	try {
		const benchmark = await benchmarkService.updateBenchmark(data.id, data);

		revalidatePath('/benchmarks');
		revalidatePath(`/benchmarks/${data.id}`);

		return {benchmark, error: null};
	} catch (error) {
		console.error(`Error updating benchmark with ID ${data.id}:`, error);
		return {
			benchmark: null,
			error: error instanceof Error ? error.message : 'Failed to update benchmark',
		};
	}
}


/**
 * Server action to load mapping settings for a benchmark
 * Also downloads the associated file if available
 */
export async function loadMappingSettings(benchmarkId: number): Promise<{
	settings: MappingSettings | null;
	fileData?: {
		data: ArrayBuffer | null;
		fileName: string;
		contentType: string;
	} | null;
	error: string | null;
}> {
	try {
		// Load the mapping settings
		const settings = await benchmarkService.loadMappingSettings(benchmarkId);

		// If no settings or no file path, return early with just the settings
		if (!settings || !settings.pathToFile) {
			return {
				settings,
				error: null,
			};
		}

		// Import the download function
		const {downloadFileFromStorage} = await import('./download-file');

		// Download the file if pathToFile exists
		const fileResult = await downloadFileFromStorage(benchmarkId, settings.pathToFile);

		if (fileResult.error || !fileResult.data) {
			return {
				settings,
				fileData: null,
				error: `File download failed: ${fileResult.error || 'No data returned'}`,
			};
		}

		return {
			settings,
			fileData: {
				data: fileResult.data,
				fileName: fileResult.fileName,
				contentType: fileResult.contentType,
			},
			error: null,
		};
	} catch (error) {
		console.error(`Error loading mapping settings for benchmark ${benchmarkId}:`, error);
		return {
			settings: null,
			fileData: null,
			error: error instanceof Error ? error.message : 'Failed to load mapping settings',
		};
	}
}

/**
 * Server action to save mapping settings for a benchmark
 */
export async function saveMappingSettings(
	benchmarkId: number,
	settings: MappingSettings,
): Promise<{success: boolean; error: string | null}> {
	try {
		await benchmarkService.saveMappingSettings(benchmarkId, settings);

		revalidatePath(`/benchmarks/${benchmarkId}`);

		return {success: true, error: null};
	} catch (error) {
		console.error(`Error saving mapping settings for benchmark ${benchmarkId}:`, error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to save mapping settings',
		};
	}
}

/**
 * Server action to update the strategy for a benchmark
 */
export async function updateStrategyBenchmark(
	benchmarkId: number,
	strategyData: StrategyBenchmark,
): Promise<{
	benchmark: BenchmarkDTO | null;
	error: string | null;
}> {
	try {
		const benchmark = await benchmarkService.updateBenchmarkStrategy(benchmarkId, strategyData);

		revalidatePath('/benchmarks');
		revalidatePath(`/benchmarks/${benchmarkId}`);

		return {benchmark, error: null};
	} catch (error) {
		console.error(`Error updating strategy for benchmark ${benchmarkId}:`, error);
		return {
			benchmark: null,
			error: error instanceof Error ? error.message : 'Failed to update benchmark strategy',
		};
	}
}
