import {SUPPORT_SERVICES_CONFIG} from '@/config/env';
import { AIMapperResults, MapperInput } from './types';

/**
 * Calls the AI Mapper API to map source columns to target columns
 * @param input The input data for the AI mapper
 * @returns The mapping results or null if the API call fails
 */
export async function aiMapper(input: MapperInput): Promise<AIMapperResults | null> {
	const apiUrl = `${SUPPORT_SERVICES_CONFIG.URL}/ai-mapper-source-to-target`;
	
	try {
		// Check if the auth token is configured
		if (!SUPPORT_SERVICES_CONFIG.AUTH_TOKEN) {
			console.error('AI Mapper: Auth token not configured');
			return null;
		}

		// Sanitize input to ensure all sample values are strings
		const sanitizedInput = {
			...input,
			sourceColumns: input.sourceColumns.map((col) => ({
				...col,
				samples: col.samples?.map(String),
			})),
		};

		console.log(`AI Mapper: Calling API at ${apiUrl}`);

		// Make the API call
		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: SUPPORT_SERVICES_CONFIG.AUTH_TOKEN,
			},
			body: JSON.stringify(sanitizedInput),
		});

		// Check if the response is ok
		if (!response.ok) {
			const errorText = await response.text();
			console.error(`AI Mapper: API call failed with status ${response.status}:`, errorText);
			return null;
		}

		// Parse and return the response
		const result = await response.json();
		console.log('AI Mapper: API call successful');
		return result;
	} catch (error) {
		console.error(`AI Mapper: Error calling API at ${apiUrl}:`, error);
		return null;
	}
}
