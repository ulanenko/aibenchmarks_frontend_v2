'use server';

import {createClient} from '@supabase/supabase-js';
import {revalidatePath} from 'next/cache';

// Initialize Supabase client with service role key to bypass RLS policies
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Log configuration details (without exposing the full key)
console.log('Supabase configuration:', {
	url: supabaseUrl,
	keyLength: supabaseServiceKey?.length || 0,
	keyPrefix: supabaseServiceKey?.substring(0, 10) + '...',
	keyType: supabaseServiceKey?.includes('"role":"service_role"') ? 'service_role' : 'unknown',
});

// Create client with service role key to bypass RLS policies
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

// The name of the bucket we're using - this should be created manually in the Supabase dashboard
const BUCKET_NAME = 'benchmarks';

/**
 * Uploads a file to Supabase storage
 * @param benchmarkId - The ID of the benchmark
 * @param fileBuffer - The file buffer to upload
 * @param fileName - The name to save the file as
 * @param contentType - The content type of the file
 * @returns The path to the uploaded file
 */
export async function uploadBenchmarkFile(
	benchmarkId: number,
	fileBuffer: Buffer,
	fileName: string,
	contentType: string,
): Promise<{path: string; error: string | null}> {
	try {
		console.log('Starting file upload to Supabase:', {
			benchmarkId,
			fileName,
			contentType,
			bufferSize: fileBuffer.length,
			bucket: BUCKET_NAME,
		});

		// Define the storage path - include benchmark ID in the path
		const storagePath = `files/${benchmarkId}/${fileName}`;
		console.log('Storage path:', storagePath);

		// First check if the bucket exists
		try {
			const {data: bucket, error: bucketError} = await supabase.storage.getBucket(BUCKET_NAME);

			if (bucketError) {
				console.log('Bucket not found, attempting to create it...');

				// Try to create the bucket
				const {data: newBucket, error: createError} = await supabase.storage.createBucket(BUCKET_NAME, {
					public: true,
				});

				if (createError) {
					console.error('Error creating bucket:', createError);
					return {path: '', error: `Failed to create bucket: ${createError.message}`};
				}

				console.log('Successfully created bucket:', newBucket);
			} else {
				console.log('Found existing bucket:', bucket);
			}
		} catch (bucketError) {
			console.error('Error checking bucket:', bucketError);
		}

		// Upload the file to the benchmarks bucket
		const {data, error} = await supabase.storage.from(BUCKET_NAME).upload(storagePath, fileBuffer, {
			contentType,
			upsert: true, // Overwrite if file exists
		});

		if (error) {
			console.error('Error uploading file to Supabase:', error);
			return {path: '', error: error.message};
		}

		console.log('File uploaded successfully:', data);

		// Get the public URL for the file
		const {data: urlData} = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
		console.log('File public URL:', urlData?.publicUrl);

		// Revalidate the benchmark page
		revalidatePath(`/benchmarks/${benchmarkId}`);

		return {
			path: fileName,
			error: null,
		};
	} catch (error) {
		console.error('Error in uploadBenchmarkFile:', error);
		return {
			path: '',
			error: error instanceof Error ? error.message : 'Unknown error occurred during file upload',
		};
	}
}
