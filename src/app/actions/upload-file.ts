'use server';

import {uploadBenchmarkFile as uploadFileToStorage} from '@/services/server/storage-service.server';
import {revalidatePath} from 'next/cache';

/**
 * Server action to upload a file to Supabase storage
 * @param benchmarkId - The ID of the benchmark
 * @param file - The file to upload
 * @param fileName - The name to save the file as
 * @returns The path to the uploaded file
 */
export async function uploadBenchmarkFile(
	benchmarkId: number,
	file: File,
	fileName: string,
): Promise<{path: string; error: string | null}> {
	try {
		// Convert the file to a buffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Call the storage service to upload the file
		const result = await uploadFileToStorage(benchmarkId, buffer, fileName, file.type);

		// Revalidate the benchmark page
		revalidatePath(`/benchmarks/${benchmarkId}`);

		return result;
	} catch (error) {
		console.error('Error in uploadBenchmarkFile server action:', error);
		return {
			path: '',
			error: error instanceof Error ? error.message : 'Unknown error occurred during file upload',
		};
	}
}
