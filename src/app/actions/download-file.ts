'use server';

import {createClient} from '@supabase/supabase-js';
import { getBenchmarkById } from './benchmark-actions';

// Initialize Supabase client with service role key to bypass RLS policies
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

// The name of the bucket we're using
const BUCKET_NAME = 'benchmarks';

/**
 * Server action to download a file from Supabase storage
 * @param benchmarkId - The ID of the benchmark
 * @param fileName - The name of the file to download
 * @returns The file data as an ArrayBuffer and metadata
 */
export async function downloadFileFromStorage(
	benchmarkId: number,
	fileName: string,
): Promise<{
	data: ArrayBuffer | null;
	fileName: string;
	contentType: string;
	error: string | null;
}> {
	try {
		// First, verify the user has access to this benchmark
		// In a real app, you would check the user's session and permissions
		const {benchmark, error: benchmarkError} = await getBenchmarkById(benchmarkId);

		if (benchmarkError || !benchmark) {
			console.error('Error verifying benchmark access:', benchmarkError);
			return {
				data: null,
				fileName: '',
				contentType: '',
				error: benchmarkError || 'Benchmark not found or access denied',
			};
		}

		// Verify that the file is associated with this benchmark by checking mappingSettings
		if (benchmark.mappingSettings?.pathToFile) {
			const storedFileName = benchmark.mappingSettings.pathToFile;
			const requestedFileName = fileName;

			// If the stored filename doesn't match the requested filename, deny access
			// This is a simple check - in a real app, you might want more sophisticated validation
			if (
				storedFileName !== requestedFileName &&
				!requestedFileName.includes(benchmark.mappingSettings.sourceFileName)
			) {
				console.error('File access denied: Requested file does not match benchmark file');
				return {
					data: null,
					fileName: '',
					contentType: '',
					error: 'Access denied: The requested file is not associated with this benchmark',
				};
			}
		}

		// Construct the file path based on the benchmark ID and filename
		const filePath = `files/${benchmarkId}/${fileName}`;

		console.log('Downloading file from Supabase:', filePath);

		// Get the file from Supabase storage
		const {data, error} = await supabase.storage.from(BUCKET_NAME).download(filePath);

		if (error) {
			console.error('Error downloading file from Supabase:', error);
			return {
				data: null,
				fileName: '',
				contentType: '',
				error: error.message,
			};
		}

		if (!data) {
			return {
				data: null,
				fileName: '',
				contentType: '',
				error: 'No file data returned',
			};
		}

		// Convert the blob to an ArrayBuffer
		const arrayBuffer = await data.arrayBuffer();

		return {
			data: arrayBuffer,
			fileName,
			contentType: data.type,
			error: null,
		};
	} catch (error) {
		console.error('Error in downloadFileFromStorage:', error);
		return {
			data: null,
			fileName: '',
			contentType: '',
			error: error instanceof Error ? error.message : 'Unknown error occurred during file download',
		};
	}
}
